# Stripe test-mode checkout — local testing guide

This project sells prints through **Stripe Checkout (test mode only)**.
Everything below uses fake money — never add a live (`sk_live_`) key.

## 1. One-time setup

```bash
# 1. Apply the migration (adds Order, OrderItem, Work.priceCents)
npm run db:deploy          # or: npx prisma migrate dev

# 2. Fill .env with your TEST-mode values (see .env.example)
#    STRIPE_SECRET_KEY=sk_test_…            (Dashboard → Developers → API keys)
#    STRIPE_WEBHOOK_SECRET=whsec_…          (from the stripe listen output, step 4)
#    NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 3. Stripe CLI (already installed in ~/.local/bin for this machine;
#    on other machines: https://docs.stripe.com/stripe-cli — once).
#    Authenticate either way:
stripe login               # opens the browser, one time per machine
#    …or skip the browser by exporting the same test key the app uses:
#    export STRIPE_API_KEY=sk_test_…   (from .env)

# 4. In a second terminal: forward Stripe events to the local app.
#    (CLI ≥ 1.55 requires the --events flags — plain --listen errors out.)
stripe listen --forward-to localhost:3000/api/webhooks/stripe \
  --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed
#    → copy the whsec_… it prints into STRIPE_WEBHOOK_SECRET in .env,
#    then restart `npm run dev` (dev usually reloads .env automatically).
#    The whsec must come from the SAME `stripe listen` run that is
#    currently running — every run prints a new secret.
```

> **Important:** if `STRIPE_WEBHOOK_SECRET` doesn't match the running
> `stripe listen`, or no listener is running, payments stay `PENDING`
> forever — the success page keeps showing "Confirming your payment…"
> even though Stripe charged the test card. Stripe's dashboard shows
> the charge as "Succeeded", but only the verified webhook may mark an
order `PAID` in this app.

### Recover payments completed while the listener was down

Stripe never redelivers events to listeners that didn't exist yet.
To catch up orders that are stuck `PENDING` after a real test payment:

```bash
node scripts/redeliver-events.mjs
```

Fetches the authentic `checkout.session.completed` events from the
Stripe API and forwards them to the local webhook route, signed with
`STRIPE_WEBHOOK_SECRET` — the app runs its full verification as usual.

### Re-verify without sending webhook events

```bash
SKIP_WEBHOOK=1 npm run verify:checkout   # dev server must be running
```

Exercises auth, pricing, order lookup, and the success/cancel pages while
leaving orders `PENDING` (no signed webhook events are sent).

## 2. Walk through a purchase

1. Sign in (an account is required for checkout — the server enforces it).
2. On the home gallery, press **Buy print** on a priced photograph.
3. Stripe-hosted Checkout opens — pay with:
   - Card: `4242 4242 4242 4242`
   - Expiry: any future date · CVC: any 3 digits · ZIP: any value
4. You return to `/checkout/success?order=…`:
   - while the webhook is in flight the page shows **Confirming your payment…**
     and polls `GET /api/orders/<id>` (max 6 times, every 2.5 s);
   - after the webhook verifies the event it shows **Payment confirmed**.
5. Confirm in the database (or `npx prisma studio`): the order moved
   `PENDING → PAID`, `paidAt` set, items carry price/title snapshots.

Cancel path: pressing back on the Stripe page returns to
`/checkout/cancel` — no status change, nothing charged.

## 3. What is verified where

| Check | Where |
| --- | --- |
| Amount/currency/id matching, PAID gating | `src/lib/payments.js` + `tests/payments.test.js` |
| Integer-cents money math | `src/lib/money.js` + `tests/money.test.js` |
| Full HTTP flow (auth, prices, webhook HMAC, pages) | `npm run verify:checkout` (needs dev server running with `STRIPE_WEBHOOK_SECRET` set) |

## 4. Security invariants (don't weaken these)

- Only `POST /api/webhooks/stripe` ever writes `status = PAID`.
- The browser never supplies a price — the server reads `Work.priceCents`.
- Order reads are scoped to the signed-in owner; foreign/unknown ids 404.
- Stripe keys live only in server env vars; logs are scrubbed of key material.

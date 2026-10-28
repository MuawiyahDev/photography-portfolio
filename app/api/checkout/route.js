// POST /api/checkout — start a Stripe Checkout session (signed-in only).
//
// Security model:
//   * the browser sends ONLY { slug, quantity, requestId } — never a
//     price. The price comes from the Work row in PostgreSQL;
//   * the PENDING order + items are written transactionally BEFORE the
//     Stripe session exists, so a paid session always maps to an order;
//   * nothing here ever sets status=PAID — only the verified webhook
//     (app/api/webhooks/stripe) may do that.
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma.js";
import { getStripe, redactSecrets, siteUrl } from "@/lib/stripe.js";
import {
  attachCheckoutSession,
  createPendingOrder,
} from "@/lib/orders.js";
import { checkoutSchema, fieldErrors } from "@/lib/validation.js";

export async function POST(request) {
  // Server-side session check — the hidden buy button is not auth.
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "You must be signed in to buy a print." },
      { status: 401 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input.", fields: fieldErrors(parsed.error) },
      { status: 400 },
    );
  }
  const { slug, quantity, requestId } = parsed.data;

  // Trusted catalogue lookup — the ONLY source of truth for pricing.
  const work = await prisma.work.findUnique({ where: { slug } });
  if (!work) {
    return NextResponse.json(
      { error: "That photograph could not be found." },
      { status: 404 },
    );
  }
  if (!Number.isInteger(work.priceCents) || work.priceCents <= 0) {
    // null price = not for sale (or a broken price — refuse either way).
    return NextResponse.json(
      { error: "This photograph is not available for purchase." },
      { status: 409 },
    );
  }

  let stripe;
  try {
    stripe = getStripe(); // validates STRIPE_SECRET_KEY, never exposes it
  } catch (error) {
    console.error("POST /api/checkout config error:", error.message);
    return NextResponse.json(
      { error: "Checkout is not configured on this server yet." },
      { status: 503 },
    );
  }

  // PENDING order + snapshot items in one transaction (dedupes repeats
  // that carry the same requestId).
  let order;
  let reused;
  try {
    ({ order, reused } = await createPendingOrder({
      userId: session.user.id,
      requestId,
      work,
      quantity,
    }));
  } catch (error) {
    console.error("POST /api/checkout order creation failed:", error);
    return NextResponse.json(
      { error: "Could not start your order." },
      { status: 500 },
    );
  }

  // A retry of an attempt that already has a session: hand back the
  // same session instead of creating a second one.
  if (reused && order.stripeCheckoutSessionId) {
    try {
      const existing = await stripe.checkout.sessions.retrieve(
        order.stripeCheckoutSessionId,
      );
      if (existing.status === "open" && existing.url) {
        return NextResponse.json({ url: existing.url, orderId: order.id });
      }
      // Expired session → fall through and mint a fresh one below.
    } catch (error) {
      console.warn(
        "POST /api/checkout could not reuse session:",
        error?.message,
      );
      // fall through — a new session for the same PENDING order is safe
    }
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        client_reference_id: order.id,
        metadata: { orderId: order.id },
        line_items: [
          {
            quantity,
            price_data: {
              currency: work.currency.toLowerCase(),
              unit_amount: work.priceCents, // integer cents, from the DB
              product_data: {
                name: work.title,
                description: "Signed fine-art print",
                images: [work.src].filter(Boolean),
              },
            },
          },
        ],
        // Only Stripe-hosted pages — we never handle card data.
        success_url: `${siteUrl()}/checkout/success?order=${order.id}`,
        cancel_url: `${siteUrl()}/checkout/cancel?order=${order.id}`,
      },
      // Duplicate submissions for the same order reuse the same session.
      { idempotencyKey: `checkout-session-${order.id}` },
    );

    await attachCheckoutSession(order.id, checkoutSession.id);

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 502 },
      );
    }
    return NextResponse.json({ url: checkoutSession.url, orderId: order.id });
  } catch (error) {
    // Stripe API errors (card errors don't occur here, but network/
    // parameter errors do) — log the code, never the key.
    const stripeCode = error?.code ?? error?.type ?? "unknown";
    console.error(
      `POST /api/checkout Stripe error (${stripeCode}):`,
      redactSecrets(error?.message),
    );
    return NextResponse.json(
      { error: "Could not start checkout with Stripe. Please try again." },
      { status: 502 },
    );
  }
}

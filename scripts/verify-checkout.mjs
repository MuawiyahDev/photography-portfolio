// One-off LOCAL verification of the Stripe flow (no real Stripe keys):
// signs webhook payloads with the same HMAC scheme Stripe uses and
// exercises checkout validation, order lookup, webhook verification,
// idempotency, and the success/cancel pages against a running dev
// server. Run: node scripts/verify-checkout.mjs
// Usage: STRIPE_WEBHOOK_SECRET=whsec_test_local node scripts/verify-checkout.mjs
import { createHmac, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "whsec_test_local";
// SKIP_WEBHOOK=1: exercise pages/APIs without sending signed webhook
// events (useful against a server whose STRIPE_WEBHOOK_SECRET isn't
// set yet — the order simply stays PENDING).
const SKIP_WEBHOOK = Boolean(process.env.SKIP_WEBHOOK);

const prisma = new PrismaClient();
let passed = 0;
let failed = 0;
let testOrderId = null;

function check(name, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function sign(payload, secret = WEBHOOK_SECRET, ts = Math.floor(Date.now() / 1000)) {
  const mac = createHmac("sha256", secret).update(`${ts}.${payload}`).digest("hex");
  return `t=${ts},v1=${mac}`;
}

async function postWebhook(event, header) {
  const payload = JSON.stringify(event);
  return fetch(`${BASE}/api/webhooks/stripe`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "stripe-signature": header ?? sign(payload),
    },
    body: payload,
  });
}

// --- login: NextAuth credentials flow, cookie jar -----------------------
async function login() {
  const jar = new Map();
  const capture = (res) => {
    for (const raw of res.headers.getSetCookie?.() ?? []) {
      const [pair] = raw.split(";");
      const idx = pair.indexOf("=");
      jar.set(pair.slice(0, idx).trim(), pair.slice(idx + 1));
    }
  };
  const cookieHeader = () => [...jar].map(([k, v]) => `${k}=${v}`).join("; ");

  const csrf = await fetch(`${BASE}/api/auth/csrf`);
  capture(csrf);
  const { csrfToken } = await csrf.json();

  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    redirect: "manual",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      cookie: cookieHeader(),
    },
    body: new URLSearchParams({ csrfToken, ...readAdminCredentials() }),
  });
  capture(res);
  return cookieHeader();
}

function readAdminCredentials() {
  const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
  const pick = (key) => env.match(new RegExp(`^${key}="?([^"\n]*)"`, "m"))?.[1] ?? "";
  return { email: pick("ADMIN_EMAIL"), password: pick("ADMIN_PASSWORD") };
}

// --- the run ------------------------------------------------------------
async function main() {
  const cookie = await login();

  console.log("\n1) Gallery renders prices + Buy print buttons");
  const home = await fetch(`${BASE}/`);
  const html = await home.text();
  check("gallery shows a price", html.includes("$55.00"));
  check("gallery shows Buy print", html.includes("Buy print"));

  console.log("\n2) Checkout endpoint");
  const unauth = await fetch(`${BASE}/api/checkout`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ slug: "theo-daylight", quantity: 1 }),
  });
  check("unauthenticated → 401", unauth.status === 401, `got ${unauth.status}`);

  const probeRequestId = `verify-${randomUUID()}`;
  const tampered = await fetch(`${BASE}/api/checkout`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie },
    // price + totals from the browser are IGNORED (and quantity 99 is
    // rejected outright); the requestId marks this probe's own order so
    // the script can never touch orders from real testing.
    body: JSON.stringify({
      slug: "theo-daylight",
      quantity: 2,
      priceCents: 100,
      totalCents: 100,
      requestId: probeRequestId,
    }),
  });
  // No real Stripe key is configured here: order creation succeeds,
  // then the session call fails → 502, never a paid order.
  // With a real key: 200 + a Stripe URL (still never PAID here).
  check(
    "tampered price doesn't 500 / doesn't trust browser",
    [200, 502].includes(tampered.status),
    `got ${tampered.status}`,
  );

  const badQty = await fetch(`${BASE}/api/checkout`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({ slug: "theo-daylight", quantity: 99 }),
  });
  check("quantity 99 → 400", badQty.status === 400, `got ${badQty.status}`);

  const noPrice = await fetch(`${BASE}/api/checkout`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({ slug: "camera", quantity: 1 }),
  });
  check("work without price → 409", noPrice.status === 409, `got ${noPrice.status}`);

  const ghost = await fetch(`${BASE}/api/checkout`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({ slug: "does-not-exist", quantity: 1 }),
  });
  check("unknown work → 404", ghost.status === 404, `got ${ghost.status}`);

  // The order THIS script's tampered-price probe created (server-priced!).
  const order = await prisma.order.findUnique({
    where: { requestId: probeRequestId },
    include: { items: true },
  });
  check("PENDING order created server-side", Boolean(order));
  check(
    "order total used the DB price × qty (11000), not the browser's 100",
    order?.totalCents === 11000,
    `total=${order?.totalCents}`,
  );
  check(
    "price/title snapshot stored",
    order?.items?.[0]?.unitPriceCents === 5500 &&
      order?.items?.[0]?.workTitle === "Theo, in daylight",
  );
  if (!order) throw new Error("no PENDING order to continue with");
  testOrderId = order.id;

  console.log("\n3) Order lookup endpoint");
  const lookup = await fetch(`${BASE}/api/orders/${order.id}`, { headers: { cookie } });
  check("owner can read order → 200", lookup.status === 200, `got ${lookup.status}`);
  const lookupBody = await lookup.json();
  check("status is PENDING before webhook", lookupBody.status === "PENDING");
  check("summary exposes no Stripe ids", !JSON.stringify(lookupBody).includes("cs_"));

  const noSession = await fetch(`${BASE}/api/orders/${order.id}`);
  check("no session → 401", noSession.status === 401, `got ${noSession.status}`);

  const badId = await fetch(`${BASE}/api/orders/bad!id`, { headers: { cookie } });
  check("malformed id → 400", badId.status === 400, `got ${badId.status}`);

  const missing = await fetch(`${BASE}/api/orders/cmbxxxxxxxxxxxxxxxxxxxxxxx`, {
    headers: { cookie },
  });
  check("well-formed unknown id → 404", missing.status === 404, `got ${missing.status}`);

  // While still PENDING the success page must show a processing state,
  // NOT a paid confirmation (the redirect itself proves nothing).
  const pendingPage = await fetch(`${BASE}/checkout/success?order=${order.id}`, {
    headers: { cookie },
  });
  const pendingHtml = await pendingPage.text();
  check("success page renders for PENDING order", pendingPage.status === 200);
  check(
    "PENDING order shows processing, not paid",
    pendingHtml.includes("Confirming your payment") &&
      !pendingHtml.includes("Payment confirmed"),
  );

  console.log("\n4) Webhook");
  if (SKIP_WEBHOOK) {
    console.log("  (skipped — SKIP_WEBHOOK=1)");
  } else {
  const noSig = await fetch(`${BASE}/api/webhooks/stripe`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  check("missing signature → 400", noSig.status === 400, `got ${noSig.status}`);

  const bogus = await postWebhook(
    { id: "evt_x", type: "checkout.session.completed", data: { object: {} } },
    "t=1,v1=deadbeef",
  );
  check("invalid signature → 400", bogus.status === 400, `got ${bogus.status}`);

  const sessionFor = (over = {}) => ({
    id: "cs_test_verify",
    mode: "payment",
    payment_status: "paid",
    amount_total: order.totalCents,
    currency: order.currency.toLowerCase(),
    payment_intent: "pi_test_verify",
    created: Math.floor(Date.now() / 1000),
    metadata: { orderId: order.id },
    ...over,
  });

  const unknown = await postWebhook({
    id: "evt_1",
    type: "checkout.session.completed",
    data: { object: sessionFor({ metadata: { orderId: "ord_does_not_exist" } }) },
  });
  check("valid signature, unknown order → 200 (no retry storm)", unknown.status === 200);

  const unpaid = await postWebhook({
    id: "evt_2",
    type: "checkout.session.completed",
    data: { object: sessionFor({ payment_status: "unpaid" }) },
  });
  check("delayed payment (unpaid) → 200, waits for async event", unpaid.status === 200);

  const wrongAmount = await postWebhook({
    id: "evt_3",
    type: "checkout.session.completed",
    data: { object: sessionFor({ amount_total: 100 }) },
  });
  check("amount mismatch → 400", wrongAmount.status === 400, `got ${wrongAmount.status}`);
  const afterMismatch = await prisma.order.findUnique({ where: { id: order.id } });
  check("mismatch left order PENDING", afterMismatch.status === "PENDING");

  const wrongCurrency = await postWebhook({
    id: "evt_4",
    type: "checkout.session.completed",
    data: { object: sessionFor({ currency: "eur" }) },
  });
  check("currency mismatch → 400", wrongCurrency.status === 400, `got ${wrongCurrency.status}`);

  const goodEvent = {
    id: "evt_5",
    type: "checkout.session.completed",
    data: { object: sessionFor() },
  };
  const paid = await postWebhook(goodEvent);
  check("verified event → 200", paid.status === 200, `got ${paid.status}`);
  const afterPaid = await prisma.order.findUnique({ where: { id: order.id } });
  check("order is PAID", afterPaid.status === "PAID");
  check("paidAt set", Boolean(afterPaid.paidAt));
  check("payment intent stored", afterPaid.stripePaymentIntentId === "pi_test_verify");

  const dup = await postWebhook({ ...goodEvent, id: "evt_5_redelivery" });
  check("duplicate delivery → 200", dup.status === 200, `got ${dup.status}`);
  const afterDup = await prisma.order.findUnique({ where: { id: order.id } });
  check(
    "duplicate did not change paidAt (idempotent)",
    afterDup.paidAt?.getTime() === afterPaid.paidAt?.getTime(),
  );

  const lateFail = await postWebhook({
    id: "evt_6",
    type: "checkout.session.async_payment_failed",
    data: { object: sessionFor() },
  });
  check("late async failure → 200 but PAID is not downgraded", lateFail.status === 200);
  const stillPaid = await prisma.order.findUnique({ where: { id: order.id } });
  check("order still PAID", stillPaid.status === "PAID");
  }

  console.log("\n5) Pages");
  const success = await fetch(`${BASE}/checkout/success?order=${order.id}`, {
    headers: { cookie },
  });
  const successHtml = await success.text();
  check("success page renders", success.status === 200, `got ${success.status}`);
  if (SKIP_WEBHOOK) {
    check(
      "success page shows processing (no webhook sent)",
      successHtml.includes("Confirming your payment") &&
        !successHtml.includes("Payment confirmed"),
    );
  } else {
    check(
      "shows PAID confirmation from DB state",
      successHtml.includes("Payment confirmed") && successHtml.includes("PAID"),
    );
  }

  const successNoSession = await fetch(
    `${BASE}/checkout/success?order=${order.id}`,
    { redirect: "manual" },
  );
  check(
    "success page without session → redirect to login",
    [307, 302].includes(successNoSession.status),
    `got ${successNoSession.status}`,
  );

  const bogusSuccess = await fetch(`${BASE}/checkout/success?order=not_an_id!`, {
    headers: { cookie },
    redirect: "manual",
  });
  check("success page invalid order → 404", bogusSuccess.status === 404, `got ${bogusSuccess.status}`);

  const cancel = await fetch(`${BASE}/checkout/cancel?order=${order.id}`, {
    headers: { cookie },
  });
  const cancelHtml = await cancel.text();
  check("cancel page renders", cancel.status === 200, `got ${cancel.status}`);
  check("cancel page says cancelled", cancelHtml.includes("Checkout cancelled"));
  const afterCancelVisit = await prisma.order.findUnique({ where: { id: order.id } });
  check(
    "visiting cancel page never changes status",
    afterCancelVisit.status === (SKIP_WEBHOOK ? "PENDING" : "PAID"),
  );

  console.log(`\nRESULT: ${passed} passed, ${failed} failed`);
}

main()
  .catch((error) => {
    console.error("Verification crashed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    // Remove only the order this script's checkout probe created.
    if (testOrderId) {
      await prisma.order.deleteMany({ where: { id: testOrderId } });
    }
    await prisma.$disconnect();
  });

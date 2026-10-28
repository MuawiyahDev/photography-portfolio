// Redeliver REAL Stripe events to the local webhook endpoint.
//
// Purpose: recover orders that are stuck PENDING because a payment
// completed while `stripe listen` wasn't running (Stripe does not
// redeliver events to listeners that didn't exist yet).
//
// It fetches authentic `checkout.session.completed` /
// `checkout.session.async_payment_succeeded` events from the Stripe
// API and forwards them to the app over the normal webhook route,
// signed with STRIPE_WEBHOOK_SECRET — so the app performs its usual
// signature + amount + currency verification. Nothing bypasses the
// webhook; fabricated events are impossible (payloads come from Stripe).
//
// Usage:  node scripts/redeliver-events.mjs
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

function readEnv(name) {
  const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
  const match = env.match(new RegExp(`^${name}="?([^"\n]*)"`, "m"));
  return match?.[1] ?? "";
}

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const stripeKey = readEnv("STRIPE_SECRET_KEY");
const webhookSecret = readEnv("STRIPE_WEBHOOK_SECRET");

if (!stripeKey || !webhookSecret) {
  console.error("Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET in .env");
  process.exit(1);
}

const stripe = new Stripe(stripeKey);
const prisma = new PrismaClient();

const EVENT_TYPES = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
];

const pending = await prisma.order.findMany({
  where: { status: "PENDING" },
  select: { id: true, stripeCheckoutSessionId: true },
});
const bySession = new Map(
  pending
    .filter((o) => o.stripeCheckoutSessionId)
    .map((o) => [o.stripeCheckoutSessionId, o.id]),
);
console.log(`${pending.length} PENDING order(s) in the database.`);

if (bySession.size === 0) {
  console.log("Nothing to redeliver.");
  await prisma.$disconnect();
  process.exit(0);
}

let delivered = 0;
for (const type of EVENT_TYPES) {
  const events = await stripe.events.list({ type, limit: 100 });
  for (const event of events.data) {
    const orderId = bySession.get(event.data.object.id);
    if (!orderId) continue;

    const payload = JSON.stringify(event);
    const ts = Math.floor(Date.now() / 1000);
    const signature = createHmac("sha256", webhookSecret)
      .update(`${ts}.${payload}`)
      .digest("hex");

    const response = await fetch(`${BASE}/api/webhooks/stripe`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "stripe-signature": `t=${ts},v1=${signature}`,
      },
      body: payload,
    });
    const body = await response.text();
    console.log(
      `${type} ${event.id} → order ${orderId}: HTTP ${response.status} ${body}`,
    );
    if (response.ok) delivered += 1;
  }
}
console.log(`Delivered ${delivered} event(s).`);

const counts = await prisma.order.groupBy({
  by: ["status"],
  _count: true,
});
console.log(
  "Order status counts:",
  Object.fromEntries(counts.map((c) => [c.status, c._count])),
);
await prisma.$disconnect();

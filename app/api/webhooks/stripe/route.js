// POST /api/webhooks/stripe — Stripe → our server.
//
// Rules that make this the ONLY path to PAID:
//   1. the raw request body is verified against STRIPE_WEBHOOK_SECRET
//      with stripe.webhooks.constructEvent (constant-time HMAC);
//   2. the event's session must reference our stored order;
//   3. amount and currency must equal the persisted order totals;
//   4. the PENDING → PAID transition is a conditional update, so
//      duplicate deliveries are idempotent.
//
// Route is dynamic by default — Next.js must NOT parse/modify the body.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.js";
import { getStripe, redactSecrets, webhookSecret } from "@/lib/stripe.js";
import { orderIdFromSession, verifyPaidSession } from "@/lib/payments.js";
import { markOrderFailed, markOrderPaid } from "@/lib/orders.js";

function paymentIntentId(session) {
  const pi = session?.payment_intent;
  return typeof pi === "string" ? pi : (pi?.id ?? null);
}

export async function POST(request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe-Signature header." },
      { status: 400 },
    );
  }

  let stripe;
  let secret;
  try {
    stripe = getStripe();
    secret = webhookSecret();
  } catch (error) {
    // Not configured yet — tell Stripe to retry later (5xx), and log
    // the (secret-free) guidance for the operator.
    console.error("POST /api/webhooks/stripe config error:", error.message);
    return NextResponse.json(
      { error: "Webhook is not configured." },
      { status: 500 },
    );
  }

  // Raw body — Stripe signs the exact bytes it sent.
  const payload = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.warn(
      "POST /api/webhooks/stripe rejected signature:",
      redactSecrets(error?.message),
    );
    return NextResponse.json(
      { error: "Invalid Stripe signature." },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        const orderId = orderIdFromSession(session);

        const order = orderId
          ? await prisma.order.findUnique({ where: { id: orderId } })
          : null;
        if (!order) {
          // Signature is valid but the order is unknown (e.g. a test
          // event from another project's endpoint). Retrying can't
          // help — log loudly and acknowledge.
          console.warn(
            `[stripe-webhook] ${event.type} for unknown order ${orderId ?? "(none)"}`,
          );
          return NextResponse.json({ received: true, order: "unknown" });
        }

        const verdict = verifyPaidSession({ order, session });
        if (!verdict.ok) {
          if (verdict.retryable) {
            // Delayed payment method: completed fired before capture.
            // checkout.session.async_payment_succeeded will confirm it.
            console.log(
              `[stripe-webhook] ${event.type}: order ${order.id} awaiting async confirmation (${verdict.reason})`,
            );
            return NextResponse.json({ received: true, order: "awaiting_payment" });
          }
          // Permanent mismatch (amount/currency/order/status): surface
          // it as a client error so it shows up in the Stripe dashboard.
          console.error(
            `[stripe-webhook] ${event.type} verification failed for order ${order.id}: ${verdict.reason}`,
          );
          return NextResponse.json(
            { error: `Verification failed: ${verdict.reason}` },
            { status: 400 },
          );
        }

        // The single place in the entire app that writes status=PAID.
        // Conditional update → duplicate deliveries are no-ops.
        const changed = await markOrderPaid({
          orderId: order.id,
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: paymentIntentId(session),
          paidAt: session.created
            ? new Date(session.created * 1000)
            : new Date(),
        });
        console.log(
          `[stripe-webhook] order ${order.id} → PAID (${changed ? "updated" : "duplicate delivery ignored"})`,
        );
        return NextResponse.json({ received: true, paid: true });
      }

      case "checkout.session.async_payment_failed": {
        const session = event.data.object;
        const orderId = orderIdFromSession(session);
        if (!orderId) {
          return NextResponse.json({ received: true, order: "unknown" });
        }
        const changed = await markOrderFailed({
          orderId,
          stripePaymentIntentId: paymentIntentId(session),
        });
        console.log(
          `[stripe-webhook] async payment failed for order ${orderId} (${changed ? "updated" : "ignored"})`,
        );
        return NextResponse.json({ received: true });
      }

      default:
        // Acknowledged, intentionally ignored (e.g. checkout.session.expired
        // leaves the order PENDING — never PAID, so that's safe).
        return NextResponse.json({ received: true, ignored: event.type });
    }
  } catch (error) {
    // Database/infra hiccup: 5xx makes Stripe retry with backoff.
    console.error(`POST /api/webhooks/stripe ${event.type} failed:`, error);
    return NextResponse.json(
      { error: "Temporary failure while processing the event." },
      { status: 500 },
    );
  }
}

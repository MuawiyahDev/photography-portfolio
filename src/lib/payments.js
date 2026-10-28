// Pure verification logic for Stripe webhook events.
//
// NOTHING in this file touches Prisma or Stripe — it decides, given a
// stored order and a Stripe session payload, whether the order may be
// marked PAID. That makes it directly testable with `node --test`
// (tests/payments.test.js) and keeps every security check in ONE
// reviewable place.
//
// The contract: only a signature-verified webhook event whose session
// matches our own persisted order (id, amount, currency, payment
// status) may transition an order out of PENDING.

/** The order id we embedded when creating the Checkout session. */
export function orderIdFromSession(session) {
  return session?.metadata?.orderId || session?.client_reference_id || null;
}

/**
 * Decide whether a `checkout.session.completed` /
 * `checkout.session.async_payment_succeeded` event proves our order
 * was paid.
 *
 * @param {object} order   persisted Order row (totalCents, currency, status)
 * @param {object} session Stripe Checkout session from the event payload
 * @returns {{ ok: true } | { ok: false, reason: string, retryable: boolean }}
 */
export function verifyPaidSession({ order, session }) {
  if (!session) return fail("missing_session", false);
  if (!order) return fail("unknown_order", false);

  // We only sell through Checkout in payment mode.
  if (session.mode !== "payment") return fail("unexpected_mode", false);

  // The session must reference THIS order — nothing else may match.
  if (orderIdFromSession(session) !== order.id) {
    return fail("order_mismatch", false);
  }

  // Replayed deliveries: already paid → treat as a successful no-op.
  if (order.status === "PAID") return { ok: true, alreadyPaid: true };

  // CANCELLED/FAILED orders must never be resurrected by a late event
  // that isn't an explicit async success (handled by the caller).
  if (order.status !== "PENDING") {
    return fail(`order_${String(order.status).toLowerCase()}`, false);
  }

  // `checkout.session.completed` can fire with payment_status "unpaid"
  // for delayed methods (e.g. bank debits). Those get confirmed later
  // via checkout.session.async_payment_succeeded — never by this event.
  if (session.payment_status !== "paid") {
    return fail("payment_not_captured", true);
  }

  // Amount and currency must equal what WE charged — recomputed from
  // the persisted order, never from anything the browser sent.
  if (session.amount_total !== order.totalCents) {
    return fail("amount_mismatch", false);
  }
  if (String(session.currency).toLowerCase() !== String(order.currency).toLowerCase()) {
    return fail("currency_mismatch", false);
  }

  return { ok: true };
}

function fail(reason, retryable) {
  return { ok: false, reason, retryable };
}

// The webhook's PAID-gate: every check that must hold before an order
// may transition PENDING → PAID (src/lib/payments.js is pure, so these
// tests run with `npm test` and no Stripe/network access).
import { test } from "node:test";
import assert from "node:assert/strict";
import { orderIdFromSession, verifyPaidSession } from "../src/lib/payments.js";

const ORDER = {
  id: "ord_123",
  status: "PENDING",
  currency: "USD",
  totalCents: 4500,
};

const SESSION = {
  id: "cs_test_abc",
  mode: "payment",
  payment_status: "paid",
  amount_total: 4500,
  currency: "usd",
  metadata: { orderId: "ord_123" },
};

test("orderIdFromSession prefers metadata, falls back to client_reference_id", () => {
  assert.equal(orderIdFromSession(SESSION), "ord_123");
  assert.equal(
    orderIdFromSession({ client_reference_id: "ord_xyz", metadata: {} }),
    "ord_xyz",
  );
  assert.equal(orderIdFromSession({}), null);
  assert.equal(orderIdFromSession(null), null);
});

test("verified paid session matching the order passes", () => {
  assert.deepEqual(verifyPaidSession({ order: ORDER, session: SESSION }), {
    ok: true,
  });
});

test("missing session or unknown order is rejected and NOT retryable", () => {
  assert.equal(verifyPaidSession({ order: ORDER, session: null }).ok, false);
  const unknown = verifyPaidSession({ order: null, session: SESSION });
  assert.equal(unknown.ok, false);
  assert.equal(unknown.reason, "unknown_order");
});

test("amount tampering (session total ≠ stored order total) is rejected", () => {
  const verdict = verifyPaidSession({
    order: ORDER,
    session: { ...SESSION, amount_total: 100 },
  });
  assert.equal(verdict.ok, false);
  assert.equal(verdict.reason, "amount_mismatch");
});

test("currency mismatch is rejected", () => {
  const verdict = verifyPaidSession({
    order: ORDER,
    session: { ...SESSION, currency: "eur" },
  });
  assert.equal(verdict.ok, false);
  assert.equal(verdict.reason, "currency_mismatch");
});

test("a session for a DIFFERENT order is rejected", () => {
  const verdict = verifyPaidSession({
    order: ORDER,
    session: { ...SESSION, metadata: { orderId: "ord_other" } },
  });
  assert.equal(verdict.ok, false);
  assert.equal(verdict.reason, "order_mismatch");
});

test("async completion with payment_status unpaid is deferred (retryable)", () => {
  const verdict = verifyPaidSession({
    order: ORDER,
    session: { ...SESSION, payment_status: "unpaid" },
  });
  assert.equal(verdict.ok, false);
  assert.equal(verdict.reason, "payment_not_captured");
  assert.equal(verdict.retryable, true);
});

test("an already-PAID order is an idempotent success (duplicate delivery)", () => {
  const verdict = verifyPaidSession({
    order: { ...ORDER, status: "PAID" },
    session: SESSION,
  });
  assert.equal(verdict.ok, true);
  assert.equal(verdict.alreadyPaid, true);
});

test("FAILED/CANCELLED orders are never resurrected by a completed event", () => {
  for (const status of ["FAILED", "CANCELLED"]) {
    const verdict = verifyPaidSession({
      order: { ...ORDER, status },
      session: SESSION,
    });
    assert.equal(verdict.ok, false, status);
    assert.equal(verdict.retryable, false, status);
  }
});

test("non-payment Checkout sessions are rejected", () => {
  const verdict = verifyPaidSession({
    order: ORDER,
    session: { ...SESSION, mode: "subscription" },
  });
  assert.equal(verdict.ok, false);
  assert.equal(verdict.reason, "unexpected_mode");
});

// Money helpers — integer-cents arithmetic must never drift.
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatMoney, lineTotalCents } from "../src/lib/money.js";

test("lineTotalCents multiplies integer cents exactly", () => {
  assert.equal(lineTotalCents(4500, 1), 4500);
  assert.equal(lineTotalCents(4500, 3), 13500);
  assert.equal(lineTotalCents(9999, 10), 99990);
  // No floating-point artifact: 19.99 × 3 would be 59.970000000000006 as
  // floats; as cents it is exact.
  assert.equal(lineTotalCents(1999, 3), 5997);
});

test("formatMoney renders USD from integer cents", () => {
  assert.equal(formatMoney(4500, "USD"), "$45.00");
  assert.equal(formatMoney(0, "USD"), "$0.00");
  assert.equal(formatMoney(1, "USD"), "$0.01");
});

test("formatMoney rejects non-integer input (float prices are a bug)", () => {
  assert.throws(() => formatMoney(45.5), TypeError);
  assert.throws(() => formatMoney("4500"), TypeError);
});

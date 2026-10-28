// Money helpers — all amounts are integers in the currency's minor
// unit (USD cents). Integer arithmetic only: no floats touch a price,
// a subtotal, or a total anywhere in this app.
//
// Kept dependency-free so `node --test` can exercise it directly.

/**
 * Line total for a price × quantity. Both inputs are integer cents;
 * the result is integer cents.
 */
export function lineTotalCents(unitPriceCents, quantity) {
  return unitPriceCents * quantity;
}

/**
 * Format integer cents for display, e.g. 4500 → "$45.00".
 * Falls back to a plain "<amount> <CODE>" string if Intl fails.
 */
export function formatMoney(cents, currency = "USD") {
  if (!Number.isInteger(cents)) {
    throw new TypeError(`formatMoney expects integer cents, got ${cents}`);
  }
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

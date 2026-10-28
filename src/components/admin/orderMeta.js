// Shared presentation rules for anything that shows an order: the
// table, the detail page and the user page all pull from here so a
// status or an order type can never be labelled two different ways.
// Plain module (no React) — safe to import from server and client.

export const ORDER_STATUS_LABELS = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
};

export const ORDER_TYPE_LABELS = {
  REGISTERED: "Registered user",
  GUEST: "Guest",
};

/** Badge tone for a Prisma OrderStatus value. */
export function statusTone(status) {
  switch (status) {
    case "PAID":
      return "success";
    case "PENDING":
      return "warn";
    case "FAILED":
      return "danger";
    default:
      return "neutral";
  }
}

/** Badge tone for an order type derived from the row ("REGISTERED"/"GUEST"). */
export function typeTone(type) {
  return type === "GUEST" ? "warn" : "brand";
}

export function statusLabel(status) {
  return ORDER_STATUS_LABELS[status] ?? status ?? "Unknown";
}

export function typeLabel(type) {
  return ORDER_TYPE_LABELS[type] ?? type ?? "Unknown";
}

/**
 * Name shown for the buyer of an order. Registered orders use the
 * account name (falling back to the email when the name is optional
 * and empty); a guest order has no account, so it is labelled as such
 * instead of inventing a contact the row does not carry.
 */
export function customerName(customer) {
  if (customer?.type === "GUEST") return "Guest checkout";
  return customer?.name || customer?.email || "Unnamed account";
}

/** Email shown for the buyer, or a short honest placeholder. */
export function customerEmail(customer) {
  if (customer?.type === "GUEST") return "No account linked";
  return customer?.email ?? "—";
}

/** Avatar initials for a customer cell (mirrors UserTable). */
export function customerInitials(customer) {
  const source = customerName(customer).trim();
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

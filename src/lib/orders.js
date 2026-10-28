// Order service — every database write around purchases lives here so
// the checkout route and the webhook share one set of rules.
//
// Invariants:
//   * prices/totals are computed here from the Work row, never from
//     request bodies;
//   * order + items are created in ONE transaction;
//   * only markOrderPaid() (called by the verified webhook) sets PAID,
//     and it is idempotent for duplicate event deliveries.
import { prisma } from "./prisma.js";
import { lineTotalCents } from "./money.js";

/**
 * Create a PENDING order with its items in a single transaction.
 * `work` must be a trusted Work row loaded server-side (priceCents > 0).
 *
 * Duplicate submissions carrying the same `requestId` (double-click /
 * network retry) return the order that request already created —
 * enforced by the unique index on Order.requestId.
 *
 * @returns {Promise<{ order: object, reused: boolean }>}
 */
export async function createPendingOrder({ userId, requestId, work, quantity }) {
  const unitPriceCents = work.priceCents;
  const lineTotal = lineTotalCents(unitPriceCents, quantity);

  if (!Number.isInteger(unitPriceCents) || unitPriceCents <= 0) {
    throw new Error("createPendingOrder: work has no valid price");
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("createPendingOrder: invalid quantity");
  }

  // Fast path: this attempt already produced an order.
  if (requestId) {
    const existing = await prisma.order.findUnique({
      where: { requestId },
      include: { items: true },
    });
    if (existing) return { order: existing, reused: true };
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          status: "PENDING",
          currency: work.currency,
          subtotalCents: lineTotal,
          totalCents: lineTotal,
          requestId: requestId ?? null,
          items: {
            create: {
              workId: work.id,
              workTitle: work.title, // purchase-time snapshot
              unitPriceCents,
              quantity,
              lineTotalCents: lineTotal,
            },
          },
        },
        include: { items: true },
      });
      return created;
    });
    return { order, reused: false };
  } catch (error) {
    // Two racing submissions with the same requestId: the loser of the
    // unique-index race re-reads the winner's order.
    if (error?.code === "P2002" && requestId) {
      const existing = await prisma.order.findUnique({
        where: { requestId },
        include: { items: true },
      });
      if (existing) return { order: existing, reused: true };
    }
    throw error;
  }
}

/** Attach the Stripe Checkout session id to a PENDING order. */
export async function attachCheckoutSession(orderId, sessionId) {
  await prisma.order.update({
    where: { id: orderId },
    data: { stripeCheckoutSessionId: sessionId },
  });
}

/**
 * Transition PENDING → PAID. Idempotent: concurrent/duplicate webhook
 * deliveries only ever succeed once — the conditional updateMany is
 * the guard. Returns true when this call performed the transition.
 */
export async function markOrderPaid({
  orderId,
  stripeCheckoutSessionId,
  stripePaymentIntentId,
  paidAt,
}) {
  const result = await prisma.order.updateMany({
    where: { id: orderId, status: "PENDING" },
    data: {
      status: "PAID",
      paidAt: paidAt ?? new Date(),
      ...(stripeCheckoutSessionId
        ? { stripeCheckoutSessionId }
        : {}),
      ...(stripePaymentIntentId ? { stripePaymentIntentId } : {}),
    },
  });
  return result.count === 1;
}

/** PENDING → FAILED for an explicitly failed async payment (webhook only). */
export async function markOrderFailed({ orderId, stripePaymentIntentId }) {
  const result = await prisma.order.updateMany({
    where: { id: orderId, status: { in: ["PENDING"] } },
    data: {
      status: "FAILED",
      ...(stripePaymentIntentId ? { stripePaymentIntentId } : {}),
    },
  });
  return result.count === 1;
}

/**
 * Order with its items, scoped to a user — the ONLY lookup used by
 * pages and the order API, so one user can never read another's order.
 * Returns null when the order doesn't exist OR isn't theirs (callers
 * 404 without distinguishing the two).
 */
export async function getOwnedOrder(orderId, userId) {
  if (!orderId || !userId) return null;
  return prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });
}

// ---------------------------------------------------------------------------
// Customer reads — the ONLY access path the "My orders" pages use.
// Every query is scoped by userId (taken from the session, never from
// the request), so one user can never see another user's orders.
// ---------------------------------------------------------------------------

/** Orders per page on the customer's order history page. */
export const MY_ORDERS_PAGE_SIZE = 10;

/**
 * Read `?page=` out of the raw `searchParams` for the customer list.
 * Malformed values fall back to 1 so a hand-edited URL can't crash
 * the page.
 */
export function parseMyOrderPageParam(raw) {
  const page = Number.parseInt(raw, 10);
  return Number.isFinite(page) && page > 0 ? Math.min(page, 100_000) : 1;
}

/**
 * One page of a user's own orders, newest first. `page` is clamped to
 * the real page count so a stale URL past the end lands on the last
 * page instead of an empty screen.
 *
 * @returns {Promise<{ orders: object[], total: number, page: number,
 *                     pageCount: number, pageSize: number }>}
 */
export async function listOrdersForUser(userId, page = 1) {
  if (!userId) return { orders: [], total: 0, page: 1, pageCount: 1, pageSize: MY_ORDERS_PAGE_SIZE };

  const where = { userId };
  const pageSize = MY_ORDERS_PAGE_SIZE;

  const total = await prisma.order.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(page, pageCount);

  const rows = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (clampedPage - 1) * pageSize,
    take: pageSize,
    include: { items: { select: { workTitle: true, quantity: true } } },
  });

  return {
    orders: rows.map(toUserOrder),
    total,
    page: clampedPage,
    pageCount,
    pageSize,
  };
}

/** UI-safe list row for the customer's own history: no Stripe ids. */
export function toUserOrder(order) {
  return {
    id: order.id,
    status: order.status,
    currency: order.currency,
    totalCents: order.totalCents,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    items: order.items.map((item) => ({
      workTitle: item.workTitle,
      quantity: item.quantity,
    })),
  };
}

// ---------------------------------------------------------------------------
// Admin reads — the ONLY access path the dashboard uses for order lists
// and order details. Everything is projected through toAdminOrder*(),
// so a row that reaches a client component never carries a password
// hash (the user relation is explicitly selected) — Stripe ids are
// intentionally kept for admins, since the payment panel needs them.
// ---------------------------------------------------------------------------

/** Rows per page on the dashboard orders table. */
export const ORDER_PAGE_SIZE = 10;

/** Valid values for the `?status=` / `?type=` filters. */
export const ORDER_STATUSES = ["PENDING", "PAID", "FAILED", "CANCELLED"];
export const ORDER_TYPES = ["REGISTERED", "GUEST"];

const DATE_INPUT = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validate an `<input type="date">` value ("YYYY-MM-DD") and return it
 * normalized, or null when it isn't a real calendar date. Dates are
 * interpreted as UTC bounds so the range does not drift with the
 * server's timezone.
 */
function parseDateInput(value) {
  if (typeof value !== "string" || !DATE_INPUT.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : value;
}

/**
 * Read dashboard filters out of the raw `searchParams` object.
 * Anything unknown or malformed falls back to the neutral value, so a
 * hand-edited URL can never crash the page or widen access.
 *
 * @returns {{ query: string, status: string, type: string,
 *             from: string|null, to: string|null, page: number }}
 */
export function parseOrderFilters(raw = {}) {
  const page = Number.parseInt(raw?.page, 10);
  return {
    query: typeof raw?.q === "string" ? raw.q.trim().slice(0, 120) : "",
    status: ORDER_STATUSES.includes(raw?.status) ? raw.status : "",
    type: ORDER_TYPES.includes(raw?.type) ? raw.type : "",
    from: parseDateInput(raw?.from),
    to: parseDateInput(raw?.to),
    page: Number.isFinite(page) && page > 0 ? Math.min(page, 100_000) : 1,
  };
}

/** True when the table is showing a narrowed-down view of the orders. */
export function hasActiveOrderFilters(filters) {
  return Boolean(
    filters.query || filters.status || filters.type || filters.from || filters.to,
  );
}

/** Build the Prisma `where` for a set of parsed filters. */
function orderWhere({ query, status, type, from, to }) {
  const where = {};
  const clauses = [];

  if (status) where.status = status;

  // Order type is derived from the DATA: a guest order is one with no
  // account linked to it. `Order.userId` is a required foreign key
  // today (checkout requires a signed-in session), so that set is
  // empty by construction — and Prisma rejects `user: null` checks
  // against required relations. An impossible id match keeps the
  // filter truthful: it yields the real (currently empty) guest set
  // instead of silently showing registered orders.
  if (type === "GUEST") {
    where.id = { in: [] };
  }
  // REGISTERED needs no clause: every row has its required user.

  if (from || to) {
    const createdAt = {};
    if (from) createdAt.gte = new Date(`${from}T00:00:00.000Z`);
    if (to) createdAt.lte = new Date(`${to}T23:59:59.999Z`);
    where.createdAt = createdAt;
  }

  if (query) {
    const needle = { contains: query, mode: "insensitive" };
    clauses.push({
      OR: [
        { id: needle },
        { user: { name: needle } },
        { user: { email: needle } },
        { items: { some: { workTitle: needle } } },
      ],
    });
  }

  if (clauses.length) where.AND = clauses;
  return where;
}

/**
 * The buyer behind an order, resolved from the row itself — never a
 * hardcoded label. Checkout currently requires an account, so orders
 * carry a linked user and resolve to REGISTERED; an order with no
 * linked account is GUEST because the relation is missing, so the
 * badge and the filter stay correct the moment such rows exist.
 */
export function customerFromOrder(order) {
  const user = order?.user ?? null;
  if (user) {
    return {
      type: "REGISTERED",
      userId: user.id,
      name: user.name ?? null,
      email: user.email ?? null,
      role: user.role ?? null,
      createdAt: user.createdAt ?? null,
    };
  }
  return {
    type: "GUEST",
    userId: null,
    name: null,
    email: null,
    role: null,
    createdAt: null,
  };
}

/** UI-safe list row: no password hash, no Stripe ids, no relation dumps. */
export function toAdminOrder(order) {
  return {
    id: order.id,
    status: order.status,
    currency: order.currency,
    subtotalCents: order.subtotalCents,
    totalCents: order.totalCents,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    itemTitles: order.items.map((item) => item.workTitle),
    customer: customerFromOrder(order),
  };
}

/** UI-safe detail row: adds payment references, timestamps, line items. */
export function toAdminOrderDetail(order) {
  return {
    ...toAdminOrder(order),
    requestId: order.requestId,
    stripeCheckoutSessionId: order.stripeCheckoutSessionId,
    stripePaymentIntentId: order.stripePaymentIntentId,
    updatedAt: order.updatedAt,
    items: order.items.map((item) => ({
      id: item.id,
      workTitle: item.workTitle,
      unitPriceCents: item.unitPriceCents,
      quantity: item.quantity,
      lineTotalCents: item.lineTotalCents,
      workSlug: item.work?.slug ?? null,
      workSrc: item.work?.src ?? null,
    })),
  };
}

const ORDER_LIST_INCLUDE = {
  user: { select: { id: true, name: true, email: true, role: true, createdAt: true } },
  items: { select: { workTitle: true, quantity: true } },
};

/**
 * One page of orders for the dashboard, filtered and sorted server
 * side so the table never has to load the whole table into memory.
 *
 * `page` is clamped to the real page count (a stale URL that points
 * past the end lands on the last page instead of an empty screen).
 *
 * @returns {Promise<{ orders: object[], total: number, page: number,
 *                     pageCount: number, pageSize: number }>}
 */
export async function listOrdersForAdmin(filters) {
  const where = orderWhere(filters);
  const pageSize = ORDER_PAGE_SIZE;

  const total = await prisma.order.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(filters.page, pageCount);

  const rows = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: ORDER_LIST_INCLUDE,
  });

  return { orders: rows.map(toAdminOrder), total, page, pageCount, pageSize };
}

/**
 * A single order for the detail page — items included with their
 * work's slug/thumbnail, but the work relation is only used for
 * navigation (the price/title on the row are purchase-time snapshots).
 * Returns null when the id doesn't exist, so the page can 404.
 */
export async function getOrderForAdmin(orderId) {
  if (!orderId) return null;
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { id: true, name: true, email: true, role: true, createdAt: true } },
      items: { include: { work: { select: { slug: true, src: true } } } },
    },
  });
}

/** Headline numbers for the page header badge (one groupBy query). */
export async function getOrderStats() {
  const rows = await prisma.order.groupBy({
    by: ["status"],
    _count: { _all: true },
    _sum: { totalCents: true },
  });
  const byStatus = Object.fromEntries(
    rows.map((row) => [
      row.status,
      { count: row._count._all, totalCents: row._sum.totalCents ?? 0 },
    ]),
  );
  const counts = Object.values(byStatus);
  return {
    total: counts.reduce((sum, entry) => sum + entry.count, 0),
    pending: byStatus.PENDING?.count ?? 0,
    paidCount: byStatus.PAID?.count ?? 0,
    paidRevenueCents: byStatus.PAID?.totalCents ?? 0,
  };
}

/**
 * Minimal, UI-safe projection: status, line items, totals, timestamps.
 * Never includes Stripe ids or anything secret.
 */
export function toOrderSummary(order) {
  return {
    id: order.id,
    status: order.status,
    currency: order.currency,
    subtotalCents: order.subtotalCents,
    totalCents: order.totalCents,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    items: order.items.map((item) => ({
      workTitle: item.workTitle,
      unitPriceCents: item.unitPriceCents,
      quantity: item.quantity,
      lineTotalCents: item.lineTotalCents,
    })),
  };
}

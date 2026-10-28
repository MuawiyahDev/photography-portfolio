// My orders — the signed-in user's own purchase history, newest
// first, paginated. Each row links to the full order detail page.
//
// Access: gated by the session; the query itself is scoped to
// session.user.id inside listOrdersForUser() — there is no user id in
// the URL, so a visitor can only ever read their own orders.
//
// NOTE: this page lives in a route group `(list)` on purpose. Its
// loading.js must scope to the list only — a streaming boundary above
// app/(site)/orders/[id] would commit HTTP 200 before notFound() runs
// and turn every unknown order id into a "successful" 404 page (same
// rule as app/admin/orders).
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  listOrdersForUser,
  parseMyOrderPageParam,
} from "@/lib/orders.js";
import { formatMoney } from "@/lib/money.js";
import { formatDate } from "@/lib/format.js";
import Badge from "@/components/ui/Badge.jsx";
import Button from "@/components/ui/Button.jsx";
import Card from "@/components/ui/Card.jsx";
import Container from "@/components/ui/Container.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import Eyebrow from "@/components/ui/Eyebrow.jsx";
import { statusLabel, statusTone } from "@/components/admin/orderMeta.js";
import { IconBag } from "@/components/ui/icons.jsx";

export const dynamic = "force-dynamic";

/** One-line summary of what an order contains, truncated with a count. */
function itemsSummary(order) {
  const titles = order.items.map((item) => `${item.quantity} × ${item.workTitle}`);
  if (titles.length === 0) return "No items";
  if (titles.length <= 2) return titles.join(" · ");
  return `${titles.slice(0, 2).join(" · ")} · +${titles.length - 2} more`;
}

/** Page buttons around the current page, with ellipsis markers. */
function pageWindow(page, pageCount) {
  if (pageCount <= 5) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const start = Math.max(1, Math.min(page - 2, pageCount - 4));
  const pages = Array.from({ length: 5 }, (_, i) => start + i);
  const items = [];
  if (start > 1) items.push(1, "…");
  items.push(...pages);
  if (start + 4 < pageCount) items.push("…", pageCount);
  return items;
}

/** `/orders` for page 1, `/orders?page=N` otherwise. */
function pageHref(target) {
  return target <= 1 ? "/orders" : `/orders?page=${target}`;
}

export default async function MyOrdersPage({ searchParams }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = (await searchParams) ?? {};
  const requestedPage = parseMyOrderPageParam(params.page);

  const { orders, total, page, pageCount } = await listOrdersForUser(
    session.user.id,
    requestedPage,
  );

  return (
    <section className="py-14 sm:py-20 lg:py-24">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <Eyebrow>Orders</Eyebrow>
            <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
              My orders
            </h1>
            <p className="mt-3 text-muted dark:text-white/60">
              Every print purchase made with your account, newest first.
              Select an order to see its items, totals and payment status.
            </p>
          </div>
          {total > 0 ? (
            <Badge tone="brand">
              {total} order{total === 1 ? "" : "s"}
            </Badge>
          ) : null}
        </div>

        <div className="mt-8">
          {orders.length === 0 ? (
            <Card>
              <EmptyState
                icon={<IconBag className="h-6 w-6" />}
                title="No orders yet"
                description="When you purchase a print, the order appears here with its items, total and payment status."
                action={
                  <Button href="/#portfolio" variant="dark">
                    Browse the portfolio
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className="grid gap-4">
              <Card className="overflow-hidden">
                <ul className="divide-y divide-sand/70 dark:divide-white/10">
                  {orders.map((order) => (
                    <li
                      key={order.id}
                      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 py-4 transition-colors hover:bg-cream/70 sm:px-6 dark:hover:bg-white/[0.03]"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/orders/${order.id}`}
                            className="font-mono text-xs font-semibold text-pine underline-offset-2 hover:underline dark:text-emerald-300"
                          >
                            {order.id}
                          </Link>
                          <Badge tone={statusTone(order.status)} dot>
                            {statusLabel(order.status)}
                          </Badge>
                        </div>
                        <p className="mt-1.5 truncate text-sm font-semibold text-ink dark:text-cream">
                          {itemsSummary(order)}
                        </p>
                        <p className="mt-0.5 text-xs text-muted dark:text-white/45">
                          Placed {formatDate(order.createdAt)}
                          {order.paidAt
                            ? ` · Paid ${formatDate(order.paidAt)}`
                            : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-sm font-semibold tabular-nums text-ink dark:text-cream">
                          {formatMoney(order.totalCents, order.currency)}
                        </span>
                        <Button
                          href={`/orders/${order.id}`}
                          variant="secondary"
                          size="sm"
                        >
                          View details
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>

              {pageCount > 1 ? (
                <nav
                  aria-label="Orders pages"
                  className="flex flex-wrap items-center justify-center gap-1"
                >
                  {page > 1 ? (
                    <Link
                      href={pageHref(page - 1)}
                      className="rounded-lg border border-sand bg-white px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:border-ink hover:text-ink dark:border-white/15 dark:bg-white/5 dark:text-white/70 dark:hover:border-white/40 dark:hover:text-white"
                    >
                      <span aria-hidden="true">←</span>
                      <span className="sr-only">Previous page</span>
                    </Link>
                  ) : (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none rounded-lg border border-sand bg-white px-3 py-1.5 text-sm font-semibold text-muted opacity-40 dark:border-white/15 dark:bg-white/5 dark:text-white/70"
                    >
                      ←
                    </span>
                  )}
                  {pageWindow(page, pageCount).map((item, index) =>
                    item === "…" ? (
                      <span
                        key={`gap-${index}`}
                        aria-hidden="true"
                        className="px-1.5 text-sm text-muted dark:text-white/50"
                      >
                        …
                      </span>
                    ) : (
                      <Link
                        key={item}
                        href={pageHref(item)}
                        aria-current={item === page ? "page" : undefined}
                        className={`min-w-9 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                          item === page
                            ? "border-pine bg-pine text-white"
                            : "border-sand bg-white text-muted hover:border-ink hover:text-ink dark:border-white/15 dark:bg-white/5 dark:text-white/70 dark:hover:border-white/40 dark:hover:text-white"
                        }`}
                      >
                        {item}
                      </Link>
                    ),
                  )}
                  {page < pageCount ? (
                    <Link
                      href={pageHref(page + 1)}
                      className="rounded-lg border border-sand bg-white px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:border-ink hover:text-ink dark:border-white/15 dark:bg-white/5 dark:text-white/70 dark:hover:border-white/40 dark:hover:text-white"
                    >
                      <span aria-hidden="true">→</span>
                      <span className="sr-only">Next page</span>
                    </Link>
                  ) : (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none rounded-lg border border-sand bg-white px-3 py-1.5 text-sm font-semibold text-muted opacity-40 dark:border-white/15 dark:bg-white/5 dark:text-white/70"
                    >
                      →
                    </span>
                  )}
                </nav>
              ) : null}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

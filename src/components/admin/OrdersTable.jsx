"use client";

// Orders management table: debounced search, status / order-type /
// date-range filters that live in the URL (shareable, back-button
// friendly), server-side pagination, and honest loading, empty and
// filtered-empty states.
//
// Data comes from the server component — this file only decides which
// URL to navigate to, so filtering and paging always run in the
// database instead of on a client copy of every order.
import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/money.js";
import { formatDate } from "@/lib/format.js";
import {
  hasActiveOrderFilters,
  ORDER_STATUSES,
  ORDER_TYPES,
} from "@/lib/orders.js";
import Badge from "@/components/ui/Badge.jsx";
import Button from "@/components/ui/Button.jsx";
import Card from "@/components/ui/Card.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import Field, { inputClass, selectClass } from "@/components/ui/Field.jsx";
import {
  customerEmail,
  customerInitials,
  customerName,
  statusLabel,
  statusTone,
  typeLabel,
  typeTone,
} from "./orderMeta.js";
import { IconInbox, IconSearch } from "@/components/ui/icons.jsx";

const SEARCH_DEBOUNCE_MS = 350;

const STATUS_OPTIONS = [
  { value: "", label: "Any status" },
  ...ORDER_STATUSES.map((value) => ({ value, label: statusLabel(value) })),
];

const TYPE_OPTIONS = [
  { value: "", label: "All customers" },
  ...ORDER_TYPES.map((value) => ({ value, label: typeLabel(value) })),
];

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

export default function OrdersTable({
  orders,
  filters,
  total,
  page,
  pageCount,
  pageSize,
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(filters.query);
  const searchTimer = useRef(null);

  // Navigate to a new filter/page combination. Filter edits replace the
  // URL (no history spam); page changes push so Back works.
  const apply = (next, { replace = true } = {}) => {
    const params = new URLSearchParams();
    if (next.query.trim()) params.set("q", next.query.trim());
    if (next.status) params.set("status", next.status);
    if (next.type) params.set("type", next.type);
    if (next.from) params.set("from", next.from);
    if (next.to) params.set("to", next.to);
    if (next.page > 1) params.set("page", String(next.page));

    const query = params.toString();
    const href = query ? `/admin/orders?${query}` : "/admin/orders";
    startTransition(() => {
      if (replace) router.replace(href, { scroll: false });
      else router.push(href, { scroll: false });
    });
  };

  // Keep the input in sync when filters change from outside (clear
  // filters in an empty state, browser back, a link with ?q=…).
  useEffect(() => {
    window.clearTimeout(searchTimer.current);
    setSearch(filters.query);
  }, [filters.query]);

  useEffect(() => () => window.clearTimeout(searchTimer.current), []);

  const commitSearch = (value) => {
    window.clearTimeout(searchTimer.current);
    apply({ ...filters, query: value, page: 1 });
  };

  const onSearchChange = (event) => {
    const value = event.target.value;
    setSearch(value);
    window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(
      () => commitSearch(value),
      SEARCH_DEBOUNCE_MS,
    );
  };

  const onSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitSearch(search);
    }
  };

  const clearFilters = () => {
    window.clearTimeout(searchTimer.current);
    setSearch("");
    apply({
      query: "",
      status: "",
      type: "",
      from: "",
      to: "",
      page: 1,
    });
  };

  const filtered = hasActiveOrderFilters(filters);
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const pagination =
    pageCount > 1 ? (
      <nav
        aria-label="Orders pages"
        className="flex flex-wrap items-center justify-center gap-1"
      >
        <button
          type="button"
          onClick={() => apply({ ...filters, page: page - 1 }, { replace: false })}
          disabled={page <= 1 || isPending}
          className="rounded-lg border border-sand bg-white px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:border-ink hover:text-ink disabled:pointer-events-none disabled:opacity-40 dark:border-white/15 dark:bg-white/5 dark:text-white/70 dark:hover:border-white/40 dark:hover:text-white"
        >
          <span aria-hidden="true">←</span>
          <span className="sr-only">Previous page</span>
        </button>
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
            <button
              key={item}
              type="button"
              onClick={() =>
                apply({ ...filters, page: item }, { replace: false })
              }
              aria-current={item === page ? "page" : undefined}
              disabled={isPending}
              className={`min-w-9 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-40 ${
                item === page
                  ? "border-pine bg-pine text-white"
                  : "border-sand bg-white text-muted hover:border-ink hover:text-ink dark:border-white/15 dark:bg-white/5 dark:text-white/70 dark:hover:border-white/40 dark:hover:text-white"
              }`}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => apply({ ...filters, page: page + 1 }, { replace: false })}
          disabled={page >= pageCount || isPending}
          className="rounded-lg border border-sand bg-white px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:border-ink hover:text-ink disabled:pointer-events-none disabled:opacity-40 dark:border-white/15 dark:bg-white/5 dark:text-white/70 dark:hover:border-white/40 dark:hover:text-white"
        >
          <span aria-hidden="true">→</span>
          <span className="sr-only">Next page</span>
        </button>
      </nav>
    ) : null;

  return (
    <div className="grid gap-4">
      {/* Toolbar */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))_auto] lg:items-end">
        <Field id="orders-search" label="Search">
          {(a11y) => (
            <div className="relative">
              <IconSearch
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40 dark:text-white/40"
              />
              <input
                id="orders-search"
                type="search"
                value={search}
                onChange={onSearchChange}
                onKeyDown={onSearchKeyDown}
                placeholder="Order id, customer, print…"
                className={`${inputClass} pl-9`}
                {...a11y}
              />
            </div>
          )}
        </Field>

        <Field id="orders-status" label="Status">
          {(a11y) => (
            <select
              id="orders-status"
              value={filters.status}
              onChange={(event) =>
                apply({ ...filters, status: event.target.value, page: 1 })
              }
              className={selectClass}
              {...a11y}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field id="orders-type" label="Customer">
          {(a11y) => (
            <select
              id="orders-type"
              value={filters.type}
              onChange={(event) =>
                apply({ ...filters, type: event.target.value, page: 1 })
              }
              className={selectClass}
              {...a11y}
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field id="orders-from" label="From">
          {(a11y) => (
            <input
              id="orders-from"
              type="date"
              value={filters.from ?? ""}
              onChange={(event) =>
                apply({ ...filters, from: event.target.value, page: 1 })
              }
              className={inputClass}
              {...a11y}
            />
          )}
        </Field>

        <Field id="orders-to" label="To">
          {(a11y) => (
            <input
              id="orders-to"
              type="date"
              value={filters.to ?? ""}
              onChange={(event) =>
                apply({ ...filters, to: event.target.value, page: 1 })
              }
              className={inputClass}
              {...a11y}
            />
          )}
        </Field>

        <div className="flex items-end justify-start lg:justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            disabled={!filtered || isPending}
            className="w-full sm:w-auto"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Result count + pending indicator */}
      <div
        aria-live="polite"
        className="flex flex-wrap items-center gap-3 text-sm text-muted dark:text-white/55"
      >
        {isPending ? <Spinner label="Updating orders" className="h-4 w-4" /> : null}
        {total > 0 ? (
          <span>
            Showing {start}–{end} of {total} order{total === 1 ? "" : "s"}
            {filtered ? " matching these filters" : ""}
          </span>
        ) : (
          <span>0 orders</span>
        )}
      </div>

      {/* Content */}
      <div
        aria-busy={isPending || undefined}
        className={`grid gap-4 transition-opacity ${
          isPending ? "opacity-60" : "opacity-100"
        }`}
      >
        {total === 0 ? (
          <Card>
            {filtered ? (
              <EmptyState
                icon={<IconSearch className="h-6 w-6" />}
                title="No matching orders"
                description="No order matches the current search, status, customer type, or date range."
                action={
                  <Button variant="secondary" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={<IconInbox className="h-6 w-6" />}
                title="No orders yet"
                description="Print purchases will show up here the moment a checkout is completed."
              />
            )}
          </Card>
        ) : (
          <>
            {/* Desktop table */}
            <Card className="hidden overflow-hidden md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-sand/70 text-xs font-bold uppercase tracking-wider text-muted dark:border-white/10 dark:text-white/55">
                    <th scope="col" className="px-5 py-3.5">
                      Order
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Customer
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Type
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Placed
                    </th>
                    <th scope="col" className="hidden px-4 py-3.5 xl:table-cell">
                      Items
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-right">
                      Total
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Payment
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/70 dark:divide-white/10">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="group transition-colors hover:bg-cream/70 dark:hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="block max-w-[11rem] truncate font-mono text-xs font-semibold text-pine underline-offset-2 hover:underline dark:text-emerald-300"
                        >
                          {order.id}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted dark:text-white/45">
                          {order.itemCount} item
                          {order.itemCount === 1 ? "" : "s"}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            aria-hidden="true"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pine/10 text-[0.7rem] font-bold text-pine ring-1 ring-pine/15 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-300/20"
                          >
                            {customerInitials(order.customer)}
                          </span>
                          <div className="min-w-0">
                            {order.customer.userId ? (
                              <Link
                                href={`/admin/users/${order.customer.userId}`}
                                className="block truncate font-semibold text-ink underline-offset-2 hover:underline dark:text-cream"
                              >
                                {customerName(order.customer)}
                              </Link>
                            ) : (
                              <p className="truncate font-semibold text-ink dark:text-cream">
                                {customerName(order.customer)}
                              </p>
                            )}
                            <p className="truncate text-xs text-muted dark:text-white/45">
                              {customerEmail(order.customer)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge tone={typeTone(order.customer.type)}>
                          {typeLabel(order.customer.type)}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-muted dark:text-white/60">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="hidden max-w-[14rem] px-4 py-3.5 text-muted dark:text-white/60 xl:table-cell">
                        <span className="block truncate">
                          {order.itemTitles[0]}
                        </span>
                        {order.itemCount > 1 ? (
                          <span className="text-xs text-muted dark:text-white/45">
                            +{order.itemCount - 1} more
                          </span>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right font-semibold tabular-nums text-ink dark:text-cream">
                        {formatMoney(order.totalCents, order.currency)}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge tone={statusTone(order.status)} dot>
                          {statusLabel(order.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex justify-end">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            aria-label={`View order ${order.id}`}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-sand/70 hover:text-ink focus-visible:outline-3 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                          >
                            <span aria-hidden="true">→</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            {/* Mobile cards */}
            <ul className="grid gap-3 md:hidden">
              {orders.map((order) => (
                <li key={order.id}>
                  <Card className="grid gap-3 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-mono text-xs font-semibold text-pine dark:text-emerald-300">
                          {order.id}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-ink dark:text-cream">
                          {customerName(order.customer)}
                        </p>
                        <p className="truncate text-xs text-muted dark:text-white/45">
                          {customerEmail(order.customer)}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <Badge tone={statusTone(order.status)} dot>
                          {statusLabel(order.status)}
                        </Badge>
                        <Badge tone={typeTone(order.customer.type)}>
                          {typeLabel(order.customer.type)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-muted dark:text-white/55">
                      <span>{formatDate(order.createdAt)}</span>
                      <span className="font-semibold tabular-nums text-ink dark:text-cream">
                        {formatMoney(order.totalCents, order.currency)}
                      </span>
                    </div>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-sand bg-white px-4 py-2 text-sm font-semibold text-muted transition-colors hover:border-ink hover:text-ink dark:border-white/15 dark:bg-white/5 dark:text-white/75 dark:hover:border-white/40 dark:hover:text-white"
                    >
                      View details
                    </Link>
                  </Card>
                </li>
              ))}
            </ul>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted dark:text-white/45">
                Page {page} of {pageCount}
              </p>
              {pagination}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

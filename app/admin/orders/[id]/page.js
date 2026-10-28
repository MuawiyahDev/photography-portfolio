// Order details — items, totals, payment references, and the buyer
// behind the order (registered account or guest). Read-only: only the
// verified Stripe webhook may ever change a status, so the dashboard
// shows what happened and links out, nothing more.
//
// No loading.js in this folder on purpose: a streaming boundary here
// would commit HTTP 200 before notFound() runs, so an unknown id must
// fall through to app/admin/orders/not-found.js with a real 404
// (same rule as app/admin/works/[slug]).
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderForAdmin, toAdminOrderDetail } from "@/lib/orders.js";
import { orderIdSchema } from "@/lib/validation.js";
import { formatMoney } from "@/lib/money.js";
import { formatDate } from "@/lib/format.js";
import Badge from "@/components/ui/Badge.jsx";
import Button from "@/components/ui/Button.jsx";
import Card, { CardBody, CardHeader } from "@/components/ui/Card.jsx";
import PageHeader from "@/components/admin/PageHeader.jsx";
import {
  customerEmail,
  customerInitials,
  customerName,
  statusLabel,
  statusTone,
  typeLabel,
  typeTone,
} from "@/components/admin/orderMeta.js";
import { IconArrowLeft } from "@/components/ui/icons.jsx";

export const dynamic = "force-dynamic";

function Row({ label, value, mono = false }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-2.5">
      <dt className="text-sm text-muted dark:text-white/55">{label}</dt>
      <dd
        className={`min-w-0 break-all text-right ${
          mono
            ? "font-mono text-xs font-medium text-ink/80 dark:text-cream/80"
            : "text-sm font-semibold text-ink dark:text-cream"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

export default async function AdminOrderDetailsPage({ params }) {
  const { id } = await params;
  const parsed = orderIdSchema.safeParse(id);
  if (!parsed.success) notFound();

  const row = await getOrderForAdmin(parsed.data);
  if (!row) notFound();

  const order = toAdminOrderDetail(row);
  const customer = order.customer;
  const isRegistered = customer.type === "REGISTERED" && Boolean(customer.userId);

  return (
    <div className="grid gap-7">
      <PageHeader
        title="Order details"
        description={`Order ${order.id} · placed ${formatDate(order.createdAt)}`}
        badge={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={statusTone(order.status)} dot>
              {statusLabel(order.status)}
            </Badge>
            <Badge tone={typeTone(customer.type)}>
              {typeLabel(customer.type)}
            </Badge>
          </span>
        }
        actions={
          <Button href="/admin/orders" variant="ghost" size="sm">
            <IconArrowLeft className="h-4 w-4" />
            All orders
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: line items + activity */}
        <div className="grid gap-6 lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader
              title="Purchased items"
              description={`${order.itemCount} item${order.itemCount === 1 ? "" : "s"} · prices are the purchase-time snapshots`}
            />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-sand/70 text-xs font-bold uppercase tracking-wider text-muted dark:border-white/10 dark:text-white/55">
                    <th scope="col" className="px-5 py-3.5">
                      Photograph
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-right">
                      Unit price
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-center">
                      Qty
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-right">
                      Line total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/70 dark:divide-white/10">
                  {order.items.map((item) => {
                    const title = (
                      <span className="font-semibold text-ink dark:text-cream">
                        {item.workTitle}
                      </span>
                    );
                    return (
                      <tr key={item.id} className="align-middle">
                        <td className="px-5 py-3.5">
                          <div className="flex min-w-0 items-center gap-3">
                            {item.workSrc ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.workSrc}
                                alt=""
                                loading="lazy"
                                className="h-11 w-11 shrink-0 rounded-lg object-cover ring-1 ring-black/10 dark:ring-white/15"
                              />
                            ) : null}
                            <div className="min-w-0">
                              {item.workSlug ? (
                                <Link
                                  href={`/admin/works/${item.workSlug}`}
                                  className="block truncate underline-offset-2 hover:underline"
                                >
                                  {title}
                                </Link>
                              ) : (
                                <p className="truncate">{title}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-right tabular-nums text-muted dark:text-white/60">
                          {formatMoney(item.unitPriceCents, order.currency)}
                        </td>
                        <td className="px-4 py-3.5 text-center tabular-nums text-ink dark:text-cream">
                          {item.quantity}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-right font-semibold tabular-nums text-ink dark:text-cream">
                          {formatMoney(item.lineTotalCents, order.currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="border-t border-sand/70 dark:border-white/10">
                  <tr>
                    <td colSpan={3} className="px-5 py-2.5 text-sm text-muted dark:text-white/55">
                      Subtotal
                    </td>
                    <td className="px-5 py-2.5 text-right text-sm tabular-nums text-ink dark:text-cream">
                      {formatMoney(order.subtotalCents, order.currency)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-5 pb-4 pt-1 text-sm font-bold text-ink dark:text-cream">
                      Total paid
                    </td>
                    <td className="px-5 pb-4 pt-1 text-right font-display text-lg tabular-nums text-ink dark:text-cream">
                      {formatMoney(order.totalCents, order.currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Order status"
              description="Status changes are written by the payment webhook, not by the dashboard."
            />
            <CardBody className="divide-y divide-sand/70 dark:divide-white/10">
              <dl className="divide-y divide-sand/70 dark:divide-white/10">
                <Row label="Status" value={statusLabel(order.status)} />
                <Row label="Placed" value={formatDate(order.createdAt)} />
                <Row
                  label="Paid"
                  value={order.paidAt ? formatDate(order.paidAt) : "Not paid yet"}
                />
                <Row label="Last updated" value={formatDate(order.updatedAt)} />
              </dl>
            </CardBody>
          </Card>
        </div>

        {/* Right: customer + payment */}
        <div className="grid content-start gap-6">
          <Card>
            <CardHeader
              title="Customer"
              description={
                isRegistered
                  ? "Placed by a signed-in account."
                  : "Guest checkout — no account is linked to this order."
              }
            />
            <CardBody>
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pine/10 text-xs font-bold text-pine ring-1 ring-pine/15 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-300/20"
                >
                  {customerInitials(customer)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink dark:text-cream">
                    {customerName(customer)}
                  </p>
                  <p className="truncate text-sm text-muted dark:text-white/55">
                    {customerEmail(customer)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge tone={typeTone(customer.type)}>
                  {typeLabel(customer.type)}
                </Badge>
                {customer.role ? (
                  <Badge tone="neutral">
                    {customer.role === "ADMIN" ? "Administrator" : "Member"}
                  </Badge>
                ) : null}
              </div>

              {isRegistered ? (
                <div className="mt-4">
                  <Button
                    href={`/admin/users/${customer.userId}`}
                    variant="secondary"
                    size="sm"
                  >
                    View account
                  </Button>
                </div>
              ) : null}

              {isRegistered && customer.createdAt ? (
                <p className="mt-4 text-xs text-muted dark:text-white/45">
                  Account created {formatDate(customer.createdAt)}
                </p>
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Payment"
              description="Stripe references for this checkout."
            />
            <CardBody className="divide-y divide-sand/70 dark:divide-white/10">
              <dl className="divide-y divide-sand/70 dark:divide-white/10">
                <Row
                  label="Amount"
                  value={formatMoney(order.totalCents, order.currency)}
                />
                <Row label="Currency" value={order.currency} />
                <Row
                  label="Payment intent"
                  value={order.stripePaymentIntentId ?? "—"}
                  mono
                />
                <Row
                  label="Checkout session"
                  value={order.stripeCheckoutSessionId ?? "—"}
                  mono
                />
                <Row label="Order id" value={order.id} mono />
                <Row label="Request id" value={order.requestId ?? "—"} mono />
              </dl>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Order details — one of the signed-in user's own orders: items,
// totals and the payment status as the server knows it.
//
// Ownership: the order must belong to session.user.id (enforced inside
// getOwnedOrder); an id from another account, or an unknown id, 404s
// identically without revealing that it exists.
//
// Read-only: only the verified Stripe webhook may ever change a
// status. No loading.js in this folder on purpose — a streaming
// boundary here would commit HTTP 200 before notFound() runs (same
// rule as app/admin/orders/[id]).
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOwnedOrder, toOrderSummary } from "@/lib/orders.js";
import { orderIdSchema } from "@/lib/validation.js";
import { formatMoney } from "@/lib/money.js";
import { formatDate } from "@/lib/format.js";
import Badge from "@/components/ui/Badge.jsx";
import Button from "@/components/ui/Button.jsx";
import Card, { CardBody, CardHeader } from "@/components/ui/Card.jsx";
import Container from "@/components/ui/Container.jsx";
import Eyebrow from "@/components/ui/Eyebrow.jsx";
import { statusLabel, statusTone } from "@/components/admin/orderMeta.js";
import { IconArrowLeft } from "@/components/ui/icons.jsx";

export const dynamic = "force-dynamic";

/** Honest, status-specific explanation — payment states come from the
 *  order row (written only by the webhook), never from the browser. */
function paymentNote(status) {
  switch (status) {
    case "PAID":
      return "Stripe has confirmed the payment for this order.";
    case "PENDING":
      return "We're waiting for the payment provider to confirm this order. If you have just completed checkout, refresh this page in a moment.";
    case "FAILED":
      return "The payment for this order did not complete and nothing was charged. You can start a new purchase from the portfolio.";
    default:
      return "This order was cancelled and will not be charged.";
  }
}

export default async function OrderDetailPage({ params }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const parsed = orderIdSchema.safeParse(id);
  if (!parsed.success) notFound();

  const row = await getOwnedOrder(parsed.data, session.user.id);
  if (!row) notFound();

  const order = toOrderSummary(row);
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section className="py-14 sm:py-20 lg:py-24">
      <Container size="narrow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button href="/orders" variant="ghost" size="sm">
            <IconArrowLeft className="h-4 w-4" />
            All orders
          </Button>
          <Badge tone={statusTone(order.status)} dot>
            {statusLabel(order.status)}
          </Badge>
        </div>

        <div className="mt-5">
          <Eyebrow>Order</Eyebrow>
          <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Order details
          </h1>
          <p className="mt-2 break-all font-mono text-xs font-semibold text-muted dark:text-white/55">
            {order.id}
          </p>
          <p className="mt-3 text-muted dark:text-white/60">
            Placed {formatDate(order.createdAt)} · {itemCount} item
            {itemCount === 1 ? "" : "s"}
          </p>
        </div>

        <div className="mt-8 grid gap-6">
          <Card className="overflow-hidden">
            <CardHeader
              title="Purchased items"
              description="Prices are the purchase-time snapshots."
            />
            {/* Desktop: table */}
            <div className="hidden overflow-x-auto sm:block">
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
                  {order.items.map((item, index) => (
                    <tr key={`${order.id}-${index}`} className="align-middle">
                      <td className="px-5 py-3.5 font-semibold text-ink dark:text-cream">
                        {item.workTitle}
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
                  ))}
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
                      Total
                    </td>
                    <td className="px-5 pb-4 pt-1 text-right font-display text-lg tabular-nums text-ink dark:text-cream">
                      {formatMoney(order.totalCents, order.currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mobile: stacked rows */}
            <ul className="divide-y divide-sand/70 sm:hidden dark:divide-white/10">
              {order.items.map((item, index) => (
                <li key={`${order.id}-m-${index}`} className="px-5 py-4">
                  <p className="font-semibold text-ink dark:text-cream">
                    {item.workTitle}
                  </p>
                  <p className="mt-1 text-sm text-muted dark:text-white/55">
                    {formatMoney(item.unitPriceCents, order.currency)} ×{" "}
                    {item.quantity}
                  </p>
                  <p className="mt-1 text-sm font-semibold tabular-nums text-ink dark:text-cream">
                    {formatMoney(item.lineTotalCents, order.currency)}
                  </p>
                </li>
              ))}
              <li className="flex items-center justify-between px-5 py-4">
                <span className="text-sm font-bold text-ink dark:text-cream">
                  Total
                </span>
                <span className="font-display text-lg tabular-nums text-ink dark:text-cream">
                  {formatMoney(order.totalCents, order.currency)}
                </span>
              </li>
            </ul>
          </Card>

          <Card>
            <CardHeader
              title="Payment"
              description={paymentNote(order.status)}
            />
            <CardBody className="divide-y divide-sand/70 dark:divide-white/10">
              <dl className="divide-y divide-sand/70 dark:divide-white/10">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-2.5">
                  <dt className="text-sm text-muted dark:text-white/55">
                    Status
                  </dt>
                  <dd>
                    <Badge tone={statusTone(order.status)} dot>
                      {statusLabel(order.status)}
                    </Badge>
                  </dd>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-2.5">
                  <dt className="text-sm text-muted dark:text-white/55">
                    Amount
                  </dt>
                  <dd className="text-sm font-semibold tabular-nums text-ink dark:text-cream">
                    {formatMoney(order.totalCents, order.currency)}
                  </dd>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-2.5">
                  <dt className="text-sm text-muted dark:text-white/55">
                    Placed
                  </dt>
                  <dd className="text-sm font-semibold text-ink dark:text-cream">
                    {formatDate(order.createdAt)}
                  </dd>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-2.5">
                  <dt className="text-sm text-muted dark:text-white/55">
                    Paid
                  </dt>
                  <dd className="text-sm font-semibold text-ink dark:text-cream">
                    {order.paidAt ? formatDate(order.paidAt) : "Not paid yet"}
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          {order.status === "FAILED" || order.status === "CANCELLED" ? (
            <div className="flex justify-start">
              <Button href="/#portfolio" variant="dark">
                Browse the portfolio
              </Button>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

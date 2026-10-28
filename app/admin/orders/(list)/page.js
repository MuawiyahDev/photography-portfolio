// Orders — every checkout attempt, filterable and paginated.
// Filters live in the URL (?q=&status=&type=&from=&to=&page=), so a
// filtered view can be shared or reloaded; the query itself runs in
// the database (see listOrdersForAdmin), never on a client copy.
//
// NOTE: this page lives in a route group `(list)` on purpose. Its
// loading.js must scope to the list only — a streaming boundary above
// app/admin/orders/[id] would commit a 200 before notFound() runs and
// turn every unknown order id into a "successful" 404 page.
import {
  getOrderStats,
  listOrdersForAdmin,
  parseOrderFilters,
} from "@/lib/orders.js";
import { formatMoney } from "@/lib/money.js";
import Badge from "@/components/ui/Badge.jsx";
import PageHeader from "@/components/admin/PageHeader.jsx";
import OrdersTable from "@/components/admin/OrdersTable.jsx";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({ searchParams }) {
  const raw = (await searchParams) ?? {};
  const filters = parseOrderFilters(raw);

  const [{ orders, total, page, pageCount, pageSize }, stats] =
    await Promise.all([listOrdersForAdmin(filters), getOrderStats()]);

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Every print purchase — search by order id, customer or photograph, then filter by payment status, customer type, or date range."
        badge={
          <Badge tone="brand">
            {stats.total} order{stats.total === 1 ? "" : "s"} ·{" "}
            {stats.pending} pending · {formatMoney(stats.paidRevenueCents)} paid
          </Badge>
        }
      />
      <OrdersTable
        orders={orders}
        filters={filters}
        total={total}
        page={page}
        pageCount={pageCount}
        pageSize={pageSize}
      />
    </div>
  );
}

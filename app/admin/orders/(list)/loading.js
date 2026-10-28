// Skeleton for the ORDERS LIST only (see the (list) route group —
// this boundary must never wrap app/admin/orders/[id], or the detail
// route could no longer return a real 404).
import { TableSkeleton } from "@/components/ui/Skeleton.jsx";

export default function AdminOrdersLoading() {
  return <TableSkeleton rows={6} />;
}

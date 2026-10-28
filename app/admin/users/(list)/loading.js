// Skeleton for the USERS LIST only — the (list) route group keeps this
// boundary from wrapping app/admin/users/[id], which must be able to
// return a real 404 for an unknown account id.
import { TableSkeleton } from "@/components/ui/Skeleton.jsx";

export default function AdminUsersLoading() {
  return <TableSkeleton rows={5} />;
}

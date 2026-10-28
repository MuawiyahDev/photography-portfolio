// Skeleton for the ORDERS LIST only (see the (list) route group —
// this boundary must never wrap app/(site)/orders/[id], or the detail
// route could no longer return a real 404).
import Container from "@/components/ui/Container.jsx";
import Skeleton, { TableSkeleton } from "@/components/ui/Skeleton.jsx";

export default function MyOrdersLoading() {
  return (
    <section className="py-14 sm:py-20 lg:py-24">
      <Container>
        <div className="grid max-w-2xl gap-3">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-9 w-48 rounded-lg" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="mt-8">
          <TableSkeleton rows={5} />
        </div>
      </Container>
    </section>
  );
}

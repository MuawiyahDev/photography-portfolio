// Unknown (or malformed) order id → honest 404 inside the dashboard.
import Button from "@/components/ui/Button.jsx";
import Card from "@/components/ui/Card.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import { IconInbox } from "@/components/ui/icons.jsx";

export default function OrderNotFound() {
  return (
    <Card>
      <EmptyState
        icon={<IconInbox className="h-6 w-6" />}
        title="Order not found"
        description="That order id does not exist — it may have been removed, or the link may be incomplete."
        action={<Button href="/admin/orders">Back to orders</Button>}
      />
    </Card>
  );
}

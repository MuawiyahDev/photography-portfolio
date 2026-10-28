// Unknown account id → honest 404 inside the dashboard.
import Button from "@/components/ui/Button.jsx";
import Card from "@/components/ui/Card.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import { IconUsers } from "@/components/ui/icons.jsx";

export default function UserNotFound() {
  return (
    <Card>
      <EmptyState
        icon={<IconUsers className="h-6 w-6" />}
        title="Account not found"
        description="That account does not exist — it may have been deleted, or the link may be incomplete."
        action={<Button href="/admin/users">Back to users</Button>}
      />
    </Card>
  );
}

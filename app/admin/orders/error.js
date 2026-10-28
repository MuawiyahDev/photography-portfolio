"use client";

// Orders list/detail render failure (e.g. the database is
// unreachable). Honest failure with a retry — never a mock fallback.
import Button from "@/components/ui/Button.jsx";
import Card from "@/components/ui/Card.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import { IconAlert } from "@/components/ui/icons.jsx";

export default function OrdersError({ error, reset }) {
  // Full error stays in the console for the operator; the UI only
  // shows a safe, generic message.
  console.error("Admin orders page failed:", error);

  return (
    <Card>
      <EmptyState
        icon={<IconAlert className="h-6 w-6" />}
        title="Could not load orders"
        description="Something went wrong while reading the orders table. Check the database connection and try again."
        action={<Button onClick={reset}>Try again</Button>}
      />
    </Card>
  );
}

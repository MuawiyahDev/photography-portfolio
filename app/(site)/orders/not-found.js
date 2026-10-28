// Unknown (or not-yours) order id → honest 404 on the public site.
// Ownership 404s land here too: getOwnedOrder() returns null for both
// "doesn't exist" and "belongs to someone else", so this page never
// reveals whether an id exists.
import Button from "@/components/ui/Button.jsx";
import Card from "@/components/ui/Card.jsx";
import Container from "@/components/ui/Container.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import { IconBag } from "@/components/ui/icons.jsx";

export default function OrderNotFound() {
  return (
    <section className="py-14 sm:py-20 lg:py-24">
      <Container size="narrow">
        <Card>
          <EmptyState
            icon={<IconBag className="h-6 w-6" />}
            title="Order not found"
            description="That order id does not exist on your account — it may have been removed, or the link may be incomplete."
            action={<Button href="/orders">Back to my orders</Button>}
          />
        </Card>
      </Container>
    </section>
  );
}

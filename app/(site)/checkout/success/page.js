// Checkout success return page.
//
// IMPORTANT: arriving here proves NOTHING. Stripe redirected the
// browser, but payment is only shown as confirmed when the persisted
// order row — updated exclusively by the verified webhook — says PAID.
// While the webhook is still in flight the page shows a processing
// state and polls GET /api/orders/[id] a limited number of times.
//
// Ownership: the order must belong to the signed-in user; anything
// else 404s without revealing whether the id exists.
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Container from "@/components/ui/Container.jsx";
import Eyebrow from "@/components/ui/Eyebrow.jsx";
import CheckoutStatus from "@/components/CheckoutStatus.jsx";
import { getOwnedOrder, toOrderSummary } from "@/lib/orders.js";
import { orderIdSchema } from "@/lib/validation.js";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({ searchParams }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const parsed = orderIdSchema.safeParse(params?.order ?? "");
  if (!parsed.success) notFound();

  const order = await getOwnedOrder(parsed.data, session.user.id);
  if (!order) notFound();

  return (
    <section className="py-14 sm:py-20 lg:py-24">
      <Container size="narrow">
        <div className="mx-auto max-w-xl">
          <Eyebrow>Checkout</Eyebrow>
          <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Order confirmation
          </h1>
          <p className="mt-3 text-muted dark:text-white/60">
            Your order as it is stored on our server — this status is updated
            only when Stripe confirms the payment.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-xl">
          <CheckoutStatus order={toOrderSummary(order)} />
        </div>
      </Container>
    </section>
  );
}

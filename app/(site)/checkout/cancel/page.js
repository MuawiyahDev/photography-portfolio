// Checkout cancel return page — Stripe's `cancel_url` target.
//
// Deliberately changes NOTHING: returning from this URL does not mark
// the order failed (a delayed webhook may still complete it) and never
// marks it paid. The visitor simply returns to the gallery where the
// Buy print button lives.
import Container from "@/components/ui/Container.jsx";
import Eyebrow from "@/components/ui/Eyebrow.jsx";
import Button from "@/components/ui/Button.jsx";
import { IconAlert } from "@/components/ui/icons.jsx";

export const dynamic = "force-dynamic";

export default async function CheckoutCancelPage() {
  return (
    <section className="py-14 sm:py-20 lg:py-24">
      <Container size="narrow">
        <div className="mx-auto max-w-xl rounded-2xl border border-sand bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-10">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-[#8a5b00] ring-1 ring-amber-600/25 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25">
            <IconAlert className="h-5 w-5" />
          </span>
          <Eyebrow className="mt-5">Checkout</Eyebrow>
          <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Checkout cancelled
          </h1>
          <p className="mx-auto mt-4 max-w-[46ch] text-muted dark:text-white/60">
            You left the Stripe checkout page, so no payment was completed
            and nothing has been charged. Your order was not marked as
            failed — you can simply try again whenever you like.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button href="/#work" variant="primary">
              Back to the gallery
            </Button>
            <Button href="/#contact" variant="secondary">
              Contact the studio
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

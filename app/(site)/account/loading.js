// Skeleton for the account page — mirrors its intro + forms layout so
// the section doesn't jump when the real page streams in.
import Container from "@/components/ui/Container.jsx";
import Skeleton, { FormSkeleton } from "@/components/ui/Skeleton.jsx";

export default function AccountLoading() {
  return (
    <section className="py-14 sm:py-20 lg:py-24">
      <Container>
        <div className="mx-auto grid max-w-2xl gap-3">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-9 w-64 rounded-lg" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="mx-auto mt-8 max-w-5xl">
          <FormSkeleton sections={2} />
        </div>
      </Container>
    </section>
  );
}

// Account information — the signed-in user views and edits their own
// profile (name, email) and password.
//
// Access: gated by the session; a signed-out visitor is redirected to
// /login. Every write goes through /api/account*, which scopes the
// database update to session.user.id — this page never passes a user
// id anywhere.
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma.js";
import { formatDate } from "@/lib/format.js";
import Badge from "@/components/ui/Badge.jsx";
import Button from "@/components/ui/Button.jsx";
import Card, { CardBody, CardHeader } from "@/components/ui/Card.jsx";
import Container from "@/components/ui/Container.jsx";
import Eyebrow from "@/components/ui/Eyebrow.jsx";
import ProfileForm from "@/components/account/ProfileForm.jsx";
import PasswordForm from "@/components/account/PasswordForm.jsx";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { favorites: true, orders: true } },
    },
  });
  // Session outlived the account (deleted user) — treat as signed out.
  if (!user) redirect("/login");

  const isAdmin = user.role === "ADMIN";

  return (
    <section className="py-14 sm:py-20 lg:py-24">
      <Container>
        <div className="mx-auto max-w-2xl">
          <Eyebrow>Account</Eyebrow>
          <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Account information
          </h1>
          <p className="mt-3 text-muted dark:text-white/60">
            Manage the details tied to your account. Your name and email are
            used to identify your orders, and your password protects them.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-5xl items-start gap-6 lg:grid-cols-3">
          <div className="grid min-w-0 gap-6 lg:col-span-2">
            <ProfileForm user={{ name: user.name, email: user.email }} />
            <PasswordForm />
          </div>

          <div className="grid min-w-0 content-start gap-6">
            <Card>
              <CardHeader
                title="Your account"
                description="A summary of your membership."
              />
              <CardBody className="divide-y divide-sand/70 dark:divide-white/10">
                <dl className="divide-y divide-sand/70 dark:divide-white/10">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-2.5">
                    <dt className="text-sm text-muted dark:text-white/55">
                      Membership
                    </dt>
                    <dd>
                      <Badge tone={isAdmin ? "brand" : "neutral"}>
                        {isAdmin ? "Administrator" : "Member"}
                      </Badge>
                    </dd>
                  </div>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-2.5">
                    <dt className="text-sm text-muted dark:text-white/55">
                      Member since
                    </dt>
                    <dd className="text-sm font-semibold text-ink dark:text-cream">
                      {formatDate(user.createdAt)}
                    </dd>
                  </div>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-2.5">
                    <dt className="text-sm text-muted dark:text-white/55">
                      Orders
                    </dt>
                    <dd className="text-sm font-semibold tabular-nums text-ink dark:text-cream">
                      {user._count.orders}
                    </dd>
                  </div>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-2.5">
                    <dt className="text-sm text-muted dark:text-white/55">
                      Favorites
                    </dt>
                    <dd className="text-sm font-semibold tabular-nums text-ink dark:text-cream">
                      {user._count.favorites}
                    </dd>
                  </div>
                </dl>

                <div className="pt-4">
                  <Button
                    href="/orders"
                    variant="secondary"
                    size="sm"
                    className="w-full"
                  >
                    View my orders
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </Container>
    </section>
  );
}

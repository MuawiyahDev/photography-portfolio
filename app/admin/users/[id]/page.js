// Customer details — the account behind an order. Read-only: role
// changes and deletion stay on the Users list, this page exists so an
// order can be traced back to the person who placed it.
//
// No loading.js here on purpose — a streaming boundary would commit
// HTTP 200 before notFound() runs (see app/admin/orders/[id]).
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma.js";
import { formatDate } from "@/lib/format.js";
import { formatMoney } from "@/lib/money.js";
import Badge from "@/components/ui/Badge.jsx";
import Button from "@/components/ui/Button.jsx";
import Card, { CardBody, CardHeader } from "@/components/ui/Card.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import PageHeader from "@/components/admin/PageHeader.jsx";
import {
  statusLabel,
  statusTone,
} from "@/components/admin/orderMeta.js";
import { IconArrowLeft, IconInbox } from "@/components/ui/icons.jsx";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailsPage({ params }) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { favorites: true } },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          status: true,
          currency: true,
          totalCents: true,
          createdAt: true,
        },
      },
    },
  });
  if (!user) notFound();

  const totalOrders = await prisma.order.count({ where: { userId: user.id } });

  return (
    <div className="grid gap-7">
      <PageHeader
        title={user.name ?? "Customer"}
        description={user.email}
        badge={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={user.role === "ADMIN" ? "brand" : "neutral"}>
              {user.role === "ADMIN" ? "Administrator" : "Member"}
            </Badge>
            <Badge tone="neutral">
              {totalOrders} order{totalOrders === 1 ? "" : "s"}
            </Badge>
          </span>
        }
        actions={
          <Button href="/admin/users" variant="ghost" size="sm">
            <IconArrowLeft className="h-4 w-4" />
            All users
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid content-start gap-6 lg:col-span-2">
          <Card>
            <CardHeader title="Account" />
            <CardBody className="divide-y divide-sand/70 dark:divide-white/10">
              <dl className="divide-y divide-sand/70 dark:divide-white/10">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-2.5">
                  <dt className="text-sm text-muted dark:text-white/55">Name</dt>
                  <dd className="text-sm font-semibold text-ink dark:text-cream">
                    {user.name ?? "—"}
                  </dd>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-2.5">
                  <dt className="text-sm text-muted dark:text-white/55">Email</dt>
                  <dd className="min-w-0 break-all text-sm font-semibold text-ink dark:text-cream">
                    {user.email}
                  </dd>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-2.5">
                  <dt className="text-sm text-muted dark:text-white/55">Role</dt>
                  <dd className="text-sm font-semibold text-ink dark:text-cream">
                    {user.role === "ADMIN" ? "Administrator" : "Member"}
                  </dd>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-2.5">
                  <dt className="text-sm text-muted dark:text-white/55">Joined</dt>
                  <dd className="text-sm font-semibold text-ink dark:text-cream">
                    {formatDate(user.createdAt)}
                  </dd>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-2.5">
                  <dt className="text-sm text-muted dark:text-white/55">
                    Favorites
                  </dt>
                  <dd className="text-sm font-semibold text-ink dark:text-cream">
                    {user._count.favorites}
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader
              title="Recent orders"
              description="The latest five purchases placed with this account."
              actions={
                <Link
                  href={`/admin/orders?q=${encodeURIComponent(user.email)}`}
                  className="text-xs font-bold text-pine underline-offset-2 hover:underline dark:text-emerald-300"
                >
                  View all
                </Link>
              }
            />
            {user.orders.length === 0 ? (
              <EmptyState
                icon={<IconInbox className="h-6 w-6" />}
                title="No orders yet"
                description="This account has not completed a checkout."
                className="py-10"
              />
            ) : (
              <ul className="divide-y divide-sand/70 dark:divide-white/10">
                {user.orders.map((order) => (
                  <li
                    key={order.id}
                    className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-5 py-3.5 transition-colors hover:bg-cream/70 dark:hover:bg-white/[0.03]"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="block truncate font-mono text-xs font-semibold text-pine underline-offset-2 hover:underline dark:text-emerald-300"
                      >
                        {order.id}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted dark:text-white/45">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <Badge tone={statusTone(order.status)} dot>
                        {statusLabel(order.status)}
                      </Badge>
                      <span className="text-sm font-semibold tabular-nums text-ink dark:text-cream">
                        {formatMoney(order.totalCents, order.currency)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="grid content-start gap-6">
          <Card>
            <CardHeader
              title="Orders"
              description="Jump straight into this customer's order history."
            />
            <CardBody>
              <Button
                href={`/admin/orders?q=${encodeURIComponent(user.email)}`}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                View their orders
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

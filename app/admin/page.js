// Admin overview — stats, quick actions, and the latest inquiries.
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format.js";
import Badge from "@/components/ui/Badge.jsx";
import Button from "@/components/ui/Button.jsx";
import Card from "@/components/ui/Card.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import PageHeader from "@/components/admin/PageHeader.jsx";
import {
  IconAbout,
  IconArrowRight,
  IconContact,
  IconHero,
  IconInbox,
  IconMessage,
  IconOverview,
  IconPortfolio,
  IconPlus,
  IconStar,
  IconTag,
  IconUsers,
} from "@/components/ui/icons.jsx";

export const dynamic = "force-dynamic";

const QUICK_ACTIONS = [
  {
    href: "/admin/works",
    title: "Portfolio",
    description: "Create, edit, and remove gallery works.",
    icon: IconPortfolio,
  },
  {
    href: "/admin/categories",
    title: "Categories",
    description: "The filter tabs shown in the public gallery.",
    icon: IconTag,
  },
  {
    href: "/admin/hero",
    title: "Hero",
    description: "Heading, buttons, stats, press, and hero image.",
    icon: IconHero,
  },
  {
    href: "/admin/about",
    title: "About",
    description: "Bio, call-to-action, and profile image.",
    icon: IconAbout,
  },
  {
    href: "/admin/contact",
    title: "Contact",
    description: "Contact details, socials, and inquiries.",
    icon: IconContact,
  },
  {
    href: "/admin/users",
    title: "Users",
    description: "Registered accounts, roles, and access.",
    icon: IconUsers,
  },
];

export default async function AdminOverviewPage() {
  const [workCount, inquiryCount, userCount, favoriteCount, recentInquiries] =
    await Promise.all([
      prisma.work.count(),
      prisma.inquiry.count(),
      prisma.user.count(),
      prisma.favorite.count(),
      prisma.inquiry.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const stats = [
    { label: "Portfolio works", value: workCount, icon: IconOverview },
    { label: "Inquiries", value: inquiryCount, icon: IconMessage },
    { label: "Favorites", value: favoriteCount, icon: IconStar },
    { label: "Accounts", value: userCount, icon: IconUsers },
  ];

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Dashboard"
        description="Manage everything on the public website from here. Changes appear on the site immediately after saving."
        actions={
          <Button href="/admin/works/new">
            <IconPlus className="h-4 w-4" />
            New work
          </Button>
        }
      />

      {/* Stats */}
      <ul aria-label="Statistics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <li key={stat.label}>
              <Card className="flex items-center gap-4 p-5">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pine/10 text-pine ring-1 ring-pine/15 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-300/20"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-3xl leading-none text-ink dark:text-cream">
                    {stat.value}
                  </p>
                  <p className="mt-1.5 truncate text-xs font-bold uppercase tracking-wider text-muted dark:text-white/55">
                    {stat.label}
                  </p>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Quick actions */}
        <section aria-labelledby="quick-actions-heading" className="lg:col-span-3">
          <h2
            id="quick-actions-heading"
            className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted dark:text-white/55"
          >
            Manage sections
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <li key={action.href}>
                  <Link
                    href={action.href}
                    className="group flex h-full items-start gap-3.5 rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(32,28,23,0.05)] ring-1 ring-black/5 transition-shadow hover:shadow-md focus-visible:outline-3 dark:bg-white/[0.045] dark:ring-white/10 dark:hover:shadow-none"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream text-muted ring-1 ring-sand transition-colors group-hover:bg-pine group-hover:text-white group-hover:ring-pine dark:bg-white/5 dark:ring-white/10 dark:group-hover:bg-pine dark:group-hover:ring-pine"
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 font-semibold text-ink dark:text-cream">
                        {action.title}
                        <IconArrowRight
                          aria-hidden="true"
                          className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                        />
                      </p>
                      <p className="mt-0.5 text-sm text-muted dark:text-white/55">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Recent inquiries */}
        <section aria-labelledby="recent-inquiries-heading" className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2
              id="recent-inquiries-heading"
              className="text-xs font-bold uppercase tracking-[0.14em] text-muted dark:text-white/55"
            >
              Recent inquiries
            </h2>
            {inquiryCount > 0 ? (
              <Link
                href="/admin/contact"
                className="text-xs font-bold text-pine underline-offset-2 hover:underline dark:text-emerald-300"
              >
                View all
              </Link>
            ) : null}
          </div>

          <Card>
            {recentInquiries.length === 0 ? (
              <EmptyState
                icon={<IconInbox className="h-6 w-6" />}
                title="No inquiries yet"
                description="Messages from the contact form will show up here."
                className="py-10"
              />
            ) : (
              <Card>
                <div className="grid gap-0 divide-y divide-sand/70 dark:divide-white/10">
                  {recentInquiries.map((inquiry) => (
                    <div key={inquiry.id} className="grid gap-1 px-5 py-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                        <p className="truncate text-sm font-semibold text-ink dark:text-cream">
                          {inquiry.name}
                        </p>
                        <span className="shrink-0 text-xs text-muted dark:text-white/45">
                          {formatDate(inquiry.createdAt)}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm text-muted dark:text-white/60">
                        {inquiry.message}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </Card>

          {inquiryCount === 0 ? (
            <p className="mt-3 flex items-center gap-2 text-xs text-muted dark:text-white/45">
              <Badge tone="brand" dot>
                Tip
              </Badge>
              Promote the contact form on socials to start receiving bookings.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}

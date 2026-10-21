// Read-only view of contact-form submissions (server component).
// Desktop renders a table; mobile switches to stacked cards so the
// message text stays readable on small screens.
import { formatDate } from "@/lib/format.js";
import Badge from "@/components/ui/Badge.jsx";
import Card from "@/components/ui/Card.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import { IconInbox } from "@/components/ui/icons.jsx";

function projectTone(type) {
  if (!type) return "neutral";
  return type === "wedding" || type === "editorial" ? "brand" : "neutral";
}

export default function InquiriesTable({ inquiries }) {
  if (inquiries.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<IconInbox className="h-6 w-6" />}
          title="No inquiries yet"
          description="Messages sent through the public contact form will appear here."
        />
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <p aria-live="polite" className="text-sm text-muted dark:text-white/55">
        {inquiries.length} message{inquiries.length === 1 ? "" : "s"} · latest
        100 shown
      </p>

      {/* Desktop table */}
      <Card className="hidden overflow-hidden lg:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-sand/70 text-xs font-bold uppercase tracking-wider text-muted dark:border-white/10 dark:text-white/55">
              <th scope="col" className="px-5 py-3.5">
                Received
              </th>
              <th scope="col" className="px-4 py-3.5">
                From
              </th>
              <th scope="col" className="px-4 py-3.5">
                Project
              </th>
              <th scope="col" className="px-4 py-3.5">
                Message
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand/70 dark:divide-white/10">
            {inquiries.map((inquiry) => (
              <tr
                key={inquiry.id}
                className="align-top transition-colors hover:bg-cream/70 dark:hover:bg-white/[0.03]"
              >
                <td className="whitespace-nowrap px-5 py-4 text-muted dark:text-white/60">
                  {formatDate(inquiry.createdAt)}
                </td>
                <td className="px-4 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink dark:text-cream">
                      {inquiry.name}
                    </p>
                    <a
                      href={`mailto:${inquiry.email}`}
                      className="block truncate text-pine underline-offset-2 hover:underline dark:text-emerald-300"
                    >
                      {inquiry.email}
                    </a>
                    {inquiry.phone ? (
                      <p className="text-xs text-muted dark:text-white/45">
                        {inquiry.phone}
                      </p>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Badge tone={projectTone(inquiry.projectType)}>
                    {inquiry.projectType ?? "Not specified"}
                  </Badge>
                </td>
                <td className="max-w-[34rem] whitespace-pre-wrap break-words px-4 py-4 text-muted dark:text-white/70">
                  {inquiry.message}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Mobile cards */}
      <ul className="grid gap-3 lg:hidden">
        {inquiries.map((inquiry) => (
          <li key={inquiry.id}>
            <Card className="grid gap-2.5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-ink dark:text-cream">
                  {inquiry.name}
                </p>
                <Badge tone={projectTone(inquiry.projectType)}>
                  {inquiry.projectType ?? "Not specified"}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted dark:text-white/55">
                <a
                  href={`mailto:${inquiry.email}`}
                  className="text-pine underline-offset-2 hover:underline dark:text-emerald-300"
                >
                  {inquiry.email}
                </a>
                <span>{formatDate(inquiry.createdAt)}</span>
              </div>
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-ink/80 dark:text-cream/80">
                {inquiry.message}
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

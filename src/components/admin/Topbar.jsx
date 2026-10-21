"use client";

// Dashboard top bar: mobile menu toggle, breadcrumbs, and identity.
// Breadcrumbs are derived from the pathname via the shared nav config,
// so they always match the sidebar's active section.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconMenu, IconChevronRight, IconExternal } from "@/components/ui/icons.jsx";
import { SEGMENT_LABELS } from "./nav.js";

function buildBreadcrumbs(pathname) {
  const crumbs = [{ label: "Dashboard", href: "/admin" }];
  const segments = pathname.split("/").filter(Boolean).slice(1); // drop "admin"

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;
    const label =
      SEGMENT_LABELS[segment] ??
      // Dynamic [slug] segment — show a friendly label.
      (isLast && index === segments.length - 1 ? "Edit work" : segment);
    const href = isLast
      ? undefined
      : `/admin/${segments.slice(0, index + 1).join("/")}`;
    crumbs.push({ label: label.charAt(0).toUpperCase() + label.slice(1), href });
  });

  return crumbs;
}

function initials(name) {
  const parts = (name || "?").split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "");
}

export default function Topbar({ user, onOpenMenu }) {
  const pathname = usePathname();
  const crumbs = buildBreadcrumbs(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-sand/70 bg-cream/85 backdrop-blur-md dark:border-white/10 dark:bg-[#161310]/85">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Mobile drawer trigger */}
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open dashboard menu"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-sand bg-white text-muted transition-colors hover:text-ink dark:border-white/15 dark:bg-white/5 dark:text-white/70 dark:hover:text-white lg:hidden"
        >
          <IconMenu className="h-5 w-5" />
        </button>

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
          <ol className="flex min-w-0 items-center gap-1.5 text-sm">
            {crumbs.map((crumb, index) => {
              const isLast = index === crumbs.length - 1;
              return (
                <li
                  key={`${crumb.label}-${index}`}
                  className="flex min-w-0 items-center gap-1.5"
                >
                  {index > 0 ? (
                    <IconChevronRight
                      aria-hidden="true"
                      className="h-3.5 w-3.5 shrink-0 text-ink/30 dark:text-white/30"
                    />
                  ) : null}
                  {isLast ? (
                    <span
                      aria-current="page"
                      className="truncate font-semibold text-ink dark:text-cream"
                    >
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="truncate text-muted transition-colors hover:text-ink dark:text-white/55 dark:hover:text-white"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Mobile-only site link */}
        <a
          href="/"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-sand bg-white px-3 py-1.5 text-xs font-bold text-muted transition-colors hover:text-ink dark:border-white/15 dark:bg-white/5 dark:text-white/70 dark:hover:text-white lg:hidden"
        >
          View site
          <IconExternal aria-hidden="true" className="h-3.5 w-3.5" />
        </a>

        {/* Identity chip (desktop; sidebar shows full info) */}
        <div className="hidden shrink-0 items-center gap-2.5 rounded-full border border-sand bg-white py-1 pl-1 pr-3.5 dark:border-white/15 dark:bg-white/5 lg:flex">
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-pine text-[0.7rem] font-bold uppercase text-white"
          >
            {initials(user?.name)}
          </span>
          <span className="max-w-[14ch] truncate text-xs font-bold text-ink dark:text-cream">
            {user?.name}
          </span>
          <span className="rounded-full bg-pine/10 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-pine ring-1 ring-pine/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-300/25">
            Admin
          </span>
        </div>
      </div>
    </header>
  );
}

"use client";

// Dashboard sidebar navigation. Rendered twice: docked on desktop
// (lg+) and inside the mobile drawer — same items, same active logic.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_SECTIONS } from "./nav.js";

function isActive(pathname, item) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function initials(name) {
  const parts = (name || "?").split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "");
}

export default function Sidebar({
  user,
  badges = {},
  onNavigate,
  className = "",
  id,
}) {
  const pathname = usePathname();

  return (
    <div
      id={id}
      className={`flex h-full flex-col bg-coal text-clay dark:bg-[#100e0b] ${className}`}
    >
      {/* Brand block */}
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pine text-xs font-bold tracking-widest text-white"
        >
          BA
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">
            {user?.name ?? "Studio"}
          </p>
          <p className="truncate text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/45">
            Admin dashboard
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav aria-label="Dashboard" className="flex-1 overflow-y-auto p-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-4 last:mb-0">
            <p className="px-3 pb-2 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/35">
              {section.label}
            </p>
            <ul className="grid gap-1">
              {section.items.map((item) => {
                const active = isActive(pathname, item);
                const Icon = item.icon;
                const count = item.badgeKey ? badges[item.badgeKey] : 0;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={onNavigate}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-clay/70 ${
                        active
                          ? "bg-white/10 text-white shadow-[inset_3px_0_0_0_var(--color-pine)]"
                          : "text-clay hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon
                        aria-hidden="true"
                        className={`h-5 w-5 shrink-0 transition-colors ${
                          active
                            ? "text-clay"
                            : "text-white/45 group-hover:text-clay"
                        }`}
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {item.label}
                      </span>
                      {count > 0 ? (
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[0.7rem] font-bold tabular-nums ${
                            active
                              ? "bg-pine text-white"
                              : "bg-white/10 text-white/70 group-hover:bg-white/15"
                          }`}
                        >
                          {count}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer: role + view site */}
      <div className="grid gap-3 border-t border-white/10 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[0.7rem] font-bold uppercase text-white"
          >
            {initials(user?.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-white/85">
              {user?.email}
            </p>
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-emerald-300/80">
              {user?.role === "ADMIN" ? "Administrator" : "Member"}
            </p>
          </div>
        </div>
        <a
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white/75 transition-colors hover:border-white/40 hover:text-white"
        >
          View public site ↗
        </a>
      </div>
    </div>
  );
}

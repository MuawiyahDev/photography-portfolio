"use client";

// Header auth controls: "Sign in / Sign up" when signed out; when
// signed in, the user's name opens a dropdown with Dashboard
// (admins only) and Sign out. The session itself lives in the
// HTTP-only cookie — this only reflects the server's state.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

function initials(session) {
  const source = session.user.name || session.user.email || "?";
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  return (parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "");
}

export default function AuthNav() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close when clicking anywhere outside the menu.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Close on Escape and return focus to the trigger button.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuRef.current?.querySelector("button")?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // While the session cookie is being checked, keep the layout stable.
  if (status === "loading") {
    return (
      <span
        aria-hidden="true"
        className="block h-9 w-24 animate-pulse rounded-full bg-sand dark:bg-white/10"
      />
    );
  }

  if (session?.user) {
    const isAdmin = session.user.role === "ADMIN";
    const displayName = session.user.name || session.user.email;

    const handleSignOut = async () => {
      setOpen(false);
      await signOut({ redirect: false });
      router.push("/");
      router.refresh();
    };

    return (
      <div ref={menuRef} className="relative">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Account menu"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex max-w-[18ch] items-center gap-2 rounded-full border border-sand bg-white py-1.5 pl-1.5 pr-3 text-sm font-semibold text-ink transition-all hover:-translate-y-px hover:border-ink dark:border-white/15 dark:bg-white/5 dark:text-cream dark:hover:border-white/40"
        >
          <span
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pine text-[0.7rem] font-bold uppercase text-white"
          >
            {initials(session)}
          </span>
          <span className="truncate">{displayName}</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 12 12"
            className={`h-2.5 w-2.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 4l4 4 4-4" />
          </svg>
        </button>

        {open ? (
          <div
            role="menu"
            aria-label="Account"
            className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl bg-white p-1.5 shadow-xl ring-1 ring-black/10 dark:bg-[#211c16] dark:ring-white/10"
          >
            <p className="truncate px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-muted dark:text-white/45">
              {session.user.email}
            </p>
            {isAdmin ? (
              <Link
                href="/admin"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-cream dark:text-cream dark:hover:bg-white/10"
              >
                Dashboard
              </Link>
            ) : null}
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-error transition-colors hover:bg-red-50 dark:hover:bg-red-400/10"
            >
              Sign out
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="inline-flex items-center justify-center rounded-full border border-sand bg-white px-4 py-2 text-sm font-semibold text-muted transition-all hover:-translate-y-px hover:border-ink hover:text-ink dark:border-white/15 dark:bg-white/5 dark:text-white/70 dark:hover:border-white/40 dark:hover:text-white"
      >
        Sign in
      </Link>
      <Link
        href="/register"
        className="inline-flex items-center justify-center rounded-full bg-coal px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-pine dark:bg-cream dark:text-coal dark:hover:bg-white"
      >
        Sign up
      </Link>
    </div>
  );
}

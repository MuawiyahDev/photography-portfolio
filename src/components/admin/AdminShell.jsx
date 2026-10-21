"use client";

// Client shell for the whole dashboard: docked sidebar (lg+),
// top bar with breadcrumbs, mobile drawer, and the toast viewport.
// The server layout performs access control before rendering this.
import { useEffect, useState } from "react";
import { ToastProvider } from "@/components/ui/Toast.jsx";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function AdminShell({ user, badges, children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Lock page scroll and close on Escape while the drawer is open.
  useEffect(() => {
    if (!drawerOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  return (
    <ToastProvider>
      {/* Full-viewport app shell: docked sidebar + independently scrolling main column */}
      <div className="flex h-dvh bg-cream dark:bg-[#161310] lg:flex-row">
        {/* Docked sidebar (desktop) — fills the screen height */}
        <Sidebar
          user={user}
          badges={badges}
          className="hidden h-full w-64 shrink-0 lg:flex"
        />

        {/* Mobile drawer */}
        {drawerOpen ? (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <button
              type="button"
              aria-label="Close dashboard menu"
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 cursor-default bg-coal/60 backdrop-blur-[2px]"
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Dashboard menu"
              className="absolute inset-y-0 left-0 w-72 max-w-[85vw] animate-[drawer-in_0.2s_ease-out] shadow-2xl"
            >
              <button
                type="button"
                aria-label="Close dashboard menu"
                onClick={() => setDrawerOpen(false)}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
              <Sidebar
                user={user}
                badges={badges}
                onNavigate={() => setDrawerOpen(false)}
                className="h-full"
              />
            </div>
          </div>
        ) : null}

        {/* Main column — scrolls on its own; topbar sticks at its top */}
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <Topbar user={user} onOpenMenu={() => setDrawerOpen(true)} />
          <main
            id="admin-content"
            className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
          >
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}

"use client";

import { useEffect, useState } from "react";
import { NAV_LINKS } from "../data/site.js";
import AuthNav from "./AuthNav.jsx";
import Button from "./ui/Button.jsx";
import Container from "./ui/Container.jsx";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-sand bg-cream/90 backdrop-blur-md dark:border-white/10 dark:bg-[#161310]/90">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded-md focus:bg-coal focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <Container className="flex h-[4.25rem] items-center justify-between gap-4">
        <a
          href="/#home"
          aria-label="Bilal Ahmed — home"
          className="flex min-w-0 items-center gap-2.5 font-display text-lg text-ink no-underline dark:text-cream"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-coal text-xs tracking-widest text-white dark:bg-cream dark:text-coal"
          >
            BA
          </span>
          <span className="truncate">
            Bilal Ahmed
            <em className="block font-sans text-[0.68rem] font-normal uppercase tracking-[0.22em] text-muted not-italic leading-tight dark:text-white/55">
              Photography
            </em>
          </span>
        </a>

        <nav aria-label="Primary" className="flex items-center">
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="nav-list"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-lg border border-sand bg-transparent p-2.5 dark:border-white/15 md:hidden"
          >
            <span
              aria-hidden="true"
              className={`block h-0.5 w-full rounded bg-ink transition-transform dark:bg-cream ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`}
            />
            <span
              aria-hidden="true"
              className={`block h-0.5 w-full rounded bg-ink transition-opacity dark:bg-cream ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              aria-hidden="true"
              className={`block h-0.5 w-full rounded bg-ink transition-transform dark:bg-cream ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
            />
          </button>

          <ul
            id="nav-list"
            className={`${
              menuOpen ? "flex" : "hidden"
            } absolute inset-x-0 top-[4.25rem] flex-col items-stretch gap-0 border-b border-sand bg-white px-4 pb-4 pt-2 dark:border-white/10 dark:bg-[#1e1a15] sm:px-6 md:static md:flex md:flex-row md:items-center md:gap-7 md:border-0 md:bg-transparent md:p-0 dark:md:bg-transparent lg:px-8`}
          >
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="border-t border-sand first:border-0 dark:border-white/10 md:border-0">
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="relative block py-3 text-xs font-bold uppercase tracking-[0.14em] text-muted no-underline transition-colors hover:text-ink dark:text-white/60 dark:hover:text-white md:py-2"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="border-t border-sand first:border-0 dark:border-white/10 md:border-0">
              <AuthNav />
            </li>
            <li className="pt-3 md:pt-0">
              <Button href="/#contact" variant="dark" size="sm" className="w-full md:w-auto">
                Book a Shoot
              </Button>
            </li>
          </ul>
        </nav>
      </Container>
    </header>
  );
}

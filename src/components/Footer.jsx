import { NAV_LINKS } from "../data/site.js";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-coal py-8 text-clay">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-4 px-4 sm:px-6 lg:px-8">
        <p className="font-display text-lg text-white">
          Bilal Ahmed
          <span className="ml-2 font-sans text-xs uppercase tracking-[0.2em] text-clay">
            Photography
          </span>
        </p>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-clay no-underline transition-colors hover:text-white"
                >
                  {link.label === "Contact" ? "Book a Shoot" : link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="basis-full text-sm">
          © {year} Bilal Ahmed. All photographs by the artist.
        </p>
      </div>
    </footer>
  );
}

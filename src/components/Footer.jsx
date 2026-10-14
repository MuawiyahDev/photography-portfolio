import { CONTACT_DETAILS, NAV_LINKS } from "../data/site.js";
import Container from "./ui/Container.jsx";

export default function Footer() {
  const year = new Date().getFullYear();
  const email = CONTACT_DETAILS.find((item) => item.type === "email");

  return (
    <footer className="border-t border-white/10 bg-coal text-clay dark:bg-[#100e0b]">
      <Container className="py-12 sm:py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="min-w-0">
            <p className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-xs tracking-widest text-coal"
              >
                BA
              </span>
              <span className="font-display text-lg text-white">
                Bilal Ahmed
                <span className="ml-2 font-sans text-xs uppercase tracking-[0.2em] text-clay">
                  Photography
                </span>
              </span>
            </p>
            <p className="mt-4 max-w-[38ch] text-sm leading-relaxed">
              Portraits, editorial stories, and fine-art commissions — shot in
              natural light from Portland, available worldwide.
            </p>
            {email?.href ? (
              <a
                href={email.href}
                className="mt-4 inline-block text-sm font-semibold text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white"
              >
                {email.value}
              </a>
            ) : null}
          </div>

          <nav aria-label="Footer">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">
              Explore
            </p>
            <ul className="mt-4 grid gap-2.5">
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

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">
              Studio
            </p>
            <ul className="mt-4 grid gap-2.5 text-sm">
              {CONTACT_DETAILS.filter((item) => item.type !== "email").map(
                (item) => (
                  <li key={item.label} className="min-w-0">
                    <span className="block text-[0.7rem] font-bold uppercase tracking-[0.14em] text-white/40">
                      {item.label}
                    </span>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="break-all text-clay no-underline transition-colors hover:text-white"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <span>{item.value}</span>
                    )}
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Bilal Ahmed. All photographs by the artist.</p>
          <a
            href="#home"
            className="inline-flex items-center gap-1.5 self-start font-semibold text-clay no-underline transition-colors hover:text-white sm:self-auto"
          >
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </div>
      </Container>
    </footer>
  );
}

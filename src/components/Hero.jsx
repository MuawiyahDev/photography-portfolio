import { HERO_IMAGE, HERO_STATS, PRESS_LIST } from "../data/site.js";
import Button from "./ui/Button.jsx";
import Eyebrow from "./ui/Eyebrow.jsx";

export default function Hero() {
  return (
    <section id="home" aria-labelledby="hero-heading" className="pb-8 pt-10 sm:pt-14 lg:pt-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-stretch gap-8 md:flex-row md:items-center lg:gap-16">
          <div className="min-w-0 flex-1">
            <Eyebrow>Photographer &amp; Visual Artist — Portland / Available worldwide</Eyebrow>
            <h1
              id="hero-heading"
              className="mb-4 font-display text-4xl font-medium leading-[1.08] tracking-tight text-balance sm:text-5xl lg:text-6xl"
            >
              Light, form &amp; quiet moments.
            </h1>
            <p className="mb-7 max-w-[65ch] text-lg text-muted">
              I&rsquo;m Bilal Ahmed. I photograph people, places, and the in-between —
              portraits and editorial stories told with natural light and a calm,
              minimal eye.
            </p>

            <div className="mb-9 flex flex-wrap gap-3">
              <Button href="#work" variant="primary">
                View Portfolio
              </Button>
              <Button href="#contact" variant="ghost">
                Book a Shoot
              </Button>
            </div>

            <dl className="flex flex-wrap gap-x-8 gap-y-4 border-t border-sand pt-5 sm:gap-x-12">
              {HERO_STATS.map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <dt className="order-2 text-xs uppercase tracking-wider text-muted">
                    {stat.label}
                  </dt>
                  <dd className="order-1 font-display text-2xl leading-tight sm:text-3xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <figure className="m-0 min-w-0 flex-1">
            <img
              src={HERO_IMAGE.src}
              alt={HERO_IMAGE.alt}
              width={HERO_IMAGE.width}
              height={HERO_IMAGE.height}
              fetchPriority="high"
              className="aspect-[4/5] w-full rounded-[0.625rem] object-cover"
            />
            <figcaption className="mt-2.5 text-sm text-muted">{HERO_IMAGE.caption}</figcaption>
          </figure>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-9 gap-y-3 border-y border-sand py-5">
          <span className="whitespace-nowrap text-[0.72rem] font-bold uppercase tracking-[0.24em] text-muted">
            As featured in
          </span>
          <ul
            aria-label="Publications featuring this work"
            className="flex flex-wrap items-center justify-center gap-y-2 font-display text-lg tracking-wide"
          >
            {PRESS_LIST.map((name, index) => (
              <li key={name} className="flex items-center whitespace-nowrap">
                {index > 0 && (
                  <span
                    aria-hidden="true"
                    className="mx-4 h-1.5 w-1.5 shrink-0 rounded-full bg-pine/50 sm:mx-7"
                  />
                )}
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

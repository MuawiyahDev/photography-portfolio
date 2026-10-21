import Button from "./ui/Button.jsx";
import Container from "./ui/Container.jsx";
import Eyebrow from "./ui/Eyebrow.jsx";

/**
 * Hero section. All copy, CTAs, stats, press list, and the image come
 * from the `content` prop — the "hero" row of the SiteSetting table,
 * edited in the admin dashboard.
 */
export default function Hero({ content }) {
  return (
    <section id="home" aria-labelledby="hero-heading" className="pb-8 pt-10 sm:pt-14 lg:pt-20">
      <Container>
        <div className="flex flex-col items-stretch gap-8 md:flex-row md:items-center lg:gap-16">
          <div className="min-w-0 flex-1">
            <Eyebrow>{content.eyebrow}</Eyebrow>
            <h1
              id="hero-heading"
              className="mb-4 font-display text-4xl font-medium leading-[1.08] tracking-tight text-balance sm:text-5xl lg:text-6xl"
            >
              {content.heading}
            </h1>
            <p className="mb-7 max-w-[65ch] text-lg text-muted dark:text-white/60">
              {content.subheading}
            </p>

            <div className="mb-9 flex flex-wrap gap-3">
              <Button href={content.primaryCta.href} variant="primary">
                {content.primaryCta.text}
              </Button>
              <Button href={content.secondaryCta.href} variant="ghost">
                {content.secondaryCta.text}
              </Button>
            </div>

            <dl className="flex flex-wrap gap-x-8 gap-y-4 border-t border-sand pt-5 dark:border-white/10 sm:gap-x-12">
              {content.stats.map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <dt className="order-2 text-xs uppercase tracking-wider text-muted dark:text-white/55">
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
              src={content.image.src}
              alt={content.image.alt}
              width={content.image.width}
              height={content.image.height}
              fetchPriority="high"
              className="aspect-[4/5] w-full rounded-[0.625rem] object-cover"
            />
            <figcaption className="mt-2.5 text-sm text-muted dark:text-white/55">{content.image.caption}</figcaption>
          </figure>
        </div>

        {content.press.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-9 gap-y-3 border-y border-sand py-5 dark:border-white/10">
            <span className="whitespace-nowrap text-[0.72rem] font-bold uppercase tracking-[0.24em] text-muted dark:text-white/55">
              As featured in
            </span>
            <ul
              aria-label="Publications featuring this work"
              className="flex flex-wrap items-center justify-center gap-y-2 font-display text-lg tracking-wide"
            >
              {content.press.map((name, index) => (
                <li key={name} className="flex items-center whitespace-nowrap">
                  {index > 0 && (
                    <span
                      aria-hidden="true"
                      className="mx-4 h-1.5 w-1.5 shrink-0 rounded-full bg-pine/50 dark:bg-emerald-300/50 sm:mx-7"
                    />
                  )}
                  {name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Container>
    </section>
  );
}

import Container from "./ui/Container.jsx";
import Eyebrow from "./ui/Eyebrow.jsx";

/**
 * About section. Copy, CTA, and image come from the "about"
 * SiteSetting row, edited in the admin dashboard.
 */
export default function About({ content }) {
  return (
    <section id="about" aria-labelledby="about-heading" className="py-14 sm:py-20">
      <Container className="flex flex-col items-stretch gap-8 md:flex-row md:items-center lg:gap-16">
        <figure className="m-0 min-w-0 shrink-0 md:basis-80 lg:basis-96">
          <img
            src={content.image.src}
            alt={content.image.alt}
            width={content.image.width}
            height={content.image.height}
            loading="lazy"
            className="aspect-[4/5] w-full max-w-md rounded-[0.625rem] object-cover"
          />
        </figure>
        <div className="min-w-0 flex-1">
          <Eyebrow>{content.eyebrow}</Eyebrow>
          <h2
            id="about-heading"
            className="mb-4 font-display text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl"
          >
            {content.heading}
          </h2>
          {content.paragraphs.map((paragraph, index) => (
            <p key={index} className="max-w-[65ch] [&:not(:first-of-type)]:mt-4">
              {paragraph}
            </p>
          ))}
          <a
            href={content.ctaHref}
            className="mt-6 inline-block font-semibold text-pine underline underline-offset-4 dark:text-emerald-300"
          >
            {content.ctaText}
          </a>
        </div>
      </Container>
    </section>
  );
}

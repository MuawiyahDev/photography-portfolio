import { ABOUT_IMAGE } from "../data/site.js";
import Container from "./ui/Container.jsx";
import Eyebrow from "./ui/Eyebrow.jsx";

export default function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="py-14 sm:py-20">
      <Container className="flex flex-col items-stretch gap-8 md:flex-row md:items-center lg:gap-16">
        <figure className="m-0 min-w-0 shrink-0 md:basis-80 lg:basis-96">
          <img
            src={ABOUT_IMAGE.src}
            alt={ABOUT_IMAGE.alt}
            width={ABOUT_IMAGE.width}
            height={ABOUT_IMAGE.height}
            loading="lazy"
            className="aspect-[4/5] w-full max-w-md rounded-[0.625rem] object-cover"
          />
        </figure>
        <div className="min-w-0 flex-1">
          <Eyebrow>About</Eyebrow>
          <h2
            id="about-heading"
            className="mb-4 font-display text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl"
          >
            A calm eye for real life.
          </h2>
          <p className="max-w-[65ch]">
            I&rsquo;m Bilal Ahmed, a photographer and visual artist based in
            Portland. For the past twelve years I&rsquo;ve shot portraits,
            editorials, and spaces — always chasing honest light and unforced
            moments.
          </p>
          <p className="mt-4 max-w-[65ch]">
            My work has appeared in print and on gallery walls, but most days
            you&rsquo;ll find me on location with a small crew: one camera,
            available light, and room for people to be themselves.
          </p>
          <a
            href="#contact"
            className="mt-6 inline-block font-semibold text-pine underline underline-offset-4"
          >
            Tell me about your project →
          </a>
        </div>
      </Container>
    </section>
  );
}

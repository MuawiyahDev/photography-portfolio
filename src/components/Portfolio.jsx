import { useMemo, useState } from "react";
import { CATEGORIES, WORKS } from "../data/works.js";
import Button from "./ui/Button.jsx";
import Container from "./ui/Container.jsx";
import Eyebrow from "./ui/Eyebrow.jsx";
import GalleryCard from "./GalleryCard.jsx";

export default function Portfolio() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredWorks = useMemo(
    () =>
      activeFilter === "all"
        ? WORKS
        : WORKS.filter((work) => work.category === activeFilter),
    [activeFilter],
  );

  const activeLabel =
    activeFilter === "all"
      ? "all"
      : (CATEGORIES.find((c) => c.value === activeFilter)?.label ?? activeFilter);

  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="border-y border-sand bg-white py-14 sm:py-20 lg:py-24"
    >
      <Container>
        <div className="mb-8 flex flex-col gap-6 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <Eyebrow>Selected work 2019–2026</Eyebrow>
            <h2
              id="work-heading"
              className="font-display text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl"
            >
              Portfolio
            </h2>
            <p className="mt-3 max-w-[65ch] text-muted">
              A small edit across portraits, editorial, architecture, street,
              nature, and fine art. Use the filters to browse by series.
            </p>
          </div>
          <Button
            href="#contact"
            variant="ghost"
            className="shrink-0 self-start lg:self-auto"
          >
            Commission a series
          </Button>
        </div>

        <div
          role="group"
          aria-label="Filter gallery by category"
          className="mb-3 flex flex-wrap gap-2"
        >
          {CATEGORIES.map((category) => {
            const isActive = category.value === activeFilter;
            return (
              <button
                key={category.value}
                type="button"
                onClick={() => setActiveFilter(category.value)}
                aria-pressed={isActive}
                className={`rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition-colors ${
                  isActive
                    ? "border-coal bg-coal text-white"
                    : "border-sand bg-white text-muted hover:border-ink hover:text-ink"
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        <p role="status" className="mb-6 text-sm text-muted">
          {filteredWorks.length === 0 ? (
            "No works in this series yet."
          ) : (
            <>
              Showing{" "}
              <strong className="font-semibold text-ink">
                {filteredWorks.length} of {WORKS.length}
              </strong>{" "}
              works — {activeLabel}.
            </>
          )}
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:auto-rows-[15rem] sm:gap-5 sm:[grid-auto-flow:dense] lg:grid-cols-4">
          {filteredWorks.map((work) => (
            <GalleryCard key={work.id} work={work} />
          ))}
        </div>
      </Container>
    </section>
  );
}

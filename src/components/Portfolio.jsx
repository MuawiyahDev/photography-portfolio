import { useMemo, useState } from "react";
import { CATEGORIES, WORKS } from "../data/works.js";
import Button from "./ui/Button.jsx";
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
      className="border-y border-sand bg-white py-14 sm:py-20"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
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
          <Button href="#contact" variant="ghost" className="shrink-0 self-start md:self-auto">
            Commission a series
          </Button>
        </div>

        <div role="group" aria-label="Filter gallery by category" className="mb-3 flex flex-wrap gap-2">
          {CATEGORIES.map((category) => {
            const isActive = category.value === activeFilter;
            return (
              <button
                key={category.value}
                type="button"
                onClick={() => setActiveFilter(category.value)}
                aria-pressed={isActive}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "border-coal bg-coal text-white"
                    : "border-sand bg-transparent text-muted hover:border-ink hover:text-ink"
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        <p role="status" className="mb-6 text-sm text-muted">
          {filteredWorks.length === 0
            ? "No works in this series yet."
            : `Showing ${filteredWorks.length} of ${WORKS.length} works — ${activeLabel}.`}
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:[grid-auto-rows:16rem] lg:grid-cols-4 lg:[grid-auto-rows:13.75rem] lg:[grid-auto-flow:dense]">
          {filteredWorks.map((work) => (
            <GalleryCard key={work.id} work={work} />
          ))}
        </div>
      </div>
    </section>
  );
}

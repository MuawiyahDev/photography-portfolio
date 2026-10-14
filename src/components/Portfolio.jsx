import { useMemo, useState } from "react";
import { CATEGORIES, WORKS } from "../data/works.js";
import useFavorites from "../hooks/useFavorites.js";
import Button from "./ui/Button.jsx";
import Container from "./ui/Container.jsx";
import Eyebrow from "./ui/Eyebrow.jsx";
import FilterTabs from "./FilterTabs.jsx";
import GalleryCard from "./GalleryCard.jsx";
import HeartIcon from "./ui/HeartIcon.jsx";

export default function Portfolio() {
  const [activeFilter, setActiveFilter] = useState("all");
  const { favorites, favoriteCount, toggleFavorite, isFavorite } =
    useFavorites();

  const isFavoritesView = activeFilter === "favorites";

  const filteredWorks = useMemo(() => {
    if (isFavoritesView) {
      return WORKS.filter((work) => favorites.includes(work.id));
    }
    return activeFilter === "all"
      ? WORKS
      : WORKS.filter((work) => work.category === activeFilter);
  }, [activeFilter, isFavoritesView, favorites]);

  const activeLabel = isFavoritesView
    ? "favorites"
    : activeFilter === "all"
      ? "all"
      : (CATEGORIES.find((c) => c.value === activeFilter)?.label ??
        activeFilter);

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
              nature, and fine art. Use the filters to browse by series — tap
              the heart to save works to your favorites.
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

        <FilterTabs
          active={activeFilter}
          onChange={setActiveFilter}
          favoriteCount={favoriteCount}
        />

        <p role="status" className="mb-6 text-sm text-muted">
          {filteredWorks.length === 0 ? (
            isFavoritesView ? (
              "No saved works yet."
            ) : (
              "No works in this series yet."
            )
          ) : (
            <>
              Showing{" "}
              <strong className="font-semibold text-ink">
                {filteredWorks.length} of {isFavoritesView ? favoriteCount : WORKS.length}
              </strong>{" "}
              works — {activeLabel}.
            </>
          )}
        </p>

        {filteredWorks.length === 0 && isFavoritesView ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-sand bg-cream/60 px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-600/10 text-rose-500">
              <HeartIcon filled={false} size={26} />
            </span>
            <p className="font-display text-2xl font-medium text-ink">
              No favorites yet
            </p>
            <p className="max-w-[42ch] text-sm text-muted">
              Tap the heart on any photo to save it here — your picks are kept
              on this device, even after a refresh.
            </p>
            <Button
              variant="primary"
              onClick={() => setActiveFilter("all")}
              className="mt-2"
            >
              Browse all works
            </Button>
          </div>
        ) : (
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">
            {filteredWorks.map((work) => (
              <GalleryCard
                key={work.id}
                work={work}
                liked={isFavorite(work.id)}
                onToggleLike={toggleFavorite}
              />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

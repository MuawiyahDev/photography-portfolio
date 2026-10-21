"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "./ui/Button.jsx";
import Container from "./ui/Container.jsx";
import Eyebrow from "./ui/Eyebrow.jsx";
import FilterTabs from "./FilterTabs.jsx";
import GalleryCard from "./GalleryCard.jsx";
import HeartIcon from "./ui/HeartIcon.jsx";

export default function Portfolio({
  works,
  categories = [],
  initialFavorites = [],
  initialRatings = {},
  signedIn = false,
}) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("all");

  // Favorites and ratings live in PostgreSQL, read on the server and
  // passed down (along with `signedIn`, so heart/star clicks never
  // wait on a client-side session fetch — the first click works).
  const [favorites, setFavorites] = useState(initialFavorites);
  const [ratings, setRatings] = useState(initialRatings);
  // Slugs with a request in flight — their hearts show a spinner.
  const [pending, setPending] = useState(() => new Set());

  // Re-sync when the server re-renders the page (e.g. after login/logout).
  useEffect(() => {
    setFavorites(initialFavorites);
    setRatings(initialRatings);
  }, [initialFavorites, initialRatings]);

  const favoriteCount = favorites.length;

  const setPendingSlug = (id, on) =>
    setPending((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const handleToggleFavorite = async (id) => {
    // This heart is already syncing — its spinner shows that.
    if (pending.has(id)) return;

    // Favorites belong to an account — go sign in.
    if (!signedIn) {
      router.push("/login");
      return;
    }

    // Optimistic update: flip the heart immediately…
    const previous = favorites;
    const willBeFavorite = !previous.includes(id);
    setFavorites(
      willBeFavorite
        ? [...previous, id]
        : previous.filter((fav) => fav !== id),
    );
    setPendingSlug(id, true);

    try {
      const response = await fetch("/api/favorites", {
        method: willBeFavorite ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: id }),
      });

      if (response.ok) {
        // …then trust the server's answer as the final state.
        const data = await response.json();
        setFavorites((prev) =>
          data.favorited
            ? prev.includes(id)
              ? prev
              : [...prev, id]
            : prev.filter((fav) => fav !== id),
        );
      } else {
        setFavorites(previous); // roll back the optimistic update
        // Session expired mid-click → send them to login.
        if (response.status === 401) router.push("/login");
      }
    } catch {
      setFavorites(previous); // network error → roll back
    } finally {
      setPendingSlug(id, false);
    }
  };

  const handleRate = async (id, next) => {
    // Ratings belong to an account — same rule as the wishlist hearts.
    if (!signedIn) {
      router.push("/login");
      return;
    }

    // Optimistic update: move the stars immediately…
    const previous = ratings;
    setRatings((prev) => {
      const updated = { ...prev };
      if (next === 0) delete updated[id];
      else updated[id] = next;
      return updated;
    });

    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: id, value: next }),
      });

      if (response.ok) {
        // …then trust the server's answer as the final state.
        const data = await response.json();
        setRatings((prev) => {
          const updated = { ...prev };
          if (data.value === 0) delete updated[data.slug];
          else updated[data.slug] = data.value;
          return updated;
        });
      } else {
        setRatings(previous); // roll back the optimistic update
        // Session expired mid-click → send them to login.
        if (response.status === 401) router.push("/login");
      }
    } catch {
      setRatings(previous); // network error → roll back
    }
  };

  const isFavoritesView = activeFilter === "favorites";

  const filteredWorks = useMemo(() => {
    if (isFavoritesView) {
      return works.filter((work) => favorites.includes(work.id));
    }
    return activeFilter === "all"
      ? works
      : works.filter((work) => work.category === activeFilter);
  }, [activeFilter, isFavoritesView, favorites, works]);

  const activeLabel = isFavoritesView
    ? "favorites"
    : activeFilter === "all"
      ? "all"
      : (categories.find((c) => c.slug === activeFilter)?.label ??
        activeFilter);

  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="border-y border-sand bg-white py-14 dark:border-white/10 dark:bg-[#1a1611] sm:py-20 lg:py-24"
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
            <p className="mt-3 max-w-[65ch] text-muted dark:text-white/60">
              A small edit across portraits, editorial, architecture, street,
              nature, and fine art. Use the filters to browse by series — tap
              the heart to save works to your favorites.
            </p>
          </div>
          <Button
            href="/#contact"
            variant="ghost"
            className="shrink-0 self-start lg:self-auto"
          >
            Commission a series
          </Button>
        </div>

        <FilterTabs
          categories={categories}
          active={activeFilter}
          onChange={setActiveFilter}
          favoriteCount={favoriteCount}
        />

        <p role="status" className="mb-6 text-sm text-muted dark:text-white/60">
          {filteredWorks.length === 0 ? (
            isFavoritesView ? (
              "No saved works yet."
            ) : (
              "No works in this series yet."
            )
          ) : (
            <>
              Showing{" "}
              <strong className="font-semibold text-ink dark:text-cream">
                {filteredWorks.length} of {isFavoritesView ? favoriteCount : works.length}
              </strong>{" "}
              works — {activeLabel}.
            </>
          )}
        </p>

        {filteredWorks.length === 0 && isFavoritesView ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-sand bg-cream/60 px-6 py-14 text-center dark:border-white/15 dark:bg-white/[0.03]">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-600/10 text-rose-500">
              <HeartIcon filled={false} size={26} />
            </span>
            <p className="font-display text-2xl font-medium text-ink dark:text-cream">
              No favorites yet
            </p>
            <p className="max-w-[42ch] text-sm text-muted dark:text-white/60">
              {!signedIn
                ? "Sign in to save your favorite works — they stay with your account on any device."
                : "Tap the heart on any photo to save it here — your picks are saved to your account and follow you on any device."}
            </p>
            {!signedIn ? (
              <Button
                variant="primary"
                onClick={() => router.push("/login")}
                className="mt-2"
              >
                Sign in to save favorites
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => setActiveFilter("all")}
                className="mt-2"
              >
                Browse all works
              </Button>
            )}
          </div>
        ) : (
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">
            {filteredWorks.map((work) => (
              <GalleryCard
                key={work.id}
                work={work}
                liked={favorites.includes(work.id)}
                onToggleLike={handleToggleFavorite}
                busy={pending.has(work.id)}
                rating={ratings[work.id] ?? 0}
                onRate={handleRate}
              />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

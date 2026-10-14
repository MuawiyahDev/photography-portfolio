import { useState } from "react";
import { CATEGORY_LABELS } from "../data/works.js";
import StarRating from "./StarRating.jsx";

/**
 * Mosaic sizing — mobile-first:
 *   base: every card gets a natural photo aspect so single-column
 *         rows size themselves (no fixed heights, no cropping surprises)
 *   sm+:  grid auto-rows take over (aspect-auto), spans build the mosaic
 *   uniform (active while filtering): spans off so every visible card
 *         is the same size and no holes are left in the grid
 */
function figureClass(span, uniform) {
  if (!uniform && span === "wide")
    return "aspect-[16/10] sm:col-span-2 sm:aspect-auto";
  if (!uniform && span === "tall")
    return "aspect-[3/4] sm:row-span-2 sm:aspect-auto";
  return "aspect-[4/3] sm:aspect-auto";
}

export default function GalleryCard({ work, uniform = false }) {
  const [rating, setRating] = useState(0);
  const [liked, setLiked] = useState(false);

  return (
    <figure
      className={`group relative min-h-0 min-w-0 overflow-hidden rounded-xl bg-sand shadow-sm ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-xl ${figureClass(work.span, uniform)}`}
    >
      <img
        src={work.src}
        alt={work.alt}
        width={work.width}
        height={work.height}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />

      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
        <span className="rounded-full bg-black/45 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
          {CATEGORY_LABELS[work.category] ?? work.category}
        </span>
        <button
          type="button"
          onClick={() => setLiked((v) => !v)}
          aria-pressed={liked}
          aria-label={liked ? `Unlike ${work.title}` : `Like ${work.title}`}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base backdrop-blur-sm transition-colors ${
            liked
              ? "bg-black/55 text-red-400"
              : "bg-black/45 text-white/85 hover:bg-black/55 hover:text-white"
          }`}
        >
          <span aria-hidden="true">{liked ? "♥" : "♡"}</span>
        </button>
      </div>

      <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pt-12 text-white">
        <strong className="font-display text-lg font-medium leading-snug">
          {work.title}
        </strong>
        <StarRating
          value={rating}
          onChange={setRating}
          size="sm"
          label={`Rate ${work.title}`}
        />
      </figcaption>
    </figure>
  );
}

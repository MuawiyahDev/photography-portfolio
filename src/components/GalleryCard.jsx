import { useState } from "react";
import { CATEGORY_LABELS } from "../data/works.js";
import StarRating from "./StarRating.jsx";

function HeartIcon({ filled }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

/**
 * Fitted card: the image keeps its native aspect (h-auto), so square,
 * portrait, and landscape photos all render fully — never cropped,
 * never stretched. Used inside a CSS-columns masonry grid.
 */
export default function GalleryCard({ work }) {
  const [rating, setRating] = useState(0);
  const [liked, setLiked] = useState(false);

  return (
    <figure className="group relative mb-5 min-w-0 break-inside-avoid overflow-hidden rounded-xl bg-sand shadow-sm ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-xl">
      <img
        src={work.src}
        alt={work.alt}
        width={work.width}
        height={work.height}
        loading="lazy"
        className="h-auto w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      />

      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
        <span className="rounded-full bg-black/45 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-white ring-1 ring-white/20 backdrop-blur-md">
          {CATEGORY_LABELS[work.category] ?? work.category}
        </span>
        <button
          type="button"
          onClick={() => setLiked((v) => !v)}
          aria-pressed={liked}
          aria-label={liked ? `Unlike ${work.title}` : `Like ${work.title}`}
          title={liked ? "Liked" : "Like this work"}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-lg ring-1 ring-white/25 backdrop-blur-md transition-all duration-200 active:scale-90 ${
            liked
              ? "bg-rose-500/90 text-white hover:bg-rose-500"
              : "bg-black/45 text-white/90 hover:bg-black/60 hover:text-white"
          }`}
        >
          <HeartIcon filled={liked} />
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

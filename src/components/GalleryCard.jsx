import { useState } from "react";
import { CATEGORY_LABELS } from "../data/works.js";
import StarRating from "./StarRating.jsx";

function spanClass(span) {
  if (span === "wide") return "sm:col-span-2";
  if (span === "tall") return "sm:row-span-2";
  return "";
}

export default function GalleryCard({ work }) {
  const [rating, setRating] = useState(0);
  const [liked, setLiked] = useState(false);

  return (
    <figure className={`group relative min-h-0 min-w-0 overflow-hidden rounded-[0.625rem] bg-sand ${spanClass(work.span)}`}>
      <img
        src={work.src}
        alt={work.alt}
        width={work.width}
        height={work.height}
        loading="lazy"
        className="aspect-[4/3] h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-full sm:aspect-auto"
      />
      <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-10 text-white opacity-100 transition-all duration-300 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">
        <span className="min-w-0">
          <strong className="block truncate font-display text-base font-medium">
            {work.title}
          </strong>
          <span className="text-[0.7rem] font-bold uppercase tracking-[0.12em] opacity-85">
            {CATEGORY_LABELS[work.category] ?? work.category}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1">
          <StarRating
            value={rating}
            onChange={setRating}
            label={`Rate ${work.title}`}
          />
          <button
            type="button"
            onClick={() => setLiked((v) => !v)}
            aria-pressed={liked}
            aria-label={liked ? `Unlike ${work.title}` : `Like ${work.title}`}
            className={`flex h-7 w-7 items-center justify-center rounded-full text-lg transition-colors ${
              liked ? "text-red-400" : "text-white/70 hover:text-white"
            }`}
          >
            <span aria-hidden="true">{liked ? "♥" : "♡"}</span>
          </button>
        </span>
      </figcaption>
    </figure>
  );
}

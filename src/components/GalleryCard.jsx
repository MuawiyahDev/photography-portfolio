import HeartIcon from "./ui/HeartIcon.jsx";
import StarRating from "./StarRating.jsx";

/**
 * Fitted card: the image keeps its native aspect (h-auto), so square,
 * portrait, and landscape photos all render fully — never cropped,
 * never stretched. Used inside a CSS-columns masonry grid.
 *
 * `liked` / `onToggleLike` and `rating` / `onRate` are controlled by the
 * parent (favorites + ratings are persisted in PostgreSQL per account,
 * not in local card state, so both survive a refresh).
 */
export default function GalleryCard({
  work,
  liked = false,
  onToggleLike,
  rating = 0,
  onRate,
  busy = false,
}) {
  return (
    <figure className="group relative mb-5 min-w-0 break-inside-avoid overflow-hidden rounded-xl bg-sand shadow-sm ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-xl dark:bg-white/10 dark:ring-white/10">
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
          {work.categoryLabel ?? work.category}
        </span>
        <button
          type="button"
          onClick={() => onToggleLike?.(work.id)}
          disabled={busy}
          aria-busy={busy}
          aria-pressed={liked}
          aria-label={liked ? `Unlike ${work.title}` : `Like ${work.title}`}
          title={liked ? "Saved to favorites" : "Save to favorites"}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-lg ring-1 ring-white/25 backdrop-blur-md transition-all duration-200 active:scale-90 disabled:cursor-progress ${
            liked
              ? "bg-rose-500/90 text-white hover:bg-rose-500"
              : "bg-black/45 text-white/90 hover:bg-black/60 hover:text-white"
          }`}
        >
          {busy ? (
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
          ) : (
            <HeartIcon filled={liked} size={16} />
          )}
        </button>
      </div>

      <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pt-12 text-white">
        <strong className="font-display text-lg font-medium leading-snug">
          {work.title}
        </strong>
        <StarRating
          value={rating}
          onChange={(next) => onRate?.(work.id, next)}
          size="sm"
          label={`Rate ${work.title}`}
        />
      </figcaption>
    </figure>
  );
}

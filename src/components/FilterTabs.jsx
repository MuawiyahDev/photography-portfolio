import { CATEGORIES } from "../data/works.js";
import HeartIcon from "./ui/HeartIcon.jsx";

const pillBase =
  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-200 active:scale-95";

function CategoryPill({ active, onClick, children, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label ?? (typeof children === "string" ? children : undefined)}
      className={`${pillBase} ${
        active
          ? "border-coal bg-coal text-white dark:border-cream dark:bg-cream dark:text-coal"
          : "border-sand bg-white text-muted hover:-translate-y-px hover:border-ink hover:text-ink dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-white/40 dark:hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Portfolio filter tabs — category pills plus a dedicated Favorites
 * tab with a live count badge. Mobile-first: wraps cleanly, never
 * causes page-level horizontal scroll.
 */
export default function FilterTabs({ active, onChange, favoriteCount }) {
  const favoritesActive = active === "favorites";

  return (
    <div
      role="group"
      aria-label="Filter gallery by category"
      className="mb-3 flex flex-wrap items-center gap-2"
    >
      {CATEGORIES.map((category) => (
        <CategoryPill
          key={category.value}
          active={category.value === active}
          onClick={() => onChange(category.value)}
        >
          {category.label}
        </CategoryPill>
      ))}

      <span aria-hidden="true" className="hidden h-6 w-px bg-sand dark:bg-white/10 sm:block" />

      <button
        type="button"
        onClick={() => onChange("favorites")}
        aria-pressed={favoritesActive}
        aria-label={`Show favorites, ${favoriteCount} saved`}
        className={`${pillBase} ${
          favoritesActive
            ? "border-rose-600 bg-rose-600 text-white hover:bg-rose-500"
            : "border-rose-200 bg-rose-50/60 text-rose-700 hover:-translate-y-px hover:border-rose-400 hover:text-rose-600 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:border-rose-300/50 dark:hover:text-rose-100"
        }`}
      >
        <HeartIcon filled={favoritesActive || favoriteCount > 0} size={14} />
        Favorites
        <span
          className={`rounded-full px-1.5 py-0.5 text-xs font-bold leading-none ${
            favoritesActive
              ? "bg-white/25 text-white"
              : "bg-rose-600/10 text-rose-700 dark:bg-rose-400/20 dark:text-rose-100"
          }`}
        >
          {favoriteCount}
        </span>
      </button>
    </div>
  );
}

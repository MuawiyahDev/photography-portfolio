import { useState } from "react";

const STAR_PATH =
  "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

function StarGlyph({ size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="drop-shadow-sm"
    >
      <path d={STAR_PATH} />
    </svg>
  );
}

/**
 * Controlled star rating — same pattern as a QuantityStepper:
 * the parent owns `value`, this component only renders + notifies.
 * Hover/focus preview is local UI state only and never leaks into
 * the persisted value.
 *
 * @param {{ value: number, onChange: (next: number) => void, max?: number, label: string, size?: "sm" | "md" }} props
 */
export default function StarRating({
  value,
  onChange,
  max = 5,
  label,
  size = "md",
}) {
  const [hovered, setHovered] = useState(0);
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  const shown = hovered || value;

  const btnSize = size === "sm" ? "h-6 w-6" : "h-7 w-7";
  const iconSize = size === "sm" ? 14 : 18;

  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center gap-0.5"
      onMouseLeave={() => setHovered(0)}
    >
      {stars.map((star) => {
        const active = star <= shown;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star === value ? 0 : star)}
            onMouseEnter={() => setHovered(star)}
            onFocus={() => setHovered(star)}
            onBlur={() => setHovered(0)}
            aria-label={`Rate ${star} out of ${max}`}
            aria-pressed={star <= value}
            title={`${star}/${max}`}
            className={`flex items-center justify-center rounded-full transition-all duration-150 hover:scale-110 active:scale-95 ${btnSize} ${
              active
                ? "text-amber-400"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <StarGlyph size={iconSize} />
          </button>
        );
      })}
      <span
        aria-live="polite"
        className="ml-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-white/80"
      >
        {value > 0 ? `${value}/${max}` : "Rate"}
      </span>
    </div>
  );
}

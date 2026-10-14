/**
 * Controlled star rating — same pattern as a QuantityStepper:
 * the parent owns `value`, this component only renders + notifies.
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
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  const btnSize = size === "sm" ? "h-6 w-6 text-sm" : "h-7 w-7 text-base";

  return (
    <div role="group" aria-label={label} className="flex items-center gap-0.5">
      {stars.map((star) => {
        const active = star <= value;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star === value ? 0 : star)}
            aria-label={`Rate ${star} out of ${max}`}
            aria-pressed={active}
            title={`${star}/${max}`}
            className={`flex items-center justify-center rounded-full leading-none transition-colors ${btnSize} ${
              active ? "text-amber-400" : "text-white/70 hover:text-white"
            }`}
          >
            <span aria-hidden="true">{active ? "★" : "☆"}</span>
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

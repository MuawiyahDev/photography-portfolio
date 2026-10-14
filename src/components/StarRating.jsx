/**
 * Controlled star rating — same pattern as a QuantityStepper:
 * the parent owns `value`, this component only renders + notifies.
 *
 * @param {{ value: number, onChange: (next: number) => void, max?: number, label: string }} props
 */
export default function StarRating({ value, onChange, max = 5, label }) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
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
            className={`flex h-7 w-7 items-center justify-center rounded-full text-base leading-none transition-colors ${
              active
                ? "text-amber-400"
                : "text-white/70 hover:text-white"
            }`}
          >
            <span aria-hidden="true">{active ? "★" : "☆"}</span>
          </button>
        );
      })}
      <span className="ml-1 text-[0.7rem] font-semibold uppercase tracking-wider text-white/80">
        {value > 0 ? `${value}/${max}` : "Rate"}
      </span>
    </div>
  );
}

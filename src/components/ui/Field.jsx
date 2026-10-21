// Label + control + inline error used by every admin form.
// Handles the accessibility wiring: aria-invalid and aria-describedby
// point at the error message automatically.
export const inputClass =
  "w-full rounded-lg border border-sand bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink/35 hover:border-ink/25 focus:border-pine focus:ring-2 focus:ring-pine/25 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-white/5 dark:text-cream dark:placeholder:text-white/30 dark:hover:border-white/25 dark:focus:border-emerald-300 dark:focus:ring-emerald-300/20";

export const selectClass = `${inputClass} appearance-none pr-9 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%236e675b%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1rem] bg-[right_0.85rem_center] bg-no-repeat`;

export default function Field({
  id,
  label,
  error,
  hint,
  required = false,
  children,
  className = "",
}) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className={`grid min-w-0 gap-1.5 ${className}`}>
      <div className="flex min-w-0 items-baseline justify-between gap-2">
        <label
          htmlFor={id}
          className="text-sm font-semibold text-ink dark:text-cream"
        >
          {label}
          {required ? (
            <span aria-hidden="true" className="ml-1 text-error">
              *
            </span>
          ) : null}
        </label>
        {hint ? (
          <span
            id={hintId}
            className="shrink-0 text-xs text-ink/45 dark:text-white/45"
          >
            {hint}
          </span>
        ) : null}
      </div>
      {typeof children === "function"
        ? children({
            "aria-invalid": error ? "true" : undefined,
            "aria-describedby": error
              ? errorId
              : hint
                ? hintId
                : undefined,
          })
        : children}
      {error ? (
        <small id={errorId} className="text-sm font-medium text-error">
          {error}
        </small>
      ) : null}
    </div>
  );
}

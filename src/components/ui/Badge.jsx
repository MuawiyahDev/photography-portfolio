const TONES = {
  neutral:
    "bg-sand/60 text-muted ring-sand dark:bg-white/10 dark:text-white/70 dark:ring-white/10",
  brand:
    "bg-pine/10 text-pine ring-pine/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-300/25",
  success:
    "bg-green-50 text-success ring-green-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-300/25",
  danger:
    "bg-red-50 text-error ring-red-600/20 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-300/25",
  warn:
    "bg-amber-50 text-[#8a5b00] ring-amber-600/25 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-300/25",
};

export default function Badge({
  tone = "neutral",
  dot = false,
  className = "",
  children,
}) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${TONES[tone] ?? TONES.neutral} ${className}`}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-current"
        />
      ) : null}
      <span className="truncate">{children}</span>
    </span>
  );
}

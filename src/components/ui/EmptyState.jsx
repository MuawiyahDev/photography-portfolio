// Consistent empty state: icon, message, optional action.
export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 px-6 py-14 text-center ${className}`}
    >
      <span
        aria-hidden="true"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-sand/60 text-muted dark:bg-white/10 dark:text-white/60"
      >
        {icon}
      </span>
      <div className="grid gap-1">
        <p className="font-display text-lg text-ink dark:text-cream">{title}</p>
        {description ? (
          <p className="max-w-[42ch] text-sm text-muted dark:text-white/55">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

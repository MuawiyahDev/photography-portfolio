// Page title + description + action area. Every dashboard page uses
// this so headings, spacing and hierarchy stay identical.
export default function PageHeader({ title, description, actions, badge }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-medium tracking-tight text-ink dark:text-cream">
            {title}
          </h1>
          {badge}
        </div>
        {description ? (
          <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-muted dark:text-white/60">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

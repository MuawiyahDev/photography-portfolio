// Surface container used by every dashboard card, form and table.
// One shadow/ring treatment keeps the whole dashboard visually consistent.
export default function Card({
  className = "",
  children,
  as: Tag = "div",
  ...rest
}) {
  return (
    <Tag
      className={`rounded-2xl bg-white shadow-[0_1px_2px_rgba(32,28,23,0.05)] ring-1 ring-black/5 dark:bg-white/[0.045] dark:shadow-none dark:ring-white/10 ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ title, description, actions, className = "" }) {
  return (
    <div
      className={`flex flex-wrap items-start justify-between gap-3 border-b border-sand/70 px-5 py-4 dark:border-white/10 sm:px-6 ${className}`}
    >
      <div className="min-w-0">
        <h2 className="text-base font-bold text-ink dark:text-cream">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-sm text-muted dark:text-white/55">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}

export function CardBody({ className = "", children }) {
  return (
    <div className={`px-5 py-5 sm:px-6 sm:py-6 ${className}`}>{children}</div>
  );
}

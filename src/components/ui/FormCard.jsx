// Form layout primitives: Card shell with an action footer, plus
// titled sections that keep long forms visually organized.
import Card from "./Card.jsx";

export default function FormCard({ onSubmit, footer, className = "", children }) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <form
        noValidate
        onSubmit={onSubmit}
        className="divide-y divide-sand/70 dark:divide-white/10"
      >
        <div className="grid gap-6 px-5 py-6 sm:px-6 sm:py-7">
          {children}
        </div>
        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-3 bg-cream/50 px-5 py-4 sm:px-6 dark:bg-white/[0.03]">
            {footer}
          </div>
        ) : null}
      </form>
    </Card>
  );
}

export function FormSection({ title, description, children, className = "" }) {
  return (
    <section className={`grid min-w-0 gap-4 ${className}`}>
      <div className="grid gap-1">
        <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-muted dark:text-white/55">
          {title}
        </h2>
        {description ? (
          <p className="max-w-[60ch] text-sm text-ink/60 dark:text-white/50">
            {description}
          </p>
        ) : null}
      </div>
      <div className="grid min-w-0 gap-5">{children}</div>
    </section>
  );
}

// Loading placeholders. Route segments (loading.js) render these so
// navigation feels instant instead of flashing an empty screen.
export default function Skeleton({ className = "", ...rest }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-sand/70 dark:bg-white/10 ${className}`}
      {...rest}
    />
  );
}

/** Generic page intro placeholder (title + paragraph + actions). */
export function PageSkeleton() {
  return (
    <div className="grid gap-8" aria-busy="true" aria-label="Loading page">
      <div className="grid gap-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

/** Table placeholder (works list, inquiries). */
export function TableSkeleton({ rows = 6 }) {
  return (
    <div
      className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 dark:bg-white/[0.045] dark:ring-white/10"
      aria-busy="true"
      aria-label="Loading list"
    >
      <div className="flex items-center gap-4 border-b border-sand/70 px-5 py-4 dark:border-white/10">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="ml-auto h-9 w-32" />
      </div>
      <div className="divide-y divide-sand/70 dark:divide-white/10">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="grid flex-1 gap-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="hidden h-6 w-20 rounded-full sm:block" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Long form placeholder (hero / about / contact / work forms). */
export function FormSkeleton({ sections = 3 }) {
  return (
    <div
      className="grid max-w-2xl gap-5 rounded-2xl bg-white p-6 ring-1 ring-black/5 dark:bg-white/[0.045] dark:ring-white/10"
      aria-busy="true"
      aria-label="Loading form"
    >
      {Array.from({ length: sections }, (_, i) => (
        <div key={i} className="grid gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-2/3" />
        </div>
      ))}
      <Skeleton className="h-10 w-36 self-start rounded-full" />
    </div>
  );
}

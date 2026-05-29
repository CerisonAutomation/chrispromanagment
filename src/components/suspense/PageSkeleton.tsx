/**
 * @fileoverview PageSkeleton — full-page loading skeleton for CMS pages.
 */
export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-8 p-8" aria-hidden="true">
      <div className="h-12 w-2/3 rounded-xl bg-muted" />
      <div className="space-y-4">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
        <div className="h-4 w-4/6 rounded bg-muted" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-video rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}

/**
 * @fileoverview PropertyCardSkeleton — skeleton placeholder for PropertyCard.
 */
export function PropertyCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border animate-pulse" aria-hidden="true">
      <div className="aspect-[4/3] bg-muted" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
        <div className="h-3 w-1/3 rounded bg-muted" />
      </div>
    </div>
  );
}

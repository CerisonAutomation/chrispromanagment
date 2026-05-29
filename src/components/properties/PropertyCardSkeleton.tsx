/**
 * @fileoverview Loading skeleton for PropertyCard — matches exact layout.
 */
export function PropertyCardSkeleton() {
  return (
    <div className="block bg-surface rounded-xl border border-border overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-surface-2" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-surface-2 rounded w-4/5" />
        <div className="h-3 bg-surface-2 rounded w-2/5" />
        <div className="flex justify-between items-center">
          <div className="h-3 bg-surface-2 rounded w-1/3" />
          <div className="h-4 bg-surface-2 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

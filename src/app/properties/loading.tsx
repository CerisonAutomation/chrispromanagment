/**
 * @fileoverview Properties page loading state — skeleton grid.
 */
import { PropertyCardSkeleton } from '@/components/properties/PropertyCardSkeleton';

export default function PropertiesLoading() {
  return (
    <main className="pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-10">
          <div className="h-9 w-64 bg-surface-2 rounded animate-pulse mb-3" />
          <div className="h-4 w-96 bg-surface-2 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
        </div>
      </div>
    </main>
  );
}

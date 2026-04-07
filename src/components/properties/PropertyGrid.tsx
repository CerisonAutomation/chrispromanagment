'use client';
/**
 * @fileoverview PropertyGrid — client component, fetches + renders listing grid.
 * Handles loading, error, and empty states. Supports pagination.
 */
import { useProperties } from '@/hooks/useProperties';
import { PropertyCard } from './PropertyCard';
import { PropertyCardSkeleton } from './PropertyCardSkeleton';

export function PropertyGrid({ limit = 12 }: { limit?: number }) {
  const { listings, loading, error, refetch } = useProperties(limit);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="text-4xl">⚠️</div>
        <p className="text-foreground/50 text-sm max-w-sm">
          Could not load properties. Please try again.
        </p>
        <button
          onClick={refetch}
          className="px-5 py-2 bg-gold text-[#0e0f11] text-sm font-semibold rounded-lg hover:bg-gold-light transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <div className="text-4xl opacity-30">🏠</div>
        <p className="text-foreground/40 text-sm">No properties available right now.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing, i) => (
        <PropertyCard key={listing._id} listing={listing} priority={i < 3} />
      ))}
    </div>
  );
}

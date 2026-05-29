/**
 * @fileoverview PropertyGrid — responsive property listing grid.
 */
import { PropertyCard } from './PropertyCard';
import type { GuestyListing } from '@/types/guesty';

interface PropertyGridProps {
  properties: GuestyListing[];
}

export function PropertyGrid({ properties }: PropertyGridProps) {
  if (properties.length === 0) {
    return (
      <div className="col-span-full text-center py-20 text-muted-foreground">
        <p className="text-5xl mb-4">🏖</p>
        <p className="text-lg font-medium">No properties available right now.</p>
        <p className="text-sm">Check back soon — new listings are added regularly.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((listing) => (
        <PropertyCard key={listing._id} listing={listing} />
      ))}
    </div>
  );
}

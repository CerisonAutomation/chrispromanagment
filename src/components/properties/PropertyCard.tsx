/**
 * @fileoverview PropertyCard — single listing display card.
 */
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import type { GuestyListing } from '@/types';

interface PropertyCardProps {
  listing: GuestyListing;
}

export function PropertyCard({ listing }: PropertyCardProps) {
  const image = listing.pictures?.[0];
  const price = listing.prices?.basePrice;
  const name = listing.nickname ?? listing.title ?? 'Property';

  return (
    <Link
      href={`/properties/${listing._id}`}
      className="group block rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-shadow duration-300 bg-card"
      aria-label={`View ${name}`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {image ? (
          <Image
            src={image.thumbnail}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-1.5">
        <h3 className="font-semibold text-base leading-tight line-clamp-2">{name}</h3>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {listing.accommodates && <span>👥 {listing.accommodates}</span>}
          {listing.bedrooms !== undefined && <span>🛏 {listing.bedrooms}BR</span>}
          {listing.bathrooms !== undefined && <span>🚿 {listing.bathrooms}BA</span>}
        </div>
        {price !== undefined && (
          <p className="text-sm font-semibold">
            {formatCurrency(price)}
            <span className="font-normal text-muted-foreground"> / night</span>
          </p>
        )}
      </div>
    </Link>
  );
}

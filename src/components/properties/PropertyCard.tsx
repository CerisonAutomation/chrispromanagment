/**
 * @fileoverview PropertyCard — single listing display card with rating, location, image count.
 */
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import type { GuestyListing } from '@/types/guesty';

interface PropertyCardProps {
  listing: GuestyListing;
}

export function PropertyCard({ listing }: PropertyCardProps) {
  const image = listing.pictures?.[0];
  const imageCount = listing.pictures?.length ?? 0;
  const price = listing.prices?.basePrice;
  const name = listing.nickname ?? listing.title ?? 'Property';
  const city = listing.address?.city;
  const rating = listing.reviewsStats?.overallRating;
  const numRatings = listing.reviewsStats?.numberOfRatings ?? 0;

  return (
    <Link
      href={`/properties/${listing._id}`}
      className="group block rounded-2xl overflow-hidden border border-border hover:border-[rgba(200,169,106,0.4)] hover:shadow-xl transition-all duration-300 bg-card"
      aria-label={`View ${name}`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {image ? (
          <Image
            src={image.thumbnail || '/placeholder-property.jpg'}
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

        {/* Image count badge */}
        {imageCount > 1 && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
            {imageCount}
          </div>
        )}

        {/* Rating badge */}
        {rating !== undefined && numRatings > 0 && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-white text-xs font-semibold">
            ⭐ {rating.toFixed(1)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-1.5">
        {city && (
          <p className="text-xs text-[rgba(232,228,220,0.4)] uppercase tracking-wide font-medium">
            📍 {city}
          </p>
        )}
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

/**
 * @fileoverview PropertyCard — renders a single Guesty listing as a card.
 * Server + Client safe (no hooks). Used in grid and carousel.
 */
import Image from 'next/image';
import Link from 'next/link';
import { cn, formatCurrency } from '@/lib/utils';
import type { GuestyListing } from '@/types';

interface PropertyCardProps {
  listing: GuestyListing;
  className?: string;
  priority?: boolean;
}

export function PropertyCard({ listing, className, priority = false }: PropertyCardProps) {
  const img = listing.pictures?.[0];
  const price = listing.prices.basePrice;
  const currency = listing.prices.currency ?? 'EUR';

  return (
    <Link
      href={`/properties/${listing._id}`}
      className={cn(
        'group block bg-surface rounded-xl border border-border overflow-hidden',
        'hover:border-gold/40 hover:shadow-[0_0_30px_rgba(200,169,106,0.08)] transition-all duration-300',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
        {img?.original ? (
          <Image
            src={img.original}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl opacity-20">🏠</span>
          </div>
        )}
        {/* Overlay badge */}
        {listing.propertyType && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-[rgba(14,15,17,0.85)] backdrop-blur-sm text-xs font-medium text-foreground/80 rounded-md border border-border/60">
            {listing.propertyType}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-gold transition-colors mb-1.5">
          {listing.nickname ?? listing.title}
        </h3>
        <p className="text-foreground/40 text-xs mb-3">
          📍 {listing.address.city ?? listing.address.full}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-foreground/50">
            {listing.bedrooms != null && <span>🛏 {listing.bedrooms}bd</span>}
            {listing.bathrooms != null && <span>🚿 {listing.bathrooms}ba</span>}
            {listing.accommodates != null && <span>👤 {listing.accommodates}</span>}
          </div>
          <div className="text-right">
            <span className="text-gold font-bold text-sm">{formatCurrency(price, currency)}</span>
            <span className="text-foreground/30 text-xs">/night</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

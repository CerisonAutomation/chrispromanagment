'use client';
/**
 * GuestyPropertyGrid — Full production Puck block.
 * Fetches listings from /api/guesty/listings, renders filterable card grid.
 */
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface GuestyListing {
  _id: string;
  title: string;
  nickname?: string;
  address: { city: string; country: string; full?: string };
  bedrooms: number;
  bathrooms: number;
  accommodates: number;
  prices: { basePrice: number; currency: string };
  pictures: Array<{ thumbnail: string; large: string }>;
  publicDescription?: { summary?: string };
  tags?: string[];
}

interface GuestyPropertyGridProps {
  heading: string;
  subheading: string;
  columns: 2 | 3 | 4;
  showSearch: boolean;
  showFilters: boolean;
  limitResults: number;
  filterByTags: string;
  ctaLabel: string;
  ctaBaseUrl: string;
  showPrice: boolean;
  showBedrooms: boolean;
  cardStyle: 'default' | 'minimal' | 'luxury';
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm animate-pulse">
      <div className="h-56 bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-200" />
        <div className="h-3 w-1/3 rounded bg-gray-200" />
      </div>
    </div>
  );
}

// ─── Property Card ────────────────────────────────────────────────────────────

function PropertyCard({
  listing,
  ctaLabel,
  ctaBaseUrl,
  showPrice,
  showBedrooms,
  cardStyle,
}: {
  listing: GuestyListing;
  ctaLabel: string;
  ctaBaseUrl: string;
  showPrice: boolean;
  showBedrooms: boolean;
  cardStyle: GuestyPropertyGridProps['cardStyle'];
}) {
  const image = listing.pictures?.[0]?.large ?? listing.pictures?.[0]?.thumbnail ?? '/placeholder-property.jpg';
  const price = listing.prices?.basePrice;
  const currency = listing.prices?.currency ?? 'EUR';
  const href = `${ctaBaseUrl}/${listing._id}`;

  return (
    <Link
      href={href}
      className={cn(
        'group block overflow-hidden rounded-2xl transition-all duration-300',
        cardStyle === 'luxury'
          ? 'border border-amber-200 bg-stone-50 shadow-md hover:shadow-xl hover:-translate-y-1'
          : cardStyle === 'minimal'
            ? 'border border-gray-100 bg-white hover:border-gray-300'
            : 'border border-gray-100 bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5'
      )}
    >
      <div className="relative h-56 overflow-hidden">
        <Image
          src={image}
          alt={listing.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {showPrice && price !== undefined && (
          <div className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-gray-800 shadow backdrop-blur-sm">
            {new Intl.NumberFormat('en-MT', { style: 'currency', currency }).format(price)}
            <span className="text-xs font-normal text-gray-500">/night</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{listing.nickname ?? listing.title}</h3>
        <p className="mt-0.5 text-sm text-gray-500">{listing.address?.city}, {listing.address?.country}</p>
        {showBedrooms && (
          <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
            <span>🛏 {listing.bedrooms} bed{listing.bedrooms !== 1 ? 's' : ''}</span>
            <span>🚿 {listing.bathrooms} bath{listing.bathrooms !== 1 ? 's' : ''}</span>
            <span>👤 {listing.accommodates} guests</span>
          </div>
        )}
        {listing.publicDescription?.summary && (
          <p className="mt-2 text-xs text-gray-400 line-clamp-2">{listing.publicDescription.summary}</p>
        )}
        <div
          className={cn(
            'mt-3 inline-flex items-center gap-1 text-sm font-medium transition-all',
            cardStyle === 'luxury' ? 'text-amber-700' : 'text-blue-600'
          )}
        >
          {ctaLabel} →
        </div>
      </div>
    </Link>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function GuestyPropertyGrid({
  heading,
  subheading,
  columns,
  showSearch,
  showFilters,
  limitResults,
  filterByTags,
  ctaLabel,
  ctaBaseUrl,
  showPrice,
  showBedrooms,
  cardStyle,
}: GuestyPropertyGridProps) {
  const [listings, setListings] = useState<GuestyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [guestFilter, setGuestFilter] = useState(0);
  const [bedroomFilter, setBedroomFilter] = useState(0);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (limitResults > 0) params.set('limit', String(limitResults));
      if (filterByTags) params.set('tags', filterByTags);
      const res = await fetch(`/api/guesty/listings?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json() as { results: GuestyListing[] };
      setListings(json.results ?? []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [limitResults, filterByTags]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        l.title.toLowerCase().includes(q) ||
        (l.nickname?.toLowerCase().includes(q) ?? false) ||
        l.address?.city?.toLowerCase().includes(q);
      const matchesGuests = guestFilter === 0 || l.accommodates >= guestFilter;
      const matchesBeds = bedroomFilter === 0 || l.bedrooms >= bedroomFilter;
      return matchesSearch && matchesGuests && matchesBeds;
    });
  }, [listings, search, guestFilter, bedroomFilter]);

  const colClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {(heading || subheading) && (
          <div className="mb-10 text-center">
            {heading && (
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: 'var(--pm-foreground)' }}>
                {heading}
              </h2>
            )}
            {subheading && (
              <p className="mt-3 text-lg" style={{ color: 'var(--pm-foreground)', opacity: 0.7 }}>
                {subheading}
              </p>
            )}
          </div>
        )}

        {(showSearch || showFilters) && (
          <div className="mb-8 flex flex-wrap gap-3">
            {showSearch && (
              <input
                type="search"
                placeholder="Search properties…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-[200px] rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            )}
            {showFilters && (
              <>
                <select
                  value={guestFilter}
                  onChange={(e) => setGuestFilter(Number(e.target.value))}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:outline-none"
                >
                  <option value={0}>Any guests</option>
                  {[1, 2, 4, 6, 8, 10].map((n) => <option key={n} value={n}>{n}+ guests</option>)}
                </select>
                <select
                  value={bedroomFilter}
                  onChange={(e) => setBedroomFilter(Number(e.target.value))}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:outline-none"
                >
                  <option value={0}>Any bedrooms</option>
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+ beds</option>)}
                </select>
              </>
            )}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Error loading properties: {error}
            <button onClick={fetchListings} className="ml-3 underline">Retry</button>
          </div>
        )}

        <div className={cn('grid gap-6', colClass)}>
          {loading
            ? Array.from({ length: columns * 2 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.map((listing) => (
                <PropertyCard
                  key={listing._id}
                  listing={listing}
                  ctaLabel={ctaLabel}
                  ctaBaseUrl={ctaBaseUrl}
                  showPrice={showPrice}
                  showBedrooms={showBedrooms}
                  cardStyle={cardStyle}
                />
              ))
          }
        </div>

        {!loading && filtered.length === 0 && (
          <div className="py-20 text-center text-gray-400">
            No properties match your search.
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Puck Block Definition ────────────────────────────────────────────────────

export const GuestyPropertyGridBlock = {
  label: 'Guesty Property Grid',
  fields: {
    heading: { type: 'text' as const, label: 'Heading' },
    subheading: { type: 'text' as const, label: 'Subheading' },
    columns: {
      type: 'select' as const,
      label: 'Columns',
      options: [
        { label: '2', value: 2 },
        { label: '3', value: 3 },
        { label: '4', value: 4 },
      ],
    },
    showSearch: { type: 'radio' as const, label: 'Show Search', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
    showFilters: { type: 'radio' as const, label: 'Show Filters', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
    limitResults: { type: 'number' as const, label: 'Max Results (0 = all)' },
    filterByTags: { type: 'text' as const, label: 'Filter by Tags (comma-separated)' },
    ctaLabel: { type: 'text' as const, label: 'Card CTA Label' },
    ctaBaseUrl: { type: 'text' as const, label: 'Card CTA Base URL' },
    showPrice: { type: 'radio' as const, label: 'Show Price', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
    showBedrooms: { type: 'radio' as const, label: 'Show Bedrooms', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
    cardStyle: {
      type: 'select' as const,
      label: 'Card Style',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Minimal', value: 'minimal' },
        { label: 'Luxury', value: 'luxury' },
      ],
    },
  },
  defaultProps: {
    heading: 'Our Properties',
    subheading: 'Discover handpicked luxury rentals in Malta.',
    columns: 3 as const,
    showSearch: true,
    showFilters: true,
    limitResults: 12,
    filterByTags: '',
    ctaLabel: 'View Property',
    ctaBaseUrl: '/properties',
    showPrice: true,
    showBedrooms: true,
    cardStyle: 'luxury' as const,
  },
  render: (props: GuestyPropertyGridProps) => <GuestyPropertyGrid {...props} />,
};

export default GuestyPropertyGridBlock;

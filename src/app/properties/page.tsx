/**
 * @fileoverview Properties listing page — RSC with URL-driven filters + cursor pagination.
 */
import { Suspense } from 'react';
import { getListingsResult } from '@/lib/guesty/booking-api-result';
import { PropertyGrid } from '@/components/properties/PropertyGrid';
import { PropertyCardSkeleton } from '@/components/suspense/PropertyCardSkeleton';
import { PropertyFilters } from '@/components/properties/PropertyFilters';
import { PropertyPagination } from '@/components/properties/PropertyPagination';
import { SiteNav } from '@/components/nav/SiteNav';
import { SiteFooter } from '@/components/nav/SiteFooter';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Properties',
  description: 'Browse our curated selection of luxury properties in Malta.',
};
export const revalidate = 300;

const PAGE_SIZE = 9;

interface SearchParams {
  bedrooms?: string;
  minPrice?: string;
  maxPrice?: string;
  cursor?: string;
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const bedrooms = sp.bedrooms ? Number(sp.bedrooms) : undefined;
  const minPrice = sp.minPrice ? Number(sp.minPrice) : undefined;
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : undefined;
  const cursor = sp.cursor ?? undefined;

  const result = await getListingsResult({
    limit: PAGE_SIZE,
    cursor,
    numberOfBedrooms: bedrooms,
    minPrice,
    maxPrice,
  });

  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-background pt-16">
        {/* Hero strip */}
        <section className="py-14 px-6 border-b border-border/40">
          <div className="max-w-6xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-[#c8a96a] mb-3 block">
              Malta Luxury Rentals
            </span>
            <h1 className="text-4xl md:text-5xl font-bold font-playfair mb-3 text-[#e8e4dc]">
              Our Properties
            </h1>
            <p className="text-[rgba(232,228,220,0.55)] text-lg">
              Handpicked villas and apartments across Malta&apos;s most sought-after locations.
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
          {/* Filters */}
          <PropertyFilters currentFilters={sp} />

          {/* Results */}
          {!result.success ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-destructive font-medium">Could not load properties.</p>
              <p className="text-muted-foreground text-sm">{result.error.message}</p>
            </div>
          ) : (
            <>
              {/* Count */}
              <p className="text-sm text-muted-foreground">
                {result.data.count
                  ? `${result.data.count} ${result.data.count === 1 ? 'property' : 'properties'} found`
                  : `${result.data.results.length} ${result.data.results.length === 1 ? 'property' : 'properties'} shown`}
              </p>

              <Suspense
                fallback={
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                      <PropertyCardSkeleton key={i} />
                    ))}
                  </div>
                }
              >
                <PropertyGrid properties={result.data.results} />
              </Suspense>

              {/* Pagination */}
              <PropertyPagination
                nextCursor={result.data.cursor}
                currentFilters={sp}
              />
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

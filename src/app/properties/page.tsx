/**
 * @fileoverview Properties listing page — RSC, fetches Guesty listings server-side.
 */
import { Suspense } from 'react';
import { getListings } from '@/lib/guesty-api';
import { PropertyGrid } from '@/components/properties/PropertyGrid';
import { PropertyCardSkeleton } from '@/components/suspense/PropertyCardSkeleton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Properties',
  description: 'Browse our curated selection of luxury properties in Malta.',
};
export const revalidate = 300;

export default async function PropertiesPage() {
  const result = await getListings({ limit: 20 });
  
  if (!result.success) {
    return (
      <main className="min-h-screen bg-background">
        <section className="max-w-7xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold font-playfair">Error loading properties</h1>
          <p className="text-muted-foreground">{result.error.message}</p>
        </section>
      </main>
    );
  }
  
  const { results } = result.data;

  return (
    <main className="min-h-screen bg-background">
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold font-playfair mb-3">
            Our Properties
          </h1>
          <p className="text-muted-foreground text-lg">
            {results.length} handpicked {results.length === 1 ? 'property' : 'properties'} in Malta
          </p>
        </div>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
            </div>
          }
        >
          <PropertyGrid properties={results} />
        </Suspense>
      </section>
    </main>
  );
}

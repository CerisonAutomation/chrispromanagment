/**
 * @fileoverview Properties page loading state — skeleton grid with SiteNav.
 */
import { SiteNav } from '@/components/nav/SiteNav';
import { PropertyCardSkeleton } from '@/components/properties/PropertyCardSkeleton';

export default function PropertiesLoading() {
  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-background pt-16">
        {/* Hero strip skeleton */}
        <section className="py-14 px-6 border-b border-border/40">
          <div className="max-w-6xl mx-auto space-y-3">
            <div className="h-3 w-40 bg-[#111214] rounded animate-pulse" />
            <div className="h-10 w-72 bg-[#111214] rounded animate-pulse" />
            <div className="h-4 w-80 bg-[#111214] rounded animate-pulse" />
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
          {/* Filter bar skeleton */}
          <div className="h-16 rounded-xl border border-border/50 bg-[#111214] animate-pulse" />

          {/* Count skeleton */}
          <div className="h-4 w-36 bg-[#111214] rounded animate-pulse" />

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        </div>
      </main>
    </>
  );
}

/**
 * @fileoverview Properties listing page — /properties
 * Server shell with client PropertyGrid for data fetching.
 */
import type { Metadata } from 'next';
import { SiteNav } from '@/components/nav/SiteNav';
import { SiteFooter } from '@/components/nav/SiteFooter';
import { PropertyGrid } from '@/components/properties/PropertyGrid';

export const metadata: Metadata = {
  title: 'Properties',
  description: 'Browse our collection of luxury holiday rentals and managed properties in Malta.',
};

export default function PropertiesPage() {
  return (
    <>
      <SiteNav />
      <main className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              <span className="text-gold">✦</span> Our Properties
            </h1>
            <p className="text-foreground/50 text-base max-w-xl">
              Discover our curated selection of luxury rentals across Malta&apos;s finest locations.
            </p>
          </div>
          {/* Grid */}
          <PropertyGrid limit={24} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

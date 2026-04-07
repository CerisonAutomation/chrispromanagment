'use client';
/**
 * GuestyPropertyDetail — Full production Puck block.
 * Renders a single listing's full detail: gallery, amenities, description, booking CTA.
 * Reads listingId from props or falls back to URL param `?listing=`.
 */
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface GuestyListing {
  _id: string;
  title: string;
  nickname?: string;
  address: { city: string; country: string; full?: string; lat?: number; lng?: number };
  bedrooms: number;
  bathrooms: number;
  accommodates: number;
  prices: { basePrice: number; currency: string };
  pictures: Array<{ thumbnail: string; large: string }>;
  publicDescription?: { summary?: string; space?: string; houseRules?: string };
  amenities?: string[];
  tags?: string[];
  checkInOutPolicy?: { checkIn: string; checkOut: string };
}

interface GuestyPropertyDetailProps {
  listingId: string;
  bookingBaseUrl: string;
  ctaLabel: string;
  showAmenities: boolean;
  showHouseRules: boolean;
  showMap: boolean;
  googleMapsApiKey: string;
  maxGalleryImages: number;
}

function AmenityIcon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    wifi: '📶', pool: '🏊', parking: '🅿️', gym: '💪', kitchen: '🍳',
    'air conditioning': '❄️', tv: '📺', washer: '🫧', dryer: '🫙',
    balcony: '🌅', bbq: '🔥', elevator: '🛗',
  };
  const key = name.toLowerCase();
  const icon = Object.entries(icons).find(([k]) => key.includes(k))?.[1] ?? '✓';
  return <span className="mr-1">{icon}</span>;
}

export function GuestyPropertyDetail({
  listingId,
  bookingBaseUrl,
  ctaLabel,
  showAmenities,
  showHouseRules,
  showMap,
  googleMapsApiKey,
  maxGalleryImages,
}: GuestyPropertyDetailProps) {
  const [listing, setListing] = useState<GuestyListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  const id = listingId || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('listing') ?? '' : '');

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    fetch(`/api/guesty/listings/${id}`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data: GuestyListing) => setListing(data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (!id) return (
    <div className="rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 p-8 text-center">
      <p className="font-semibold text-amber-700">⚠️ Set a Listing ID in block properties, or ensure URL contains <code>?listing=ID</code></p>
    </div>
  );

  if (loading) return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="h-96 w-full rounded-2xl bg-gray-200" />
      <div className="h-8 w-1/2 rounded bg-gray-200" />
      <div className="h-4 w-full rounded bg-gray-200" />
      <div className="h-4 w-3/4 rounded bg-gray-200" />
    </div>
  );

  if (error || !listing) return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
      Error loading listing: {error ?? 'Not found'}
    </div>
  );

  const images = (listing.pictures ?? []).slice(0, maxGalleryImages);
  const price = listing.prices?.basePrice;
  const currency = listing.prices?.currency ?? 'EUR';
  const formattedPrice = price !== undefined
    ? new Intl.NumberFormat('en-MT', { style: 'currency', currency }).format(price)
    : null;

  return (
    <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Gallery */}
      {images.length > 0 && (
        <div className="mb-8">
          <div className="relative h-80 w-full overflow-hidden rounded-2xl sm:h-[500px]">
            <Image
              src={images[activeImage]?.large ?? images[activeImage]?.thumbnail}
              alt={listing.title}
              fill
              className="object-cover transition-all duration-500"
              priority
              sizes="(max-width: 768px) 100vw, 80vw"
            />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={cn('relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                    activeImage === i ? 'border-amber-500' : 'border-transparent hover:border-gray-300')}
                >
                  <Image src={img.thumbnail} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="96px" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{listing.nickname ?? listing.title}</h1>
            <p className="mt-1 text-gray-500">{listing.address?.city}, {listing.address?.country}</p>
            <div className="mt-3 flex gap-4 text-sm text-gray-600">
              <span>🛏 {listing.bedrooms} bedrooms</span>
              <span>🚿 {listing.bathrooms} bathrooms</span>
              <span>👤 Up to {listing.accommodates} guests</span>
            </div>
          </div>

          {listing.publicDescription?.summary && (
            <div>
              <h2 className="mb-2 text-xl font-semibold">About this property</h2>
              <p className="leading-relaxed text-gray-600">{listing.publicDescription.summary}</p>
            </div>
          )}

          {listing.publicDescription?.space && (
            <div>
              <h2 className="mb-2 text-xl font-semibold">The space</h2>
              <p className="leading-relaxed text-gray-600">{listing.publicDescription.space}</p>
            </div>
          )}

          {showAmenities && listing.amenities && listing.amenities.length > 0 && (
            <div>
              <h2 className="mb-3 text-xl font-semibold">Amenities</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {listing.amenities.map((a, i) => (
                  <div key={i} className="flex items-center text-sm text-gray-700">
                    <AmenityIcon name={a} />{a}
                  </div>
                ))}
              </div>
            </div>
          )}

          {showHouseRules && listing.publicDescription?.houseRules && (
            <div>
              <h2 className="mb-2 text-xl font-semibold">House rules</h2>
              <p className="whitespace-pre-line text-sm text-gray-600">{listing.publicDescription.houseRules}</p>
            </div>
          )}

          {showMap && listing.address?.lat && googleMapsApiKey && (
            <div>
              <h2 className="mb-3 text-xl font-semibold">Location</h2>
              <div className="h-64 overflow-hidden rounded-xl">
                <iframe
                  src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${listing.address.lat},${listing.address.lng}&zoom=15`}
                  className="h-full w-full border-0"
                  allowFullScreen
                  title="Property location"
                />
              </div>
            </div>
          )}
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-lg">
            {formattedPrice && (
              <div className="mb-4">
                <span className="text-3xl font-bold text-amber-800">{formattedPrice}</span>
                <span className="text-sm text-amber-600"> / night</span>
              </div>
            )}
            {listing.checkInOutPolicy && (
              <div className="mb-4 text-sm text-gray-600">
                <div>Check-in: <strong>{listing.checkInOutPolicy.checkIn}</strong></div>
                <div>Check-out: <strong>{listing.checkInOutPolicy.checkOut}</strong></div>
              </div>
            )}
            <a
              href={`${bookingBaseUrl}?listing=${listing._id}`}
              className="flex w-full items-center justify-center rounded-xl bg-amber-600 px-6 py-3 text-center font-semibold text-white transition-all hover:bg-amber-700 hover:shadow-lg"
            >
              {ctaLabel}
            </a>
            <p className="mt-3 text-center text-xs text-gray-500">Free cancellation · Secure booking</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export const GuestyPropertyDetailBlock = {
  label: 'Guesty Property Detail',
  fields: {
    listingId: { type: 'text' as const, label: 'Listing ID (leave blank to use URL param)' },
    bookingBaseUrl: { type: 'text' as const, label: 'Booking Page URL' },
    ctaLabel: { type: 'text' as const, label: 'Book CTA Label' },
    showAmenities: { type: 'radio' as const, label: 'Show Amenities', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
    showHouseRules: { type: 'radio' as const, label: 'Show House Rules', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
    showMap: { type: 'radio' as const, label: 'Show Map', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
    googleMapsApiKey: { type: 'text' as const, label: 'Google Maps API Key' },
    maxGalleryImages: { type: 'number' as const, label: 'Max Gallery Images' },
  },
  defaultProps: {
    listingId: '',
    bookingBaseUrl: '/book',
    ctaLabel: 'Book Now',
    showAmenities: true,
    showHouseRules: true,
    showMap: false,
    googleMapsApiKey: '',
    maxGalleryImages: 8,
  },
  render: (props: GuestyPropertyDetailProps) => <GuestyPropertyDetail {...props} />,
};

export default GuestyPropertyDetailBlock;

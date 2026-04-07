/**
 * @fileoverview Property detail page — listing info + inline booking widget.
 */
import { notFound } from 'next/navigation';
import { getListing } from '@/lib/guesty-api';
import { BookingWidget } from '@/components/booking/BookingWidget';
import Image from 'next/image';
import type { Metadata } from 'next';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const listing = await getListing(id);
    return {
      title: listing.nickname ?? listing.title,
      description: listing.publicDescription?.summary ?? undefined,
      openGraph: {
        images: listing.pictures?.[0]?.thumbnail
          ? [{ url: listing.pictures[0].thumbnail }]
          : [],
      },
    };
  } catch {
    return { title: 'Property Not Found' };
  }
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let listing;
  try {
    listing = await getListing(id);
  } catch {
    notFound();
  }

  const images = listing.pictures ?? [];
  const firstImage = images[0];

  return (
    <main className="min-h-screen bg-background">
      {/* Hero image */}
      {firstImage && (
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <Image
            src={firstImage.original ?? firstImage.thumbnail}
            alt={listing.nickname ?? listing.title ?? 'Property'}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-6 left-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white font-playfair drop-shadow">
              {listing.nickname ?? listing.title}
            </h1>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {!firstImage && (
            <h1 className="text-3xl font-bold font-playfair">{listing.nickname ?? listing.title}</h1>
          )}

          {/* Amenities strip */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {listing.accommodates && (
              <span>👥 {listing.accommodates} guests</span>
            )}
            {listing.bedrooms !== undefined && (
              <span>🛏 {listing.bedrooms} bedroom{listing.bedrooms !== 1 ? 's' : ''}</span>
            )}
            {listing.bathrooms !== undefined && (
              <span>🚿 {listing.bathrooms} bathroom{listing.bathrooms !== 1 ? 's' : ''}</span>
            )}
          </div>

          {/* Description */}
          {listing.publicDescription?.summary && (
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p>{listing.publicDescription.summary}</p>
            </div>
          )}

          {/* Image gallery */}
          {images.length > 1 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {images.slice(1, 7).map((img, i) => (
                <div key={i} className="relative aspect-video rounded-xl overflow-hidden">
                  <Image
                    src={img.thumbnail}
                    alt={`${listing.nickname ?? listing.title} photo ${i + 2}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(min-width: 768px) 33vw, 50vw"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <BookingWidget listingId={id} />
          </div>
        </div>
      </div>
    </main>
  );
}

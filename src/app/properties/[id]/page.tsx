/**
 * @fileoverview Property detail page — full listing with gallery, amenities, descriptions, booking.
 */
import { notFound } from 'next/navigation';
import { getListing } from '@/lib/guesty-api';
import { BookingWidget } from '@/components/booking/BookingWidget';
import { SiteNav } from '@/components/nav/SiteNav';
import { SiteFooter } from '@/components/nav/SiteFooter';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import type { Metadata } from 'next';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const result = await getListing(id);
    if (!result.success) return { title: 'Property Not Found' };
    const listing = result.data;
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
  const result = await getListing(id);

  if (!result.success) notFound();

  const listing = result.data;
  const images = listing.pictures ?? [];
  const [heroImage, ...galleryImages] = images;
  const name = listing.nickname ?? listing.title ?? 'Property';
  const desc = listing.publicDescription;
  const price = listing.prices?.basePrice;
  const rating = listing.reviewsStats?.overallRating;
  const numRatings = listing.reviewsStats?.numberOfRatings ?? 0;

  // Amenity icons map (best-effort)
  const amenityIcon = (a: string): string => {
    const lower = a.toLowerCase();
    if (lower.includes('wifi') || lower.includes('internet')) return '📶';
    if (lower.includes('pool')) return '🏊';
    if (lower.includes('parking') || lower.includes('car')) return '🅿️';
    if (lower.includes('kitchen')) return '🍳';
    if (lower.includes('gym') || lower.includes('fitness')) return '🏋️';
    if (lower.includes('ac') || lower.includes('air')) return '❄️';
    if (lower.includes('balcony') || lower.includes('terrace')) return '🌿';
    if (lower.includes('sea') || lower.includes('ocean') || lower.includes('view')) return '🌊';
    if (lower.includes('washer') || lower.includes('laundry')) return '👕';
    if (lower.includes('tv') || lower.includes('netflix')) return '📺';
    if (lower.includes('dishwasher')) return '🍽️';
    if (lower.includes('bbq') || lower.includes('grill')) return '🔥';
    if (lower.includes('pet')) return '🐾';
    return '✦';
  };

  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-background pt-16">
        {/* Hero */}
        {heroImage && (
          <div className="relative h-[55vh] md:h-[65vh] w-full overflow-hidden">
            <Image
              src={(heroImage.original ?? heroImage.large ?? heroImage.thumbnail) || '/placeholder-property.jpg'}
              alt={name}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-8 left-6 right-6">
              <div className="max-w-7xl mx-auto">
                {listing.address?.city && (
                  <p className="text-xs font-semibold uppercase tracking-widest text-[rgba(232,228,220,0.6)] mb-2">
                    📍 {listing.address.city}{listing.address.country ? `, ${listing.address.country}` : ''}
                  </p>
                )}
                <h1 className="text-3xl md:text-5xl font-bold text-white font-playfair drop-shadow-lg">
                  {name}
                </h1>
                {rating && numRatings > 0 && (
                  <p className="mt-2 text-sm text-[rgba(232,228,220,0.75)]">
                    ⭐ {rating.toFixed(1)} · {numRatings} {numRatings === 1 ? 'review' : 'reviews'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* ── LEFT COLUMN: details ── */}
            <div className="lg:col-span-2 space-y-10">
              {/* Name (when no hero image) */}
              {!heroImage && (
                <h1 className="text-3xl md:text-4xl font-bold font-playfair text-[#e8e4dc]">
                  {name}
                </h1>
              )}

              {/* Quick facts */}
              <div className="flex flex-wrap gap-3">
                {listing.accommodates && (
                  <Chip>👥 {listing.accommodates} guests</Chip>
                )}
                {listing.bedrooms !== undefined && (
                  <Chip>🛏 {listing.bedrooms} bedroom{listing.bedrooms !== 1 ? 's' : ''}</Chip>
                )}
                {listing.bathrooms !== undefined && (
                  <Chip>🚿 {listing.bathrooms} bathroom{listing.bathrooms !== 1 ? 's' : ''}</Chip>
                )}
                {listing.propertyType && (
                  <Chip>🏡 {listing.propertyType}</Chip>
                )}
                {price !== undefined && (
                  <Chip className="text-[#c8a96a] border-[rgba(200,169,106,0.3)]">
                    {formatCurrency(price)} / night
                  </Chip>
                )}
              </div>

              {/* Summary */}
              {desc?.summary && (
                <Section title="About this property">
                  <p className="text-[rgba(232,228,220,0.7)] leading-relaxed">{desc.summary}</p>
                </Section>
              )}

              {/* Space */}
              {desc?.space && (
                <Section title="The Space">
                  <p className="text-[rgba(232,228,220,0.7)] leading-relaxed">{desc.space}</p>
                </Section>
              )}

              {/* Bed arrangements */}
              {listing.bedArrangements && listing.bedArrangements.length > 0 && (
                <Section title="Sleeping Arrangements">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {listing.bedArrangements.map((room, i) => (
                      <div key={i} className="p-4 rounded-xl border border-border/50 bg-[#111214] text-sm">
                        <p className="font-semibold text-[rgba(232,228,220,0.8)] mb-1">
                          Bedroom {i + 1}
                        </p>
                        {room.beds?.map((bed, j) => (
                          <p key={j} className="text-[rgba(232,228,220,0.5)]">
                            {bed.quantity}× {bed.type}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Amenities */}
              {listing.amenities && listing.amenities.length > 0 && (
                <Section title="Amenities">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {listing.amenities.map((a) => (
                      <div key={a} className="flex items-center gap-2 text-sm text-[rgba(232,228,220,0.65)]">
                        <span className="text-base flex-shrink-0">{amenityIcon(a)}</span>
                        <span className="leading-tight">{a}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Neighbourhood & access */}
              {(desc?.neighborhood || desc?.access || desc?.transit) && (
                <Section title="Location & Getting Around">
                  {desc.neighborhood && (
                    <p className="text-[rgba(232,228,220,0.7)] leading-relaxed mb-3">{desc.neighborhood}</p>
                  )}
                  {desc.access && (
                    <>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[rgba(232,228,220,0.4)] mb-1">Access</p>
                      <p className="text-[rgba(232,228,220,0.65)] leading-relaxed mb-3">{desc.access}</p>
                    </>
                  )}
                  {desc.transit && (
                    <>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[rgba(232,228,220,0.4)] mb-1">Transport</p>
                      <p className="text-[rgba(232,228,220,0.65)] leading-relaxed">{desc.transit}</p>
                    </>
                  )}
                </Section>
              )}

              {/* House rules */}
              {desc?.houseRules && (
                <Section title="House Rules">
                  <p className="text-[rgba(232,228,220,0.65)] leading-relaxed whitespace-pre-line">
                    {desc.houseRules}
                  </p>
                </Section>
              )}

              {/* Gallery */}
              {galleryImages.length > 0 && (
                <Section title={`Gallery (${images.length} photos)`}>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {galleryImages.map((img, i) => (
                      <div
                        key={i}
                        className="relative aspect-video rounded-xl overflow-hidden bg-muted group"
                      >
                        <Image
                          src={img.large ?? img.regular ?? img.thumbnail ?? '/placeholder-property.jpg'}
                          alt={img.caption ?? `${name} — photo ${i + 2}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(min-width: 768px) 33vw, 50vw"
                        />
                        {img.caption && (
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-xs text-white truncate">{img.caption}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>

            {/* ── RIGHT COLUMN: booking widget ── */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <BookingWidget listingId={id} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Chip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border/60 bg-[#111214] text-[rgba(232,228,220,0.65)] ${className ?? ''}`}
    >
      {children}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-[#e8e4dc] border-b border-border/40 pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

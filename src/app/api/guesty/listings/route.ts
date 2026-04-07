/**
 * @fileoverview GET /api/guesty/listings
 * Proxies to Guesty Booking Engine API: GET https://booking.guesty.com/api/listings
 * Uses canonical booking-api.ts client with Upstash Redis token cache.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { getListings, GuestyAPIError, GuestyRateLimitError } from '@/lib/guesty/booking-api';

export const runtime = 'edge';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const sp = req.nextUrl.searchParams;

  try {
    const data = await getListings({
      limit: sp.has('limit') ? Number(sp.get('limit')) : 20,
      cursor: sp.get('cursor') ?? undefined,
      checkIn: sp.get('checkIn') ?? undefined,
      checkOut: sp.get('checkOut') ?? undefined,
      city: sp.get('city') ?? undefined,
      country: sp.get('country') ?? undefined,
      numberOfBedrooms: sp.has('bedrooms') ? Number(sp.get('bedrooms')) : undefined,
      numberOfBathrooms: sp.has('bathrooms') ? Number(sp.get('bathrooms')) : undefined,
      minOccupancy: sp.has('minOccupancy') ? Number(sp.get('minOccupancy')) : undefined,
      minPrice: sp.has('minPrice') ? Number(sp.get('minPrice')) : undefined,
      maxPrice: sp.has('maxPrice') ? Number(sp.get('maxPrice')) : undefined,
      currency: sp.get('currency') ?? undefined,
      propertyType: sp.get('propertyType') ?? undefined,
      roomType: sp.get('roomType') ?? undefined,
      listingType: (sp.get('listingType') as 'SINGLE' | 'MTL') ?? undefined,
      petsAllowed: sp.has('petsAllowed') ? sp.get('petsAllowed') === 'true' : undefined,
      includeAmenities: sp.get('includeAmenities') ?? undefined,
      fields: sp.get('fields') ?? undefined,
    });
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' },
    });
  } catch (err) {
    if (err instanceof GuestyRateLimitError) {
      return NextResponse.json({ error: 'Rate limited' }, {
        status: 429,
        headers: { 'Retry-After': String(err.retryAfter) },
      });
    }
    if (err instanceof GuestyAPIError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[api/guesty/listings]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

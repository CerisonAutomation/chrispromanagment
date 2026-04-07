/**
 * @fileoverview GET /api/guesty/listings
 * Proxies to Guesty Booking Engine API: GET https://booking.guesty.com/api/listings
 * Uses Result pattern for error handling.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { getListingsResult } from '@/lib/guesty/booking-api';

export const runtime = 'edge';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const sp = req.nextUrl.searchParams;

  try {
    const result = await getListingsResult({
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

    if (!result.success) {
      console.error('[api/guesty/listings]', result.error.message);
      return NextResponse.json({ error: result.error.message }, { status: 502 });
    }

    return NextResponse.json(result.data, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' },
    });
  } catch (err) {
    console.error('[api/guesty/listings]', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
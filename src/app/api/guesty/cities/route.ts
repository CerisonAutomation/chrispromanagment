/**
 * @fileoverview GET /api/guesty/cities
 * Returns all cities that have active Guesty Booking Engine listings.
 * Use this to populate city search dropdowns in GuestyPropertySearch block.
 *
 * GBE Endpoint: GET https://booking.guesty.com/api/cities
 *
 * Response: string[] (array of city names)
 */

import { type NextRequest, NextResponse } from 'next/server';
import { guestyBookingFetch, GuestyAPIError, GuestyRateLimitError } from '@/lib/guesty/booking-api';

export const runtime = 'edge';

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const data = await guestyBookingFetch('/api/cities');
    return NextResponse.json(data, {
      status: 200,
      headers: {
        // Cities change rarely — cache aggressively
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
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
    console.error('[api/guesty/cities]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

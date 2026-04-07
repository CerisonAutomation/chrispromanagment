/**
 * @fileoverview GET /api/guesty/reviews?listingId={listingId}
 * Returns guest reviews for a specific listing from the Guesty Booking Engine.
 *
 * GBE Endpoint: GET https://booking.guesty.com/api/reviews?listingId=
 *
 * Query params:
 *   listingId (required)
 *   limit     (optional, default 20, max 100)
 *   cursor    (optional, for pagination)
 *
 * Response: { results: Review[], cursor?: string, count: number }
 */

import { type NextRequest, NextResponse } from 'next/server';
import { guestyBookingFetch, GuestyAPIError, GuestyRateLimitError } from '@/lib/guesty/booking-api';

export const runtime = 'edge';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get('listingId');

  if (!listingId) {
    return NextResponse.json({ error: 'listingId query param is required' }, { status: 400 });
  }

  const limit = searchParams.get('limit') ?? '20';
  const cursor = searchParams.get('cursor');

  const qs = new URLSearchParams({ listingId, limit });
  if (cursor) qs.set('cursor', cursor);

  try {
    const data = await guestyBookingFetch(`/api/reviews?${qs.toString()}`);
    return NextResponse.json(data, {
      status: 200,
      headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' },
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
    console.error('[api/guesty/reviews]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

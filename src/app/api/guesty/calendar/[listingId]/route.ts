/**
 * @fileoverview GET /api/guesty/calendar/{listingId}?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Proxies to: GET https://booking.guesty.com/api/listings/{listingId}/calendar
 *
 * Per-day response shape:
 *   { date, minNights, isBaseMinNights, status, cta, ctd }
 *   status: 'available' | 'unavailable' | 'reserved' | 'booked'
 *   cta = closed to arrival, ctd = closed to departure
 */

import { type NextRequest, NextResponse } from 'next/server';
import { getListingCalendar, GuestyAPIError, GuestyRateLimitError } from '@/lib/guesty/booking-api';

export const runtime = 'edge';

export async function GET(
  req: NextRequest,
  { params }: { params: { listingId: string } },
): Promise<NextResponse> {
  const from = req.nextUrl.searchParams.get('from');
  const to = req.nextUrl.searchParams.get('to');

  if (!from || !to) {
    return NextResponse.json(
      { error: 'Query params from and to are required in YYYY-MM-DD format' },
      { status: 400 },
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return NextResponse.json(
      { error: 'from and to must be in YYYY-MM-DD format' },
      { status: 400 },
    );
  }

  try {
    const calendar = await getListingCalendar(params.listingId, from, to);
    return NextResponse.json(calendar, {
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
    console.error('[api/guesty/calendar]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

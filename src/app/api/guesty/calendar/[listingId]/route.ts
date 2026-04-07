/**
 * @fileoverview GET /api/guesty/calendar/{listingId}?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Proxies to: GET https://booking.guesty.com/api/listings/{listingId}/calendar
 * Uses Result pattern for error handling.
 *
 * Per-day response shape:
 *   { date, minNights, isBaseMinNights, status, cta, ctd }
 *   status: 'available' | 'unavailable' | 'reserved' | 'booked'
 *   cta = closed to arrival, ctd = closed to departure
 */

import { type NextRequest, NextResponse } from 'next/server';
import { getListingCalendarResult } from '@/lib/guesty/booking-api';

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
    const result = await getListingCalendarResult(params.listingId, from, to);
    
    if (!result.success) {
      console.error('[api/guesty/calendar]', result.error.message);
      return NextResponse.json({ error: result.error.message }, { status: 502 });
    }

    return NextResponse.json(result.data, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' },
    });
  } catch (err) {
    console.error('[api/guesty/calendar]', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
/**
 * @fileoverview GET /api/guesty/reviews?listingId={id}
 * Returns guest reviews for a Guesty listing.
 * Proxies to: GET https://booking.guesty.com/api/reviews?listingId={id}
 */

import { type NextRequest, NextResponse } from 'next/server';
import { getReviewsResult } from '@/lib/guesty/booking-api-result';

export const runtime = 'edge';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const listingId = req.nextUrl.searchParams.get('listingId');

  if (!listingId) {
    return NextResponse.json({ error: 'Missing required query param: listingId' }, { status: 400 });
  }

  try {
    const result = await getReviewsResult(listingId);

    if (!result.success) {
      console.error('[api/guesty/reviews]', result.error.message);
      return NextResponse.json({ error: result.error.message }, { status: 502 });
    }

    return NextResponse.json(result.data, {
      headers: { 'Cache-Control': 's-maxage=1800, stale-while-revalidate=3600' },
    });
  } catch (err) {
    console.error('[api/guesty/reviews]', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

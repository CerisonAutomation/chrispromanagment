/**
 * @fileoverview GET /api/guesty/reviews?listingId=
 * Returns guest reviews for a specific listing.
 * Runtime: nodejs (Upstash Redis)
 */

import { NextResponse, type NextRequest } from 'next/server';
import { getReviewsResult } from '@/lib/guesty/booking-api-result';

export const runtime = 'nodejs';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const listingId = req.nextUrl.searchParams.get('listingId');

  if (!listingId) {
    return NextResponse.json({ error: 'Missing required query param: listingId' }, { status: 400 });
  }

  const result = await getReviewsResult(listingId);

  if (!result.success) {
    console.error('[api/guesty/reviews]', result.error.message);
    return NextResponse.json({ error: result.error.message }, { status: 502 });
  }

  return NextResponse.json(result.data, {
    headers: { 'Cache-Control': 's-maxage=1800, stale-while-revalidate=300' },
  });
}

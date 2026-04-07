/**
 * @fileoverview GET /api/guesty/reviews?listingId={listingId}
 * Returns guest reviews for a specific listing from the Guesty Booking Engine.
 * Uses Result pattern for error handling.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { getReviewsResult } from '@/lib/guesty/booking-api';

export const runtime = 'edge';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get('listingId');

  if (!listingId) {
    return NextResponse.json({ error: 'listingId query param is required' }, { status: 400 });
  }

  try {
    const result = await getReviewsResult(listingId);
    
    if (!result.success) {
      console.error('[api/guesty/reviews]', result.error.message);
      return NextResponse.json({ error: result.error.message }, { status: 502 });
    }

    return NextResponse.json({ results: result.data, count: result.data?.length ?? 0 }, {
      status: 200,
      headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' },
    });
  } catch (err) {
    console.error('[api/guesty/reviews]', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
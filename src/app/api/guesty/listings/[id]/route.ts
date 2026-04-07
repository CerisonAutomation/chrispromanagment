/**
 * @fileoverview GET /api/guesty/listings/[id]
 * Returns a single Guesty Booking Engine listing by ID.
 * Proxies to: GET https://booking.guesty.com/api/listings/{listingId}
 */
import { NextRequest, NextResponse } from 'next/server';
import { getListingResult } from '@/lib/guesty/booking-api-result';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Missing listing id' }, { status: 400 });
  }

  try {
    const result = await getListingResult(id);

    if (!result.success) {
      console.error('[api/guesty/listings/[id]]', result.error.message);
      return NextResponse.json({ error: result.error.message }, { status: 502 });
    }

    return NextResponse.json(result.data, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' },
    });
  } catch (err) {
    console.error('[api/guesty/listings/[id]]', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

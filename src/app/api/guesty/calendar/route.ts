/**
 * GET /api/guesty/calendar?listingId=xxx&from=YYYY-MM-DD&to=YYYY-MM-DD
 * Returns availability + pricing calendar for a listing.
 * Used by GuestyBookingWidget and GuestyPropertyDetail blocks.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getCalendar } from '@/lib/guesty';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = req.nextUrl;
    const listingId = searchParams.get('listingId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!listingId || !from || !to) {
      return NextResponse.json({ error: 'listingId, from, and to are required' }, { status: 400 });
    }

    const calendar = await getCalendar(listingId, from, to);
    return NextResponse.json(calendar, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (error) {
    console.error('[/api/guesty/calendar]', error);
    return NextResponse.json({ error: 'Failed to fetch calendar', details: String(error) }, { status: 502 });
  }
}

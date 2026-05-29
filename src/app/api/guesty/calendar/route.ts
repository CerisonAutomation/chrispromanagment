/**
 * GET /api/guesty/calendar?listingId=xxx&from=YYYY-MM-DD&to=YYYY-MM-DD
 * Returns availability + pricing calendar for a listing.
 * Uses Result<T, E> pattern for explicit error handling.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getListingCalendar } from '@/lib/guesty-api';

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

    const result = await getListingCalendar(listingId, from, to);
    
    if (!result.success) {
      console.error('[/api/guesty/calendar]', result.error.message);
      return NextResponse.json({ 
        error: 'Failed to fetch calendar', 
        details: result.error.message 
      }, { status: 502 });
    }

    return NextResponse.json(result.data, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (error) {
    console.error('[/api/guesty/calendar]', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to fetch calendar', details: message }, { status: 502 });
  }
}
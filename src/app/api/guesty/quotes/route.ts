/**
 * POST /api/guesty/quotes
 * Returns a pricing quote for a date range + listing.
 * Body: { listingId, checkIn, checkOut, guestsCount? }
 * Used by GuestyBookingWidget for real-time price display.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getQuote } from '@/lib/guesty';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as {
      listingId?: string;
      checkIn?: string;
      checkOut?: string;
      guestsCount?: number;
    };

    if (!body.listingId || !body.checkIn || !body.checkOut) {
      return NextResponse.json(
        { error: 'listingId, checkIn, and checkOut are required' },
        { status: 400 }
      );
    }

    const quote = await getQuote({
      listingId: body.listingId,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      guestsCount: body.guestsCount ?? 1,
    });

    return NextResponse.json(quote);
  } catch (error) {
    console.error('[/api/guesty/quotes]', error);
    return NextResponse.json({ error: 'Failed to get quote', details: String(error) }, { status: 502 });
  }
}

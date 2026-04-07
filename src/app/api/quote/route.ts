/**
 * @fileoverview Booking quote API — returns pricing for a stay.
 * POST /api/quote { listingId, checkIn, checkOut, guests }
 */
import { NextRequest, NextResponse } from 'next/server';
import { getBookingQuote } from '@/lib/guesty';
import { db } from '@/lib/db';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as { listingId: string; checkIn: string; checkOut: string; guests: number };
    const { listingId, checkIn, checkOut, guests = 1 } = body;
    if (!listingId || !checkIn || !checkOut) {
      return NextResponse.json({ error: 'Missing required fields: listingId, checkIn, checkOut' }, { status: 400 });
    }
    const result = await getBookingQuote(listingId, checkIn, checkOut, guests);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 503 });
    // Store quote in database for analytics
    const { error: dbError } = await db.from('quotes').insert({
      listing_id: listingId, check_in: checkIn, check_out: checkOut,
      guests, quote_data: result.data,
    }).then(() => null).catch(() => null); // fire-and-forget
    return NextResponse.json(result.data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

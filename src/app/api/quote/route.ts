/**
 * @fileoverview Booking quote API — returns pricing for a stay.
 * POST /api/quote { listingId, checkIn, checkOut, guests }
 * Uses Result<T, E> pattern for explicit error handling.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getBookingQuote } from '@/lib/guesty-api';
import { db } from '@/lib/db';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as { 
      listingId: string; 
      checkIn: string; 
      checkOut: string; 
      guests: number 
    };
    
    const { listingId, checkIn, checkOut, guests = 1 } = body;
    
    if (!listingId || !checkIn || !checkOut) {
      return NextResponse.json({ 
        error: 'Missing required fields: listingId, checkIn, checkOut' 
      }, { status: 400 });
    }
    
    const result = await getBookingQuote({ listingId, checkIn, checkOut, guestsCount: guests });
    
    if (!result.success) {
      console.error('[API] /api/quote:', result.error.message);
      return NextResponse.json({ error: result.error.message }, { status: 503 });
    }
    
    // Store quote in database for analytics (fire-and-forget)
    try {
      await db.from('quotes').insert({
        listing_id: listingId,
        check_in: checkIn,
        check_out: checkOut,
        guests,
        quote_data: result.data,
      });
    } catch (dbError) {
      console.warn('[API] /api/quote: failed to store quote:', dbError);
    }
    
    return NextResponse.json(result.data);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('[API] /api/quote:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
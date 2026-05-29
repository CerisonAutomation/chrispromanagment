/**
 * @fileoverview Booking quote API — returns pricing for a stay.
 * POST /api/quote { listingId, checkIn, checkOut, guests }
 * Uses Result<T, E> pattern for explicit error handling.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getBookingQuote } from '@/lib/guesty-api';

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
    
    // TODO: Store quote in database for analytics (requires quotes table helper in db.ts)
    
    return NextResponse.json(result.data);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('[API] /api/quote:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
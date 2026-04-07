/**
 * @fileoverview GET /api/guesty/cities
 * Returns all cities that have active Guesty Booking Engine listings.
 * Use this to populate city search dropdowns in GuestyPropertySearch block.
 * Uses Result pattern for error handling.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { getCitiesResult } from '@/lib/guesty/booking-api';

export const runtime = 'edge';

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const result = await getCitiesResult();
    
    if (!result.success) {
      console.error('[api/guesty/cities]', result.error.message);
      return NextResponse.json({ error: result.error.message }, { status: 502 });
    }

    return NextResponse.json(result.data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (err) {
    console.error('[api/guesty/cities]', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
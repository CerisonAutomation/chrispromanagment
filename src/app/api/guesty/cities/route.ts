/**
 * @fileoverview GET /api/guesty/cities
 * Returns all available cities from the Guesty Booking Engine.
 * Runtime: nodejs (Upstash Redis)
 */

import { NextResponse } from 'next/server';
import { getCitiesResult } from '@/lib/guesty/booking-api-result';

export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse> {
  const result = await getCitiesResult();

  if (!result.success) {
    console.error('[api/guesty/cities]', result.error.message);
    return NextResponse.json({ error: result.error.message }, { status: 502 });
  }

  return NextResponse.json(result.data, {
    headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=300' },
  });
}

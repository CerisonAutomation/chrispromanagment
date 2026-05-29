/**
 * @fileoverview POST /api/guesty/quotes
 * Creates a Guesty Booking Engine price quote.
 * Runtime: nodejs (Upstash Redis)
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createQuoteResult } from '@/lib/guesty/booking-api-result';
import { type CreateQuoteParams } from '@/lib/guesty/booking-api';

export const runtime = 'nodejs';

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: CreateQuoteParams;
  try {
    body = (await req.json()) as CreateQuoteParams;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.listingId || !body.checkInDateLocalized || !body.checkOutDateLocalized || !body.guestsCount) {
    return NextResponse.json(
      { error: 'Required: listingId, checkInDateLocalized, checkOutDateLocalized, guestsCount' },
      { status: 400 },
    );
  }

  const result = await createQuoteResult(body);

  if (!result.success) {
    console.error('[api/guesty/quotes]', result.error.message);
    return NextResponse.json({ error: result.error.message }, { status: 502 });
  }

  return NextResponse.json(result.data);
}

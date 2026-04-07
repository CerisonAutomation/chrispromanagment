/**
 * @fileoverview POST /api/guesty/quotes
 * Creates a Guesty Booking Engine price quote.
 * Proxies to: POST https://booking.guesty.com/api/reservations/quotes
 * Uses Result pattern for error handling.
 *
 * PRICE DISPLAY RULE:
 *   Use response.rates.ratePlans[0].money.farePaid for the guest-facing price.
 *   NEVER use hostPayout — that is the host revenue after Guesty fees.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createQuoteResult } from '@/lib/guesty/booking-api';
import { z } from 'zod';

export const runtime = 'edge';

const QuoteRequestSchema = z.object({
  listingId: z.string().min(6, 'listingId must be at least 6 characters'),
  checkInDateLocalized: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  checkOutDateLocalized: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  guestsCount: z.number().int().min(1).max(20),
  coupons: z.string().optional(),
}).refine(
  (d) => new Date(d.checkOutDateLocalized) > new Date(d.checkInDateLocalized),
  { message: 'checkOutDateLocalized must be after checkInDateLocalized' },
);

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = QuoteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await createQuoteResult(parsed.data);
    
    if (!result.success) {
      console.error('[api/guesty/quotes]', result.error.message);
      return NextResponse.json({ error: result.error.message }, { status: 502 });
    }

    return NextResponse.json(result.data);
  } catch (err) {
    console.error('[api/guesty/quotes]', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
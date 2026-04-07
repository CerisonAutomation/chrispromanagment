/**
 * @fileoverview POST /api/guesty/quotes
 * Creates a Guesty Booking Engine price quote.
 * Proxies to: POST https://booking.guesty.com/api/reservations/quotes
 *
 * PRICE DISPLAY RULE:
 *   Use response.rates.ratePlans[0].money.farePaid for the guest-facing price.
 *   NEVER use hostPayout — that is the host revenue after Guesty fees.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createQuote, GuestyAPIError, GuestyRateLimitError } from '@/lib/guesty/booking-api';
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
    const quote = await createQuote(parsed.data);
    return NextResponse.json(quote);
  } catch (err) {
    if (err instanceof GuestyRateLimitError) {
      return NextResponse.json({ error: 'Rate limited' }, {
        status: 429,
        headers: { 'Retry-After': String(err.retryAfter) },
      });
    }
    if (err instanceof GuestyAPIError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[api/guesty/quotes]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

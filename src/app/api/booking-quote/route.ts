/**
 * @fileoverview POST /api/booking-quote — Guesty booking quote proxy.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { getBookingQuote } from '@/lib/guesty-api';
import { z } from 'zod';

export const runtime = 'nodejs';

const QuoteBodySchema = z.object({
  listingId: z.string().min(1),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  guestsCount: z.number().int().min(1).max(20),
  source: z.string().optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = QuoteBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  try {
    const quote = await getBookingQuote(parsed.data);
    return NextResponse.json(quote);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Quote failed';
    console.error('[API] /api/booking-quote:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

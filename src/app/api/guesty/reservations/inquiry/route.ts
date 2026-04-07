/**
 * @fileoverview POST /api/guesty/reservations/inquiry
 * Creates an INQUIRY (request-to-book, NOT instantly confirmed) from a valid Guesty quote.
 * Use when instant booking is disabled for the listing.
 *
 * GBE Endpoint: POST https://booking.guesty.com/api/reservations/quotes/{quoteId}/inquiry
 *
 * Same body shape as /instant — same response shape (confirmationCode present).
 * Status will be 'pending' or 'inquiry' rather than 'confirmed'.
 */

import { type NextRequest, NextResponse } from 'next/server';
import {
  createInquiry,
  GuestyAPIError,
  GuestyRateLimitError,
} from '@/lib/guesty/booking-api';
import { z } from 'zod';

export const runtime = 'edge';

const BodySchema = z.object({
  quoteId: z.string().min(6, 'quoteId required'),
  ratePlanId: z.string().min(6, 'ratePlanId required'),
  ccToken: z
    .string()
    .min(4)
    .refine((v) => v.startsWith('pm_'), {
      message: 'ccToken must be a Stripe SCA pm_... token, not a legacy tok_... token',
    }),
  guest: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { quoteId, ratePlanId, ccToken, guest } = parsed.data;

  try {
    const reservation = await createInquiry(quoteId, { ratePlanId, ccToken, guest });
    return NextResponse.json(reservation, { status: 201 });
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
    console.error('[api/guesty/reservations/inquiry]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

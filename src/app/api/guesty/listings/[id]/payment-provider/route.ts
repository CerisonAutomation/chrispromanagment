/**
 * @fileoverview GET /api/guesty/listings/[id]/payment-provider
 * Returns the Stripe publishable key for a specific Guesty listing.
 *
 * GBE Endpoint: GET https://booking.guesty.com/api/listings/{listingId}/payment-provider
 *
 * This MUST be called before using Stripe.js to tokenize a guest's card.
 * The returned publishableKey is listing-specific and used to initialize Stripe:
 *   const stripe = await loadStripe(publishableKey);
 *   const { paymentMethod } = await stripe.createPaymentMethod({ type: 'card', card });
 *   // paymentMethod.id will be pm_... — use as ccToken in /reservations/instant
 *
 * Response: { publishableKey: string }
 */

import { type NextRequest, NextResponse } from 'next/server';
import { guestyBookingFetch, GuestyAPIError, GuestyRateLimitError } from '@/lib/guesty/booking-api';

export const runtime = 'edge';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id: listingId } = params;

  if (!listingId || listingId.length < 4) {
    return NextResponse.json({ error: 'listingId is required' }, { status: 400 });
  }

  try {
    const data = await guestyBookingFetch<{ publishableKey: string }>(
      `/api/listings/${listingId}/payment-provider`
    );
    return NextResponse.json(data, {
      status: 200,
      headers: {
        // Cache for 5 minutes — publishableKey rarely changes
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
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
    console.error('[api/guesty/listings/[id]/payment-provider]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

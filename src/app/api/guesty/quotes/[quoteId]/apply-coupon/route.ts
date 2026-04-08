/**
 * @fileoverview POST /api/guesty/quotes/[quoteId]/apply-coupon
 * Apply a coupon code to an existing quote.
 * Runtime: nodejs (Upstash Redis)
 */

import { NextResponse } from 'next/server';
import { applyCouponResult } from '@/lib/guesty/booking-api-result';

export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{ quoteId: string }>;
}

export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
  const { quoteId } = await params;

  if (!quoteId) {
    return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 });
  }

  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { code } = body;
  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
  }

  const result = await applyCouponResult(quoteId, code);

  if (!result.success) {
    console.error('[api/guesty/quotes/[quoteId]/apply-coupon]', result.error.message);
    return NextResponse.json({ error: result.error.message }, { status: 502 });
  }

  return NextResponse.json(result.data, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

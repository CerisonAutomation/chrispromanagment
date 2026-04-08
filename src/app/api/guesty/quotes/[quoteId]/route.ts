/**
 * @fileoverview GET /api/guesty/quotes/[quoteId]
 * Retrieve an existing quote by ID.
 * Runtime: nodejs (Upstash Redis)
 */

import { NextResponse } from 'next/server';
import { getQuoteResult } from '@/lib/guesty/booking-api-result';

export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{ quoteId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams): Promise<NextResponse> {
  const { quoteId } = await params;

  if (!quoteId) {
    return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 });
  }

  const result = await getQuoteResult(quoteId);

  if (!result.success) {
    console.error('[api/guesty/quotes/[quoteId]]', result.error.message);
    return NextResponse.json({ error: result.error.message }, { status: 502 });
  }

  return NextResponse.json(result.data, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

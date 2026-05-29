/**
 * @fileoverview GET /api/guesty/listings/[id]
 * Returns a single Guesty listing by ID.
 * Runtime: nodejs (Upstash Redis)
 */

import { NextResponse, type NextRequest } from 'next/server';
import { getListingResult, getListingOpenApi } from '@/lib/guesty/booking-api-result';

export { getListingOpenApi };
export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Missing listing id' }, { status: 400 });
  }

  const result = await getListingResult(id);

  if (!result.success) {
    console.error('[api/guesty/listings/[id]]', result.error.message);
    const status = (result.error as { status?: number }).status ?? 502;
    return NextResponse.json({ error: result.error.message }, { status });
  }

  return NextResponse.json(result.data, {
    headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' },
  });
}

/**
 * GET /api/guesty/listings/:id
 * Returns full detail for a single Guesty listing.
 * Uses Result pattern for error handling.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getListingOpenApi } from '@/lib/guesty';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Missing listing id' }, { status: 400 });

    const result = await getListingOpenApi(id);
    
    if (!result.success) {
      const is404 = result.error.message.includes('404') || result.error.message.includes('not found');
      console.error('[/api/guesty/listings/[id]]', result.error.message);
      return NextResponse.json(
        { error: is404 ? 'Listing not found' : 'Failed to fetch listing', details: result.error.message },
        { status: is404 ? 404 : 502 }
      );
    }

    return NextResponse.json(result.data, {
      headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' },
    });
  } catch (error) {
    console.error('[/api/guesty/listings/[id]]', error);
    const message = error instanceof Error ? error.message : String(error);
    const is404 = message.includes('404');
    return NextResponse.json(
      { error: is404 ? 'Listing not found' : 'Failed to fetch listing', details: message },
      { status: is404 ? 404 : 502 }
    );
  }
}
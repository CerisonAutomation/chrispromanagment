/**
 * GET /api/guesty/listings/:id
 * Returns full detail for a single Guesty listing.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getListing } from '@/lib/guesty';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Missing listing id' }, { status: 400 });
    const listing = await getListing(id);
    return NextResponse.json(listing, {
      headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' },
    });
  } catch (error) {
    console.error('[/api/guesty/listings/[id]]', error);
    const is404 = String(error).includes('404');
    return NextResponse.json(
      { error: is404 ? 'Listing not found' : 'Failed to fetch listing', details: String(error) },
      { status: is404 ? 404 : 502 }
    );
  }
}

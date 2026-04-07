/**
 * GET /api/guesty/listings
 * Proxies Guesty listings with pagination, tag filtering, and Next.js response caching.
 * Query params: limit, skip, tags
 */
import { NextRequest, NextResponse } from 'next/server';
import { getListings } from '@/lib/guesty';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = req.nextUrl;
    const limit = Math.min(Number(searchParams.get('limit') ?? '25'), 100);
    const skip = Number(searchParams.get('skip') ?? '0');
    const tags = searchParams.get('tags') ?? undefined;

    const data = await getListings({ limit, skip, tags });

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('[/api/guesty/listings]', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings', details: String(error) },
      { status: 502 }
    );
  }
}

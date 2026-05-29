/**
 * @fileoverview Properties API — proxies Guesty listings to client.
 * GET /api/properties?limit=20&skip=0
 * Uses Result<T, E> pattern for explicit error handling.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getListings } from '@/lib/guesty';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;
  const limit = Math.min(Number(searchParams.get('limit') ?? 20), 100);
  const skip = Number(searchParams.get('skip') ?? 0);
  
  const result = await getListings({ limit, skip });
  
  if (!result.success) {
    console.error('[API] /api/properties:', result.error.message);
    return NextResponse.json({ 
      error: result.error.message, 
      listings: [] 
    }, { status: 503 });
  }
  
  return NextResponse.json({ 
    listings: result.data.results ?? [], 
    count: result.data.count ?? 0,
    limit: result.data.limit,
    skip: result.data.skip
  });
}
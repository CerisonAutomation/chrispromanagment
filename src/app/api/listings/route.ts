/**
 * @fileoverview GET /api/listings — proxies Guesty listings to the client.
 * Server-side only. Credentials never reach the browser.
 * Uses Result<T, E> pattern for explicit error handling.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { getListings } from '@/lib/guesty-api';

export const runtime = 'nodejs';
export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);
    const skip = Math.max(parseInt(searchParams.get('skip') ?? '0', 10), 0);
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);

    const result = await getListings({ limit, skip, tags });
    
    if (!result.success) {
      console.error('[API] /api/listings:', result.error.message);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API] /api/listings:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
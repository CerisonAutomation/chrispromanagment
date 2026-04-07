/**
 * @fileoverview GET /api/listings/[id] — single Guesty listing proxy.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { getListing } from '@/lib/guesty-api';

export const runtime = 'nodejs';
export const revalidate = 60;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const data = await getListing(id);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[API] /api/listings/${id}:`, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

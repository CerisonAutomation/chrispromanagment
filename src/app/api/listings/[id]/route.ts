/**
 * @fileoverview GET /api/listings/[id] — single Guesty listing proxy.
 * Uses Result<T, E> pattern for explicit error handling.
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
  
  const result = await getListing(id);
  
  if (!result.success) {
    console.error(`[API] /api/listings/${id}:`, result.error.message);
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }
  
  return NextResponse.json(result.data);
}
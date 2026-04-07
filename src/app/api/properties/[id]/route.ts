/**
 * @fileoverview Single property API.
 * GET /api/properties/[id]
 */
import { NextRequest, NextResponse } from 'next/server';
import { getListing } from '@/lib/guesty';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const result = await getListing(id);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 404 });
  return NextResponse.json(result.data);
}

/**
 * @fileoverview Property calendar availability API.
 * GET /api/properties/[id]/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
import { NextRequest, NextResponse } from 'next/server';
import { getListingCalendar } from '@/lib/guesty';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const { id } = await params;
  const { searchParams } = req.nextUrl;
  const from = searchParams.get('from') ?? new Date().toISOString().slice(0, 10);
  const to = searchParams.get('to') ?? new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
  const result = await getListingCalendar(id, from, to);
  if (result.error) return NextResponse.json({ error: result.error, days: [] }, { status: 503 });
  return NextResponse.json({ days: result.data ?? [] });
}

/**
 * @fileoverview GET /api/listings/[id]/calendar — availability calendar proxy.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { getListingCalendar } from '@/lib/guesty-api';

export const runtime = 'nodejs';
export const revalidate = 300;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: 'startDate and endDate query params are required' },
      { status: 400 }
    );
  }

  try {
    const data = await getListingCalendar(id, startDate, endDate);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[API] /api/listings/${id}/calendar:`, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

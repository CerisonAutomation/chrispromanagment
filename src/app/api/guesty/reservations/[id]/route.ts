/**
 * GET /api/guesty/reservations/:id
 */
import { NextRequest, NextResponse } from 'next/server';
import { getReservation } from '@/lib/guesty';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Missing reservation id' }, { status: 400 });
    const reservation = await getReservation(id);
    return NextResponse.json(reservation);
  } catch (error) {
    const is404 = String(error).includes('404');
    return NextResponse.json(
      { error: is404 ? 'Reservation not found' : 'Failed to fetch reservation', details: String(error) },
      { status: is404 ? 404 : 502 }
    );
  }
}

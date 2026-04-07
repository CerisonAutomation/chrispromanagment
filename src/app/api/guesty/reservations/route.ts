/**
 * GET /api/guesty/reservations
 * Returns reservations for the authenticated guest.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getReservations } from '@/lib/guesty';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = req.nextUrl;
    const limit = Math.min(Number(searchParams.get('limit') ?? '20'), 100);
    const skip = Number(searchParams.get('skip') ?? '0');
    const listingId = searchParams.get('listingId') ?? undefined;
    const status = searchParams.get('status') ?? undefined;
    const from = searchParams.get('from') ?? undefined;
    const to = searchParams.get('to') ?? undefined;

    let guestEmail: string | undefined;
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.slice(7);
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        guestEmail = payload.email as string | undefined;
      } catch { /* non-JWT token, ignore */ }
    }

    const data = await getReservations({ guestEmail, listingId, limit, skip, status, from, to });
    return NextResponse.json(data);
  } catch (error) {
    console.error('[/api/guesty/reservations]', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservations', details: String(error) },
      { status: 502 }
    );
  }
}

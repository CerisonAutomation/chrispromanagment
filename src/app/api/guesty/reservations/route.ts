/**
 * GET /api/guesty/reservations
 * Returns reservations for the authenticated guest.
 * Reads guest email from Authorization header (Bearer JWT) or query param for dev.
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

    // Extract guest email from Supabase JWT if present
    let guestEmail: string | undefined;
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.slice(7);
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        guestEmail = payload.email as string | undefined;
      } catch { /* non-JWT token, ignore */ }
    }

    const data = await getReservations({ guestEmail, listingId, limit, skip });
    return NextResponse.json(data);
  } catch (error) {
    console.error('[/api/guesty/reservations]', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservations', details: String(error) },
      { status: 502 }
    );
  }
}

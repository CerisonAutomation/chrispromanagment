/**
 * GET /api/guesty/reservations?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Returns reservations from Guesty. Admin-only.
 * Uses Result pattern for error handling.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getReservations } from '@/lib/guesty';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const adminKey = req.headers.get('x-admin-key');
  if (adminKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = req.nextUrl;
    const from = searchParams.get('from') ?? undefined;
    const to = searchParams.get('to') ?? undefined;
    const listingId = searchParams.get('listingId') ?? undefined;
    const limit = Math.min(Number(searchParams.get('limit') ?? '20'), 100);
    const skip = Number(searchParams.get('skip') ?? '0');

    const result = await getReservations({ from, to, listingId, limit, skip });
    
    if (!result.success) {
      console.error('[/api/guesty/reservations]', result.error.message);
      return NextResponse.json({ error: result.error.message }, { status: 502 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('[/api/guesty/reservations]', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
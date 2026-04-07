/**
 * GET  /api/guesty/conversations?reservationId=xxx
 * POST /api/guesty/conversations/:id/messages  → send host message
 * Admin-only.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getConversations } from '@/lib/guesty';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const adminKey = req.headers.get('x-admin-key');
  if (adminKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = req.nextUrl;
    const data = await getConversations({
      reservationId: searchParams.get('reservationId') ?? undefined,
      limit: Math.min(Number(searchParams.get('limit') ?? '20'), 100),
      skip: Number(searchParams.get('skip') ?? '0'),
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('[/api/guesty/conversations]', error);
    return NextResponse.json({ error: String(error) }, { status: 502 });
  }
}

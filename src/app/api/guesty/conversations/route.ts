/**
 * GET /api/guesty/conversations?reservationId=xxx
 * POST /api/guesty/conversations/:id/messages → send host message
 * Admin-only. Uses Result pattern for error handling.
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
    const result = await getConversations({
      reservationId: searchParams.get('reservationId') ?? undefined,
      limit: Math.min(Number(searchParams.get('limit') ?? '20'), 100),
      skip: Number(searchParams.get('skip') ?? '0'),
    });
    
    if (!result.success) {
      console.error('[/api/guesty/conversations]', result.error.message);
      return NextResponse.json({ error: result.error.message }, { status: 502 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('[/api/guesty/conversations]', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
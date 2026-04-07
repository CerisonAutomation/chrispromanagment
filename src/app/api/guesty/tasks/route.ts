/**
 * GET /api/guesty/tasks?listingId=xxx&reservationId=xxx&status=todo
 * Returns tasks for a listing or reservation. Admin-only.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getTasks } from '@/lib/guesty';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const adminKey = req.headers.get('x-admin-key');
  if (adminKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = req.nextUrl;
    const data = await getTasks({
      listingId: searchParams.get('listingId') ?? undefined,
      reservationId: searchParams.get('reservationId') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      limit: Math.min(Number(searchParams.get('limit') ?? '20'), 100),
      skip: Number(searchParams.get('skip') ?? '0'),
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('[/api/guesty/tasks]', error);
    return NextResponse.json({ error: String(error) }, { status: 502 });
  }
}

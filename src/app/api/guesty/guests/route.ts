/**
 * GET /api/guesty/guests?search=name&limit=20&skip=0
 * Returns guest profiles. Requires admin auth (service role only — not exposed to public).
 */
import { NextRequest, NextResponse } from 'next/server';
import { getGuests } from '@/lib/guesty';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Admin-only: validate service role header
    const authHeader = req.headers.get('x-admin-key');
    if (authHeader !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const limit = Math.min(Number(searchParams.get('limit') ?? '20'), 100);
    const skip = Number(searchParams.get('skip') ?? '0');
    const search = searchParams.get('search') ?? undefined;

    const data = await getGuests({ limit, skip, search });
    return NextResponse.json(data);
  } catch (error) {
    console.error('[/api/guesty/guests]', error);
    return NextResponse.json({ error: 'Failed to fetch guests', details: String(error) }, { status: 502 });
  }
}

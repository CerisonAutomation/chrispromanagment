/**
 * GET /api/guesty/guests?search=name&limit=20&skip=0
 * Returns guest profiles. Requires admin auth (service role only — not exposed to public).
 * Uses Result pattern for error handling.
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

    const result = await getGuests({ limit, skip, search });
    
    if (!result.success) {
      console.error('[/api/guesty/guests]', result.error.message);
      return NextResponse.json({ error: result.error.message }, { status: 502 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('[/api/guesty/guests]', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to fetch guests', details: message }, { status: 502 });
  }
}
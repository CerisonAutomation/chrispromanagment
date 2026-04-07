/**
 * POST /api/guesty/sync
 * Triggers a server-side Guesty → Supabase sync.
 * Protected by service role key. Safe to call from cron jobs / Vercel cron.
 *
 * Body: { resource: 'listings' | 'reservations', from?: string, to?: string }
 */
import { NextRequest, NextResponse } from 'next/server';
import { syncListings, syncReservations } from '@/lib/guesty';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const adminKey = req.headers.get('x-admin-key');
  if (adminKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json() as {
      resource: 'listings' | 'reservations';
      from?: string;
      to?: string;
    };

    if (body.resource === 'listings') {
      const result = await syncListings();
      return NextResponse.json(result);
    }

    if (body.resource === 'reservations') {
      const from = body.from ?? new Date(Date.now() - 90 * 86_400_000).toISOString().split('T')[0];
      const to = body.to ?? new Date(Date.now() + 365 * 86_400_000).toISOString().split('T')[0];
      const result = await syncReservations(from, to);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid resource. Use listings or reservations.' }, { status: 400 });
  } catch (error) {
    console.error('[/api/guesty/sync]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

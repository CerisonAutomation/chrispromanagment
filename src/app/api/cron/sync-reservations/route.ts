/**
 * @fileoverview GET /api/cron/sync-reservations
 * Vercel Cron endpoint — runs daily at 04:00 UTC (configured in vercel.json).
 * Enqueues a reservation sync for the rolling 90-day past + 365-day future window.
 *
 * Auth: Vercel Cron sets Authorization: Bearer {CRON_SECRET}
 */

import { type NextRequest, NextResponse } from 'next/server';
import { enqueueGuestySync } from '@/lib/qstash';

export const runtime = 'edge';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const from = new Date(Date.now() - 90 * 86_400_000).toISOString().split('T')[0] as string;
  const to = new Date(Date.now() + 365 * 86_400_000).toISOString().split('T')[0] as string;

  try {
    const { messageId } = await enqueueGuestySync('reservations', { from, to });
    console.log(`[cron/sync-reservations] Enqueued reservations sync: messageId=${messageId} from=${from} to=${to}`);
    return NextResponse.json({ enqueued: true, messageId, resource: 'reservations', from, to });
  } catch (err) {
    console.error('[cron/sync-reservations]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to enqueue sync' },
      { status: 500 },
    );
  }
}

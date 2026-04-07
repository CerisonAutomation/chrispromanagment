/**
 * @fileoverview GET /api/cron/sync-listings
 * Vercel Cron endpoint — runs daily at 03:00 UTC (configured in vercel.json).
 * Enqueues a full Guesty sync (listings + reservations) via QStash.
 *
 * BEFORE: Ran syncListings() inline — timeout risk on large datasets.
 * AFTER: Enqueues to QStash worker — non-blocking, durable, retried on failure.
 *
 * Auth: Vercel Cron sets Authorization: Bearer {CRON_SECRET}
 */

import { type NextRequest, NextResponse } from 'next/server';
import { enqueueGuestySync } from '@/lib/qstash';

export const runtime = 'edge';

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Vercel Cron HMAC verification
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { messageId } = await enqueueGuestySync('listings');
    console.log(`[cron/sync-listings] Enqueued listings sync: messageId=${messageId}`);
    return NextResponse.json({ enqueued: true, messageId, resource: 'listings' });
  } catch (err) {
    console.error('[cron/sync-listings]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to enqueue sync' },
      { status: 500 },
    );
  }
}

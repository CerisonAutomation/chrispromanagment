/**
 * @fileoverview POST /api/guesty/sync
 * Enqueues a Guesty sync job via QStash. Returns jobId immediately (<100ms).
 * Actual sync runs async in /api/qstash/worker (no Vercel 10s timeout risk).
 *
 * BEFORE: Ran sync inline → timed out on large datasets
 * AFTER:  Enqueues to QStash → worker processes async with full retry support
 *
 * Auth: x-admin-key header must match SUPABASE_SERVICE_ROLE_KEY
 * Progress: Poll GET /api/guesty/sync/progress?key={progressKey}
 */

import { type NextRequest, NextResponse } from 'next/server';
import { enqueueGuestySync } from '@/lib/qstash/client';
import { z } from 'zod';

export const runtime = 'edge';

const SyncRequestSchema = z.object({
  resource: z.enum(['listings', 'reservations', 'both']),
  from: z.string().optional(),
  to: z.string().optional(),
  /** Delay in seconds before job starts. Useful for scheduling. */
  delaySeconds: z.number().min(0).max(86400).optional(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const adminKey = req.headers.get('x-admin-key');
  if (adminKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = SyncRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { resource, from, to, delaySeconds } = parsed.data;

  try {
    const { messageId } = await enqueueGuestySync(resource, { from, to, delaySeconds });
    const progressKey = `sync:progress:guesty-sync-${resource}-${new Date().toISOString().split('T')[0]}`;

    return NextResponse.json({
      enqueued: true,
      messageId,
      progressKey,
      message: `Sync job for '${resource}' enqueued. Poll /api/guesty/sync/progress?key=${progressKey} for status.`,
    });
  } catch (err) {
    console.error('[api/guesty/sync]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to enqueue sync job' },
      { status: 500 },
    );
  }
}

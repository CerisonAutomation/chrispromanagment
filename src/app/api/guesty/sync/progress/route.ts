/**
 * @fileoverview GET /api/guesty/sync/progress?key={progressKey}
 * Reads sync job progress from Upstash Redis.
 * Poll this endpoint after enqueuing a sync job.
 *
 * Response shape:
 *   { status: 'running' | 'done' | 'error', synced, errors, durationMs, step? }
 */

import { type NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const runtime = 'edge';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const key = req.nextUrl.searchParams.get('key');
  if (!key) {
    return NextResponse.json({ error: 'key query param required' }, { status: 400 });
  }

  // Security: only allow reading sync:progress:* keys
  if (!key.startsWith('sync:progress:')) {
    return NextResponse.json({ error: 'Invalid key prefix' }, { status: 400 });
  }

  const progress = await redis.get<string>(key);
  if (!progress) {
    return NextResponse.json({ status: 'not_found', message: 'No progress data for this key yet.' }, { status: 404 });
  }

  try {
    const parsed: unknown = typeof progress === 'string' ? JSON.parse(progress) : progress;
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ raw: progress });
  }
}

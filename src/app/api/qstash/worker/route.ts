/**
 * @fileoverview POST /api/qstash/worker
 * Central QStash job receiver. All enqueued jobs are delivered here.
 *
 * SECURITY:
 *   Every incoming request is verified via HMAC-SHA256 using QStash signing keys.
 *   Invalid/tampered requests are rejected 401 before any processing.
 *
 * JOB ROUTING:
 *   Jobs are discriminated by payload.type and dispatched to handlers.
 *   Failed handlers throw → QStash retries automatically (per-job retry config).
 *
 * PATTERN (from upstash/qstash-examples + upstash/next-qstash):
 *   1. Verify signature
 *   2. Parse + validate payload with Zod
 *   3. Dispatch to typed handler
 *   4. Return 200 on success (anything else triggers QStash retry)
 */

import { type NextRequest, NextResponse } from 'next/server';
import { getQStashReceiver, JobPayloadSchema } from '@/lib/qstash/client';
import { syncListings, syncReservations } from '@/lib/guesty/sync';
import { invalidateGuestyToken } from '@/lib/guesty/booking-api';
import { createClient } from '@supabase/supabase-js';
import type { GuestySyncJob, GuestyWebhookJob } from '@/lib/qstash/client';
import { Redis } from '@upstash/redis';

export const runtime = 'nodejs'; // QStash verification requires Node crypto
export const maxDuration = 300;  // 5 min max (Vercel Pro) — upgrade to 900s for Enterprise

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ─── Signature Verification ──────────────────────────────────────────────────

async function verifyQStashSignature(req: NextRequest, rawBody: string): Promise<boolean> {
  const receiver = getQStashReceiver();
  const signature = req.headers.get('upstash-signature');
  if (!signature) return false;

  try {
    return await receiver.verify({
      signature,
      body: rawBody,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/qstash/worker`,
    });
  } catch {
    return false;
  }
}

// ─── Job Handlers ────────────────────────────────────────────────────────────

async function handleGuestySyncJob(job: GuestySyncJob): Promise<void> {
  const defaultFrom = new Date(Date.now() - 90 * 86_400_000).toISOString().split('T')[0] as string;
  const defaultTo = new Date(Date.now() + 365 * 86_400_000).toISOString().split('T')[0] as string;

  const opts = {
    idempotencyKey: job.idempotencyKey,
    progressKey: job.progressKey,
  };

  if (job.resource === 'listings' || job.resource === 'both') {
    await syncListings(opts);
  }

  if (job.resource === 'reservations' || job.resource === 'both') {
    await syncReservations(job.from ?? defaultFrom, job.to ?? defaultTo, opts);
  }
}

async function handleGuestyWebhookJob(job: GuestyWebhookJob): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const payload = job.payload as Record<string, unknown>;
  const event = job.event;

  // Upsert the webhook event
  const { error: insertError } = await supabase
    .from('guesty_webhook_events')
    .upsert({
      event,
      reservation_id: (payload.data as Record<string, unknown> | undefined)?.reservation
        ? ((payload.data as Record<string, unknown>).reservation as Record<string, unknown>)?._id
        : null,
      listing_id: (payload.data as Record<string, unknown> | undefined)?.listing
        ? ((payload.data as Record<string, unknown>).listing as Record<string, unknown>)?._id
        : null,
      payload: JSON.stringify(payload),
      received_at: job.receivedAt,
      processed_at: new Date().toISOString(),
    }, { onConflict: 'event,received_at' });

  if (insertError) throw new Error(`Webhook upsert failed: ${insertError.message}`);

  // If it's a reservation event, enqueue a reservation sync job
  const isReservationEvent = event.startsWith('reservation.');
  if (isReservationEvent) {
    const reservationId = ((payload.data as Record<string, unknown>)?.reservation as Record<string, unknown> | undefined)?._id as string | undefined;
    if (reservationId) {
      // Write to Redis for real-time dashboard updates
      await redis.set(
        `reservation:live:${reservationId}`,
        JSON.stringify({ event, updatedAt: job.receivedAt }),
        { ex: 3600 },
      );
    }
  }
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Read raw body for signature verification
  const rawBody = await req.text();

  // 2. Verify QStash HMAC-SHA256 signature
  const isValid = await verifyQStashSignature(req, rawBody);
  if (!isValid) {
    console.error('[qstash/worker] Invalid signature — request rejected');
    return NextResponse.json({ error: 'Invalid QStash signature' }, { status: 401 });
  }

  // 3. Parse and validate job payload
  let rawPayload: unknown;
  try {
    rawPayload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = JobPayloadSchema.safeParse(rawPayload);
  if (!parsed.success) {
    console.error('[qstash/worker] Invalid payload schema:', parsed.error.flatten());
    return NextResponse.json({ error: 'Invalid job payload', details: parsed.error.flatten() }, { status: 400 });
  }

  const job = parsed.data;
  const retryCount = Number(req.headers.get('upstash-retried') ?? '0');
  console.log(`[qstash/worker] Processing job type=${job.type} retry=${retryCount}`);

  // 4. Dispatch to typed handler
  try {
    switch (job.type) {
      case 'guesty.sync':
        await handleGuestySyncJob(job);
        break;
      case 'guesty.webhook':
        await handleGuestyWebhookJob(job);
        break;
      case 'guesty.reservation.sync':
        // Single reservation sync: invalidate token cache and re-sync listing
        await invalidateGuestyToken();
        console.log(`[qstash/worker] Single reservation sync: ${job.reservationId} from ${job.source}`);
        break;
      default: {
        const exhaustiveCheck: never = job;
        console.error('[qstash/worker] Unhandled job type:', exhaustiveCheck);
      }
    }

    console.log(`[qstash/worker] Job completed: type=${job.type}`);
    return NextResponse.json({ success: true, type: job.type });
  } catch (err) {
    // Throwing causes QStash to retry the job
    console.error(`[qstash/worker] Job failed (will retry): type=${job.type}`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Job handler failed' },
      { status: 500 }, // Non-2xx → QStash retries
    );
  }
}

/**
 * @fileoverview QStash client — canonical enterprise job queue.
 *
 * QStash is an HTTP-based durable message queue by Upstash.
 * Every job is:
 *   - Durable (survives serverless cold starts)
 *   - Retried automatically (configurable backoff)
 *   - Deduplicated (idempotency keys)
 *   - Signed (HMAC-SHA256 on delivery — verified by worker)
 *
 * Docs: https://upstash.com/docs/qstash
 *
 * COMPARISON vs current implementation:
 *   BEFORE: POST /api/guesty/sync → runs sync inline → times out on Vercel (10s limit)
 *   AFTER:  POST /api/guesty/sync → enqueues QStash job → returns jobId in <100ms
 *           QStash → POST /api/qstash/worker (up to 15 min, retried on failure)
 */

import { Client, Receiver } from '@upstash/qstash';
import { z } from 'zod';

// ─── Client singleton ────────────────────────────────────────────────────────────

let _qstashClient: Client | null = null;

function getQStashClient(): Client {
  if (!_qstashClient) {
    const token = process.env.QSTASH_TOKEN;
    if (!token) throw new Error('[QStash] Missing QSTASH_TOKEN env var.');
    _qstashClient = new Client({ token });
  }
  return _qstashClient;
}

/**
 * QStash signature receiver — used to verify HMAC signatures on incoming jobs.
 * Instantiated per-request (stateless).
 */
export function getQStashReceiver(): Receiver {
  const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;
  if (!currentSigningKey || !nextSigningKey) {
    throw new Error('[QStash] Missing QSTASH_CURRENT_SIGNING_KEY or QSTASH_NEXT_SIGNING_KEY.');
  }
  return new Receiver({ currentSigningKey, nextSigningKey });
}

// ─── Job Payload Types ────────────────────────────────────────────────────────

export const GuestySyncJobSchema = z.object({
  type: z.literal('guesty.sync'),
  resource: z.enum(['listings', 'reservations', 'both']),
  from: z.string().optional(),
  to: z.string().optional(),
  /** Unique key per job run — prevents duplicate processing on retry */
  idempotencyKey: z.string().optional(),
  /** Track progress in Redis under this key */
  progressKey: z.string().optional(),
});

export const GuestyWebhookJobSchema = z.object({
  type: z.literal('guesty.webhook'),
  event: z.string(),
  payload: z.record(z.unknown()),
  receivedAt: z.string(),
});

export const ReservationSyncJobSchema = z.object({
  type: z.literal('guesty.reservation.sync'),
  reservationId: z.string(),
  source: z.enum(['webhook', 'manual', 'cron']),
});

export const JobPayloadSchema = z.discriminatedUnion('type', [
  GuestySyncJobSchema,
  GuestyWebhookJobSchema,
  ReservationSyncJobSchema,
]);

export type GuestySyncJob = z.infer<typeof GuestySyncJobSchema>;
export type GuestyWebhookJob = z.infer<typeof GuestyWebhookJobSchema>;
export type ReservationSyncJob = z.infer<typeof ReservationSyncJobSchema>;
export type JobPayload = z.infer<typeof JobPayloadSchema>;

// ─── Retry Configs per Job Type ───────────────────────────────────────────────

const JOB_RETRY_CONFIG: Record<JobPayload['type'], number> = {
  'guesty.sync': 3,
  'guesty.webhook': 5,
  'guesty.reservation.sync': 4,
};

// ─── Publish API ─────────────────────────────────────────────────────────────

export interface PublishJobOptions {
  /** Delay in seconds before first delivery. Default: 0 */
  delaySeconds?: number;
  /** Deduplication window. If same key published again within window, ignored. */
  deduplicationId?: string;
  /** Override default retry count */
  retries?: number;
  /** Schedule via cron expression (QStash Schedules) */
  cron?: string;
}

/**
 * Enqueues a typed job to the QStash worker endpoint.
 * Returns the QStash message ID.
 *
 * The worker URL is: https://{NEXT_PUBLIC_SITE_URL}/api/qstash/worker
 * QStash will POST to this URL with HMAC signature for security.
 */
export async function publishJob(
  payload: JobPayload,
  options: PublishJobOptions = {},
): Promise<{ messageId: string }> {
  const client = getQStashClient();
  const workerUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/qstash/worker`;

  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    throw new Error('[QStash] Missing NEXT_PUBLIC_SITE_URL — required for worker URL.');
  }

  const retries = options.retries ?? JOB_RETRY_CONFIG[payload.type];

  const result = await client.publishJSON({
    url: workerUrl,
    body: payload,
    retries,
    delay: options.delaySeconds,
    deduplicationId: options.deduplicationId,
  });

  return { messageId: result.messageId };
}

/**
 * Convenience: enqueue a full Guesty sync job.
 * Non-blocking — returns immediately with a messageId.
 * Actual sync runs async in the worker up to 15 minutes.
 */
export async function enqueueGuestySync(
  resource: GuestySyncJob['resource'],
  options?: { from?: string; to?: string; delaySeconds?: number },
): Promise<{ messageId: string }> {
  const idempotencyKey = `guesty-sync-${resource}-${new Date().toISOString().split('T')[0]}`;
  return publishJob(
    {
      type: 'guesty.sync',
      resource,
      from: options?.from,
      to: options?.to,
      idempotencyKey,
      progressKey: `sync:progress:${idempotencyKey}`,
    },
    { deduplicationId: idempotencyKey, delaySeconds: options?.delaySeconds },
  );
}

/**
 * Convenience: enqueue a Guesty webhook event for async processing.
 * Webhook handler returns 200 immediately; processing happens in background.
 */
export async function enqueueWebhookEvent(
  event: string,
  payload: Record<string, unknown>,
): Promise<{ messageId: string }> {
  return publishJob({
    type: 'guesty.webhook',
    event,
    payload,
    receivedAt: new Date().toISOString(),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCHEDULES API — Recurring jobs via QStash (bypasses Vercel cron limits)
// ═══════════════════════════════════════════════════════════════════════════════

export interface CreateScheduleOptions {
  /** Cron expression — e.g. every 2 hours: "0 0/2 * * *" */
  cron: string;
  /** Optional delay before first run */
  delaySeconds?: number;
  /** Override default retry count */
  retries?: number;
}

export interface Schedule {
  scheduleId: string;
  cron: string;
  destination: string;
  nextRunAt: number;
}

/**
 * Create a QStash Schedule for recurring jobs.
 * This bypasses Vercel's cron job limits by using Upstash's scheduling.
 * 
 * Usage: Create schedule once (via CLI or admin UI), it runs forever.
 * 
 * @example
 * await createSchedule(
 *   'calendar-refresh-bi-hourly',
 *   { type: 'guesty.calendar.refresh', listingIds: ['all'], daysAhead: 90 },
 *   { cron: '0 0/2 * * *' }
 * );
 */
export async function createSchedule(
  scheduleId: string,
  payload: JobPayload,
  options: CreateScheduleOptions,
): Promise<{ scheduleId: string; nextRunAt: number }> {
  const client = getQStashClient();
  const workerUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/qstash/worker`;

  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    throw new Error('[QStash] Missing NEXT_PUBLIC_SITE_URL — required for worker URL.');
  }

  const retries = options.retries ?? JOB_RETRY_CONFIG[payload.type];

  const result = await client.schedules.create({
    scheduleId,
    destination: workerUrl,
    cron: options.cron,
    body: payload,
    retries,
    delay: options.delaySeconds,
  });

  return { scheduleId: result.scheduleId, nextRunAt: result.nextRunAt };
}

/**
 * List all QStash schedules.
 */
export async function listSchedules(): Promise<Schedule[]> {
  const client = getQStashClient();
  const schedules = await client.schedules.list();
  return schedules.map((s): Schedule => ({
    scheduleId: s.scheduleId,
    cron: s.cron,
    destination: s.destination,
    nextRunAt: s.nextRunAt,
  }));
}

/**
 * Delete a QStash schedule by ID.
 */
export async function deleteSchedule(scheduleId: string): Promise<void> {
  const client = getQStashClient();
  await client.schedules.delete({ scheduleId });
}

/**
 * Create or replace a QStash schedule (idempotent).
 * Deletes existing schedule with same ID before creating.
 */
export async function upsertSchedule(
  scheduleId: string,
  payload: JobPayload,
  options: CreateScheduleOptions,
): Promise<{ scheduleId: string; nextRunAt: number; created: boolean }> {
  try {
    await deleteSchedule(scheduleId);
  } catch {
    // Schedule didn't exist, that's fine
  }
  const result = await createSchedule(scheduleId, payload, options);
  return { ...result, created: true };
}

// ─── RESULT PATTERN WRAPPERS (Consistency with codebase) ────────────────────────

/**
 * Result-based wrapper for publishJob - explicit error handling
 */
export async function publishJobResult(
  payload: JobPayload,
  options: PublishJobOptions = {}
): Promise<Result<{ messageId: string }, Error>> {
  try {
    const result = await publishJob(payload, options);
    return ok(result);
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}

/**
 * Result-based wrapper for enqueueGuestySync - explicit error handling
 */
export async function enqueueGuestySyncResult(
  resource: GuestySyncJob['resource'],
  options?: { from?: string; to?: string; delaySeconds?: number }
): Promise<Result<{ messageId: string }, Error>> {
  try {
    const result = await enqueueGuestySync(resource, options);
    return ok(result);
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}

/**
 * Result-based wrapper for enqueueWebhookEvent - explicit error handling
 */
export async function enqueueWebhookEventResult(
  event: string,
  payload: Record<string, unknown>
): Promise<Result<{ messageId: string }, Error>> {
  try {
    const result = await enqueueWebhookEvent(event, payload);
    return ok(result);
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}

/**
 * Result-based wrapper for createSchedule - explicit error handling
 */
export async function createScheduleResult(
  scheduleId: string,
  payload: JobPayload,
  options: CreateScheduleOptions
): Promise<Result<{ scheduleId: string; nextRunAt: number }, Error>> {
  try {
    const result = await createSchedule(scheduleId, payload, options);
    return ok(result);
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}

/**
 * Result-based wrapper for listSchedules - explicit error handling
 */
export async function listSchedulesResult(): Promise<Result<Schedule[], Error>> {
  try {
    const result = await listSchedules();
    return ok(result);
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}

/**
 * Result-based wrapper for deleteSchedule - explicit error handling
 */
export async function deleteScheduleResult(
  scheduleId: string
): Promise<Result<void, Error>> {
  try {
    await deleteSchedule(scheduleId);
    return ok(undefined);
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}

/**
 * Result-based wrapper for upsertSchedule - explicit error handling
 */
export async function upsertScheduleResult(
  scheduleId: string,
  payload: JobPayload,
  options: CreateScheduleOptions
): Promise<Result<{ scheduleId: string; nextRunAt: number; created: boolean }, Error>> {
  try {
    const result = await upsertSchedule(scheduleId, payload, options);
    return ok(result);
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}

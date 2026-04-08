/**
 * @fileoverview POST /api/guesty/webhook
 * Receives Guesty webhook events. Returns 200 immediately.
 * Processing is offloaded to QStash via enqueueWebhookEvent().
 *
 * BEFORE: Processed webhook inline (blocking, timeout risk, no retry)
 * AFTER:
 *   1. HMAC-SHA256 signature verification (crypto-grade, not plaintext compare)
 *   2. Return 200 immediately (Guesty requires fast response)
 *   3. Enqueue to QStash for durable async processing with retries
 *
 * Register this URL in Guesty: https://{SITE_URL}/api/guesty/webhook
 * Set GUESTY_WEBHOOK_SECRET in env vars — configure in Guesty dashboard.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { enqueueWebhookEvent } from '@/lib/qstash/client';
import type { GuestyWebhookPayload } from '@/types/guesty';

export const runtime = 'nodejs'; // crypto requires Node runtime
export const dynamic = 'force-dynamic';

/**
 * Verifies Guesty webhook signature using HMAC-SHA256.
 * Uses timing-safe comparison to prevent timing attacks.
 * @see https://support.guesty.com/hc/en-us/articles/webhook-signatures
 */
function verifyGuestyWebhookSignature(
  rawBody: string,
  incomingSignature: string,
  secret: string,
): boolean {
  try {
    const expected = createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('hex');
    const expectedBuf = Buffer.from(expected, 'hex');
    const incomingBuf = Buffer.from(incomingSignature.replace(/^sha256=/, ''), 'hex');
    if (expectedBuf.length !== incomingBuf.length) return false;
    return timingSafeEqual(expectedBuf, incomingBuf);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text();

  // HMAC-SHA256 signature verification
  const webhookSecret = process.env.GUESTY_WEBHOOK_SECRET;
  if (webhookSecret) {
    const signature =
      req.headers.get('x-guesty-signature') ??
      req.headers.get('x-hub-signature-256') ??
      req.headers.get('authorization') ??
      '';

    if (!verifyGuestyWebhookSignature(rawBody, signature, webhookSecret)) {
      console.warn('[webhook] Signature mismatch — rejected');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  let payload: GuestyWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as GuestyWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { event } = payload;
  if (!event) {
    return NextResponse.json({ error: 'Missing event field' }, { status: 400 });
  }

  // Enqueue to QStash for durable async processing — fire and forget
  try {
    const { messageId } = await enqueueWebhookEvent(event, payload as unknown as Record<string, unknown>);
    console.log(`[webhook] Enqueued event=${event} messageId=${messageId}`);
  } catch (err) {
    // Log but still return 200 to prevent Guesty from retrying
    console.error('[webhook] Failed to enqueue to QStash:', err);
  }

  // Always return 200 immediately — Guesty requires fast webhook response
  return NextResponse.json({ received: true });
}

/**
 * @file rate-limit — Edge-compatible in-memory rate limiter.
 * Uses a sliding window algorithm via Map. For multi-instance production,
 * replace with Upstash Redis (@upstash/ratelimit).
 */
import type { NextRequest } from 'next/server';

interface RateLimitOptions {
  /** Max requests per window */
  limit: number;
  /** Time window: '1m' | '5m' | '1h' */
  window: '1m' | '5m' | '1h';
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

const windowMs: Record<RateLimitOptions['window'], number> = {
  '1m': 60_000,
  '5m': 300_000,
  '1h': 3_600_000,
};

// In-memory store — acceptable for Edge single-instance / Vercel serverless
const store = new Map<string, { count: number; resetAt: number }>();

/**
 * Edge-compatible rate limiter using IP + path as key.
 * @param req - NextRequest instance
 * @param options - limit and window configuration
 */
export async function rateLimit(req: NextRequest, options: RateLimitOptions): Promise<RateLimitResult> {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
  const key = `${ip}:${req.nextUrl.pathname}`;
  const now = Date.now();
  const windowDuration = windowMs[options.window];

  const existing = store.get(key);

  if (!existing || now > existing.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowDuration });
    return { success: true, remaining: options.limit - 1, resetAt: now + windowDuration };
  }

  if (existing.count >= options.limit) {
    return { success: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count++;
  return { success: true, remaining: options.limit - existing.count, resetAt: existing.resetAt };
}

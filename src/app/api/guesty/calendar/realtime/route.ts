/**
 * @fileoverview GET /api/guesty/calendar/realtime?listingId=xxx&from=YYYY-MM-DD&to=YYYY-MM-DD
 * Realtime calendar fetch from Guesty Booking Engine API — no caching, no cron needed.
 * 
 * This replaces the 2-hour sync cron by fetching calendar data on-demand when guests
 * view a property or check availability. Always fresh, no stale data.
 * 
 * Security:
 *   - Guesty token stays server-side (Redis-cached BE API token)
 *   - No Guesty secrets or listing IDs exposed to frontend
 *   - Server-side only — frontend calls this API, not Guesty directly
 * 
 * Rate Limiting:
 *   - Guesty BE API: 100 req/min per IP (we're server-side, so per deployment)
 *   - Use Redis to cache responses briefly (30s) for same listing/date range
 * 
 * @example
 * GET /api/guesty/calendar/realtime?listingId=6123456789abcdef&from=2026-04-07&to=2026-04-21
 */

import { type NextRequest, NextResponse } from 'next/server';
import { getListingCalendar } from '@/lib/guesty/booking-api';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/** Cache realtime calendar for 30s to prevent hammering Guesty on rapid requests */
const CACHE_TTL_SECONDS = 30;

export const runtime = 'nodejs';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get('listingId');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  // Validate required params
  if (!listingId || !from || !to) {
    return NextResponse.json(
      { error: 'Missing required params: listingId, from, to' },
      { status: 400 }
    );
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(from) || !dateRegex.test(to)) {
    return NextResponse.json(
      { error: 'Invalid date format. Use YYYY-MM-DD' },
      { status: 400 }
    );
  }

  // Validate date range (max 90 days to prevent abuse)
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff < 0) {
    return NextResponse.json(
      { error: 'from date must be before to date' },
      { status: 400 }
    );
  }
  
  if (daysDiff > 90) {
    return NextResponse.json(
      { error: 'Date range too large. Max 90 days allowed.' },
      { status: 400 }
    );
  }

  // Check Redis cache first (30s short-term cache)
  const cacheKey = `calendar:realtime:${listingId}:${from}:${to}`;
  try {
    const cached = await redis.get<{ calendar: unknown[]; cachedAt: string }>(cacheKey);
    if (cached) {
      return NextResponse.json({
        listingId,
        from,
        to,
        calendar: cached.calendar,
        source: 'cache',
        cachedAt: cached.cachedAt,
      });
    }
  } catch {
    // Cache miss or Redis error — proceed to fetch
  }

  // Fetch realtime from Guesty
  try {
    const calendar = await getListingCalendar(listingId, from, to);

    // Cache for 30s
    await redis.set(
      cacheKey,
      { calendar, cachedAt: new Date().toISOString() },
      { ex: CACHE_TTL_SECONDS }
    );

    return NextResponse.json({
      listingId,
      from,
      to,
      calendar,
      source: 'guesty-realtime',
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[calendar/realtime] Guesty fetch failed:', err);
    
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch calendar';
    const statusCode = errorMessage.includes('not found') ? 404 : 502;
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

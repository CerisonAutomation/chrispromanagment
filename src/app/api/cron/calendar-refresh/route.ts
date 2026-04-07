/**
 * @fileoverview GET /api/cron/calendar-refresh
 * Vercel Cron endpoint — runs every 2 hours (configured in vercel.json).
 * Reads all active listing IDs from Supabase and enqueues a calendar refresh.
 *
 * Why every 2h: Calendar availability changes frequently around bookings.
 * Why QStash: Listing count could be large; process async with retries.
 *
 * Auth: Vercel Cron sets Authorization: Bearer {CRON_SECRET}
 */

import { type NextRequest, NextResponse } from 'next/server';
import { enqueueCalendarRefresh } from '@/lib/qstash';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs'; // needs Supabase

export async function GET(req: NextRequest): Promise<NextResponse> {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Fetch all active listing IDs from Supabase
    const { data: listings, error } = await supabase
      .from('guesty_listings')
      .select('guestyListingId')
      .eq('active', true)
      .limit(200);

    if (error) throw new Error(`Supabase query failed: ${error.message}`);

    const listingIds = (listings ?? []).map((l: { guestyListingId: string }) => l.guestyListingId).filter(Boolean);

    if (listingIds.length === 0) {
      return NextResponse.json({ enqueued: false, message: 'No active listings found' });
    }

    const { messageId } = await enqueueCalendarRefresh(listingIds, 90);
    console.log(`[cron/calendar-refresh] Enqueued calendar refresh for ${listingIds.length} listings: messageId=${messageId}`);

    return NextResponse.json({ enqueued: true, messageId, listingCount: listingIds.length });
  } catch (err) {
    console.error('[cron/calendar-refresh]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to enqueue calendar refresh' },
      { status: 500 },
    );
  }
}

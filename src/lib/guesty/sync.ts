/**
 * Guesty → Supabase sync helpers.
 * Server-side only. Upserts Guesty data into Supabase for offline access,
 * analytics, and Owner Dashboard.
 *
 * Based on: dferrera-creator/margin-app sync.ts
 * Enhanced with: full listing sync + type-safe Supabase client.
 */

import { createClient } from '@supabase/supabase-js';
import { getAllListings, getAllReservations } from './resources';
import { mapListing, mapReservation } from './mapper';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('[guesty/sync] Missing Supabase env vars.');
  return createClient(url, key);
}

/**
 * Sync all active Guesty listings into `guesty_listings` table.
 * Safe to call on a cron schedule.
 */
export async function syncListings(): Promise<{ synced: number; errors: number }> {
  const supabase = getAdminClient();
  const listings = await getAllListings();
  let synced = 0;
  let errors = 0;

  for (const raw of listings) {
    const mapped = mapListing(raw);
    const { error } = await supabase
      .from('guesty_listings')
      .upsert(
        { ...mapped, updated_at: new Date().toISOString() },
        { onConflict: 'guestyListingId' }
      );
    if (error) { console.error('[syncListings]', mapped.guestyListingId, error.message); errors++; }
    else synced++;
  }

  console.log(`[syncListings] synced=${synced} errors=${errors}`);
  return { synced, errors };
}

/**
 * Sync reservations for a date range into `guesty_reservations` table.
 */
export async function syncReservations(
  from: string,
  to: string
): Promise<{ synced: number; errors: number }> {
  const supabase = getAdminClient();
  const reservations = await getAllReservations(from, to);
  let synced = 0;
  let errors = 0;

  for (const raw of reservations) {
    const mapped = mapReservation(raw);
    const { error } = await supabase
      .from('guesty_reservations')
      .upsert(
        {
          ...mapped,
          checkIn: mapped.checkIn.toISOString(),
          checkOut: mapped.checkOut.toISOString(),
          bookingDate: mapped.bookingDate?.toISOString() ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'guestyReservationId' }
      );
    if (error) { console.error('[syncReservations]', mapped.guestyReservationId, error.message); errors++; }
    else synced++;
  }

  console.log(`[syncReservations] synced=${synced} errors=${errors}`);
  return { synced, errors };
}

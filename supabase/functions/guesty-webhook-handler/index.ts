// guesty-webhook-handler — receives Guesty webhook events and syncs to Supabase.
// Enhanced with idempotency, event deduplication, and comprehensive error handling.
// Register this URL in Guesty Developer Portal → Webhooks.
// Required env vars: GUESTY_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-guesty-signature, x-guesty-event-id",
};

function ok(data: unknown = { ok: true }) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function err(msg: string, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

/**
 * Generate a simple hash for deduplication
 */
function generateHash(data: Record<string, unknown>): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
return new Response(null, { headers: CORS });
}

  // Verify webhook secret — fail closed if not configured
  const sig = req.headers.get("x-guesty-signature");
  const secret = Deno.env.get("GUESTY_WEBHOOK_SECRET");
  if (!secret) {
return err("Webhook secret not configured", 500);
}
  if (sig !== secret) {
return err("Unauthorized", 401);
}

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON");
  }

  const eventType = body.eventName as string | undefined;
  const payload = body.data as Record<string, unknown> | undefined;
  const eventId = body.eventId as string | undefined;

  if (!eventType || !payload) {
return err("Missing eventName or data");
}

  // Generate idempotency key from event ID or hash
  const idempotencyKey = eventId || generateHash({ eventType, payload });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  try {
    // Check if this event was already processed (idempotency)
    const { data: existingEvent } = await admin
      .from("guesty_webhook_events")
      .select("*")
      .eq("event_id", idempotencyKey)
      .single();

    if (existingEvent) {
      console.log(`Event ${idempotencyKey} already processed, skipping`);
      return ok({ 
        message: "Event already processed", 
        eventId: idempotencyKey,
        processedAt: existingEvent.processed_at 
      });
    }

    // Log the raw event for debugging
    await admin.from("guesty_webhook_log").insert({
      event_type: eventType,
      payload: body,
      received_at: new Date().toISOString(),
    }).then(() => {}, () => {});

    // Mark event as processing
    await admin.from("guesty_webhook_events").insert({
      event_id: idempotencyKey,
      event_type: eventType,
      payload: body,
      status: "processing",
      received_at: new Date().toISOString(),
      processed_at: null,
    });

    // Process the event
    let result: Record<string, unknown> = {};

    if (eventType.startsWith("listing.")) {
      result = await handleListingEvent(admin, payload, eventType);
    } else if (eventType.startsWith("reservation.")) {
      result = await handleReservationEvent(admin, payload, eventType);
    } else {
      result = { skipped: eventType };
    }

    // Mark event as processed
    await admin
      .from("guesty_webhook_events")
      .update({ 
        status: "processed",
        processed_at: new Date().toISOString(),
        result,
      })
      .eq("event_id", idempotencyKey);

    return ok({ ...result, eventId: idempotencyKey });

  } catch (error) {
    console.error("Webhook processing error:", error);
    
    // Mark event as failed
    await admin
      .from("guesty_webhook_events")
      .update({ 
        status: "failed",
        processed_at: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      })
      .eq("event_id", idempotencyKey)
      .then(() => {}, () => {});

    return err("Webhook processing failed", 500);
  }
});

/**
 * Handle listing webhook events
 */
async function handleListingEvent(
  admin: ReturnType<typeof createClient>,
  payload: Record<string, unknown>,
  eventType: string
): Promise<Record<string, unknown>> {
  const listing = payload as {
    _id?: string;
    title?: string;
    address?: { full?: string; city?: string };
    accommodates?: number;
    bedrooms?: number;
    bathrooms?: number;
    prices?: { currency?: string; basePrice?: number };
    pictures?: { thumbnail?: string }[];
    amenities?: string[];
    active?: boolean;
  };

  if (!listing._id) {
throw new Error("Missing listing._id");
}

  // Handle deletion
  if (eventType === "listing.deleted") {
    await admin
      .from("guesty_properties_cache")
      .update({ 
        active: false,
        last_synced_at: new Date().toISOString(),
      })
      .eq("guesty_id", listing._id);

    return { action: "deleted", listingId: listing._id };
  }

  // Upsert listing
  await admin.from("guesty_properties_cache").upsert({
    guesty_id: listing._id,
    title: listing.title ?? null,
    address_full: listing.address?.full ?? null,
    city: listing.address?.city ?? null,
    accommodates: listing.accommodates ?? null,
    bedrooms: listing.bedrooms ?? null,
    bathrooms: listing.bathrooms ?? null,
    base_price: listing.prices?.basePrice ?? null,
    currency: listing.prices?.currency ?? "EUR",
    thumbnail: listing.pictures?.[0]?.thumbnail ?? null,
    amenities: listing.amenities ?? [],
    active: listing.active ?? true,
    last_synced_at: new Date().toISOString(),
  }, { onConflict: "guesty_id" });

  // Update sync status
  await admin.from("guesty_sync_status").upsert({
    entity: "listing",
    entity_id: listing._id,
    last_synced_at: new Date().toISOString(),
    sync_status: "synced",
  }, { onConflict: "entity,entity_id" });

  return { synced: listing._id, action: eventType };
}

/**
 * Handle reservation webhook events
 */
async function handleReservationEvent(
  admin: ReturnType<typeof createClient>,
  payload: Record<string, unknown>,
  eventType: string
): Promise<Record<string, unknown>> {
  const res = payload as {
    _id?: string;
    listingId?: string;
    listing?: { _id?: string };
    guest?: { _id?: string; firstName?: string; lastName?: string; email?: string };
    checkIn?: string;
    checkOut?: string;
    nightsCount?: number;
    guestsCount?: number;
    money?: { totalAmount?: number; currency?: string };
    status?: string;
    source?: string;
  };

  const listingId = (res.listingId ?? res.listing?._id) as string | undefined;
  const reservationId = res._id;

  if (!reservationId) {
throw new Error("Missing reservation._id");
}

  const checkIn = res.checkIn ? new Date(res.checkIn).toISOString().slice(0, 10) : null;
  const checkOut = res.checkOut ? new Date(res.checkOut).toISOString().slice(0, 10) : null;
  const status = res.status ?? "confirmed";

  // Handle deletion
  if (eventType === "reservation.deleted" || status === "canceled") {
    await admin
      .from("reservations_cache")
      .update({ 
        status: "cancelled",
        last_synced_at: new Date().toISOString(),
      })
      .eq("guesty_id", reservationId);

    // Update sync status
    await admin.from("guesty_sync_status").upsert({
      entity: "reservation",
      entity_id: reservationId,
      last_synced_at: new Date().toISOString(),
      sync_status: "synced",
    }, { onConflict: "entity,entity_id" });

    return { synced: reservationId, listing: listingId, action: "cancelled" };
  }

  // Upsert reservation
  await admin.from("reservations_cache").upsert({
    guesty_id: reservationId,
    listing_id: listingId ?? null,
    guest_name: [res.guest?.firstName, res.guest?.lastName].filter(Boolean).join(" ") || null,
    guest_email: res.guest?.email ?? null,
    check_in: checkIn,
    check_out: checkOut,
    nights: res.nightsCount ?? null,
    guests: res.guestsCount ?? null,
    total_price: res.money?.totalAmount ?? null,
    currency: res.money?.currency ?? "EUR",
    status: status === "canceled" ? "cancelled" : status,
    channel: res.source ?? null,
    last_synced_at: new Date().toISOString(),
  }, { onConflict: "guesty_id" });

  // Update sync status
  await admin.from("guesty_sync_status").upsert({
    entity: "reservation",
    entity_id: reservationId,
    last_synced_at: new Date().toISOString(),
    sync_status: "synced",
  }, { onConflict: "entity,entity_id" });

  return { synced: reservationId, listing: listingId, action: eventType };
}

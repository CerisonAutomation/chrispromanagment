// guesty-webhook-handler — receives Guesty webhook events and syncs to Supabase.
// Register this URL in Guesty Developer Portal → Webhooks.
// Required env vars: GUESTY_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-guesty-signature",
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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  // Verify webhook secret
  const sig = req.headers.get("x-guesty-signature");
  const secret = Deno.env.get("GUESTY_WEBHOOK_SECRET");
  if (secret && sig !== secret) return err("Unauthorized", 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON");
  }

  const eventType = body.eventName as string | undefined;
  const payload = body.data as Record<string, unknown> | undefined;

  if (!eventType || !payload) return err("Missing eventName or data");

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  // Log the raw event for debugging
  await admin.from("guesty_webhook_log").insert({
    event_type: eventType,
    payload: body,
    received_at: new Date().toISOString(),
  }).then(() => {}, () => {});

  if (eventType.startsWith("listing.")) {
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

    if (!listing._id) return err("Missing listing._id");

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

    return ok({ synced: listing._id });
  }

  if (eventType.startsWith("reservation.")) {
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

    if (reservationId) {
      const checkIn = res.checkIn ? new Date(res.checkIn).toISOString().slice(0, 10) : null;
      const checkOut = res.checkOut ? new Date(res.checkOut).toISOString().slice(0, 10) : null;
      const status = res.status ?? "confirmed";

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
      }, { onConflict: "guesty_id" }).then(() => {}, () => {});
    }

    return ok({ synced: reservationId, listing: listingId });
  }

  return ok({ skipped: eventType });
});

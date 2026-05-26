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
    // Invalidate any per-listing availability cache rows for the affected listing
    const listingId = (payload.listingId ?? payload.listing?._id) as string | undefined;
    if (listingId) {
      await admin
        .from("guesty_response_cache")
        .delete()
        .like("cache_key", `%${listingId}%`)
        .then(() => {}, () => {});
    }
    return ok({ invalidated: listingId });
  }

  return ok({ skipped: eventType });
});

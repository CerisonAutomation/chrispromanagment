// Guesty Booking Engine API BFF — vault-backed token management.
// Reads the cached access token from `guesty_token_vault` (refreshed by
// pg_cron every 6h via the guesty-token-refresh function). Falls back to
// an inline OAuth fetch + vault upsert if the cached token is missing or
// expires within the safety window.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TOKEN_URLS = [
  "https://booking.guesty.com/oauth2/token",
  "https://open-api.guesty.com/oauth2/token",
];
const BEAPI_BASE = "https://booking.guesty.com/api";
const SAFETY_WINDOW_MS = 5 * 60 * 1000; // refresh if <5min left

const supaUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(supaUrl, serviceKey, { auth: { persistSession: false } });

// In-memory cache (per cold start) on top of the vault.
let memToken: { value: string; expiresAt: number } | null = null;
let inflight: Promise<string> | null = null;

async function fetchFreshTokenAndStore(): Promise<{ token: string; expiresAt: Date }> {
  const clientId = Deno.env.get("GUESTY_CLIENT_ID");
  const clientSecret = Deno.env.get("GUESTY_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("Guesty credentials not configured");

  const attempts = [
    { url: TOKEN_URLS[0], scope: "booking_engine:api" },
    { url: TOKEN_URLS[0] },
    { url: TOKEN_URLS[1], scope: "open-api" },
    { url: TOKEN_URLS[1] },
  ];
  let lastErr = "";
  for (const a of attempts) {
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      ...(a.scope ? { scope: a.scope } : {}),
    });
    const res = await fetch(a.url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body,
    });
    const text = await res.text();
    if (res.ok) {
      const j = JSON.parse(text);
      const expiresMs = (j.expires_in ?? 86400) * 1000;
      const expiresAt = new Date(Date.now() + expiresMs);
      await admin.from("guesty_token_vault").upsert({
        id: 1,
        access_token: j.access_token,
        expires_at: expiresAt.toISOString(),
        scope: a.scope ?? null,
        last_refreshed_at: new Date().toISOString(),
      });
      return { token: j.access_token, expiresAt };
    }
    lastErr = `${a.url} ${res.status}: ${text.slice(0, 200)}`;
  }
  throw new Error(`Token fetch failed — ${lastErr}`);
}

async function getToken(): Promise<string> {
  const now = Date.now();
  if (memToken && memToken.expiresAt - SAFETY_WINDOW_MS > now) return memToken.value;
  if (inflight) return inflight;

  inflight = (async () => {
    // Try vault first
    const { data: vault } = await admin
      .from("guesty_token_vault")
      .select("access_token, expires_at")
      .eq("id", 1)
      .maybeSingle();

    if (vault?.access_token && vault.expires_at) {
      const expiresAt = new Date(vault.expires_at).getTime();
      if (expiresAt - SAFETY_WINDOW_MS > now) {
        memToken = { value: vault.access_token, expiresAt };
        return vault.access_token;
      }
    }

    // Vault stale or empty — refresh inline and persist
    const { token, expiresAt } = await fetchFreshTokenAndStore();
    memToken = { value: token, expiresAt: expiresAt.getTime() };
    return token;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

async function beapi(path: string, init: RequestInit = {}, attempt = 0): Promise<Response> {
  const token = await getToken();
  const url = path.startsWith("http") ? path : `${BEAPI_BASE}${path.startsWith("/") ? path : "/" + path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if ((res.status === 401 || res.status === 403) && attempt === 0) {
    memToken = null;
    return beapi(path, init, 1);
  }
  if (res.status === 429 && attempt < 2) {
    await new Promise((r) => setTimeout(r, 500 * (attempt + 1) + Math.random() * 200));
    return beapi(path, init, attempt + 1);
  }
  return res;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") ?? "listings";
    const body = req.method !== "GET" && req.method !== "HEAD" ? await req.json().catch(() => ({})) : {};

    switch (action) {
      case "token-status": {
        const { data } = await admin
          .from("guesty_token_vault")
          .select("expires_at, last_refreshed_at, refresh_count, scope")
          .eq("id", 1)
          .maybeSingle();
        const now = Date.now();
        const expiresAtMs = data?.expires_at ? new Date(data.expires_at).getTime() : null;
        return json({
          has_token: !!data?.access_token || !!memToken,
          expires_at: data?.expires_at ?? null,
          seconds_until_expiry: expiresAtMs ? Math.floor((expiresAtMs - now) / 1000) : null,
          last_refreshed_at: data?.last_refreshed_at ?? null,
          refresh_count: data?.refresh_count ?? 0,
          memory_cached: !!memToken,
          scope: data?.scope ?? null,
        });
      }
      case "ping-token": {
        const token = await getToken();
        return json({ ok: !!token, length: token?.length ?? 0 });
      }
      case "listings": {
        const qs = new URLSearchParams();
        ["city", "minOccupancy", "checkIn", "checkOut", "limit", "skip", "minBedrooms", "amenities"].forEach((k) => {
          const v = url.searchParams.get(k);
          if (v) qs.set(k, v);
        });
        const r = await beapi(`/listings${qs.toString() ? `?${qs}` : ""}`);
        return json(await r.json(), r.status);
      }
      case "search": {
        const qs = new URLSearchParams();
        for (const [k, v] of url.searchParams.entries()) {
          if (k !== "action" && v) qs.set(k, v);
        }
        const r = await beapi(`/listings${qs.toString() ? `?${qs}` : ""}`);
        return json(await r.json(), r.status);
      }
      case "listing": {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "Missing id" }, 400);
        const r = await beapi(`/listings/${encodeURIComponent(id)}`);
        return json(await r.json(), r.status);
      }
      case "cities": {
        const qs = new URLSearchParams();
        ["limit", "searchText"].forEach((k) => {
          const v = url.searchParams.get(k);
          if (v) qs.set(k, v);
        });
        const r = await beapi(`/cities${qs.toString() ? `?${qs}` : ""}`);
        return json(await r.json(), r.status);
      }
      case "calendar": {
        const id = url.searchParams.get("id");
        const from = url.searchParams.get("from");
        const to = url.searchParams.get("to");
        if (!id || !from || !to) return json({ error: "Missing id/from/to" }, 400);
        const r = await beapi(`/listings/${encodeURIComponent(id)}/calendar?from=${from}&to=${to}`);
        return json(await r.json(), r.status);
      }
      case "payment-provider": {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "Missing id" }, 400);
        const r = await beapi(`/listings/${encodeURIComponent(id)}/payment-provider`);
        return json(await r.json(), r.status);
      }
      case "create-quote": {
        const r = await beapi(`/reservations/quotes`, { method: "POST", body: JSON.stringify(body) });
        return json(await r.json(), r.status);
      }
      case "get-quote": {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "Missing id" }, 400);
        const r = await beapi(`/reservations/quotes/${encodeURIComponent(id)}`);
        return json(await r.json(), r.status);
      }
      case "apply-coupon": {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "Missing id" }, 400);
        const r = await beapi(`/reservations/quotes/${encodeURIComponent(id)}/coupons`, {
          method: "POST",
          body: JSON.stringify(body),
        });
        return json(await r.json(), r.status);
      }
      case "instant-charge": {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "Missing quote id" }, 400);
        const r = await beapi(`/reservations/quotes/${encodeURIComponent(id)}/instant`, {
          method: "POST",
          body: JSON.stringify(body),
        });
        return json(await r.json(), r.status);
      }
      case "verify-payment": {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "Missing reservation id" }, 400);
        const r = await beapi(`/reservations/${encodeURIComponent(id)}/verify-payment`, {
          method: "POST",
          body: JSON.stringify(body),
        });
        return json(await r.json(), r.status);
      }
      case "reservation": {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "Missing id" }, 400);
        const r = await beapi(`/reservations/${encodeURIComponent(id)}`);
        return json(await r.json(), r.status);
      }
      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[guesty-beapi]", msg);
    return json({ error: msg }, 500);
  }
});

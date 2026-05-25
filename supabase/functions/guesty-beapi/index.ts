// Guesty Booking Engine API BFF — vault-backed token management.
//
// IMPORTANT: Booking Engine API ONLY (booking.guesty.com). We do NOT call
// open-api.guesty.com — it's a different Guesty product with separate
// rate limits and previously caused 429 ban-loops.
//
// Token lifecycle:
//   - pg_cron refreshes the vault every 6h via `guesty-token-refresh`
//   - On miss/expiry, we refresh inline (single attempt, no scope fallback)
//   - Circuit breaker: if the most recent refresh log entry is a 429 within
//     the last 60s, we fast-fail with 503 instead of hammering Guesty.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TOKEN_URL = "https://booking.guesty.com/oauth2/token";
const BEAPI_BASE = "https://booking.guesty.com/api";
const SCOPE = "booking_engine:api";
const SAFETY_WINDOW_MS = 5 * 60 * 1000; // refresh if <5min left
const CIRCUIT_COOLDOWN_MS = 60 * 1000;  // 60s after a 429

const supaUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(supaUrl, serviceKey, { auth: { persistSession: false } });

let memToken: { value: string; expiresAt: number } | null = null;
let inflight: Promise<string> | null = null;

async function isCircuitOpen(): Promise<{ open: boolean; retryAfterMs: number; reason?: string }> {
  const { data } = await admin
    .from("guesty_token_refresh_log")
    .select("status, error, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data || data.status !== "error") return { open: false, retryAfterMs: 0 };
  const is429 = (data.error || "").includes("429") || (data.error || "").toLowerCase().includes("too many");
  if (!is429) return { open: false, retryAfterMs: 0 };
  const age = Date.now() - new Date(data.created_at).getTime();
  if (age >= CIRCUIT_COOLDOWN_MS) return { open: false, retryAfterMs: 0 };
  return { open: true, retryAfterMs: CIRCUIT_COOLDOWN_MS - age, reason: data.error };
}

async function fetchFreshTokenAndStore(): Promise<{ token: string; expiresAt: Date }> {
  const clientId = Deno.env.get("GUESTY_CLIENT_ID");
  const clientSecret = Deno.env.get("GUESTY_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("Guesty credentials not configured");

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: SCOPE,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body,
  });
  const text = await res.text();

  if (!res.ok) {
    const errMsg = `Booking Engine token ${res.status}: ${text.slice(0, 300)}`;
    try {
      await admin.from("guesty_token_refresh_log").insert({ status: "error", error: errMsg });
    } catch (_) {}
    throw new Error(errMsg);
  }

  const j = JSON.parse(text);
  const expiresMs = (j.expires_in ?? 86400) * 1000;
  const expiresAt = new Date(Date.now() + expiresMs);

  const { data: cur } = await admin
    .from("guesty_token_vault")
    .select("refresh_count")
    .eq("id", 1)
    .maybeSingle();

  await admin.from("guesty_token_vault").upsert({
    id: 1,
    access_token: j.access_token,
    expires_at: expiresAt.toISOString(),
    scope: SCOPE,
    refresh_count: (cur?.refresh_count ?? 0) + 1,
    last_refreshed_at: new Date().toISOString(),
  });
  try {
    await admin
      .from("guesty_token_refresh_log")
      .insert({ status: "success", expires_at: expiresAt.toISOString() });
  } catch (_) {}

  return { token: j.access_token, expiresAt };
}

async function getToken(): Promise<string> {
  const now = Date.now();
  if (memToken && memToken.expiresAt - SAFETY_WINDOW_MS > now) return memToken.value;
  if (inflight) return inflight;

  inflight = (async () => {
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

    // Vault stale/empty → check circuit before hitting Guesty
    const circuit = await isCircuitOpen();
    if (circuit.open) {
      throw new Error(
        `Guesty token endpoint rate-limited. Retry in ${Math.ceil(circuit.retryAfterMs / 1000)}s.`,
      );
    }

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

function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extraHeaders },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") ?? "listings";
    const body =
      req.method !== "GET" && req.method !== "HEAD"
        ? await req.json().catch(() => ({}))
        : {};

    switch (action) {
      case "token-status": {
        const { data } = await admin
          .from("guesty_token_vault")
          .select("access_token, expires_at, last_refreshed_at, refresh_count, scope")
          .eq("id", 1)
          .maybeSingle();
        const circuit = await isCircuitOpen();
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
          circuit_open: circuit.open,
          retry_after_seconds: circuit.open ? Math.ceil(circuit.retryAfterMs / 1000) : 0,
          circuit_reason: circuit.reason ?? null,
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
    const status = msg.includes("rate-limited") ? 503 : 500;
    return json({ error: msg }, status);
  }
});

// Guesty Booking Engine API BFF — Booking Engine only, vault-backed, paced, retry-safe.
//
// Canonical Booking Engine rules:
// - Token endpoint: https://booking.guesty.com/oauth2/token
// - API base: https://booking.guesty.com/api
// - Scope: booking_engine:api
// - Never fall back to Open API credentials/endpoints for guest bookings.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TOKEN_URL = "https://booking.guesty.com/oauth2/token";
const BEAPI_BASE = (Deno.env.get("GUESTY_BEAPI_BASE_URL") || "https://booking.guesty.com/api").replace(/\/$/, "");
const SCOPE = "booking_engine:api";
const SAFETY_WINDOW_MS = 5 * 60 * 1000;
const TOKEN_CIRCUIT_COOLDOWN_MS = 2 * 60 * 1000;
const REQUESTS_PER_SECOND = Number(Deno.env.get("GUESTY_BEAPI_RPS") || "4");
const INTERVAL_MS = Math.ceil(1000 / Math.max(1, REQUESTS_PER_SECOND));
const MAX_RETRIES = 5;
const BASE_BACKOFF_MS = 500;
const MAX_BACKOFF_MS = 30_000;

const supaUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(supaUrl, serviceKey, { auth: { persistSession: false } });

let memToken: { value: string; expiresAt: number } | null = null;
let inflightToken: Promise<string> | null = null;
let upstreamQueue: Promise<unknown> = Promise.resolve();
let lastUpstreamAt = 0;

type TokenCircuit = { open: boolean; retryAfterMs: number; reason?: string };

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extraHeaders },
  });
}

function sanitizeId(value: string | null, name = "id") {
  if (!value || !/^[A-Za-z0-9._:-]+$/.test(value)) throw new Error(`Missing or invalid ${name}`);
  return encodeURIComponent(value);
}

function requireParam(url: URL, key: string) {
  const value = url.searchParams.get(key);
  if (!value) throw new Error(`Missing ${key}`);
  return value;
}

function retryAfterMs(headers: Headers): number | null {
  const raw = headers.get("retry-after");
  if (!raw) return null;
  const seconds = Number(raw);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const dateMs = Date.parse(raw);
  return Number.isFinite(dateMs) ? Math.max(0, dateMs - Date.now()) : null;
}

function backoffMs(attempt: number, headers?: Headers) {
  const retryMs = headers ? retryAfterMs(headers) : null;
  if (retryMs != null) return Math.min(retryMs, MAX_BACKOFF_MS);
  const exponential = BASE_BACKOFF_MS * 2 ** attempt;
  const jitter = Math.floor(Math.random() * 250);
  return Math.min(exponential + jitter, MAX_BACKOFF_MS);
}

async function pacedFetch(input: string, init: RequestInit) {
  const run = async () => {
    const waitMs = Math.max(0, lastUpstreamAt + INTERVAL_MS - Date.now());
    if (waitMs > 0) await delay(waitMs);
    lastUpstreamAt = Date.now();
    return fetch(input, init);
  };

  const task = upstreamQueue.then(run, run);
  upstreamQueue = task.then(() => undefined, () => undefined);
  return task;
}

async function logRefresh(status: "success" | "error", payload: { expires_at?: string; error?: string }) {
  try {
    await admin.from("guesty_token_refresh_log").insert({ status, ...payload });
  } catch (_) {
    // Logging must never break guest booking traffic.
  }
}

async function isTokenCircuitOpen(): Promise<TokenCircuit> {
  const { data } = await admin
    .from("guesty_token_refresh_log")
    .select("status, error, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  const row = data?.find((entry) => entry.status === "error" && !(entry.error || "").includes("token circuit open"));
  if (!row) return { open: false, retryAfterMs: 0 };
  const error = row.error || "";
  const is429 = error.includes("429") || error.toLowerCase().includes("too many");
  if (!is429) return { open: false, retryAfterMs: 0 };

  const retryMatch = error.match(/retry_after_ms=(\d+)/);
  const configuredCooldown = retryMatch ? Number(retryMatch[1]) : TOKEN_CIRCUIT_COOLDOWN_MS;
  const ageMs = Date.now() - new Date(row.created_at).getTime();
  if (ageMs >= configuredCooldown) return { open: false, retryAfterMs: 0 };
  return { open: true, retryAfterMs: configuredCooldown - ageMs, reason: error };
}

async function fetchFreshTokenAndStore(): Promise<{ token: string; expiresAt: Date }> {
  const clientId = Deno.env.get("GUESTY_CLIENT_ID");
  const clientSecret = Deno.env.get("GUESTY_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("Guesty Booking Engine credentials are not configured");

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: SCOPE,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body,
  });
  const text = await res.text();

  if (!res.ok) {
    const retryMs = retryAfterMs(res.headers) ?? TOKEN_CIRCUIT_COOLDOWN_MS;
    const errMsg = `Booking Engine token ${res.status}: retry_after_ms=${retryMs}; ${text.slice(0, 300)}`;
    await logRefresh("error", { error: errMsg });
    throw new Error(errMsg);
  }

  const payload = JSON.parse(text);
  if (!payload.access_token) throw new Error("Booking Engine token response did not include access_token");

  const expiresInMs = Math.max(60, Number(payload.expires_in ?? 86_400)) * 1000;
  const safeExpiresAt = new Date(Date.now() + Math.max(60_000, expiresInMs - SAFETY_WINDOW_MS));

  const { data: cur } = await admin
    .from("guesty_token_vault")
    .select("refresh_count")
    .eq("id", 1)
    .maybeSingle();

  const { error: upsertError } = await admin.from("guesty_token_vault").upsert({
    id: 1,
    access_token: payload.access_token,
    expires_at: safeExpiresAt.toISOString(),
    scope: SCOPE,
    refresh_count: (cur?.refresh_count ?? 0) + 1,
    last_refreshed_at: new Date().toISOString(),
  });
  if (upsertError) throw upsertError;

  await logRefresh("success", { expires_at: safeExpiresAt.toISOString() });
  return { token: payload.access_token, expiresAt: safeExpiresAt };
}

async function getToken(forceRefresh = false): Promise<string> {
  const now = Date.now();
  if (!forceRefresh && memToken && memToken.expiresAt > now) return memToken.value;
  if (!forceRefresh && inflightToken) return inflightToken;

  inflightToken = (async () => {
    if (!forceRefresh) {
      const { data: vault } = await admin
        .from("guesty_token_vault")
        .select("access_token, expires_at")
        .eq("id", 1)
        .maybeSingle();

      const expiresAt = vault?.expires_at ? new Date(vault.expires_at).getTime() : 0;
      if (vault?.access_token && expiresAt > now) {
        memToken = { value: vault.access_token, expiresAt };
        return vault.access_token;
      }
    }

    const circuit = await isTokenCircuitOpen();
    if (circuit.open) {
      throw new Error(`Guesty token endpoint rate-limited. Retry in ${Math.ceil(circuit.retryAfterMs / 1000)}s.`);
    }

    const fresh = await fetchFreshTokenAndStore();
    memToken = { value: fresh.token, expiresAt: fresh.expiresAt.getTime() };
    return fresh.token;
  })();

  try {
    return await inflightToken;
  } finally {
    inflightToken = null;
  }
}

async function beapi(path: string, init: RequestInit = {}, attempt = 0): Promise<Response> {
  const token = await getToken(attempt === 1 && (init as { forceTokenRefresh?: boolean }).forceTokenRefresh === true);
  const url = path.startsWith("http") ? path : `${BEAPI_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await pacedFetch(url, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${token}`,
      Accept: "application/json; charset=utf-8",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });

  if ((res.status === 401 || res.status === 403) && attempt === 0) {
    memToken = null;
    await getToken(true);
    return beapi(path, init, 1);
  }

  if (res.status === 429 && attempt < MAX_RETRIES) {
    await delay(backoffMs(attempt, res.headers));
    return beapi(path, init, attempt + 1);
  }

  return res;
}

async function proxyJson(response: Response) {
  const text = await response.text();
  const retryAfter = response.headers.get("retry-after");
  const headers = retryAfter ? { "Retry-After": retryAfter } : {};
  if (!text) return json({}, response.status, headers);
  try {
    return json(JSON.parse(text), response.status, headers);
  } catch (_) {
    return json({ error: text }, response.status, headers);
  }
}

function cacheKeyFor(action: string, url: URL) {
  const params = [...url.searchParams.entries()]
    .filter(([k]) => k !== "action")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  return `${action}?${params}`;
}

async function readCache(key: string) {
  const { data } = await admin
    .from("guesty_response_cache")
    .select("payload, status_code, fetched_at")
    .eq("cache_key", key)
    .maybeSingle();
  return data;
}

async function writeCache(key: string, action: string, payload: unknown, statusCode: number) {
  try {
    await admin.from("guesty_response_cache").upsert({
      cache_key: key, action, payload: payload as object,
      status_code: statusCode, fetched_at: new Date().toISOString(),
    });
  } catch (_) { /* cache writes must never break a request */ }
}

/** Run an upstream Booking Engine call with stale-while-error fallback. */
async function cachedCall(action: string, url: URL, fetcher: () => Promise<Response>) {
  const key = cacheKeyFor(action, url);
  try {
    const res = await fetcher();
    const text = await res.text();
    let parsed: unknown = {};
    if (text) { try { parsed = JSON.parse(text); } catch (_) { parsed = { error: text }; } }
    if (res.ok) {
      await writeCache(key, action, parsed, res.status);
      return json(parsed, res.status);
    }
    const cached = await readCache(key);
    if (cached) {
      return json({ ...(cached.payload as object), _stale: true, _stale_reason: `upstream_${res.status}`, _fetched_at: cached.fetched_at }, 200);
    }
    return json(parsed, res.status);
  } catch (err) {
    const cached = await readCache(key);
    if (cached) {
      const msg = err instanceof Error ? err.message : String(err);
      return json({ ...(cached.payload as object), _stale: true, _stale_reason: msg, _fetched_at: cached.fetched_at }, 200);
    }
    throw err;
  }
}

const LISTINGS_KEYS = [
  "minOccupancy",
  "numberOfBedrooms",
  "numberOfBathrooms",
  "propertyType",
  "listingType",
  "roomType",
  "minPrice",
  "maxPrice",
  "currency",
  "includeAmenities",
  "excludeAmenities",
  "minLng",
  "maxLng",
  "minLat",
  "maxLat",
  "city",
  "country",
  "state",
  "fields",
  "limit",
  "cursor",
  "skip",
];
const AVAILABILITY_KEYS = [...LISTINGS_KEYS, "checkIn", "checkOut"];
const QUERY_ALIASES: Record<string, string> = {
  adults: "minOccupancy",
  guests: "minOccupancy",
  guestsCount: "minOccupancy",
  bedrooms: "numberOfBedrooms",
  minBedrooms: "numberOfBedrooms",
  bathrooms: "numberOfBathrooms",
  minBathrooms: "numberOfBathrooms",
  amenities: "includeAmenities",
};

function buildQuery(url: URL, keys: string[]) {
  const allowed = new Set(keys);
  const qs = new URLSearchParams();
  for (const [rawKey, rawValue] of url.searchParams.entries()) {
    if (rawKey === "action" || rawValue == null || rawValue === "") continue;
    const key = QUERY_ALIASES[rawKey] || rawKey;
    if (allowed.has(key)) qs.set(key, rawValue);
  }
  return qs.toString();
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
          .select("access_token, expires_at, last_refreshed_at, refresh_count, scope")
          .eq("id", 1)
          .maybeSingle();
        const circuit = await isTokenCircuitOpen();
        const expiresAtMs = data?.expires_at ? new Date(data.expires_at).getTime() : null;
        return json({
          status: data?.access_token || memToken ? "ready" : "missing",
          has_token: !!data?.access_token || !!memToken,
          expires_at: data?.expires_at ?? null,
          seconds_until_safe_expiry: expiresAtMs ? Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000)) : null,
          last_refreshed_at: data?.last_refreshed_at ?? null,
          refresh_count: data?.refresh_count ?? 0,
          memory_cached: !!memToken,
          scope: data?.scope ?? null,
          api_base: BEAPI_BASE,
          circuit_open: circuit.open,
          retry_after_seconds: circuit.open ? Math.ceil(circuit.retryAfterMs / 1000) : 0,
          circuit_reason: circuit.reason ?? null,
        });
      }

      case "ping-token": {
        await getToken();
        return json({ ok: true, scope: SCOPE, api_base: BEAPI_BASE });
      }

      case "listings": {
        const qs = buildQuery(url, LISTINGS_KEYS);
        return proxyJson(await beapi(`/listings${qs ? `?${qs}` : ""}`));
      }

      case "search": {
        const hasDates = !!url.searchParams.get("checkIn") && !!url.searchParams.get("checkOut");
        const qs = buildQuery(url, hasDates ? AVAILABILITY_KEYS : LISTINGS_KEYS);
        const endpoint = hasDates ? "/listings/availability" : "/listings";
        return proxyJson(await beapi(`${endpoint}${qs ? `?${qs}` : ""}`));
      }

      case "listing": {
        const id = sanitizeId(url.searchParams.get("id"), "listing id");
        const fields = url.searchParams.get("fields");
        return proxyJson(await beapi(`/listings/${id}${fields ? `?fields=${encodeURIComponent(fields)}` : ""}`));
      }

      case "calendar": {
        const id = sanitizeId(url.searchParams.get("id"), "listing id");
        const from = encodeURIComponent(requireParam(url, "from"));
        const to = encodeURIComponent(requireParam(url, "to"));
        return proxyJson(await beapi(`/listings/${id}/calendar?from=${from}&to=${to}`));
      }

      case "cities": {
        const qs = buildQuery(url, ["skip", "limit", "searchText"]);
        return proxyJson(await beapi(`/listings/cities${qs ? `?${qs}` : ""}`));
      }

      case "reservation-money": {
        const qs = new URLSearchParams({
          listingId: requireParam(url, "listingId"),
          checkIn: requireParam(url, "checkIn"),
          checkOut: requireParam(url, "checkOut"),
          guestsCount: requireParam(url, "guestsCount"),
        });
        const coupon = url.searchParams.get("coupon");
        if (coupon) qs.set("coupon", coupon);
        return proxyJson(await beapi(`/reservations/money?${qs}`));
      }

      case "create-reservation":
        return proxyJson(await beapi("/reservations", { method: "POST", body: JSON.stringify(body) }));

      case "payment-provider": {
        const id = sanitizeId(url.searchParams.get("id"), "listing id");
        return proxyJson(await beapi(`/listings/${id}/payment-provider`));
      }

      case "create-quote":
        return proxyJson(await beapi("/reservations/quotes", { method: "POST", body: JSON.stringify(body) }));

      case "get-quote": {
        const id = sanitizeId(url.searchParams.get("id"), "quote id");
        return proxyJson(await beapi(`/reservations/quotes/${id}`));
      }

      case "apply-coupon": {
        const id = sanitizeId(url.searchParams.get("id"), "quote id");
        return proxyJson(await beapi(`/reservations/quotes/${id}/coupons`, { method: "POST", body: JSON.stringify(body) }));
      }

      case "instant-charge": {
        const id = sanitizeId(url.searchParams.get("id"), "quote id");
        return proxyJson(await beapi(`/reservations/quotes/${id}/instant`, { method: "POST", body: JSON.stringify(body) }));
      }

      case "verify-payment": {
        const id = sanitizeId(url.searchParams.get("id"), "reservation id");
        return proxyJson(await beapi(`/reservations/${id}/verify-payment`, { method: "POST", body: JSON.stringify(body) }));
      }

      case "reservation": {
        const id = sanitizeId(url.searchParams.get("id"), "reservation id");
        return proxyJson(await beapi(`/reservations/${id}`));
      }

      case "bootstrap": {
        const qs = new URLSearchParams({ limit: url.searchParams.get("limit") || "12" }).toString();
        const [listings, cities, tokenStatus] = await Promise.all([
          beapi(`/listings?${qs}`).then((r) => r.json().catch(() => ({}))),
          beapi("/listings/cities?limit=100").then((r) => r.json().catch(() => ({}))),
          admin
            .from("guesty_token_vault")
            .select("expires_at, last_refreshed_at, refresh_count, scope")
            .eq("id", 1)
            .maybeSingle()
            .then(({ data }) => data),
        ]);
        return json({ listings, cities, token: tokenStatus, api_base: BEAPI_BASE });
      }

      default:
        return json({ error: `Unknown Guesty Booking Engine action: ${action}` }, 400);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[guesty-beapi]", msg);
    const status = msg.includes("rate-limited") ? 503 : msg.startsWith("Missing") || msg.includes("invalid") ? 400 : 500;
    return json({ error: msg }, status);
  }
});

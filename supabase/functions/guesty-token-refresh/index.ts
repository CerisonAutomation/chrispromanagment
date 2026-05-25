// guesty-token-refresh — safe Booking Engine token cache warmer.
//
// This function implements the canonical Booking Engine token lifecycle:
// - client_credentials + booking_engine:api
// - local/database cache reuse
// - refresh only when the safe expiry has passed
// - safe expiry is stored 5 minutes before Guesty's actual expiry
// - no Open API fallback, ever.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TOKEN_URL = "https://booking.guesty.com/oauth2/token";
const SCOPE = "booking_engine:api";
const SAFETY_WINDOW_MS = 5 * 60 * 1000;
const TOKEN_CIRCUIT_COOLDOWN_MS = 2 * 60 * 1000;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function retryAfterMs(headers: Headers): number | null {
  const raw = headers.get("retry-after");
  if (!raw) return null;
  const seconds = Number(raw);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const dateMs = Date.parse(raw);
  return Number.isFinite(dateMs) ? Math.max(0, dateMs - Date.now()) : null;
}

async function logRefresh(admin: ReturnType<typeof createClient>, status: "success" | "error", payload: { expires_at?: string; error?: string }) {
  try {
    await admin.from("guesty_token_refresh_log").insert({ status, ...payload });
  } catch (_) {
    // Logging failures must not hide the actual token result.
  }
}

async function assertTokenCircuitClosed(admin: ReturnType<typeof createClient>) {
  const { data } = await admin
    .from("guesty_token_refresh_log")
    .select("status, error, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data || data.status !== "error") return;
  const message = data.error || "";
  const is429 = message.includes("429") || message.toLowerCase().includes("too many");
  if (!is429) return;
  const retryMatch = message.match(/retry_after_ms=(\d+)/);
  const cooldownMs = retryMatch ? Number(retryMatch[1]) : TOKEN_CIRCUIT_COOLDOWN_MS;
  const ageMs = Date.now() - new Date(data.created_at).getTime();
  if (ageMs < cooldownMs) {
    throw new Error(`Booking Engine token circuit open: retry_after_ms=${cooldownMs - ageMs}; ${message}`);
  }
}

export async function fetchFreshToken(): Promise<{ token: string; expiresAt: Date; scope: string }> {
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
    const retryMs = retryAfterMs(res.headers);
    throw new Error(`Booking Engine token ${res.status}: retry_after_ms=${retryMs ?? 120_000}; ${text.slice(0, 300)}`);
  }

  const payload = JSON.parse(text);
  if (!payload.access_token) throw new Error("Booking Engine token response did not include access_token");

  const expiresInMs = Math.max(60, Number(payload.expires_in ?? 86_400)) * 1000;
  return {
    token: payload.access_token,
    expiresAt: new Date(Date.now() + Math.max(60_000, expiresInMs - SAFETY_WINDOW_MS)),
    scope: SCOPE,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supaUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supaUrl, serviceKey, { auth: { persistSession: false } });

  try {
    const { data: vault } = await admin
      .from("guesty_token_vault")
      .select("access_token, expires_at, refresh_count, scope, last_refreshed_at")
      .eq("id", 1)
      .maybeSingle();

    const expiresAt = vault?.expires_at ? new Date(vault.expires_at).getTime() : 0;
    if (vault?.access_token && expiresAt > Date.now()) {
      return json({
        ok: true,
        cached: true,
        expires_at: vault.expires_at,
        scope: vault.scope,
        refresh_count: vault.refresh_count ?? 0,
        last_refreshed_at: vault.last_refreshed_at ?? null,
      });
    }

    await assertTokenCircuitClosed(admin);
    const { token, expiresAt: safeExpiresAt, scope } = await fetchFreshToken();

    const { error: upErr } = await admin.from("guesty_token_vault").upsert({
      id: 1,
      access_token: token,
      expires_at: safeExpiresAt.toISOString(),
      scope,
      refresh_count: (vault?.refresh_count ?? 0) + 1,
      last_refreshed_at: new Date().toISOString(),
    });
    if (upErr) throw upErr;

    await logRefresh(admin, "success", { expires_at: safeExpiresAt.toISOString() });
    console.log(`[guesty-token-refresh] refreshed — safe expiry ${safeExpiresAt.toISOString()}`);
    return json({ ok: true, cached: false, expires_at: safeExpiresAt.toISOString(), scope });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[guesty-token-refresh] failed:", msg);
    await logRefresh(admin, "error", { error: msg });
    return json({ ok: false, error: msg }, msg.includes("429") ? 503 : 500);
  }
});

// guesty-token-refresh — fetches a fresh OAuth2 access token from Guesty
// Booking Engine and upserts it into `guesty_token_vault`.
//
// IMPORTANT: Booking Engine API only. We do NOT fall back to open-api.guesty.com
// (different product, different rate limits, causes 429 ban-loops).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TOKEN_URL = "https://booking.guesty.com/oauth2/token";
const SCOPE = "booking_engine:api";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export async function fetchFreshToken(): Promise<{
  token: string;
  expiresAt: Date;
  scope: string;
}> {
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
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Booking Engine token ${res.status}: ${text.slice(0, 300)}`);
  }
  const j = JSON.parse(text);
  const expiresMs = (j.expires_in ?? 86400) * 1000;
  return {
    token: j.access_token,
    expiresAt: new Date(Date.now() + expiresMs),
    scope: SCOPE,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supaUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supaUrl, serviceKey, { auth: { persistSession: false } });

  try {
    const { token, expiresAt, scope } = await fetchFreshToken();

    const { data: cur } = await admin
      .from("guesty_token_vault")
      .select("refresh_count")
      .eq("id", 1)
      .maybeSingle();

    const { error: upErr } = await admin.from("guesty_token_vault").upsert({
      id: 1,
      access_token: token,
      expires_at: expiresAt.toISOString(),
      scope,
      refresh_count: (cur?.refresh_count ?? 0) + 1,
      last_refreshed_at: new Date().toISOString(),
    });
    if (upErr) throw upErr;

    try {
      await admin
        .from("guesty_token_refresh_log")
        .insert({ status: "success", expires_at: expiresAt.toISOString() });
    } catch (_) {}

    console.log(`[guesty-token-refresh] OK — expires ${expiresAt.toISOString()}`);
    return json({ ok: true, expires_at: expiresAt.toISOString() });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[guesty-token-refresh] failed:", msg);
    try {
      await admin.from("guesty_token_refresh_log").insert({ status: "error", error: msg });
    } catch (_) {}
    return json({ ok: false, error: msg }, 500);
  }
});

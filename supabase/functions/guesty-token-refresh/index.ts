// guesty-token-refresh — fetches a fresh OAuth2 access token from Guesty
// and upserts it into the `guesty_token_vault` table. Invoked by pg_cron
// every 6 hours and on-demand by `guesty-beapi` when the cached token is
// missing or about to expire.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TOKEN_URLS = [
  "https://booking.guesty.com/oauth2/token",
  "https://open-api.guesty.com/oauth2/token",
];

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function fetchFreshToken(): Promise<{ token: string; expiresAt: Date; scope?: string }> {
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
      return { token: j.access_token, expiresAt: new Date(Date.now() + expiresMs), scope: a.scope };
    }
    lastErr = `${a.url} ${res.status}: ${text.slice(0, 200)}`;
  }
  throw new Error(`Token fetch failed — ${lastErr}`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supaUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supaUrl, serviceKey, { auth: { persistSession: false } });

  try {
    const { token, expiresAt, scope } = await fetchFreshToken();

    const { error: upErr } = await admin
      .from("guesty_token_vault")
      .upsert({
        id: 1,
        access_token: token,
        expires_at: expiresAt.toISOString(),
        scope: scope ?? null,
        last_refreshed_at: new Date().toISOString(),
      });

    if (upErr) throw upErr;

    // Best-effort increment of refresh_count
    try {
      const { data: cur } = await admin
        .from("guesty_token_vault")
        .select("refresh_count")
        .eq("id", 1)
        .maybeSingle();
      await admin
        .from("guesty_token_vault")
        .update({ refresh_count: (cur?.refresh_count ?? 0) + 1 })
        .eq("id", 1);
    } catch (_) { /* non-fatal */ }

    try {
      await admin.from("guesty_token_refresh_log").insert({
        status: "success",
        expires_at: expiresAt.toISOString(),
      });
    } catch (_) { /* non-fatal */ }

    console.log(`[guesty-token-refresh] OK — expires ${expiresAt.toISOString()}`);
    return json({ ok: true, expires_at: expiresAt.toISOString() });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[guesty-token-refresh] failed:", msg);
    try {
      await admin.from("guesty_token_refresh_log").insert({ status: "error", error: msg });
    } catch (_) { /* non-fatal */ }
    return json({ ok: false, error: msg }, 500);
  }
});

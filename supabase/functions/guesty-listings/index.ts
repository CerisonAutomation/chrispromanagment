// Guesty listings — fetches active properties via OAuth, caches token in DB.
// Public read endpoint (verify_jwt = false). Returns normalized property list.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GUESTY_TOKEN_URL = "https://open-api.guesty.com/oauth2/token";
const GUESTY_LISTINGS_URL = "https://open-api.guesty.com/v1/listings";

async function getToken(supabase: ReturnType<typeof createClient>) {
  const { data: vault } = await supabase
    .from("guesty_token_vault")
    .select("access_token, expires_at")
    .eq("id", 1)
    .maybeSingle();

  if (vault?.access_token && vault.expires_at && new Date(vault.expires_at).getTime() > Date.now() + 60_000) {
    return vault.access_token as string;
  }

  const id = Deno.env.get("GUESTY_CLIENT_ID");
  const secret = Deno.env.get("GUESTY_CLIENT_SECRET");
  if (!id || !secret) throw new Error("GUESTY_CLIENT_ID / GUESTY_CLIENT_SECRET not configured");

  const res = await fetch(GUESTY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "open-api",
      client_id: id,
      client_secret: secret,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    await supabase.from("guesty_token_refresh_log").insert({ status: "error", error: t });
    throw new Error(`Guesty token error: ${res.status} ${t}`);
  }
  const json = await res.json();
  const expiresAt = new Date(Date.now() + (json.expires_in ?? 3600) * 1000).toISOString();

  await supabase.from("guesty_token_vault").upsert({
    id: 1,
    access_token: json.access_token,
    expires_at: expiresAt,
    scope: json.scope ?? null,
    last_refreshed_at: new Date().toISOString(),
  });
  await supabase.from("guesty_token_refresh_log").insert({ status: "success", expires_at: expiresAt });
  return json.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = await getToken(supabase);

    const res = await fetch(`${GUESTY_LISTINGS_URL}?limit=50&fields=title,nickname,picture,bedrooms,accommodates,address,prices`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (!res.ok) {
      const t = await res.text();
      return new Response(JSON.stringify({ error: `Guesty listings: ${res.status} ${t}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await res.json();
    const items = Array.isArray(data) ? data : (data.results ?? data.data ?? []);

    const properties = items.map((p: any) => ({
      id: p._id ?? p.id,
      title: p.title ?? p.nickname ?? "Property",
      nickname: p.nickname,
      picture: p.picture?.thumbnail ?? p.picture?.regular ?? p.pictures?.[0]?.original ?? null,
      bedrooms: p.bedrooms,
      accommodates: p.accommodates,
      address: {
        city: p.address?.city,
        country: p.address?.country,
        full: p.address?.full,
      },
      pricePerNight: p.prices?.basePrice ?? p.prices?.basePriceUSD ?? null,
      currency: p.prices?.currency ?? "EUR",
    }));

    return new Response(JSON.stringify({ properties }), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
    });
  } catch (e) {
    console.error("guesty-listings error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

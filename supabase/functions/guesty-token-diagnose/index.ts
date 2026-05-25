// guesty-token-diagnose — one-shot diagnostic that tries every documented
// Guesty OAuth combination using the configured GUESTY_CLIENT_ID/SECRET.
// Returns per-attempt status so we can tell whether 429 is per-endpoint,
// per-scope, or tenant-wide, and whether credentials work at all.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

type Attempt = {
  label: string;
  url: string;
  status: number;
  ok: boolean;
  retry_after?: string | null;
  body_snippet: string;
};

const ENDPOINTS = [
  { label: "booking", url: "https://booking.guesty.com/oauth2/token" },
  { label: "open-api", url: "https://open-api.guesty.com/oauth2/token" },
];

const SCOPES = ["booking_engine:api", "open-api", ""]; // "" = omit scope

const AUTH_MODES = ["body", "basic"] as const;

async function attempt(
  url: string,
  scope: string,
  mode: "body" | "basic",
  clientId: string,
  clientSecret: string,
): Promise<Attempt> {
  const params = new URLSearchParams({ grant_type: "client_credentials" });
  if (scope) params.set("scope", scope);
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  };
  if (mode === "basic") {
    headers["Authorization"] = `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
  } else {
    params.set("client_id", clientId);
    params.set("client_secret", clientSecret);
  }
  const label = `${new URL(url).host} scope="${scope || "<none>"}" auth=${mode}`;
  try {
    const res = await fetch(url, { method: "POST", headers, body: params });
    const text = await res.text();
    return {
      label,
      url,
      status: res.status,
      ok: res.ok,
      retry_after: res.headers.get("retry-after"),
      body_snippet: text.slice(0, 240),
    };
  } catch (e) {
    return {
      label,
      url,
      status: 0,
      ok: false,
      body_snippet: e instanceof Error ? e.message : String(e),
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const clientId = Deno.env.get("GUESTY_CLIENT_ID") || "";
  const clientSecret = Deno.env.get("GUESTY_CLIENT_SECRET") || "";
  if (!clientId || !clientSecret) {
    return new Response(
      JSON.stringify({ error: "GUESTY_CLIENT_ID / GUESTY_CLIENT_SECRET not set" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const results: Attempt[] = [];
  let firstSuccess: Attempt | null = null;
  for (const ep of ENDPOINTS) {
    for (const scope of SCOPES) {
      for (const mode of AUTH_MODES) {
        const a = await attempt(ep.url, scope, mode, clientId, clientSecret);
        results.push(a);
        if (a.ok && !firstSuccess) firstSuccess = a;
        // brief space between calls — avoid stampeding throttle
        await new Promise((r) => setTimeout(r, 250));
      }
    }
  }

  const summary = {
    client_id_prefix: clientId.slice(0, 6) + "…",
    client_id_length: clientId.length,
    secret_length: clientSecret.length,
    first_success: firstSuccess
      ? { label: firstSuccess.label, status: firstSuccess.status }
      : null,
    status_counts: results.reduce<Record<string, number>>((acc, r) => {
      const k = String(r.status);
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {}),
  };

  return new Response(
    JSON.stringify({ summary, attempts: results }, null, 2),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});

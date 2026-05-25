// client-errors — public sink for front-end ErrorBoundary reports (P5).
// Writes to cms_sync_log so we don't need a new table; gated by RLS already.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  try {
    const body = await req.json();
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );
    const payload = {
      message: String(body?.message ?? "").slice(0, 1000),
      stack: String(body?.stack ?? "").slice(0, 8000),
      componentStack: String(body?.componentStack ?? "").slice(0, 4000),
      url: String(body?.url ?? "").slice(0, 500),
      ua: String(body?.ua ?? "").slice(0, 500),
    };
    await admin.from("cms_sync_log").insert({
      source: "client",
      action: "error",
      status: "error",
      payload,
    });
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ ok: false }), {
      status: 200, // never break the boundary
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

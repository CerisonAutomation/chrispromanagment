import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Vary": "Origin",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const REDACT_KEYS = /^(password|token|secret|api[_-]?key|authorization|cookie)$/i;
function redact(value: unknown, depth = 0): unknown {
  if (depth > 5 || value == null) return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = REDACT_KEYS.test(k) ? "[REDACTED]" : redact(v, depth + 1);
    }
    return out;
  }
  return value;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) throw new Error("Missing Supabase env vars");
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const { action, section_key, content, setting_key, setting_value, source = "webhook" } = body || {};

    let result;
    if (action === "update_content" && section_key && content) {
      const { data, error } = await supabase.from("cms_content").update({ content }).eq("section_key", section_key).select().single();
      if (error) throw error; result = data;
    } else if (action === "update_setting" && setting_key && setting_value !== undefined) {
      const { data, error } = await supabase.from("cms_settings").update({ setting_value }).eq("setting_key", setting_key).select().single();
      if (error) throw error; result = data;
    } else if (action === "get_content") {
      const q = supabase.from("cms_content").select("*").order("sort_order");
      if (section_key) q.eq("section_key", section_key);
      const { data, error } = await q;
      if (error) throw error; result = data;
    } else if (action === "get_settings") {
      const { data, error } = await supabase.from("cms_settings").select("*");
      if (error) throw error; result = data;
    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    await supabase.from("cms_sync_log").insert({ source, action, payload: redact(body), status: "success" });

    return new Response(JSON.stringify({ success: true, data: result }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

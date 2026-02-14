import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const { action, section_key, content, setting_key, setting_value, source = "webhook" } = body;

    let result;

    if (action === "update_content" && section_key && content) {
      const { data, error } = await supabase
        .from("cms_content")
        .update({ content })
        .eq("section_key", section_key)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else if (action === "update_setting" && setting_key && setting_value !== undefined) {
      const { data, error } = await supabase
        .from("cms_settings")
        .update({ setting_value })
        .eq("setting_key", setting_key)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else if (action === "get_content") {
      const query = supabase.from("cms_content").select("*").order("sort_order");
      if (section_key) query.eq("section_key", section_key);
      const { data, error } = await query;
      if (error) throw error;
      result = data;
    } else if (action === "get_settings") {
      const { data, error } = await supabase.from("cms_settings").select("*");
      if (error) throw error;
      result = data;
    } else {
      return new Response(JSON.stringify({
        error: "Invalid action. Use: update_content, update_setting, get_content, get_settings",
        example: { action: "update_content", section_key: "hero", content: { headline: "New headline" } },
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Log the sync
    await supabase.from("cms_sync_log").insert({
      source,
      action,
      payload: body,
      status: "success",
    });

    // If zapier webhook is configured, notify it
    if (action.startsWith("update")) {
      const { data: zapierSetting } = await supabase
        .from("cms_settings")
        .select("setting_value")
        .eq("setting_key", "zapier_webhook_url")
        .single();
      
      const zapierUrl = typeof zapierSetting?.setting_value === "string" ? zapierSetting.setting_value : "";
      if (zapierUrl) {
        try {
          await fetch(zapierUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event: "content_updated", ...body, timestamp: new Date().toISOString() }),
          });
        } catch {
          // Non-critical, don't fail the request
        }
      }
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

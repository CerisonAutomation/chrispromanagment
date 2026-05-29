// CMS AI Enhance — field-level AI copy improvement via OpenAI.
// Auth: requires valid JWT (admin/editor role enforced via DB check).
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a professional copywriter for Christiano Property Management, 
a luxury short-let property management company based in Malta. 
You write compelling, concise, high-end copy that appeals to discerning travellers and property owners.
Tone: sophisticated, warm, confident. Never generic.
Respond ONLY with the improved text — no preamble, no quotes, no explanation.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Auth: validate JWT and check role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorised" }), { status: 401, headers: corsHeaders });

    const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authErr || !user) return new Response(JSON.stringify({ error: "Unauthorised" }), { status: 401, headers: corsHeaders });

    // Check user has admin or editor role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "editor"]);

    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    const { section_key, field_key, current_value, instruction } = await req.json() as {
      section_key: string;
      field_key: string;
      current_value: string;
      instruction: string;
    };

    if (!instruction?.trim()) {
      return new Response(JSON.stringify({ error: "instruction required" }), { status: 400, headers: corsHeaders });
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) return new Response(JSON.stringify({ error: "OpenAI not configured" }), { status: 503, headers: corsHeaders });

    const userMessage = [
      `Section: ${section_key}`,
      `Field: ${field_key}`,
      current_value ? `Current text: "${current_value}"` : "",
      `Instruction: ${instruction}`,
    ].filter(Boolean).join("\n");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 500,
        temperature: 0.7,
        messages: [
          { role: "system",  content: SYSTEM_PROMPT },
          { role: "user",    content: userMessage },
        ],
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      return new Response(JSON.stringify({ error: `OpenAI: ${res.status} ${t}` }), { status: 502, headers: corsHeaders });
    }

    const json = await res.json() as { choices: { message: { content: string } }[] };
    const suggestion = json.choices?.[0]?.message?.content?.trim() ?? "";

    // Log to cms_sync_log
    await supabase.from("cms_sync_log").insert({
      source: "cms-ai-enhance",
      action: `${section_key}.${field_key}`,
      status: "success",
      payload: { instruction, chars_in: current_value?.length ?? 0, chars_out: suggestion.length },
    });

    return new Response(JSON.stringify({ suggestion }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("cms-ai-enhance error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

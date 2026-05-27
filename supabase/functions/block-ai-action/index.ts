// block-ai-action — runs generate / improve / translate / summarize on
// a single block's content using Lovable AI Gateway. Returns structured
// JSON matching the block's editorFields shape via tool calling.
//
// POST body:
//   {
//     blockType: string,
//     fields: Record<string,{type:string,label?:string}>,
//     content: Record<string,unknown>,
//     action: "generate" | "improve" | "translate" | "summarize",
//     promptTemplate?: string,
//     context?: { siteName?:string; targetLanguage?:string; extra?:string }
//   }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function requireEditor(req: Request): Promise<Response | null> {
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) {
return json({ error: "Unauthorized" }, 401);
}
  const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) {
return json({ error: "Unauthorized" }, 401);
}
  const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const { data: roles } = await service.from("user_roles").select("role").eq("user_id", user.id);
  if (!roles?.some((r: { role: string }) => r.role === "admin" || r.role === "editor")) {
return json({ error: "Admin or editor required" }, 403);
}
  return null;
}


function fieldsToJsonSchema(fields: Record<string, { type: string }>) {
  const properties: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(fields || {})) {
    switch (field?.type) {
      case "number":
        properties[key] = { type: "number" };
        break;
      case "boolean":
        properties[key] = { type: "boolean" };
        break;
      case "array":
        properties[key] = { type: "array", items: { type: "object", additionalProperties: true } };
        break;
      default:
        properties[key] = { type: "string" };
    }
  }
  return { type: "object", properties, additionalProperties: true };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
return new Response("ok", { headers: corsHeaders });
}
  if (req.method !== "POST") {
return json({ error: "POST only" }, 405);
}
  const guard = await requireEditor(req);
  if (guard) {
return guard;
}

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
return json({ error: "LOVABLE_API_KEY not configured" }, 500);
}

    const body = await req.json();
    const { blockType, fields = {}, content = {}, action = "improve", promptTemplate, context = {} } = body || {};
    if (!blockType) {
return json({ error: "blockType required" }, 400);
}

    const sysParts = [
      "You are an expert content editor for a luxury property-management website.",
      "Return ONLY a function/tool call with the updated block content.",
      "Preserve every field key. Keep the brand voice premium, warm, concise, conversion-focused.",
      context.siteName ? `Site: ${context.siteName}.` : "",
      action === "translate" && context.targetLanguage
        ? `Translate all human-readable text fields to ${context.targetLanguage}.`
        : "",
    ].filter(Boolean).join(" ");

    const userPrompt =
      promptTemplate ||
      `Action: ${action}. Block type: ${blockType}. Current content (JSON):\n${JSON.stringify(content, null, 2)}\n${ 
        context.extra ? `\nExtra guidance: ${context.extra}` : ""}`;

    const tool = {
      type: "function",
      function: {
        name: "update_block_content",
        description: `Return the new content for a ${blockType} block.`,
        parameters: fieldsToJsonSchema(fields),
      },
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: sysParts },
          { role: "user", content: userPrompt },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "update_block_content" } },
      }),
    });

    if (res.status === 429) {
return json({ error: "Rate limited, please try again later." }, 429);
}
    if (res.status === 402) {
return json({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }, 402);
}

    const data = await res.json();
    if (!res.ok) {
      console.error("[block-ai-action] gateway error", res.status, JSON.stringify(data).slice(0, 500));
      return json({ error: "AI gateway error" }, 500);
    }

    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    const rawArgs = toolCall?.function?.arguments;
    let nextContent: unknown = {};
    try {
      nextContent = typeof rawArgs === "string" ? JSON.parse(rawArgs) : rawArgs || {};
    } catch (e) {
      console.error("[block-ai-action] bad tool args", e);
      return json({ error: "AI returned malformed structured output" }, 502);
    }

    return json({ content: nextContent });
  } catch (e) {
    console.error("[block-ai-action]", e);
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

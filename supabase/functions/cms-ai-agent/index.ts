/**
 * cms-ai-agent — Conversational AI agent for the CMS editor
 *
 * Architecture drawn from:
 *  - OpenPage api/generate.ts: Gemini API call structure, system prompt design
 *  - OpenPage api/deploy.ts: rate limiting, role check
 *  - OpenBuild aiComponentService: patch generation + context detection
 */
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT_WINDOW_MS    = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const rateLimitByUser = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitByUser.get(userId);
  if (!entry || entry.resetAt <= now) {
    rateLimitByUser.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) return true;
  entry.count += 1;
  return false;
}

const SYSTEM_PROMPT = `You are an AI assistant embedded in the Christiano Property Management CMS.
Your job is to help admin users edit website content blocks.

You receive:
1. "cms_context" — a summary of current block keys and their content
2. "history" — recent conversation turns
3. "input" — the user's latest message

## Your response format

Return a JSON object with these exact fields:
{
  "reply": "Your response message (max 200 words)",
  "patch": {
    "sectionKey": "landing__hero",
    "fieldPath": "headline",
    "oldValue": "Old text",
    "newValue": "New improved text",
    "removed": ["\\"Old text\\""],
    "added": ["\\"New improved text\\""]
  },
  "action": {
    "type": "show_field",
    "sectionKey": "landing__hero",
    "fieldKey": "headline"
  }
}

Both "patch" and "action" are OPTIONAL. Include "patch" only when making a field edit.
Include "action" with type "show_field" when user wants to navigate to a section.
For general questions or unclear requests, just include "reply".

## Rules
1. One field per response — never patch multiple fields at once
2. Use only section keys from cms_context — never invent keys
3. Write copy that is warm, luxurious, specific to Malta property management
4. Keep replies conversational and concise
5. If the field contains an array (items, bullets), provide the full updated array as newValue (JSON string)

Return ONLY valid JSON. No markdown fences.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ reply: "Authentication required.", error: "Unauthorised" }), { status: 401, headers: corsHeaders });
    }

    const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authErr || !user) {
      return new Response(JSON.stringify({ reply: "Invalid session.", error: "Unauthorised" }), { status: 401, headers: corsHeaders });
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "editor"]);

    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ reply: "Access denied.", error: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    if (isRateLimited(user.id)) {
      return new Response(
        JSON.stringify({ reply: "Slow down — you're sending messages too quickly.", error: "rate_limit" }),
        { status: 429, headers: corsHeaders }
      );
    }

    const body = await req.json() as {
      input:        string;
      history?:     { role: string; text: string }[];
      cms_context?: string;
    };

    if (!body.input?.trim()) {
      return new Response(JSON.stringify({ reply: "Empty message.", error: "input required" }), { status: 400, headers: corsHeaders });
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const geminiKey = Deno.env.get("GEMINI_API_KEY");

    if (!openaiKey && !geminiKey) {
      return new Response(
        JSON.stringify({ reply: "AI is not configured yet. Add OPENAI_API_KEY or GEMINI_API_KEY to Supabase secrets.", error: "no_key" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const historyText = (body.history ?? [])
      .slice(-6)
      .map((m: { role: string; text: string }) => `${m.role === "user" ? "User" : "Agent"}: ${m.text}`)
      .join("\n");

    const userMessage = [
      body.cms_context ? `## Current CMS blocks:\n${body.cms_context}` : "",
      historyText       ? `## Recent conversation:\n${historyText}` : "",
      `## User message:\n${body.input}`,
    ].filter(Boolean).join("\n\n");

    let replyText = "";

    if (openaiKey) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
        signal:  AbortSignal.timeout(25_000),
        body: JSON.stringify({
          model:           "gpt-4o-mini",
          max_tokens:      600,
          temperature:     0.7,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user",   content: userMessage },
          ],
        }),
      });
      if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
      const data = await res.json() as { choices: { message: { content: string } }[] };
      replyText = data.choices?.[0]?.message?.content ?? "";
    } else if (geminiKey) {
      const GEMINI_MODEL = "gemini-1.5-flash";
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiKey}`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          signal:  AbortSignal.timeout(25_000),
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: userMessage }] }],
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            generationConfig:  { responseMimeType: "application/json", temperature: 0.7 },
          }),
        }
      );
      if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
      const data = await res.json() as { candidates: { content: { parts: { text: string }[] } }[] };
      replyText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    }

    if (!replyText) throw new Error("Empty AI response");

    const parsed = JSON.parse(replyText) as { reply: string; patch?: unknown; action?: unknown };
    if (typeof parsed.reply !== "string") throw new Error("Invalid AI response structure");

    await supabase.from("cms_sync_log").insert({
      source:  "cms-ai-agent",
      action:  `chat:${user.id.slice(0, 8)}`,
      status:  "success",
      payload: { input_len: body.input.length, has_patch: !!parsed.patch },
    }).then(() => void 0);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("cms-ai-agent:", e);
    const msg = e instanceof Error ? e.message : String(e);
    const isTimeout = msg.includes("Abort") || msg.includes("Timeout");
    return new Response(
      JSON.stringify({
        reply: isTimeout
          ? "The AI request timed out. Try a shorter or simpler question."
          : `Something went wrong: ${msg}`,
        error: msg,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

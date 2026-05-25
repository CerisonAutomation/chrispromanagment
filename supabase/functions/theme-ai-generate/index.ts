import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const ALLOWED_TOKENS = [
  "--gold", "--gold-light", "--gold-dark",
  "--bg-dark", "--bg-darker", "--bg-card", "--bg-elevated",
  "--text-primary", "--text-secondary", "--text-muted",
  "--success", "--error", "--warning",
] as const;

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const HSL_RE = /^\d{1,3}\s+\d{1,3}%\s+\d{1,3}%$/;
const isValid = (v: unknown) => typeof v === "string" && (HEX_RE.test(v) || HSL_RE.test(v));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { prompt, currentTokens = {} } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return json({ error: "prompt is required" }, 400);
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

    const system = `You are a brand-aware visual designer. Update CSS design tokens to match the user's mood.
Only return tokens from this allow-list: ${ALLOWED_TOKENS.join(", ")}.
Values MUST be 6-digit hex like "#0F0F10". Preserve contrast: text-primary readable on bg-dark.
Only return tokens you want to change.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: `Current tokens: ${JSON.stringify(currentTokens)}\n\nMood: ${prompt}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "set_theme_tokens",
            description: "Apply a partial patch of CSS design tokens.",
            parameters: {
              type: "object",
              properties: {
                tokens: {
                  type: "object",
                  description: "Map of CSS variable name to hex color.",
                  additionalProperties: { type: "string" },
                },
                rationale: { type: "string" },
              },
              required: ["tokens"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "set_theme_tokens" } },
      }),
    });

    if (resp.status === 429) return json({ error: "Rate limited. Try again in a moment." }, 429);
    if (resp.status === 402) return json({ error: "AI credits exhausted. Add funds in workspace settings." }, 402);
    if (!resp.ok) {
      const t = await resp.text();
      console.error("gateway error", resp.status, t);
      return json({ error: "AI gateway error" }, 500);
    }

    const data = await resp.json();
    const call = data?.choices?.[0]?.message?.tool_calls?.[0];
    const args = call ? JSON.parse(call.function.arguments) : {};
    const raw = (args.tokens ?? {}) as Record<string, string>;

    const tokens: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw)) {
      if (ALLOWED_TOKENS.includes(k as any) && isValid(v)) tokens[k] = v;
    }

    return json({ tokens, rationale: args.rationale ?? "" });
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

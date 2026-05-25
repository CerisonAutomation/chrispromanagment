// block-ai-suggest — given the current page's blocks + the catalog of
// suggestable blocks from the registry, returns 1-3 next-block suggestions
// with rationale and pre-filled content.
//
// POST body:
//   {
//     pageSlug?: string,
//     currentBlocks: Array<{ type:string; content:Record<string,unknown> }>,
//     catalog: Array<{ type:string; label:string; category:string; description?:string }>,
//     context?: { siteName?:string; goal?:string }
//   }

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

    const { pageSlug, currentBlocks = [], catalog = [], context = {} } = await req.json();
    if (!Array.isArray(catalog) || catalog.length === 0)
      return json({ error: "catalog required" }, 400);

    const allowedTypes = catalog.map((b: any) => b.type);

    const sys =
      "You are a UX strategist for a luxury property-management website. Given a page's existing blocks and a catalog of available block types, suggest the 1-3 most valuable blocks to add next. Each suggestion must reference a block type from the catalog (verbatim), include a one-sentence rationale, and provide example seed content. Return ONLY the tool call.";

    const user = JSON.stringify({
      pageSlug,
      goal: context.goal,
      siteName: context.siteName,
      currentBlocks: currentBlocks.map((b: any) => ({ type: b.type, summary: summarize(b.content) })),
      catalog,
    });

    const tool = {
      type: "function",
      function: {
        name: "suggest_blocks",
        description: "Return next-block suggestions.",
        parameters: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", enum: allowedTypes },
                  rationale: { type: "string" },
                  seedContent: { type: "object", additionalProperties: true },
                },
                required: ["type", "rationale"],
              },
              minItems: 1,
              maxItems: 3,
            },
          },
          required: ["suggestions"],
        },
      },
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "suggest_blocks" } },
      }),
    });

    if (res.status === 429) return json({ error: "Rate limited, please try again later." }, 429);
    if (res.status === 402)
      return json({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }, 402);

    const data = await res.json();
    if (!res.ok) {
      console.error("[block-ai-suggest] gateway error", res.status);
      return json({ error: "AI gateway error" }, 500);
    }

    const raw = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    let parsed: any = {};
    try {
      parsed = typeof raw === "string" ? JSON.parse(raw) : raw || {};
    } catch {
      return json({ error: "AI returned malformed structured output" }, 502);
    }

    // hard filter to enforce allowed types
    const suggestions = (parsed.suggestions || []).filter((s: any) => allowedTypes.includes(s.type));
    return json({ suggestions });
  } catch (e) {
    console.error("[block-ai-suggest]", e);
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

function summarize(content: unknown) {
  if (!content || typeof content !== "object") return "";
  const text = Object.values(content)
    .filter((v) => typeof v === "string")
    .join(" · ")
    .slice(0, 160);
  return text;
}

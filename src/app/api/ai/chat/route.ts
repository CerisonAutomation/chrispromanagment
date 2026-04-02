import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { BLOCK_REGISTRY, buildSchemaSummary, BLOCK_TYPE_NAMES } from "@/lib/block-registry";

// ============================================================
// Shared helpers
// ============================================================

async function callAI(
  systemPrompt: string,
  userMessage: string,
  timeoutMs: number = 20000,
  retries: number = 1
): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        thinking: { type: "disabled" },
      });
      clearTimeout(timer);
      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("Empty response from AI");
      return content;
    } catch (err) {
      clearTimeout(timer);
      if ((err as Error).name === "AbortError") {
        console.error("[chat] AI timeout on attempt", attempt + 1);
      } else {
        console.error("[chat] AI error on attempt", attempt + 1, err);
      }
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500));
      } else {
        throw new Error(
          (err as Error).name === "AbortError" ? "AI request timed out" : "AI request failed"
        );
      }
    }
  }
  throw new Error("AI request failed after retries");
}

// ============================================================
// System prompt builder
// ============================================================

function buildChatSystemPrompt(context?: Record<string, unknown>): string {
  const schemaSummary = buildSchemaSummary();

  let systemPrompt = `You are a helpful AI assistant embedded in the Puck visual editor for Christiano Property Management — a luxury short-term rental management company in Malta.

## YOUR ROLE
You help users build and edit pages for a property management website. You can:
1. Suggest page layouts and content improvements
2. Explain how to use specific block types
3. Recommend content strategies for luxury rental properties
4. Provide copywriting assistance for property descriptions, CTAs, testimonials, etc.
5. Help troubleshoot page structure and block placement

## COMPANY CONTEXT
- Brand: Christiano Property Management
- Industry: Luxury short-term rental management in Malta
- Properties: Apartments in Valletta, villas in Bahar ic-Caghaq, event spaces in Madliena
- Services: Full property management (pricing, cleaning, guest communication, maintenance)
- Tone: Premium, professional, trustworthy, warm
- Key differentiators: 9+ years Superhost, international luxury hotel background, selective portfolio
- Contact: info@christianopropertymanagement.com, +35679790202

## AVAILABLE BLOCK TYPES
${schemaSummary}

## RESPONSE GUIDELINES
- Be concise and actionable — users are editing a live page
- When suggesting blocks, use exact block type names from the list above
- When suggesting props, reference exact field names from the schemas
- For copywriting, match the premium tone described above
- If the user asks about generating a full page, suggest they use the "Build with AI" feature
- If the user asks about editing a specific block, suggest they use the block editor's quick actions
- Format code/JSON in markdown code blocks when relevant
- Keep responses under 300 words unless the user asks for detailed help`;

  if (context) {
    // Add page context if available
    if (context.pageStructure) {
      systemPrompt += `\n\n## CURRENT PAGE STRUCTURE\nThe user's current page has these blocks:\n${JSON.stringify(context.pageStructure, null, 2)}`;
    }
    if (context.selectedComponent) {
      systemPrompt += `\n\n## SELECTED COMPONENT\nThe user currently has this component selected: ${JSON.stringify(context.selectedComponent, null, 2)}`;
    }
  }

  return systemPrompt;
}

// ============================================================
// POST handler
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, context } = body as {
      message?: string;
      context?: Record<string, unknown>;
    };

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "message is required", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    if (message.length > 3000) {
      return NextResponse.json(
        { success: false, error: "message must be under 3000 characters", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    console.log("[chat] Message:", message.substring(0, 100));

    const systemPrompt = buildChatSystemPrompt(context as Record<string, unknown> | undefined);

    const response = await callAI(systemPrompt, message, 20000, 1);

    console.log("[chat] Response length:", response.length);

    return NextResponse.json({ success: true, response });
  } catch (err) {
    console.error("[chat] Error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    const code = message.includes("timeout") || message.includes("timed out")
      ? "AI_TIMEOUT"
      : "AI_FAILURE";

    return NextResponse.json(
      { success: false, error: message, code },
      { status: 500 }
    );
  }
}

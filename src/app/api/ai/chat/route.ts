import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { BLOCK_REGISTRY, buildSchemaSummary, BLOCK_TYPE_NAMES } from "@/lib/block-registry";
import { BUSINESS_CONTEXT, AI_SYSTEM_PROMPT, BLOCK_INSTRUCTIONS } from "@/lib/ai-context";

// ============================================================
// Shared helpers
// ============================================================

async function callAI(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  timeoutMs: number = 20000,
  retries: number = 1
): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages,
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

  // Build concise block listing with AI instructions
  const blockList = Object.entries(BLOCK_INSTRUCTIONS)
    .filter(([type]) => BLOCK_REGISTRY[type])
    .map(([type, instruction]) => {
      const schema = BLOCK_REGISTRY[type];
      return `- **${type}** (${schema.label}): ${instruction.split(".")[0]}.`;
    })
    .join("\n");

  let systemPrompt = `${AI_SYSTEM_PROMPT}

${BUSINESS_CONTEXT}

## AVAILABLE BLOCK TYPES (35 total)
${blockList}

## BLOCK SCHEMAS (detailed)
${schemaSummary}

## RESPONSE GUIDELINES
- Be concise and actionable — users are editing a live page
- When suggesting blocks, use exact block type names from the list above
- When suggesting props, reference exact field names from the schemas
- For copywriting, match the premium tone: sophisticated, warm, Mediterranean luxury
- If the user asks about generating a full page, suggest they use the "Build with AI" feature
- If the user asks about editing a specific block, suggest they use the block editor's "AI Edit" button
- Format code/JSON in markdown code blocks when relevant
- Keep responses under 300 words unless the user asks for detailed help`;

  if (context) {
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
// POST handler — supports conversation history
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message,
      context,
      history,
    } = body as {
      message?: string;
      context?: Record<string, unknown>;
      history?: Array<{ role: "user" | "assistant"; content: string }>;
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

    // Build messages array with conversation history (max 10 previous messages for context)
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history (limited to last 10 exchanges to stay within token limits)
    if (Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-10);
      for (const entry of recentHistory) {
        if (entry.role === "user" || entry.role === "assistant") {
          messages.push({
            role: entry.role,
            content: entry.content.substring(0, 1000), // Truncate long messages
          });
        }
      }
    }

    // Add current message
    messages.push({ role: "user", content: message });

    const response = await callAI(messages, 20000, 1);

    console.log("[chat] Response length:", response.length);

    return NextResponse.json({ success: true, response });
  } catch (err) {
    console.error("[chat] Error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    const code = errorMessage.includes("timeout") || errorMessage.includes("timed out")
      ? "AI_TIMEOUT"
      : "AI_FAILURE";

    return NextResponse.json(
      { success: false, error: errorMessage, code },
      { status: 500 }
    );
  }
}

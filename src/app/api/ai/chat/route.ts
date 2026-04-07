// =============================================================================
// CANONICAL PUCK AI CHAT API
// AI chat completion endpoint with retry logic
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { BLOCK_REGISTRY, buildSchemaSummary } from "@/lib/block-registry";
import {
  AI_SYSTEM_PROMPT,
  BLOCK_INSTRUCTIONS,
  BUSINESS_CONTEXT,
} from "@/lib/ai-context";
import {
  createApiError,
  createRequestLogger,
  ErrorCodes,
  ErrorSeverity,
  withLogging,
} from "@/lib/error";

// ============================================================
// Shared helpers
// ============================================================

async function callAI(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  timeoutMs: number = 20000,
  retries: number = 1
): Promise<string> {
  const log = createRequestLogger(`chat-${Date.now()}`);

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      log.info(`AI chat request attempt ${attempt + 1}`);

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
      const error = err instanceof Error ? err : new Error(String(err));

      if (error.name === "AbortError") {
        log.warn(`AI timeout on attempt ${attempt + 1}`);
      } else {
        log.error(`AI error on attempt ${attempt + 1}`, error);
      }

      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500));
      } else {
        throw error.name === "AbortError"
          ? new Error("AI request timed out")
          : error;
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
// POST handler
// ============================================================

export async function POST(req: NextRequest) {
  const log = createRequestLogger(`chat-${Date.now()}`);

  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
          createApiError("Invalid JSON in request body", ErrorCodes.VALIDATION_ERROR),
          {status: 400}
      );
    }

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
          createApiError("message is required", ErrorCodes.INVALID_REQUEST),
        { status: 400 }
      );
    }

    if (message.length > 3000) {
      return NextResponse.json(
          createApiError("message must be under 3000 characters", ErrorCodes.INVALID_REQUEST),
        { status: 400 }
      );
    }

    log.info("Chat message received", {messageLength: message.length});

    const systemPrompt = buildChatSystemPrompt(context as Record<string, unknown> | undefined);

    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    if (Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-10);
      for (const entry of recentHistory) {
        if (entry.role === "user" || entry.role === "assistant") {
          messages.push({
            role: entry.role,
            content: entry.content.substring(0, 1000),
          });
        }
      }
    }

    messages.push({ role: "user", content: message });

    const response = await withLogging(
        () => callAI(messages, 20000, 1),
        "AI chat",
        ErrorSeverity.INFO
    );

    log.info("Chat response sent", {responseLength: response.length});

    return NextResponse.json({ success: true, response });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    log.error("Chat failed", error);

    const errorMessage = error.message;
    const code = errorMessage.includes("timeout") || errorMessage.includes("timed out")
        ? ErrorCodes.AI_TIMEOUT
        : ErrorCodes.AI_FAILURE;

    return NextResponse.json(
        createApiError(errorMessage, code),
      { status: 500 }
    );
  }
}

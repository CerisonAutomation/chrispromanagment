import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { BLOCK_REGISTRY, buildSchemaSummary, BLOCK_TYPE_NAMES } from "@/lib/block-registry";
import { BUSINESS_CONTEXT, PAGE_GENERATION_PROMPT, BLOCK_INSTRUCTIONS } from "@/lib/ai-context";

// ============================================================
// Shared helpers
// ============================================================

async function callAI(
  systemPrompt: string,
  userMessage: string,
  timeoutMs: number = 30000,
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
        console.error("[build-page] AI timeout on attempt", attempt + 1);
      } else {
        console.error("[build-page] AI error on attempt", attempt + 1, err);
      }
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500));
      } else {
        throw new Error(attempt === retries && (err as Error).name === "AbortError"
          ? "AI request timed out"
          : "AI request failed");
      }
    }
  }
  throw new Error("AI request failed after retries");
}

function extractJSON(text: string): unknown {
  // Try markdown fences first
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {
      // fall through to balanced brace extraction
    }
  }

  // Try direct parse
  try {
    return JSON.parse(text.trim());
  } catch {
    // fall through to balanced brace extraction
  }

  // Try balanced brace extraction
  const start = text.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') depth--;
    if (depth === 0) {
      try {
        return JSON.parse(text.substring(start, i + 1));
      } catch {
        break;
      }
    }
  }

  throw new Error("Could not extract valid JSON from AI response");
}

// ============================================================
// System prompt builder
// ============================================================

function buildSystemPrompt(): string {
  const schemaSummary = buildSchemaSummary();

  // Build block-specific instructions from ai-context
  const blockInstructionEntries = Object.entries(BLOCK_INSTRUCTIONS)
    .filter(([type]) => BLOCK_REGISTRY[type])
    .map(([type, instruction]) => `### ${type}\n${instruction}`)
    .join("\n");

  return `${PAGE_GENERATION_PROMPT}

${BUSINESS_CONTEXT}

## AVAILABLE BLOCK TYPES & SCHEMAS
Each block has a "type" and a "props" object. Use ONLY these exact block types:
${schemaSummary}

## PER-BLOCK AI INSTRUCTIONS
${blockInstructionEntries}

## DATA FORMAT
Return ONLY a JSON object with this exact structure:
{
  "content": [
    { "type": "BlockName", "props": { ...field values matching the schema above } },
    ...
  ],
  "root": { "props": { "title": "Page Title" } }
}

## RULES
1. Use ONLY the block type names listed above — no custom blocks
2. Every field in "props" must match the schema exactly
3. For array fields, each item must have all keys from defaultItemProps
4. For select fields, use ONLY the exact values listed
5. Create 6-10 blocks per page — quality over quantity
6. Recommended page order: HeroSection → SocialProofStrip → AboutSection/WhyChooseUs → ServicesSection/PropertyShowcase → TestimonialSection → FaqSection → CtaBanner → ContactSection → FooterSection
7. Always end with FooterSection
8. Every section must add unique value — no redundancy
9. Generate realistic, compelling copy relevant to the prompt
10. Return ONLY the JSON object, no explanation text`;
}

// ============================================================
// POST handler
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, page, template, currentData } = body as {
      prompt?: string;
      page?: string;
      template?: string;
      currentData?: object;
    };

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "prompt is required", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    if (prompt.length > 2000) {
      return NextResponse.json(
        { success: false, error: "prompt must be under 2000 characters", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    console.log("[build-page] Generating page for prompt:", prompt.substring(0, 100));

    const systemPrompt = buildSystemPrompt();

    let userMessage = `Generate a complete page for: ${prompt}`;
    if (page) {
      userMessage += `\nCurrent page: ${page}`;
    }
    if (template) {
      userMessage += `\nTemplate: ${template}`;
    }
    if (currentData && Object.keys(currentData).length > 0) {
      userMessage += `\nHere is the current page data for reference (modify/enhance based on the prompt):\n${JSON.stringify(currentData, null, 2)}`;
    }

    const rawResponse = await callAI(systemPrompt, userMessage, 30000, 1);

    const parsed = extractJSON(rawResponse) as Record<string, unknown>;

    // Validate the structure
    if (!parsed || typeof parsed !== "object") {
      return NextResponse.json(
        { success: false, error: "AI returned invalid data structure", code: "PARSE_ERROR" },
        { status: 500 }
      );
    }

    // Ensure content array exists
    if (!Array.isArray(parsed.content)) {
      return NextResponse.json(
        { success: false, error: "AI response missing content array", code: "PARSE_ERROR" },
        { status: 500 }
      );
    }

    // Validate and fix each block
    const validContent = parsed.content
      .filter((block: Record<string, unknown>) => block && typeof block === "object" && typeof block.type === "string")
      .map((block: Record<string, unknown>) => {
        const blockType = block.type as string;
        const schema = BLOCK_REGISTRY[blockType];

        if (!schema) {
          console.warn(`[build-page] Unknown block type: ${blockType}, skipping`);
          return null;
        }

        // Merge props with defaultProps to ensure all fields exist
        const blockProps = (typeof block.props === "object" && block.props !== null ? block.props : {}) as Record<string, unknown>;
        const mergedProps = { ...schema.defaultProps, ...blockProps };

        return { type: blockType, props: mergedProps };
      })
      .filter(Boolean);

    // Ensure root exists
    const root = (parsed.root && typeof parsed.root === "object")
      ? parsed.root
      : { props: { title: "New Page" } };

    if (!(root as Record<string, unknown>).props) {
      (root as Record<string, unknown>).props = { title: "New Page" };
    }

    const result = {
      content: validContent,
      root,
    };

    console.log(`[build-page] Generated ${validContent.length} blocks`);

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error("[build-page] Error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    const code = message.includes("timeout") || message.includes("timed out")
      ? "AI_TIMEOUT"
      : message.includes("JSON") || message.includes("parse")
        ? "PARSE_ERROR"
        : "AI_FAILURE";

    return NextResponse.json(
      { success: false, error: message, code },
      { status: 500 }
    );
  }
}

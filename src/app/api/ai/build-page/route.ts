import {NextRequest, NextResponse} from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import {BLOCK_REGISTRY, buildSchemaSummary} from "@/lib/block-registry";
import {BLOCK_INSTRUCTIONS, BUSINESS_CONTEXT, PAGE_GENERATION_PROMPT} from "@/lib/ai-context";
import {createApiError, createRequestLogger, ErrorCode, ErrorCodes, ErrorSeverity, withLogging} from "@/lib/error";

// ============================================================
// Request-scoped logging
// ============================================================

// ============================================================
// Shared helpers with error handling
// ============================================================

async function callAI(
  systemPrompt: string,
  userMessage: string,
  timeoutMs: number = 30000,
  retries: number = 1
): Promise<string> {
  const log = createRequestLogger(`build-page-${Date.now()}`);

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      log.info(`AI request attempt ${attempt + 1}`, {timeoutMs});

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

      log.info("AI request successful", {contentLength: content.length});
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
        log.info("Retrying AI request", {delayMs: 500});
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

function extractJSON(text: string): unknown {
  try {
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
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    err.name = "ParseError";
    throw err;
  }
}

// ============================================================
// System prompt builder
// ============================================================

function buildSystemPrompt(): string {
  const schemaSummary = buildSchemaSummary();

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
  const log = createRequestLogger(`build-page-${Date.now()}`);
  const requestStart = Date.now();

  try {
    // Parse request body with error handling
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      log.warn("Invalid JSON in request body");
      return NextResponse.json(
          createApiError("Invalid JSON in request body", ErrorCodes.VALIDATION_ERROR),
          {status: 400}
      );
    }

    const { prompt, page, template, currentData } = body as {
      prompt?: string;
      page?: string;
      template?: string;
      currentData?: object;
    };

    // Validate required fields
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
          createApiError("prompt is required", ErrorCodes.INVALID_REQUEST),
        { status: 400 }
      );
    }

    if (prompt.length > 2000) {
      return NextResponse.json(
          createApiError("prompt must be under 2000 characters", ErrorCodes.INVALID_REQUEST),
        { status: 400 }
      );
    }

    log.info("Building page", {
      promptLength: prompt.length,
      hasPage: !!page,
      hasTemplate: !!template,
    });

    const systemPrompt = buildSystemPrompt();

    let userMessage = `Generate a complete page for: ${prompt}`;
    if (page) userMessage += `\nCurrent page: ${page}`;
    if (template) userMessage += `\nTemplate: ${template}`;
    if (currentData && Object.keys(currentData).length > 0) {
      userMessage += `\nHere is the current page data for reference:\n${JSON.stringify(currentData, null, 2)}`;
    }

    // Call AI with timeout and retry handling
    const rawResponse = await withLogging(
        () => callAI(systemPrompt, userMessage, 30000, 1),
        "AI page generation",
        ErrorSeverity.INFO
    );

    const parsed = extractJSON(rawResponse) as Record<string, unknown>;

    // Validate structure
    if (!parsed || typeof parsed !== "object") {
      return NextResponse.json(
          createApiError("AI returned invalid data structure", ErrorCodes.AI_PARSE_ERROR),
        { status: 500 }
      );
    }

    if (!Array.isArray(parsed.content)) {
      return NextResponse.json(
          createApiError("AI response missing content array", ErrorCodes.AI_PARSE_ERROR),
        { status: 500 }
      );
    }

    // Validate and filter blocks
    const validContent = parsed.content
      .filter((block: Record<string, unknown>) => block && typeof block === "object" && typeof block.type === "string")
      .map((block: Record<string, unknown>) => {
        const blockType = block.type as string;
        const schema = BLOCK_REGISTRY[blockType];

        if (!schema) {
          log.warn(`Unknown block type: ${blockType}, skipping`);
          return null;
        }

        const blockProps = (typeof block.props === "object" && block.props !== null ? block.props : {}) as Record<string, unknown>;
        const mergedProps = { ...schema.defaultProps, ...blockProps };

        return { type: blockType, props: mergedProps };
      })
      .filter(Boolean);

    const root = (parsed.root && typeof parsed.root === "object")
      ? parsed.root
      : { props: { title: "New Page" } };

    if (!(root as Record<string, unknown>).props) {
      (root as Record<string, unknown>).props = { title: "New Page" };
    }

    const result = {content: validContent, root};
    const duration = Date.now() - requestStart;

    log.info("Page built successfully", {
      blockCount: validContent.length,
      duration,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    const duration = Date.now() - requestStart;

    log.error("Page build failed", error, {duration});

    const message = error.message;
    let code: ErrorCode = ErrorCodes.INTERNAL_ERROR;

    if (message.includes("timeout") || message.includes("timed out")) {
      code = ErrorCodes.AI_TIMEOUT;
    } else if (message.includes("JSON") || message.includes("parse") || message.includes("ParseError")) {
      code = ErrorCodes.AI_PARSE_ERROR;
    }

    return NextResponse.json(
        createApiError(message, code),
      { status: 500 }
    );
  }
}

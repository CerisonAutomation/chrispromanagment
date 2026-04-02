import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { BLOCK_REGISTRY, buildSchemaSummary } from "@/lib/block-registry";

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
        console.error("[edit-block] AI timeout on attempt", attempt + 1);
      } else {
        console.error("[edit-block] AI error on attempt", attempt + 1, err);
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

function buildBlockEditorPrompt(blockType: string, schema: ReturnType<typeof BLOCK_REGISTRY[string]>): string {
  const fieldsDescription = Object.entries(schema.fields)
    .map(([name, field]) => {
      if (field.type === "array") {
        const subFields = Object.entries(field.arrayFields || {})
          .map(([k, v]) => `    - ${k}: ${v.type}${v.options ? ` (${v.options.map((o) => o.value).join("|")})` : ""}`)
          .join("\n");
        return `  - ${name}: array of ${JSON.stringify(field.defaultItemProps)}\n${subFields}`;
      }
      return `  - ${name}: ${field.type}${field.options ? ` (${field.options.map((o) => o.value).join("|")})` : ""} — ${field.description || ""}`;
    })
    .join("\n");

  return `You are an expert content editor for Christiano Property Management — a luxury short-term rental management company in Malta. You edit individual Puck editor block props.

## COMPANY CONTEXT
- Brand: Christiano Property Management
- Industry: Luxury short-term rental management  
- Location: Malta
- Tone: Premium, professional, trustworthy, warm
- 9+ years experience, Superhost, international hospitality standards

## BLOCK TYPE: ${blockType} (${schema.label})
Fields schema:
${fieldsDescription}

## DEFAULT PROPS (baseline values):
${JSON.stringify(schema.defaultProps, null, 2)}

## RULES
1. Return ONLY a JSON object with the updated props — no explanation, no markdown
2. Do NOT nest the props under a "props" key — return them directly at the top level
3. Every field from the schema must be present in the output
4. For array fields, keep the same structure — modify content but preserve field keys
5. For select fields, use ONLY the exact values listed in the schema
6. Keep copy concise, premium, and relevant to luxury property management
7. If the instruction asks to add items to an array, add 1-3 items max
8. If the instruction asks to remove items, keep at least 1 item in the array
9. Do NOT modify field names or create new fields not in the schema
10. Return raw JSON only — no code fences, no explanation`;
}

// ============================================================
// POST handler
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { blockType, currentProps, instruction } = body as {
      blockType?: string;
      currentProps?: Record<string, unknown>;
      instruction?: string;
    };

    if (!blockType || typeof blockType !== "string") {
      return NextResponse.json(
        { success: false, error: "blockType is required", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    if (!instruction || typeof instruction !== "string") {
      return NextResponse.json(
        { success: false, error: "instruction is required", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    if (instruction.length > 1000) {
      return NextResponse.json(
        { success: false, error: "instruction must be under 1000 characters", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    const schema = BLOCK_REGISTRY[blockType];
    if (!schema) {
      return NextResponse.json(
        {
          success: false,
          error: `Unknown block type: ${blockType}. Valid types: ${Object.keys(BLOCK_REGISTRY).join(", ")}`,
          code: "INVALID_REQUEST",
        },
        { status: 400 }
      );
    }

    console.log(`[edit-block] Editing ${blockType}: ${instruction.substring(0, 80)}`);

    const systemPrompt = buildBlockEditorPrompt(blockType, schema);

    let userMessage = `Instruction: ${instruction}\n\nCurrent props:\n${JSON.stringify(currentProps || {}, null, 2)}`;

    const rawResponse = await callAI(systemPrompt, userMessage, 20000, 1);

    const parsed = extractJSON(rawResponse) as Record<string, unknown>;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json(
        { success: false, error: "AI returned invalid props structure", code: "PARSE_ERROR" },
        { status: 500 }
      );
    }

    // Merge AI response with defaultProps to ensure all required fields exist
    const mergedProps: Record<string, unknown> = { ...schema.defaultProps, ...currentProps, ...parsed };

    // Validate select fields
    for (const [fieldName, fieldDef] of Object.entries(schema.fields)) {
      if (fieldDef.type === "select" && fieldDef.options && mergedProps[fieldName] !== undefined) {
        const validValues = fieldDef.options.map((o) => o.value);
        if (!validValues.includes(mergedProps[fieldName] as string)) {
          console.warn(`[edit-block] Invalid select value for ${fieldName}: ${mergedProps[fieldName]}, resetting to default`);
          mergedProps[fieldName] = schema.defaultProps[fieldName];
        }
      }
    }

    console.log(`[edit-block] Successfully edited ${blockType}`);

    return NextResponse.json({ success: true, props: mergedProps });
  } catch (err) {
    console.error("[edit-block] Error:", err);
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

// =============================================================================
// CANONICAL AI API ROUTES - Puck Integration
// =============================================================================

import {NextRequest, NextResponse} from "next/server";

// =============================================================================
// POST /api/ai/generate-field
// Generate field content using AI
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fieldName, model = "gpt-4o", context = {} } = body;

    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI not configured", content: "" },
        { status: 400 }
      );
    }

    // Build prompt for field generation
    const prompt = `Generate compelling content for a Puck CMS field called "${fieldName}".
Context: ${JSON.stringify(context)}
Generate short, impactful content (1-2 sentences for text, paragraphs for textarea).
Focus on luxury property management in Malta.`;

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are an expert copywriter for luxury real estate websites.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({ content, success: true });
  } catch (error) {
    console.error("Generate field error:", error);
    return NextResponse.json(
      { error: "Generation failed", content: "" },
      { status: 500 }
    );
  }
}

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const runtime = 'edge';
export const maxDuration = 30;

const RequestSchema = z.object({
  propertyType: z.string().min(1),
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().min(0).max(20),
  location: z.string().min(1),
  amenities: z.array(z.string()).max(30),
  pricePerNight: z.number().positive().optional(),
  style: z.enum(['luxury', 'casual', 'professional', 'airbnb']).default('luxury'),
  language: z.enum(['en', 'mt', 'de', 'fr', 'it']).default('en'),
  maxLength: z.number().int().min(50).max(1000).default(300),
});

export async function POST(req: NextRequest): Promise<Response> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await req.json();
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: 'Validation failed', issues: parsed.error.flatten() }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { propertyType, bedrooms, bathrooms, location, amenities, pricePerNight, style, language, maxLength } = parsed.data;

  const styleGuide = {
    luxury: 'Use sophisticated, aspirational language. Emphasize exclusivity, premium finishes, and lifestyle elevation.',
    casual: 'Use warm, inviting language. Emphasize comfort, convenience, and home-like feel.',
    professional: 'Use clear, factual language. Emphasize practicality, value, and amenities list.',
    airbnb: 'Use engaging, personal language. Emphasize unique character, local experience, and host hospitality.',
  }[style];

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: `You are a world-class property copywriter. ${styleGuide} Write in ${language}. Maximum ${maxLength} words. No placeholder text.`,
    prompt: `Write a compelling property description for:\n- Type: ${propertyType}\n- Bedrooms: ${bedrooms} | Bathrooms: ${bathrooms}\n- Location: ${location}\n- Amenities: ${amenities.join(', ')}${pricePerNight ? `\n- Price: €${pricePerNight}/night` : ''}\n\nOutput only the description, no headers or labels.`,
    temperature: 0.7,
    maxOutputTokens: 500,
  });

  return result.toTextStreamResponse();
}

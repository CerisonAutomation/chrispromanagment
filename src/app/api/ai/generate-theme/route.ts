/**
 * @file generate-theme — AI Theme Creator endpoint.
 * Accepts natural-language description → returns full design token set.
 */
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'edge';
export const maxDuration = 30;

const ThemeTokenSchema = z.object({
  name: z.string().describe('Short theme name, e.g. "Santorini Blue"'),
  description: z.string().describe('One sentence description'),
  tokens: z.object({
    '--pm-bg': z.string(),
    '--pm-bg-2': z.string(),
    '--pm-bg-3': z.string(),
    '--pm-border': z.string(),
    '--pm-accent': z.string(),
    '--pm-accent-fg': z.string(),
    '--pm-text': z.string(),
    '--pm-text-muted': z.string(),
    '--pm-radius': z.string(),
    '--pm-font': z.string(),
  }),
  darkMode: z.boolean(),
  previewGradient: z.string().describe('CSS gradient for swatch preview'),
});

export type GeneratedTheme = z.infer<typeof ThemeTokenSchema>;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const limited = await rateLimit(req, { limit: 20, window: '1m' });
  if (!limited.success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  const body = await req.json() as { prompt?: string };
  if (!body.prompt) return NextResponse.json({ error: 'Prompt required' }, { status: 400 });

  const { object } = await generateObject({
    model: openai('gpt-4o'),
    schema: ThemeTokenSchema,
    system: `You are a world-class UI/UX design token architect for luxury property websites.
Generate cohesive, beautiful, WCAG-AA contrast-safe design tokens.
Never use pure #000 or #fff. Use harmonious palettes. Font must be a Google Fonts stack.`,
    prompt: body.prompt,
    temperature: 0.8,
  });

  return NextResponse.json({ success: true, theme: object, generatedAt: new Date().toISOString() });
}

import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const runtime = 'edge';
export const maxDuration = 30;

const BlockSchema = z.object({
  id: z.string().describe('Unique block ID, format: block_<type>_<random6chars>'),
  type: z.string(),
  props: z.record(z.unknown()),
});

const ResponseSchema = z.object({
  blocks: z.array(BlockSchema).min(1).max(8),
  reasoning: z.string().describe('Brief explanation of block selection rationale'),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { prompt, existingBlocks, pageSlug } = body as {
    prompt: string;
    existingBlocks?: unknown[];
    pageSlug?: string;
  };

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
  }

  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: ResponseSchema,
    system: `You are a Puck CMS block composer. Generate blocks with unique IDs (format: block_Hero_a1b2c3).\nAvailable types: Hero, PropertyCard, TextBlock, CTASection, FeatureGrid, TestimonialBlock, BookingWidget, ContactForm, GalleryGrid, StatsBar.\n${existingBlocks ? `Existing page blocks: ${JSON.stringify(existingBlocks)}` : ''}\n${pageSlug ? `Page: ${pageSlug}` : ''}`,
    prompt,
  });

  return NextResponse.json({ success: true, ...object, generatedAt: new Date().toISOString() });
}

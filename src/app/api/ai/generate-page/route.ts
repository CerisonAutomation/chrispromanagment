import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const runtime = 'edge';
export const maxDuration = 30;

const PuckBlockSchema = z.object({
  type: z.string().describe('Puck block component type (Hero, PropertyCard, TextBlock, CTASection, FeatureGrid, TestimonialBlock, BookingWidget, ContactForm, GalleryGrid, StatsBar)'),
  props: z.record(z.unknown()).describe('Block props matching the component configuration'),
});

const PageSchema = z.object({
  title: z.string().describe('SEO-optimized page title'),
  description: z.string().describe('Meta description, 150-160 chars'),
  blocks: z.array(PuckBlockSchema).min(2).max(12).describe('Ordered Puck blocks composing the page'),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { prompt, pageType, propertyData } = body as {
    prompt: string;
    pageType?: string;
    propertyData?: Record<string, unknown>;
  };

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 5) {
    return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 });
  }

  const systemPrompt = `You are an expert Puck CMS page architect for a premium property management platform.
Available block types and their required props:
- Hero: { title, subtitle, backgroundImage, ctaText, ctaLink, overlayOpacity }
- PropertyCard: { title, price, bedrooms, bathrooms, imageUrl, location, slug }
- TextBlock: { content, alignment, fontSize, fontWeight }
- CTASection: { headline, subtext, buttonLabel, buttonLink, variant }
- FeatureGrid: { title, features: [{icon, title, description}] }
- TestimonialBlock: { quote, author, role, avatarUrl }
- BookingWidget: { propertyId, checkInLabel, checkOutLabel, guestsLabel }
- ContactForm: { title, fields: string[], submitLabel }
- GalleryGrid: { images: [{src, alt}], columns }
- StatsBar: { stats: [{label, value, suffix}] }

Generate a complete, logical page structure. Props must be realistic and detailed.
${propertyData ? `\nProperty context: ${JSON.stringify(propertyData)}` : ''}`;

  const { object } = await generateObject({
    model: openai('gpt-4o'),
    schema: PageSchema,
    system: systemPrompt,
    prompt: `Page type: ${pageType ?? 'general'}\n\nUser request: ${prompt}`,
  });

  return NextResponse.json({
    success: true,
    page: object,
    generatedAt: new Date().toISOString(),
  });
}

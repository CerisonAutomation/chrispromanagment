import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const runtime = 'edge';
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are an expert property management AI assistant for Christiano Property Management.
You help with:
- Property listings, descriptions, and marketing copy
- Tenant communications and lease inquiries  
- Maintenance request triage and prioritization
- Booking and availability questions
- Page and content generation for the Puck CMS builder

Always be professional, concise, and actionable. For property descriptions, emphasize unique features, location benefits, and lifestyle appeal.`;

export async function POST(req: NextRequest): Promise<Response> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { messages, propertyContext } = await req.json();

  const systemWithContext = propertyContext
    ? `${SYSTEM_PROMPT}\n\nCurrent property context:\n${JSON.stringify(propertyContext, null, 2)}`
    : SYSTEM_PROMPT;

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: systemWithContext,
    messages,
    maxTokens: 2048,
    tools: {
      generatePropertyDescription: tool({
        description: 'Generate a compelling property description for listings',
        parameters: z.object({
          propertyType: z.string().describe('Type of property (apartment, villa, studio, etc.)'),
          bedrooms: z.number().describe('Number of bedrooms'),
          bathrooms: z.number().describe('Number of bathrooms'),
          location: z.string().describe('Property location or neighborhood'),
          amenities: z.array(z.string()).describe('List of amenities'),
          pricePerNight: z.number().optional().describe('Nightly rental price'),
        }),
        execute: async ({ propertyType, bedrooms, bathrooms, location, amenities, pricePerNight }) => {
          return {
            prompt: `Generate a premium property description for a ${bedrooms}BR/${bathrooms}BA ${propertyType} in ${location} with amenities: ${amenities.join(', ')}${pricePerNight ? ` at €${pricePerNight}/night` : ''}.`,
            generated: true,
          };
        },
      }),
      searchProperties: tool({
        description: 'Search for properties matching criteria',
        parameters: z.object({
          query: z.string().describe('Natural language search query'),
          maxResults: z.number().default(5).describe('Maximum results to return'),
        }),
        execute: async ({ query, maxResults }) => {
          return { query, maxResults, note: 'Property search results would be fetched from DB here' };
        },
      }),
    },
    onFinish: ({ usage }) => {
      // Log token usage for monitoring
      console.info('[AI Chat] Tokens used:', usage);
    },
  });

  return result.toDataStreamResponse();
}

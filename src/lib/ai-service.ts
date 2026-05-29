/**
 * @fileoverview AI Service — Production-grade AI operations for audit, critique, and block synthesis.
 * Integrates with OpenAI/Anthropic for intelligent page analysis and optimization.
 * @module lib/ai-service
 * @version 8.0.0
 */

import { openai } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import type { PuckPageData, PuckBlock, AuditIssue, PageAuditResult, CritiqueResult } from './mcp-client';
import { BLOCK_REGISTRY } from './block-registry';
import { AI_SYSTEM_PROMPT, BUSINESS_CONTEXT } from './ai-context';

// ═══════════════════════════════════════════════════════════════════════════════
// SCHEMAS — Zod validation for all AI-generated outputs
// ═══════════════════════════════════════════════════════════════════════════════

const AuditIssueSchema = z.object({
  severity: z.enum(['error', 'warning', 'info']),
  category: z.enum(['structure', 'content', 'seo', 'accessibility', 'performance', 'brand']),
  blockIndex: z.number().optional(),
  blockType: z.string().optional(),
  message: z.string(),
  recommendation: z.string(),
  autoFixable: z.boolean(),
});

const PageAuditSchema = z.object({
  valid: z.boolean(),
  score: z.number().min(0).max(100),
  issues: z.array(AuditIssueSchema),
  summary: z.object({
    totalBlocks: z.number(),
    blockTypeCounts: z.record(z.string(), z.number()),
    hasHero: z.boolean(),
    hasCTA: z.boolean(),
    hasFooter: z.boolean(),
    hasContact: z.boolean(),
  }),
  recommendations: z.array(z.string()),
});

const CritiqueFeedbackSchema = z.object({
  aspect: z.string(),
  rating: z.number().min(0).max(100),
  comment: z.string(),
  suggestion: z.string(),
});

const CritiqueResultSchema = z.object({
  blockId: z.string(),
  blockType: z.string(),
  overallScore: z.number().min(0).max(100),
  dimensions: z.object({
    contentQuality: z.number().min(0).max(100),
    designAlignment: z.number().min(0).max(100),
    brandCompliance: z.number().min(0).max(100),
    accessibility: z.number().min(0).max(100),
    seo: z.number().min(0).max(100),
  }),
  feedback: z.array(CritiqueFeedbackSchema),
  improvements: z.array(z.string()),
  rewriteSuggestion: z.string().optional(),
});

const CustomBlockSchema = z.object({
  blockType: z.string(),
  schema: z.object({
    label: z.string(),
    fields: z.record(z.string(), z.object({
      type: z.enum(['text', 'textarea', 'select', 'array', 'number', 'boolean']),
      label: z.string().optional(),
      description: z.string().optional(),
      required: z.boolean().optional(),
    })),
    defaultProps: z.record(z.string(), z.unknown()),
  }),
  generatedCode: z.string(),
  filePath: z.string(),
});

const PageOptimizationSchema = z.object({
  optimized: z.boolean(),
  slug: z.string(),
  changes: z.array(z.object({
    type: z.string(),
    blockIndex: z.number(),
    description: z.string(),
  })),
  score: z.object({
    before: z.number().min(0).max(100),
    after: z.number().min(0).max(100),
  }),
});

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIT ENGINE — Comprehensive page analysis
// ═══════════════════════════════════════════════════════════════════════════════

export interface AuditOptions {
  readonly focus?: readonly ('structure' | 'content' | 'seo' | 'accessibility' | 'performance' | 'brand')[];
  readonly strictness?: 'strict' | 'normal' | 'lenient';
}

export async function auditPage(
  pageData: PuckPageData,
  options: AuditOptions = {}
): Promise<PageAuditResult> {
  const { focus = ['structure', 'content', 'seo', 'accessibility', 'brand'], strictness = 'normal' } = options;

  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: PageAuditSchema,
    system: `${AI_SYSTEM_PROMPT}

You are a clinical page auditor for the Puck CMS. Your task is to analyze page data and identify all issues, violations, and improvement opportunities.

## Audit Focus Areas
${focus.map(f => `- ${f.toUpperCase()}`).join('\n')}

## Strictness Level: ${strictness.toUpperCase()}
- STRICT: Flag even minor issues, require perfection
- NORMAL: Flag clear problems and suggested improvements  
- LENIENT: Only flag critical errors

## Brand Compliance Check
- All content must align with Christiano Property Management brand voice
- Use British/Commonwealth English conventions
- Maintain luxury Mediterranean aesthetic
- Verify contact details match: info@christianopropertymanagement.com, +35679790202

## Accessibility Requirements (WCAG 2.1 AA)
- All images must have alt text
- Proper heading hierarchy (H1 → H2 → H3)
- Minimum 44px touch targets for interactive elements
- Sufficient color contrast
- Keyboard navigation support

## SEO Requirements
- Meta title and description present
- Semantic HTML structure
- No duplicate H1 tags
- Proper OpenGraph tags

## Output Format
Return a complete audit with score (0-100), categorized issues, and actionable recommendations.`,
    prompt: `Audit this Puck page data:

${JSON.stringify(pageData, null, 2)}

Available block types: ${Object.keys(BLOCK_REGISTRY).join(', ')}

Analyze the page and return a comprehensive audit result.`,
    maxOutputTokens: 4000,
  });

  return object;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CRITIQUE ENGINE — Block-level quality analysis
// ═══════════════════════════════════════════════════════════════════════════════

export interface CritiqueOptions {
  readonly focus?: readonly ('content' | 'design' | 'accessibility' | 'seo')[];
  readonly compareToBlockType?: string;
}

export async function critiqueBlock(
  block: PuckBlock,
  pageContext: PuckPageData,
  options: CritiqueOptions = {}
): Promise<CritiqueResult> {
  const { focus = ['content', 'design'], compareToBlockType } = options;

  const blockSchema = BLOCK_REGISTRY[block.type];
  const schemaInfo = blockSchema
    ? `\n\nBlock Schema:\n- Label: ${blockSchema.label}\n- Fields: ${Object.keys(blockSchema.fields).join(', ')}`
    : '';

  const comparisonInfo = compareToBlockType
    ? `\n\nCompare to reference block type: ${compareToBlockType}`
    : '';

  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: CritiqueResultSchema,
    system: `${AI_SYSTEM_PROMPT}

You are a precise block-level content and design critic. Analyze individual Puck blocks for quality, brand alignment, and effectiveness.

## Critique Dimensions
- CONTENT_QUALITY: Grammar, clarity, persuasiveness, conciseness
- DESIGN_ALIGNMENT: Visual hierarchy, spacing, consistency with design system
- BRAND_COMPLIANCE: Voice, tone, terminology accuracy for Christiano Property Management
- ACCESSIBILITY: Alt text, semantic structure, ARIA labels
- SEO: Keywords, meta data, semantic markup

## Scoring Guidelines
- 90-100: Exceptional, publish-ready
- 70-89: Good with minor improvements needed
- 50-69: Acceptable but needs significant work
- 0-49: Major issues, requires rewrite

## Brand Voice Reference
${BUSINESS_CONTEXT}

Provide specific, actionable feedback with concrete rewrite suggestions when applicable.`,
    prompt: `Critique this Puck block:

Block Type: ${block.type}
Block Props: ${JSON.stringify(block.props, null, 2)}${schemaInfo}${comparisonInfo}

Page Context (nearby blocks): ${pageContext.content.map(b => b.type).join(' → ')}

Focus areas: ${focus.join(', ')}

Provide a detailed critique with scores, feedback, and improvement suggestions.`,
    maxOutputTokens: 3000,
  });

  return object;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK FACTORY — AI-powered custom block generation
// ═══════════════════════════════════════════════════════════════════════════════

export interface CustomBlockSpec {
  readonly name: string;
  readonly description: string;
  readonly fields: ReadonlyArray<{
    readonly name: string;
    readonly type: 'text' | 'textarea' | 'select' | 'array' | 'number' | 'boolean';
    readonly label?: string;
    readonly required?: boolean;
  }>;
  readonly renderHint?: string;
}

export async function generateCustomBlock(spec: CustomBlockSpec): Promise<{
  readonly blockType: string;
  readonly schema: Record<string, unknown>;
  readonly generatedCode: string;
  readonly filePath: string;
}> {
  const { object } = await generateObject({
    model: openai('gpt-4o'),
    schema: CustomBlockSchema,
    system: `${AI_SYSTEM_PROMPT}

You are a TypeScript React component generator for the Puck CMS. Create production-ready, type-safe block components.

## Code Generation Rules
1. Use TypeScript with strict typing
2. Use "use client" directive for client components
3. Import from @/lib/utils for cn() utility
4. Use Lucide icons only (import from lucide-react)
5. Follow the existing block component patterns
6. Include proper JSDoc documentation
7. Use Tailwind CSS classes with cpm-* prefix for theming
8. Support both dark and light modes via CSS variables

## Block Component Structure
\`\`\`tsx
"use client";

import { cn } from "@/lib/utils";
import { IconName } from "lucide-react";

export interface BlockNameProps {
  id: string;
  title: string;
  // ... other fields
}

export function BlockName({ id, title, ...props }: BlockNameProps) {
  return (
    <section className={cn("py-16 px-4", "bg-cpm-bg-primary")}>
      {/* Implementation */}
    </section>
  );
}
\`\`\`

## Design System Reference
- Background: bg-cpm-bg-primary (#0e0f11), bg-cpm-bg-secondary (#15171b)
- Text: text-cpm-text-primary (#ede9e0), text-cpm-text-secondary (#9a9690)
- Accent: text-cpm-accent (#c8a96a), hover:text-cpm-accent-hover (#d4b87a)
- Spacing: py-16 for sections, gap-8 for grids, space-y-4 for stacks

Generate complete, ready-to-use TypeScript React code.`,
    prompt: `Generate a custom Puck block component based on this specification:

Name: ${spec.name}
Description: ${spec.description}
Render Hint: ${spec.renderHint ?? 'Standard section layout'}

Fields:
${spec.fields.map(f => `- ${f.name} (${f.type})${f.label ? ` - ${f.label}` : ''}${f.required ? ' [required]' : ''}`).join('\n')}

Existing block types for reference: ${Object.keys(BLOCK_REGISTRY).slice(0, 10).join(', ')}...

Generate:
1. Block type name (PascalCase, e.g., "CustomFeatureSection")
2. Complete Zod-style schema definition
3. Full TypeScript React component code
4. Recommended file path (src/blocks/[kebab-name].tsx)

Return the complete generated code that can be dropped into the codebase.`,
    maxOutputTokens: 4000,
  });

  return {
    blockType: object.blockType,
    schema: object.schema,
    generatedCode: object.generatedCode,
    filePath: object.filePath,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTIMIZATION ENGINE — Auto-improve pages with AI
// ═══════════════════════════════════════════════════════════════════════════════

export interface OptimizationOptions {
  readonly focus?: readonly ('seo' | 'accessibility' | 'performance' | 'content')[];
  readonly autoApply?: boolean;
}

export async function optimizePage(
  pageData: PuckPageData,
  slug: string,
  options: OptimizationOptions = {}
): Promise<{
  readonly optimized: boolean;
  readonly slug: string;
  readonly changes: ReadonlyArray<{
    readonly type: string;
    readonly blockIndex: number;
    readonly description: string;
    readonly suggestedProps?: Record<string, unknown>;
  }>;
  readonly score: {
    readonly before: number;
    readonly after: number;
  };
}> {
  const { focus = ['seo', 'accessibility'] } = options;

  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: PageOptimizationSchema.extend({
      changes: z.array(z.object({
        type: z.string(),
        blockIndex: z.number(),
        description: z.string(),
        suggestedProps: z.record(z.string(), z.unknown()).optional(),
      })),
    }),
    system: `${AI_SYSTEM_PROMPT}

You are a page optimization engine for the Puck CMS. Analyze page data and suggest improvements to maximize quality, SEO, and accessibility.

## Optimization Strategy
1. Identify underperforming blocks
2. Suggest content improvements (headlines, CTAs, descriptions)
3. Add missing accessibility attributes
4. Improve semantic HTML structure
5. Enhance SEO metadata

## Change Types
- CONTENT_REWRITE: Improve text content
- PROP_UPDATE: Modify existing props
- BLOCK_REORDER: Suggest better positioning
- BLOCK_ADD: Recommend missing block types
- BLOCK_REMOVE: Identify redundant blocks

## Output Format
For each change, provide:
- type: The change category
- blockIndex: Which block to modify
- description: Human-readable explanation
- suggestedProps (optional): New prop values to apply

Calculate before/after quality scores based on best practices.`,
    prompt: `Optimize this Puck page:

Slug: ${slug}
Focus areas: ${focus.join(', ')}

Current page data:
${JSON.stringify(pageData, null, 2)}

Identify optimization opportunities and return specific changes with suggested prop values.`,
    maxOutputTokens: 4000,
  });

  return {
    optimized: object.optimized,
    slug: object.slug,
    changes: object.changes,
    score: object.score,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTENT GENERATION — Smart block content synthesis
// ═══════════════════════════════════════════════════════════════════════════════

export async function generateBlockContent(
  blockType: string,
  context: {
    readonly pageType?: string;
    readonly existingBlocks?: readonly string[];
    readonly targetAudience?: string;
    readonly tone?: 'professional' | 'casual' | 'luxury' | 'friendly';
  } = {}
): Promise<Record<string, unknown>> {
  const schema = BLOCK_REGISTRY[blockType];
  if (!schema) {
    throw new Error(`Unknown block type: ${blockType}`);
  }

  const fieldDescriptions = Object.entries(schema.fields)
    .map(([key, field]) => `- ${key} (${field.type}): ${field.description ?? ''}`)
    .join('\n');

  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: z.record(z.string(), z.unknown()),
    system: `${AI_SYSTEM_PROMPT}

Generate high-quality, brand-aligned content for Puck CMS blocks.

## Content Generation Rules
1. Match Christiano Property Management's luxury Mediterranean brand voice
2. Use British/Commonwealth English conventions
3. Keep headlines under 80 characters
4. Keep descriptions concise (1-3 sentences)
5. Use real Malta locations (Valletta, Sliema, St. Julian's, Mdina, Gozo)
6. Include authentic details and specific amenities
7. Generate realistic guest testimonials with specific praise

## Brand Voice
Sophisticated, warm, trustworthy Mediterranean luxury. Never generic or salesy.`,
    prompt: `Generate content for a ${blockType} block.

Context:
- Page type: ${context.pageType ?? 'landing'}
- Existing blocks: ${context.existingBlocks?.join(', ') ?? 'none'}
- Target audience: ${context.targetAudience ?? 'luxury travelers'}
- Tone: ${context.tone ?? 'luxury'}

Fields to populate:
${fieldDescriptions}

Default props reference: ${JSON.stringify(schema.defaultProps, null, 2)}

Generate production-ready content that matches the field types and brand voice.`,
    maxOutputTokens: 2000,
  });

  return object;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BATCH OPERATIONS — Multi-block and multi-page processing
// ═══════════════════════════════════════════════════════════════════════════════

export async function auditMultiplePages(
  pages: ReadonlyArray<{ readonly slug: string; readonly data: PuckPageData }>
): Promise<ReadonlyArray<{ readonly slug: string; readonly audit: PageAuditResult }>> {
  const results = await Promise.all(
    pages.map(async ({ slug, data }) => ({
      slug,
      audit: await auditPage(data, { strictness: 'normal' }),
    }))
  );
  return results;
}

export async function critiqueAllBlocks(
  pageData: PuckPageData
): Promise<ReadonlyArray<{ readonly blockIndex: number; readonly critique: CritiqueResult }>> {
  const results = await Promise.all(
    pageData.content.map(async (block, index) => ({
      blockIndex: index,
      critique: await critiqueBlock(block, pageData),
    }))
  );
  return results;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export function calculateAuditScore(issues: ReadonlyArray<AuditIssue>): number {
  const weights = { error: 10, warning: 3, info: 1 };
  const penalty = issues.reduce((sum, issue) => sum + weights[issue.severity], 0);
  return Math.max(0, 100 - penalty);
}

export function filterFixableIssues(issues: ReadonlyArray<AuditIssue>): ReadonlyArray<AuditIssue> {
  return issues.filter(i => i.autoFixable);
}

export function groupIssuesByCategory(
  issues: ReadonlyArray<AuditIssue>
): Record<string, ReadonlyArray<AuditIssue>> {
  return issues.reduce((groups, issue) => {
    const key = issue.category;
    return { ...groups, [key]: [...(groups[key] ?? []), issue] };
  }, {} as Record<string, ReadonlyArray<AuditIssue>>);
}

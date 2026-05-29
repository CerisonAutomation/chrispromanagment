/**
 * @fileoverview MCP Tools Proxy API — Bridge between Next.js app and Ω⁷ MCP Server.
 * Exposes all 14 MCP tools + 4 AI-powered tools via REST endpoints.
 * @route /api/mcp/tools/[tool]
 * @version 8.0.0
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { execSync } from 'child_process';
import { join } from 'path';

// ═══════════════════════════════════════════════════════════════════════════════
// MCP SERVER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const MCP_SERVER_PATH = join(process.cwd(), 'puck-builder-mcp/dist/index.js');
const MCP_ENV = {
  NODE_ENV: process.env.NODE_ENV ?? 'production',
  PUCK_STORE_PATH: process.env.PUCK_STORE_PATH ?? join(process.cwd(), 'data/puck-pages.json'),
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
};

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL REGISTRY — All available MCP tools with their schemas
// ═══════════════════════════════════════════════════════════════════════════════

const TOOL_SCHEMAS = {
  list_puck_components: z.object({
    category: z.enum(['layout', 'typography', 'interactive', 'hero', 'guesty', 'media', 'other']).optional(),
  }),
  generate_block: z.object({
    type: z.string(),
    props: z.record(z.string(), z.unknown()).optional().default({}),
  }),
  generate_page: z.object({
    slug: z.string().startsWith('/'),
    preset: z.enum(['landing', 'property', 'malta', 'pricing', 'about', 'blank']).default('blank'),
    title: z.string().optional().default('New Page'),
    overrides: z.array(z.object({
      index: z.number().int().min(0),
      props: z.record(z.string(), z.unknown()),
    })).optional().default([]),
  }),
  add_block_to_page: z.object({
    slug: z.string().startsWith('/'),
    type: z.string(),
    props: z.record(z.string(), z.unknown()).optional().default({}),
    index: z.number().int().min(0).optional(),
  }),
  validate_page_data: z.object({
    data: z.record(z.string(), z.unknown()),
  }),
  get_page: z.object({
    slug: z.string().startsWith('/'),
  }),
  list_presets: z.object({}),
  list_pages: z.object({}),
  delete_page: z.object({
    slug: z.string().startsWith('/'),
  }),
  clone_page: z.object({
    sourceSlug: z.string().startsWith('/'),
    targetSlug: z.string().startsWith('/'),
    newTitle: z.string().optional(),
  }),
  patch_block: z.object({
    slug: z.string().startsWith('/'),
    blockId: z.string().optional(),
    index: z.number().int().min(0).optional(),
    props: z.record(z.string(), z.unknown()),
  }),
  reorder_blocks: z.object({
    slug: z.string().startsWith('/'),
    fromIndex: z.number().int().min(0),
    toIndex: z.number().int().min(0),
  }),
  export_all_pages: z.object({}),
  health_check: z.object({}),
  // AI-powered tools
  audit_page: z.object({
    slug: z.string().startsWith('/'),
    focus: z.array(z.enum(['structure', 'content', 'seo', 'accessibility', 'performance', 'brand'])).optional(),
    strictness: z.enum(['strict', 'normal', 'lenient']).optional().default('normal'),
  }),
  critique_block: z.object({
    pageSlug: z.string().startsWith('/'),
    blockId: z.string(),
    focus: z.array(z.enum(['content', 'design', 'accessibility', 'seo'])).optional(),
  }),
  optimize_page: z.object({
    slug: z.string().startsWith('/'),
    focus: z.array(z.enum(['seo', 'accessibility', 'performance', 'content'])).optional(),
    autoApply: z.boolean().optional().default(false),
  }),
  generate_custom_block: z.object({
    name: z.string().min(1).max(100),
    description: z.string().min(10).max(500),
    fields: z.array(z.object({
      name: z.string(),
      type: z.enum(['text', 'textarea', 'select', 'array', 'number', 'boolean']),
      label: z.string().optional(),
      required: z.boolean().optional().default(false),
    })).min(1).max(20),
    renderHint: z.string().optional(),
  }),
} as const;

type ToolName = keyof typeof TOOL_SCHEMAS;

// ═══════════════════════════════════════════════════════════════════════════════
// AUTHENTICATION — Admin-only access
// ═══════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// AUTHENTICATION — Admin-only access via Supabase
// ════════════════════════════════════════════════════════════════════════════

const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];

/**
 * Check if user has admin privileges
 */
function checkIsAdmin(email: string | undefined): boolean {
  if (!email) return false;
  
  // Check against admin emails list
  if (adminEmails.includes(email.toLowerCase())) return true;
  
  // Check if email domain matches (optional)
  const adminDomain = process.env.ADMIN_EMAIL_DOMAIN;
  if (adminDomain && email.toLowerCase().endsWith(`@${adminDomain.toLowerCase()}`)) return true;
  
  return false;
}

async function authenticate(req: NextRequest): Promise<{ authenticated: boolean; error?: string }> {
  try {
    // Get Supabase client dynamically to avoid top-level import issues
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    
    // Get user from session
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return { authenticated: false, error: 'Unauthorized: No session' };
    }
    
    // Check admin role
    if (!checkIsAdmin(user.email)) {
      return { authenticated: false, error: 'Forbidden: Admin access required' };
    }
    
    return { authenticated: true };
  } catch (error) {
    return { authenticated: false, error: 'Authentication error' };
  }
}


/**
 * @fileoverview MCP Tools Proxy API — Bridge between Next.js app and Ω⁷ MCP Server.
 * Exposes all 14 MCP tools + 4 AI-powered tools via REST endpoints.
 * @route /api/mcp/tools/[tool]
 * @version 8.0.0
 */

import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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

async function authenticate(req: NextRequest): Promise<{ authenticated: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { authenticated: false, error: 'Unauthorized: No session' };
  }
  
  // Check admin role if implemented
  const isAdmin = session.user.email.endsWith('@christianopropertymanagement.com') || 
                  (session.user as { role?: string }).role === 'admin';
  
  if (!isAdmin) {
    return { authenticated: false, error: 'Forbidden: Admin access required' };
  }
  
  return { authenticated: true };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MCP EXECUTION — Spawn MCP server and execute tool
// ═══════════════════════════════════════════════════════════════════════════════

interface McpResult {
  success: boolean;
  data?: unknown;
  error?: { code: string; message: string; details?: unknown };
}

async function executeMcpTool(toolName: string, params: Record<string, unknown>): Promise<McpResult> {
  try {
    // Build the MCP request
    const mcpRequest = {
      jsonrpc: '2.0',
      id: Date.now().toString(),
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: params,
      },
    };

    // Execute via stdio transport to MCP server
    const result = execSync(
      `node "${MCP_SERVER_PATH}"`,
      {
        env: { ...process.env, ...MCP_ENV },
        input: JSON.stringify(mcpRequest) + '\n',
        encoding: 'utf-8',
        timeout: 30000,
        maxBuffer: 10 * 1024 * 1024, // 10MB
      }
    );

    // Parse the response
    const lines = result.trim().split('\n');
    const responseLine = lines.find(line => {
      try {
        const parsed = JSON.parse(line);
        return parsed.id === mcpRequest.id;
      } catch {
        return false;
      }
    });

    if (!responseLine) {
      return {
        success: false,
        error: { code: 'PARSE_ERROR', message: 'No valid response from MCP server' },
      };
    }

    const response = JSON.parse(responseLine) as {
      result?: { content: Array<{ text: string }>; isError?: boolean };
      error?: { code: number; message: string };
    };

    if (response.error) {
      return {
        success: false,
        error: { code: 'MCP_ERROR', message: response.error.message },
      };
    }

    if (!response.result) {
      return {
        success: false,
        error: { code: 'NO_RESULT', message: 'Empty result from MCP server' },
      };
    }

    const content = response.result.content[0]?.text;
    if (!content) {
      return {
        success: false,
        error: { code: 'NO_CONTENT', message: 'No content in MCP response' },
      };
    }

    const data = JSON.parse(content) as unknown;

    if (response.result.isError) {
      return {
        success: false,
        error: { code: 'TOOL_ERROR', message: String(data), details: data },
      };
    }

    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: { code: 'EXECUTION_ERROR', message },
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI-POWERED TOOLS — Direct implementation for audit/critique/optimization
// ═══════════════════════════════════════════════════════════════════════════════

import { 
  auditPage, 
  critiqueBlock, 
  optimizePage, 
  generateCustomBlock,
  type AuditOptions,
  type CritiqueOptions,
  type OptimizationOptions,
} from '@/lib/ai-service';

import { getMcpClient } from '@/lib/mcp-client';

async function executeAuditPage(params: { 
  slug: string; 
  focus?: string[]; 
  strictness?: 'strict' | 'normal' | 'lenient';
}): Promise<McpResult> {
  try {
    const mcp = getMcpClient();
    const pageResult = await mcp.getPage(params.slug);
    
    if (!pageResult.success || !pageResult.data) {
      return {
        success: false,
        error: { code: 'PAGE_NOT_FOUND', message: `Page ${params.slug} not found` },
      };
    }

    const audit = await auditPage(pageResult.data.data, {
      focus: params.focus as AuditOptions['focus'],
      strictness: params.strictness,
    });

    return { success: true, data: audit };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Audit failed';
    return { success: false, error: { code: 'AUDIT_ERROR', message } };
  }
}

async function executeCritiqueBlock(params: {
  pageSlug: string;
  blockId: string;
  focus?: string[];
}): Promise<McpResult> {
  try {
    const mcp = getMcpClient();
    const pageResult = await mcp.getPage(params.pageSlug);
    
    if (!pageResult.success || !pageResult.data) {
      return {
        success: false,
        error: { code: 'PAGE_NOT_FOUND', message: `Page ${params.pageSlug} not found` },
      };
    }

    const block = pageResult.data.data.content.find(
      (b) => (b.props as Record<string, unknown>).id === params.blockId
    );

    if (!block) {
      return {
        success: false,
        error: { code: 'BLOCK_NOT_FOUND', message: `Block ${params.blockId} not found` },
      };
    }

    const critique = await critiqueBlock(block, pageResult.data.data, {
      focus: params.focus as CritiqueOptions['focus'],
    });

    return { success: true, data: critique };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Critique failed';
    return { success: false, error: { code: 'CRITIQUE_ERROR', message } };
  }
}

async function executeOptimizePage(params: {
  slug: string;
  focus?: string[];
  autoApply?: boolean;
}): Promise<McpResult> {
  try {
    const mcp = getMcpClient();
    const pageResult = await mcp.getPage(params.slug);
    
    if (!pageResult.success || !pageResult.data) {
      return {
        success: false,
        error: { code: 'PAGE_NOT_FOUND', message: `Page ${params.slug} not found` },
      };
    }

    const optimization = await optimizePage(pageResult.data.data, params.slug, {
      focus: params.focus as OptimizationOptions['focus'],
      autoApply: params.autoApply,
    });

    return { success: true, data: optimization };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Optimization failed';
    return { success: false, error: { code: 'OPTIMIZE_ERROR', message } };
  }
}

async function executeGenerateCustomBlock(params: {
  name: string;
  description: string;
  fields: Array<{ name: string; type: string; label?: string; required?: boolean }>;
  renderHint?: string;
}): Promise<McpResult> {
  try {
    const block = await generateCustomBlock({
      name: params.name,
      description: params.description,
      fields: params.fields.map(f => ({ ...f, type: f.type as 'text' | 'textarea' | 'select' | 'array' | 'number' | 'boolean' })),
      renderHint: params.renderHint,
    });

    return { success: true, data: block };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Block generation failed';
    return { success: false, error: { code: 'GENERATE_ERROR', message } };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTE HANDLER — Main POST handler for all MCP tools
// ═══════════════════════════════════════════════════════════════════════════════

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tool: string }> }
): Promise<NextResponse> {
  const startTime = Date.now();
  const { tool } = await params;

  // Authenticate
  const auth = await authenticate(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: auth.error },
      { status: 401 }
    );
  }

  // Validate tool name
  if (!TOOL_SCHEMAS[tool as ToolName]) {
    return NextResponse.json(
      { error: `Unknown tool: ${tool}`, available: Object.keys(TOOL_SCHEMAS) },
      { status: 400 }
    );
  }

  // Parse and validate request body
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const schema = TOOL_SCHEMAS[tool as ToolName];
  const parseResult = schema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parseResult.error.issues },
      { status: 400 }
    );
  }

  // Execute the appropriate tool
  let result: McpResult;

  switch (tool as ToolName) {
    case 'audit_page':
      result = await executeAuditPage(parseResult.data as { slug: string; focus?: string[]; strictness?: 'strict' | 'normal' | 'lenient' });
      break;
    case 'critique_block':
      result = await executeCritiqueBlock(parseResult.data as { pageSlug: string; blockId: string; focus?: string[] });
      break;
    case 'optimize_page':
      result = await executeOptimizePage(parseResult.data as { slug: string; focus?: string[]; autoApply?: boolean });
      break;
    case 'generate_custom_block':
      result = await executeGenerateCustomBlock(parseResult.data as { name: string; description: string; fields: Array<{ name: string; type: string; label?: string; required?: boolean }>; renderHint?: string });
      break;
    default:
      // Standard MCP tools - proxy to MCP server
      result = await executeMcpTool(tool, parseResult.data);
  }

  const duration = Date.now() - startTime;

  // Return response
  if (!result.success) {
    return NextResponse.json(
      { 
        error: result.error?.message ?? 'Unknown error',
        code: result.error?.code ?? 'UNKNOWN',
        details: result.error?.details,
        meta: { tool, durationMs: duration, timestamp: new Date().toISOString() },
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: result.data,
    meta: {
      tool,
      durationMs: duration,
      timestamp: new Date().toISOString(),
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUPPORTED TOOLS LIST — GET handler for tool discovery
// ═══════════════════════════════════════════════════════════════════════════════

export async function GET(): Promise<NextResponse> {
  const auth = await authenticate({ headers: new Headers() } as NextRequest);
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: auth.error },
      { status: 401 }
    );
  }

  return NextResponse.json({
    tools: Object.keys(TOOL_SCHEMAS),
    count: Object.keys(TOOL_SCHEMAS).length,
    version: '8.0.0',
    categories: {
      core: ['list_puck_components', 'generate_block', 'generate_page', 'validate_page_data'],
      page_management: ['get_page', 'list_pages', 'delete_page', 'clone_page', 'export_all_pages'],
      block_operations: ['add_block_to_page', 'patch_block', 'reorder_blocks'],
      presets: ['list_presets'],
      ai_powered: ['audit_page', 'critique_block', 'optimize_page', 'generate_custom_block'],
      system: ['health_check'],
    },
  });
}

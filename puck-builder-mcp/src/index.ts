/**
 * @fileoverview Ω⁷ Puck Builder MCP Server v7.0
 *
 * AI-Universal MCP — works with Claude, GPT-4, Gemini, Ollama, Cursor, any MCP client.
 *
 * Features:
 *   - 40 unified blocks (12 puck demo + 28 chrispropmanagment)
 *   - 7 tools with strict Zod I/O
 *   - 5 MCP Resources (schema, docs, quickstart, guesty guide)
 *   - 4 MCP Prompts (page brief, audit, property listing, SEO)
 *   - Structured telemetry logging to stderr
 *   - Full Zod error reporting with field paths
 *
 * @see https://github.com/measuredco/puck
 * @see https://github.com/CerisonAutomation/chrispropmanagment
 */

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  BLOCK_TYPES, BLOCK_SCHEMAS, CATEGORIES, PuckPageDataSchema,
  type PuckBlockType, type PuckPageData,
} from "./puck-schema.js";
import { buildBlock, buildBlocks } from "./block-factory.js";
import { buildPage, PAGE_PRESETS } from "./page-factory.js";
import { RESOURCES } from "./resources.js";
import { PROMPTS } from "./prompts.js";

// ─── State ─────────────────────────────────────────────────────────────────────
const pageStore = new Map<string, PuckPageData>();
const telemetry = { calls: 0, errors: 0, startTime: Date.now() };

function log(tool: string, status: "ok" | "err", detail?: string) {
  telemetry.calls++;
  if (status === "err") telemetry.errors++;
  const uptime = ((Date.now() - telemetry.startTime) / 1000).toFixed(1);
  process.stderr.write(`[puck-mcp] ${uptime}s | ${tool} | ${status}${detail ? ` | ${detail}` : ""}\n`);
}

// ─── Server ────────────────────────────────────────────────────────────────────
const server = new McpServer({ name: "puck-builder", version: "7.0.0" });

// ─── Resources ─────────────────────────────────────────────────────────────────
for (const resource of RESOURCES) {
  server.resource(resource.name, resource.uri, async () => ({
    contents: [{ uri: resource.uri, mimeType: resource.mimeType, text: resource.content() }],
  }));
}

// ─── Prompts ───────────────────────────────────────────────────────────────────
for (const prompt of PROMPTS) {
  server.prompt(
    prompt.name,
    Object.fromEntries(prompt.arguments.map((a) => [a.name, z.string().optional().describe(a.description)])),
    (args) => ({
      messages: [{
        role: "user" as const,
        content: { type: "text" as const, text: prompt.template(args as Record<string, string>) },
      }],
    })
  );
}

// ─── Tool 1: list_puck_components ─────────────────────────────────────────────
server.tool(
  "list_puck_components",
  "List all 40 Puck blocks with field schemas. Optionally filter by category (layout|typography|interactive|hero|guesty|media|other).",
  { category: z.string().optional().describe("Category filter. Omit for all 40 blocks.") },
  async ({ category }) => {
    const types = category ? (CATEGORIES[category] ?? []) : BLOCK_TYPES;
    const result = types.map((type) => {
      const schema = BLOCK_SCHEMAS[type];
      const shape = schema instanceof z.ZodObject ? schema.shape : {};
      const fields = Object.entries(shape).map(([key, val]) => ({
        field: key,
        zodType: (val as z.ZodTypeAny)._def?.typeName ?? "unknown",
        optional: val instanceof z.ZodOptional || val instanceof z.ZodDefault,
      }));
      const cat = Object.entries(CATEGORIES).find(([, m]) => (m as string[]).includes(type))?.[0] ?? "other";
      return { type, category: cat, fieldCount: fields.length, fields };
    });
    log("list_puck_components", "ok", `${result.length} blocks`);
    return { content: [{ type: "text" as const, text: JSON.stringify({
      version: "7.0.0", totalBlocks: result.length,
      categorySummary: Object.fromEntries(Object.entries(CATEGORIES).map(([k, v]) => [k, v.length])),
      components: result,
    }, null, 2) }] };
  }
);

// ─── Tool 2: generate_block ────────────────────────────────────────────────────
server.tool(
  "generate_block",
  "Generate a single validated Puck block with defaults. Pass partial props to override.",
  {
    type: z.enum(BLOCK_TYPES as [PuckBlockType, ...PuckBlockType[]]).describe("Block type e.g. 'HeroSection', 'PricingTable'"),
    props: z.record(z.unknown()).optional().describe("Partial props. Unset fields use schema defaults."),
  },
  async ({ type, props = {} }) => {
    try {
      const block = buildBlock(type, props as Record<string, unknown>);
      log("generate_block", "ok", type);
      return { content: [{ type: "text" as const, text: JSON.stringify(block, null, 2) }] };
    } catch (err) {
      log("generate_block", "err", String(err));
      return { content: [{ type: "text" as const, text: `❌ Validation error for "${type}":\n${err instanceof Error ? err.message : String(err)}` }], isError: true };
    }
  }
);

// ─── Tool 3: generate_page ─────────────────────────────────────────────────────
server.tool(
  "generate_page",
  "Generate a complete Puck page (UserData) from a preset. Stored by slug for subsequent add/get operations.",
  {
    slug: z.string().startsWith("/").describe("Page slug e.g. '/' or '/properties'"),
    preset: z.enum(["landing", "property", "malta", "pricing", "about", "blank"]).default("blank"),
    title: z.string().optional().default("New Page"),
    overrides: z.array(z.object({
      index: z.number().int().min(0),
      props: z.record(z.unknown()),
    })).optional().default([]),
  },
  async ({ slug, preset, title, overrides }) => {
    try {
      const pageData = buildPage(preset, title, overrides);
      pageStore.set(slug, pageData);
      log("generate_page", "ok", `${slug} | preset=${preset} | blocks=${pageData.content.length}`);
      return { content: [{ type: "text" as const, text: JSON.stringify({ slug, preset, title, blockCount: pageData.content.length, data: pageData }, null, 2) }] };
    } catch (err) {
      log("generate_page", "err", String(err));
      return { content: [{ type: "text" as const, text: `❌ Error generating "${slug}":\n${err instanceof Error ? err.message : String(err)}` }], isError: true };
    }
  }
);

// ─── Tool 4: add_block_to_page ─────────────────────────────────────────────────
server.tool(
  "add_block_to_page",
  "Insert or append a block into a stored page. Call generate_page first to create the page.",
  {
    slug: z.string().startsWith("/").describe("Target page slug"),
    type: z.enum(BLOCK_TYPES as [PuckBlockType, ...PuckBlockType[]]),
    props: z.record(z.unknown()).optional(),
    index: z.number().int().min(0).optional().describe("Insert position. Omit to append."),
  },
  async ({ slug, type, props = {}, index }) => {
    const page = pageStore.get(slug);
    if (!page) {
      return { content: [{ type: "text" as const, text: `❌ Page "${slug}" not found. Available: ${[...pageStore.keys()].join(", ") || "(none)"}` }], isError: true };
    }
    try {
      const block = buildBlock(type, props as Record<string, unknown>);
      const content = [...page.content];
      index !== undefined && index <= content.length ? content.splice(index, 0, block) : content.push(block);
      pageStore.set(slug, { ...page, content });
      log("add_block_to_page", "ok", `${slug} | ${type} @ ${index ?? content.length - 1}`);
      return { content: [{ type: "text" as const, text: JSON.stringify({ slug, insertedAt: index ?? content.length - 1, block, totalBlocks: content.length }, null, 2) }] };
    } catch (err) {
      log("add_block_to_page", "err", String(err));
      return { content: [{ type: "text" as const, text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
    }
  }
);

// ─── Tool 5: validate_page_data ────────────────────────────────────────────────
server.tool(
  "validate_page_data",
  "Validate any Puck UserData JSON. Returns field-level Zod errors on failure.",
  { data: z.record(z.unknown()).describe("Puck page data object") },
  async ({ data }) => {
    const result = PuckPageDataSchema.safeParse(data);
    log("validate_page_data", result.success ? "ok" : "err");
    if (result.success) return { content: [{ type: "text" as const, text: JSON.stringify({ valid: true, blockCount: result.data.content.length }) }] };
    return {
      content: [{ type: "text" as const, text: JSON.stringify({ valid: false, errors: result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message, code: i.code })) }, null, 2) }],
      isError: true,
    };
  }
);

// ─── Tool 6: get_page ──────────────────────────────────────────────────────────
server.tool(
  "get_page",
  "Retrieve a stored Puck page by slug. Returns the full UserData JSON.",
  { slug: z.string().startsWith("/") },
  async ({ slug }) => {
    const page = pageStore.get(slug);
    if (!page) {
      return { content: [{ type: "text" as const, text: JSON.stringify({ error: `Page "${slug}" not found.`, availablePages: [...pageStore.keys()] || ["(none)"] }) }], isError: true };
    }
    log("get_page", "ok", slug);
    return { content: [{ type: "text" as const, text: JSON.stringify({ slug, blockCount: page.content.length, data: page }, null, 2) }] };
  }
);

// ─── Tool 7: list_presets ──────────────────────────────────────────────────────
server.tool(
  "list_presets",
  "List all 6 page presets with block sequences and block counts.",
  {},
  async () => {
    const presets = Object.entries(PAGE_PRESETS).map(([name, specs]) => ({
      preset: name, blockCount: specs.length, blocks: specs.map((s) => s.type),
    }));
    log("list_presets", "ok");
    return { content: [{ type: "text" as const, text: JSON.stringify({ availablePresets: presets.length, presets }, null, 2) }] };
  }
);

// ─── Start ─────────────────────────────────────────────────────────────────────
const transport = new StdioServerTransport();
await server.connect(transport);
process.stderr.write([
  "",
  "╔══════════════════════════════════════════════════════╗",
  "║     Ω⁷ Puck Builder MCP v7.0 — ONLINE              ║",
  "║  40 blocks · 7 tools · 5 resources · 4 prompts     ║",
  "║  AI-universal: Claude · GPT · Gemini · Ollama       ║",
  "╚══════════════════════════════════════════════════════╝",
  "",
].join("\n"));

/**
 * @fileoverview Puck Builder MCP Server — Unified Production Edition
 *
 * 40 blocks: 12 puck demo + 28 chrispropmanagment canonical blocks
 * 7 categories: layout, typography, interactive, hero, guesty, media, other
 * 7 tools: list_puck_components, generate_block, generate_page,
 *           add_block_to_page, validate_page_data, get_page, list_presets
 *
 * @see https://github.com/measuredco/puck
 * @see https://github.com/CerisonAutomation/chrispropmanagment
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  BLOCK_TYPES,
  BLOCK_SCHEMAS,
  CATEGORIES,
  PuckPageDataSchema,
  type PuckBlockType,
  type PuckPageData,
} from "./puck-schema.js";
import { buildBlock, buildBlocks } from "./block-factory.js";
import { buildPage, PAGE_PRESETS } from "./page-factory.js";

// ─── In-memory page store (swap for DB adapter in production) ────────────────
const pageStore = new Map<string, PuckPageData>();

const server = new McpServer({
  name: "puck-builder",
  version: "2.0.0",
});

// ─── Tool 1: list_puck_components ────────────────────────────────────────────
server.tool(
  "list_puck_components",
  "List all 40 available Puck blocks (12 puck demo + 28 chrispropmanagment), their categories, and Zod field definitions.",
  {
    category: z.string().optional().describe(
      "Filter by category: layout | typography | interactive | hero | guesty | media | other. Omit for all."
    ),
  },
  async ({ category }) => {
    const filteredTypes = category
      ? (CATEGORIES[category] ?? [])
      : BLOCK_TYPES;

    const result = filteredTypes.map((type) => {
      const schema = BLOCK_SCHEMAS[type];
      const shape = schema instanceof z.ZodObject ? schema.shape : {};
      const fields = Object.entries(shape).map(([key, val]) => ({
        field: key,
        zodType: (val as z.ZodTypeAny)._def?.typeName ?? "unknown",
        optional: val instanceof z.ZodOptional || val instanceof z.ZodDefault,
      }));
      const cat = Object.entries(CATEGORIES).find(([, members]) =>
        (members as string[]).includes(type)
      )?.[0] ?? "other";
      return { type, category: cat, fieldCount: fields.length, fields };
    });

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          totalBlocks: result.length,
          categories: Object.fromEntries(
            Object.entries(CATEGORIES).map(([k, v]) => [k, v.length])
          ),
          components: result,
        }, null, 2),
      }],
    };
  }
);

// ─── Tool 2: generate_block ──────────────────────────────────────────────────
server.tool(
  "generate_block",
  "Generate a single validated Puck block JSON object with defaults. Ready to insert into page data content array.",
  {
    type: z
      .enum(BLOCK_TYPES as [PuckBlockType, ...PuckBlockType[]])
      .describe("Puck block type, e.g. 'HeroSection', 'PricingTable', 'GuestyPropertyGrid'"),
    props: z
      .record(z.unknown())
      .optional()
      .describe("Partial props to override. Missing fields use schema defaults."),
  },
  async ({ type, props = {} }) => {
    try {
      const block = buildBlock(type, props as Record<string, unknown>);
      return {
        content: [{ type: "text", text: JSON.stringify(block, null, 2) }],
      };
    } catch (err) {
      return {
        content: [{
          type: "text",
          text: `❌ Validation error building "${type}" block:\n${err instanceof Error ? err.message : String(err)}`,
        }],
        isError: true,
      };
    }
  }
);

// ─── Tool 3: generate_page ───────────────────────────────────────────────────
server.tool(
  "generate_page",
  "Generate a full Puck page data (UserData) from a preset. Returns valid JSON for <Render config={conf} data={...} />.",
  {
    slug: z.string().startsWith("/").describe("Page slug, e.g. '/' or '/properties'"),
    preset: z
      .enum(["landing", "property", "malta", "pricing", "about", "blank"])
      .default("blank")
      .describe("Page template preset"),
    title: z.string().optional().default("New Page").describe("Root page title"),
    overrides: z
      .array(z.object({
        index: z.number().int().min(0).describe("Block index in content array"),
        props: z.record(z.unknown()).describe("Props to merge into that block"),
      }))
      .optional()
      .default([])
      .describe("Optional per-block prop overrides"),
  },
  async ({ slug, preset, title, overrides }) => {
    try {
      const pageData = buildPage(preset, title, overrides);
      pageStore.set(slug, pageData);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ slug, blockCount: pageData.content.length, data: pageData }, null, 2),
        }],
      };
    } catch (err) {
      return {
        content: [{
          type: "text",
          text: `❌ Error generating page "${slug}":\n${err instanceof Error ? err.message : String(err)}`,
        }],
        isError: true,
      };
    }
  }
);

// ─── Tool 4: add_block_to_page ───────────────────────────────────────────────
server.tool(
  "add_block_to_page",
  "Append or insert a validated Puck block into an existing page in the session store.",
  {
    slug: z.string().startsWith("/").describe("Target page slug"),
    type: z.enum(BLOCK_TYPES as [PuckBlockType, ...PuckBlockType[]]).describe("Block type"),
    props: z.record(z.unknown()).optional().describe("Block props (merged with defaults)"),
    index: z.number().int().min(0).optional().describe("Insert position. Omit to append."),
  },
  async ({ slug, type, props = {}, index }) => {
    const page = pageStore.get(slug);
    if (!page) {
      return {
        content: [{
          type: "text",
          text: `❌ Page "${slug}" not found. Call generate_page first. Available: ${[...pageStore.keys()].join(", ") || "(none)"}`,
        }],
        isError: true,
      };
    }

    try {
      const block = buildBlock(type, props as Record<string, unknown>);
      const content = [...page.content];
      if (index !== undefined && index <= content.length) {
        content.splice(index, 0, block);
      } else {
        content.push(block);
      }
      const updated: PuckPageData = { ...page, content };
      pageStore.set(slug, updated);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            slug,
            insertedAt: index ?? content.length - 1,
            block,
            totalBlocks: content.length,
          }, null, 2),
        }],
      };
    } catch (err) {
      return {
        content: [{
          type: "text",
          text: `❌ Error inserting block:\n${err instanceof Error ? err.message : String(err)}`,
        }],
        isError: true,
      };
    }
  }
);

// ─── Tool 5: validate_page_data ──────────────────────────────────────────────
server.tool(
  "validate_page_data",
  "Validate any Puck UserData JSON against the full unified schema. Returns Zod errors with field paths on failure.",
  {
    data: z.record(z.unknown()).describe("Puck page data object to validate"),
  },
  async ({ data }) => {
    const result = PuckPageDataSchema.safeParse(data);
    if (result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ valid: true, blockCount: result.data.content.length }),
        }],
      };
    }
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          valid: false,
          errors: result.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
            code: i.code,
          })),
        }, null, 2),
      }],
      isError: true,
    };
  }
);

// ─── Tool 6: get_page ────────────────────────────────────────────────────────
server.tool(
  "get_page",
  "Retrieve the current Puck page data for a slug from the session store.",
  {
    slug: z.string().startsWith("/").describe("Page slug, e.g. '/' or '/properties'"),
  },
  async ({ slug }) => {
    const page = pageStore.get(slug);
    if (!page) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: `Page "${slug}" not found.`,
            availablePages: [...pageStore.keys()].length ? [...pageStore.keys()] : ["(none — call generate_page first)"],
          }),
        }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify({ slug, data: page }, null, 2) }],
    };
  }
);

// ─── Tool 7: list_presets ────────────────────────────────────────────────────
server.tool(
  "list_presets",
  "List all available page presets with their block sequences and descriptions.",
  {},
  async () => {
    const presets = Object.entries(PAGE_PRESETS).map(([name, specs]) => ({
      preset: name,
      blockCount: specs.length,
      blocks: specs.map((s) => s.type),
    }));
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ presets }, null, 2),
      }],
    };
  }
);

// ─── Start ────────────────────────────────────────────────────────────────────
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("✅ Puck Builder MCP v2 running on stdio — 40 blocks, 7 categories, 7 tools");

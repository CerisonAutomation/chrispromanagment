/**
 * @fileoverview MCP Resources — static knowledge endpoints readable by any AI client.
 * Exposes schema, category map, page data shape, quickstart guide, Guesty guide.
 */

import { BLOCK_TYPES, CATEGORIES, BLOCK_SCHEMAS } from "./puck-schema.js";
import { z } from "zod";

export interface McpResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  content: () => string;
}

export const RESOURCES: McpResource[] = [
  {
    uri: "puck://schema/blocks",
    name: "All Block Schemas",
    description: "JSON schema for all 40 Puck blocks — field names, Zod types, optional flags",
    mimeType: "application/json",
    content: () => {
      const schemas = BLOCK_TYPES.reduce<Record<string, unknown>>((acc, type) => {
        const schema = BLOCK_SCHEMAS[type];
        if (schema instanceof z.ZodObject) {
          acc[type] = Object.fromEntries(
            Object.entries(schema.shape).map(([key, val]) => [
              key,
              {
                type: (val as z.ZodTypeAny)._def?.typeName ?? "unknown",
                optional: val instanceof z.ZodOptional || val instanceof z.ZodDefault,
              },
            ])
          );
        }
        return acc;
      }, {});
      return JSON.stringify({ version: "7.1.0", totalBlocks: BLOCK_TYPES.length, schemas }, null, 2);
    },
  },
  {
    uri: "puck://schema/categories",
    name: "Block Categories",
    description: "All 7 block categories with member lists",
    mimeType: "application/json",
    content: () => JSON.stringify({ categories: CATEGORIES, totalBlocks: BLOCK_TYPES.length }, null, 2),
  },
  {
    uri: "puck://schema/page-data",
    name: "Puck Page Data Shape",
    description: "The UserData shape expected by <Render config={conf} data={...} />",
    mimeType: "application/json",
    content: () => JSON.stringify({
      description: "Puck UserData — feed directly to <Render config={conf} data={pageData} />",
      shape: {
        content: "Array<{ type: PuckBlockType, props: { id: string, ...blockProps } }>",
        root: "{ props: { title?: string } }",
        zones: "Record<string, Array<{ type: PuckBlockType, props: { id: string, ...blockProps } }>>",
      },
      example: {
        content: [{ type: "HeroSection", props: { id: "HeroSection-1714000000000-ab1cd", heading: "Welcome to Malta" } }],
        root: { props: { title: "Home" } },
        zones: {},
      },
      toolWorkflow: [
        "1. list_presets → pick a preset",
        "2. generate_page slug='/' preset='landing' title='Home'",
        "3. add_block_to_page slug='/' type='NewsletterSection'",
        "4. validate_page_data data={...}",
        "5. get_page slug='/'",
      ],
    }, null, 2),
  },
  {
    uri: "puck://docs/quickstart",
    name: "MCP Quickstart Guide",
    description: "Complete usage guide for all 14 tools",
    mimeType: "text/markdown",
    content: () => `# Puck Builder MCP v7.1 — Quickstart

## Tools Reference
| Tool | Purpose |
|------|---------|
| list_puck_components | 40 blocks + Zod schemas. Filter by category. |
| generate_block | Single validated block |
| generate_page | Full page from preset, stored by slug |
| add_block_to_page | Insert/append block at index |
| validate_page_data | Deep Zod validation with field paths |
| get_page | Retrieve page by slug |
| list_presets | All 6 preset block sequences |
| list_pages | All stored pages with metadata |
| delete_page | Remove page by slug |
| clone_page | Deep-clone to new slug with fresh IDs |
| patch_block | Merge props into specific block (by id or index) |
| reorder_blocks | Move block from→to index |
| export_all_pages | Full store dump as JSON |
| health_check | Uptime, stats, telemetry, audit log |

## Typical Workflow
\`\`\`
generate_page slug="/" preset="landing" title="My Site"
add_block_to_page slug="/" type="NewsletterSection"
patch_block slug="/" index=0 props={heading: "Better Heading"}
validate_page_data data={...}
health_check
\`\`\`

## Persistence
Set \`PUCK_STORE_PATH=/data/pages.json\` env var to persist pages across restarts.
The file is written atomically (write to .tmp, then rename).
`,
  },
  {
    uri: "puck://docs/guesty-integration",
    name: "Guesty Integration Guide",
    description: "How to wire up Guesty blocks",
    mimeType: "text/markdown",
    content: () => `# Guesty Integration

## Guesty Blocks
| Block | Purpose | Key Props |
|-------|---------|----------|
| GuestyBookingWidget | Inline booking form | listingId, showDatePicker, ctaLabel |
| GuestyPropertyDetail | Full property page | listingId, showAmenities, showReviews, showMap, showGallery |
| GuestyPropertyGrid | Multi-listing grid | columns, maxListings, showFilters |
| GuestyPropertySearch | Search UI | placeholder, showFilters, defaultView |
| GuestyBookingDashboard | Guest booking history | showUpcoming, showPast |
| GuestyBookingConfirmation | Post-booking page | heading, showSummary |
| BookingSection | Full booking section | guestyListingId, showAvailabilityCalendar |
| PropertyShowcase | Featured listings | layout, columns, maxItems |

## Example
\`\`\`json
{ "type": "GuestyPropertyDetail", "props": { "id": "GuestyPropertyDetail-1", "listingId": "abc123", "showAmenities": true } }
\`\`\`
`,
  },
];

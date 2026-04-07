/**
 * @fileoverview MCP Resource definitions — static knowledge exposed as resources.
 * AI clients can read these to understand the block system without tool calls.
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
    description: "Complete JSON schema for all 40 Puck blocks with field types and defaults",
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
      return JSON.stringify({ version: "7.0.0", totalBlocks: BLOCK_TYPES.length, schemas }, null, 2);
    },
  },
  {
    uri: "puck://schema/categories",
    name: "Block Categories",
    description: "All 7 block categories with their member blocks",
    mimeType: "application/json",
    content: () => JSON.stringify({ categories: CATEGORIES, totalBlocks: BLOCK_TYPES.length }, null, 2),
  },
  {
    uri: "puck://schema/page-data",
    name: "Puck Page Data Shape",
    description: "The exact UserData shape expected by <Render config={conf} data={...} />",
    mimeType: "application/json",
    content: () => JSON.stringify({
      description: "Puck UserData — feed directly to <Render config={conf} data={pageData} />",
      shape: {
        content: "Array<{ type: PuckBlockType, props: { id: string, ...blockProps } }>",
        root: "{ props: { title?: string } }",
        zones: "Record<string, Array<{ type: PuckBlockType, props: { id: string, ...blockProps } }>>",
      },
      example: {
        content: [{ type: "HeroSection", props: { id: "HeroSection-123", heading: "Welcome" } }],
        root: { props: { title: "Home" } },
        zones: {},
      },
    }, null, 2),
  },
  {
    uri: "puck://docs/quickstart",
    name: "MCP Quickstart Guide",
    description: "How to use the Puck Builder MCP tools to generate pages step by step",
    mimeType: "text/markdown",
    content: () => `# Puck Builder MCP v7 — Quickstart

## Available Tools
| Tool | Purpose |
|------|---------|
| list_puck_components | List all 40 blocks + field schemas. Filter by category. |
| generate_block | Build one block with prop overrides |
| generate_page | Full page from preset (landing/property/malta/pricing/about/blank) |
| add_block_to_page | Insert block at index into stored page |
| validate_page_data | Zod-validate any page JSON |
| get_page | Retrieve stored page by slug |
| list_presets | Show all preset block sequences |

## Typical Workflow
\`\`\`
1. generate_page slug="/" preset="landing" title="My Site"
2. add_block_to_page slug="/" type="NewsletterSection" index=8
3. validate_page_data data={...}
4. get_page slug="/"
\`\`\`

## Categories
- **layout**: Grid, Flex, Space, Layout, Spacer, Divider
- **typography**: Heading, Text, RichText, TextBlock, Content
- **interactive**: Button, CtaBanner, NewsletterSection
- **hero**: Hero, HeroSection
- **guesty**: BookingSection, GuestyBookingWidget, GuestyPropertyGrid, PropertyShowcase, ...
- **media**: ImageGallery, ImageWithText, VideoSection, LogoBar, Logos
- **other**: Card, FaqSection, PricingTable, TestimonialSection, WhyChooseUs, ...
`,
  },
  {
    uri: "puck://docs/guesty-integration",
    name: "Guesty Integration Guide",
    description: "How to wire up Guesty blocks with listingId and API context",
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

## Example: Property Detail Page
\`\`\`json
{ "type": "GuestyPropertyDetail", "props": { "id": "GuestyPropertyDetail-1", "listingId": "abc123", "showAmenities": true, "showReviews": true, "showMap": true, "showGallery": true } }
\`\`\`
`,
  },
];

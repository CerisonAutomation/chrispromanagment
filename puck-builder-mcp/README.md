# Ω⁷ Puck Builder MCP v7.1 — Production Complete

> AI-universal MCP server for Puck page generation.  
> Works with **Claude Desktop · Cursor · Windsurf · GPT-4 · Gemini · Ollama · Continue.dev**

---

## Quick Start

```bash
cd puck-builder-mcp
npm install
npm run build
```

### Connect any MCP client

```json
{
  "mcpServers": {
    "puck-builder": {
      "command": "node",
      "args": ["/absolute/path/to/puck-builder-mcp/dist/index.js"],
      "env": {
        "PUCK_STORE_PATH": "/data/puck-pages.json"
      }
    }
  }
}
```

> **`PUCK_STORE_PATH`** — set this to persist pages across server restarts.  
> Writes atomically (tmp → rename). Omit for in-memory only.

### Dev mode (no build step)

```json
{
  "mcpServers": {
    "puck-builder": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/puck-builder-mcp/src/index.ts"]
    }
  }
}
```

---

## 14 Tools

| # | Tool | Purpose |
|---|------|---------|
| 1 | `list_puck_components` | 40 blocks + Zod schemas. `category` filter optional. |
| 2 | `generate_block` | Single validated block with defaults |
| 3 | `generate_page` | Full UserData from 6 presets, stored by slug |
| 4 | `add_block_to_page` | Insert/append block at index |
| 5 | `validate_page_data` | Deep Zod validation with field-level error paths |
| 6 | `get_page` | Retrieve stored page by slug |
| 7 | `list_presets` | All preset block sequences |
| 8 | `list_pages` | All stored pages with block counts |
| 9 | `delete_page` | Remove page permanently |
| 10 | `clone_page` | Deep-clone to new slug (new IDs generated) |
| 11 | `patch_block` | Merge props into specific block by id or index |
| 12 | `reorder_blocks` | Move block from→to index |
| 13 | `export_all_pages` | Full JSON store dump |
| 14 | `health_check` | Uptime · stats · error rates · audit log |

---

## 5 Resources

| URI | Type | Content |
|-----|------|---------|
| `puck://schema/blocks` | JSON | Full Zod field map for all 40 blocks |
| `puck://schema/categories` | JSON | Block groupings |
| `puck://schema/page-data` | JSON | UserData shape + example + workflow |
| `puck://docs/quickstart` | Markdown | All 14 tools with examples |
| `puck://docs/guesty-integration` | Markdown | Guesty block wiring guide |

---

## 4 Prompts

| Prompt | Purpose |
|--------|---------|
| `generate_page_from_brief` | Natural language → page |
| `audit_page` | Structure audit + improvements |
| `build_property_listing_page` | Full Guesty property page |
| `seo_optimize_page` | Next.js metadata + JSON-LD |

---

## 40 Blocks in 7 Categories

```
layout      → Grid, Flex, Space, Layout, Spacer, Divider
typography  → Heading, Text, RichText, TextBlock, Content
interactive → Button, CtaBanner, NewsletterSection
hero        → Hero, HeroSection
guesty      → BookingSection, GuestyBookingWidget, GuestyPropertyGrid,
               GuestyPropertySearch, GuestyPropertyDetail, GuestyBookingDashboard,
               GuestyBookingConfirmation, PropertyShowcase
media       → ImageGallery, ImageWithText, VideoSection, LogoBar, Logos
other       → Card, AboutSection, FaqSection, FeatureGrid, PricingTable,
               TestimonialSection, StatsSection, TeamSection, ServicesSection,
               WhyChooseUs, ComparisonSection, MaltaMapSection, MapSection,
               Timeline, FooterSection, SocialProofStrip, ThemeSettings, ...
```

---

## 6 Page Presets

| Preset | Blocks | Use Case |
|--------|--------|----------|
| `landing` | 10 | Homepage: Hero, Features, Stats, Testimonials, CTA |
| `property` | 6 | Listings: Search, Grid, Map |
| `malta` | 10 | Destination: About, Map, Reviews, Newsletter |
| `pricing` | 6 | Pricing: Plans, FAQ |
| `about` | 10 | About: Story, Team, Stats, CTA |
| `blank` | 0 | Empty canvas |

---

## Safety Features

- ✅ Every tool wrapped in `try/catch` with typed `PuckMcpError` codes
- ✅ `SIGINT` + `SIGTERM` graceful shutdown (store flushed before exit)
- ✅ `uncaughtException` + `unhandledRejection` crash guards
- ✅ Atomic file writes (`tmp` → `rename`) — zero corruption risk
- ✅ Debounced auto-save (200ms) after every mutation
- ✅ Audit log (last 500 entries, circular)
- ✅ Zod `safeParse` everywhere — never throws on bad AI input
- ✅ Index bounds checking on all array operations
- ✅ Clone generates fresh IDs — no Puck key collisions

---

## Example Session

```
→ list_presets
← [landing, property, malta, pricing, about, blank]

→ generate_page slug="/" preset="landing" title="Chris Property Management"
← { blockCount: 10, data: {...} }

→ patch_block slug="/" index=0 props={heading: "Discover Malta", align: "center"}
← { patched: true, index: 0 }

→ add_block_to_page slug="/" type="NewsletterSection"
← { insertedAt: 10, totalBlocks: 11 }

→ clone_page sourceSlug="/" targetSlug="/v2"
← { cloned: true, blockCount: 11 }

→ health_check
← { status: "healthy", uptimeHuman: "0h 2m 14s", totalCalls: 5, errorRate: "0%" }

→ export_all_pages
← { totalPages: 2, totalBlocks: 22, pages: { "/": {...}, "/v2": {...} } }
```

---

*Built with [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk) · [Puck](https://github.com/measuredco/puck) · [Zod](https://zod.dev)*

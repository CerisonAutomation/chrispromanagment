# Ω⁷ Puck Builder MCP v7.0

> AI-universal MCP server for generating, building, and validating Puck pages.  
> Works with **Claude Desktop, Cursor, GPT-4, Gemini, Ollama, and any MCP client**.

---

## 🧱 40 Unified Blocks

| Source | Count | Examples |
|--------|-------|----------|
| [puck demo](https://github.com/measuredco/puck) | 12 | Button, Card, Flex, Grid, Heading, Hero, Logos, RichText, Space, Stats, Template, Text |
| [chrispropmanagment](https://github.com/CerisonAutomation/chrispropmanagment) | 28 | HeroSection, BookingSection, GuestyPropertyGrid, PricingTable, TestimonialSection, MaltaMapSection, FooterSection, WhyChooseUs, Timeline, VideoSection… |

---

## 🚀 Quick Start

```bash
cd puck-builder-mcp
npm install
npm run build
```

### Connect to Claude Desktop / Cursor

```json
{
  "mcpServers": {
    "puck-builder": {
      "command": "node",
      "args": ["/absolute/path/to/puck-builder-mcp/dist/index.js"]
    }
  }
}
```

### Dev mode (no build required)

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

## 🛠️ Tools

| Tool | Description |
|------|-------------|
| `list_puck_components` | All 40 blocks + Zod field schemas. Optional `category` filter. |
| `generate_block` | One validated block with full defaults |
| `generate_page` | Full `UserData` from preset |
| `add_block_to_page` | Insert/append block to stored page |
| `validate_page_data` | Deep Zod validation with field-level error paths |
| `get_page` | Retrieve session page by slug |
| `list_presets` | Show all preset block sequences |

---

## 📚 Resources (readable by any MCP client)

| URI | Content |
|-----|---------|
| `puck://schema/blocks` | Full JSON schema for all 40 blocks |
| `puck://schema/categories` | All 7 categories with member blocks |
| `puck://schema/page-data` | Puck UserData shape + example |
| `puck://docs/quickstart` | Step-by-step usage guide |
| `puck://docs/guesty-integration` | Guesty block wiring guide |

---

## 💬 Prompts (callable from any AI client)

| Prompt | Purpose |
|--------|---------|
| `generate_page_from_brief` | Convert plain-language brief → page |
| `audit_page` | Audit page for issues + improvements |
| `build_property_listing_page` | Full Guesty property page |
| `seo_optimize_page` | Generate Next.js metadata + JSON-LD |

---

## 📦 Page Presets

| Preset | Blocks | Use Case |
|--------|--------|----------|
| `landing` | 10 | Homepage with Hero, Features, Stats, Testimonials, CTA |
| `property` | 6 | Property listings with Search, Grid, Map |
| `malta` | 10 | Malta destination page with About, Map, Reviews, Newsletter |
| `pricing` | 6 | Pricing page with Plans, FAQ |
| `about` | 10 | About page with Story, Team, Stats, CTA |
| `blank` | 0 | Empty canvas |

---

## 📡 Categories

```
layout      → Grid, Flex, Space, Layout, Spacer, Divider
typography  → Heading, Text, RichText, TextBlock, Content
interactive → Button, CtaBanner, NewsletterSection
hero        → Hero, HeroSection
guesty      → BookingSection, GuestyBookingWidget, GuestyPropertyGrid, GuestyPropertySearch,
              GuestyPropertyDetail, GuestyBookingDashboard, GuestyBookingConfirmation, PropertyShowcase
media       → ImageGallery, ImageWithText, VideoSection, LogoBar, Logos
other       → Card, AboutSection, FaqSection, FeatureGrid, PricingTable, TestimonialSection,
              StatsSection, TeamSection, ServicesSection, WhyChooseUs, ComparisonSection,
              MaltaMapSection, MapSection, Timeline, FooterSection, SocialProofStrip, ThemeSettings, …
```

---

## ⚡ Example Session

```
→ list_presets
← { presets: ["landing", "property", "malta", "pricing", "about", "blank"] }

→ generate_page slug="/" preset="landing" title="Chris Property Management"
← { blockCount: 10, data: { content: [...], root: {...} } }

→ add_block_to_page slug="/" type="NewsletterSection" index=8
← { insertedAt: 8, totalBlocks: 11 }

→ validate_page_data data={...}
← { valid: true, blockCount: 11 }

→ get_page slug="/"
← Full UserData ready for <Render config={conf} data={data} />
```

---

## 🤖 AI Compatibility

This MCP server is designed to work with any AI that supports the MCP protocol:

- ✅ **Claude Desktop** — Tools + Resources + Prompts
- ✅ **Cursor** — Tools via `mcp.json`
- ✅ **Windsurf** — Tools via MCP config
- ✅ **GPT-4 / o3** — Via any MCP bridge
- ✅ **Gemini** — Via MCP adapter
- ✅ **Ollama** — Via local MCP proxy
- ✅ **Continue.dev** — Tools + Resources

---

*Built with [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk) · [Puck](https://github.com/measuredco/puck) · [Zod](https://zod.dev)*

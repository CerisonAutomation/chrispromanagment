# 🧱 Puck Builder MCP v2

Production MCP server for building, generating, and validating Puck pages.

**40 unified blocks** across 7 categories:
- **12** puck demo blocks (Button, Card, Flex, Grid, Heading, Hero, Logos, RichText, Space, Stats, Template, Text)
- **28** chrispropmanagment canonical blocks (HeroSection, BookingSection, GuestyPropertyGrid, PricingTable, TestimonialSection, etc.)

## 🚀 Quick Start

```bash
cd puck-builder-mcp
npm install
npm run build
```

## 🔌 Connect

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

Dev mode (no build needed):
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

## 🛠 Tools

| Tool | Description |
|------|-------------|
| `list_puck_components` | List all 40 blocks, categories, fields (optional category filter) |
| `generate_block` | Generate one validated block with defaults |
| `generate_page` | Full UserData from preset: `landing \| property \| malta \| pricing \| about \| blank` |
| `add_block_to_page` | Insert block at any index into a stored page |
| `validate_page_data` | Deep Zod validation of any page JSON |
| `get_page` | Retrieve session-stored page by slug |
| `list_presets` | Show all presets with block sequences |

## 📦 Block Categories

| Category | Blocks |
|----------|--------|
| `layout` | Grid, Flex, Space, Layout, Spacer, Divider |
| `typography` | Heading, Text, RichText, TextBlock, Content |
| `interactive` | Button, CtaBanner, NewsletterSection |
| `hero` | Hero, HeroSection |
| `guesty` | BookingSection, GuestyBookingWidget, GuestyPropertyGrid, GuestyPropertySearch, GuestyPropertyDetail, GuestyBookingDashboard, GuestyBookingConfirmation, PropertyShowcase |
| `media` | ImageGallery, ImageWithText, VideoSection, LogoBar, Logos |
| `other` | Card, AboutSection, FaqSection, FeatureGrid, PricingTable, TestimonialSection, StatsSection, TeamSection, ServicesSection, WhyChooseUs, ComparisonSection, MaltaMapSection, MapSection, Timeline, FooterSection, SocialProofStrip, ThemeSettings, ... |

## ⚡ Example

```
generate_page slug="/" preset="landing" title="Chris Property Management"
→ Full Puck UserData with HeroSection, FeatureGrid, StatsSection, TestimonialSection, CtaBanner

add_block_to_page slug="/" type="GuestyPropertyGrid" index=2
→ Inserts property grid after hero

validate_page_data data={...}
→ { valid: true, blockCount: 12 }

get_page slug="/"
→ Full page JSON ready for <Render config={conf} data={data} />
```

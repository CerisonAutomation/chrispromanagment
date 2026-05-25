# Block Registry, AI Metadata, and Per-Page SEO

This doc covers the three foundations added in Phase 1/3/4 of the
visual-editor overhaul.

## 1. Block registry — `src/lib/blockRegistry.js`

Single source of truth for every CMS block. Wraps the legacy
`SCHEMAS` map from `src/lib/blocks.jsx` and enriches each entry with:

| Field           | Purpose                                                    |
|-----------------|------------------------------------------------------------|
| `type`          | Stable string ID (e.g. `hero`, `listingsGrid`)             |
| `label`         | Human-readable name shown in the editor                    |
| `category`      | Registry category: hero, content, media, booking, layout, social, seo, global |
| `editorFields`  | Declarative form fields (`text`, `image`, `array`, …)      |
| `defaults()`    | Factory that returns a schema-valid empty content object   |
| `schema`        | Zod schema for runtime validation                          |
| `validate(c)`   | Returns `{ success, data | error }` (zod safeParse)        |
| `ai`            | AI capability metadata (see below)                         |
| `seo`           | SEO contribution hints (headings, alt text, JSON-LD type)  |
| `migrate(c)`    | Upgrade old content shape to current version               |

### Usage

```js
import { getBlock, listBlocks, registerBlock } from "@/lib/blockRegistry";

const hero = getBlock("hero");
const newContent = hero.defaults();
const ok = hero.validate(newContent).success;

const mediaBlocks = listBlocks({ category: "media" });
const suggestable = listBlocks({ canSuggest: true });
```

### Registering a new block

```js
registerBlock("pricingTable", {
  label: "Pricing Table",
  category: "content",            // legacy category — meta overrides this
  fields: {
    title: { type: "text", label: "Title" },
    tiers: { type: "array", label: "Tiers", itemFields: ["name", "price", "features"] },
  },
  defaults: { title: "Plans", tiers: [] },
});
```

To override AI/SEO metadata for a built-in block, edit the `META`
table at the top of `blockRegistry.js`.

## 2. AI capability metadata

Every block carries an `ai` object:

```ts
ai: {
  useCases: string[]          // ["content-generation","summarization","image-analysis","translation","alt-text","improvement"]
  suggestedModels: string[]   // Lovable AI Gateway model IDs
  promptTemplates: {
    generate?: string         // placeholders: {label}, {targetLanguage}
    improve?: string
    translate?: string
  }
  canSuggest: boolean         // can the suggestion engine recommend this block?
}
```

Defaults live in `DEFAULT_AI`; per-block overrides live in `META`.

### Calling AI on a block

```js
import { runBlockAIAction, suggestNextBlocks } from "@/lib/blockAI";

const improved = await runBlockAIAction({
  blockType: "hero",
  content: currentContent,
  action: "improve",
  context: { siteName: "Christiano Vincenti PM" },
});

const suggestions = await suggestNextBlocks({
  pageSlug: "home",
  currentBlocks: page.blocks,
  context: { goal: "Increase direct bookings" },
});
```

Both functions go through Lovable AI Gateway via the edge functions
`block-ai-action` and `block-ai-suggest`. Structured output is
enforced via tool calling; results that fail schema validation fall
back to the raw response with a warning.

### Rate limits

The edge functions surface `429` (rate limited) and `402` (credits
exhausted). Callers should toast a friendly message.

## 3. Per-page SEO overrides

A new table `cms_page_seo` stores per-route SEO data:

| Column            | Type      | Notes                              |
|-------------------|-----------|------------------------------------|
| `page_slug`       | text      | Unique. `"home"` for `/`           |
| `meta_title`      | text      | Recommended ≤60 chars              |
| `meta_description`| text      | Recommended ≤160 chars             |
| `canonical_url`   | text      | Relative path preferred (`/about`) |
| `og_image`        | text      | URL                                |
| `og_type`         | text      | Default `website`                  |
| `robots`          | text      | Default `index,follow`             |
| `json_ld`         | jsonb     | Structured data (Article, FAQPage…)|

### Precedence

1. Inline props passed to `<SEOHead />`
2. `cms_page_seo` row matched by slug
3. Sitewide defaults in `index.html`

### Usage

```jsx
import SEOHead from "@/components/SEOHead";

export default function PropertiesPage() {
  return (
    <>
      <SEOHead slug="properties" />
      {/* ... */}
    </>
  );
}
```

Anyone can read `cms_page_seo`; only admins and editors can
write/delete (mirrors `cms_content` RLS).

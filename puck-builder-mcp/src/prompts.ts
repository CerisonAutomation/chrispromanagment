/**
 * @fileoverview MCP Prompt templates — reusable AI prompt definitions.
 * These are exposed as MCP prompts so any AI client can call them directly.
 */

export interface McpPrompt {
  name: string;
  description: string;
  arguments: Array<{ name: string; description: string; required: boolean }>;
  template: (args: Record<string, string>) => string;
}

export const PROMPTS: McpPrompt[] = [
  {
    name: "generate_page_from_brief",
    description: "Convert a plain-language page brief into Puck generate_page tool calls",
    arguments: [
      { name: "brief", description: "What the page should contain and achieve", required: true },
      { name: "slug", description: "Page URL slug e.g. /about", required: false },
    ],
    template: ({ brief, slug = "/" }) =>
      `You are a Puck page builder. The user wants a page at "${slug}" with this brief:\n\n"${brief}"\n\nAvailable tools: generate_page, generate_block, add_block_to_page, list_puck_components, validate_page_data, get_page, list_presets.\n\nSteps:\n1. Call list_puck_components to see all 40 available blocks.\n2. Call list_presets to see available page presets.\n3. Choose the best preset (or blank) and call generate_page with slug="${slug}".\n4. Add any extra blocks with add_block_to_page.\n5. Call validate_page_data on the result.\n6. Return the final page JSON.`,
  },
  {
    name: "audit_page",
    description: "Audit an existing Puck page data JSON for issues and improvements",
    arguments: [
      { name: "slug", description: "Page slug to audit", required: true },
    ],
    template: ({ slug }) =>
      `Audit the Puck page at slug "${slug}". Steps:\n1. Call get_page with slug="${slug}".\n2. Call validate_page_data on the content.\n3. Review block sequence, missing sections (Hero, CTA, Footer), redundant blocks, accessibility (alt text, heading hierarchy), and performance (image optimization, video autoplay).\n4. Return a structured report: Issues[], Recommendations[], and an improved page JSON.`,
  },
  {
    name: "build_property_listing_page",
    description: "Build a complete Guesty property listing page with search, grid, map, and booking",
    arguments: [
      { name: "listingId", description: "Guesty listing ID", required: false },
      { name: "title", description: "Property name", required: false },
    ],
    template: ({ listingId = "", title = "Property" }) =>
      `Build a full property listing page for "${title}" (Guesty ID: "${listingId || 'TBD'}").\n\nRequired blocks in order:\n1. HeroSection (full-width property image, overlay, book button)\n2. GuestyPropertyDetail (listingId: "${listingId}", all panels enabled)\n3. GuestyBookingWidget (listingId: "${listingId}")\n4. ImageGallery (lightbox layout)\n5. MaltaMapSection (property location)\n6. TestimonialSection (guest reviews)\n7. GuestyPropertyGrid (similar properties, max 3)\n8. FooterSection\n\nUse add_block_to_page to build the page step-by-step. Validate at the end.`,
  },
  {
    name: "seo_optimize_page",
    description: "Generate SEO metadata and structured data for a Puck page",
    arguments: [
      { name: "slug", description: "Page slug", required: true },
      { name: "businessName", description: "Business/property name", required: false },
    ],
    template: ({ slug, businessName = "Chris Property Management" }) =>
      `Generate full SEO metadata for the Puck page at "${slug}" for business "${businessName}".\n\n1. Call get_page slug="${slug}" to read current content.\n2. Extract all headings, text blocks, and image alts.\n3. Generate:\n   - <title> tag (max 60 chars)\n   - meta description (max 155 chars)\n   - og:title, og:description, og:image\n   - JSON-LD structured data (LocalBusiness or LodgingBusiness)\n   - Canonical URL\n   - Sitemap priority suggestion\n4. Return as a Next.js metadata object (App Router format).`,
  },
];

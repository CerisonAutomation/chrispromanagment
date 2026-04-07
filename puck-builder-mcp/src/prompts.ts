/**
 * @fileoverview MCP Prompts — 4 reusable AI prompt templates.
 * Any MCP client (Claude, Cursor, GPT bridge) can invoke these by name.
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
    description: "Convert plain-language brief into Puck tool call sequence",
    arguments: [
      { name: "brief", description: "What the page should contain", required: true },
      { name: "slug", description: "Page URL slug e.g. /about", required: false },
    ],
    template: ({ brief, slug = "/" }) =>
      `You are a Puck page builder. Build a page at "${slug}" matching this brief:\n\n"${brief}"\n\nTools: list_puck_components, list_presets, generate_page, add_block_to_page, patch_block, validate_page_data, get_page.\n\nSteps:\n1. list_presets → pick best preset.\n2. generate_page slug="${slug}" preset=<chosen>.\n3. add_block_to_page for any missing sections.\n4. patch_block for content overrides.\n5. validate_page_data.\n6. Return final page JSON.`,
  },
  {
    name: "audit_page",
    description: "Audit an existing page for issues and improvements",
    arguments: [{ name: "slug", description: "Page slug to audit", required: true }],
    template: ({ slug }) =>
      `Audit the Puck page at "${slug}".\n1. get_page slug="${slug}".\n2. validate_page_data.\n3. Check: heading hierarchy, missing Hero/CTA/Footer, duplicate blocks, missing alt text, image blocks without URLs, Guesty blocks missing listingId.\n4. Return: Issues[], Recommendations[], improved page JSON.`,
  },
  {
    name: "build_property_listing_page",
    description: "Build a full Guesty property listing page",
    arguments: [
      { name: "listingId", description: "Guesty listing ID", required: false },
      { name: "title", description: "Property name", required: false },
    ],
    template: ({ listingId = "", title = "Property" }) =>
      `Build property listing page for "${title}" (Guesty ID: "${listingId || "TBD"}").\n\nBlock sequence:\n1. HeroSection (full-width image, overlay, Book button)\n2. GuestyPropertyDetail (listingId: "${listingId}", all panels on)\n3. GuestyBookingWidget (listingId: "${listingId}")\n4. ImageGallery (lightbox)\n5. MaltaMapSection\n6. TestimonialSection\n7. GuestyPropertyGrid (maxListings: 3)\n8. FooterSection\n\nUse add_block_to_page for each block. Validate at end.`,
  },
  {
    name: "seo_optimize_page",
    description: "Generate Next.js metadata + JSON-LD for a Puck page",
    arguments: [
      { name: "slug", description: "Page slug", required: true },
      { name: "businessName", description: "Business name", required: false },
    ],
    template: ({ slug, businessName = "Chris Property Management" }) =>
      `Generate full SEO metadata for page "${slug}" — business: "${businessName}".\n1. get_page slug="${slug}".\n2. Extract headings, text, image alts.\n3. Output:\n   - title (max 60 chars)\n   - description (max 155 chars)\n   - og:title, og:description, og:image\n   - JSON-LD (LodgingBusiness or LocalBusiness)\n   - canonical URL\nReturn as Next.js App Router metadata export object.`,
  },
];

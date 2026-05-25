// ============================================================
// Centralized Block Registry
// Single source of truth for block type IDs, schemas, defaults,
// editor fields, renderer pointers, and AI capability metadata.
//
// This layer ADAPTS the existing SCHEMAS in src/lib/blocks.jsx
// (which already carry fields/defaults/icon/category) and enriches
// them with:
//   - zod schema for runtime validation
//   - AI metadata (use cases, models, prompt templates, canSuggest)
//   - SEO metadata (heading contribution, alt-text requirement)
//   - content migration hooks (versioned upgrades)
//
// Editors and the renderer should call into the registry rather
// than hardcoding per-type switch statements.
// ============================================================

import { z } from "zod";
import { SCHEMAS } from "./blocks.jsx";

// ── AI capability defaults applied to every block unless overridden ────────
const DEFAULT_AI = {
  useCases: ["content-generation", "improvement", "translation"],
  suggestedModels: ["google/gemini-3-flash-preview"],
  promptTemplates: {
    generate: "Generate content for a {label} block on a luxury property management website. Respond strictly with JSON matching the block schema.",
    improve: "Improve the copy in this {label} block. Keep brand voice premium, concise, and conversion-focused. Respond with the same JSON shape, only with refined text fields.",
    translate: "Translate all human-readable text fields in this {label} block to {targetLanguage}. Preserve JSON shape and non-text values.",
  },
  canSuggest: true,
};

// ── Per-block AI / SEO overrides keyed by SCHEMAS key ──────────────────────
// `category` here is the *registry* category, separate from the legacy
// SCHEMAS.category. Keys without an entry get DEFAULT_AI.
const META = {
  header:        { category: "global",  ai: { canSuggest: false, useCases: ["improvement"] }, seo: { contributesHeadings: false } },
  footer:        { category: "global",  ai: { canSuggest: false, useCases: ["improvement"] } },
  hero:          { category: "hero",    seo: { contributesHeadings: true, imageAltRequired: true } },
  heroCarousel:  { category: "hero",    seo: { contributesHeadings: true, imageAltRequired: true } },
  searchBar:     { category: "booking", ai: { canSuggest: false } },
  trustBar:      { category: "social" },
  features:      { category: "content", seo: { contributesHeadings: true } },
  textBlock:     { category: "content", seo: { contributesHeadings: true } },
  richText:      { category: "content", seo: { contributesHeadings: true } },
  quote:         { category: "social" },
  testimonials:  { category: "social",  ai: { useCases: ["content-generation", "summarization"] } },
  stats:         { category: "content" },
  gallery:       { category: "media",   ai: { useCases: ["image-analysis", "alt-text"] }, seo: { imageAltRequired: true } },
  imageBlock:    { category: "media",   seo: { imageAltRequired: true } },
  videoBlock:    { category: "media" },
  listingsGrid:  { category: "booking", ai: { canSuggest: false } },
  guestyCalendar:{ category: "booking", ai: { canSuggest: false } },
  guestyQuote:   { category: "booking", ai: { canSuggest: false } },
  pricing:       { category: "content" },
  faq:           { category: "seo",     ai: { useCases: ["content-generation", "summarization"] }, seo: { contributesHeadings: true, contributesJsonLd: "FAQPage" } },
  cta:           { category: "content", seo: { contributesHeadings: true } },
  newsletter:    { category: "content" },
  contactForm:   { category: "content", ai: { canSuggest: false } },
  mapBlock:      { category: "content", ai: { canSuggest: false } },
  spacer:        { category: "layout",  ai: { canSuggest: false, useCases: [] } },
  divider:       { category: "layout",  ai: { canSuggest: false, useCases: [] } },
  grid:          { category: "layout" },
  columns:       { category: "layout" },
  embed:         { category: "content", ai: { canSuggest: false } },
};

// ── Field → Zod schema inference ───────────────────────────────────────────
function fieldToZod(field) {
  if (!field || typeof field !== "object") return z.any();
  switch (field.type) {
    case "text":
    case "textarea":
    case "richtext":
    case "image":
    case "color":
    case "select":
      return z.string().optional();
    case "number":
      return z.number().optional();
    case "boolean":
      return z.boolean().optional();
    case "array":
      return z.array(z.record(z.any())).optional();
    default:
      return z.any().optional();
  }
}

function buildZodSchema(fields = {}) {
  const shape = {};
  for (const [key, field] of Object.entries(fields)) {
    shape[key] = fieldToZod(field);
  }
  return z.object(shape).passthrough();
}

// ── Build registry from SCHEMAS ────────────────────────────────────────────
const REGISTRY = new Map();

function buildEntry(typeId, raw) {
  const meta = META[typeId] || {};
  const ai = { ...DEFAULT_AI, ...(meta.ai || {}), promptTemplates: { ...DEFAULT_AI.promptTemplates, ...((meta.ai && meta.ai.promptTemplates) || {}) } };
  const zodSchema = buildZodSchema(raw.fields);

  return {
    type: typeId,
    label: raw.label || typeId,
    legacyCategory: raw.category || "content",
    category: meta.category || raw.category || "content",
    icon: raw.icon || null,
    description: raw.description || raw.label || typeId,
    version: raw.version || 1,
    fields: raw.fields || {},
    editorFields: raw.fields || {},
    defaults: () => JSON.parse(JSON.stringify(raw.defaults || {})),
    schema: zodSchema,
    validate(content) {
      return zodSchema.safeParse(content);
    },
    ai,
    seo: meta.seo || {},
    migrate: raw.migrate || ((content) => content),
  };
}

export function registerBlock(typeId, raw) {
  if (REGISTRY.has(typeId)) {
    throw new Error(`Block type already registered: ${typeId}`);
  }
  REGISTRY.set(typeId, buildEntry(typeId, raw));
  return REGISTRY.get(typeId);
}

export function getBlock(typeId) {
  return REGISTRY.get(typeId) || null;
}

export function listBlocks(filter = {}) {
  const all = Array.from(REGISTRY.values());
  return all.filter((b) => {
    if (filter.category && b.category !== filter.category) return false;
    if (filter.canSuggest != null && b.ai.canSuggest !== filter.canSuggest) return false;
    if (filter.useCase && !b.ai.useCases.includes(filter.useCase)) return false;
    return true;
  });
}

export function categories() {
  return Array.from(new Set(Array.from(REGISTRY.values()).map((b) => b.category))).sort();
}

export function migrateContent(typeId, content) {
  const def = getBlock(typeId);
  if (!def) return content;
  try {
    return def.migrate(content || {});
  } catch {
    return content;
  }
}

// Auto-register every block declared in legacy SCHEMAS.
for (const [typeId, raw] of Object.entries(SCHEMAS)) {
  try {
    if (!REGISTRY.has(typeId)) {
      REGISTRY.set(typeId, buildEntry(typeId, raw));
    }
  } catch (e) {
    // surface but don't crash boot
    // eslint-disable-next-line no-console
    console.warn(`[blockRegistry] failed to register ${typeId}:`, e);
  }
}

export const __registry = REGISTRY; // exposed for tests
export default { registerBlock, getBlock, listBlocks, categories, migrateContent };

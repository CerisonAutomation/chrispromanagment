// ─── Result<T, E> — explicit error handling, no raw try/catch in UI ──────────
export type Result<T, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export const ok = <T>(data: T): Result<T, never> => ({ ok: true, data });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

// ─── Field schema types ───────────────────────────────────────────────────────
export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "boolean"
  | "number"
  | "url"
  | "image_url"
  | "array_text"
  | "array_object";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  /** For array_object: defines the shape of each item */
  itemFields?: FieldDef[];
  /** Display hint */
  hint?: string;
}

// ─── ComponentDefinition registry ────────────────────────────────────────────
// Each registered section_key declares its schema so the editor can render
// proper field-level controls instead of raw JSON.
export interface ComponentDefinition {
  section_key: string;
  label: string;
  description: string;
  fields: FieldDef[];
  /** Page this block belongs to – used for grouping in the editor */
  page: "landing" | "booking" | "owners" | "listing" | "global";
}

export const COMPONENT_REGISTRY: ComponentDefinition[] = [
  // ── LANDING ───────────────────────────────────────────────────────────────
  {
    section_key: "landing__hero",
    label: "Landing – Hero",
    description: "Main above-the-fold hero section",
    page: "landing",
    fields: [
      { key: "badge",           label: "Badge text",       type: "text",     placeholder: "Now booking summer 2026…" },
      { key: "headline",        label: "Headline",         type: "text",     required: true },
      { key: "headline_accent", label: "Headline (gold)",  type: "text",     required: true },
      { key: "body",            label: "Body paragraph",   type: "textarea", required: true },
      { key: "cta_primary",     label: "Primary CTA",      type: "text",     required: true },
      { key: "cta_secondary",   label: "Secondary CTA",    type: "text" },
    ],
  },
  {
    section_key: "landing__features",
    label: "Landing – Feature Cards",
    description: "Three icon + label + value cards below hero",
    page: "landing",
    fields: [
      {
        key: "items",
        label: "Feature Cards",
        type: "array_object",
        itemFields: [
          { key: "icon",  label: "Icon name (lucide)", type: "text", placeholder: "Building2" },
          { key: "label", label: "Label",              type: "text" },
          { key: "value", label: "Value",              type: "text" },
        ],
      },
    ],
  },
  {
    section_key: "landing__stats",
    label: "Landing – Stats Bar",
    description: "Four stat counters (50+, 98%, etc.)",
    page: "landing",
    fields: [
      {
        key: "items",
        label: "Stats",
        type: "array_object",
        itemFields: [
          { key: "value", label: "Value (e.g. 50+)",   type: "text" },
          { key: "label", label: "Label",               type: "text" },
        ],
      },
    ],
  },
  {
    section_key: "landing__testimonials",
    label: "Landing – Testimonials",
    description: "Guest review cards",
    page: "landing",
    fields: [
      { key: "headline", label: "Section headline", type: "text" },
      {
        key: "items",
        label: "Reviews",
        type: "array_object",
        itemFields: [
          { key: "quote",  label: "Quote text", type: "textarea" },
          { key: "author", label: "Author name", type: "text" },
          { key: "origin", label: "City/Country", type: "text" },
        ],
      },
    ],
  },
  // ── BOOKING ───────────────────────────────────────────────────────────────
  {
    section_key: "booking__header",
    label: "Booking – Page Header",
    description: "Headline and subheadline on /booking",
    page: "booking",
    fields: [
      { key: "headline",     label: "Headline",     type: "text" },
      { key: "subheadline",  label: "Subheadline",  type: "text" },
      { key: "filter_label", label: "Filter label", type: "text" },
    ],
  },
  {
    section_key: "booking__trust_strip",
    label: "Booking – Trust Strip",
    description: "Icon + text strips under the header",
    page: "booking",
    fields: [
      { key: "items", label: "Trust items", type: "array_text" },
    ],
  },
  {
    section_key: "booking__empty_state",
    label: "Booking – Empty / Error State",
    description: "Copy for no-results and error states",
    page: "booking",
    fields: [
      { key: "empty_title", label: "Empty state title",  type: "text" },
      { key: "empty_body",  label: "Empty state body",   type: "textarea" },
      { key: "error_title", label: "Error state title",  type: "text" },
      { key: "error_body",  label: "Error state body",   type: "textarea" },
    ],
  },
  // ── OWNERS ────────────────────────────────────────────────────────────────
  {
    section_key: "owners__hero",
    label: "Owners – Hero",
    description: "Left-column hero on /owners",
    page: "owners",
    fields: [
      { key: "headline",        label: "Headline",       type: "text" },
      { key: "headline_accent", label: "Headline (gold)",type: "text" },
      { key: "body",            label: "Body paragraph", type: "textarea" },
    ],
  },
  {
    section_key: "owners__bullets",
    label: "Owners – Bullet Points",
    description: "Value proposition list",
    page: "owners",
    fields: [
      { key: "items", label: "Bullet items", type: "array_text" },
    ],
  },
  {
    section_key: "owners__form_header",
    label: "Owners – Form Header",
    description: "Title and description of the callback form",
    page: "owners",
    fields: [
      { key: "title",       label: "Form title",       type: "text" },
      { key: "description", label: "Form description", type: "text" },
      { key: "submit_cta",  label: "Submit button",    type: "text" },
    ],
  },
  {
    section_key: "owners__why_us",
    label: "Owners – Why Us",
    description: "Three reason cards at the bottom of /owners",
    page: "owners",
    fields: [
      { key: "headline", label: "Section headline", type: "text" },
      {
        key: "items",
        label: "Reason cards",
        type: "array_object",
        itemFields: [
          { key: "title", label: "Card title", type: "text" },
          { key: "body",  label: "Card body",  type: "textarea" },
        ],
      },
    ],
  },
  // ── LISTING DETAIL ────────────────────────────────────────────────────────
  {
    section_key: "listing__detail_defaults",
    label: "Listing Detail – Labels",
    description: "All copy labels on /listing/:id pages",
    page: "listing",
    fields: [
      { key: "check_in_label",        label: "Check-in label",        type: "text" },
      { key: "check_out_label",       label: "Check-out label",       type: "text" },
      { key: "guests_label",          label: "Guests label",          type: "text" },
      { key: "book_cta",              label: "Book CTA",              type: "text" },
      { key: "enquire_cta",           label: "Enquire CTA",           type: "text" },
      { key: "per_night_label",       label: "Per-night suffix",      type: "text" },
      { key: "availability_title",    label: "Availability section",  type: "text" },
      { key: "amenities_title",       label: "Amenities section",     type: "text" },
      { key: "description_title",     label: "Description section",   type: "text" },
      { key: "calendar_legend_booked",   label: "Calendar: booked",   type: "text" },
      { key: "calendar_legend_available",label: "Calendar: available",type: "text" },
      { key: "min_nights_note",       label: "Min nights note",       type: "text" },
    ],
  },
];

// Lookup by section_key
export function getDefinition(key: string): ComponentDefinition | undefined {
  return COMPONENT_REGISTRY.find((d) => d.section_key === key);
}

// Group by page
export function getDefinitionsByPage(): Record<string, ComponentDefinition[]> {
  const out: Record<string, ComponentDefinition[]> = {};
  for (const def of COMPONENT_REGISTRY) {
    if (!out[def.page]) out[def.page] = [];
    out[def.page]!.push(def);
  }
  return out;
}

// ─── CMS domain types ─────────────────────────────────────────────────────────
export interface CmsRow {
  id: string;
  section_key: string;
  section_label: string;
  content: Record<string, unknown>;
  is_visible: boolean;
  sort_order: number;
  updated_at: string;
}

export interface CmsVersion {
  id: string;
  label: string;
  note: string | null;
  status: string;
  created_at: string;
  created_by: string | null;
  content_count: number;
  snapshot: Record<string, unknown>;
}

export interface SaveResult {
  section_key: string;
  updated_at: string;
}

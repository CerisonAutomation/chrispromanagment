// ============================================================
// ENTERPRISE CVPM BLOCKS — CONSOLIDATED REGISTRY
// All block schemas, components, and configurations in one file
// Production-ready with Zod validation, TypeScript-like schemas
// ============================================================

import { z } from 'zod';

// ─── THEME & DESIGN SYSTEM ────────────────────────────────────
export const THEME = {
  bg: "#0F0F10",
  surface: "#161618",
  dark: "#0A0A0B",
  accent: "#D4AF37",
  accentHover: "#E5C158",
  text: "#F5F5F0",
  muted: "#A1A1AA",
  border: "rgba(255,255,255,0.06)",
  fontHeading: "'Playfair Display', Georgia, serif",
  fontBody: "'Manrope', system-ui, sans-serif",
};

export const FONT_PAIRS = [
  { id: "playfair-manrope", name: "Playfair + Manrope", heading: "'Playfair Display',serif", body: "'Manrope',sans-serif" },
  { id: "cormorant-dm", name: "Cormorant + DM Sans", heading: "'Cormorant Garamond',serif", body: "'DM Sans',sans-serif" },
  { id: "libre-raleway", name: "Baskerville + Raleway", heading: "'Libre Baskerville',serif", body: "'Raleway',sans-serif" },
  { id: "syne-outfit", name: "Syne + Outfit", heading: "'Syne',sans-serif", body: "'Outfit',sans-serif" },
];

export const COLOR_PRESETS = [
  { id: "gold-noir", name: "Gold Noir", accent: "#D4AF37", bg: "#0F0F10", surface: "#161618", text: "#F5F5F0" },
  { id: "sapphire", name: "Sapphire", accent: "#3B82F6", bg: "#0F172A", surface: "#1E293B", text: "#F8FAFC" },
  { id: "emerald", name: "Emerald", accent: "#10B981", bg: "#0A1612", surface: "#122820", text: "#ECFDF5" },
  { id: "rose", name: "Rose Quartz", accent: "#F43F5E", bg: "#18181B", surface: "#27272A", text: "#FAFAFA" },
];

// ─── ZOD VALIDATION SCHEMAS ───────────────────────────────────
const ImageSchema = z.string().url().or(z.string().startsWith('data:image'));
const ColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

export const BlockSchemas = {
  hero: z.object({
    badge: z.string().default("Malta's Premier Property Partner"),
    headline: z.string().default("Maximise your rental income,"),
    headlineAccent: z.string().default("effortlessly."),
    subheadline: z.string().default("Full-service short-let management across Malta & Gozo."),
    backgroundImage: ImageSchema.optional(),
    cta1Text: z.string().default("Get Started"),
    cta1Link: z.string().default("/owners"),
    cta2Text: z.string().default("Browse Properties"),
    cta2Link: z.string().default("/properties"),
    stats: z.array(z.object({
      value: z.string(),
      label: z.string()
    })).default([]),
  }),
  
  features: z.object({
    label: z.string().default("What We Do"),
    title: z.string().default("Full-service property care"),
    subtitle: z.string().optional(),
    items: z.array(z.object({
      icon: z.string(),
      title: z.string(),
      body: z.string()
    })).default([]),
    columns: z.enum(["2", "3", "4"]).default("3"),
  }),
  
  pricing: z.object({
    label: z.string().default("Pricing"),
    title: z.string().default("Simple, transparent plans"),
    plans: z.array(z.object({
      tier: z.string(),
      amount: z.string(),
      unit: z.string(),
      desc: z.string(),
      features: z.array(z.string()),
      popular: z.boolean().default(false),
    })).default([]),
  }),
  
  testimonials: z.object({
    label: z.string().default("Guest Reviews"),
    title: z.string().default("What our guests say"),
    items: z.array(z.object({
      name: z.string(),
      date: z.string(),
      rating: z.number().min(1).max(5),
      text: z.string()
    })).default([]),
    style: z.enum(["grid", "carousel"]).default("grid"),
  }),
};

// ─── BLOCK REGISTRY ───────────────────────────────────────────
export const BLOCK_REGISTRY = {
  hero: {
    id: 'hero',
    name: 'Hero Section',
    category: 'layout',
    icon: '★',
    schema: BlockSchemas.hero,
    defaults: {
      badge: "Malta's Premier Property Partner",
      headline: "Maximise your rental income,",
      headlineAccent: "effortlessly.",
      subheadline: "Full-service short-let management across Malta & Gozo. We handle everything — you earn more.",
      backgroundImage: "https://images.unsplash.com/photo-1771218830084-fdd272e149a1?w=1920&q=80",
      cta1Text: "Get Your Free Assessment",
      cta1Link: "/owners",
      cta2Text: "Browse Properties",
      cta2Link: "/properties",
      stats: [
        { value: "€2.4M+", label: "Revenue Generated" },
        { value: "45+", label: "Properties Managed" },
        { value: "4.97★", label: "Average Rating" },
      ]
    }
  },
  
  features: {
    id: 'features',
    name: 'Features Grid',
    category: 'content',
    icon: '▦',
    schema: BlockSchemas.features,
    defaults: {
      label: "What We Do",
      title: "Full-service property care",
      subtitle: "",
      columns: "3",
      items: [
        { icon: "Sparkles", title: "Listing & Marketing", body: "Professional photography, multi-channel listings, and smart pricing optimisation." },
        { icon: "Calendar", title: "Booking Management", body: "24/7 guest communication, dynamic pricing, and seamless check-in coordination." },
        { icon: "Wrench", title: "Maintenance", body: "Vetted local contractors, cleaning coordination, and linen service after every stay." },
        { icon: "BarChart3", title: "Reporting", body: "Transparent monthly statements with occupancy, revenue, and guest review analysis." },
      ]
    }
  },
  
  pricing: {
    id: 'pricing',
    name: 'Pricing Table',
    category: 'conversion',
    icon: '€',
    schema: BlockSchemas.pricing,
    defaults: {
      label: "Pricing",
      title: "Simple, transparent plans",
      plans: [
        {
          tier: "Essentials",
          amount: "15%",
          unit: "of revenue",
          desc: "Core operations. Your property listed, managed, and maintained.",
          popular: false,
          features: [
            "Professional photography",
            "Multi-platform listing",
            "Dynamic pricing",
            "Guest communication",
            "Monthly reporting"
          ]
        },
        {
          tier: "Complete",
          amount: "20%",
          unit: "of revenue",
          desc: "Full hands-off management. We handle everything.",
          popular: true,
          features: [
            "Everything in Essentials",
            "Cleaning coordination",
            "Maintenance at cost",
            "Linen & amenities",
            "Owner dashboard",
            "Priority 24hr support"
          ]
        }
      ]
    }
  },
  
  testimonials: {
    id: 'testimonials',
    name: 'Testimonials',
    category: 'social',
    icon: '❝',
    schema: BlockSchemas.testimonials,
    defaults: {
      label: "Guest Reviews",
      title: "What our guests say",
      style: "grid",
      items: [
        { name: "Katie", date: "October 2024", rating: 5, text: "Christiano was an amazing host and the apartment was flawless. From the slippers to the birthday wine, everything was spot on." },
        { name: "Eric", date: "October 2024", rating: 5, text: "Christiano is a gracious, proactive host who made sure I had all the information I needed. Communication was excellent." },
        { name: "Sheldon", date: "September 2024", rating: 5, text: "Always on hand to help with any queries and extremely responsive. I'd definitely recommend to anyone." },
      ]
    }
  },
  
  cta: {
    id: 'cta',
    name: 'Call to Action',
    category: 'conversion',
    icon: '→',
    schema: z.object({
      title: z.string(),
      body: z.string(),
      cta1Text: z.string(),
      cta1Link: z.string(),
      cta2Text: z.string().optional(),
      cta2Link: z.string().optional(),
      style: z.enum(['centered', 'banner', 'split']).default('centered'),
    }),
    defaults: {
      title: "Ready to maximise your property?",
      body: "A short call is all it takes. No commitment, just clarity.",
      cta1Text: "Book a Discovery Call",
      cta1Link: "/owners",
      cta2Text: "Browse Properties",
      cta2Link: "/properties",
      style: "centered"
    }
  },
};

// ─── CATEGORIES ───────────────────────────────────────────────
export const CATEGORIES = [
  { id: "layout", name: "Page Sections", icon: "📐" },
  { id: "content", name: "Content", icon: "📝" },
  { id: "conversion", name: "Conversion", icon: "🎯" },
  { id: "social", name: "Social Proof", icon: "⭐" },
];

// ─── UTILITY FUNCTIONS ────────────────────────────────────────
export const uid = () => `b${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
export const deepClone = (x) => JSON.parse(JSON.stringify(x));

// ─── PAGE TEMPLATES ───────────────────────────────────────────
export const PAGE_TEMPLATES = {
  home: {
    name: "Home Page",
    blocks: [
      { type: "hero", id: uid(), data: BLOCK_REGISTRY.hero.defaults },
      { type: "features", id: uid(), data: BLOCK_REGISTRY.features.defaults },
      { type: "testimonials", id: uid(), data: BLOCK_REGISTRY.testimonials.defaults },
      { type: "pricing", id: uid(), data: BLOCK_REGISTRY.pricing.defaults },
      { type: "cta", id: uid(), data: BLOCK_REGISTRY.cta.defaults },
    ]
  },
  owners: {
    name: "For Owners",
    blocks: [
      { type: "hero", id: uid(), data: BLOCK_REGISTRY.hero.defaults },
      { type: "features", id: uid(), data: BLOCK_REGISTRY.features.defaults },
      { type: "pricing", id: uid(), data: BLOCK_REGISTRY.pricing.defaults },
      { type: "cta", id: uid(), data: BLOCK_REGISTRY.cta.defaults },
    ]
  },
};

// ─── VALIDATION HELPERS ───────────────────────────────────────
export const validateBlock = (blockType, data) => {
  const block = BLOCK_REGISTRY[blockType];
  if (!block) return { success: false, error: "Unknown block type" };
  
  try {
    const validated = block.schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getBlockDefaults = (blockType) => {
  const block = BLOCK_REGISTRY[blockType];
  return block ? deepClone(block.defaults) : {};
};

export default {
  BLOCK_REGISTRY,
  CATEGORIES,
  THEME,
  FONT_PAIRS,
  COLOR_PRESETS,
  PAGE_TEMPLATES,
  uid,
  deepClone,
  validateBlock,
  getBlockDefaults,
};

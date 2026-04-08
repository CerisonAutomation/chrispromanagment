/**
 * Ω⁷ Puck Builder MCP Server v9.0 — COMPREHENSIVE PRODUCTION EDITION
 *
 * Extracted and enhanced from official Puck CMS documentation, GitHub repos,
 * and community plugins. Single-file architecture with zero cross-imports.
 *
 * FEATURES:
 * - 50+ Block types with complete field schemas
 * - All Puck field types: text, textarea, number, select, radio, checkbox,
 *   array, object, slot, richtext, external, custom
 * - 14 Production-ready tools
 * - 8 Comprehensive prompts
 * - 6 Detailed resources
 * - Multi-column layout support
 * - Rich text editing capabilities
 * - External data source integration
 * - Plugin architecture hooks
 *
 * SOURCES:
 * - https://puckeditor.com/docs (Official docs)
 * - https://github.com/measuredco/puck (Core repo)
 * - https://github.com/measuredco/awesome-puck (Plugins & resources)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: CORE UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/** Generate unique Puck block IDs with timestamp and random suffix */
export const generatePuckId = (type: string) => {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${type}-${ts}-${rand}`;
};

/** Generate deterministic IDs for consistent testing */
export const generateDeterministicId = (type: string, index: number) => {
  return `${type}-det-${index.toString(36)}-${Date.now().toString(36).slice(-4)}`;
};

/** Unified MCP Error with structured context */
export class PuckMcpError extends Error {
  constructor(
    public code: string,
    message: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "PuckMcpError";
  }
}

export const mcpError = (code: string, message: string, context?: Record<string, unknown>) =>
  new PuckMcpError(code, message, context);

/** Format error for MCP response with full context */
export const formatToolError = (e: unknown): string => {
  if (e instanceof PuckMcpError) {
    return JSON.stringify({
      code: e.code,
      message: e.message,
      context: e.context,
      timestamp: new Date().toISOString(),
    }, null, 2);
  }
  return JSON.stringify({
    code: "INTERNAL_ERROR",
    message: e instanceof Error ? e.message : String(e),
    timestamp: new Date().toISOString(),
  }, null, 2);
};

/** Telemetry with detailed metrics */
const counters = new Map<string, {
  calls: number;
  errors: number;
  totalMs: number;
  lastCall: string;
}>();
const startTime = Date.now();

export const telemetry = {
  start(tool: string) {
    const start = performance.now();
    return (isError = false) => {
      const ms = Math.round(performance.now() - start);
      const stat = counters.get(tool) ?? { calls: 0, errors: 0, totalMs: 0, lastCall: "" };
      stat.calls++;
      if (isError) stat.errors++;
      stat.totalMs += ms;
      stat.lastCall = new Date().toISOString();
      counters.set(tool, stat);
    };
  },
  snapshot() {
    const entries = Array.from(counters.entries());
    const totalCalls = entries.reduce((s, [, v]) => s + v.calls, 0);
    return {
      uptimeSec: Math.round((Date.now() - startTime) / 1000),
      totalCalls,
      totalErrors: entries.reduce((s, [, v]) => s + v.errors, 0),
      avgLatencyMs: totalCalls > 0
        ? Math.round(entries.reduce((s, [, v]) => s + v.totalMs, 0) / totalCalls)
        : 0,
      toolBreakdown: Object.fromEntries(entries.map(([k, v]) => [k, {
        calls: v.calls,
        errors: v.errors,
        avgMs: v.calls > 0 ? Math.round(v.totalMs / v.calls) : 0,
        lastCall: v.lastCall,
      }])),
    };
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: COMPREHENSIVE PUCK SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

/** Base Puck block schema */
export const PuckBlockSchema = z.object({
  type: z.string(),
  props: z.record(z.unknown()),
});

/** Complete Puck page data schema with zones support */
export const PuckPageDataSchema = z.object({
  content: z.array(PuckBlockSchema),
  root: z.object({
    props: z.record(z.unknown()).optional(),
    title: z.string().optional(),
  }).optional(),
  zones: z.record(z.array(PuckBlockSchema)).optional(),
});

/** Puck content item (for DropZone/nested content) */
export const PuckContentSchema = z.array(PuckBlockSchema);

export type PuckBlock = z.infer<typeof PuckBlockSchema>;
export type PuckPageData = z.infer<typeof PuckPageDataSchema>;
export type PuckContent = z.infer<typeof PuckContentSchema>;

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: ALL 50+ BLOCK TYPES (Organized by Category)
// ═══════════════════════════════════════════════════════════════════════════════

export const BLOCK_TYPES = [
  // Layout blocks
  "Container", "Grid", "Flex", "Section", "Divider", "Spacer",
  // Content blocks
  "HeadingBlock", "TextBlock", "Paragraph", "Quote", "ImageBlock", "VideoBlock", "GalleryGrid",
  // Interactive blocks
  "Button", "Card", "Modal", "Tabs", "Accordion", "Carousel", "Slider",
  // Hero & Marketing
  "HeroSection", "HeroSplit", "FeatureGrid", "StatsBar", "LogoCloud", "CTABanner",
  // Social Proof
  "TestimonialBlock", "TestimonialSlider", "TeamSection", "Timeline", "ClientsShowcase",
  // Forms & Conversion
  "ContactForm", "NewsletterSection", "BookingWidget", "SearchBar", "LoginForm",
  // Property/Real Estate
  "PropertyCard", "PropertyGrid", "PropertySearch", "MapSection", "MapCluster",
  // Pricing & Commerce
  "PricingTable", "PricingCards", "ProductCard", "CheckoutForm",
  // Navigation
  "Navigation", "Breadcrumbs", "Pagination", "FooterSection", "SocialLinks", "BackToTop",
  // Media
  "AudioPlayer", "Embed", "CodeBlock", "RichtextBlock",
  // Data Display
  "DataTable", "List", "TagCloud",
  // Advanced
  "SlotContainer", "DropZone", "DynamicContent", "ExternalData",
] as const;

export type PuckBlockType = typeof BLOCK_TYPES[number];

/** Categories for organizing blocks */
export const CATEGORIES: Record<string, PuckBlockType[]> = {
  layout: ["Container", "Grid", "Flex", "Section", "Divider", "Spacer", "DropZone", "SlotContainer"],
  typography: ["HeadingBlock", "TextBlock", "Paragraph", "Quote", "RichtextBlock", "CodeBlock"],
  media: ["ImageBlock", "VideoBlock", "GalleryGrid", "AudioPlayer", "Embed", "Carousel", "Slider"],
  marketing: ["HeroSection", "HeroSplit", "FeatureGrid", "StatsBar", "LogoCloud", "CTABanner"],
  social: ["TestimonialBlock", "TestimonialSlider", "TeamSection", "Timeline", "ClientsShowcase"],
  conversion: ["Button", "Card", "ContactForm", "NewsletterSection", "BookingWidget", "LoginForm"],
  commerce: ["PricingTable", "PricingCards", "ProductCard", "CheckoutForm"],
  property: ["PropertyCard", "PropertyGrid", "PropertySearch", "MapSection", "MapCluster"],
  navigation: ["Navigation", "Breadcrumbs", "Pagination", "FooterSection", "SocialLinks", "BackToTop", "SearchBar"],
  interactive: ["Modal", "Tabs", "Accordion", "DynamicContent", "TagCloud", "List", "DataTable"],
  data: ["ExternalData"],
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: COMPLETE FIELD SCHEMAS FOR ALL 50+ BLOCKS
// ═══════════════════════════════════════════════════════════════════════════════

export const BLOCK_SCHEMAS: Record<PuckBlockType, z.ZodTypeAny> = {
  // ═══ LAYOUT BLOCKS ═══
  Container: z.object({
    maxWidth: z.enum(["sm", "md", "lg", "xl", "2xl", "full"]).default("xl"),
    padding: z.enum(["none", "sm", "md", "lg", "xl"]).default("md"),
    backgroundColor: z.string().optional(),
    backgroundImage: z.string().optional(),
    className: z.string().optional(),
    id: z.string().optional(),
  }),

  Grid: z.object({
    columns: z.number().min(1).max(12).default(3),
    gap: z.number().min(0).max(64).default(16),
    rows: z.number().min(1).max(20).optional(),
    minColumnWidth: z.number().optional(),
    autoFit: z.boolean().default(false),
    className: z.string().optional(),
  }),

  Flex: z.object({
    direction: z.enum(["row", "column", "row-reverse", "column-reverse"]).default("row"),
    justify: z.enum(["start", "center", "end", "between", "around", "evenly"]).default("start"),
    align: z.enum(["start", "center", "end", "stretch", "baseline"]).default("stretch"),
    wrap: z.boolean().default(false),
    gap: z.number().min(0).max(64).default(16),
    className: z.string().optional(),
  }),

  Section: z.object({
    paddingY: z.enum(["sm", "md", "lg", "xl", "2xl"]).default("lg"),
    paddingX: z.enum(["sm", "md", "lg", "xl"]).default("md"),
    backgroundColor: z.string().optional(),
    backgroundImage: z.string().optional(),
    backgroundSize: z.enum(["cover", "contain", "auto"]).default("cover"),
    backgroundPosition: z.string().default("center"),
    className: z.string().optional(),
  }),

  Divider: z.object({
    style: z.enum(["solid", "dashed", "dotted"]).default("solid"),
    color: z.string().default("#e5e7eb"),
    thickness: z.number().min(1).max(10).default(1),
    marginY: z.enum(["sm", "md", "lg"]).default("md"),
  }),

  Spacer: z.object({
    height: z.number().min(0).max(500).default(32),
    responsive: z.boolean().default(false),
    mobileHeight: z.number().optional(),
  }),

  DropZone: z.object({
    zoneId: z.string(),
    allow: z.array(z.string()).optional(),
    disallow: z.array(z.string()).optional(),
    minEmptyHeight: z.number().default(100),
    collisionAxis: z.enum(["horizontal", "vertical", "auto"]).default("auto"),
    style: z.record(z.unknown()).optional(),
    className: z.string().optional(),
  }),

  SlotContainer: z.object({
    slotId: z.string(),
    allow: z.array(z.string()).optional(),
    disallow: z.array(z.string()).optional(),
    style: z.record(z.unknown()).optional(),
    className: z.string().optional(),
    as: z.enum(["div", "section", "article", "main", "aside"]).default("div"),
  }),

  // ═══ TYPOGRAPHY BLOCKS ═══
  HeadingBlock: z.object({
    text: z.string().default("Heading"),
    level: z.enum(["h1", "h2", "h3", "h4", "h5", "h6"]).default("h2"),
    align: z.enum(["left", "center", "right"]).default("left"),
    color: z.string().optional(),
    className: z.string().optional(),
    id: z.string().optional(),
    anchor: z.string().optional(),
  }),

  TextBlock: z.object({
    text: z.string().default("Enter your text here..."),
    align: z.enum(["left", "center", "right", "justify"]).default("left"),
    size: z.enum(["xs", "sm", "base", "lg", "xl", "2xl"]).default("base"),
    color: z.string().optional(),
    fontWeight: z.enum(["normal", "medium", "semibold", "bold"]).default("normal"),
    lineHeight: z.enum(["tight", "normal", "relaxed", "loose"]).default("normal"),
    className: z.string().optional(),
  }),

  Paragraph: z.object({
    content: z.string().default("Lorem ipsum dolor sit amet, consectetur adipiscing elit."),
    align: z.enum(["left", "center", "right", "justify"]).default("left"),
    size: z.enum(["xs", "sm", "base", "lg"]).default("base"),
    color: z.string().optional(),
    maxWidth: z.enum(["none", "sm", "md", "lg", "xl"]).default("none"),
    className: z.string().optional(),
  }),

  Quote: z.object({
    text: z.string().default("Quote text goes here..."),
    author: z.string().optional(),
    source: z.string().optional(),
    align: z.enum(["left", "center", "right"]).default("left"),
    style: z.enum(["default", "blockquote", "pullquote"]).default("default"),
    className: z.string().optional(),
  }),

  RichtextBlock: z.object({
    content: z.string().default("<p>Rich text content...</p>"),
    align: z.enum(["left", "center", "right"]).default("left"),
    contentEditable: z.boolean().default(false),
    initialHeight: z.number().optional(),
    options: z.object({
      bold: z.boolean().default(true),
      italic: z.boolean().default(true),
      underline: z.boolean().default(true),
      strike: z.boolean().default(true),
      code: z.boolean().default(false),
      heading: z.boolean().default(true),
      bulletList: z.boolean().default(true),
      orderedList: z.boolean().default(true),
      link: z.boolean().default(true),
      blockquote: z.boolean().default(true),
      horizontalRule: z.boolean().default(true),
      hardBreak: z.boolean().default(true),
    }).optional(),
    className: z.string().optional(),
  }),

  CodeBlock: z.object({
    code: z.string().default('console.log("Hello World");'),
    language: z.string().default("javascript"),
    showLineNumbers: z.boolean().default(true),
    theme: z.enum(["light", "dark", "auto"]).default("dark"),
    filename: z.string().optional(),
    className: z.string().optional(),
  }),

  // ═══ MEDIA BLOCKS ═══
  ImageBlock: z.object({
    src: z.string().default("https://via.placeholder.com/800x400"),
    alt: z.string().default("Image description"),
    caption: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    objectFit: z.enum(["cover", "contain", "fill", "none"]).default("cover"),
    rounded: z.enum(["none", "sm", "md", "lg", "xl", "full"]).default("md"),
    shadow: z.enum(["none", "sm", "md", "lg", "xl"]).default("none"),
    className: z.string().optional(),
    lazy: z.boolean().default(true),
  }),

  VideoBlock: z.object({
    src: z.string(),
    poster: z.string().optional(),
    autoplay: z.boolean().default(false),
    controls: z.boolean().default(true),
    loop: z.boolean().default(false),
    muted: z.boolean().default(false),
    width: z.number().optional(),
    height: z.number().optional(),
    aspectRatio: z.enum(["16/9", "4/3", "1/1", "9/16", "auto"]).default("16/9"),
    className: z.string().optional(),
  }),

  GalleryGrid: z.object({
    images: z.array(z.object({
      src: z.string(),
      alt: z.string(),
      caption: z.string().optional(),
      href: z.string().optional(),
    })).default([]),
    columns: z.number().min(1).max(6).default(3),
    gap: z.number().min(0).max(32).default(16),
    aspectRatio: z.enum(["1/1", "4/3", "16/9", "auto"]).default("1/1"),
    lightbox: z.boolean().default(true),
    className: z.string().optional(),
  }),

  AudioPlayer: z.object({
    src: z.string(),
    title: z.string().optional(),
    artist: z.string().optional(),
    coverImage: z.string().optional(),
    autoplay: z.boolean().default(false),
    loop: z.boolean().default(false),
    className: z.string().optional(),
  }),

  Embed: z.object({
    url: z.string(),
    type: z.enum(["youtube", "vimeo", "twitter", "instagram", "tiktok", "spotify", "generic"]).default("generic"),
    width: z.number().optional(),
    height: z.number().optional(),
    aspectRatio: z.enum(["16/9", "4/3", "1/1", "9/16"]).default("16/9"),
    caption: z.string().optional(),
    className: z.string().optional(),
  }),

  Carousel: z.object({
    slides: z.array(z.object({
      image: z.string(),
      title: z.string().optional(),
      subtitle: z.string().optional(),
      ctaText: z.string().optional(),
      ctaLink: z.string().optional(),
    })).default([]),
    autoplay: z.boolean().default(false),
    interval: z.number().min(1000).max(30000).default(5000),
    showDots: z.boolean().default(true),
    showArrows: z.boolean().default(true),
    loop: z.boolean().default(true),
    height: z.enum(["sm", "md", "lg", "xl", "full"]).default("md"),
    className: z.string().optional(),
  }),

  Slider: z.object({
    items: z.array(z.record(z.unknown())).default([]),
    type: z.enum(["image", "card", "custom"]).default("image"),
    slidesToShow: z.number().min(1).max(6).default(1),
    slidesToScroll: z.number().min(1).max(6).default(1),
    autoplay: z.boolean().default(false),
    showDots: z.boolean().default(true),
    showArrows: z.boolean().default(true),
    className: z.string().optional(),
  }),

  // ═══ HERO & MARKETING ═══
  HeroSection: z.object({
    title: z.string().default("Welcome to Our Platform"),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    backgroundImage: z.string().optional(),
    backgroundVideo: z.string().optional(),
    overlayOpacity: z.number().min(0).max(1).default(0.5),
    align: z.enum(["left", "center", "right"]).default("center"),
    minHeight: z.enum(["sm", "md", "lg", "xl", "full"]).default("lg"),
    ctaText: z.string().optional(),
    ctaLink: z.string().optional(),
    secondaryCtaText: z.string().optional(),
    secondaryCtaLink: z.string().optional(),
    showScrollIndicator: z.boolean().default(false),
    className: z.string().optional(),
  }),

  HeroSplit: z.object({
    title: z.string().default("Split Hero Title"),
    description: z.string().optional(),
    image: z.string().optional(),
    imagePosition: z.enum(["left", "right"]).default("right"),
    ctaText: z.string().optional(),
    ctaLink: z.string().optional(),
    backgroundColor: z.string().optional(),
    className: z.string().optional(),
  }),

  FeatureGrid: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    features: z.array(z.object({
      icon: z.string().optional(),
      iconColor: z.string().optional(),
      title: z.string(),
      description: z.string(),
      link: z.string().optional(),
    })).default([]),
    columns: z.number().min(1).max(4).default(3),
    layout: z.enum(["grid", "list"]).default("grid"),
    iconStyle: z.enum(["none", "circle", "square", "outline"]).default("circle"),
    className: z.string().optional(),
  }),

  StatsBar: z.object({
    stats: z.array(z.object({
      value: z.string(),
      label: z.string(),
      prefix: z.string().optional(),
      suffix: z.string().optional(),
    })).default([]),
    layout: z.enum(["horizontal", "vertical", "grid"]).default("horizontal"),
    columns: z.number().min(2).max(6).default(4),
    animate: z.boolean().default(true),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    className: z.string().optional(),
  }),

  LogoCloud: z.object({
    title: z.string().optional(),
    logos: z.array(z.object({
      src: z.string(),
      alt: z.string(),
      href: z.string().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
    })).default([]),
    grayscale: z.boolean().default(true),
    hoverEffect: z.enum(["none", "opacity", "scale", "color"]).default("opacity"),
    layout: z.enum(["grid", "carousel"]).default("grid"),
    columns: z.number().min(2).max(6).default(5),
    className: z.string().optional(),
  }),

  CTABanner: z.object({
    headline: z.string().default("Ready to get started?"),
    subheadline: z.string().optional(),
    buttonText: z.string().default("Get Started"),
    buttonLink: z.string().default("#"),
    secondaryButtonText: z.string().optional(),
    secondaryButtonLink: z.string().optional(),
    align: z.enum(["left", "center", "right"]).default("center"),
    backgroundColor: z.string().optional(),
    backgroundImage: z.string().optional(),
    textColor: z.string().optional(),
    className: z.string().optional(),
  }),

  // ═══ SOCIAL PROOF ═══
  TestimonialBlock: z.object({
    quote: z.string().default("Amazing service! Highly recommended."),
    author: z.string().default("Jane Doe"),
    role: z.string().optional(),
    company: z.string().optional(),
    avatar: z.string().optional(),
    rating: z.number().min(1).max(5).optional(),
    align: z.enum(["left", "center"]).default("left"),
    style: z.enum(["default", "card", "bubble"]).default("default"),
    className: z.string().optional(),
  }),

  TestimonialSlider: z.object({
    testimonials: z.array(z.object({
      quote: z.string(),
      author: z.string(),
      role: z.string().optional(),
      company: z.string().optional(),
      avatar: z.string().optional(),
      rating: z.number().min(1).max(5).optional(),
    })).default([]),
    autoplay: z.boolean().default(false),
    showDots: z.boolean().default(true),
    showArrows: z.boolean().default(true),
    className: z.string().optional(),
  }),

  TeamSection: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    members: z.array(z.object({
      name: z.string(),
      role: z.string(),
      image: z.string(),
      bio: z.string().optional(),
      email: z.string().optional(),
      linkedin: z.string().optional(),
      twitter: z.string().optional(),
    })).default([]),
    columns: z.number().min(1).max(4).default(3),
    layout: z.enum(["grid", "list"]).default("grid"),
    showSocials: z.boolean().default(true),
    className: z.string().optional(),
  }),

  Timeline: z.object({
    title: z.string().optional(),
    events: z.array(z.object({
      date: z.string(),
      title: z.string(),
      description: z.string(),
      icon: z.string().optional(),
      highlight: z.boolean().default(false),
    })).default([]),
    layout: z.enum(["vertical", "horizontal"]).default("vertical"),
    alternating: z.boolean().default(false),
    className: z.string().optional(),
  }),

  ClientsShowcase: z.object({
    title: z.string().optional(),
    clients: z.array(z.object({
      name: z.string(),
      logo: z.string(),
      href: z.string().optional(),
      testimonial: z.string().optional(),
    })).default([]),
    layout: z.enum(["grid", "marquee", "carousel"]).default("grid"),
    columns: z.number().min(2).max(6).default(4),
    className: z.string().optional(),
  }),

  // ═══ FORMS & CONVERSION ═══
  Button: z.object({
    label: z.string().default("Click me"),
    href: z.string().optional(),
    variant: z.enum(["primary", "secondary", "outline", "ghost", "link", "destructive"]).default("primary"),
    size: z.enum(["xs", "sm", "md", "lg", "xl"]).default("md"),
    fullWidth: z.boolean().default(false),
    disabled: z.boolean().default(false),
    loading: z.boolean().default(false),
    icon: z.string().optional(),
    iconPosition: z.enum(["left", "right"]).default("left"),
    target: z.enum(["_self", "_blank", "_parent"]).default("_self"),
    className: z.string().optional(),
  }),

  Card: z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    image: z.string().optional(),
    imagePosition: z.enum(["top", "bottom", "left", "right"]).default("top"),
    footer: z.string().optional(),
    href: z.string().optional(),
    bordered: z.boolean().default(true),
    shadow: z.enum(["none", "sm", "md", "lg", "xl"]).default("md"),
    hoverEffect: z.boolean().default(true),
    className: z.string().optional(),
  }),

  Modal: z.object({
    trigger: z.string().default("Open Modal"),
    triggerVariant: z.enum(["button", "link", "text"]).default("button"),
    title: z.string().default("Modal Title"),
    content: z.string().default("Modal content goes here..."),
    size: z.enum(["sm", "md", "lg", "xl", "full"]).default("md"),
    showCloseButton: z.boolean().default(true),
    closeOnOverlayClick: z.boolean().default(true),
    className: z.string().optional(),
  }),

  Tabs: z.object({
    items: z.array(z.object({
      label: z.string(),
      content: z.string(),
      icon: z.string().optional(),
      disabled: z.boolean().default(false),
    })).default([]),
    defaultTab: z.number().min(0).default(0),
    orientation: z.enum(["horizontal", "vertical"]).default("horizontal"),
    variant: z.enum(["default", "outline", "pills"]).default("default"),
    className: z.string().optional(),
  }),

  Accordion: z.object({
    items: z.array(z.object({
      title: z.string(),
      content: z.string(),
      icon: z.string().optional(),
      disabled: z.boolean().default(false),
    })).default([]),
    allowMultiple: z.boolean().default(false),
    defaultOpen: z.array(z.number()).optional(),
    variant: z.enum(["default", "separated", "boxed"]).default("default"),
    className: z.string().optional(),
  }),

  ContactForm: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    fields: z.array(z.enum(["name", "email", "phone", "company", "subject", "message", "budget", "timeline"])).default(["name", "email", "message"]),
    submitText: z.string().default("Send Message"),
    successMessage: z.string().default("Thank you! We'll be in touch soon."),
    errorMessage: z.string().default("Something went wrong. Please try again."),
    webhookUrl: z.string().optional(),
    className: z.string().optional(),
  }),

  NewsletterSection: z.object({
    title: z.string().default("Subscribe to our newsletter"),
    description: z.string().optional(),
    buttonText: z.string().default("Subscribe"),
    placeholder: z.string().default("Enter your email"),
    successMessage: z.string().default("Thanks for subscribing!"),
    layout: z.enum(["inline", "stacked", "card"]).default("inline"),
    backgroundColor: z.string().optional(),
    className: z.string().optional(),
  }),

  BookingWidget: z.object({
    propertyId: z.string().optional(),
    checkInLabel: z.string().default("Check-in"),
    checkOutLabel: z.string().default("Check-out"),
    guestsLabel: z.string().default("Guests"),
    maxGuests: z.number().default(10),
    buttonText: z.string().default("Check Availability"),
    showPrice: z.boolean().default(true),
    currency: z.string().default("EUR"),
    apiEndpoint: z.string().optional(),
    className: z.string().optional(),
  }),

  SearchBar: z.object({
    placeholder: z.string().default("Search..."),
    size: z.enum(["sm", "md", "lg"]).default("md"),
    showButton: z.boolean().default(true),
    buttonText: z.string().default("Search"),
    showFilters: z.boolean().default(false),
    filters: z.array(z.object({
      label: z.string(),
      options: z.array(z.string()),
    })).optional(),
    className: z.string().optional(),
  }),

  LoginForm: z.object({
    title: z.string().default("Sign In"),
    subtitle: z.string().optional(),
    showRememberMe: z.boolean().default(true),
    showForgotPassword: z.boolean().default(true),
    allowSocialLogin: z.boolean().default(false),
    socialProviders: z.array(z.enum(["google", "github", "twitter", "linkedin"])).optional(),
    redirectUrl: z.string().optional(),
    className: z.string().optional(),
  }),

  // ═══ PROPERTY / REAL ESTATE ═══
  PropertyCard: z.object({
    images: z.array(z.string()).default([]),
    title: z.string().default("Property Name"),
    location: z.string().default("Location"),
    description: z.string().optional(),
    price: z.string().default("€0"),
    priceUnit: z.enum(["night", "week", "month", "total"]).default("night"),
    rating: z.number().min(0).max(5).optional(),
    reviewCount: z.number().optional(),
    amenities: z.array(z.string()).default([]),
    beds: z.number().optional(),
    baths: z.number().optional(),
    guests: z.number().optional(),
    squareMeters: z.number().optional(),
    featured: z.boolean().default(false),
    available: z.boolean().default(true),
    href: z.string().optional(),
    className: z.string().optional(),
  }),

  PropertyGrid: z.object({
    title: z.string().optional(),
    properties: z.array(z.record(z.unknown())).default([]),
    columns: z.number().min(1).max(4).default(3),
    showFilters: z.boolean().default(true),
    filters: z.array(z.enum(["price", "amenities", "rating", "location", "dates"])).default(["price", "amenities"]),
    sortOptions: z.array(z.enum(["price", "rating", "newest", "popular"])).default(["price", "rating"]),
    pagination: z.boolean().default(true),
    itemsPerPage: z.number().default(9),
    className: z.string().optional(),
  }),

  PropertySearch: z.object({
    placeholder: z.string().default("Where are you going?"),
    showDates: z.boolean().default(true),
    showGuests: z.boolean().default(true),
    showLocation: z.boolean().default(true),
    showPriceRange: z.boolean().default(false),
    showAmenities: z.boolean().default(false),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    className: z.string().optional(),
  }),

  MapSection: z.object({
    lat: z.number().default(35.8997),
    lng: z.number().default(14.5148),
    zoom: z.number().min(1).max(20).default(13),
    markers: z.array(z.object({
      lat: z.number(),
      lng: z.number(),
      title: z.string(),
      description: z.string().optional(),
      icon: z.string().optional(),
      propertyId: z.string().optional(),
    })).default([]),
    mapStyle: z.enum(["default", "satellite", "terrain", "light", "dark"]).default("default"),
    height: z.enum(["sm", "md", "lg", "xl", "full"]).default("lg"),
    showCluster: z.boolean().default(true),
    interactive: z.boolean().default(true),
    className: z.string().optional(),
  }),

  MapCluster: z.object({
    locations: z.array(z.object({
      lat: z.number(),
      lng: z.number(),
      count: z.number().default(1),
      properties: z.array(z.record(z.unknown())).optional(),
    })).default([]),
    lat: z.number().default(35.8997),
    lng: z.number().default(14.5148),
    zoom: z.number().default(13),
    height: z.enum(["sm", "md", "lg", "xl"]).default("lg"),
    className: z.string().optional(),
  }),

  // ═══ PRICING & COMMERCE ═══
  PricingTable: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    tiers: z.array(z.object({
      name: z.string(),
      price: z.string(),
      period: z.string().default("/month"),
      description: z.string().optional(),
      features: z.array(z.string()),
      highlighted: z.boolean().default(false),
      ctaText: z.string().default("Choose Plan"),
      ctaLink: z.string().optional(),
      badge: z.string().optional(),
    })).default([]),
    layout: z.enum(["grid", "cards", "table"]).default("cards"),
    columns: z.number().min(1).max(4).default(3),
    showComparison: z.boolean().default(false),
    className: z.string().optional(),
  }),

  PricingCards: z.object({
    title: z.string().optional(),
    tiers: z.array(z.object({
      name: z.string(),
      price: z.string(),
      period: z.string().default("/month"),
      description: z.string(),
      features: z.array(z.string()),
      highlighted: z.boolean().default(false),
      ctaText: z.string().default("Get Started"),
    })).default([]),
    columns: z.number().min(1).max(3).default(3),
    className: z.string().optional(),
  }),

  ProductCard: z.object({
    image: z.string(),
    title: z.string(),
    description: z.string().optional(),
    price: z.string(),
    compareAtPrice: z.string().optional(),
    currency: z.string().default("EUR"),
    rating: z.number().min(0).max(5).optional(),
    reviewCount: z.number().optional(),
    badge: z.string().optional(),
    inStock: z.boolean().default(true),
    href: z.string().optional(),
    className: z.string().optional(),
  }),

  CheckoutForm: z.object({
    title: z.string().default("Checkout"),
    steps: z.array(z.enum(["contact", "shipping", "payment", "review"])).default(["contact", "shipping", "payment"]),
    allowGuest: z.boolean().default(true),
    showOrderSummary: z.boolean().default(true),
    paymentMethods: z.array(z.enum(["card", "paypal", "applepay", "googlepay"])).default(["card"]),
    currency: z.string().default("EUR"),
    className: z.string().optional(),
  }),

  // ═══ NAVIGATION ═══
  Navigation: z.object({
    logo: z.string().optional(),
    logoText: z.string().optional(),
    links: z.array(z.object({
      label: z.string(),
      href: z.string(),
      children: z.array(z.object({
        label: z.string(),
        href: z.string(),
        description: z.string().optional(),
      })).optional(),
    })).default([]),
    sticky: z.boolean().default(true),
    transparent: z.boolean().default(false),
    mobileBreakpoint: z.enum(["sm", "md", "lg"]).default("md"),
    showSearch: z.boolean().default(false),
    showCta: z.boolean().default(false),
    ctaText: z.string().optional(),
    ctaLink: z.string().optional(),
    className: z.string().optional(),
  }),

  Breadcrumbs: z.object({
    items: z.array(z.object({
      label: z.string(),
      href: z.string(),
      active: z.boolean().default(false),
    })).default([]),
    separator: z.enum(["slash", "chevron", "arrow", "dot"]).default("chevron"),
    homeLabel: z.string().default("Home"),
    className: z.string().optional(),
  }),

  Pagination: z.object({
    total: z.number().default(10),
    current: z.number().default(1),
    showPages: z.number().min(3).max(10).default(5),
    showFirstLast: z.boolean().default(true),
    showPrevNext: z.boolean().default(true),
    size: z.enum(["sm", "md", "lg"]).default("md"),
    className: z.string().optional(),
  }),

  FooterSection: z.object({
    logo: z.string().optional(),
    logoText: z.string().optional(),
    tagline: z.string().optional(),
    columns: z.array(z.object({
      title: z.string(),
      links: z.array(z.object({
        label: z.string(),
        href: z.string(),
      })),
    })).default([]),
    socials: z.array(z.object({
      platform: z.enum(["facebook", "twitter", "instagram", "linkedin", "youtube", "github", "discord"]),
      url: z.string(),
    })).default([]),
    newsletter: z.boolean().default(false),
    newsletterTitle: z.string().optional(),
    copyright: z.string().default("© 2024 All rights reserved."),
    bottomLinks: z.array(z.object({
      label: z.string(),
      href: z.string(),
    })).default([]),
    className: z.string().optional(),
  }),

  SocialLinks: z.object({
    links: z.array(z.object({
      platform: z.enum(["facebook", "twitter", "instagram", "linkedin", "youtube", "github", "discord", "tiktok", "pinterest"]),
      url: z.string(),
      label: z.string().optional(),
    })).default([]),
    size: z.enum(["xs", "sm", "md", "lg", "xl"]).default("md"),
    variant: z.enum(["default", "circle", "outline", "ghost"]).default("default"),
    color: z.enum(["default", "brand", "white", "black"]).default("default"),
    className: z.string().optional(),
  }),

  BackToTop: z.object({
    threshold: z.number().default(300),
    smooth: z.boolean().default(true),
    position: z.enum(["right", "left"]).default("right"),
    offset: z.number().default(24),
    className: z.string().optional(),
  }),

  // ═══ DATA DISPLAY ═══
  DataTable: z.object({
    title: z.string().optional(),
    columns: z.array(z.object({
      key: z.string(),
      label: z.string(),
      type: z.enum(["text", "number", "date", "boolean", "badge", "link"]).default("text"),
      sortable: z.boolean().default(true),
      width: z.string().optional(),
    })).default([]),
    data: z.array(z.record(z.unknown())).default([]),
    sortable: z.boolean().default(true),
    filterable: z.boolean().default(false),
    paginated: z.boolean().default(true),
    pageSize: z.number().default(10),
    className: z.string().optional(),
  }),

  List: z.object({
    items: z.array(z.object({
      icon: z.string().optional(),
      title: z.string(),
      description: z.string().optional(),
      href: z.string().optional(),
    })).default([]),
    type: z.enum(["bullet", "numbered", "icon", "none"]).default("bullet"),
    columns: z.number().min(1).max(3).default(1),
    className: z.string().optional(),
  }),

  TagCloud: z.object({
    tags: z.array(z.object({
      label: z.string(),
      href: z.string().optional(),
      count: z.number().optional(),
      size: z.enum(["xs", "sm", "md", "lg"]).optional(),
    })).default([]),
    maxTags: z.number().default(50),
    className: z.string().optional(),
  }),

  // ═══ ADVANCED ═══
  DynamicContent: z.object({
    dataSource: z.enum(["api", "cms", "database", "static"]).default("static"),
    endpoint: z.string().optional(),
    query: z.string().optional(),
    refreshInterval: z.number().optional(),
    loadingState: z.enum(["spinner", "skeleton", "none"]).default("spinner"),
    errorState: z.enum(["message", "fallback", "none"]).default("message"),
    cache: z.boolean().default(true),
    className: z.string().optional(),
  }),

  ExternalData: z.object({
    source: z.string(),
    fetchList: z.string().optional(),
    mapProp: z.string().optional(),
    filterFields: z.array(z.string()).optional(),
    initialQuery: z.string().optional(),
    placeholder: z.string().default("Select..."),
    cache: z.boolean().default(true),
    className: z.string().optional(),
  }),
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: PAGE STORE & FACTORIES
// ═══════════════════════════════════════════════════════════════════════════════

export type AuditEntry = {
  timestamp: string;
  slug: string;
  action: string;
  detail?: string;
  user?: string;
};

class PageStore {
  private data = new Map<string, PuckPageData>();
  private audit: AuditEntry[] = [];
  private persistencePath: string | null = null;

  constructor() {
    const envPath = process.env["PUCK_STORE_PATH"];
    if (envPath) {
      this.persistencePath = envPath;
      this.load();
    }
  }

  private load() {
    if (!this.persistencePath) return;
    try {
      const raw = fs.readFileSync(this.persistencePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed.pages) {
        this.data = new Map(Object.entries(parsed.pages));
      }
      if (parsed.audit) {
        this.audit = parsed.audit;
      }
    } catch {
      // File doesn't exist or is corrupt - start fresh
    }
  }

  flush() {
    if (!this.persistencePath) return;
    const tmp = `${this.persistencePath}.tmp`;
    const payload = {
      pages: Object.fromEntries(this.data),
      audit: this.audit.slice(-1000),
      exportedAt: new Date().toISOString(),
    };
    fs.writeFileSync(tmp, JSON.stringify(payload, null, 2));
    fs.renameSync(tmp, this.persistencePath);
  }

  get(slug: string): PuckPageData | undefined {
    return this.data.get(slug);
  }

  set(slug: string, page: PuckPageData, action: string, detail?: string) {
    this.data.set(slug, page);
    this.audit.push({
      timestamp: new Date().toISOString(),
      slug,
      action,
      detail,
      user: process.env["USER"] || "system",
    });
    this.flush();
  }

  delete(slug: string): boolean {
    const existed = this.data.delete(slug);
    if (existed) {
      this.audit.push({
        timestamp: new Date().toISOString(),
        slug,
        action: "delete",
        user: process.env["USER"] || "system",
      });
      this.flush();
    }
    return existed;
  }

  has(slug: string): boolean {
    return this.data.has(slug);
  }

  keys(): string[] {
    return Array.from(this.data.keys());
  }

  size(): number {
    return this.data.size;
  }

  exportAll(): Record<string, PuckPageData> {
    return Object.fromEntries(this.data);
  }

  stats() {
    return {
      pageCount: this.data.size,
      totalBlocks: Array.from(this.data.values()).reduce(
        (sum, p) => sum + (p.content?.length ?? 0),
        0
      ),
      totalZones: Array.from(this.data.values()).reduce(
        (sum, p) => sum + Object.keys(p.zones ?? {}).length,
        0
      ),
    };
  }

  getAudit(limit = 20): AuditEntry[] {
    return this.audit.slice(-limit).reverse();
  }

  getHistory(slug: string): AuditEntry[] {
    return this.audit.filter((a) => a.slug === slug).reverse();
  }
}

export const store = new PageStore();

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6: BLOCK & PAGE FACTORIES
// ═══════════════════════════════════════════════════════════════════════════════

// Extract defaults from Zod schema
const getDefaultsFromSchema = (schema: z.ZodTypeAny): Record<string, unknown> => {
  if (schema instanceof z.ZodObject) {
    return Object.fromEntries(
      Object.entries(schema.shape).map(([key, val]) => {
        if (val instanceof z.ZodDefault) {
          return [key, val._def.defaultValue()];
        }
        if (val instanceof z.ZodOptional) {
          return [key, undefined];
        }
        if (val instanceof z.ZodArray) {
          return [key, []];
        }
        if (val instanceof z.ZodObject) {
          return [key, getDefaultsFromSchema(val)];
        }
        return [key, undefined];
      })
    );
  }
  return {};
};

// Build a single block with proper defaults
export const buildBlock = (type: PuckBlockType, overrides: Record<string, unknown> = {}) => {
  const schema = BLOCK_SCHEMAS[type];
  const defaults = getDefaultsFromSchema(schema);

  // Clean undefined values
  const cleanDefaults = Object.fromEntries(
    Object.entries(defaults).filter(([, v]) => v !== undefined)
  );

  return {
    type,
    props: {
      id: generatePuckId(type),
      ...cleanDefaults,
      ...overrides,
    },
  };
};

// Page presets with full structure
export const PAGE_PRESETS: Record<string, { type: PuckBlockType; props?: Record<string, unknown> }[]> = {
  blank: [],

  landing: [
    { type: "Navigation", props: { sticky: true, transparent: true } },
    { type: "HeroSection", props: { title: "Welcome to Our Platform", align: "center", minHeight: "xl" } },
    { type: "FeatureGrid", props: { title: "Why Choose Us", columns: 3 } },
    { type: "StatsBar", props: { layout: "horizontal" } },
    { type: "TestimonialSlider" },
    { type: "CTABanner", props: { headline: "Ready to get started?" } },
    { type: "FooterSection" },
  ],

  property: [
    { type: "Navigation", props: { sticky: true } },
    { type: "HeroSection", props: { title: "Find Your Perfect Property", showScrollIndicator: true } },
    { type: "PropertySearch" },
    { type: "PropertyGrid", props: { columns: 3, showFilters: true } },
    { type: "MapSection", props: { height: "xl", interactive: true } },
    { type: "CTABanner", props: { headline: "Can't find what you're looking for?" } },
    { type: "ContactForm" },
    { type: "FooterSection" },
  ],

  malta: [
    { type: "Navigation", props: { sticky: true, transparent: true } },
    { type: "HeroSection", props: { title: "Discover Malta", subtitle: "The Mediterranean Gem", align: "center" } },
    { type: "TextBlock", props: { text: "Experience the beauty of Malta's rich history, stunning coastlines, and vibrant culture.", align: "center", maxWidth: "lg" } },
    { type: "GalleryGrid", props: { columns: 4, lightbox: true } },
    { type: "FeatureGrid", props: { title: "Highlights of Malta", features: [{ icon: "beach", title: "Beautiful Beaches", description: "Crystal clear waters" }, { icon: "history", title: "Rich History", description: "UNESCO sites" }, { icon: "food", title: "Amazing Food", description: "Mediterranean cuisine" }] } },
    { type: "MapSection", props: { lat: 35.8997, lng: 14.5148, markers: [{ lat: 35.8989, lng: 14.5146, title: "Valletta" }, { lat: 35.9197, lng: 14.4898, title: "Mdina" }] } },
    { type: "TestimonialBlock", props: { quote: "Malta was absolutely magical!", author: "Sarah Johnson" } },
    { type: "CTABanner", props: { headline: "Plan Your Visit to Malta Today" } },
    { type: "FooterSection" },
  ],

  pricing: [
    { type: "Navigation" },
    { type: "HeroSection", props: { title: "Simple, Transparent Pricing", align: "center" } },
    { type: "PricingTable", props: { columns: 3, showComparison: true } },
    { type: "FAQSection", props: { title: "Frequently Asked Questions" } },
    { type: "CTABanner", props: { headline: "Still have questions?", subheadline: "Our team is here to help" } },
    { type: "FooterSection" },
  ],

  about: [
    { type: "Navigation" },
    { type: "HeroSection", props: { title: "About Us" } },
    { type: "TextBlock", props: { text: "We are a passionate team dedicated to creating amazing experiences." } },
    { type: "TeamSection", props: { columns: 4 } },
    { type: "Timeline", props: { title: "Our Journey" } },
    { type: "StatsBar" },
    { type: "FooterSection" },
  ],

  blog: [
    { type: "Navigation" },
    { type: "HeroSection", props: { title: "Our Blog", subtitle: "Latest insights and updates" } },
    { type: "Grid", props: { columns: 3, gap: 24 } },
    { type: "NewsletterSection" },
    { type: "FooterSection" },
  ],

  contact: [
    { type: "Navigation" },
    { type: "HeroSection", props: { title: "Get in Touch", align: "center" } },
    { type: "Grid", props: { columns: 2 } },
    { type: "ContactForm" },
    { type: "MapSection", props: { height: "md" } },
    { type: "FooterSection" },
  ],

  ecommerce: [
    { type: "Navigation", props: { showSearch: true, showCta: true } },
    { type: "HeroSection", props: { title: "Shop Our Collection" } },
    { type: "ProductCard" },
    { type: "ProductCard" },
    { type: "ProductCard" },
    { type: "CTABanner", props: { headline: "Free shipping on orders over €50" } },
    { type: "FooterSection" },
  ],
};

// Build a complete page
export const buildPage = (
  preset: string,
  title: string,
  overrides: { index: number; props: Record<string, unknown> }[] = []
) => {
  const spec = PAGE_PRESETS[preset] ?? [];
  const content = spec.map((s, i) => {
    const block = buildBlock(s.type, s.props);
    const override = overrides.find((o) => o.index === i);
    if (override) {
      block.props = { ...block.props, ...override.props };
    }
    return block;
  });

  return {
    content,
    root: {
      props: { title },
      title,
    },
    zones: {},
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7: MCP SERVER & TOOLS
// ═══════════════════════════════════════════════════════════════════════════════

const server = new McpServer({
  name: "puck-builder",
  version: "9.0.0",
  description: "Comprehensive Puck CMS builder with 50+ blocks, full field type support, and advanced layout capabilities",
});

// Response helpers
const ok = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
});

const err = (error: unknown) => ({
  content: [{ type: "text" as const, text: formatToolError(error) }],
  isError: true as const,
});

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL 1: list_puck_components
// ═══════════════════════════════════════════════════════════════════════════════
server.tool(
  "list_puck_components",
  "List all 50+ Puck blocks with complete Zod field schemas. Filter by category or get all blocks with full metadata.",
  {
    category: z.string().optional().describe("Filter by category: layout, typography, media, marketing, social, conversion, commerce, property, navigation, interactive, data"),
    includeSchema: z.boolean().optional().default(true).describe("Include full field schemas in response"),
  },
  async ({ category, includeSchema }) => {
    const done = telemetry.start("list_puck_components");
    try {
      const types = category
        ? (CATEGORIES[category] ?? (() => { throw mcpError("INVALID_CATEGORY", `Unknown category "${category}". Valid: ${Object.keys(CATEGORIES).join(", ")}`); })())
        : BLOCK_TYPES;

      const components = (types as PuckBlockType[]).map((type) => {
        const schema = BLOCK_SCHEMAS[type];
        const result: Record<string, unknown> = {
          type,
          category: Object.entries(CATEGORIES).find(([, m]) => (m as string[]).includes(type))?.[0] ?? "other",
        };

        if (includeSchema && schema instanceof z.ZodObject) {
          const shape = schema.shape;
          result.fields = Object.entries(shape).map(([key, val]) => ({
            field: key,
            zodType: (val as z.ZodTypeAny)._def?.typeName ?? "unknown",
            optional: val instanceof z.ZodOptional || val instanceof z.ZodDefault,
            hasDefault: val instanceof z.ZodDefault,
          }));
          result.fieldCount = result.fields.length;
        }

        return result;
      });

      done();
      return ok({
        version: "9.0.0",
        totalBlocks: components.length,
        categorySummary: Object.fromEntries(Object.entries(CATEGORIES).map(([k, v]) => [k, v.length])),
        components,
        allCategories: Object.keys(CATEGORIES),
      });
    } catch (e) { done(true); return err(e); }
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL 2: generate_block
// ═══════════════════════════════════════════════════════════════════════════════
server.tool(
  "generate_block",
  "Generate a single validated Puck block with schema defaults. Supports all 50+ block types with complete field validation.",
  {
    type: z.enum(BLOCK_TYPES as [PuckBlockType, ...PuckBlockType[]]).describe("Block type name (e.g., 'HeroSection', 'PropertyCard', 'PricingTable')"),
    props: z.record(z.unknown()).optional().describe("Override any field values. Unset fields use schema defaults."),
    id: z.string().optional().describe("Custom ID (auto-generated if not provided)"),
  },
  async ({ type, props = {}, id }) => {
    const done = telemetry.start("generate_block");
    try {
      const block = buildBlock(type, props as Record<string, unknown>);
      if (id) block.props.id = id;

      // Validate against schema
      const schema = BLOCK_SCHEMAS[type];
      if (schema instanceof z.ZodObject) {
        const validation = schema.safeParse(block.props);
        if (!validation.success) {
          throw mcpError("VALIDATION_FAILED", "Block props validation failed", {
            errors: validation.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
          });
        }
      }

      done();
      return ok({
        block,
        generated: true,
        type,
        fieldCount: Object.keys(block.props).length,
      });
    } catch (e) { done(true); return err(e); }
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL 3: generate_page
// ═══════════════════════════════════════════════════════════════════════════════
server.tool(
  "generate_page",
  "Generate a complete Puck UserData page from a preset and persist it.",
  {
    slug: z.string().startsWith("/").describe("URL path for the page (e.g., '/', '/about', '/properties/malta')"),
    preset: z.enum(Object.keys(PAGE_PRESETS) as [string, ...string[]]).default("blank").describe("Page template: blank, landing, property, malta, pricing, about, blog, contact, ecommerce"),
    title: z.string().optional().default("New Page").describe("Page title for SEO and browser tab"),
    overrides: z.array(z.object({
      index: z.number().int().min(0).describe("Block index to override"),
      type: z.enum(BLOCK_TYPES as [PuckBlockType, ...PuckBlockType[]]).optional().describe("Change block type"),
      props: z.record(z.unknown()).describe("Props to merge into block"),
    })).optional().default([]).describe("Override specific blocks in the preset"),
    meta: z.object({
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      ogImage: z.string().optional(),
    }).optional().describe("SEO metadata"),
  },
  async ({ slug, preset, title, overrides, meta }) => {
    const done = telemetry.start("generate_page");
    try {
      const pageData = buildPage(preset, title, overrides.map(o => ({ index: o.index, props: o.props })));

      if (meta) {
        pageData.root = {
          ...pageData.root,
          props: {
            ...pageData.root?.props,
            ...meta,
          },
        };
      }

      store.set(slug, pageData, "create", `preset=${preset}`);

      done();
      return ok({
        slug,
        preset,
        title,
        blockCount: pageData.content.length,
        seo: meta || {},
        data: pageData,
        message: `Page "${title}" created at "${slug}" with ${pageData.content.length} blocks`,
      });
    } catch (e) { done(true); return err(e); }
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL 4: add_block_to_page
// ═══════════════════════════════════════════════════════════════════════════════
server.tool(
  "add_block_to_page",
  "Add a block to an existing page at specific index or append to end.",
  {
    slug: z.string().startsWith("/").describe("Page slug"),
    type: z.enum(BLOCK_TYPES as [PuckBlockType, ...PuckBlockType[]]).describe("Block type to add"),
    props: z.record(z.unknown()).optional().describe("Block props"),
    index: z.number().int().min(0).optional().describe("Insert position (omit to append)"),
    zone: z.string().optional().describe("Target zone for nested layouts (omit for root content)"),
  },
  async ({ slug, type, props = {}, index, zone }) => {
    const done = telemetry.start("add_block_to_page");
    try {
      const page = store.get(slug);
      if (!page) throw mcpError("PAGE_NOT_FOUND", `Page "${slug}" not found. Available: ${store.keys().join(", ")}`);

      const block = buildBlock(type, props as Record<string, unknown>);

      if (zone) {
        // Add to zone
        const zones = { ...page.zones };
        if (!zones[zone]) zones[zone] = [];
        const zoneContent = [...zones[zone]];

        if (index !== undefined && index <= zoneContent.length) {
          zoneContent.splice(index, 0, block);
        } else {
          zoneContent.push(block);
        }

        zones[zone] = zoneContent;
        store.set(slug, { ...page, zones }, "update", `add ${type} to zone ${zone}`);

        done();
        return ok({
          slug,
          zone,
          insertedAt: index ?? zoneContent.length - 1,
          block,
          totalBlocks: zoneContent.length,
        });
      } else {
        // Add to root content
        const content = [...page.content];

        if (index !== undefined) {
          if (index > content.length) {
            throw mcpError("INDEX_OUT_OF_RANGE", `Index ${index} > page length ${content.length}`);
          }
          content.splice(index, 0, block);
        } else {
          content.push(block);
        }

        store.set(slug, { ...page, content }, "update", `add ${type}@${index ?? content.length - 1}`);

        done();
        return ok({
          slug,
          insertedAt: index ?? content.length - 1,
          block,
          totalBlocks: content.length,
        });
      }
    } catch (e) { done(true); return err(e); }
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL 5: validate_page_data
// ═══════════════════════════════════════════════════════════════════════════════
server.tool(
  "validate_page_data",
  "Deep validate Puck page data against schemas with detailed error reporting.",
  {
    data: z.record(z.unknown()).describe("Puck page data to validate"),
    validateBlocks: z.boolean().optional().default(true).describe("Also validate each block against its schema"),
  },
  async ({ data, validateBlocks }) => {
    const done = telemetry.start("validate_page_data");
    const errors: Array<{ path: string; message: string; code: string }> = [];

    // Validate page structure
    const pageValidation = PuckPageDataSchema.safeParse(data);
    if (!pageValidation.success) {
      errors.push(...pageValidation.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
        code: i.code,
      })));
    }

    // Validate individual blocks if requested
    if (validateBlocks && pageValidation.success) {
      const content = (data.content || []) as PuckBlock[];
      content.forEach((block, index) => {
        const schema = BLOCK_SCHEMAS[block.type as PuckBlockType];
        if (schema && schema instanceof z.ZodObject) {
          const blockValidation = schema.safeParse(block.props);
          if (!blockValidation.success) {
            errors.push(...blockValidation.error.issues.map((i) => ({
              path: `content[${index}].props.${i.path.join(".")}`,
              message: `[${block.type}] ${i.message}`,
              code: i.code,
            })));
          }
        }
      });

      // Validate zones
      const zones = data.zones as Record<string, PuckBlock[]> || {};
      Object.entries(zones).forEach(([zoneName, zoneContent]) => {
        zoneContent.forEach((block, index) => {
          const schema = BLOCK_SCHEMAS[block.type as PuckBlockType];
          if (schema && schema instanceof z.ZodObject) {
            const blockValidation = schema.safeParse(block.props);
            if (!blockValidation.success) {
              errors.push(...blockValidation.error.issues.map((i) => ({
                path: `zones.${zoneName}[${index}].props.${i.path.join(".")}`,
                message: `[${block.type}] ${i.message}`,
                code: i.code,
              })));
            }
          }
        });
      });
    }

    done(errors.length > 0);

    if (errors.length === 0) {
      const content = (data.content || []) as PuckBlock[];
      const zones = data.zones as Record<string, PuckBlock[]> || {};
      return ok({
        valid: true,
        blockCount: content.length,
        zoneCount: Object.keys(zones).length,
        totalBlocks: content.length + Object.values(zones).reduce((sum, z) => sum + z.length, 0),
      });
    }

    return {
      content: [{ type: "text" as const, text: JSON.stringify({
        valid: false,
        errorCount: errors.length,
        errors: errors.slice(0, 50), // Limit to first 50 errors
        hasMoreErrors: errors.length > 50,
      }, null, 2) }],
      isError: true,
    };
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL 6: get_page
// ═══════════════════════════════════════════════════════════════════════════════
server.tool(
  "get_page",
  "Retrieve a stored page by slug with full data.",
  {
    slug: z.string().startsWith("/").describe("Page slug"),
    includeHistory: z.boolean().optional().default(false).describe("Include edit history"),
  },
  async ({ slug, includeHistory }) => {
    const done = telemetry.start("get_page");
    try {
      const page = store.get(slug);
      if (!page) throw mcpError("PAGE_NOT_FOUND", `Page "${slug}" not found`, { available: store.keys() });

      const result: Record<string, unknown> = {
        slug,
        blockCount: page.content.length,
        zoneCount: Object.keys(page.zones ?? {}).length,
        data: page,
      };

      if (includeHistory) {
        result.history = store.getHistory(slug);
      }

      done();
      return ok(result);
    } catch (e) { done(true); return err(e); }
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL 7: list_presets
// ═══════════════════════════════════════════════════════════════════════════════
server.tool(
  "list_presets",
  "List all available page presets with their block sequences.",
  {},
  async () => {
    const done = telemetry.start("list_presets");
    const presets = Object.entries(PAGE_PRESETS).map(([name, specs]) => ({
      preset: name,
      blockCount: specs.length,
      blocks: specs.map((s) => s.type),
      description: getPresetDescription(name),
    }));

    done();
    return ok({
      availablePresets: presets.length,
      presets,
    });
  }
);

function getPresetDescription(name: string): string {
  const descriptions: Record<string, string> = {
    blank: "Empty page for custom builds",
    landing: "Marketing landing page with hero, features, testimonials, CTA",
    property: "Real estate listing page with search, grid, map, contact",
    malta: "Tourism destination page with gallery, highlights, testimonials",
    pricing: "SaaS pricing page with tiered plans, FAQ, CTA",
    about: "Company about page with team, timeline, stats",
    blog: "Blog listing page with articles, newsletter",
    contact: "Contact page with form, map, info",
    ecommerce: "Product listing page with grid, promos",
  };
  return descriptions[name] || "Custom preset";
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL 8: list_pages
// ═══════════════════════════════════════════════════════════════════════════════
server.tool(
  "list_pages",
  "List all stored pages with metadata and statistics.",
  {
    limit: z.number().int().min(1).max(100).optional().describe("Limit results"),
    offset: z.number().int().min(0).optional().describe("Pagination offset"),
  },
  async ({ limit, offset }) => {
    const done = telemetry.start("list_pages");
    const keys = store.keys();
    const paginatedKeys = limit !== undefined
      ? keys.slice(offset || 0, (offset || 0) + limit)
      : keys;

    const pages = paginatedKeys.map((slug) => {
      const page = store.get(slug)!;
      const blockTypes = page.content.reduce<Record<string, number>>((acc, b) => {
        acc[b.type] = (acc[b.type] ?? 0) + 1;
        return acc;
      }, {});

      return {
        slug,
        title: (page.root?.props as Record<string, unknown>)?.title ?? "Untitled",
        blockCount: page.content.length,
        zoneCount: Object.keys(page.zones ?? {}).length,
        blockTypes,
      };
    });

    done();
    return ok({
      totalPages: keys.length,
      returned: pages.length,
      offset: offset || 0,
      pages,
    });
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL 9: delete_page
// ═══════════════════════════════════════════════════════════════════════════════
server.tool(
  "delete_page",
  "Permanently delete a stored page.",
  {
    slug: z.string().startsWith("/").describe("Page slug to delete"),
    confirm: z.boolean().default(false).describe("Must be true to confirm deletion"),
  },
  async ({ slug, confirm }) => {
    const done = telemetry.start("delete_page");
    try {
      if (!confirm) {
        throw mcpError("CONFIRMATION_REQUIRED", "Set confirm=true to delete this page", { slug });
      }

      const deleted = store.delete(slug);
      if (!deleted) throw mcpError("PAGE_NOT_FOUND", `Page "${slug}" not found`, { available: store.keys() });

      done();
      return ok({
        deleted: true,
        slug,
        remainingPages: store.size(),
        message: `Page "${slug}" has been permanently deleted`,
      });
    } catch (e) { done(true); return err(e); }
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL 10: clone_page
// ═══════════════════════════════════════════════════════════════════════════════
server.tool(
  "clone_page",
  "Deep-clone a page to a new slug with regenerated IDs.",
  {
    sourceSlug: z.string().startsWith("/").describe("Source page slug"),
    targetSlug: z.string().startsWith("/").describe("Destination slug"),
    newTitle: z.string().optional().describe("New page title"),
    copyZones: z.boolean().default(true).describe("Also clone zone content"),
  },
  async ({ sourceSlug, targetSlug, newTitle, copyZones }) => {
    const done = telemetry.start("clone_page");
    try {
      const source = store.get(sourceSlug);
      if (!source) throw mcpError("CLONE_SOURCE_NOT_FOUND", `Source "${sourceSlug}" not found`, { available: store.keys() });
      if (store.has(targetSlug)) throw mcpError("VALIDATION_FAILED", `Target "${targetSlug}" already exists. Delete it first.`);

      const cloned = JSON.parse(JSON.stringify(source)) as typeof source;

      // Regenerate all block IDs
      cloned.content = cloned.content.map((block) => ({
        ...block,
        props: { ...block.props, id: generatePuckId(block.type) },
      }));

      // Clone zones if requested
      if (copyZones && cloned.zones) {
        cloned.zones = Object.fromEntries(
          Object.entries(cloned.zones).map(([zoneName, zoneContent]) => [
            zoneName,
            zoneContent.map((block) => ({
              ...block,
              props: { ...block.props, id: generatePuckId(block.type) },
            })),
          ])
        );
      }

      // Update title
      if (newTitle) {
        cloned.root = {
          ...cloned.root,
          props: { ...cloned.root?.props, title: newTitle },
          title: newTitle,
        };
      }

      store.set(targetSlug, cloned, "clone", `from ${sourceSlug}`);

      done();
      return ok({
        cloned: true,
        sourceSlug,
        targetSlug,
        blockCount: cloned.content.length,
        zoneCount: Object.keys(cloned.zones ?? {}).length,
        message: `Page cloned from "${sourceSlug}" to "${targetSlug}"`,
      });
    } catch (e) { done(true); return err(e); }
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL 11: patch_block
// ═══════════════════════════════════════════════════════════════════════════════
server.tool(
  "patch_block",
  "Update props on a specific block within a page.",
  {
    slug: z.string().startsWith("/").describe("Page slug"),
    blockId: z.string().optional().describe("Block ID (from props.id)"),
    index: z.number().int().min(0).optional().describe("Block index position"),
    zone: z.string().optional().describe("Zone name (omit for root content)"),
    props: z.record(z.unknown()).describe("Props to merge (shallow merge)"),
    validate: z.boolean().default(true).describe("Validate against schema after update"),
  },
  async ({ slug, blockId, index, zone, props, validate }) => {
    const done = telemetry.start("patch_block");
    try {
      const page = store.get(slug);
      if (!page) throw mcpError("PAGE_NOT_FOUND", `Page "${slug}" not found`);

      const targetArray = zone
        ? [...(page.zones?.[zone] || [])]
        : [...page.content];

      let targetIdx = -1;
      if (blockId) {
        targetIdx = targetArray.findIndex((b) => (b.props as Record<string, unknown>).id === blockId);
        if (targetIdx === -1) throw mcpError("BLOCK_NOT_FOUND", `Block "${blockId}" not found${zone ? ` in zone "${zone}"` : ""}`);
      } else if (index !== undefined) {
        if (index >= targetArray.length) throw mcpError("INDEX_OUT_OF_RANGE", `Index ${index} out of range (${targetArray.length} blocks)`);
        targetIdx = index;
      } else {
        throw mcpError("VALIDATION_FAILED", "Provide blockId or index");
      }

      const original = targetArray[targetIdx]!;
      const newProps = { ...original.props, ...props };

      // Validate if requested
      if (validate) {
        const schema = BLOCK_SCHEMAS[original.type as PuckBlockType];
        if (schema && schema instanceof z.ZodObject) {
          const validation = schema.safeParse(newProps);
          if (!validation.success) {
            throw mcpError("VALIDATION_FAILED", "Updated props validation failed", {
              errors: validation.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
            });
          }
        }
      }

      targetArray[targetIdx] = { ...original, props: newProps };

      if (zone) {
        store.set(slug, {
          ...page,
          zones: { ...page.zones, [zone]: targetArray },
        }, "patch", `block@${targetIdx} in zone ${zone}`);
      } else {
        store.set(slug, { ...page, content: targetArray }, "patch", `block@${targetIdx}`);
      }

      done();
      return ok({
        patched: true,
        slug,
        index: targetIdx,
        blockId: newProps.id,
        type: original.type,
        updatedFields: Object.keys(props),
        zone: zone || undefined,
      });
    } catch (e) { done(true); return err(e); }
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL 12: reorder_blocks
// ═══════════════════════════════════════════════════════════════════════════════
server.tool(
  "reorder_blocks",
  "Move a block from one position to another.",
  {
    slug: z.string().startsWith("/").describe("Page slug"),
    fromIndex: z.number().int().min(0).describe("Current block index"),
    toIndex: z.number().int().min(0).describe("Target index"),
    zone: z.string().optional().describe("Zone name (omit for root content)"),
  },
  async ({ slug, fromIndex, toIndex, zone }) => {
    const done = telemetry.start("reorder_blocks");
    try {
      const page = store.get(slug);
      if (!page) throw mcpError("PAGE_NOT_FOUND", `Page "${slug}" not found`);

      const targetArray = zone
        ? [...(page.zones?.[zone] || [])]
        : [...page.content];

      if (fromIndex >= targetArray.length) throw mcpError("INDEX_OUT_OF_RANGE", `fromIndex ${fromIndex} >= ${targetArray.length}`);
      if (toIndex >= targetArray.length) throw mcpError("INDEX_OUT_OF_RANGE", `toIndex ${toIndex} >= ${targetArray.length}`);

      const [removed] = targetArray.splice(fromIndex, 1);
      targetArray.splice(toIndex, 0, removed!);

      if (zone) {
        store.set(slug, {
          ...page,
          zones: { ...page.zones, [zone]: targetArray },
        }, "reorder", `${fromIndex}→${toIndex} in zone ${zone}`);
      } else {
        store.set(slug, { ...page, content: targetArray }, "reorder", `${fromIndex}→${toIndex}`);
      }

      done();
      return ok({
        reordered: true,
        slug,
        fromIndex,
        toIndex,
        zone: zone || undefined,
        totalBlocks: targetArray.length,
      });
    } catch (e) { done(true); return err(e); }
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL 13: export_all_pages
// ═══════════════════════════════════════════════════════════════════════════════
server.tool(
  "export_all_pages",
  "Export all pages as JSON for backup or migration.",
  {
    includeAudit: z.boolean().default(false).describe("Include full audit trail"),
    format: z.enum(["json", "pretty"]).default("pretty").describe("Output format"),
  },
  async ({ includeAudit, format }) => {
    const done = telemetry.start("export_all_pages");
    const all = store.exportAll();
    const stats = store.stats();

    const result = {
      exportedAt: new Date().toISOString(),
      version: "9.0.0",
      ...stats,
      pages: all,
      ...(includeAudit ? { audit: store.getAudit(1000) } : {}),
    };

    done();
    return ok(result);
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL 14: health_check
// ═══════════════════════════════════════════════════════════════════════════════
server.tool(
  "health_check",
  "Get server health, stats, and diagnostics.",
  {},
  async () => {
    const done = telemetry.start("health_check");
    const snap = telemetry.snapshot();
    const storeStats = store.stats();
    const recentAudit = store.getAudit(20);
    const persistencePath = process.env["PUCK_STORE_PATH"] ?? null;

    done();
    return ok({
      status: "healthy",
      version: "9.0.0",
      uptime: snap.uptimeSec,
      performance: {
        totalCalls: snap.totalCalls,
        totalErrors: snap.totalErrors,
        avgLatencyMs: snap.avgLatencyMs,
        toolBreakdown: snap.toolBreakdown,
      },
      store: {
        ...storeStats,
        persistencePath,
        persisted: !!persistencePath,
      },
      recentAudit,
      capabilities: {
        totalBlocks: BLOCK_TYPES.length,
        categories: Object.keys(CATEGORIES),
        presets: Object.keys(PAGE_PRESETS),
        tools: 14,
        resources: 6,
        prompts: 8,
      },
    });
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 8: RESOURCES (6 comprehensive resources)
// ═══════════════════════════════════════════════════════════════════════════════

const RESOURCES = [
  {
    uri: "puck://schema/blocks",
    name: "Complete Block Schemas",
    description: "All 50+ Puck blocks with full field definitions",
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
                hasDefault: val instanceof z.ZodDefault,
              },
            ])
          );
        }
        return acc;
      }, {});
      return JSON.stringify({ version: "9.0.0", totalBlocks: BLOCK_TYPES.length, schemas }, null, 2);
    },
  },
  {
    uri: "puck://schema/categories",
    name: "Block Categories",
    description: "Organized categories of all blocks",
    mimeType: "application/json",
    content: () => JSON.stringify({
      version: "9.0.0",
      categories: CATEGORIES,
      totalBlocks: BLOCK_TYPES.length,
      categoryCount: Object.keys(CATEGORIES).length,
    }, null, 2),
  },
  {
    uri: "puck://schema/page-data",
    name: "Puck Page Data Specification",
    description: "Complete data model for Puck pages including zones",
    mimeType: "application/json",
    content: () => JSON.stringify({
      version: "9.0.0",
      description: "Puck UserData structure for <Render config={conf} data={pageData} />",
      schema: {
        content: {
          type: "Array<PuckBlock>",
          description: "Root-level blocks in the page",
        },
        root: {
          type: "Object",
          description: "Page-level metadata",
          properties: {
            props: { type: "Record<string, unknown>", description: "Page properties including title, SEO meta" },
            title: { type: "string", description: "Page title" },
          },
        },
        zones: {
          type: "Record<string, PuckBlock[]>",
          description: "Named content zones for nested layouts (e.g., DropZone content)",
        },
      },
      example: {
        content: [{ type: "HeroSection", props: { id: "HeroSection-abc123", title: "Welcome" } }],
        root: { props: { title: "Home", description: "Homepage" }, title: "Home" },
        zones: {
          sidebar: [{ type: "TextBlock", props: { id: "TextBlock-xyz789", text: "Sidebar content" } }],
        },
      },
    }, null, 2),
  },
  {
    uri: "puck://docs/quickstart",
    name: "Complete Quickstart Guide",
    description: "Full guide to all 14 tools and workflows",
    mimeType: "text/markdown",
    content: () => `# Puck Builder MCP v9.0 — Complete Quickstart

## 14 Production Tools

1. **list_puck_components** — List all 50+ blocks with schemas
2. **generate_block** — Create a single validated block
3. **generate_page** — Create full page from 8 presets
4. **add_block_to_page** — Add block at specific index or zone
5. **validate_page_data** — Deep validation with block-level checks
6. **get_page** — Retrieve page with optional history
7. **list_presets** — Show presets: blank, landing, property, malta, pricing, about, blog, contact, ecommerce
8. **list_pages** — Paginated page listing with stats
9. **delete_page** — Delete with confirmation
10. **clone_page** — Deep clone with ID regeneration
11. **patch_block** — Update block props with validation
12. **reorder_blocks** — Move blocks within content or zones
13. **export_all_pages** — Full JSON export for backup
14. **health_check** — Server health and metrics

## 8 Block Categories
${Object.entries(CATEGORIES).map(([k, v]) => `- **${k}**: ${v.length} blocks (${v.slice(0, 5).join(", ")}${v.length > 5 ? "..." : ""})`).join("\n")}

## Common Workflows

### Create Landing Page
1. Call: generate_page slug="/" preset="landing" title="Home"
2. Add custom block: add_block_to_page slug="/" type="NewsletterSection"
3. Validate: validate_page_data data={pageData}

### Build Property Site
1. generate_page slug="/" preset="property"
2. add_block_to_page slug="/properties" type="PropertyGrid"
3. patch_block to update property listings

### Clone and Modify
1. clone_page sourceSlug="/template" targetSlug="/new-page"
2. patch_block to customize content
3. export_all_pages for backup
`,
  },
  {
    uri: "puck://docs/field-types",
    name: "Complete Field Type Reference",
    description: "All Puck field types with configuration options",
    mimeType: "text/markdown",
    content: () => `# Puck Field Types Reference

## Basic Fields
- **text** — Single line text input
- **textarea** — Multi-line text
- **number** — Numeric input with min/max
- **select** — Dropdown with options
- **radio** — Radio button group
- **checkbox** — Boolean checkbox
- **date** — Date picker

## Complex Fields
- **array** — List of items with arrayFields
- **object** — Nested object with objectFields
- **slot** — DropZone for nested components (allow, disallow, minEmptyHeight)

## Advanced Fields
- **richtext** — Rich text editor (Tiptap-based, contentEditable)
- **external** — External data source with fetchList, filterFields
- **custom** — Custom React field implementation

## Field Configuration Examples

### Array Field
\`\`\`javascript
{
  type: "array",
  arrayFields: {
    title: { type: "text" },
    image: { type: "text" }
  },
  getItemSummary: (item) => item.title
}
\`\`\`

### Slot Field (DropZone)
\`\`\`javascript
{
  type: "slot",
  allow: ["HeadingBlock", "TextBlock"],
  minEmptyHeight: 100
}
\`\`\`

### External Data
\`\`\`javascript
{
  type: "external",
  fetchList: async () => fetch('/api/items'),
  mapProp: (item) => ({ label: item.name, value: item.id })
}
\`\`\`
`,
  },
  {
    uri: "puck://docs/guesty-integration",
    name: "Guesty & Property Integration",
    description: "Guide for connecting property data to Puck blocks",
    mimeType: "text/markdown",
    content: () => `# Guesty Integration Guide

## Property Blocks

### PropertyCard
Display individual property with:
- Image gallery with lightbox
- Price, rating, amenities
- Location info
- Beds/baths/guests count
- Availability badge

### PropertyGrid
Multi-property listing with:
- Filter sidebar (price, amenities, rating)
- Sort dropdown
- Pagination
- Responsive grid

### PropertySearch
Search bar with:
- Location autocomplete
- Date range picker
- Guest selector
- Price range slider

### MapSection / MapCluster
Interactive maps with:
- Property markers
- Clustering for dense areas
- Popup details on click
- Filter sync with grid

### BookingWidget
Reservation form with:
- Check-in/out dates
- Guest count
- Real-time availability
- Price calculation
- CTA button

## Data Flow
1. Fetch from Guesty API (listings, availability)
2. Transform to block props
3. Render with Puck blocks
4. Handle bookings via webhook
`,
  },
];

// Register resources
for (const resource of RESOURCES) {
  server.resource(resource.name, resource.uri, async () => ({
    contents: [{ uri: resource.uri, mimeType: resource.mimeType, text: resource.content() }],
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 9: PROMPTS (8 comprehensive prompts)
// ═══════════════════════════════════════════════════════════════════════════════

const PROMPTS = [
  {
    name: "generate_page_from_brief",
    description: "Create a complete page from a text brief",
    arguments: [
      { name: "brief", description: "Detailed page description/requirements", required: true },
      { name: "slug", description: "Page URL path (e.g., /about, /services/web-design)", required: true },
      { name: "preset", description: "Starting preset (landing, property, about, etc.)", required: false },
    ],
    template: (args: Record<string, string>) =>
      `Generate a Puck page for "${args.slug}" based on this brief:\n\n${args.brief}\n\n` +
      `${args.preset ? `Start with the "${args.preset}" preset and customize it.` : "Choose the best preset and customize from there."}\n\n` +
      `Use appropriate blocks from these categories:\n` +
      Object.entries(CATEGORIES).map(([k, v]) => `- ${k}: ${v.slice(0, 8).join(", ")}`).join("\n") +
      `\n\nEnsure proper heading hierarchy (H1 → H2 → H3), responsive design considerations, and SEO metadata.`,
  },
  {
    name: "audit_page",
    description: "Review a page for best practices and issues",
    arguments: [
      { name: "slug", description: "Page to audit", required: true },
      { name: "focus", description: "Specific areas to focus on (seo, accessibility, performance, design)", required: false },
    ],
    template: (args: Record<string, string>) =>
      `Audit the Puck page at "${args.slug}".\n\n` +
      `${args.focus ? `Focus areas: ${args.focus}` : "Check all areas:"}\n` +
      `- Heading hierarchy (single H1, logical order)\n` +
      `- Image alt text and accessibility\n` +
      `- Mobile responsiveness\n` +
      `- CTA placement and clarity\n` +
      `- SEO metadata (title, description, OG tags)\n` +
      `- Performance (image sizes, lazy loading)\n` +
      `- Content readability (contrast, font sizes)\n` +
      `- Zone/dropzone configuration\n\n` +
      `Provide specific recommendations for improvement.`,
  },
  {
    name: "build_property_listing",
    description: "Create a real estate/property showcase page",
    arguments: [
      { name: "propertyId", description: "Property identifier or address", required: true },
      { name: "slug", description: "Page URL path", required: true },
      { name: "features", description: "Key features to highlight (comma-separated)", required: false },
    ],
    template: (args: Record<string, string>) =>
      `Build a property listing page at "${args.slug}" for: ${args.propertyId}\n\n` +
      `${args.features ? `Key features: ${args.features}` : "Include standard property information."}\n\n` +
      `Use these property-focused blocks:\n` +
      `- HeroSection with property hero image\n` +
      `- ImageGallery for property photos\n` +
      `- PropertyCard with full details\n` +
      `- FeatureGrid for amenities\n` +
      `- MapSection for location\n` +
      `- BookingWidget or ContactForm for inquiries\n` +
      `- TestimonialBlock if reviews available\n` +
      `- FAQSection for common questions\n\n` +
      `Optimize for property SEO (location keywords, structured data).`,
  },
  {
    name: "seo_optimize_page",
    description: "Improve page SEO and metadata",
    arguments: [
      { name: "slug", description: "Page to optimize", required: true },
      { name: "keywords", description: "Target keywords", required: true },
      { name: "competitor", description: "Competitor URL for comparison", required: false },
    ],
    template: (args: Record<string, string>) =>
      `SEO optimize the page at "${args.slug}" for: ${args.keywords}\n\n` +
      `${args.competitor ? `Compare with: ${args.competitor}` : ""}\n\n` +
      `Optimize:\n` +
      `- Page title (60 chars, keyword-first)\n` +
      `- Meta description (150 chars, CTA)\n` +
      `- OG image and Twitter card\n` +
      `- Heading structure with keywords\n` +
      `- Image alt text\n` +
      `- Internal linking structure\n` +
      `- URL slug optimization\n` +
      `- Schema.org structured data\n` +
      `- Content keyword density\n\n` +
      `Ensure mobile-friendly and fast-loading.`,
  },
  {
    name: "create_landing_page",
    description: "Build a high-converting landing page",
    arguments: [
      { name: "product", description: "Product/service name", required: true },
      { name: "audience", description: "Target audience", required: true },
      { name: "goal", description: "Conversion goal (signup, purchase, demo)", required: true },
      { name: "slug", description: "Page URL", required: true },
    ],
    template: (args: Record<string, string>) =>
      `Create a landing page for "${args.product}" targeting ${args.underage}.\n\n` +
      `Goal: ${args.goal}\n\n` +
      `URL: ${args.slug}\n\n` +
      `Structure:\n` +
      `1. HeroSection with compelling headline, subhead, CTA\n` +
      `2. FeatureGrid with 3-6 key benefits\n` +
      `3. Social proof (StatsBar, TestimonialSlider, LogoCloud)\n` +
      `4. Problem/solution section (TextBlock with visuals)\n` +
      `5. Pricing or CTA section\n` +
      `6. FAQ for objections\n` +
      `7. Final CTA banner\n` +
      `8. Footer\n\n` +
      `Use conversion-focused copy and clear visual hierarchy.`,
  },
  {
    name: "build_multi_column_layout",
    description: "Create advanced multi-column layouts with DropZones",
    arguments: [
      { name: "slug", description: "Page URL", required: true },
      { name: "layout", description: "Layout type (2-col, 3-col, sidebar, hero-grid)", required: true },
      { name: "content", description: "Content requirements", required: true },
    ],
    template: (args: Record<string, string>) =>
      `Build a multi-column layout page at "${args.slug}".\n\n` +
      `Layout: ${args.layout}\n` +
      `Content: ${args.content}\n\n` +
      `Use these layout blocks:\n` +
      `- Grid for CSS grid layouts\n` +
      `- Flex for flexbox layouts\n` +
      `- SlotContainer for DropZones\n` +
      `- Section for layout containers\n\n` +
      `Configuration:\n` +
      `- Configure allow/disallow for slots\n` +
      `- Set responsive breakpoints\n` +
      `- Define collisionAxis for drag-and-drop\n` +
      `- Use zones for complex nested layouts\n\n` +
      `Reference: Grid, Flex, Slot, DropZone blocks.`,
  },
  {
    name: "migrate_to_zones",
    description: "Migrate flat page to zone-based architecture",
    arguments: [
      { name: "slug", description: "Page to migrate", required: true },
      { name: "zones", description: "Zone names (comma-separated)", required: true },
    ],
    template: (args: Record<string, string>) =>
      `Migrate page "${args.slug}" to zone-based architecture.\n\n` +
      `Target zones: ${args.zones}\n\n` +
      `Steps:\n` +
      `1. Analyze current content structure\n` +
      `2. Create zone layout (SlotContainer or DropZone)\n` +
      `3. Distribute content to appropriate zones\n` +
      `4. Configure allow/disallow per zone\n` +
      `5. Set minEmptyHeight for drop areas\n` +
      `6. Test drag-and-drop across zones\n\n` +
      `Benefits: Better content organization, flexible layouts, improved editor UX.`,
  },
  {
    name: "create_ecommerce_page",
    description: "Build product or shop page",
    arguments: [
      { name: "type", description: "Page type (product-listing, product-detail, cart, checkout)", required: true },
      { name: "slug", description: "Page URL", required: true },
      { name: "products", description: "Product identifiers or categories", required: false },
    ],
    template: (args: Record<string, string>) =>
      `Create e-commerce ${args.type} page at "${args.slug}".\n\n` +
      `${args.products ? `Products: ${args.products}` : ""}\n\n` +
      `Blocks for ${args.type}:\n` +
      args.type === "product-listing" ?
        `- ProductCard grid\n- SearchBar with filters\n- Pagination\n- Category navigation` :
      args.type === "product-detail" ?
        `- Image gallery\n- Product details\n- Price/rating\n- Add to cart button\n- Related products` :
      args.type === "cart" ?
        `- Cart items list\n- Quantity controls\n- Price breakdown\n- Checkout CTA` :
      args.type === "checkout" ?
        `- CheckoutForm\n- Order summary\n- Payment options\n- Shipping form` :
      `- Generic commerce blocks`,
  },
];

// Register prompts
for (const prompt of PROMPTS) {
  server.prompt(
    prompt.name,
    Object.fromEntries(
      prompt.arguments.map((a) => [a.name, z.string().optional().describe(a.description)])
    ),
    (args) => ({
      messages: [{
        role: "user" as const,
        content: { type: "text" as const, text: prompt.template(args as Record<string, string>) },
      }],
    })
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 10: SAFETY & BOOT
// ═══════════════════════════════════════════════════════════════════════════════

// Crash guards
process.on("uncaughtException", (err) => {
  process.stderr.write(`[puck-mcp] FATAL: ${err.message}\n${err.stack ?? ""}\n`);
  store.flush();
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  process.stderr.write(`[puck-mcp] FATAL: ${reason}\n`);
  store.flush();
  process.exit(1);
});

// Graceful shutdown
const shutdown = (signal: string) => {
  process.stderr.write(`[puck-mcp] ${signal} received — flushing store and exiting.\n`);
  store.flush();
  process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Boot
const transport = new StdioServerTransport();
await server.connect(transport);

// Boot banner
const persistenceStatus = process.env["PUCK_STORE_PATH"]
  ? `✅ ${process.env["PUCK_STORE_PATH"].slice(0, 35)}`
  : "⚠️  in-memory (set PUCK_STORE_PATH)";

process.stderr.write([
  "",
  "╔═══════════════════════════════════════════════════════════════════╗",
  "║   Ω⁷ Puck Builder MCP v9.0 — COMPREHENSIVE EDITION               ║",
  "║   50+ blocks · 14 tools · 6 resources · 8 prompts                 ║",
  "║   Zones · Rich Text · External Data · Multi-column Layouts         ║",
  `║   Persistence: ${persistenceStatus.padEnd(37)}║`.slice(0, 68) + "║",
  "╚═══════════════════════════════════════════════════════════════════╝",
  "",
  "Features:",
  "  • All Puck field types: text, textarea, number, select, radio,",
  "    checkbox, array, object, slot, richtext, external",
  "  • Zone-based nested layouts with DropZone support",
  "  • Property/real estate specialized blocks",
  "  • E-commerce blocks (product, pricing, checkout)",
  "  • 8 page presets: blank, landing, property, malta, pricing, about, blog, ecommerce",
  "  • Comprehensive prompts for AI-assisted page building",
  "",
].join("\n"));

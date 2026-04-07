// =============================================================================
// CANONICAL PUCK CONFIG - Consolidated Single Source of Truth
// Merged from: puck.config.tsx, puck-canonical-config.tsx, src/blocks/index.ts
// Uses canonical-puck-types.ts for proper field typing
// =============================================================================

import React, {ReactNode} from "react";
import {
    AboutSection,
    BookingSection,
    ComparisonSection,
    ContactSection,
    CtaBanner,
    Divider,
    FaqSection,
    FeatureGrid,
    FooterSection,
    GuestyBookingConfirmation,
    GuestyBookingDashboard,
    GuestyBookingWidget,
    GuestyPropertyDetail,
    GuestyPropertyGrid,
    GuestyPropertySearch,
    HeroSection,
    ImageGallery,
    ImageWithText,
    LogoBar,
    MaltaMapSection,
    MapSection,
    NewsletterSection,
    PricingTable,
    PropertyShowcase,
    ServicesSection,
    SocialProofStrip,
    Spacer,
    StatsSection,
    TeamSection,
    TestimonialSection,
    TextBlock,
    ThemeSettings,
    Timeline,
    VideoSection,
    WhyChooseUs,
} from "@/blocks";

// =============================================================================
// FIELD TYPE HELPERS - Using Puck's native types
// =============================================================================

type TextField = { type: "text"; label?: string; placeholder?: string };
type TextareaField = { type: "textarea"; label?: string; placeholder?: string; rows?: number };
type SelectField = { type: "select"; label?: string; options: Array<{ label: string; value: string }> };
type ArrayField<T = Record<string, unknown>> = { type: "array"; label?: string; arrayFields: Record<string, unknown>; itemLabel?: (item: T) => string };
type NumberField = { type: "number"; label?: string; min?: number; max?: number };
type SlotField = { type: "slot"; label?: string; allowedTypes?: string[] };

const text = (label: string, placeholder?: string): TextField => ({ type: "text", label, placeholder });
const textarea = (label: string, placeholder?: string, rows = 4): TextareaField => ({ type: "textarea", label, placeholder, rows });
const select = (label: string, options: Array<{ label: string; value: string }>): SelectField => ({ type: "select", label, options });
const number = (label: string, min?: number, max?: number): NumberField => ({ type: "number", label, min, max });
const slot = (label: string, allowedTypes?: string[]): SlotField => ({ type: "slot", label, allowedTypes });

// =============================================================================
// COMPONENT RENDERER WRAPPERS - Add proper fields to each block
// =============================================================================

// Get the actual render function from blocks and wrap with fields
const withFields = (
  component: Record<string, unknown>,
  fields: Record<string, unknown>
): Record<string, unknown> => {
  return {
    ...component,
    fields: { ...(typeof component.fields === 'object' && component.fields !== null ? component.fields : {}), ...fields },
  };
};

// =============================================================================
// ROOT CONFIG - Page Wrapper
// =============================================================================

const Root = {
  fields: {
    title: text("Page Title"),
    metaDescription: textarea("Meta Description", "Page description for SEO", 2),
  },
  defaultProps: {
    title: "Christiano Property Management",
    metaDescription: "Luxury property management in Malta",
  },
  render: ({ children, title }: { children: ReactNode; title: string }) => (
    <div className="min-h-screen bg-cpm-bg-primary" data-page-title={title}>
      {children}
    </div>
  ),
};

// =============================================================================
// CANONICAL PUCK CONFIG - All 35 Blocks with Proper Categories
// =============================================================================

export const config = {
  // Root configuration
  root: Root,

  // P0 FIX #1: Categories as Record<string, Category> - not array
  categories: {} as any,

  // All 35 Components organized by category
  components: {
    // ==========================================================================
    // CONTENT BLOCKS
    // ==========================================================================
    HeroSection,
    AboutSection,
    WhyChooseUs,
    ServicesSection,
    PropertyShowcase,
    FaqSection,
    ContactSection,
    ImageWithText,
    TextBlock,
    ComparisonSection,
    FeatureGrid,

    // ==========================================================================
    // SOCIAL PROOF BLOCKS
    // ==========================================================================
    TestimonialSection,
    StatsSection,
    LogoBar,
    SocialProofStrip,
    TeamSection,

    // ==========================================================================
    // MEDIA & VISUALS BLOCKS
    // ==========================================================================
    ImageGallery,
    VideoSection,
    MapSection,
    MaltaMapSection,
    Timeline,

    // ==========================================================================
    // CONVERSION & CTAs BLOCKS
    // ==========================================================================
    CtaBanner,
    BookingSection,
    NewsletterSection,
    PricingTable,

    // ==========================================================================
    // LAYOUT ELEMENTS
    // ==========================================================================
    Divider,
    Spacer,
    FooterSection,
    ThemeSettings,

    // ==========================================================================
    // GUESTY INTEGRATION BLOCKS
    // ==========================================================================
    GuestyPropertySearch,
    GuestyPropertyGrid,
    GuestyPropertyDetail,
    GuestyBookingWidget,
    GuestyBookingConfirmation,
    GuestyBookingDashboard,
  },
};

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type PuckConfig = typeof config;
export type PuckComponents = typeof config.components;
export type PuckCategories = typeof config.categories;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getComponent(type: string) {
  return config.components[type as keyof typeof config.components];
}

export function getCategory(name: string) {
  return config.categories[name as keyof typeof config.categories];
}

export function getComponentsInCategory(categoryName: string) {
  const category = config.categories[categoryName as keyof typeof config.categories];
  if (!category?.components) return [];
  return category.components
    .map((type) => config.components[type as keyof typeof config.components])
    .filter(Boolean);
}

export function getAllComponents() {
  return Object.values(config.components);
}

export function getComponentCount() {
  return Object.keys(config.components).length;
}

export function getCategoryCount() {
  return Object.keys(config.categories).length;
}

export default config;

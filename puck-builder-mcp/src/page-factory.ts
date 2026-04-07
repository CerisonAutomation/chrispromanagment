/**
 * @fileoverview Generates full valid Puck UserData pages from high-level presets.
 * Presets: landing | pricing | about | property | malta | blank
 */

import type { PuckPageData, PuckBlockType } from "./puck-schema.js";
import { PuckPageDataSchema } from "./puck-schema.js";
import { buildBlocks } from "./block-factory.js";
import { generatePuckId } from "./id.js";

const PAGE_PRESETS: Record<
  string,
  Array<{ type: PuckBlockType; props?: Record<string, unknown> }>
> = {
  landing: [
    { type: "HeroSection", props: { heading: "Welcome", subheading: "Your best stay awaits.", align: "center", minHeight: "80vh" } },
    { type: "Spacer", props: { height: "64px" } },
    { type: "Heading", props: { text: "Features", level: "2", size: "xxl", align: "center" } },
    { type: "Spacer", props: { height: "24px" } },
    { type: "FeatureGrid", props: { columns: 3, features: [
      { icon: "home", title: "Luxury Stays", description: "Handpicked premium properties." },
      { icon: "calendar", title: "Easy Booking", description: "Reserve in seconds." },
      { icon: "star", title: "5-Star Service", description: "Dedicated support 24/7." },
    ]}},
    { type: "Spacer", props: { height: "80px" } },
    { type: "StatsSection", props: { stats: [
      { value: "500+", label: "Properties" },
      { value: "10K+", label: "Happy Guests" },
      { value: "4.9", label: "Average Rating", suffix: "★" },
    ]}},
    { type: "Spacer", props: { height: "80px" } },
    { type: "TestimonialSection", props: {} },
    { type: "Spacer", props: { height: "80px" } },
    { type: "CtaBanner", props: { heading: "Ready to Book?", primaryCta: { label: "Browse Properties", href: "/properties" } } },
    { type: "Spacer", props: { height: "80px" } },
  ],
  property: [
    { type: "GuestyPropertySearch", props: { showFilters: true, defaultView: "grid" } },
    { type: "Spacer", props: { height: "48px" } },
    { type: "PropertyShowcase", props: { heading: "Featured Properties", columns: 3, maxItems: 6 } },
    { type: "Spacer", props: { height: "80px" } },
    { type: "MaltaMapSection", props: { heading: "Explore Malta", zoom: 11 } },
    { type: "Spacer", props: { height: "80px" } },
  ],
  malta: [
    { type: "HeroSection", props: { heading: "Discover Malta", subheading: "Sun, sea, and luxury.", align: "center", minHeight: "70vh" } },
    { type: "Spacer", props: { height: "64px" } },
    { type: "AboutSection", props: { heading: "Why Malta?", layout: "imageRight" } },
    { type: "Spacer", props: { height: "64px" } },
    { type: "MaltaMapSection", props: { heading: "Locations We Serve", zoom: 11 } },
    { type: "Spacer", props: { height: "64px" } },
    { type: "TestimonialSection", props: { heading: "Guest Reviews" } },
    { type: "Spacer", props: { height: "64px" } },
    { type: "NewsletterSection", props: { heading: "Get Malta Travel Tips" } },
    { type: "Spacer", props: { height: "64px" } },
  ],
  pricing: [
    { type: "HeroSection", props: { heading: "Simple Pricing", subheading: "No hidden fees.", align: "center", minHeight: "40vh" } },
    { type: "Spacer", props: { height: "64px" } },
    { type: "PricingTable", props: {} },
    { type: "Spacer", props: { height: "80px" } },
    { type: "FaqSection", props: { heading: "Pricing FAQ" } },
    { type: "Spacer", props: { height: "80px" } },
  ],
  about: [
    { type: "HeroSection", props: { heading: "About Us", align: "center", minHeight: "40vh" } },
    { type: "Spacer", props: { height: "64px" } },
    { type: "AboutSection", props: { heading: "Our Story", layout: "imageRight" } },
    { type: "Spacer", props: { height: "64px" } },
    { type: "TeamSection", props: {} },
    { type: "Spacer", props: { height: "64px" } },
    { type: "StatsSection", props: {} },
    { type: "Spacer", props: { height: "64px" } },
    { type: "CtaBanner", props: { heading: "Work With Us", primaryCta: { label: "Contact", href: "/contact" } } },
    { type: "Spacer", props: { height: "64px" } },
  ],
  blank: [],
};

export function buildPage(
  preset: string = "blank",
  title = "New Page",
  overrides: Array<{ index: number; props: Record<string, unknown> }> = []
): PuckPageData {
  const specs = [...(PAGE_PRESETS[preset] ?? [])];

  for (const { index, props } of overrides) {
    if (specs[index]) {
      specs[index] = { ...specs[index], props: { ...(specs[index].props ?? {}), ...props } };
    }
  }

  const content = buildBlocks(specs);

  return PuckPageDataSchema.parse({
    content,
    root: { props: { title } },
    zones: {},
  });
}

export { PAGE_PRESETS };

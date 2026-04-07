/**
 * HeroSection — canonical Puck CMS block.
 * Merges legacy hero.tsx + hero-section.tsx into one source of truth.
 * @module blocks/hero-section
 */
"use client";

import Image from "next/image";
import Link from "next/link";
import { type ComponentConfig } from "@measured/puck";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type Alignment = "left" | "center" | "right";
type Variant   = "default" | "minimal" | "full-bleed";

export interface HeroSectionProps {
  /** Main headline */
  title:            string;
  /** Supporting subtitle shown beneath the headline */
  subtitle:         string;
  /** Background image URL (Cloudinary / any CDN) */
  backgroundImage?: string;
  /** Alt text for background image (a11y) */
  backgroundAlt?:   string;
  /** Primary CTA label */
  ctaText?:         string;
  /** Primary CTA destination */
  ctaHref?:         string;
  /** Secondary CTA label */
  secondaryCtaText?: string;
  /** Secondary CTA destination */
  secondaryCtaHref?: string;
  /** Horizontal text alignment */
  alignment?:       Alignment;
  /** Layout variant controlling height + overlay intensity */
  variant?:         Variant;
  /** Dark overlay opacity 0–100 */
  overlayOpacity?:  number;
  /** Show a scroll-down caret */
  showScrollCue?:   boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function HeroSection({
  title,
  subtitle,
  backgroundImage,
  backgroundAlt       = "Hero background",
  ctaText,
  ctaHref             = "/properties",
  secondaryCtaText,
  secondaryCtaHref    = "/contact",
  alignment           = "center",
  variant             = "default",
  overlayOpacity      = 55,
  showScrollCue       = true,
}: HeroSectionProps) {
  const heightClass = {
    default:    "min-h-[85vh]",
    minimal:    "min-h-[55vh]",
    "full-bleed": "min-h-screen",
  }[variant];

  const alignClass = {
    left:   "items-start text-left",
    center: "items-center text-center",
    right:  "items-end text-right",
  }[alignment];

  const clampedOpacity = Math.min(100, Math.max(0, overlayOpacity ?? 55));

  return (
    <section
      className={cn(
        "relative flex flex-col justify-center overflow-hidden",
        heightClass,
      )}
      aria-label="Hero section"
    >
      {/* Background */}
      {backgroundImage ? (
        <Image
          src={backgroundImage}
          alt={backgroundAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700" />
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: clampedOpacity / 100 }}
        aria-hidden="true"
      />

      {/* Content */}
      <div
        className={cn(
          "relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-20",
          alignClass,
        )}
      >
        <h1 className="font-serif text-4xl font-bold leading-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
          {title}
        </h1>

        {subtitle && (
          <p className="max-w-2xl text-lg text-white/85 drop-shadow sm:text-xl">
            {subtitle}
          </p>
        )}

        {(ctaText ?? secondaryCtaText) && (
          <div className="mt-2 flex flex-wrap gap-4">
            {ctaText && (
              <Link
                href={ctaHref}
                className="inline-flex items-center rounded-lg bg-amber-500 px-7 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
              >
                {ctaText}
              </Link>
            )}
            {secondaryCtaText && (
              <Link
                href={secondaryCtaHref}
                className="inline-flex items-center rounded-lg border border-white/60 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {secondaryCtaText}
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Scroll cue */}
      {showScrollCue && (
        <div
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce"
          aria-hidden="true"
        >
          <svg
            className="h-6 w-6 text-white/70"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      )}
    </section>
  );
}

// ─── Puck Config ─────────────────────────────────────────────────────────────

export const HeroSectionConfig: ComponentConfig<HeroSectionProps> = {
  label: "Hero Section",
  fields: {
    title:            { type: "text", label: "Headline" },
    subtitle:         { type: "textarea", label: "Subtitle" },
    backgroundImage:  { type: "text", label: "Background Image URL" },
    backgroundAlt:    { type: "text", label: "Background Alt Text" },
    ctaText:          { type: "text", label: "Primary CTA Text" },
    ctaHref:          { type: "text", label: "Primary CTA URL" },
    secondaryCtaText: { type: "text", label: "Secondary CTA Text" },
    secondaryCtaHref: { type: "text", label: "Secondary CTA URL" },
    alignment: {
      type: "select",
      label: "Text Alignment",
      options: [
        { label: "Left",   value: "left" },
        { label: "Center", value: "center" },
        { label: "Right",  value: "right" },
      ],
    },
    variant: {
      type: "select",
      label: "Variant",
      options: [
        { label: "Default",    value: "default" },
        { label: "Minimal",    value: "minimal" },
        { label: "Full Bleed", value: "full-bleed" },
      ],
    },
    overlayOpacity: { type: "number", label: "Overlay Opacity (0–100)" },
    showScrollCue:  { type: "radio",  label: "Show Scroll Cue", options: [{ label: "Yes", value: true }, { label: "No", value: false }] },
  },
  defaultProps: {
    title:           "Welcome to Chris Property Management",
    subtitle:        "Premium short-term rentals in Malta's finest locations.",
    ctaText:         "Browse Properties",
    ctaHref:         "/properties",
    alignment:       "center",
    variant:         "default",
    overlayOpacity:  55,
    showScrollCue:   true,
  },
  render: (props) => <HeroSection {...props} />,
};

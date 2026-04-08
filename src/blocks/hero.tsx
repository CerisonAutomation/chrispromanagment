// =============================================================================
// HERO BLOCK - CANONICAL PUCK STANDARD
// 100% Compliance
// =============================================================================

import React from "react";
import type { ComponentConfig } from "@/types/puck";
import { text, textarea, select, number } from "@/blocks/helpers";

export const Hero: ComponentConfig<{
  title: string;
  subtitle: string;
  description: string;
  primaryCta: string;
  primaryCtaLink: string;
  secondaryCta: string;
  secondaryCtaLink: string;
  imageUrl: string;
  imageAlt: string;
  layout: string;
  backgroundColor: string;
  padding: number;
  showBadge: boolean;
  badgeText: string;
}> = {
  label: "Hero",
  defaultProps: {
    title: "Build Stunning Websites",
    subtitle: "Without Code",
    description: "Create professional, responsive websites with our visual editor. No coding required.",
    primaryCta: "Get Started",
    primaryCtaLink: "#signup",
    secondaryCta: "Learn More",
    secondaryCtaLink: "#features",
    imageUrl: "",
    imageAlt: "Hero image",
    layout: "split",
    backgroundColor: "bg-white",
    padding: 100,
    showBadge: true,
    badgeText: "New: AI-Powered Design",
  },
  fields: {
    title: text("Title", "Enter headline..."),
    subtitle: text("Subtitle", "Sub headline..."),
    description: textarea("Description", "Supporting text..."),
    primaryCta: text("Primary CTA Text", "Button text..."),
    primaryCtaLink: text("Primary CTA Link", "#link"),
    secondaryCta: text("Secondary CTA Text", "Button text..."),
    secondaryCtaLink: text("Secondary CTA Link", "#link"),
    imageUrl: text("Hero Image URL", "https://..."),
    imageAlt: text("Image Alt Text", "Describe image..."),
    layout: select("Layout", [
      { label: "Left Text, Right Image", value: "split" },
      { label: "Center Text, Below Image", value: "center" },
      { label: "Full Background", value: "background" },
    ]),
    backgroundColor: select("Background", [
      { label: "White", value: "bg-white" },
      { label: "Light", value: "bg-neutral-50" },
      { label: "Dark", value: "bg-neutral-900 text-white" },
      { label: "Primary", value: "bg-primary text-white" },
      { label: "Gradient", value: "bg-gradient-to-br from-primary to-primary-foreground" },
    ]),
    padding: number("Padding (px)", 40, 200),
    showBadge: select("Show Badge", [
      { label: "Yes", value: "true" },
      { label: "No", value: "false" },
    ]),
    badgeText: text("Badge Text", "Badge text..."),
  },
  render: ({
    title,
    subtitle,
    description,
    primaryCta,
    primaryCtaLink,
    secondaryCta,
    secondaryCtaLink,
    imageUrl,
    imageAlt,
    layout,
    backgroundColor,
    padding,
    showBadge,
    badgeText,
  }) => {
    const isDark = backgroundColor?.includes('neutral-900') || backgroundColor?.includes('primary');

    if (layout === 'split') {
      return (
        <section className={`${backgroundColor} w-full`} style={{ padding: `${padding}px 0` }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                {showBadge && badgeText && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isDark ? 'bg-white/10 text-white' : 'bg-primary/10 text-primary'}`}>
                    {badgeText}
                  </span>
                )}
                <div>
                  <span className={`text-sm font-semibold tracking-wide uppercase ${isDark ? 'text-white/70' : 'text-primary'}`}>
                    {subtitle}
                  </span>
                  <h1 className={`mt-2 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                    {title}
                  </h1>
                </div>
                <p className={`text-lg ${isDark ? 'text-white/80' : 'text-neutral-600'}`}>
                  {description}
                </p>
              </div>
              {imageUrl && (
                <div className="relative aspect-square lg:aspect-auto lg:h-[500px] rounded-2xl overflow-hidden">
                  <img src={imageUrl} alt={imageAlt} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </section>
      );
    }

    if (layout === 'center') {
      return (
        <section className={`${backgroundColor} w-full`} style={{ padding: `${padding}px 0` }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {showBadge && badgeText && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isDark ? 'bg-white/10 text-white' : 'bg-primary/10 text-primary'}`}>
                {badgeText}
              </span>
            )}
            <div className="mt-4">
              <span className={`text-sm font-semibold tracking-wide uppercase ${isDark ? 'text-white/70' : 'text-primary'}`}>
                {subtitle}
              </span>
              <h1 className={`mt-2 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                {title}
              </h1>
            </div>
            <p className={`mt-6 text-lg max-w-2xl mx-auto ${isDark ? 'text-white/80' : 'text-neutral-600'}`}>
              {description}
            </p>
            {imageUrl && (
              <div className="mt-12 relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
                <img src={imageUrl} alt={imageAlt} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </section>
      );
    }

    return (
      <section className={`${backgroundColor} w-full relative overflow-hidden`} style={{ padding: `${padding}px 0` }}>
        {imageUrl && (
          <div className="absolute inset-0 z-0">
            <img src={imageUrl} alt={imageAlt} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50" />
          </div>
        )}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {showBadge && badgeText && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/10 text-white">
              {badgeText}
            </span>
          )}
          <div className="mt-4">
            <span className="text-sm font-semibold tracking-wide uppercase text-white/70">
              {subtitle}
            </span>
            <h1 className="mt-2 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              {title}
            </h1>
          </div>
          <p className="mt-6 text-lg max-w-2xl mx-auto text-white/80">
            {description}
          </p>
        </div>
      </section>
    );
  },
};

// Alias for backward compatibility
export { Hero as HeroSection };
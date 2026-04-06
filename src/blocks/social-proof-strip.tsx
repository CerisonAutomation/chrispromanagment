"use client";

import React from "react";
import {BlurFade} from "@/components/effects/blur-fade";
import {NumberTicker} from "@/components/effects/number-ticker";

export const SocialProofStrip = {
  label: "Social Proof Strip",
  fields: {
    items: {
      type: "array" as const,
      label: "Metrics",
      defaultItemProps: { number: "100", label: "Metric", prefix: "", suffix: "+" },
      getItemSummary: (item: Record<string, unknown>) => `${(item as { number?: string }).number} ${(item as { label?: string }).label}`,
      arrayFields: {
        number: { type: "text" as const, label: "Metric Number" },
        label: { type: "text" as const },
        prefix: { type: "text" as const, label: "Prefix (e.g. $, €)" },
        suffix: { type: "text" as const, label: "Suffix (e.g. %, +)" },
      },
    },
  },
  defaultProps: {
    items: [
      { number: "4.9", label: "Average Rating", prefix: "", suffix: "★" },
      { number: "1000", label: "Happy Guests", prefix: "", suffix: "+" },
      { number: "98", label: "Response Rate", prefix: "", suffix: "%" },
      { number: "50", label: "Properties", prefix: "", suffix: "+" },
    ],
  },
  render: (props: Record<string, unknown>) => {
    const p = props as {
      items: { number: string; label: string; prefix: string; suffix: string }[];
    };

    const getNumericValue = (value: string): number => {
      return parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
    };

    return (
      <>
        <section className="relative bg-cpm-bg-primary px-4 py-16 sm:px-8 overflow-hidden">
          {/* Subtle background gradient */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ background: "radial-gradient(ellipse at center, var(--cpm-accent), transparent 60%)" }} />
          {/* Mobile: scrolling marquee */}
          <div className="lg:hidden">
            <div className="flex gap-0" style={{ animation: "marquee 20s linear infinite" }}>
              {[...(p.items || []), ...(p.items || [])].map((item, i) => (
                <div key={i} className="flex shrink-0 items-center gap-3 px-8">
                  <span
                    className="font-[family-name:var(--font-heading)] text-3xl font-light"
                    style={{
                      background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-text-primary))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    <NumberTicker
                      value={getNumericValue(item.number)}
                      prefix={item.prefix || ""}
                      suffix={item.suffix || ""}
                      delay={0.5}
                      duration={2}
                      className="text-3xl font-light"
                    />
                  </span>
                  <span className="text-sm text-cpm-text-secondary whitespace-nowrap">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Desktop: grid with BlurFade */}
          <div className="hidden lg:block">
            <div className="mx-auto grid max-w-6xl grid-cols-4 gap-0">
              {(p.items || []).map((item, i) => (
                <BlurFade key={i} delay={i * 0.12} duration={0.6}>
                  <div className="group relative text-center">
                    {/* 21st.dev: NumberTicker for animated counting */}
                    <div
                      className="font-[family-name:var(--font-heading)] text-4xl font-light transition-transform duration-300 group-hover:scale-105"
                      style={{
                        background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-text-primary))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      <NumberTicker
                        value={getNumericValue(item.number)}
                        prefix={item.prefix || ""}
                        suffix={item.suffix || ""}
                        delay={i * 0.12}
                        duration={2}
                        className="text-4xl font-light"
                      />
                    </div>
                    <div className="mx-auto my-3 h-[2px] w-12 bg-gradient-to-r from-transparent via-cpm-accent/40 to-transparent transition-all duration-300 group-hover:w-16 group-hover:via-cpm-accent" />
                    <div className="text-sm text-cpm-text-secondary transition-colors duration-300 group-hover:text-cpm-text-primary">{item.label}</div>
                    {i < (p.items || []).length - 1 && (
                      <div className="absolute right-0 top-1/2 h-12 -translate-y-1/2 w-[1px] bg-gradient-to-b from-transparent via-cpm-accent/20 to-transparent" />
                    )}
                  </div>
                </BlurFade>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  },
  ai: { instructions: "3-5 key metrics in horizontal strip. Use impressive numbers with labels: ratings, guests, response rate." },
};

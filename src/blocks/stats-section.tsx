"use client";

import React from "react";
import { BlurFade } from "@/components/effects/blur-fade";
import { NumberTicker } from "@/components/effects/number-ticker";

export const StatsSection = {
  label: "Stats Section",
  fields: {
    stats: {
      type: "array" as const,
      label: "Stats",
      defaultItemProps: { value: "100+", label: "Metric", icon: "star" },
      getItemSummary: (item: Record<string, unknown>) => `${(item as { value?: string }).value} - ${(item as { label?: string }).label}`,
      arrayFields: {
        value: { type: "text" as const },
        label: { type: "text" as const },
        icon: { type: "select" as const, options: [{ label: "Calendar", value: "calendar" }, { label: "Building", value: "building" }, { label: "Users", value: "users" }, { label: "Star", value: "star" }, { label: "Trending Up", value: "trending" }, { label: "Award", value: "award" }] },
      },
    },
  },
  defaultProps: {
    stats: [
      { value: "9+", label: "Years Experience", icon: "calendar" },
      { value: "50+", label: "Properties Managed", icon: "building" },
      { value: "1000+", label: "Happy Guests", icon: "users" },
      { value: "4.9", label: "Average Rating", icon: "star" },
    ],
  },
  Component: (props: Record<string, unknown>) => {
    const p = props as { stats: { value: string; label: string; icon: string }[] };

    const iconPaths: Record<string, string> = {
      calendar: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5",
      building: "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z",
      users: "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z",
      star: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z",
      trending: "M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941",
      award: "M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.043 6.043 0 0 1-2.54.89m0 0c-.732.085-1.472.085-2.21 0",
    };

    const getNumericValue = (value: string): number => {
      return parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
    };

    const getSuffix = (value: string): string => {
      const match = value.match(/[^0-9.].*$/);
      return match ? match[0] : "";
    };

    return (
      <>
        <section className="relative bg-cpm-bg-secondary px-4 py-24 sm:px-8 overflow-hidden">
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full opacity-[0.04] blur-3xl" style={{ background: "radial-gradient(circle, var(--cpm-accent), transparent)" }} />
          <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-8 lg:grid-cols-4">
            {(p.stats || []).map((stat, i) => (
              <BlurFade key={i} delay={i * 0.15} duration={0.6}>
                <div className="group text-center">
                  {/* Icon */}
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cpm-accent/10 bg-cpm-accent/5 transition-all duration-500 group-hover:border-cpm-accent/30 group-hover:bg-cpm-accent/10 group-hover:shadow-[0_0_25px_rgba(200,169,106,0.1)]">
                    <svg className="h-6 w-6 text-cpm-accent transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d={iconPaths[stat.icon] || iconPaths.star} />
                    </svg>
                  </div>
                  {/* 21st.dev: NumberTicker for animated counting */}
                  <div
                    className="font-[family-name:var(--font-heading)] text-4xl font-light sm:text-5xl transition-transform duration-300 group-hover:scale-105"
                    style={{
                      background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-text-primary))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    <NumberTicker
                      value={getNumericValue(stat.value)}
                      suffix={getSuffix(stat.value)}
                      delay={i * 0.15}
                      duration={2}
                      className="text-4xl font-light sm:text-5xl"
                    />
                  </div>
                  <div className="mx-auto mt-3 h-[2px] w-12 bg-gradient-to-r from-transparent via-cpm-accent to-transparent transition-all duration-300 group-hover:w-16" />
                  <div className="mt-3 text-sm text-cpm-text-secondary transition-colors duration-300 group-hover:text-cpm-text-primary">{stat.label}</div>
                </div>
              </BlurFade>
            ))}
          </div>
        </section>
      </>
    );
  },
  ai: { instructions: "3-4 key metrics. Use real CPM stats: 9+ years, 50+ properties, 1000+ guests, 4.9 rating. Values impressive but credible." },
};

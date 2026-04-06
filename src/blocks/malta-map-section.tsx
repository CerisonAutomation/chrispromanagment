import React from "react";
import MaltaSVGLoader from "@/components/malta-svg-loader";

export const MaltaMapSection = {
  label: "Malta & Gozo Map Animation",
  fields: {
    label: { type: "text" as const },
    drawDuration: { type: "number" as const, label: "Draw Duration (ms)" },
    fillDelay: { type: "number" as const, label: "Fill Delay (ms)" },
    sizeClass: {
      type: "select" as const,
      label: "Size Preset",
      options: [
        { label: "Small", value: "w-36 h-24 sm:w-48 sm:h-32 md:w-56 md:h-36" },
        { label: "Medium", value: "w-44 h-32 sm:w-60 sm:h-44 md:w-72 md:h-52" },
        { label: "Large", value: "w-56 h-40 sm:w-72 sm:h-52 md:w-96 md:h-64" },
        { label: "Full Width", value: "w-64 h-44 sm:w-80 sm:h-56 md:w-[28rem] md:h-72 lg:w-[36rem] lg:h-80" },
      ],
    },
    showBrand: {
      type: "select" as const,
      label: "Show Brand Tagline",
      options: [
        { label: "Show", value: "true" },
        { label: "Hide", value: "false" },
      ],
    },
    backgroundStyle: {
      type: "select" as const,
      label: "Background Style",
      options: [
        { label: "Transparent", value: "transparent" },
        { label: "Dark Surface", value: "dark" },
        { label: "Card Surface", value: "card" },
        { label: "Gradient Glow", value: "glow" },
      ],
    },
    paddingY: {
      type: "select" as const,
      label: "Vertical Padding",
      options: [
        { label: "Compact", value: "compact" },
        { label: "Normal", value: "normal" },
        { label: "Spacious", value: "spacious" },
      ],
    },
  },
  defaultProps: {
    label: "",
    drawDuration: 2200,
    fillDelay: 250,
    sizeClass: "w-44 h-32 sm:w-60 sm:h-44 md:w-72 md:h-52",
    showBrand: "true",
    backgroundStyle: "transparent",
    paddingY: "normal",
  },
  Component: (props: Record<string, unknown>) => {
    const p = props as {
      label?: string;
      drawDuration?: number;
      fillDelay?: number;
      sizeClass?: string;
      showBrand?: string;
      backgroundStyle?: string;
      paddingY?: string;
    };

    const paddingMap: Record<string, string> = {
      compact: "py-8",
      normal: "py-16 sm:py-20",
      spacious: "py-24 sm:py-32",
    };

    const bgMap: Record<string, React.CSSProperties & { className?: string }> = {
      transparent: {},
      dark: { className: "bg-cpm-bg-primary" },
      card: { className: "bg-cpm-bg-secondary mx-auto max-w-4xl rounded-3xl border border-cpm-border shadow-[0_0_60px_rgba(200,169,106,0.04)]" },
      glow: {
        className: "relative overflow-hidden",
        style: { background: "radial-gradient(ellipse at 50% 50%, rgba(200,169,106,0.03) 0%, transparent 70%)" },
      },
    };

    const bg = bgMap[p.backgroundStyle || "transparent"] || {};

    return (
      <section className={`relative flex flex-col items-center justify-center px-4 ${paddingMap[p.paddingY || "normal"] || "py-16 sm:py-20"} ${bg.className || ""}`} style={bg.style}>
        {/* Decorative corner accents for card/glow backgrounds */}
        {(p.backgroundStyle === "card" || p.backgroundStyle === "glow") && (
          <>
            <div className="pointer-events-none absolute left-6 top-6 h-px w-16 bg-gradient-to-r from-cpm-accent/20 to-transparent" aria-hidden="true" />
            <div className="pointer-events-none absolute left-6 top-6 h-16 w-px bg-gradient-to-b from-cpm-accent/20 to-transparent" aria-hidden="true" />
            <div className="pointer-events-none absolute right-6 bottom-6 h-px w-16 bg-gradient-to-l from-cpm-accent/20 to-transparent" aria-hidden="true" />
            <div className="pointer-events-none absolute right-6 bottom-6 h-16 w-px bg-gradient-to-t from-cpm-accent/20 to-transparent" aria-hidden="true" />
          </>
        )}
        <div style={{ animation: "fadeInUp 0.8s ease-out" }}>
          <MaltaSVGLoader
            label={p.label || undefined}
            drawDuration={typeof p.drawDuration === "number" ? p.drawDuration : 2200}
            fillDelay={typeof p.fillDelay === "number" ? p.fillDelay : 250}
            sizeClass={p.sizeClass || "w-44 h-32 sm:w-60 sm:h-44 md:w-72 md:h-52"}
            showBrand={p.showBrand !== "false"}
          />
        </div>
      </section>
    );
  },
};
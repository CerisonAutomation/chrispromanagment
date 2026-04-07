"use client";

import {safeHref} from "./helpers";
import {BlurFade} from "@/components/effects/blur-fade";
import {ShimmerButton} from "@/components/effects/shimmer-button";
import {SparklesText} from "@/components/effects/sparkles-text";
import {DotPattern} from "@/components/effects/patterns";
import {ArrowRight} from "lucide-react";

export const CtaBanner = {
  label: "CTA Banner",
  fields: {
    heading: { type: "text" as const },
    description: { type: "textarea" as const },
    buttonText: { type: "text" as const, label: "Button Text" },
    buttonLink: { type: "text" as const, label: "Button Link" },
  },
  defaultProps: {
    heading: "Partner with Confidence",
    description: "Join the growing number of property owners who trust Christiano Property Management to maximise their rental income while preserving their property's value and character.",
    buttonText: "Contact Us Today",
    buttonLink: "#contact",
  },
  render: (props: Record<string, unknown>) => {
    const p = props as { heading: string; description: string; buttonText: string; buttonLink: string };
    return (
      <>
        <section className="relative bg-cpm-bg-primary px-4 py-20 sm:px-8 overflow-hidden">
          <div className="mx-auto max-w-4xl">
            {/* 21st.dev: Glassmorphism card with premium effects */}
            <div
              className="relative rounded-2xl p-12 text-center backdrop-blur-xl overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(200,169,106,0.08), rgba(200,169,106,0.03))", border: "1px solid rgba(200,169,106,0.15)" }}
            >
              {/* 21st.dev: DotPattern overlay */}
              <DotPattern className="inset-0" opacity={0.06} width={20} height={20} />

              {/* Top gradient accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: "linear-gradient(90deg, transparent, var(--cpm-accent), transparent)" }}
              />
              {/* Traveling gold line animation */}
              <div className="absolute top-0 left-0 h-[2px] w-1/3 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" style={{ animation: "marquee 4s linear infinite" }} />
              {/* Corner accent decorations */}
              <div className="absolute top-0 left-0 h-6 w-[2px] bg-gradient-to-b from-cpm-accent/60 to-transparent" />
              <div className="absolute top-0 left-0 h-[2px] w-6 bg-gradient-to-r from-cpm-accent/60 to-transparent" />
              <div className="absolute top-0 right-0 h-6 w-[2px] bg-gradient-to-b from-cpm-accent/60 to-transparent" />
              <div className="absolute top-0 right-0 h-[2px] w-6 bg-gradient-to-l from-cpm-accent/60 to-transparent" />
              <div className="absolute bottom-0 left-0 h-6 w-[2px] bg-gradient-to-t from-cpm-accent/60 to-transparent" />
              <div className="absolute bottom-0 left-0 h-[2px] w-6 bg-gradient-to-r from-cpm-accent/60 to-transparent" />
              <div className="absolute bottom-0 right-0 h-6 w-[2px] bg-gradient-to-t from-cpm-accent/60 to-transparent" />
              <div className="absolute bottom-0 right-0 h-[2px] w-6 bg-gradient-to-l from-cpm-accent/60 to-transparent" />
              {/* Decorative geometric elements */}
              <div
                className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full opacity-10"
                style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-gold-dark))", animation: "float 6s ease-in-out infinite" }}
              />
              <div
                className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full opacity-5"
                style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-gold-dark))", animation: "float 8s ease-in-out infinite 2s" }}
              />
              <div className="relative z-10">
                {/* 21st.dev: BlurFadeText for heading */}
                <BlurFade delay={0.1}>
                  <h2 className="mb-4 font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight sm:text-4xl">
                    <span
                      className="bg-clip-text text-transparent"
                      style={{
                        backgroundImage: "linear-gradient(135deg, var(--cpm-text-primary), var(--cpm-accent))",
                      }}
                    >
                      <span>
                        <SparklesText
                            className="inline"
                            sparklesCount={6}
                        >
                          {p.heading}
                        </SparklesText>
                      </span>
                    </span>
                  </h2>
                </BlurFade>
                <BlurFade delay={0.3} yOffset={8}>
                  <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-cpm-text-secondary">{p.description}</p>
                </BlurFade>
                {/* 21st.dev: ShimmerButton for CTA */}
                {p.buttonText && (
                  <BlurFade delay={0.5} yOffset={8}>
                    <a href={safeHref(p.buttonLink)} className="inline-block">
                      <ShimmerButton
                        className="rounded-xl text-sm font-semibold text-cpm-bg-primary"
                        shimmerDuration={2}
                        borderRadius="0.75rem"
                      >
                        {p.buttonText}
                        <ArrowRight className="h-4 w-4" />
                      </ShimmerButton>
                    </a>
                  </BlurFade>
                )}
              </div>
            </div>
          </div>
        </section>
      </>
    );
  },
  ai: { instructions: "Action-oriented headline (4-8 words). Supporting description 1-2 sentences. Button 2-5 words. Use #contact or #booking as link." },
};

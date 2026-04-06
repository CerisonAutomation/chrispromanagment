import { HERO_BG } from "@/lib/images";
import { safeHref } from "./helpers";

export const HeroSection = {
  label: "Hero Section",
  fields: {
    title: { type: "text" as const },
    subtitle: { type: "textarea" as const },
    backgroundImage: { type: "text" as const, label: "Background Image URL" },
    ctaText: { type: "text" as const, label: "CTA Button Text" },
    ctaLink: { type: "text" as const, label: "CTA Button Link" },
  },
  defaultProps: {
    title: "Dedicated to Maximizing Your Property's Potential",
    subtitle: "9 years of Superhost experience managing luxury short-term rentals across Malta. International luxury hotel management background. Transparent fees, no hidden markups.",
    backgroundImage: HERO_BG,
    ctaText: "Learn More",
    ctaLink: "#about",
  },
  render: (props: Record<string, unknown>) => {
    const p = props as {
      title: string;
      subtitle: string;
      backgroundImage: string;
      ctaText: string;
      ctaLink: string;
    };
    return (
      <>
        <section className="relative flex min-h-[700px] items-center justify-center overflow-hidden">
          {p.backgroundImage && (
            <>
              <div
                className="absolute inset-0 bg-fixed"
                style={{
                  backgroundImage: `url(${p.backgroundImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cpm-bg-primary via-cpm-bg-primary/60 to-cpm-bg-primary/30" />
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-cpm-bg-primary/40 to-transparent" />
          {/* Decorative floating orbs */}
          <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-cpm-accent/8 blur-3xl" style={{ animation: "float 6s ease-in-out infinite" }} />
          <div className="absolute bottom-1/3 left-1/6 h-48 w-48 rounded-full bg-cpm-accent/5 blur-3xl" style={{ animation: "float 8s ease-in-out infinite 2s" }} />
          <div className="relative z-10 mx-auto max-w-5xl px-6 py-32 text-center" style={{ animation: "fadeInUp 0.8s ease-out" }}>
            {/* Badge with pulse ring */}
            <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-cpm-accent/30 bg-cpm-accent/10 px-5 py-2 backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-cpm-accent" style={{ animation: "pulseRing 2s cubic-bezier(0,0,0.2,1) infinite" }} />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cpm-accent" />
              </span>
              <span className="text-xs font-semibold tracking-[0.15em] text-cpm-accent uppercase">Superhost Since 2015</span>
            </div>
            {/* Gradient text title */}
            <h1
              className="mb-6 font-[family-name:var(--font-heading)] text-4xl font-light leading-tight tracking-tight sm:text-5xl lg:text-6xl"
              style={{
                background: "linear-gradient(135deg, var(--cpm-accent) 0%, var(--cpm-text-primary) 50%, var(--cpm-accent) 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "gradientShift 4s ease infinite",
              }}
            >
              {p.title}
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-cpm-text-secondary sm:text-lg">
              {p.subtitle}
            </p>
            {p.ctaText && (
              <a
                href={safeHref(p.ctaLink)}
                className="group inline-flex items-center gap-2.5 rounded-lg bg-cpm-accent px-8 py-3.5 text-sm font-semibold text-cpm-bg-primary transition-all duration-300 hover:bg-cpm-accent-hover hover:shadow-[0_0_30px_rgba(200,169,106,0.3)] active:scale-[0.98]"
              >
                {p.ctaText}
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>
            )}
          </div>
          {/* Scroll indicator */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2" style={{ animation: "fadeInUp 1s ease-out 1.2s both" }}>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cpm-text-tertiary">Scroll</span>
            <div className="flex h-8 w-5 items-start justify-center rounded-full border border-cpm-text-tertiary/30 pt-1.5">
              <div className="h-1.5 w-1 rounded-full bg-cpm-accent" style={{ animation: "scrollBounce 2s ease-in-out infinite" }} />
            </div>
          </div>
          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-cpm-bg-primary via-cpm-bg-primary/60 to-transparent" />
        </section>
      </>
    );
  },
  ai: { instructions: "Create impactful headlines under 80 characters with benefit-focused messaging about luxury Malta stays. Subtitle 2-3 sentences max, under 300 chars. CTA 2-4 action words. Background image must be from the CDN." },
};
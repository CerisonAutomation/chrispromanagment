import { safeHref } from "./helpers";

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
          <div className="mx-auto max-w-4xl" style={{ animation: "scaleIn 0.6s ease-out" }}>
            {/* Glassmorphism card */}
            <div
              className="relative rounded-2xl p-12 text-center backdrop-blur-xl overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(200,169,106,0.08), rgba(200,169,106,0.03))", border: "1px solid rgba(200,169,106,0.15)" }}
            >
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
                <h2 className="mb-4 font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">
                  {p.heading}
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-cpm-text-secondary">{p.description}</p>
                {p.buttonText && (
                  <a
                    href={safeHref(p.buttonLink)}
                    className="group inline-flex items-center gap-2.5 rounded-xl px-8 py-3.5 text-sm font-semibold text-cpm-bg-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,169,106,0.3)] active:scale-[0.98]"
                    style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-accent-hover))" }}
                  >
                    {p.buttonText}
                    <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </>
    );
  },
};
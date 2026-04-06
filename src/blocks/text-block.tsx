

export const TextBlock = {
  label: "Text Block",
  fields: {
    heading: { type: "text" as const, label: "Heading" },
    body: { type: "textarea" as const, label: "Body Text" },
    badge: { type: "text" as const, label: "Badge Text" },
    align: { type: "select" as const, options: [{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }] },
    size: { type: "select" as const, options: [{ label: "Large", value: "lg" }, { label: "Medium", value: "md" }, { label: "Small", value: "sm" }] },
    style: { type: "select" as const, options: [{ label: "Default", value: "default" }, { label: "Gold Accent", value: "gold" }, { label: "Glass Card", value: "glass" }] },
  },
  defaultProps: { heading: "Welcome to Christiano", body: "Your luxury property management partner in Malta. We bring five-star hospitality standards to short-term rental management.", badge: "", align: "center", size: "lg", style: "default" },
  render: (props: Record<string, unknown>) => {
    const p = props as { heading: string; body: string; badge: string; align: string; size: string; style: string };
    const alignCls = p.align === "center" ? "text-center" : p.align === "right" ? "text-right" : "text-left";
    const headingSize = p.size === "lg" ? "text-3xl sm:text-4xl" : p.size === "sm" ? "text-xl" : "text-2xl";
    const bodySize = p.size === "lg" ? "text-base" : p.size === "sm" ? "text-sm" : "text-base";
    const maxW = p.size === "lg" ? "max-w-4xl" : p.size === "sm" ? "max-w-2xl" : "max-w-3xl";
    const wrapperCls = p.style === "glass" ? "rounded-2xl border border-cpm-accent/10 p-8 sm:p-12 backdrop-blur-xl" : p.style === "gold" ? "rounded-2xl border-l-4 border-l-cpm-accent p-8 sm:p-12 bg-cpm-accent/5" : "py-4";
    return (
      <>
        <section className={`bg-cpm-bg-primary px-4 sm:px-8`}>
          <div className={`mx-auto ${maxW} ${wrapperCls}`}>
            <div className={alignCls}>
              {p.badge && <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-cpm-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-cpm-accent"><span className="h-1.5 w-1.5 rounded-full bg-cpm-accent" />{p.badge}</span>}
              {p.heading && <h2 className={`mb-4 font-[family-name:var(--font-heading)] ${headingSize} font-light tracking-tight text-cpm-text-primary`}>{p.heading}</h2>}
              {p.body && <p className={`${bodySize} leading-relaxed text-cpm-text-secondary`} style={{ whiteSpace: "pre-line" }}>{p.body}</p>}
            </div>
          </div>
        </section>
      </>
    );
  },
};
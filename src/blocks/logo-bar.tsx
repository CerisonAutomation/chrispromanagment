

export const LogoBar = {
  label: "Logo Bar",
  fields: {
    title: { type: "text" as const },
    logos: {
      type: "array" as const,
      label: "Partner Logos",
      defaultItemProps: { name: "Partner", style: "serif" },
      getItemSummary: (item: Record<string, unknown>) => (item as { name?: string }).name || "Partner",
      arrayFields: {
        name: { type: "text" as const },
        style: { type: "select" as const, options: [{ label: "Serif", value: "serif" }, { label: "Sans", value: "sans" }, { label: "Bold Sans", value: "bold" }] },
      },
    },
  },
  defaultProps: {
    title: "Listed On Leading Platforms",
    logos: [
      { name: "Airbnb", style: "bold" },
      { name: "Booking.com", style: "sans" },
      { name: "VRBO", style: "bold" },
      { name: "TripAdvisor", style: "serif" },
      { name: "Google Travel", style: "sans" },
      { name: "Expedia", style: "sans" },
    ],
  },
  render: (props: Record<string, unknown>) => {
    const p = props as { title: string; logos: { name: string; style: string }[] };
    const logos = p.logos || [];
    const doubled = [...logos, ...logos];
    const fontCls = (style: string) => {
      if (style === "serif") return "font-[family-name:var(--font-heading)] italic tracking-wide";
      if (style === "bold") return "font-black tracking-wider uppercase text-[15px]";
      return "font-medium tracking-wide";
    };
    return (
      <>
        <section className="relative bg-cpm-bg-primary px-4 py-16 sm:px-8 overflow-hidden">
          <div className="mx-auto max-w-5xl">
            <p className="mb-10 text-center text-xs font-semibold uppercase tracking-[0.2em] text-cpm-text-tertiary">
              <span className="inline-flex items-center gap-3">
                <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-cpm-border-hover" />
                {p.title}
                <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-cpm-border-hover" />
              </span>
            </p>
            <div className="relative">
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-r from-cpm-bg-primary to-transparent" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-l from-cpm-bg-primary to-transparent" />
              <div className="flex overflow-hidden">
                <div className="flex shrink-0 items-center gap-20" style={{ animation: "marquee 30s linear infinite" }}>
                  {doubled.map((logo, i) => (
                    <div key={`a-${i}`} className="flex items-center gap-3 whitespace-nowrap transition-all duration-500 hover:opacity-100 group">
                      <span className={`text-[18px] ${fontCls(logo.style)} opacity-40 text-cpm-text-primary transition-all duration-500 group-hover:opacity-100 group-hover:text-cpm-accent`}>
                        {logo.name}
                      </span>
                      <div className="h-1 w-1 rounded-full bg-cpm-border-hover group-hover:bg-cpm-accent transition-colors duration-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  },
};


export const Timeline = {
  label: "Timeline",
  fields: {
    title: { type: "text" as const },
    steps: {
      type: "array" as const, label: "Steps",
      defaultItemProps: { title: "Step", description: "Description", date: "", icon: "circle" },
      getItemSummary: (item: Record<string, unknown>) => (item as { title?: string }).title || "Step",
      arrayFields: {
        title: { type: "text" as const },
        description: { type: "textarea" as const },
        date: { type: "text" as const, label: "Date/Label" },
        icon: { type: "select" as const, options: [{ label: "Circle", value: "circle" }, { label: "Check", value: "check" }, { label: "Star", value: "star" }, { label: "Flag", value: "flag" }] },
      },
    },
  },
  defaultProps: {
    title: "How It Works",
    steps: [
      { title: "Free Assessment", description: "We visit your property, evaluate its potential, and provide a detailed management proposal with revenue projections.", date: "Step 1", icon: "circle" },
      { title: "Onboarding", description: "Our team handles everything — professional photography, listing creation, platform setup, and property preparation.", date: "Step 2", icon: "check" },
      { title: "Active Management", description: "We manage your property full-time: pricing, guest communication, cleaning, maintenance, and performance reporting.", date: "Step 3", icon: "star" },
      { title: "Growth & Returns", description: "Watch your rental income grow with our data-driven approach, transparent reporting, and continuous optimisation.", date: "Step 4", icon: "flag" },
    ],
  },
  render: (props: Record<string, unknown>) => {
    const p = props as { title: string; steps: { title: string; description: string; date: string; icon: string }[] };
    const iconSvgs: Record<string, string> = {
      circle: "M12 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
      check: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
      star: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292Z",
      flag: "M3 3v1.5M3 21v-6m0 0 2.25-2.25M3 16.5a2.25 2.25 0 0 1 2.25 2.25M21 16.5V6a2.25 2.25 0 0 0-2.25-2.25H9M21 16.5a2.25 2.25 0 0 1-2.25 2.25m0 0-1.5-1.5M15 3H9m12 16.5V3",
    };
    return (
      <>
        <section className="bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-4xl">
            <div className="mb-14 text-center">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.title}</h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
            </div>
            <div className="relative">
              <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-cpm-accent via-cpm-accent/30 to-cpm-accent/10" />
              <div className="space-y-12">
                {(p.steps || []).map((step, i) => (
                  <div key={i} className="relative flex gap-6" style={{ animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both` }}>
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-cpm-accent bg-cpm-bg-primary">
                      <svg className="h-4 w-4 text-cpm-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={iconSvgs[step.icon] || iconSvgs.circle} /></svg>
                    </div>
                    <div className="pt-1">
                      {step.date && <span className="mb-1 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-cpm-accent">{step.date}</span>}
                      <h3 className="mb-1 text-lg font-medium text-cpm-text-primary">{step.title}</h3>
                      <p className="text-sm leading-relaxed text-cpm-text-secondary">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </>
    );
  },
};
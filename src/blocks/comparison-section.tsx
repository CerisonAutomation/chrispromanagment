

export const ComparisonSection = {
  label: "Comparison Section",
  fields: {
    title: { type: "text" as const },
    columns: {
      type: "array" as const,
      label: "Columns",
      defaultItemProps: { heading: "Plan", description: "Plan description.", highlighted: "false" },
      getItemSummary: (item: Record<string, unknown>) => (item as { heading?: string }).heading || "Plan",
      arrayFields: {
        heading: { type: "text" as const },
        description: { type: "textarea" as const },
        highlighted: {
          type: "select" as const,
          label: "Highlight this column",
          options: [
            { label: "Yes", value: "true" },
            { label: "No", value: "false" },
          ],
        },
        features: {
          type: "array" as const,
          label: "Features",
          defaultItemProps: { text: "Feature", included: "true" },
          getItemSummary: (item: Record<string, unknown>) => (item as { text?: string }).text || "Feature",
          arrayFields: {
            text: { type: "text" as const },
            included: {
              type: "select" as const,
              options: [
                { label: "Included", value: "true" },
                { label: "Not Included", value: "false" },
              ],
            },
          },
        },
      },
    },
  },
  defaultProps: {
    title: "Compare Our Plans",
    columns: [
      {
        heading: "Starter",
        description: "For new property owners looking to get started with professional management.",
        highlighted: "false",
        features: [
          { text: "Basic Listing Setup", included: "true" },
          { text: "Dynamic Pricing", included: "true" },
          { text: "24/7 Guest Communication", included: "false" },
          { text: "Monthly Reports", included: "false" },
        ],
      },
      {
        heading: "Professional",
        description: "Our most popular plan for serious property investors.",
        highlighted: "true",
        features: [
          { text: "Full Listing Optimization", included: "true" },
          { text: "Dynamic Pricing Strategy", included: "true" },
          { text: "24/7 Guest Communication", included: "true" },
          { text: "Monthly Performance Reports", included: "true" },
        ],
      },
      {
        heading: "Premium",
        description: "The ultimate white-glove property management experience.",
        highlighted: "false",
        features: [
          { text: "Everything in Professional", included: "true" },
          { text: "Interior Design Consultation", included: "true" },
          { text: "Priority Maintenance", included: "true" },
          { text: "Dedicated Account Manager", included: "true" },
        ],
      },
    ],
  },
  render: (props: Record<string, unknown>) => {
    const p = props as {
      title: string;
      columns: {
        heading: string;
        description: string;
        highlighted: string;
        features: { text: string; included: string }[];
      }[];
    };
    return (
      <>
        <section className="bg-cpm-bg-primary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center" style={{ animation: "fadeInUp 0.6s ease-out" }}>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.title}</h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
            </div>
            {/* Horizontal scroll on mobile, grid on desktop */}
            <div className="-mx-4 overflow-x-auto px-4 pb-4 lg:overflow-visible lg:px-0 lg:pb-0">
              <div className="flex gap-6 lg:grid lg:grid-cols-3" style={{ minWidth: p.columns?.length ? `${p.columns.length * 320}px` : undefined }}>
                {(p.columns || []).map((col, i) => {
                  const isHighlighted = col.highlighted === "true";
                  return (
                    <div
                      key={i}
                      className={`relative min-w-[300px] flex-1 rounded-2xl p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 ${
                        isHighlighted
                          ? "shadow-[0_8px_40px_rgba(200,169,106,0.12)]"
                          : "hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
                      }`}
                      style={{
                        background: isHighlighted
                          ? "linear-gradient(135deg, rgba(200,169,106,0.12), rgba(200,169,106,0.04))"
                          : "linear-gradient(135deg, rgba(21,23,27,0.9), rgba(21,23,27,0.6))",
                        border: isHighlighted
                          ? "2px solid rgba(200,169,106,0.35)"
                          : "1px solid rgba(27,30,35,1)",
                        animation: `fadeInUp 0.6s ease-out ${i * 0.15}s both`,
                      }}
                    >
                      {/* Highlighted badge */}
                      {isHighlighted && (
                        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-cpm-accent/15 px-3 py-1">
                          <svg className="h-3.5 w-3.5 text-cpm-accent" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-xs font-semibold text-cpm-accent">Recommended</span>
                        </div>
                      )}
                      <h3
                        className={`mb-2 text-xl font-light ${isHighlighted ? "text-cpm-accent" : "text-cpm-text-primary"}`}
                        style={isHighlighted ? {
                          background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-text-primary))",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        } : undefined}
                      >
                        {col.heading}
                      </h3>
                      <p className="mb-6 text-sm leading-relaxed text-cpm-text-secondary">{col.description}</p>
                      {/* Features list */}
                      <div className="space-y-3">
                        {(col.features || []).map((feat, j) => (
                          <div key={j} className="flex items-center gap-3">
                            {feat.included === "true" ? (
                              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-gold-dark))" }}>
                                <svg className="h-3 w-3 text-cpm-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              </div>
                            ) : (
                              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cpm-text-tertiary/20">
                                <svg className="h-3 w-3 text-cpm-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </div>
                            )}
                            <span className={`text-sm ${feat.included === "true" ? "text-cpm-text-primary" : "text-cpm-text-tertiary"}`}>{feat.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </>
    );
  },
};
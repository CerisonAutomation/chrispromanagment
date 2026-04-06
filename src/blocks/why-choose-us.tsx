

export const WhyChooseUs = {
  label: "Why Choose Us",
  fields: {
    title: { type: "text" as const },
    items: {
      type: "array" as const,
      label: "Features",
      defaultItemProps: { title: "Feature", description: "Description", icon: "star" },
      getItemSummary: (item: Record<string, unknown>) => (item as { title?: string }).title || "Feature",
      arrayFields: {
        title: { type: "text" as const },
        description: { type: "textarea" as const },
        icon: { type: "text" as const, label: "Icon (lucide name)" },
      },
    },
  },
  defaultProps: {
    title: "Why Choose Us?",
    items: [
      {
        title: "Tailored Property Management",
        description: "Every property is unique. We create custom management strategies that maximise your rental income while preserving the character and condition of your property.",
        icon: "settings",
      },
      {
        title: "Expertise You Can Trust",
        description: "Our founder's background in international luxury hotel management means your property is managed to the highest hospitality standards. 9 years of Superhost status speaks for itself.",
        icon: "award",
      },
      {
        title: "Selective Portfolio",
        description: "We deliberately limit the number of properties we manage. This means each property receives our full attention, the highest quality of service, and personal dedication.",
        icon: "gem",
      },
      {
        title: "Comprehensive Services",
        description: "From dynamic pricing and 24/7 guest communication to professional cleaning and detailed monthly reports — we handle everything so you don't have to.",
        icon: "check-circle",
      },
    ],
  },
  render: (props: Record<string, unknown>) => {
    const p = props as {
      title: string;
      items: { title: string; description: string; icon: string }[];
    };
    return (
      <>
        <section className="relative bg-cpm-bg-primary px-4 py-20 sm:px-8 lg:py-32 overflow-hidden">
          {/* Subtle dot pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, var(--cpm-accent) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative mx-auto max-w-6xl">
            <div className="mb-16 text-center" style={{ animation: "fadeInUp 0.6s ease-out" }}>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">
                {p.title}
              </h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {(p.items || []).map((item, i) => (
                <div
                  key={i}
                  className="group relative rounded-2xl border border-cpm-border bg-cpm-bg-secondary p-6 transition-all duration-500 hover:-translate-y-1 hover:border-cpm-accent/30 hover:border-l-2 hover:border-l-cpm-accent hover:shadow-[0_8px_30px_rgba(200,169,106,0.08)]"
                  style={{ animation: `fadeInUp 0.6s ease-out ${i * 0.15}s both` }}
                >
                  {/* Gradient icon container */}
                  <div
                    className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl text-cpm-text-primary transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(200,169,106,0.2)]"
                    style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-gold-dark))" }}
                  >
                    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      {item.icon === "settings" && <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />}
                      {item.icon === "award" && <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.043 6.043 0 0 1-2.54.89m0 0c-.732.085-1.472.085-2.21 0" />}
                      {item.icon === "gem" && <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />}
                      {(item.icon === "check-circle" || !item.icon) && <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />}
                      {item.icon === "trending-up" && <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />}
                      {item.icon === "shield-check" && <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />}
                      {item.icon === "headphones" && <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 18.75a6 6 0 0 1 6-6v0a6 6 0 0 1 6 6v0a6 6 0 0 1-6 6H9.75a6 6 0 0 1-6-6Zm16.5 0V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v12.75" />}
                    </svg>
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-cpm-text-primary transition-colors duration-300 group-hover:text-cpm-accent">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-cpm-text-secondary">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  },
  ai: { instructions: "3-6 feature cards with concise titles (3-6 words) and short descriptions (under 200 chars). Use lucide icons: star, award, gem, check-circle, settings, shield, home, key. Focus on CPM differentiators." },
};
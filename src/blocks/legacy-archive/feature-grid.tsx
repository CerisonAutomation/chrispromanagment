

export const FeatureGrid = {
  label: "Feature Grid",
  fields: {
    title: { type: "text" as const },
    subtitle: { type: "textarea" as const },
    items: {
      type: "array" as const, label: "Features",
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
    title: "Why Malta?",
    subtitle: "The Mediterranean gem that offers an unbeatable combination of lifestyle, culture, and investment opportunity.",
    items: [
      { title: "300 Days of Sunshine", description: "Malta enjoys one of the highest sunshine counts in Europe, making it a year-round destination.", icon: "sun" },
      { title: "English Speaking", description: "English is an official language, making communication seamless for international guests and owners.", icon: "globe" },
      { title: "EU Member", description: "Malta is part of the European Union, offering stability and access to EU funding programmes.", icon: "flag" },
      { title: "Tax Benefits", description: "Favourable property tax structures and no capital gains tax on qualifying properties.", icon: "trending-up" },
      { title: "Strategic Location", description: "Central Mediterranean location with excellent flight connections across Europe and beyond.", icon: "plane" },
      { title: "Rich Heritage", description: "UNESCO World Heritage sites, ancient architecture, and a vibrant cultural scene.", icon: "landmark" },
    ],
  },
  render: (props: Record<string, unknown>) => {
    const p = props as { title: string; subtitle: string; items: { title: string; description: string; icon: string }[] };
    const icons: Record<string, string> = {
      sun: "M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z",
      globe: "M12 21a9.004 9.004 0 0 0 8.716 8.716 4.24 4.24 0 0 0-3.374-3.374M3 9.75c0 5.592 3.824 10.29 9 11.622 5.176 1.332 9 6.03 9 11.622M3.75 4.875c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125H9.75c-.621 0-1.125-.504-1.125-1.125v-9.75",
      flag: "M3 3v1.5M3 21v-6m0 0 2.25-2.25M3 16.5a2.25 2.25 0 0 1 2.25 2.25M21 16.5V6a2.25 2.25 0 0 0-2.25-2.25H9M21 16.5a2.25 2.25 0 0 1-2.25 2.25m0 0-1.5-1.5M15 3H9m12 16.5V3",
      "trending-up": "M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941",
      plane: "M6 12 3.75 3.75M6 12h12m-3.75 0 9 0 0 1-18 0 9 9 0 0 1 18 0Zm-9.75 0h.008v.008H6v-.008ZM6.75 15a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Zm14.25 0a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z",
      landmark: "M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
      shield: "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176 1.332 9 6.03 9 11.622Z",
      home: "m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
      star: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292Z",
      check: "M4.5 12.75l6 6 9-13.5",
    };
    return (
      <>
        <section className="bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.title}</h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
              {p.subtitle && <p className="mx-auto mt-4 max-w-2xl text-base text-cpm-text-secondary">{p.subtitle}</p>}
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(p.items || []).map((item, i) => (
                <div key={i} className="group rounded-2xl border border-cpm-border bg-cpm-bg-primary p-6 transition-all duration-500 hover:-translate-y-1 hover:border-cpm-accent/20 hover:shadow-[0_8px_30px_rgba(200,169,106,0.06)]" style={{ animation: `scaleIn 0.5s ease-out ${i * 0.08}s both` }}>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cpm-accent to-cpm-gold-dark text-cpm-bg-primary transition-transform duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(200,169,106,0.2)]">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d={icons[item.icon] || icons.star} /></svg>
                  </div>
                  <h3 className="mb-2 text-base font-medium text-cpm-text-primary transition-colors duration-300 group-hover:text-cpm-accent">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-cpm-text-secondary">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  },
  ai: { instructions: "Grid of feature cards with icons, titles, and descriptions. 3-6 items in responsive grid." },
};
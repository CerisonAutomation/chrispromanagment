import { PROP_1, PROP_2, PROP_3, PROP_VALLETTA, PROP_MADLIENA, PROP_GZIRA } from "./helpers";

export const PropertyShowcase = {
  label: "Property Showcase",
  fields: {
    title: { type: "text" as const },
    properties: {
      type: "array" as const,
      label: "Properties",
      defaultItemProps: { name: "Property", imageUrl: "", caption: "" },
      getItemSummary: (item: Record<string, unknown>) => (item as { name?: string }).name || "Property",
      arrayFields: {
        name: { type: "text" as const },
        imageUrl: { type: "text" as const, label: "Image URL" },
        caption: { type: "text" as const },
      },
    },
  },
  defaultProps: {
    title: "Discover Our Diverse Property Portfolio",
    properties: [
      { name: "Valletta Apartment 1", imageUrl: PROP_VALLETTA, caption: "2 Bed · 2 Bath · Sleeps 6" },
      { name: "Valletta Apartment 2", imageUrl: PROP_1, caption: "2 Bed · 2 Bath · Sleeps 4" },
      { name: "Bahar ic-Caghaq Villa", imageUrl: PROP_2, caption: "3 Bed · 3 Bath · Sleeps 6" },
      { name: "Madliena Event Space", imageUrl: PROP_MADLIENA, caption: "Unique Event Venue" },
      { name: "Pieta Apartment", imageUrl: PROP_3, caption: "2 Bed · 2 Bath · Sleeps 4" },
      { name: "Gzira Apartment", imageUrl: PROP_GZIRA, caption: "2 Bed · 2 Bath · Sleeps 4" },
    ],
  },
  render: (props: Record<string, unknown>) => {
    const p = props as {
      title: string;
      properties: { name: string; imageUrl: string; caption: string; price?: string; rating?: string; beds?: string; baths?: string; guests?: string }[];
    };
    // Add default prices/stats to properties that don't have them
    const propsWithDefaults = (p.properties || []).map((prop, i) => ({
      ...prop,
      price: prop.price || ["€189", "€169", "€229", "€350", "€159", "€149"][i] || "€189",
      rating: prop.rating || "4.9",
      beds: prop.beds || ["2", "2", "3", "4", "2", "2"][i] || "2",
      baths: prop.baths || ["2", "2", "3", "3", "2", "2"][i] || "2",
      guests: prop.guests || ["6", "4", "6", "8", "4", "4"][i] || "4",
    }));

    return (
      <>
        <section className="bg-cpm-bg-primary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center" style={{ animation: "fadeInUp 0.6s ease-out" }}>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.title}</h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {propsWithDefaults.map((prop, i) => (
                <div
                  key={i}
                  className={`group relative overflow-hidden rounded-2xl bg-cpm-bg-secondary transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:border-cpm-accent/20 border border-cpm-border ${
                    i === 0 ? "sm:col-span-2 lg:col-span-2" : ""
                  }`}
                  style={{ animation: `scaleIn 0.5s ease-out ${i * 0.08}s both` }}
                >
                  <div className={`relative overflow-hidden ${i === 0 ? "h-64 sm:h-80" : "h-64"}`}>
                    <img src={prop.imageUrl} alt={prop.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-cpm-bg-primary via-cpm-bg-primary/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-60" />
                    {/* Price badge */}
                    <div className="absolute top-4 right-4 rounded-full bg-cpm-accent px-3 py-1 text-xs font-bold text-cpm-bg-primary shadow-lg">
                      {prop.price}<span className="font-normal opacity-70">/night</span>
                    </div>
                    {/* Rating */}
                    <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-cpm-bg-primary/80 px-2.5 py-1 text-xs font-medium text-cpm-text-primary backdrop-blur-sm">
                      <svg className="h-3.5 w-3.5 text-cpm-accent" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      {prop.rating}
                    </div>
                    {/* Stats bar */}
                    <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 px-5 py-3">
                      <span className="flex items-center gap-1 text-xs text-cpm-text-primary/80">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
                        {prop.beds} Bed
                      </span>
                      <span className="flex items-center gap-1 text-xs text-cpm-text-primary/80">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                        {prop.baths} Bath
                      </span>
                      <span className="flex items-center gap-1 text-xs text-cpm-text-primary/80">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
                        {prop.guests}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="mb-1 text-lg font-medium text-cpm-text-primary">{prop.name}</h3>
                    <p className="text-sm text-cpm-accent">{prop.caption}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* CTA Button */}
            <div className="mt-10 text-center" style={{ animation: "fadeInUp 0.8s ease-out" }}>
              <a href="#book" className="group inline-flex items-center gap-2.5 rounded-xl border border-cpm-accent/30 bg-cpm-accent/5 px-8 py-3.5 text-sm font-medium text-cpm-accent transition-all duration-300 hover:bg-cpm-accent hover:text-cpm-bg-primary hover:shadow-[0_0_25px_rgba(200,169,106,0.15)] active:scale-[0.98]">
                View All Properties
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
              </a>
            </div>
          </div>
        </section>
      </>
    );
  },
};
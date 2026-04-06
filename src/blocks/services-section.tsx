import { safeHref } from "./helpers";

export const ServicesSection = {
  label: "Services Section",
  fields: {
    title: { type: "text" as const },
    services: {
      type: "array" as const,
      label: "Services",
      defaultItemProps: { name: "Service", included: "true" },
      getItemSummary: (item: Record<string, unknown>) => (item as { name?: string }).name || "Service",
      arrayFields: {
        name: { type: "text" as const },
        included: {
          type: "select" as const,
          options: [
            { label: "Included", value: "true" },
            { label: "Extra", value: "false" },
          ],
        },
      },
    },
    extras: {
      type: "array" as const,
      label: "Optional Extras",
      defaultItemProps: { name: "Extra", price: "" },
      getItemSummary: (item: Record<string, unknown>) => (item as { name?: string }).name || "Extra",
      arrayFields: {
        name: { type: "text" as const },
        price: { type: "text" as const },
      },
    },
    ctaText: { type: "text" as const, label: "CTA Text" },
    ctaLink: { type: "text" as const, label: "CTA Link" },
  },
  defaultProps: {
    title: "What We Offer",
    services: [
      { name: "Property Assessment", included: "true" },
      { name: "Essentials Checklist", included: "true" },
      { name: "Copywriting & Listing Creation", included: "true" },
      { name: "Dynamic Pricing Strategy", included: "true" },
      { name: "Guest Communication (24/7)", included: "true" },
      { name: "Custom Property Manuals", included: "true" },
      { name: "Payment Collection & Processing", included: "true" },
      { name: "Guest Stay Fulfillment", included: "true" },
      { name: "Airport & Port Transfers", included: "true" },
      { name: "Professional Cleaning", included: "true" },
      { name: "Laundry Service", included: "true" },
      { name: "Reviews Management", included: "true" },
      { name: "Maintenance Coordination", included: "true" },
      { name: "Monthly Performance Reports", included: "true" },
      { name: "Replenishing Consumables", included: "true" },
    ],
    extras: [
      { name: "Professional Photoshoot", price: "On request" },
      { name: "Deep Clean & Preparation", price: "On request" },
      { name: "MTA Licensing Assistance", price: "€350" },
      { name: "Procurement & Styling", price: "€25/hr" },
      { name: "Mail Handling Service", price: "€10/month" },
      { name: "Interior Design Consultation", price: "On request" },
    ],
    ctaText: "View Our Pricing Plans",
    ctaLink: "#pricing",
  },
  render: (props: Record<string, unknown>) => {
    const p = props as {
      title: string;
      services: { name: string; included: string }[];
      extras: { name: string; price: string }[];
      ctaText: string;
      ctaLink: string;
    };
    const included = (p.services || []).filter((s) => s.included === "true");
    return (
      <>
        <section className="bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center" style={{ animation: "fadeInUp 0.6s ease-out" }}>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">
                {p.title}
              </h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
            </div>
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Glassmorphism included card */}
              <div
                className="rounded-2xl border border-cpm-accent/10 p-8 backdrop-blur-xl"
                style={{ background: "linear-gradient(135deg, rgba(200,169,106,0.05), rgba(21,23,27,0.9))" }}
              >
                <h3
                  className="mb-2 text-lg font-semibold"
                  style={{
                    background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-text-primary))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Everything Included
                </h3>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-cpm-accent/10 px-3 py-1">
                  <span className="text-xs font-semibold text-cpm-accent">{included.length} Services Included</span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {included.map((service, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 transition-all duration-200 hover:translate-x-1"
                      style={{ animation: `slideUp 0.4s ease-out ${i * 0.03}s both` }}
                    >
                      <div
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                        style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-gold-dark))" }}
                      >
                        <svg className="h-3 w-3 text-cpm-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <span className="text-sm text-cpm-text-primary">{service.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                {/* Glassmorphism extras card */}
                <div
                  className="rounded-2xl border border-cpm-border p-8 backdrop-blur-xl"
                  style={{ background: "linear-gradient(135deg, rgba(21,23,27,0.9), rgba(21,23,27,0.6))" }}
                >
                  <h3 className="mb-6 text-lg font-medium text-cpm-text-secondary">Optional Extras</h3>
                  <div className="space-y-3">
                    {(p.extras || []).map((ex, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cpm-text-tertiary/20">
                            <svg className="h-3 w-3 text-cpm-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                            </svg>
                          </div>
                          <span className="text-sm text-cpm-text-secondary">{ex.name}</span>
                        </div>
                        <span className="text-sm font-medium text-cpm-accent">{ex.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {p.ctaText && (
                  <a
                    href={safeHref(p.ctaLink)}
                    className="group mt-6 inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-cpm-accent/30 bg-cpm-accent/5 px-6 py-3.5 text-sm font-medium text-cpm-accent transition-all duration-300 hover:bg-cpm-accent hover:text-cpm-bg-primary hover:shadow-[0_0_25px_rgba(200,169,106,0.15)] active:scale-[0.98]"
                  >
                    {p.ctaText}
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
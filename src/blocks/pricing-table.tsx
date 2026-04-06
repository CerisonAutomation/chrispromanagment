

export const PricingTable = {
  label: "Pricing Table",
  fields: {
    heading: { type: "text" as const },
  },
  defaultProps: {
    heading: "Transparent Pricing, Maximum Value",
  },
  render: (props: Record<string, unknown>) => {
    const p = props as { heading: string };
    const essentialsFeatures = [
      "Multi-channel listing management",
      "Superhost status maintenance",
      "Seasonal dynamic pricing",
      "Reviews management",
      "24/7 guest communication",
      "Guest check-in & check-out",
      "Professional cleaning",
      "Maintenance coordination",
      "Payment collection & processing",
      "Eco-tax & utility management",
      "Damage claims handling",
    ];
    const completeExtra = [
      "Welcome amenities package",
      "Custom guest property manual",
      "Comprehensive property assessment",
      "Monthly reports included (saves €420+/year)",
      "Quarterly property reviews",
      "Priority operations support",
      "Owner dashboard access",
      "24/7 dedicated support line",
      "Direct booking page setup",
    ];
    const availableExtras = [
      { name: "Professional Photoshoot", price: "On request" },
      { name: "Deep Clean & Prep", price: "On request" },
      { name: "MTA Licensing", price: "€350" },
      { name: "Procurement & Styling", price: "€25/hr" },
      { name: "Mail Handling", price: "€10/mo" },
      { name: "Interior Design Consult", price: "On request" },
    ];
    return (
      <>
        <section className="bg-cpm-bg-primary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center" style={{ animation: "fadeInUp 0.6s ease-out" }}>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">
                {p.heading}
              </h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Essentials Plan */}
              <div
                className="rounded-2xl border border-cpm-border bg-cpm-bg-secondary p-8 transition-all duration-500 hover:-translate-y-1 hover:border-cpm-accent/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
                style={{ animation: "fadeInUp 0.6s ease-out 0.1s both" }}
              >
                <h3 className="mb-2 text-2xl font-light text-cpm-text-primary">Essentials</h3>
                <p className="mb-4 text-xs text-cpm-text-tertiary">Approx. €80-€250/month depending on occupancy</p>
                <div className="mb-6">
                  <span className="text-4xl font-light text-cpm-accent">15%</span>
                  <span className="ml-2 text-sm text-cpm-text-secondary">of Net Room Revenue</span>
                </div>
                <div className="mb-8 space-y-3">
                  {essentialsFeatures.map((f, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div
                        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                        style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-gold-dark))" }}
                      >
                        <svg className="h-2.5 w-2.5 text-cpm-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <span className="text-sm text-cpm-text-secondary">{f}</span>
                    </div>
                  ))}
                </div>
                {/* Not included in Essentials */}
                <div className="mt-4 border-t border-cpm-border pt-4">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-cpm-text-tertiary">Add with Complete:</p>
                  <div className="space-y-2.5">
                    {["Welcome amenities package", "Custom property manual", "Comprehensive property assessment", "Monthly reports included", "Quarterly property reviews", "Priority operations support", "Owner dashboard access", "24/7 dedicated support", "Direct booking page"].map((f, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-cpm-text-tertiary/30">
                          <svg className="h-2.5 w-2.5 text-cpm-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                        </div>
                        <span className="text-xs text-cpm-text-tertiary">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-cpm-bg-primary p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-cpm-text-tertiary">Available Extras</p>
                  <div className="space-y-2 text-sm text-cpm-text-secondary">
                    <p>Monthly Reports: <span className="text-cpm-accent">€35/month</span></p>
                    <p>Callout Fee: <span className="text-cpm-accent">€20/visit</span></p>
                  </div>
                </div>
                <a href="#contact" className="mt-6 block w-full rounded-xl border border-cpm-accent/30 bg-transparent px-6 py-3 text-center text-sm font-medium text-cpm-accent transition-all duration-300 hover:bg-cpm-accent hover:text-cpm-bg-primary hover:shadow-[0_0_20px_rgba(200,169,106,0.15)] active:scale-[0.98]">
                  Get Started
                </a>
              </div>

              {/* Complete Plan — highlighted with gradient border */}
              <div
                className="relative rounded-2xl bg-cpm-bg-secondary transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(200,169,106,0.12)]"
                style={{
                  animation: "fadeInUp 0.6s ease-out 0.2s both",
                  padding: 0,
                }}
              >
                {/* Gradient border via outer wrapper */}
                <div
                  className="rounded-2xl p-8"
                  style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-gold-dark), var(--cpm-accent))" }}
                >
                  <div className="rounded-xl bg-cpm-bg-secondary p-6">
                    {/* Most Popular badge */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <span
                        className="inline-block rounded-full px-4 py-1 text-xs font-bold text-cpm-bg-primary shadow-lg"
                        style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-accent-hover))" }}
                      >
                        Most Popular
                      </span>
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-cpm-success/10 px-3 py-1 text-xs font-medium text-cpm-success">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" /></svg>
                      Save €420+/year vs Essentials
                    </div>
                    <h3 className="mb-2 text-2xl font-light text-cpm-text-primary">Complete</h3>
                    <div className="mb-6">
                      <span
                        className="text-4xl font-light"
                        style={{
                          background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-text-primary))",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        18%
                      </span>
                      <span className="ml-2 text-sm text-cpm-text-secondary">of Net Room Revenue</span>
                    </div>
                    <div className="mb-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-cpm-accent">Everything in Essentials, plus:</p>
                    </div>
                    <div className="mb-8 space-y-3">
                      {completeExtra.map((f, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div
                            className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                            style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-gold-dark))" }}
                          >
                            <svg className="h-2.5 w-2.5 text-cpm-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </div>
                          <span className="text-sm text-cpm-text-primary">{f}</span>
                        </div>
                      ))}
                    </div>
                    <a
                      href="#contact"
                      className="block w-full rounded-xl px-6 py-3 text-center text-sm font-semibold text-cpm-bg-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,169,106,0.3)] active:scale-[0.98]"
                      style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-accent-hover))" }}
                    >
                      Get Started
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Extras Row */}
            <div
              className="mt-12 rounded-2xl border border-cpm-border bg-cpm-bg-secondary p-8"
              style={{ animation: "fadeInUp 0.6s ease-out 0.3s both" }}
            >
              <h3 className="mb-6 text-center text-lg font-medium text-cpm-text-primary">Additional Services</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {availableExtras.map((ex, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-cpm-border bg-cpm-bg-primary px-4 py-3.5 transition-all duration-300 hover:border-cpm-accent/20 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                  >
                    <span className="text-sm text-cpm-text-secondary">{ex.name}</span>
                    <span className="text-sm font-medium text-cpm-accent">{ex.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </>
    );
  },
  ai: { instructions: "Show 2-3 pricing tiers with clear value differentiation. Highlight recommended plan with gold accent styling." },
};
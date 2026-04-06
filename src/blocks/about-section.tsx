import { ABOUT_IMG } from "@/lib/images";

export const AboutSection = {
  label: "About Section",
  fields: {
    title: { type: "text" as const },
    description: { type: "textarea" as const },
    imageUrl: { type: "text" as const, label: "Image URL" },
  },
  defaultProps: {
    title: "About Christiano Property Management",
    description: "Christiano Property Management is a luxury short-term rental management company operating across Malta. With over 9 years of Superhost experience on Airbnb and a background in international luxury hotel management, we bring a five-star standard to every property we manage.\n\nWe believe in transparent, honest partnerships with property owners. Our selective approach means we work with a limited portfolio, ensuring each property receives our undivided attention and the highest level of service.\n\nFrom dynamic pricing strategies and 24/7 guest communication to meticulous cleaning and monthly performance reports, we handle every aspect of your short-term rental so you can enjoy passive income without the hassle.",
    imageUrl: ABOUT_IMG,
  },
  render: (props: Record<string, unknown>) => {
    const p = props as { title: string; description: string; imageUrl: string };
    const paragraphs = (p.description || "").split("\n\n");
    return (
      <>
        <section className="bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row lg:items-start">
            <div className="relative w-full lg:w-1/2">
              <div className="group relative overflow-hidden rounded-2xl">
                <img
                  src={p.imageUrl || ABOUT_IMG}
                  alt="About Christiano Property Management"
                  className="h-[400px] w-full object-cover transition-transform duration-700 group-hover:scale-105 lg:h-[500px]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cpm-bg-secondary/50 to-transparent" />
              </div>
              {/* Floating decorative element */}
              <div
                className="absolute -bottom-6 -right-6 hidden h-28 w-28 border-2 border-cpm-accent/20 rounded-2xl bg-cpm-accent/5 backdrop-blur-sm lg:block"
                style={{ animation: "float 5s ease-in-out infinite" }}
              />
              <div
                className="absolute -top-4 -left-4 hidden h-16 w-16 rounded-full border border-cpm-accent/10 bg-cpm-accent/5 lg:block"
                style={{ animation: "float 7s ease-in-out infinite 1s" }}
              />
            </div>
            <div className="w-full lg:w-1/2 border-l-2 border-cpm-accent/30 pl-6 lg:pl-8">
              {/* Animated accent line */}
              <div
                className="mb-4 h-[2px] bg-gradient-to-r from-cpm-accent to-cpm-accent/20"
                style={{ animation: "expandWidth 0.8s ease-out forwards" }}
              />
              <h2 className="mb-6 font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl" style={{ animation: "fadeInUp 0.6s ease-out" }}>
                {p.title}
              </h2>
              <div className="space-y-5" style={{ animation: "fadeInUp 0.8s ease-out 0.2s both" }}>
                {paragraphs.map((para, i) => (
                  <p key={i} className="text-base leading-[1.8] text-cpm-text-secondary">
                    {para}
                  </p>
                ))}
              </div>
              {/* Mini stat highlights */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                  { value: "9+", label: "Years" },
                  { value: "50+", label: "Properties" },
                  { value: "4.9", label: "Rating" },
                ].map((s, i) => (
                  <div key={i} className="rounded-xl bg-cpm-bg-primary p-3 text-center">
                    <div className="text-lg font-light text-cpm-accent">{s.value}</div>
                    <div className="text-[10px] uppercase tracking-wider text-cpm-text-tertiary">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </>
    );
  },
  ai: { instructions: "Write 150-400 words about CPM luxury property management in Malta. Emphasize 9+ years Superhost experience, personal touch, local expertise. Use professional yet warm tone." },
};
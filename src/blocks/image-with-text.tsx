import { safeHref } from "./helpers";
import { IMG_9593 } from "./helpers";

export const ImageWithText = {
  label: "Image With Text",
  fields: {
    title: { type: "text" as const },
    description: { type: "textarea" as const },
    imageUrl: { type: "text" as const, label: "Image URL" },
    layout: {
      type: "select" as const,
      options: [
        { label: "Image Left", value: "image-left" },
        { label: "Image Right", value: "image-right" },
        { label: "Image Top", value: "image-top" },
      ],
    },
    buttonText: { type: "text" as const, label: "Button Text" },
    buttonLink: { type: "text" as const, label: "Button Link" },
    badge: { type: "text" as const, label: "Badge Text (optional)" },
  },
  defaultProps: {
    title: "Experience Malta Like a Local",
    description: "Our handpicked properties are located in Malta's most desirable neighborhoods, giving you authentic access to the island's rich culture, stunning beaches, and vibrant nightlife.",
    imageUrl: IMG_9593,
    layout: "image-left",
    buttonText: "Explore Properties",
    buttonLink: "#properties",
    badge: "Featured",
  },
  render: (props: Record<string, unknown>) => {
    const p = props as {
      title: string;
      description: string;
      imageUrl: string;
      layout: string;
      buttonText: string;
      buttonLink: string;
      badge: string;
    };
    const isReversed = p.layout === "image-right";
    const isTop = p.layout === "image-top";
    const paragraphs = (p.description || "").split("\n\n");

    const imageBlock = (
      <div className="group relative overflow-hidden rounded-2xl">
        <img
          src={p.imageUrl || IMG_9593}
          alt={p.title}
          className="h-[350px] w-full object-cover transition-transform duration-700 group-hover:scale-105 lg:h-[450px]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cpm-bg-primary/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
    );

    const textBlock = (
      <div className={isTop ? "" : isReversed ? "lg:order-first lg:border-l-2 lg:border-cpm-accent/30 lg:pl-6 lg:pr-0" : "lg:border-l-2 lg:border-cpm-accent/30 lg:pl-6"}>
        {/* Gold accent line */}
        <div
          className="mb-4 h-[2px] w-12 bg-gradient-to-r from-cpm-accent to-cpm-accent/20"
          style={{ animation: "expandWidth 0.8s ease-out forwards" }}
        />
        {/* Badge */}
        {p.badge && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cpm-accent/30 bg-cpm-accent/10 px-4 py-1.5 backdrop-blur-sm">
            <span className="text-xs font-semibold tracking-[0.12em] text-cpm-accent uppercase">{p.badge}</span>
          </div>
        )}
        <h2 className="mb-4 font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl" style={{ animation: "fadeInUp 0.6s ease-out" }}>
          {p.title}
        </h2>
        <div className="space-y-4" style={{ animation: "fadeInUp 0.8s ease-out 0.15s both" }}>
          {paragraphs.map((para, i) => (
            <p key={i} className="text-base leading-[1.8] text-cpm-text-secondary">{para}</p>
          ))}
        </div>
        {p.buttonText && (
          <div className="mt-6" style={{ animation: "fadeInUp 0.8s ease-out 0.3s both" }}>
            <a
              href={safeHref(p.buttonLink)}
              className="group inline-flex items-center gap-2.5 rounded-lg bg-cpm-accent px-8 py-3.5 text-sm font-semibold text-cpm-bg-primary transition-all duration-300 hover:bg-cpm-accent-hover hover:shadow-[0_0_30px_rgba(200,169,106,0.3)] active:scale-[0.98]"
            >
              {p.buttonText}
              <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        )}
      </div>
    );

    return (
      <>
        <section className="bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32">
          <div className={`mx-auto flex max-w-6xl flex-col items-center gap-12 ${isTop ? "" : "lg:flex-row"}`}>
            {imageBlock}
            {textBlock}
          </div>
        </section>
      </>
    );
  },
  ai: { instructions: "Image and text side-by-side layout. Support left/right/top positions. Optional badge and CTA. 100-300 words." },
};
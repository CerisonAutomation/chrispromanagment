import React from "react";

export const SocialProofStrip = {
  label: "Social Proof Strip",
  fields: {
    items: {
      type: "array" as const,
      label: "Metrics",
      defaultItemProps: { number: "100", label: "Metric", prefix: "", suffix: "+" },
      getItemSummary: (item: Record<string, unknown>) => `${(item as { number?: string }).number} ${(item as { label?: string }).label}`,
      arrayFields: {
        number: { type: "text" as const, label: "Metric Number" },
        label: { type: "text" as const },
        prefix: { type: "text" as const, label: "Prefix (e.g. $, €)" },
        suffix: { type: "text" as const, label: "Suffix (e.g. %, +)" },
      },
    },
  },
  defaultProps: {
    items: [
      { number: "4.9", label: "Average Rating", prefix: "", suffix: "★" },
      { number: "1000", label: "Happy Guests", prefix: "", suffix: "+" },
      { number: "98", label: "Response Rate", prefix: "", suffix: "%" },
      { number: "50", label: "Properties", prefix: "", suffix: "+" },
    ],
  },
  Component: (props: Record<string, unknown>) => {
    const p = props as {
      items: { number: string; label: string; prefix: string; suffix: string }[];
    };
    const [visible, setVisible] = React.useState(false);
    const [counts, setCounts] = React.useState<Record<string, number>>({});
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
      }, { threshold: 0.3 });
      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    }, []);

    React.useEffect(() => {
      if (!visible) return;
      const targets: Record<string, number> = {};
      (p.items || []).forEach((item, i) => {
        const numStr = item.number.replace(/[^0-9.]/g, "");
        targets[i] = parseFloat(numStr) || 0;
      });
      const duration = 2000;
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const updated: Record<string, number> = {};
        Object.entries(targets).forEach(([k, target]) => {
          updated[k] = Math.round(target * eased * 10) / 10;
        });
        setCounts(updated);
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, [visible, p.items]);

    const formatValue = (item: { number: string; prefix: string; suffix: string }, count: number) => {
      const hasDecimal = item.number.includes(".");
      const formatted = hasDecimal ? count.toFixed(1) : String(Math.round(count));
      return `${item.prefix || ""}${formatted}${item.suffix || ""}`;
    };

    return (
      <>
        <section ref={ref} className="relative bg-cpm-bg-primary px-4 py-16 sm:px-8 overflow-hidden">
          {/* Subtle background gradient */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ background: "radial-gradient(ellipse at center, var(--cpm-accent), transparent 60%)" }} />
          {/* Mobile: scrolling marquee */}
          <div className="lg:hidden">
            <div className="flex gap-0" style={{ animation: "marquee 20s linear infinite" }}>
              {/* Duplicate items for seamless scroll */}
              {[...(p.items || []), ...(p.items || [])].map((item, i) => (
                <div key={i} className="flex shrink-0 items-center gap-3 px-8">
                  <span
                    className="font-[family-name:var(--font-heading)] text-3xl font-light"
                    style={{
                      background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-text-primary))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {visible ? formatValue(item, counts[i % (p.items || []).length] || 0) : `${item.prefix || ""}${item.number}${item.suffix || ""}`}
                  </span>
                  <span className="text-sm text-cpm-text-secondary whitespace-nowrap">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Desktop: grid */}
          <div className="hidden lg:block">
            <div className="mx-auto grid max-w-6xl grid-cols-4 gap-0">
              {(p.items || []).map((item, i) => (
                <div key={i} className="group relative text-center" style={{ animation: `fadeInUp 0.6s ease-out ${i * 0.12}s both` }}>
                  {/* Number */}
                  <div
                    className="font-[family-name:var(--font-heading)] text-4xl font-light transition-transform duration-300 group-hover:scale-105"
                    style={{
                      background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-text-primary))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {visible ? formatValue(item, counts[i] || 0) : `${item.prefix || ""}${item.number}${item.suffix || ""}`}
                  </div>
                  {/* Gold separator line */}
                  <div className="mx-auto my-3 h-[2px] w-12 bg-gradient-to-r from-transparent via-cpm-accent/40 to-transparent transition-all duration-300 group-hover:w-16 group-hover:via-cpm-accent" />
                  {/* Label */}
                  <div className="text-sm text-cpm-text-secondary transition-colors duration-300 group-hover:text-cpm-text-primary">{item.label}</div>
                  {/* Right separator (except last) */}
                  {i < (p.items || []).length - 1 && (
                    <div className="absolute right-0 top-1/2 h-12 -translate-y-1/2 w-[1px] bg-gradient-to-b from-transparent via-cpm-accent/20 to-transparent" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  },
  ai: { instructions: "3-5 key metrics in horizontal strip. Use impressive numbers with labels: ratings, guests, response rate." },
};
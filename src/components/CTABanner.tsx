import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { useSectionContent } from "@/hooks/use-section-content";

interface CTABannerProps {
  onOpenWizard: () => void;
}

interface CTAContent {
  headline: string;
  highlightedWord: string;
  subtitle: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
}

interface BrandContent {
  email: string;
}

export default function CTABanner({ onOpenWizard }: CTABannerProps) {
  const prefersReduced = useReducedMotion();
  const { data: cta } = useSectionContent<CTAContent>("ctaBanner");
  const { data: brand } = useSectionContent<BrandContent>("brand");
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  if (!cta) return null;

  return (
    <section ref={ref} className="section-padding relative overflow-hidden">
      {/* Parallax gradient background */}
      <motion.div
        className="absolute inset-0"
        style={{ scale: prefersReduced ? 1 : bgScale }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </motion.div>

      <div className="section-container relative z-10">
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="font-serif font-semibold text-foreground mb-3">
            {cta.headline} <span className="gold-text">{cta.highlightedWord}</span>?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto text-sm">{cta.subtitle}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.button
              onClick={onOpenWizard}
              whileHover={prefersReduced ? {} : { scale: 1.03 }}
              whileTap={prefersReduced ? {} : { scale: 0.98 }}
              className="px-7 py-3.5 text-sm font-semibold bg-primary text-primary-foreground rounded hover:bg-gold-light transition-all hover:shadow-lg"
            >
              {cta.primaryCtaLabel}
            </motion.button>
            <a
              href={`mailto:${brand?.email || "info@christianopm.com"}`}
              className="px-7 py-3.5 text-sm font-medium text-foreground border border-border rounded hover:border-primary hover:text-primary transition-colors"
            >
              {cta.secondaryCtaLabel}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

import { motion, useReducedMotion } from "framer-motion";
import { siteBlueprint } from "@/lib/site-blueprint";

interface CTABannerProps {
  onOpenWizard: () => void;
}

export default function CTABanner({ onOpenWizard }: CTABannerProps) {
  const prefersReduced = useReducedMotion();

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
      <div className="section-container relative z-10">
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="font-serif font-semibold text-foreground mb-3">
            Ready to maximise your <span className="gold-text">rental income</span>?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto text-sm">
            Get a free property assessment and discover how much more your Malta property could earn with professional management.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenWizard}
              className="px-7 py-3.5 text-sm font-semibold bg-primary text-primary-foreground rounded hover:bg-gold-light transition-all hover:shadow-lg hover:scale-[1.02]"
            >
              Get Your Free Assessment
            </button>
            <a
              href={`mailto:${siteBlueprint.brand.email}`}
              className="px-7 py-3.5 text-sm font-medium text-foreground border border-border rounded hover:border-primary hover:text-primary transition-colors"
            >
              Email Us Directly
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

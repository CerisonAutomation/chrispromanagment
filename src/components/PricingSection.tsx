import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { useSectionContent } from "@/hooks/use-section-content";

interface PricingSectionProps {
  onOpenWizard: () => void;
}

interface PricingContent {
  id: string;
  eyebrow: string;
  title: string;
  highlightedWord: string;
  intro: string;
  plans: Array<{
    name: string;
    badge?: string;
    price: string;
    subtitle: string;
    tagline: string;
    features: string[];
  }>;
  additionalServicesTitle: string;
  additionalServices: Array<{ name: string; price: string }>;
  additionalNote: string;
}

export default function PricingSection({ onOpenWizard }: PricingSectionProps) {
  const prefersReduced = useReducedMotion();
  const { data: pricing } = useSectionContent<PricingContent>("pricing");

  if (!pricing) return null;

  return (
    <section id="pricing" className="section-padding">
      <div className="section-container">
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-14"
        >
          <p className="micro-type text-primary mb-2">{pricing.eyebrow}</p>
          <h2 className="font-serif font-semibold text-foreground">
            {pricing.title} <span className="gold-text">{pricing.highlightedWord}</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto text-sm">{pricing.intro}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5 sm:gap-6 max-w-4xl mx-auto">
          {pricing.plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={prefersReduced ? {} : { opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-5%" }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              whileHover={prefersReduced ? {} : { y: -4 }}
              className={`glass-surface rounded-lg p-6 sm:p-7 relative transition-all duration-300 ${plan.badge ? "border-primary/50 shadow-[var(--shadow-gold)]" : "hover:shadow-[var(--shadow-gold)]"}`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-6 micro-type px-3 py-1 bg-primary text-primary-foreground rounded-full text-[0.6rem]">
                  {plan.badge}
                </span>
              )}
              <h3 className="font-serif text-xl font-semibold text-foreground mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-primary">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.subtitle}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-5">{plan.tagline}</p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check size={14} className="text-primary flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <motion.button
                onClick={onOpenWizard}
                whileHover={prefersReduced ? {} : { scale: 1.02 }}
                whileTap={prefersReduced ? {} : { scale: 0.98 }}
                className={`w-full py-3 text-sm font-semibold rounded transition-colors ${plan.badge ? "bg-primary text-primary-foreground hover:bg-gold-light" : "border border-border text-foreground hover:border-primary hover:text-primary"}`}
              >
                Get Started
              </motion.button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 sm:mt-14 max-w-3xl mx-auto"
        >
          <h3 className="font-serif text-lg font-semibold text-foreground text-center mb-5">
            {pricing.additionalServicesTitle}
          </h3>
          <div className="glass-surface rounded-lg divide-y divide-border/50">
            {pricing.additionalServices.map((a) => (
              <div key={a.name} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-foreground">{a.name}</span>
                <span className="text-sm text-primary font-medium">{a.price}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-5 max-w-lg mx-auto leading-relaxed">
            {pricing.additionalNote}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

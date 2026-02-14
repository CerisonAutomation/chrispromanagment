import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { ClipboardCheck, Camera, Rocket } from "lucide-react";
import { siteBlueprint } from "@/lib/site-blueprint";

interface ProcessSectionProps {
  onOpenWizard: () => void;
}

const ICONS = [ClipboardCheck, Camera, Rocket];
const { process } = siteBlueprint;

export default function ProcessSection({ onOpenWizard }: ProcessSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [prefersReduced ? 0 : 20, prefersReduced ? 0 : -20]);

  return (
    <section id="process" ref={ref} className="section-padding">
      <div className="section-container">
        <motion.div style={{ y }} className="text-center mb-10 sm:mb-14">
          <motion.div
            initial={prefersReduced ? {} : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="micro-type text-primary mb-2">{process.eyebrow}</p>
            <h2 className="font-serif font-semibold text-foreground">
              {process.title} <span className="gold-text">{process.highlightedWord}</span>
            </h2>
          </motion.div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
          {process.steps.map((s, i) => {
            const Icon = ICONS[i] || ClipboardCheck;
            return (
              <motion.div
                key={s.step}
                initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="glass-surface rounded-lg p-6 relative group hover:border-primary/30 transition-colors"
              >
                <span className="absolute top-4 right-5 font-serif text-4xl font-bold text-border/50 group-hover:text-primary/20 transition-colors">
                  {s.step}
                </span>
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
                  <Icon size={18} className="text-primary" />
                </div>
                <h3 className="font-serif font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={prefersReduced ? {} : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8 sm:mt-10"
        >
          <button
            onClick={onOpenWizard}
            className="px-7 py-3.5 text-sm font-semibold bg-primary text-primary-foreground rounded hover:bg-gold-light transition-all hover:shadow-lg"
          >
            Start Your Free Assessment
          </button>
        </motion.div>
      </div>
    </section>
  );
}

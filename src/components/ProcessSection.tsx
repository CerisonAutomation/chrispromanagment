import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { ClipboardCheck, Camera, Rocket } from "lucide-react";
import { useSectionContent } from "@/hooks/use-section-content";

interface ProcessSectionProps {
  onOpenWizard: () => void;
}

interface ProcessContent {
  id: string;
  eyebrow: string;
  title: string;
  highlightedWord: string;
  steps: Array<{ step: string; title: string; body: string }>;
}

const ICONS = [ClipboardCheck, Camera, Rocket];

export default function ProcessSection({ onOpenWizard }: ProcessSectionProps) {
  const { data: process } = useSectionContent<ProcessContent>("process");
  const ref = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], [prefersReduced ? 0 : 30, prefersReduced ? 0 : -30]);

  if (!process) return null;

  return (
    <section id="process" ref={ref} className="section-padding relative overflow-hidden">
      {/* Subtle parallax background accent */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: bgY }}
      >
        <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-primary/3 blur-3xl" />
      </motion.div>

      <div className="section-container relative z-10">
        <motion.div className="text-center mb-10 sm:mb-14">
          <motion.div
            initial={prefersReduced ? {} : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
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
                initial={prefersReduced ? {} : { opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-5%" }}
                transition={{ delay: i * 0.15, duration: 0.5, ease: "easeOut" }}
                className="glass-surface rounded-lg p-6 relative group hover:border-primary/30 transition-all duration-300 hover:shadow-[var(--shadow-gold)]"
              >
                <span className="absolute top-4 right-5 font-serif text-4xl font-bold text-border/50 group-hover:text-primary/20 transition-colors">
                  {s.step}
                </span>
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <Icon size={18} className="text-primary" />
                </div>
                <h3 className="font-serif font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
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

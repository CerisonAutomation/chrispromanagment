import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { useSectionContent } from "@/hooks/use-section-content";

interface AboutSectionProps {
  onOpenWizard: () => void;
}

interface AboutContent {
  id: string;
  eyebrow: string;
  title: string;
  highlightedWord: string;
  body: string[];
  credentials: string[];
}

const CREDENTIAL_VALUES = ["9+", "45+", "€2.4M+", "4.97"];
const CREDENTIAL_LABELS = ["Years Superhost Experience", "Properties Managed", "Revenue Generated", "Average Guest Rating"];

export default function AboutSection({ onOpenWizard }: AboutSectionProps) {
  const { data: about } = useSectionContent<AboutContent>("about");
  const ref = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], [prefersReduced ? 0 : 20, prefersReduced ? 0 : -20]);
  const cardsY = useTransform(scrollYProgress, [0, 1], [prefersReduced ? 0 : 30, prefersReduced ? 0 : -10]);

  if (!about) return null;

  return (
    <section id="about" ref={ref} className="section-padding bg-card/30 relative overflow-hidden">
      <div className="section-container w-full relative z-10">
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          className="text-center mb-12"
        >
          <p className="micro-type text-primary mb-3">{about.eyebrow}</p>
          <h2 className="font-serif font-semibold text-foreground">
            {about.title} <span className="gold-text">{about.highlightedWord}</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <motion.div
            style={{ y: textY }}
            className="space-y-5 text-sm text-muted-foreground leading-relaxed"
          >
            {about.body.map((p, i) => (
              <motion.p
                key={i}
                initial={prefersReduced ? {} : { opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                {p}
              </motion.p>
            ))}
            <motion.button
              onClick={onOpenWizard}
              whileHover={prefersReduced ? {} : { scale: 1.03 }}
              whileTap={prefersReduced ? {} : { scale: 0.98 }}
              className="mt-2 px-6 py-3 text-sm font-semibold bg-primary text-primary-foreground rounded hover:bg-gold-light transition-colors"
            >
              Get In Touch
            </motion.button>
          </motion.div>

          <motion.div
            style={{ y: cardsY }}
            className="grid grid-cols-2 gap-4"
          >
            {CREDENTIAL_VALUES.map((value, i) => (
              <motion.div
                key={i}
                initial={prefersReduced ? {} : { opacity: 0, y: 20, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                whileHover={prefersReduced ? {} : { y: -3 }}
                className="glass-surface rounded-lg p-5 text-center hover:border-primary/30 transition-all duration-300 hover:shadow-[var(--shadow-gold)]"
              >
                <p className="text-2xl font-serif font-bold text-primary">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{CREDENTIAL_LABELS[i]}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import portfolio1 from "@/assets/portfolio-1.jpg";
import portfolio2 from "@/assets/portfolio-2.jpg";
import portfolio3 from "@/assets/portfolio-3.jpg";
import { ExternalLink } from "lucide-react";
import { useSectionContent } from "@/hooks/use-section-content";

const IMAGES = [portfolio1, portfolio2, portfolio3];

interface PortfolioCard {
  name: string;
  location: string;
  type: string;
  meta: string;
  rating: string;
  externalUrl: string;
}

interface PortfolioContent {
  id: string;
  eyebrow: string;
  title: string;
  highlightedWord: string;
  cards: PortfolioCard[];
  primaryCta: { label: string; href: string; variant?: string; external?: boolean; subtext?: string };
}

export default function PortfolioSection() {
  const prefersReduced = useReducedMotion();
  const { data: portfolio } = useSectionContent<PortfolioContent>("portfolio");
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], [20, -20]);

  if (!portfolio) return null;

  return (
    <section id="portfolio" ref={ref} className="section-padding bg-card/30 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: prefersReduced ? 0 : bgY }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </motion.div>

      <div className="section-container relative z-10">
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          className="text-center mb-10 sm:mb-14"
        >
          <p className="micro-type text-primary mb-2">{portfolio.eyebrow}</p>
          <h2 className="font-serif font-semibold text-foreground">
            {portfolio.title} <span className="gold-text">{portfolio.highlightedWord}</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {portfolio.cards.map((p, i) => (
            <motion.a
              key={p.name}
              href={p.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={prefersReduced ? {} : { opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-5%" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={prefersReduced ? {} : { y: -4 }}
              className="group glass-surface rounded-lg overflow-hidden hover:border-primary/30 transition-all duration-300 cursor-pointer block hover:shadow-[var(--shadow-gold)]"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <motion.img
                  src={IMAGES[i % IMAGES.length]}
                  alt={p.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  whileHover={prefersReduced ? {} : { scale: 1.08 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-3">
                  <ExternalLink size={16} className="text-primary" />
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="font-serif text-base font-semibold text-foreground">{p.name}</h3>
                  <span className="text-sm font-medium text-primary">★ {p.rating}</span>
                </div>
                <p className="text-xs text-muted-foreground">{p.location} · {p.meta}</p>
              </div>
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={prefersReduced ? {} : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8 sm:mt-10"
        >
          <a
            href={portfolio.primaryCta.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3 text-sm font-semibold border border-border text-foreground rounded hover:border-primary hover:text-primary transition-colors"
          >
            {portfolio.primaryCta.label} <ExternalLink size={14} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

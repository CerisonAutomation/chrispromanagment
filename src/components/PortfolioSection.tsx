import { motion, useReducedMotion } from "framer-motion";
import portfolio1 from "@/assets/portfolio-1.jpg";
import portfolio2 from "@/assets/portfolio-2.jpg";
import portfolio3 from "@/assets/portfolio-3.jpg";
import { ExternalLink } from "lucide-react";
import { siteBlueprint } from "@/lib/site-blueprint";

const IMAGES = [portfolio1, portfolio2, portfolio3];
const { portfolio } = siteBlueprint;

export default function PortfolioSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section id="portfolio" className="section-padding bg-card/30">
      <div className="section-container">
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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
              initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group glass-surface rounded-lg overflow-hidden hover:border-primary/30 transition-colors cursor-pointer block"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={IMAGES[i]}
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3">
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

        <div className="text-center mt-8 sm:mt-10">
          <a
            href={portfolio.primaryCta.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3 text-sm font-semibold border border-border text-foreground rounded hover:border-primary hover:text-primary transition-colors"
          >
            {portfolio.primaryCta.label} <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}

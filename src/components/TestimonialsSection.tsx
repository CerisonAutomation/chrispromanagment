import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { useSectionContent } from "@/hooks/use-section-content";

interface TestimonialItem {
  name: string;
  date: string;
  rating: number;
  quote: string;
}

interface TestimonialsContent {
  id: string;
  eyebrow: string;
  title: string;
  highlightedWord: string;
  items: TestimonialItem[];
}

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const prefersReduced = useReducedMotion();
  const { data: testimonials } = useSectionContent<TestimonialsContent>("testimonials");

  if (!testimonials) return null;

  const items = testimonials.items || [];
  const perPage = 3;
  const maxIndex = Math.max(0, Math.ceil(items.length / perPage) - 1);
  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(maxIndex, c + 1));
  const visible = items.slice(current * perPage, current * perPage + perPage);

  return (
    <section id="testimonials" className="section-padding">
      <div className="section-container w-full">
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          className="text-center mb-10 sm:mb-14"
        >
          <p className="micro-type text-primary mb-3">{testimonials.eyebrow}</p>
          <h2 className="font-serif font-semibold text-foreground">
            {testimonials.title} <span className="gold-text">{testimonials.highlightedWord}</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {visible.map((t, i) => (
              <motion.div
                key={`${current}-${i}`}
                initial={prefersReduced ? {} : { opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={prefersReduced ? {} : { opacity: 0, y: -10, scale: 0.95 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                whileHover={prefersReduced ? {} : { y: -3 }}
                className="glass-surface rounded-lg p-6 flex flex-col hover:border-primary/30 transition-all duration-300 hover:shadow-[var(--shadow-gold)]"
              >
                <Quote size={20} className="text-primary/30 mb-3" />
                <div className="flex items-center gap-0.5 mb-3">
                  {Array.from({ length: t.rating || 5 }).map((_, s) => (
                    <Star key={s} size={12} className="text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{t.quote}</p>
                <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">{t.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.date}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {maxIndex > 0 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button onClick={prev} disabled={current === 0} className="p-2 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors" aria-label="Previous testimonials">
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-1.5">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-primary" : "bg-border"}`} aria-label={`Page ${i + 1}`} />
              ))}
            </div>
            <button onClick={next} disabled={current === maxIndex} className="p-2 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors" aria-label="Next testimonials">
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

import { motion, useReducedMotion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { siteBlueprint } from "@/lib/site-blueprint";

const { faq } = siteBlueprint;

export default function FAQSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section id="faq" className="section-padding bg-card/30">
      <div className="section-container max-w-3xl">
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <p className="micro-type text-primary mb-2">{faq.eyebrow}</p>
          <h2 className="font-serif font-semibold text-foreground">
            {faq.title} <span className="gold-text">{faq.highlightedWord}</span>
          </h2>
        </motion.div>

        <Accordion type="single" collapsible className="space-y-2.5">
          {faq.items.map((item, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="glass-surface rounded-lg px-5 border border-border/50 data-[state=open]:border-primary/30"
            >
              <AccordionTrigger className="text-left font-serif text-sm sm:text-base font-medium text-foreground hover:text-primary py-4 hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

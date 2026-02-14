import { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  { name: "Katie", date: "October 2024", text: "Christiano was an amazing host and the apartment was flawless. From the slippers to the birthday wine for my husband, everything was spot on. The location and apartment were perfect, and we were very happy!" },
  { name: "Eric", date: "October 2024", text: "Christiano is a gracious, proactive host who made sure I had all the information I needed. The apartment had everything we needed, and Christiano's communication was excellent. I couldn't have been happier!" },
  { name: "Sheldon", date: "September 2024", text: "Christiano was always on hand to help with any queries and was extremely responsive. I'd definitely recommend it to anyone looking to stay somewhere central, walkable, and clean!" },
  { name: "Anna", date: "September 2024", text: "The host is nice and helpful! The apartment is modern, clean, cozy, and fully equipped. Perfect location, close to the beach and Valletta. A lovely experience with everything we needed!" },
  { name: "Mikayla", date: "August 2024", text: "Christiano was the best! Very responsive and helpful. The apartment was clean, and the AC was a huge plus. I definitely recommend this place to anyone visiting during the summer!" },
  { name: "Miranda", date: "August 2024", text: "We loved the apartment—spacious, clean, and felt like home. Perfect size for our family of four. Ideally located for seeing Valletta. My daughter wanted to move in forever!" },
  { name: "Molly", date: "August 2024", text: "Lovely apartment in a great central location. Spacious bedroom, kitchen, and living space with appreciated AC. Check-in information was prompt and detailed, enhancing our stay in Malta." },
  { name: "David & Pennie", date: "April 2024", text: "Christiano was a good, responsive host and the apartment was perfect for two couples. It was very clean and had all the mod cons you would expect. I would return and recommend to future travelers." },
  { name: "Raquel", date: "March 2024", text: "The Host is very attentive and always available. We had a great time with the family, and the apartment was very nice and spacious for families." },
  { name: "Kate", date: "April 2024", text: "Christiano is extremely personable and relaxed, and supremely helpful. We'll be back if we can. The flat was bigger than it looks, extremely well equipped, and full of thoughtful touches like the washable slippers and marshmallows!" },
];

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);

  const perPage = 3;
  const maxIndex = Math.ceil(TESTIMONIALS.length / perPage) - 1;
  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(maxIndex, c + 1));
  const visible = TESTIMONIALS.slice(current * perPage, current * perPage + perPage);

  return (
    <section id="testimonials" ref={ref} className="min-h-screen flex items-center py-20 sm:py-28">
      <div className="section-container w-full">
        <motion.div style={{ y }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="micro-type text-primary mb-3">Testimonials</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground">
              What our <span className="gold-text">guests</span> say
            </h2>
            <p className="text-muted-foreground mt-4 max-w-md mx-auto">
              All 5-star reviews from verified guests across our managed properties.
            </p>
          </motion.div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((t, i) => (
            <motion.div
              key={`${current}-${i}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-surface rounded-lg p-6 flex flex-col hover:border-primary/30 transition-colors"
            >
              <Quote size={20} className="text-primary/30 mb-3" />
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} size={12} className="text-primary fill-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                {t.text}
              </p>
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
        </div>

        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            onClick={prev}
            disabled={current === 0}
            className="p-2 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous testimonials"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-1.5">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-primary" : "bg-border"}`}
                aria-label={`Page ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            disabled={current === maxIndex}
            className="p-2 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next testimonials"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

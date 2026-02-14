import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface AboutSectionProps {
  onOpenWizard: () => void;
}

const CREDENTIALS = [
  { value: "9+", label: "Years Superhost Experience" },
  { value: "45+", label: "Properties Managed" },
  { value: "€2.4M+", label: "Revenue Generated" },
  { value: "4.97", label: "Average Guest Rating" },
];

export default function AboutSection({ onOpenWizard }: AboutSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section id="about" ref={ref} className="min-h-screen flex items-center py-20 sm:py-28 bg-card/30">
      <div className="section-container w-full">
        <motion.div style={{ y }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="micro-type text-primary mb-3">About Us</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground">
              About Christiano <span className="gold-text">Property Management</span>
            </h2>
          </motion.div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-5 text-sm text-muted-foreground leading-relaxed"
          >
            <p>
              At Christiano Property Management, we specialize in managing properties across Malta,
              one of the Mediterranean's most sought-after destinations.
            </p>
            <p>
              From cozy apartments to luxurious villas and palazzos, we offer tailored management
              solutions that maximize both guest satisfaction and property performance. With over 9
              years of hosting experience in Malta, we understand the unique appeal of the island and
              how to make your property stand out in this competitive market.
            </p>
            <p>
              Our team takes care of everything, from dynamic pricing strategies and 24/7 guest
              communication to professional cleaning and regular maintenance. We believe in
              transparency and provide detailed monthly reports so property owners are always in the loop.
            </p>
            <p>
              Whether you're a seasoned host or new to the vacation rental market, our goal is to make
              property management hassle-free while optimizing your property's potential. With
              Christiano Property Management, you can trust that your property is in expert hands.
            </p>
            <button
              onClick={onOpenWizard}
              className="mt-2 px-6 py-3 text-sm font-semibold bg-primary text-primary-foreground rounded hover:bg-gold-light transition-colors"
            >
              Get In Touch
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {CREDENTIALS.map((c) => (
              <div
                key={c.label}
                className="glass-surface rounded-lg p-5 text-center hover:border-primary/30 transition-colors"
              >
                <p className="text-2xl font-serif font-bold text-primary">{c.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

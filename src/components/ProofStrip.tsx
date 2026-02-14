import { motion, useReducedMotion } from "framer-motion";
import { Shield, BarChart3, Clock, Star } from "lucide-react";
import { siteBlueprint } from "@/lib/site-blueprint";

const ICON_MAP: Record<string, typeof Shield> = {
  shield: Shield,
  chart: BarChart3,
  clock: Clock,
  star: Star,
};

export default function ProofStrip() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="py-8 sm:py-10 border-y border-border bg-card/50">
      <div className="section-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {siteBlueprint.proofStrip.map((p, i) => {
            const Icon = ICON_MAP[p.icon] || Shield;
            return (
              <motion.div
                key={p.label}
                initial={prefersReduced ? {} : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
                className="flex items-center gap-3"
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                  <Icon size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{p.label}</p>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

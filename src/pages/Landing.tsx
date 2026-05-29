import { Link } from "react-router-dom";
import { ArrowRight, Building2, MapPin, ShieldCheck, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/shared/PageShell";
import { useCmsContent } from "@/hooks/use-cms-content";
import { StatsBarSkeleton, TestimonialSkeleton } from "@/components/skeletons";

// ─── Icon registry ────────────────────────────────────────────────────────────
const ICONS: Record<string, React.ElementType> = { Building2, MapPin, ShieldCheck };

// ─── CMS shapes + typed defaults ─────────────────────────────────────────────
interface HeroCms       { badge: string; headline: string; headline_accent: string; body: string; cta_primary: string; cta_secondary: string }
interface FeatureItem   { icon: string; label: string; value: string }
interface FeaturesCms   { items: FeatureItem[] }
interface StatItem      { value: string; label: string }
interface StatsCms      { items: StatItem[] }
interface TestimonialItem { quote: string; author: string; origin: string }
interface TestimonialsCms { headline: string; items: TestimonialItem[] }

const HERO_DEF: HeroCms = { badge: "Now booking summer 2026 in Malta", headline: "Luxury stays,", headline_accent: "effortlessly managed.", body: "Boutique short-let properties across Malta, run by humans who care. Direct booking, real concierge, owners who actually sleep at night.", cta_primary: "Browse stays", cta_secondary: "List your property" };
const FEATURES_DEF: FeaturesCms = { items: [{ icon: "Building2", label: "Curated portfolio", value: "Hand-picked villas" }, { icon: "MapPin", label: "Local team", value: "Based in Valletta" }, { icon: "ShieldCheck", label: "Real concierge", value: "Available 24/7" }] };
const STATS_DEF: StatsCms = { items: [{ value: "50+", label: "Properties managed" }, { value: "98%", label: "Guest satisfaction" }, { value: "€2M+", label: "Owner payouts" }, { value: "4 yrs", label: "In the market" }] };
const TESTIMONIALS_DEF: TestimonialsCms = { headline: "Guests love staying with us", items: [{ quote: "Spotless apartment, great location, and the team sorted everything before we even asked. Best Malta trip we've had.", author: "Sarah T.", origin: "London" }, { quote: "Christiano's team handled check-in at midnight with zero fuss. Would not stay anywhere else in Malta.", author: "Marco B.", origin: "Milan" }, { quote: "Beautiful penthouse, stunning views. The concierge even booked us a boat tour. Absolute 10/10.", author: "Anna K.", origin: "Berlin" }] };

const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay } });
const stagger = (i: number) => ({ initial: { opacity: 0, y: 12 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: i * 0.07 } });

export default function Landing() {
  const { get, loading } = useCmsContent();
  const hero         = get<HeroCms>("landing__hero", HERO_DEF);
  const features     = get<FeaturesCms>("landing__features", FEATURES_DEF);
  const stats        = get<StatsCms>("landing__stats", STATS_DEF);
  const testimonials = get<TestimonialsCms>("landing__testimonials", TESTIMONIALS_DEF);

  return (
    <PageShell>
      {/* Hero */}
      <section className="container grid min-h-[calc(100vh-5rem)] items-center pb-16 pt-8">
        <motion.div {...fadeUp()} className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            {hero.badge}
          </div>
          <h1 className="text-5xl leading-[1.05] md:text-7xl text-balance">
            {hero.headline}<br />
            <span className="bg-gradient-gold bg-clip-text text-transparent">{hero.headline_accent}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground text-pretty">{hero.body}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button asChild size="lg" variant="gold">
              <Link to="/booking">{hero.cta_primary} <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/owners">{hero.cta_secondary}</Link>
            </Button>
          </div>

          {/* Feature chips */}
          <div className="mt-16 grid max-w-2xl gap-4 sm:grid-cols-3">
            {features.items.map((f) => {
              const Icon = ICONS[f.icon] ?? Building2;
              return (
                <motion.div key={f.label} {...stagger(0)} className="glass rounded-xl p-4">
                  <Icon className="mb-3 h-5 w-5 text-gold" />
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{f.label}</div>
                  <div className="mt-1 text-sm font-medium">{f.value}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      {loading ? <StatsBarSkeleton /> : (
        <section className="border-y border-border/40 bg-card/20 backdrop-blur">
          <div className="container grid grid-cols-2 gap-px py-10 sm:grid-cols-4">
            {stats.items.map((s, i) => (
              <motion.div key={s.label} {...stagger(i)} className="px-6 text-center">
                <div className="font-display text-3xl text-gold">{s.value}</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="container py-24">
        <h2 className="mb-12 text-3xl md:text-4xl">{testimonials.headline}</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <TestimonialSkeleton key={i} />)
            : testimonials.items.map((t, i) => (
                <motion.div key={t.author} {...stagger(i)} className="glass rounded-xl p-6">
                  <div className="mb-4 flex gap-0.5">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-4 w-4 fill-gold text-gold" />)}</div>
                  <p className="text-sm leading-relaxed text-muted-foreground text-pretty">"{t.quote}"</p>
                  <div className="mt-4 text-sm font-medium">{t.author}</div>
                  <div className="text-xs text-muted-foreground">{t.origin}</div>
                </motion.div>
              ))
          }
        </div>
      </section>
    </PageShell>
  );
}

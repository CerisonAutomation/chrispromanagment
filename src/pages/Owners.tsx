/**
 * /owners — Property owner services page.
 * Hero (dark) + Process + Pricing + Credentials + FAQ + CTA
 */
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, ClipboardCheck, Camera, Rocket, TrendingUp, Shield, Star, Award } from "lucide-react";
import Layout from "@/components/Layout";
import { useWizard } from "@/components/Layout";
import ScrollSection from "@/components/ScrollSection";
import ownersHeroBg from "@/assets/owners-hero.jpg";
import { siteBlueprint } from "@/lib/site-blueprint";

/* ─── Owner Hero ─── */
function OwnerHero() {
  const ref = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();
  const { openWizard } = useWizard();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, prefersReduced ? 0 : 90]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.18]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -40]);

  const { stats } = siteBlueprint;

  return (
    <section ref={ref} className="relative flex flex-col justify-end overflow-hidden h-[100dvh]" style={{ paddingTop: "var(--header-height)" }}>
      {/* Parallax bg */}
      <motion.div className="absolute inset-0 parallax-bg" style={{ y: imgY }}>
        <motion.img
          src={ownersHeroBg}
          alt="Luxury Malta palazzo at night"
          className="w-full h-full object-cover"
          style={{ scale: imgScale }}
        />
        {/* Dark overlay with gold vignette */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, hsla(220,20%,2%,0.92) 0%, hsla(220,20%,4%,0.72) 50%, hsla(220,20%,4%,0.6) 100%)" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </motion.div>

      <motion.div style={{ opacity: contentOpacity, y: contentY }} className="section-container relative z-10 w-full pb-8 sm:pb-12">
        {/* Badge */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10 backdrop-blur-sm"
        >
          <Shield size={11} className="text-primary" />
          <span className="micro-type text-primary text-[0.6rem]">OWNER SERVICES · MTA LICENSED OPERATOR</span>
        </motion.div>

        <motion.h1
          className="font-serif font-bold text-foreground mb-4 max-w-2xl"
          initial={prefersReduced ? {} : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          Institutional-grade
          <br />
          <span className="gold-text">property stewardship</span>
        </motion.h1>

        <motion.p
          className="text-muted-foreground mb-7 max-w-lg"
          style={{ fontSize: "clamp(0.95rem, 0.85rem + 0.4vw, 1.2rem)" }}
          initial={prefersReduced ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Maximize your asset's performance through our proprietary operational protocols. Professional stewardship for Malta's most distinguished portfolios.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-3"
          initial={prefersReduced ? {} : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <button
            onClick={openWizard}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold bg-primary text-primary-foreground rounded hover:bg-gold-light transition-all hover:shadow-lg hover:scale-[1.02]"
          >
            Initialize Management
            <ArrowRight size={15} />
          </button>
          <a
            href="#process"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-medium text-foreground border border-border rounded hover:border-primary hover:text-primary transition-colors"
          >
            How It Works
          </a>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-5"
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={prefersReduced ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 + i * 0.08 }}
              className="text-left"
            >
              <p className="text-2xl sm:text-3xl font-serif font-bold text-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─── Why Christiano ─── */
function WhySection() {
  const prefersReduced = useReducedMotion();
  const badges = siteBlueprint.metricsTwo.trustBadges;

  return (
    <section className="min-h-[100dvh] flex flex-col justify-center section-padding py-10 sm:py-14">
      <div className="section-container">
        <motion.div
          className="text-center mb-8 sm:mb-10"
          initial={prefersReduced ? {} : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="micro-type text-primary mb-2">{siteBlueprint.metricsTwo.eyebrow}</p>
          <h2 className="font-serif font-semibold text-foreground">
            Unrivaled results, <span className="gold-text">unwavering trust</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
          {badges.map((b, i) => (
            <motion.div
              key={b.title}
              initial={prefersReduced ? {} : { opacity: 0, y: 24, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-5%" }}
              transition={{ delay: i * 0.07 }}
              whileHover={prefersReduced ? {} : { y: -4 }}
              className="glass-surface rounded-xl p-5 flex flex-col gap-2 hover:border-primary/30 hover:shadow-[var(--shadow-gold)] transition-all duration-300"
            >
              <span className="text-2xl">{b.icon}</span>
              <p className="text-sm font-semibold text-foreground">{b.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{b.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Process ─── */
function OwnerProcess() {
  const prefersReduced = useReducedMotion();
  const { openWizard } = useWizard();
  const { process } = siteBlueprint;
  const ICONS = [ClipboardCheck, Camera, Rocket];

  return (
    <section id="process" className="min-h-[100dvh] flex flex-col justify-center section-padding py-10 sm:py-14 bg-card/30 border-t border-border">
      <div className="section-container">
        <motion.div
          className="text-center mb-8 sm:mb-10"
          initial={prefersReduced ? {} : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="micro-type text-primary mb-2">{process.eyebrow}</p>
          <h2 className="font-serif font-semibold text-foreground">
            {process.title} <span className="gold-text">{process.highlightedWord}</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 sm:gap-6 mb-8">
          {process.steps.map((s, i) => {
            const Icon = ICONS[i] || ClipboardCheck;
            return (
              <motion.div
                key={s.step}
                initial={prefersReduced ? {} : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-surface rounded-xl p-6 relative group hover:border-primary/30 hover:shadow-[var(--shadow-gold)] transition-all duration-300"
              >
                <span className="absolute top-4 right-5 font-serif text-5xl font-bold text-border/40 group-hover:text-primary/20 transition-colors">
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

        <div className="text-center">
          <button
            onClick={openWizard}
            className="inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold bg-primary text-primary-foreground rounded hover:bg-gold-light transition-all hover:shadow-lg"
          >
            Start Free Assessment
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ─── */
function OwnerPricing() {
  const prefersReduced = useReducedMotion();
  const { openWizard } = useWizard();
  const { pricing } = siteBlueprint;

  return (
    <section id="pricing" className="min-h-[100dvh] flex flex-col justify-center section-padding py-10 sm:py-14">
      <div className="section-container">
        <motion.div
          className="text-center mb-8"
          initial={prefersReduced ? {} : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="micro-type text-primary mb-2">{pricing.eyebrow}</p>
          <h2 className="font-serif font-semibold text-foreground">
            {pricing.title} <span className="gold-text">{pricing.highlightedWord}</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto text-sm">{pricing.intro}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {pricing.plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={prefersReduced ? {} : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={prefersReduced ? {} : { y: -4 }}
              className={`glass-surface rounded-xl p-6 sm:p-7 relative transition-all duration-300 ${plan.badge ? "border-primary/50 shadow-[var(--shadow-gold)]" : "hover:shadow-[var(--shadow-gold)]"}`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-6 micro-type px-3 py-1 bg-primary text-primary-foreground rounded-full text-[0.6rem]">
                  {plan.badge}
                </span>
              )}
              <h3 className="font-serif text-xl font-semibold text-foreground mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-primary">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.subtitle}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-5">{plan.tagline}</p>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check size={14} className="text-primary flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={openWizard}
                className={`w-full py-3.5 text-sm font-semibold rounded transition-all ${plan.badge ? "bg-primary text-primary-foreground hover:bg-gold-light" : "border border-border text-foreground hover:border-primary hover:text-primary"}`}
              >
                Get Started
              </button>
            </motion.div>
          ))}
        </div>

        {/* Additional services */}
        <motion.div
          className="mt-8 max-w-3xl mx-auto"
          initial={prefersReduced ? {} : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="font-serif text-lg font-semibold text-foreground text-center mb-4">{pricing.additionalServicesTitle}</h3>
          <div className="glass-surface rounded-xl divide-y divide-border/50">
            {pricing.additionalServices.map((a) => (
              <div key={a.name} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-foreground">{a.name}</span>
                <span className="text-sm text-primary font-medium">{a.price}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4 max-w-lg mx-auto leading-relaxed">{pricing.additionalNote}</p>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── About / Credentials ─── */
function OwnerAbout() {
  const prefersReduced = useReducedMotion();
  const { openWizard } = useWizard();
  const { about } = siteBlueprint;
  const CRED_ICONS = [Award, Star, TrendingUp, Shield, Star, TrendingUp];

  return (
    <section className="min-h-[100dvh] flex flex-col justify-center section-padding py-10 sm:py-14 bg-card/30 border-t border-border">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={prefersReduced ? {} : { opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="micro-type text-primary mb-3">{about.eyebrow}</p>
            <h2 className="font-serif font-semibold text-foreground mb-5">
              {about.title}{" "}
              <span className="gold-text">{about.highlightedWord}</span>
            </h2>
            <div className="space-y-3 mb-6">
              {about.body.slice(0, 2).map((p, i) => (
                <p key={i} className="text-sm text-muted-foreground leading-relaxed">{p}</p>
              ))}
            </div>
            <button
              onClick={openWizard}
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold bg-primary text-primary-foreground rounded hover:bg-gold-light transition-all hover:shadow-lg"
            >
              Get Your Free Assessment
              <ArrowRight size={15} />
            </button>
          </motion.div>

          {/* Credentials grid */}
          <motion.div
            initial={prefersReduced ? {} : { opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="grid grid-cols-2 gap-3 sm:gap-4"
          >
            {about.credentials.map((cred, i) => {
              const Icon = CRED_ICONS[i % CRED_ICONS.length];
              return (
                <motion.div
                  key={cred}
                  initial={prefersReduced ? {} : { opacity: 0, scale: 0.93 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.07 }}
                  className="glass-surface rounded-xl p-4 flex items-start gap-3 hover:border-primary/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={15} className="text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground leading-snug">{cred}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Owner CTA Banner ─── */
function OwnerCTA() {
  const prefersReduced = useReducedMotion();
  const { openWizard } = useWizard();

  return (
    <section className="min-h-[60dvh] flex flex-col justify-center section-padding py-12 sm:py-16 relative overflow-hidden border-t border-border">
      {/* Gold glow bg */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/8 blur-3xl rounded-full" />
      </div>
      <div className="section-container relative z-10 text-center">
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="micro-type text-primary mb-3">READY TO BEGIN?</p>
          <h2 className="font-serif font-bold text-foreground mb-4">
            Let's maximise your{" "}
            <span className="gold-text">rental income</span>
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm">
            Join Malta's most trusted property management team. Free assessment, no commitment required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={openWizard}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold bg-primary text-primary-foreground rounded hover:bg-gold-light transition-all hover:shadow-lg hover:scale-[1.02]"
            >
              Get Free Assessment
              <ArrowRight size={15} />
            </button>
            <a
              href={`mailto:${siteBlueprint.brand.email}`}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Or email us: {siteBlueprint.brand.email}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Page ─── */
export default function Owners() {
  return (
    <Layout mode="owner">
      <OwnerHero />
      <ScrollSection fitScreen>
        <WhySection />
      </ScrollSection>
      <ScrollSection fitScreen>
        <OwnerProcess />
      </ScrollSection>
      <ScrollSection fitScreen>
        <OwnerPricing />
      </ScrollSection>
      <ScrollSection fitScreen>
        <OwnerAbout />
      </ScrollSection>
      <OwnerCTA />
    </Layout>
  );
}

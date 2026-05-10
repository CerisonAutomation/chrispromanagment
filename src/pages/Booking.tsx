/**
 * /booking — Guest-facing booking page.
 * Hero + Guesty embedded search widget + curated property cards + testimonials strip.
 */
import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight, Star, MapPin, Bed, ExternalLink } from "lucide-react";
import Layout from "@/components/Layout";
import ScrollSection from "@/components/ScrollSection";
import bookingHeroBg from "@/assets/booking-hero.jpg";
import { siteBlueprint } from "@/lib/site-blueprint";
import GuestyLiveListings from "@/components/GuestyLiveListings";
import portfolio1 from "@/assets/portfolio-1.jpg";
import portfolio2 from "@/assets/portfolio-2.jpg";
import portfolio3 from "@/assets/portfolio-3.jpg";

const PROPERTY_IMAGES = [portfolio1, portfolio2, portfolio3];

/* ─── Guesty Search Widget ─── */
function GuestySearchWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Inject Guesty CSS
    if (!document.querySelector('link[href*="search-bar-production.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = "https://s3.amazonaws.com/guesty-frontend-production/search-bar-production.css";
      link.media = "all";
      document.head.appendChild(link);
    }

    // Inject Guesty script
    if (!document.querySelector('script[src*="search-bar-production.js"]')) {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "https://s3.amazonaws.com/guesty-frontend-production/search-bar-production.js";
      script.async = true;
      script.onload = () => {
        try {
          (window as any)["GuestySearchBarWidget"]
            .create({
              siteUrl: "malta.guestybookings.com",
              color: "#C9A84C",
            })
            .catch((e: Error) => console.warn("[Guesty]", e.message));
        } catch (e: any) {
          console.warn("[Guesty]", e.message);
        }
      };
      document.head.appendChild(script);
    } else {
      // Script already loaded — just init
      try {
        (window as any)["GuestySearchBarWidget"]
          ?.create({ siteUrl: "malta.guestybookings.com", color: "#C9A84C" })
          ?.catch(() => {});
      } catch {}
    }
  }, []);

  return (
    <div ref={containerRef} id="search-widget_IO312PWQ" className="w-full" />
  );
}

/* ─── Hero ─── */
function BookingHero() {
  const ref = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, prefersReduced ? 0 : 100]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.18]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.55], [0, -40]);

  return (
    <section ref={ref} className="relative flex flex-col justify-end overflow-hidden h-[100dvh]" style={{ paddingTop: "var(--header-height)" }}>
      {/* Parallax background */}
      <motion.div className="absolute inset-0 parallax-bg" style={{ y: imgY }}>
        <motion.img
          src={bookingHeroBg}
          alt="Valletta Malta golden hour aerial view"
          className="w-full h-full object-cover"
          style={{ scale: imgScale }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsla(220,20%,4%,0.25) 0%, hsla(220,20%,4%,0.5) 40%, hsla(220,20%,4%,0.93) 100%)" }} />
      </motion.div>

      <motion.div style={{ opacity: contentOpacity, y: contentY }} className="section-container relative z-10 w-full pb-6 sm:pb-10">
        {/* Badge */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10 backdrop-blur-sm"
        >
          <Star size={11} className="text-primary fill-primary" />
          <span className="micro-type text-primary text-[0.6rem]">GUEST SERVICES · SECURING MALTA'S PREMIER PROPERTIES</span>
        </motion.div>

        <motion.h1
          className="font-serif font-bold text-foreground mb-3 max-w-3xl"
          initial={prefersReduced ? {} : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          Discover{" "}
          <span className="gold-text">hand-curated</span>
          <br />luxury residences in Malta
        </motion.h1>

        <motion.p
          className="text-muted-foreground mb-6 max-w-xl"
          style={{ fontSize: "clamp(0.95rem, 0.85rem + 0.4vw, 1.2rem)" }}
          initial={prefersReduced ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Defining a new standard for Mediterranean stays. Verified luxury properties with 5-star guest experiences.
        </motion.p>

        {/* Guesty search widget panel */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="rounded-xl overflow-hidden border border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl"
        >
          <div className="px-4 pt-4 pb-2">
            <p className="micro-type text-primary mb-1.5">SEARCH AVAILABILITY</p>
          </div>
          <div className="px-2 pb-3">
            <GuestySearchWidget />
          </div>
        </motion.div>

        {/* Quick trust strip */}
        <motion.div
          className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4"
          initial={prefersReduced ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {["Free cancellation on select dates", "Instant confirmation", "4.97 ★ average rating"].map((item) => (
            <span key={item} className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-primary inline-block" />
              {item}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─── Property Cards ─── */
function PropertyCollection() {
  const prefersReduced = useReducedMotion();
  const { cards, primaryCta } = siteBlueprint.portfolio;

  return (
    <section className="section-padding min-h-[100dvh] flex flex-col justify-center py-10 sm:py-14">
      <div className="section-container">
        <motion.div
          className="text-center mb-8 sm:mb-10"
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
        >
          <p className="micro-type text-primary mb-2">CURATED COLLECTION</p>
          <h2 className="font-serif font-semibold text-foreground">
            Our handpicked <span className="gold-text">properties</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">
            Every property personally vetted, professionally managed, and ready to exceed your expectations.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {cards.map((card, i) => (
            <motion.a
              key={card.name}
              href={card.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={prefersReduced ? {} : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-5%" }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              whileHover={prefersReduced ? {} : { y: -6 }}
              className="group glass-surface rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all duration-400 hover:shadow-[var(--shadow-gold)] block"
            >
              {/* Image */}
              <div className="relative h-48 sm:h-52 overflow-hidden">
                <motion.img
                  src={PROPERTY_IMAGES[i % PROPERTY_IMAGES.length]}
                  alt={card.name}
                  className="w-full h-full object-cover"
                  whileHover={prefersReduced ? {} : { scale: 1.07 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/90 backdrop-blur-sm">
                  <Star size={10} className="text-primary-foreground fill-primary-foreground" />
                  <span className="text-xs font-bold text-primary-foreground">{card.rating}</span>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="text-[0.6rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-card/80 text-muted-foreground backdrop-blur-sm">
                    {card.type}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-serif font-semibold text-foreground text-base group-hover:text-primary transition-colors">{card.name}</h3>
                  <ExternalLink size={13} className="text-muted-foreground flex-shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                  <MapPin size={11} className="text-primary" />
                  <span>{card.location}</span>
                  <span className="text-border">·</span>
                  <Bed size={11} />
                  <span>{card.meta}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-primary font-medium">Book direct — best rate</span>
                  <ArrowRight size={14} className="text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        <motion.div
          className="text-center mt-8"
          initial={prefersReduced ? {} : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <a
            href={primaryCta.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold border border-primary text-primary rounded hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            Explore Full Collection
            <ArrowRight size={15} />
          </a>
          <p className="text-xs text-muted-foreground mt-2">Real-time availability · Best rate guaranteed</p>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Guest Testimonials Strip ─── */
function GuestTestimonials() {
  const prefersReduced = useReducedMotion();
  const reviews = siteBlueprint.testimonials.items.slice(0, 3);

  return (
    <section className="min-h-[100dvh] flex flex-col justify-center py-10 sm:py-14 bg-card/30 border-t border-border">
      <div className="section-container">
        <motion.div
          className="text-center mb-8"
          initial={prefersReduced ? {} : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="micro-type text-primary mb-2">WHAT GUESTS SAY</p>
          <h2 className="font-serif font-semibold text-foreground">
            Five-star <span className="gold-text">experiences</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-5">
          {reviews.map((r, i) => (
            <motion.div
              key={r.name}
              initial={prefersReduced ? {} : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="glass-surface rounded-xl p-6 flex flex-col gap-3"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: r.rating }).map((_, j) => (
                  <Star key={j} size={13} className="text-primary fill-primary" />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed italic">"{r.quote}"</p>
              <div className="mt-auto pt-2 border-t border-border/50">
                <p className="text-sm font-semibold text-foreground">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.date}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-10"
          initial={prefersReduced ? {} : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-sm text-muted-foreground mb-4">Ready to experience Malta's finest?</p>
          <a
            href={siteBlueprint.external.bookingEngineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold bg-primary text-primary-foreground rounded hover:bg-gold-light transition-all hover:shadow-lg hover:scale-[1.02]"
          >
            Explore Collection
            <ArrowRight size={15} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Page ─── */
export default function Booking() {
  return (
    <Layout mode="guest" hideFloatingCTA>
      <BookingHero />
      <ScrollSection fitScreen>
        <GuestyLiveListings />
      </ScrollSection>
      <ScrollSection fitScreen>
        <PropertyCollection />
      </ScrollSection>
      <ScrollSection fitScreen>
        <GuestTestimonials />
      </ScrollSection>
    </Layout>
  );
}

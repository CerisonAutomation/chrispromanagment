// puck.config.tsx
// Christiano Property Management — Enterprise Visual Upgrade
// Luxury Dark Theme: CPM semantic tokens (see Tailwind theme extensions)

import React from "react";
import { toast } from "sonner";
import MaltaSVGLoader from "@/components/malta-svg-loader";
import { LOGO_URL, HERO_BG, ABOUT_IMG, PROP_IMAGES, GALLERY_IMAGES } from "@/lib/images";
import { CONTACT, SITE_NAME, SITE_BASE, BRAND, NAV_LINKS, SOCIAL, PAGE_META, COPYRIGHT } from "@/lib/constants";

// Backward-compatible aliases for image constants used throughout
const PROP_1 = PROP_IMAGES.valletta2;
const PROP_2 = PROP_IMAGES.baharIcCaghaq;
const PROP_3 = PROP_IMAGES.pieta;
const PROP_VALLETTA = PROP_IMAGES.valletta;
const PROP_MADLIENA = PROP_IMAGES.madliena;
const PROP_GZIRA = PROP_IMAGES.gzira;
const IMG_2625 = GALLERY_IMAGES.img2625;
const IMG_9593 = GALLERY_IMAGES.img9593;
const IMG_9588 = GALLERY_IMAGES.img9588;
const IMG_9590 = GALLERY_IMAGES.img9590;
const IMG_7136 = GALLERY_IMAGES.img7136;
const IMG_6590 = GALLERY_IMAGES.img6590;
const IMG_6106 = GALLERY_IMAGES.img6106;
const IMG_3886 = GALLERY_IMAGES.img3886;
const IMG_3819 = GALLERY_IMAGES.img3819;
const IMG_3814 = GALLERY_IMAGES.img3814;
const IMG_6113 = GALLERY_IMAGES.img6113;
const IMG_0557 = GALLERY_IMAGES.img0557;
const IMG_6115 = GALLERY_IMAGES.img6115;

// ============================================================
// HELPERS
// ============================================================
function safeHref(url: string | undefined, fallback: string = "#"): string {
  if (!url) return fallback;
  if (url.startsWith("#") || url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://") || url.startsWith("mailto:") || url.startsWith("tel:")) return url;
  return fallback;
}

// ============================================================
// 1. HERO SECTION
// ============================================================
const HeroSection = {
  label: "Hero Section",
  fields: {
    title: { type: "text" as const },
    subtitle: { type: "textarea" as const },
    backgroundImage: { type: "text" as const, label: "Background Image URL" },
    ctaText: { type: "text" as const, label: "CTA Button Text" },
    ctaLink: { type: "text" as const, label: "CTA Button Link" },
  },
  defaultProps: {
    title: "Dedicated to Maximizing Your Property's Potential",
    subtitle: "9 years of Superhost experience managing luxury short-term rentals across Malta. International luxury hotel management background. Transparent fees, no hidden markups.",
    backgroundImage: HERO_BG,
    ctaText: "Learn More",
    ctaLink: "#about",
  },
  render: (props: Record<string, unknown>) => {
    const p = props as {
      title: string;
      subtitle: string;
      backgroundImage: string;
      ctaText: string;
      ctaLink: string;
    };
    return (
      <>
        <section className="relative flex min-h-[700px] items-center justify-center overflow-hidden">
          {p.backgroundImage && (
            <>
              <div
                className="absolute inset-0 bg-fixed"
                style={{
                  backgroundImage: `url(${p.backgroundImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cpm-bg-primary via-cpm-bg-primary/60 to-cpm-bg-primary/30" />
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-cpm-bg-primary/40 to-transparent" />
          {/* Decorative floating orbs */}
          <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-cpm-accent/8 blur-3xl" style={{ animation: "float 6s ease-in-out infinite" }} />
          <div className="absolute bottom-1/3 left-1/6 h-48 w-48 rounded-full bg-cpm-accent/5 blur-3xl" style={{ animation: "float 8s ease-in-out infinite 2s" }} />
          <div className="relative z-10 mx-auto max-w-5xl px-6 py-32 text-center" style={{ animation: "fadeInUp 0.8s ease-out" }}>
            {/* Badge with pulse ring */}
            <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-cpm-accent/30 bg-cpm-accent/10 px-5 py-2 backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-cpm-accent" style={{ animation: "pulseRing 2s cubic-bezier(0,0,0.2,1) infinite" }} />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cpm-accent" />
              </span>
              <span className="text-xs font-semibold tracking-[0.15em] text-cpm-accent uppercase">Superhost Since 2015</span>
            </div>
            {/* Gradient text title */}
            <h1
              className="mb-6 font-[family-name:var(--font-heading)] text-4xl font-light leading-tight tracking-tight sm:text-5xl lg:text-6xl"
              style={{
                background: "linear-gradient(135deg, var(--cpm-accent) 0%, var(--cpm-text-primary) 50%, var(--cpm-accent) 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "gradientShift 4s ease infinite",
              }}
            >
              {p.title}
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-cpm-text-secondary sm:text-lg">
              {p.subtitle}
            </p>
            {p.ctaText && (
              <a
                href={safeHref(p.ctaLink)}
                className="group inline-flex items-center gap-2.5 rounded-lg bg-cpm-accent px-8 py-3.5 text-sm font-semibold text-cpm-bg-primary transition-all duration-300 hover:bg-cpm-accent-hover hover:shadow-[0_0_30px_rgba(200,169,106,0.3)] active:scale-[0.98]"
              >
                {p.ctaText}
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>
            )}
          </div>
          {/* Scroll indicator */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2" style={{ animation: "fadeInUp 1s ease-out 1.2s both" }}>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cpm-text-tertiary">Scroll</span>
            <div className="flex h-8 w-5 items-start justify-center rounded-full border border-cpm-text-tertiary/30 pt-1.5">
              <div className="h-1.5 w-1 rounded-full bg-cpm-accent" style={{ animation: "scrollBounce 2s ease-in-out infinite" }} />
            </div>
          </div>
          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-cpm-bg-primary via-cpm-bg-primary/60 to-transparent" />
        </section>
      </>
    );
  },
};

// ============================================================
// 2. ABOUT SECTION
// ============================================================
const AboutSection = {
  label: "About Section",
  fields: {
    title: { type: "text" as const },
    description: { type: "textarea" as const },
    imageUrl: { type: "text" as const, label: "Image URL" },
  },
  defaultProps: {
    title: "About Christiano Property Management",
    description: "Christiano Property Management is a luxury short-term rental management company operating across Malta. With over 9 years of Superhost experience on Airbnb and a background in international luxury hotel management, we bring a five-star standard to every property we manage.\n\nWe believe in transparent, honest partnerships with property owners. Our selective approach means we work with a limited portfolio, ensuring each property receives our undivided attention and the highest level of service.\n\nFrom dynamic pricing strategies and 24/7 guest communication to meticulous cleaning and monthly performance reports, we handle every aspect of your short-term rental so you can enjoy passive income without the hassle.",
    imageUrl: ABOUT_IMG,
  },
  render: (props: Record<string, unknown>) => {
    const p = props as { title: string; description: string; imageUrl: string };
    const paragraphs = (p.description || "").split("\n\n");
    return (
      <>
        <section className="bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row lg:items-start">
            <div className="relative w-full lg:w-1/2">
              <div className="group relative overflow-hidden rounded-2xl">
                <img
                  src={p.imageUrl || ABOUT_IMG}
                  alt="About Christiano Property Management"
                  className="h-[400px] w-full object-cover transition-transform duration-700 group-hover:scale-105 lg:h-[500px]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cpm-bg-secondary/50 to-transparent" />
              </div>
              {/* Floating decorative element */}
              <div
                className="absolute -bottom-6 -right-6 hidden h-28 w-28 border-2 border-cpm-accent/20 rounded-2xl bg-cpm-accent/5 backdrop-blur-sm lg:block"
                style={{ animation: "float 5s ease-in-out infinite" }}
              />
              <div
                className="absolute -top-4 -left-4 hidden h-16 w-16 rounded-full border border-cpm-accent/10 bg-cpm-accent/5 lg:block"
                style={{ animation: "float 7s ease-in-out infinite 1s" }}
              />
            </div>
            <div className="w-full lg:w-1/2 border-l-2 border-cpm-accent/30 pl-6 lg:pl-8">
              {/* Animated accent line */}
              <div
                className="mb-4 h-[2px] bg-gradient-to-r from-cpm-accent to-cpm-accent/20"
                style={{ animation: "expandWidth 0.8s ease-out forwards" }}
              />
              <h2 className="mb-6 font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl" style={{ animation: "fadeInUp 0.6s ease-out" }}>
                {p.title}
              </h2>
              <div className="space-y-5" style={{ animation: "fadeInUp 0.8s ease-out 0.2s both" }}>
                {paragraphs.map((para, i) => (
                  <p key={i} className="text-base leading-[1.8] text-cpm-text-secondary">
                    {para}
                  </p>
                ))}
              </div>
              {/* Mini stat highlights */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                  { value: "9+", label: "Years" },
                  { value: "50+", label: "Properties" },
                  { value: "4.9", label: "Rating" },
                ].map((s, i) => (
                  <div key={i} className="rounded-xl bg-cpm-bg-primary p-3 text-center">
                    <div className="text-lg font-light text-cpm-accent">{s.value}</div>
                    <div className="text-[10px] uppercase tracking-wider text-cpm-text-tertiary">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </>
    );
  },
};

// ============================================================
// 3. WHY CHOOSE US
// ============================================================
const WhyChooseUs = {
  label: "Why Choose Us",
  fields: {
    title: { type: "text" as const },
    items: {
      type: "array" as const,
      label: "Features",
      defaultItemProps: { title: "Feature", description: "Description", icon: "star" },
      getItemSummary: (item: Record<string, unknown>) => (item as { title?: string }).title || "Feature",
      arrayFields: {
        title: { type: "text" as const },
        description: { type: "textarea" as const },
        icon: { type: "text" as const, label: "Icon (lucide name)" },
      },
    },
  },
  defaultProps: {
    title: "Why Choose Us?",
    items: [
      {
        title: "Tailored Property Management",
        description: "Every property is unique. We create custom management strategies that maximise your rental income while preserving the character and condition of your property.",
        icon: "settings",
      },
      {
        title: "Expertise You Can Trust",
        description: "Our founder's background in international luxury hotel management means your property is managed to the highest hospitality standards. 9 years of Superhost status speaks for itself.",
        icon: "award",
      },
      {
        title: "Selective Portfolio",
        description: "We deliberately limit the number of properties we manage. This means each property receives our full attention, the highest quality of service, and personal dedication.",
        icon: "gem",
      },
      {
        title: "Comprehensive Services",
        description: "From dynamic pricing and 24/7 guest communication to professional cleaning and detailed monthly reports — we handle everything so you don't have to.",
        icon: "check-circle",
      },
    ],
  },
  render: (props: Record<string, unknown>) => {
    const p = props as {
      title: string;
      items: { title: string; description: string; icon: string }[];
    };
    return (
      <>
        <section className="relative bg-cpm-bg-primary px-4 py-20 sm:px-8 lg:py-32 overflow-hidden">
          {/* Subtle dot pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, var(--cpm-accent) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative mx-auto max-w-6xl">
            <div className="mb-16 text-center" style={{ animation: "fadeInUp 0.6s ease-out" }}>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">
                {p.title}
              </h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {(p.items || []).map((item, i) => (
                <div
                  key={i}
                  className="group relative rounded-2xl border border-cpm-border bg-cpm-bg-secondary p-6 transition-all duration-500 hover:-translate-y-1 hover:border-cpm-accent/30 hover:border-l-2 hover:border-l-cpm-accent hover:shadow-[0_8px_30px_rgba(200,169,106,0.08)]"
                  style={{ animation: `fadeInUp 0.6s ease-out ${i * 0.15}s both` }}
                >
                  {/* Gradient icon container */}
                  <div
                    className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl text-cpm-text-primary transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(200,169,106,0.2)]"
                    style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-gold-dark))" }}
                  >
                    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      {item.icon === "settings" && <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />}
                      {item.icon === "award" && <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.043 6.043 0 0 1-2.54.89m0 0c-.732.085-1.472.085-2.21 0" />}
                      {item.icon === "gem" && <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />}
                      {(item.icon === "check-circle" || !item.icon) && <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />}
                      {item.icon === "trending-up" && <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />}
                      {item.icon === "shield-check" && <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />}
                      {item.icon === "headphones" && <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 18.75a6 6 0 0 1 6-6v0a6 6 0 0 1 6 6v0a6 6 0 0 1-6 6H9.75a6 6 0 0 1-6-6Zm16.5 0V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v12.75" />}
                    </svg>
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-cpm-text-primary transition-colors duration-300 group-hover:text-cpm-accent">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-cpm-text-secondary">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  },
};

// ============================================================
// 4. SERVICES SECTION
// ============================================================
const ServicesSection = {
  label: "Services Section",
  fields: {
    title: { type: "text" as const },
    services: {
      type: "array" as const,
      label: "Services",
      defaultItemProps: { name: "Service", included: "true" },
      getItemSummary: (item: Record<string, unknown>) => (item as { name?: string }).name || "Service",
      arrayFields: {
        name: { type: "text" as const },
        included: {
          type: "select" as const,
          options: [
            { label: "Included", value: "true" },
            { label: "Extra", value: "false" },
          ],
        },
      },
    },
    extras: {
      type: "array" as const,
      label: "Optional Extras",
      defaultItemProps: { name: "Extra", price: "" },
      getItemSummary: (item: Record<string, unknown>) => (item as { name?: string }).name || "Extra",
      arrayFields: {
        name: { type: "text" as const },
        price: { type: "text" as const },
      },
    },
    ctaText: { type: "text" as const, label: "CTA Text" },
    ctaLink: { type: "text" as const, label: "CTA Link" },
  },
  defaultProps: {
    title: "What We Offer",
    services: [
      { name: "Property Assessment", included: "true" },
      { name: "Essentials Checklist", included: "true" },
      { name: "Copywriting & Listing Creation", included: "true" },
      { name: "Dynamic Pricing Strategy", included: "true" },
      { name: "Guest Communication (24/7)", included: "true" },
      { name: "Custom Property Manuals", included: "true" },
      { name: "Payment Collection & Processing", included: "true" },
      { name: "Guest Stay Fulfillment", included: "true" },
      { name: "Airport & Port Transfers", included: "true" },
      { name: "Professional Cleaning", included: "true" },
      { name: "Laundry Service", included: "true" },
      { name: "Reviews Management", included: "true" },
      { name: "Maintenance Coordination", included: "true" },
      { name: "Monthly Performance Reports", included: "true" },
      { name: "Replenishing Consumables", included: "true" },
    ],
    extras: [
      { name: "Professional Photoshoot", price: "On request" },
      { name: "Deep Clean & Preparation", price: "On request" },
      { name: "MTA Licensing Assistance", price: "€350" },
      { name: "Procurement & Styling", price: "€25/hr" },
      { name: "Mail Handling Service", price: "€10/month" },
      { name: "Interior Design Consultation", price: "On request" },
    ],
    ctaText: "View Our Pricing Plans",
    ctaLink: "#pricing",
  },
  render: (props: Record<string, unknown>) => {
    const p = props as {
      title: string;
      services: { name: string; included: string }[];
      extras: { name: string; price: string }[];
      ctaText: string;
      ctaLink: string;
    };
    const included = (p.services || []).filter((s) => s.included === "true");
    return (
      <>
        <section className="bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center" style={{ animation: "fadeInUp 0.6s ease-out" }}>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">
                {p.title}
              </h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
            </div>
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Glassmorphism included card */}
              <div
                className="rounded-2xl border border-cpm-accent/10 p-8 backdrop-blur-xl"
                style={{ background: "linear-gradient(135deg, rgba(200,169,106,0.05), rgba(21,23,27,0.9))" }}
              >
                <h3
                  className="mb-2 text-lg font-semibold"
                  style={{
                    background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-text-primary))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Everything Included
                </h3>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-cpm-accent/10 px-3 py-1">
                  <span className="text-xs font-semibold text-cpm-accent">{included.length} Services Included</span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {included.map((service, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 transition-all duration-200 hover:translate-x-1"
                      style={{ animation: `slideUp 0.4s ease-out ${i * 0.03}s both` }}
                    >
                      <div
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                        style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-gold-dark))" }}
                      >
                        <svg className="h-3 w-3 text-cpm-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <span className="text-sm text-cpm-text-primary">{service.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                {/* Glassmorphism extras card */}
                <div
                  className="rounded-2xl border border-cpm-border p-8 backdrop-blur-xl"
                  style={{ background: "linear-gradient(135deg, rgba(21,23,27,0.9), rgba(21,23,27,0.6))" }}
                >
                  <h3 className="mb-6 text-lg font-medium text-cpm-text-secondary">Optional Extras</h3>
                  <div className="space-y-3">
                    {(p.extras || []).map((ex, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cpm-text-tertiary/20">
                            <svg className="h-3 w-3 text-cpm-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                            </svg>
                          </div>
                          <span className="text-sm text-cpm-text-secondary">{ex.name}</span>
                        </div>
                        <span className="text-sm font-medium text-cpm-accent">{ex.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {p.ctaText && (
                  <a
                    href={safeHref(p.ctaLink)}
                    className="group mt-6 inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-cpm-accent/30 bg-cpm-accent/5 px-6 py-3.5 text-sm font-medium text-cpm-accent transition-all duration-300 hover:bg-cpm-accent hover:text-cpm-bg-primary hover:shadow-[0_0_25px_rgba(200,169,106,0.15)] active:scale-[0.98]"
                  >
                    {p.ctaText}
                    <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </>
    );
  },
};

// ============================================================
// 5. PROPERTY SHOWCASE
// ============================================================
const PropertyShowcase = {
  label: "Property Showcase",
  fields: {
    title: { type: "text" as const },
    properties: {
      type: "array" as const,
      label: "Properties",
      defaultItemProps: { name: "Property", imageUrl: "", caption: "" },
      getItemSummary: (item: Record<string, unknown>) => (item as { name?: string }).name || "Property",
      arrayFields: {
        name: { type: "text" as const },
        imageUrl: { type: "text" as const, label: "Image URL" },
        caption: { type: "text" as const },
      },
    },
  },
  defaultProps: {
    title: "Discover Our Diverse Property Portfolio",
    properties: [
      { name: "Valletta Apartment 1", imageUrl: PROP_VALLETTA, caption: "2 Bed · 2 Bath · Sleeps 6" },
      { name: "Valletta Apartment 2", imageUrl: PROP_1, caption: "2 Bed · 2 Bath · Sleeps 4" },
      { name: "Bahar ic-Caghaq Villa", imageUrl: PROP_2, caption: "3 Bed · 3 Bath · Sleeps 6" },
      { name: "Madliena Event Space", imageUrl: PROP_MADLIENA, caption: "Unique Event Venue" },
      { name: "Pieta Apartment", imageUrl: PROP_3, caption: "2 Bed · 2 Bath · Sleeps 4" },
      { name: "Gzira Apartment", imageUrl: PROP_GZIRA, caption: "2 Bed · 2 Bath · Sleeps 4" },
    ],
  },
  render: (props: Record<string, unknown>) => {
    const p = props as {
      title: string;
      properties: { name: string; imageUrl: string; caption: string; price?: string; rating?: string; beds?: string; baths?: string; guests?: string }[];
    };
    // Add default prices/stats to properties that don't have them
    const propsWithDefaults = (p.properties || []).map((prop, i) => ({
      ...prop,
      price: prop.price || ["€189", "€169", "€229", "€350", "€159", "€149"][i] || "€189",
      rating: prop.rating || "4.9",
      beds: prop.beds || ["2", "2", "3", "4", "2", "2"][i] || "2",
      baths: prop.baths || ["2", "2", "3", "3", "2", "2"][i] || "2",
      guests: prop.guests || ["6", "4", "6", "8", "4", "4"][i] || "4",
    }));

    return (
      <>
        <section className="bg-cpm-bg-primary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center" style={{ animation: "fadeInUp 0.6s ease-out" }}>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.title}</h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {propsWithDefaults.map((prop, i) => (
                <div
                  key={i}
                  className={`group relative overflow-hidden rounded-2xl bg-cpm-bg-secondary transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:border-cpm-accent/20 border border-cpm-border ${
                    i === 0 ? "sm:col-span-2 lg:col-span-2" : ""
                  }`}
                  style={{ animation: `scaleIn 0.5s ease-out ${i * 0.08}s both` }}
                >
                  <div className={`relative overflow-hidden ${i === 0 ? "h-64 sm:h-80" : "h-64"}`}>
                    <img src={prop.imageUrl} alt={prop.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-cpm-bg-primary via-cpm-bg-primary/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-60" />
                    {/* Price badge */}
                    <div className="absolute top-4 right-4 rounded-full bg-cpm-accent px-3 py-1 text-xs font-bold text-cpm-bg-primary shadow-lg">
                      {prop.price}<span className="font-normal opacity-70">/night</span>
                    </div>
                    {/* Rating */}
                    <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-cpm-bg-primary/80 px-2.5 py-1 text-xs font-medium text-cpm-text-primary backdrop-blur-sm">
                      <svg className="h-3.5 w-3.5 text-cpm-accent" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      {prop.rating}
                    </div>
                    {/* Stats bar */}
                    <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 px-5 py-3">
                      <span className="flex items-center gap-1 text-xs text-cpm-text-primary/80">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
                        {prop.beds} Bed
                      </span>
                      <span className="flex items-center gap-1 text-xs text-cpm-text-primary/80">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                        {prop.baths} Bath
                      </span>
                      <span className="flex items-center gap-1 text-xs text-cpm-text-primary/80">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
                        {prop.guests}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="mb-1 text-lg font-medium text-cpm-text-primary">{prop.name}</h3>
                    <p className="text-sm text-cpm-accent">{prop.caption}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* CTA Button */}
            <div className="mt-10 text-center" style={{ animation: "fadeInUp 0.8s ease-out" }}>
              <a href="#book" className="group inline-flex items-center gap-2.5 rounded-xl border border-cpm-accent/30 bg-cpm-accent/5 px-8 py-3.5 text-sm font-medium text-cpm-accent transition-all duration-300 hover:bg-cpm-accent hover:text-cpm-bg-primary hover:shadow-[0_0_25px_rgba(200,169,106,0.15)] active:scale-[0.98]">
                View All Properties
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
              </a>
            </div>
          </div>
        </section>
      </>
    );
  },
};

// ============================================================
// 6. BOOKING SECTION
// ============================================================
const BookingSection = {
  label: "Booking Section",
  fields: {
    title: { type: "text" as const },
    subtitle: { type: "textarea" as const },
  },
  defaultProps: {
    title: "Check Availability & Book Direct",
    subtitle: "Book directly with us and save. No hidden fees, best price guaranteed, and personal service from our dedicated team.",
  },
  Component: (props: Record<string, unknown>) => {
    const p = props as { title: string; subtitle: string };
    const [step, setStep] = React.useState(1);
    const [submitting, setSubmitting] = React.useState(false);
    const [submitted, setSubmitted] = React.useState(false);
    const [dates, setDates] = React.useState({ checkIn: "", checkOut: "", guests: "2" });
    const [personal, setPersonal] = React.useState({ name: "", email: "", phone: "", propertyId: "" });
    const [message, setMessage] = React.useState("");

    const nights = dates.checkIn && dates.checkOut ? Math.max(1, Math.round((new Date(dates.checkOut).getTime() - new Date(dates.checkIn).getTime()) / 86400000)) : 0;

    const handleSubmit = async () => {
      if (step < 3) { setStep(step + 1); return; }
      setSubmitting(true);
      try {
        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            guestName: personal.name,
            guestEmail: personal.email,
            guestPhone: personal.phone,
            checkIn: dates.checkIn,
            checkOut: dates.checkOut,
            guests: parseInt(dates.guests),
            propertyId: personal.propertyId || undefined,
            specialRequests: message || undefined,
          }),
        });
        if (res.ok) {
          toast.success("Booking request submitted! We'll be in touch soon.");
          setSubmitted(true);
        } else {
          const err = await res.json().catch(() => ({}));
          toast.error(err.error || "Something went wrong.");
        }
      } catch {
        toast.error("Network error. Please try again.");
      } finally { setSubmitting(false); }
    };

    if (submitted) {
      return (
        <>
          <section className="bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32">
            <div className="mx-auto max-w-lg text-center" style={{ animation: "scaleIn 0.5s ease-out" }}>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-cpm-success/30 bg-cpm-success/10" style={{ animation: "glowPulse 2s ease-in-out infinite" }}>
                <svg className="h-10 w-10 text-cpm-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              </div>
              <h2 className="mb-3 font-[family-name:var(--font-heading)] text-2xl font-light text-cpm-text-primary">Request Submitted!</h2>
              <p className="mb-8 text-sm text-cpm-text-secondary">We'll review your booking request and get back to you within 24 hours.</p>
              <button onClick={() => { setSubmitted(false); setStep(1); setDates({ checkIn: "", checkOut: "", guests: "2" }); setPersonal({ name: "", email: "", phone: "", propertyId: "" }); setMessage(""); }} className="rounded-xl border border-cpm-accent/30 bg-cpm-accent/5 px-6 py-3 text-sm font-medium text-cpm-accent transition-all hover:bg-cpm-accent hover:text-cpm-bg-primary">Submit Another Request</button>
            </div>
          </section>
        </>
      );
    }

    const inputCls = "w-full rounded-xl border border-cpm-border bg-cpm-bg-secondary px-4 py-3 text-sm text-cpm-text-primary outline-none transition-all duration-300 focus:border-cpm-accent/50 focus:shadow-[0_0_0_3px_rgba(200,169,106,0.1)]";
    const labelCls = "mb-1.5 block text-sm font-medium text-cpm-text-primary";
    const reqSpan = <span className="text-cpm-accent">*</span>;

    const stepLabel = (n: number, label: string) => (
      <div className={`flex items-center gap-2 ${step >= n ? "text-cpm-accent" : "text-cpm-text-tertiary"}`}>
        <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${step > n ? "bg-cpm-accent text-cpm-bg-primary" : step === n ? "border-2 border-cpm-accent text-cpm-accent" : "border-2 border-cpm-border-hover text-cpm-text-tertiary"}`}>
          {step > n ? <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg> : n}
        </div>
        <span className="hidden text-xs font-medium sm:inline">{label}</span>
      </div>
    );

    return (
      <>
        <section className="bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.title}</h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
              <p className="mx-auto mt-4 max-w-2xl text-base text-cpm-text-secondary">{p.subtitle}</p>
            </div>
            <div className="relative rounded-2xl p-[1px]" style={{ background: "linear-gradient(135deg, rgba(200,169,106,0.3), rgba(200,169,106,0.05), rgba(200,169,106,0.3))" }}>
              <div className="rounded-2xl bg-cpm-bg-secondary p-6 sm:p-8">
                {/* Progress Steps */}
                <div className="mb-8 flex items-center justify-center gap-3">
                  {stepLabel(1, "Dates")}
                  <div className={`h-[1px] w-8 sm:w-12 transition-all duration-300 ${step > 1 ? "bg-cpm-accent" : "bg-cpm-border-hover"}`} />
                  {stepLabel(2, "Details")}
                  <div className={`h-[1px] w-8 sm:w-12 transition-all duration-300 ${step > 2 ? "bg-cpm-accent" : "bg-cpm-border-hover"}`} />
                  {stepLabel(3, "Review")}
                </div>

                <div className="space-y-5" style={{ animation: "fadeInUp 0.3s ease-out" }}>
                  {/* Step 1: Dates */}
                  {step === 1 && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                      <div>
                        <label className={labelCls}>Check-in {reqSpan}</label>
                        <input type="date" value={dates.checkIn} onChange={(e) => setDates({ ...dates, checkIn: e.target.value })} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Check-out {reqSpan}</label>
                        <input type="date" value={dates.checkOut} onChange={(e) => setDates({ ...dates, checkOut: e.target.value })} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Guests</label>
                        <select value={dates.guests} onChange={(e) => setDates({ ...dates, guests: e.target.value })} className={inputCls}>
                          {[1,2,3,4,5,6,7,8,9,10].map((n) => (<option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Personal Info */}
                  {step === 2 && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label className={labelCls}>Full Name {reqSpan}</label>
                        <input value={personal.name} onChange={(e) => setPersonal({ ...personal, name: e.target.value })} className={inputCls} placeholder="Your full name" />
                      </div>
                      <div>
                        <label className={labelCls}>Email {reqSpan}</label>
                        <input type="email" value={personal.email} onChange={(e) => setPersonal({ ...personal, email: e.target.value })} className={inputCls} placeholder="you@email.com" />
                      </div>
                      <div>
                        <label className={labelCls}>Phone</label>
                        <input value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} className={inputCls} placeholder="+356 XXXXXXXX" />
                      </div>
                      <div>
                        <label className={labelCls}>Property</label>
                        <select value={personal.propertyId} onChange={(e) => setPersonal({ ...personal, propertyId: e.target.value })} className={inputCls}>
                          <option value="">Any property</option>
                          <option value="valletta-1">Valletta Apartment 1</option>
                          <option value="valletta-2">Valletta Apartment 2</option>
                          <option value="bahar-ic-caghaq">Bahar ic-Caghaq Villa</option>
                          <option value="madliena">Madliena Event Space</option>
                          <option value="pieta">Pieta Apartment</option>
                          <option value="gzira">Gzira Apartment</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Special Requests</label>
                        <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className={`${inputCls} resize-none`} placeholder="Any special requests..." />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Review */}
                  {step === 3 && (
                    <div className="space-y-4 rounded-xl bg-cpm-bg-primary p-5">
                      <h3 className="text-sm font-semibold text-cpm-accent uppercase tracking-wider">Review Your Request</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-cpm-text-tertiary">Name:</span> <span className="text-cpm-text-primary">{personal.name || "—"}</span></div>
                        <div><span className="text-cpm-text-tertiary">Email:</span> <span className="text-cpm-text-primary">{personal.email || "—"}</span></div>
                        <div><span className="text-cpm-text-tertiary">Check-in:</span> <span className="text-cpm-text-primary">{dates.checkIn || "—"}</span></div>
                        <div><span className="text-cpm-text-tertiary">Check-out:</span> <span className="text-cpm-text-primary">{dates.checkOut || "—"}</span></div>
                        <div><span className="text-cpm-text-tertiary">Guests:</span> <span className="text-cpm-text-primary">{dates.guests}</span></div>
                        {nights > 0 && <div><span className="text-cpm-text-tertiary">Duration:</span> <span className="text-cpm-accent font-medium">{nights} night{nights > 1 ? "s" : ""}</span></div>}
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex gap-3 pt-2">
                    {step > 1 && (
                      <button onClick={() => setStep(step - 1)} className="flex-1 rounded-xl border border-cpm-border px-6 py-3.5 text-sm font-medium text-cpm-text-secondary transition-all duration-300 hover:border-cpm-accent/30 hover:text-cpm-text-primary">Back</button>
                    )}
                    <button onClick={handleSubmit} disabled={step === 3 && submitting} className="flex-[2] rounded-xl px-8 py-3.5 text-sm font-semibold text-cpm-bg-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,169,106,0.25)] active:scale-[0.98] disabled:opacity-50" style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-accent-hover))" }}>
                      {submitting ? (
                        <span className="inline-flex items-center gap-2">
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                          Submitting...
                        </span>
                      ) : step === 3 ? "Submit Booking Request" : "Continue"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  },
};

// ============================================================
// 7. PRICING TABLE
// ============================================================
const PricingTable = {
  label: "Pricing Table",
  fields: {
    heading: { type: "text" as const },
  },
  defaultProps: {
    heading: "Transparent Pricing, Maximum Value",
  },
  render: (props: Record<string, unknown>) => {
    const p = props as { heading: string };
    const essentialsFeatures = [
      "Multi-channel listing management",
      "Superhost status maintenance",
      "Seasonal dynamic pricing",
      "Reviews management",
      "24/7 guest communication",
      "Guest check-in & check-out",
      "Professional cleaning",
      "Maintenance coordination",
      "Payment collection & processing",
      "Eco-tax & utility management",
      "Damage claims handling",
    ];
    const completeExtra = [
      "Welcome amenities package",
      "Custom guest property manual",
      "Comprehensive property assessment",
      "Monthly reports included (saves €420+/year)",
      "Quarterly property reviews",
      "Priority operations support",
      "Owner dashboard access",
      "24/7 dedicated support line",
      "Direct booking page setup",
    ];
    const availableExtras = [
      { name: "Professional Photoshoot", price: "On request" },
      { name: "Deep Clean & Prep", price: "On request" },
      { name: "MTA Licensing", price: "€350" },
      { name: "Procurement & Styling", price: "€25/hr" },
      { name: "Mail Handling", price: "€10/mo" },
      { name: "Interior Design Consult", price: "On request" },
    ];
    return (
      <>
        <section className="bg-cpm-bg-primary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center" style={{ animation: "fadeInUp 0.6s ease-out" }}>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">
                {p.heading}
              </h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Essentials Plan */}
              <div
                className="rounded-2xl border border-cpm-border bg-cpm-bg-secondary p-8 transition-all duration-500 hover:-translate-y-1 hover:border-cpm-accent/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
                style={{ animation: "fadeInUp 0.6s ease-out 0.1s both" }}
              >
                <h3 className="mb-2 text-2xl font-light text-cpm-text-primary">Essentials</h3>
                <p className="mb-4 text-xs text-cpm-text-tertiary">Approx. €80-€250/month depending on occupancy</p>
                <div className="mb-6">
                  <span className="text-4xl font-light text-cpm-accent">15%</span>
                  <span className="ml-2 text-sm text-cpm-text-secondary">of Net Room Revenue</span>
                </div>
                <div className="mb-8 space-y-3">
                  {essentialsFeatures.map((f, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div
                        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                        style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-gold-dark))" }}
                      >
                        <svg className="h-2.5 w-2.5 text-cpm-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <span className="text-sm text-cpm-text-secondary">{f}</span>
                    </div>
                  ))}
                </div>
                {/* Not included in Essentials */}
                <div className="mt-4 border-t border-cpm-border pt-4">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-cpm-text-tertiary">Add with Complete:</p>
                  <div className="space-y-2.5">
                    {["Welcome amenities package", "Custom property manual", "Comprehensive property assessment", "Monthly reports included", "Quarterly property reviews", "Priority operations support", "Owner dashboard access", "24/7 dedicated support", "Direct booking page"].map((f, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-cpm-text-tertiary/30">
                          <svg className="h-2.5 w-2.5 text-cpm-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                        </div>
                        <span className="text-xs text-cpm-text-tertiary">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-cpm-bg-primary p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-cpm-text-tertiary">Available Extras</p>
                  <div className="space-y-2 text-sm text-cpm-text-secondary">
                    <p>Monthly Reports: <span className="text-cpm-accent">€35/month</span></p>
                    <p>Callout Fee: <span className="text-cpm-accent">€20/visit</span></p>
                  </div>
                </div>
                <a href="#contact" className="mt-6 block w-full rounded-xl border border-cpm-accent/30 bg-transparent px-6 py-3 text-center text-sm font-medium text-cpm-accent transition-all duration-300 hover:bg-cpm-accent hover:text-cpm-bg-primary hover:shadow-[0_0_20px_rgba(200,169,106,0.15)] active:scale-[0.98]">
                  Get Started
                </a>
              </div>

              {/* Complete Plan — highlighted with gradient border */}
              <div
                className="relative rounded-2xl bg-cpm-bg-secondary transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(200,169,106,0.12)]"
                style={{
                  animation: "fadeInUp 0.6s ease-out 0.2s both",
                  padding: 0,
                }}
              >
                {/* Gradient border via outer wrapper */}
                <div
                  className="rounded-2xl p-8"
                  style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-gold-dark), var(--cpm-accent))" }}
                >
                  <div className="rounded-xl bg-cpm-bg-secondary p-6">
                    {/* Most Popular badge */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <span
                        className="inline-block rounded-full px-4 py-1 text-xs font-bold text-cpm-bg-primary shadow-lg"
                        style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-accent-hover))" }}
                      >
                        Most Popular
                      </span>
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-cpm-success/10 px-3 py-1 text-xs font-medium text-cpm-success">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" /></svg>
                      Save €420+/year vs Essentials
                    </div>
                    <h3 className="mb-2 text-2xl font-light text-cpm-text-primary">Complete</h3>
                    <div className="mb-6">
                      <span
                        className="text-4xl font-light"
                        style={{
                          background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-text-primary))",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        18%
                      </span>
                      <span className="ml-2 text-sm text-cpm-text-secondary">of Net Room Revenue</span>
                    </div>
                    <div className="mb-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-cpm-accent">Everything in Essentials, plus:</p>
                    </div>
                    <div className="mb-8 space-y-3">
                      {completeExtra.map((f, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div
                            className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                            style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-gold-dark))" }}
                          >
                            <svg className="h-2.5 w-2.5 text-cpm-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </div>
                          <span className="text-sm text-cpm-text-primary">{f}</span>
                        </div>
                      ))}
                    </div>
                    <a
                      href="#contact"
                      className="block w-full rounded-xl px-6 py-3 text-center text-sm font-semibold text-cpm-bg-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,169,106,0.3)] active:scale-[0.98]"
                      style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-accent-hover))" }}
                    >
                      Get Started
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Extras Row */}
            <div
              className="mt-12 rounded-2xl border border-cpm-border bg-cpm-bg-secondary p-8"
              style={{ animation: "fadeInUp 0.6s ease-out 0.3s both" }}
            >
              <h3 className="mb-6 text-center text-lg font-medium text-cpm-text-primary">Additional Services</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {availableExtras.map((ex, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-cpm-border bg-cpm-bg-primary px-4 py-3.5 transition-all duration-300 hover:border-cpm-accent/20 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                  >
                    <span className="text-sm text-cpm-text-secondary">{ex.name}</span>
                    <span className="text-sm font-medium text-cpm-accent">{ex.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </>
    );
  },
};

// ============================================================
// 8. TESTIMONIAL SECTION
// ============================================================
const TestimonialSection = {
  label: "Testimonials",
  fields: {
    title: { type: "text" as const },
    testimonials: {
      type: "array" as const,
      label: "Testimonials",
      defaultItemProps: { name: "Guest", date: "", rating: "5", quote: "Great stay!" },
      getItemSummary: (item: Record<string, unknown>) => (item as { name?: string }).name || "Testimonial",
      arrayFields: {
        name: { type: "text" as const },
        date: { type: "text" as const },
        rating: { type: "select" as const, options: [{ label: "1 Star", value: "1" }, { label: "2 Stars", value: "2" }, { label: "3 Stars", value: "3" }, { label: "4 Stars", value: "4" }, { label: "5 Stars", value: "5" }] },
        quote: { type: "textarea" as const },
      },
    },
  },
  defaultProps: {
    title: "What Our Guests Say",
    testimonials: [
      { name: "Katie", date: "October 2024", rating: "5", quote: "Christiano was an amazing host and the apartment was flawless. Every detail was thoughtfully considered, from the welcome hamper to the spotless cleanliness. The location in Valletta was perfect for exploring Malta." },
      { name: "John", date: "September 2024", rating: "5", quote: "Communication was excellent from the moment I booked. The check-in process was seamless, and the apartment exceeded all expectations. The attention to detail really sets Christiano apart." },
      { name: "Sarah & Mark", date: "August 2024", rating: "5", quote: "From the beautifully appointed apartment to the comprehensive local guide, everything was perfect. Christiano's responsiveness and genuine care made this a five-star experience." },
      { name: "Eric", date: "October 2024", rating: "5", quote: "Exceptional service from start to finish. The property was immaculate, well-equipped, and perfectly located. Felt like staying at a luxury hotel with the comfort of a home." },
    ],
  },
  Component: (props: Record<string, unknown>) => {
    const p = props as { title: string; testimonials: { name: string; date: string; rating: string; quote: string }[] };
    const [active, setActive] = React.useState(0);
    const [paused, setPaused] = React.useState(false);
    const items = p.testimonials || [];

    React.useEffect(() => {
      if (paused || items.length <= 2) return;
      const timer = setInterval(() => { setActive((a) => (a + 1) % Math.ceil(items.length / 2)); }, 6000);
      return () => clearInterval(timer);
    }, [paused, items.length]);

    const perPage = 2;
    const maxIndex = Math.max(0, Math.ceil(items.length / perPage) - 1);
    const visible = items.slice(active * perPage, active * perPage + perPage);

    const avatarColors = [
      "from-cpm-accent to-cpm-gold-dark",
      "from-cpm-accent-hover to-cpm-accent",
      "from-[#b8944f] to-[#8a6e30]",
      "from-[#e0c88a] to-cpm-accent",
    ];

    const prev = () => setActive((a) => (a > 0 ? a - 1 : maxIndex));
    const next = () => setActive((a) => (a < maxIndex ? a + 1 : 0));

    return (
      <>
        <section className="relative bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32 overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}>
          <div className="pointer-events-none absolute top-12 right-12 text-[200px] leading-none font-serif opacity-[0.03] text-cpm-accent select-none hidden lg:block">&ldquo;</div>
          <div className="relative mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.title}</h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
            </div>
            <div className="relative">
              {/* Nav arrows */}
              {maxIndex > 0 && (
                <>
                  <button onClick={prev} className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 hidden lg:flex h-10 w-10 items-center justify-center rounded-full border border-cpm-border bg-cpm-bg-secondary text-cpm-text-secondary transition-all hover:border-cpm-accent/30 hover:text-cpm-accent" aria-label="Previous">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
                  </button>
                  <button onClick={next} className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 hidden lg:flex h-10 w-10 items-center justify-center rounded-full border border-cpm-border bg-cpm-bg-secondary text-cpm-text-secondary transition-all hover:border-cpm-accent/30 hover:text-cpm-accent" aria-label="Next">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                  </button>
                </>
              )}
              <div className="grid gap-6 sm:grid-cols-2" style={{ animation: "carouselSlide 0.4s ease-out" }} key={active}>
                {visible.map((t, i) => {
                  const rating = parseInt(t.rating) || 5;
                  const globalIdx = active * perPage + i;
                  return (
                    <div key={globalIdx} className="group rounded-2xl border border-cpm-border bg-cpm-bg-primary p-6 transition-all duration-500 hover:-translate-y-1 hover:border-cpm-accent/30 hover:shadow-[0_8px_30px_rgba(200,169,106,0.06)]">
                      <div className="mb-4 flex gap-1">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <svg key={j} className={`h-4 w-4 transition-transform duration-200 hover:scale-125 ${j < rating ? "text-cpm-accent" : "text-cpm-text-tertiary"}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        ))}
                      </div>
                      <p className="mb-5 text-sm leading-[1.8] text-cpm-text-secondary italic">&ldquo;{t.quote}&rdquo;</p>
                      <div className="flex items-center gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${avatarColors[globalIdx % avatarColors.length]}`}>
                          <span className="text-sm font-bold text-cpm-bg-primary">{(t.name || "?")[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-cpm-text-primary">{t.name}</p>
                          <p className="text-xs text-cpm-text-tertiary">{t.date}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Dots */}
              {maxIndex > 0 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                    <button key={i} onClick={() => setActive(i)} className={`h-2 rounded-full transition-all duration-300 ${i === active ? "w-6 bg-cpm-accent" : "w-2 bg-cpm-border-hover hover:bg-cpm-text-tertiary"}`} aria-label={`Go to slide ${i + 1}`} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </>
    );
  },
};

// ============================================================
// 9. FAQ SECTION
// ============================================================
const FaqSection = {
  label: "FAQ Section",
  fields: {
    title: { type: "text" as const },
    items: {
      type: "array" as const,
      label: "FAQ Items",
      defaultItemProps: { question: "Question?", answer: "Answer." },
      getItemSummary: (item: Record<string, unknown>) => (item as { question?: string }).question || "FAQ",
      arrayFields: {
        question: { type: "text" as const },
        answer: { type: "textarea" as const },
      },
    },
  },
  defaultProps: {
    title: "Your Questions, Answered",
    items: [
      { question: "What types of properties do you manage?", answer: "We manage luxury apartments in Valletta, villas in Bahar ic-Caghaq, and unique event spaces in Madliena. We focus on properties that meet our high quality standards." },
      { question: "How do you handle guest communication?", answer: "We provide 24/7 guest communication across all major booking platforms. We respond within minutes, not hours." },
      { question: "What is included in your management services?", answer: "Multi-channel listing, dynamic pricing, guest communication, check-in/out, professional cleaning, maintenance, payment processing, reviews management, and monthly reports." },
      { question: "How do you ensure property quality?", answer: "Thorough assessments, regular maintenance, professional cleaning between stays, and immediate issue resolution. Quarterly property reviews ensure excellence." },
      { question: "How do you set rental prices?", answer: "Advanced dynamic pricing considering seasonal demand, local events, competitor analysis, and historical data to maximise occupancy and revenue." },
      { question: "What are your fees?", answer: "Essentials: 15% of net room revenue. Complete: 18%. No hidden fees or markups. Transparent pricing aligned with your success." },
      { question: "How often will I receive updates?", answer: "Essentials: monthly reports. Complete: monthly reports + quarterly reviews. Plus owner dashboard for real-time insights." },
      { question: "How do I get started?", answer: "Contact us for a free property assessment. We'll visit, discuss goals, and provide a personalised proposal. Smooth onboarding, we handle all setup." },
    ],
  },
  Component: (props: Record<string, unknown>) => {
    const p = props as { title: string; items: { question: string; answer: string }[] };
    const [search, setSearch] = React.useState("");
    const [allOpen, setAllOpen] = React.useState(false);
    const allItems = React.useRef<HTMLDetailsElement[]>([]);
    
    const filtered = (p.items || []).filter(
      (item) => !search || item.question.toLowerCase().includes(search.toLowerCase()) || item.answer.toLowerCase().includes(search.toLowerCase())
    );

    React.useEffect(() => {
      allItems.current.forEach((el) => { if (el) el.open = allOpen; });
    }, [allOpen]);

    return (
      <>
        <section className="bg-cpm-bg-primary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.title}</h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
            </div>
            {/* Search */}
            <div className="mx-auto mb-6 max-w-md">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cpm-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search questions..." className="w-full rounded-xl border border-cpm-border bg-cpm-bg-secondary py-3 pl-10 pr-4 text-sm text-cpm-text-primary outline-none transition-all focus:border-cpm-accent/50 placeholder-cpm-text-tertiary" />
              </div>
            </div>
            {/* Controls */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-cpm-text-tertiary">{filtered.length} of {(p.items || []).length} questions</p>
              <button onClick={() => setAllOpen(!allOpen)} className="text-xs font-medium text-cpm-accent transition-colors hover:text-cpm-accent-hover">{allOpen ? "Collapse All" : "Expand All"}</button>
            </div>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {filtered.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-cpm-text-tertiary">No questions match your search.</div>
              ) : filtered.map((item, i) => (
                <details
                  key={i}
                  ref={(el) => { if (el) allItems.current[i] = el; }}
                  open={allOpen}
                  className="group rounded-xl border border-cpm-border bg-cpm-bg-secondary transition-all duration-300 hover:border-cpm-accent/20"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-cpm-text-primary list-none select-none">
                    <span>{item.question}</span>
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cpm-accent/30 text-cpm-accent transition-all duration-300 group-open:border-cpm-accent group-open:bg-cpm-accent/10">
                      <svg className="h-3.5 w-3.5 transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </summary>
                  <div className="px-5 pb-4 pt-0">
                    <div className="border-l-2 border-cpm-accent/40 pl-4 pt-1">
                      <p className="text-sm leading-[1.8] text-cpm-text-secondary">{item.answer}</p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  },
};

// ============================================================
// 10. CONTACT SECTION
// ============================================================
const ContactSection = {
  label: "Contact Section",
  fields: {
    title: { type: "text" as const },
    email: { type: "text" as const },
    phone: { type: "text" as const },
    whatsapp: { type: "text" as const },
    location: { type: "text" as const },
    mapLat: { type: "text" as const, label: "Map Latitude" },
    mapLng: { type: "text" as const, label: "Map Longitude" },
  },
  defaultProps: {
    title: "Contact Us",
    email: CONTACT.email,
    phone: CONTACT.phone,
    whatsapp: CONTACT.whatsapp,
    location: CONTACT.location,
    mapLat: CONTACT.mapCoords.lat,
    mapLng: CONTACT.mapCoords.lng,
  },
  Component: (props: Record<string, unknown>) => {
    const p = props as { title: string; email: string; phone: string; whatsapp: string; location: string; mapLat: string; mapLng: string };
    const [submitting, setSubmitting] = React.useState(false);
    const [submitted, setSubmitted] = React.useState(false);
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      setSubmitting(true);
      try {
        const r = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formData.get("name"), email: formData.get("email"), message: formData.get("message") }),
        });
        if (r.ok) { toast.success("Message sent! We'll reply soon."); setSubmitted(true); }
        else { toast.error("Something went wrong. Please try again."); }
      } catch { toast.error("Network error. Please check your connection and try again."); }
      finally { setSubmitting(false); }
    };
    return (
      <>
        <section className="bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center" style={{ animation: "fadeInUp 0.6s ease-out" }}>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">
                {p.title}
              </h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
            </div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3" style={{ animation: "fadeInUp 0.6s ease-out 0.2s both" }}>
              {/* Contact Form — Glassmorphism */}
              {submitted ? (
                <div
                  className="flex flex-col items-center justify-center rounded-2xl border border-cpm-success/20 p-8 backdrop-blur-xl text-center"
                  style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.05), rgba(14,15,17,0.9))" }}
                >
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-cpm-success/30 bg-cpm-success/10" style={{ animation: "glowPulse 2s ease-in-out infinite" }}>
                    <svg className="h-8 w-8 text-cpm-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-cpm-text-primary">Message Sent!</h3>
                  <p className="mb-6 text-sm text-cpm-text-secondary">We'll get back to you within 24 hours.</p>
                  <button onClick={() => setSubmitted(false)} className="rounded-xl border border-cpm-accent/30 bg-cpm-accent/5 px-5 py-2.5 text-sm font-medium text-cpm-accent transition-all hover:bg-cpm-accent hover:text-cpm-bg-primary">Send Another Message</button>
                </div>
              ) : (
                <form
                  className="space-y-4 rounded-2xl border border-cpm-accent/10 p-6 backdrop-blur-xl"
                  style={{ background: "linear-gradient(135deg, rgba(21,23,27,0.95), rgba(14,15,17,0.9))" }}
                  onSubmit={handleSubmit}
                >
                  <h3 className="mb-2 text-lg font-medium text-cpm-text-primary">Send a Message</h3>
                  <div>
                    <label htmlFor="contact-name" className="mb-1 block text-sm text-cpm-text-secondary">Name <span className="text-cpm-accent">*</span></label>
                    <input id="contact-name" name="name" required className="w-full rounded-xl border border-cpm-border bg-cpm-bg-secondary px-4 py-2.5 text-sm text-cpm-text-primary outline-none transition-all duration-300 focus:border-cpm-accent/50 focus:shadow-[0_0_0_3px_rgba(200,169,106,0.1)]" />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="mb-1 block text-sm text-cpm-text-secondary">Email <span className="text-cpm-accent">*</span></label>
                    <input id="contact-email" name="email" type="email" required className="w-full rounded-xl border border-cpm-border bg-cpm-bg-secondary px-4 py-2.5 text-sm text-cpm-text-primary outline-none transition-all duration-300 focus:border-cpm-accent/50 focus:shadow-[0_0_0_3px_rgba(200,169,106,0.1)]" />
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="mb-1 block text-sm text-cpm-text-secondary">Message <span className="text-cpm-accent">*</span></label>
                    <textarea id="contact-message" name="message" required rows={4} className="w-full rounded-xl border border-cpm-border bg-cpm-bg-secondary px-4 py-2.5 text-sm text-cpm-text-primary outline-none resize-none transition-all duration-300 focus:border-cpm-accent/50 focus:shadow-[0_0_0_3px_rgba(200,169,106,0.1)]" />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-cpm-bg-primary transition-all duration-300 hover:shadow-[0_0_25px_rgba(200,169,106,0.2)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none"
                    style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-accent-hover))" }}
                  >
                    {submitting && (
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    )}
                    {submitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}

              {/* Contact Info — Glassmorphism */}
              <div
                className="rounded-2xl border border-cpm-accent/10 p-6 backdrop-blur-xl"
                style={{ background: "linear-gradient(135deg, rgba(21,23,27,0.95), rgba(14,15,17,0.9))" }}
              >
                <h3 className="mb-6 text-lg font-medium text-cpm-text-primary">Get in Touch</h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-cpm-text-primary transition-transform duration-300 hover:scale-110"
                      style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-gold-dark))" }}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-cpm-text-tertiary">Email</p>
                      <a href={`mailto:${p.email}`} className="text-sm text-cpm-accent transition-colors hover:text-cpm-text-primary">{p.email}</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-cpm-text-primary transition-transform duration-300 hover:scale-110"
                      style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-gold-dark))" }}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-cpm-text-tertiary">Phone</p>
                      <a href={`tel:${p.phone}`} className="text-sm text-cpm-accent transition-colors hover:text-cpm-text-primary">{p.phone}</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-cpm-text-primary transition-transform duration-300 hover:scale-110"
                      style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-gold-dark))" }}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-cpm-text-tertiary">WhatsApp</p>
                      <a href={`https://wa.me/${p.whatsapp?.replace(/\+/g, "")}`} className="text-sm text-cpm-accent transition-colors hover:text-cpm-text-primary">{p.whatsapp}</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-cpm-text-primary transition-transform duration-300 hover:scale-110"
                      style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-gold-dark))" }}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-cpm-text-tertiary">Location</p>
                      <p className="text-sm text-cpm-text-primary">{p.location}</p>
                    </div>
                  </div>
                  {/* Working Hours */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-cpm-text-primary transition-transform duration-300 hover:scale-110" style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-gold-dark))" }}>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                    </div>
                    <div>
                      <p className="text-xs text-cpm-text-tertiary">Working Hours</p>
                      <p className="text-sm text-cpm-text-secondary">Mon–Fri: 9am – 6pm</p>
                      <p className="text-xs text-cpm-text-tertiary">Sat: 10am – 2pm</p>
                    </div>
                  </div>
                  {/* Social Media Links */}
                  <div className="pt-2">
                    <p className="mb-3 text-xs uppercase tracking-wider text-cpm-text-tertiary">Follow Us</p>
                    <div className="flex gap-3">
                      <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg border border-cpm-border bg-cpm-bg-primary text-cpm-text-secondary transition-all duration-300 hover:border-cpm-accent/30 hover:text-cpm-accent">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      </a>
                      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg border border-cpm-border bg-cpm-bg-primary text-cpm-text-secondary transition-all duration-300 hover:border-cpm-accent/30 hover:text-cpm-accent">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                      </a>
                      <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg border border-cpm-border bg-cpm-bg-primary text-cpm-text-secondary transition-all duration-300 hover:border-cpm-accent/30 hover:text-cpm-accent">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="overflow-hidden rounded-2xl border border-cpm-border transition-all duration-300 hover:border-cpm-accent/20">
                <iframe
                  src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${p.mapLng}!3d${p.mapLat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s${encodeURIComponent(p.location)}!5e0!3m2!1sen!2s!4v1`}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "380px" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Location Map"
                />
              </div>
            </div>
          </div>
        </section>
      </>
    );
  },
};

// ============================================================
// 11. LOGO BAR
// ============================================================
const LogoBar = {
  label: "Logo Bar",
  fields: {
    title: { type: "text" as const },
    logos: {
      type: "array" as const,
      label: "Partner Logos",
      defaultItemProps: { name: "Partner", style: "serif" },
      getItemSummary: (item: Record<string, unknown>) => (item as { name?: string }).name || "Partner",
      arrayFields: {
        name: { type: "text" as const },
        style: { type: "select" as const, options: [{ label: "Serif", value: "serif" }, { label: "Sans", value: "sans" }, { label: "Bold Sans", value: "bold" }] },
      },
    },
  },
  defaultProps: {
    title: "Listed On Leading Platforms",
    logos: [
      { name: "Airbnb", style: "bold" },
      { name: "Booking.com", style: "sans" },
      { name: "VRBO", style: "bold" },
      { name: "TripAdvisor", style: "serif" },
      { name: "Google Travel", style: "sans" },
      { name: "Expedia", style: "sans" },
    ],
  },
  render: (props: Record<string, unknown>) => {
    const p = props as { title: string; logos: { name: string; style: string }[] };
    const logos = p.logos || [];
    const doubled = [...logos, ...logos];
    const fontCls = (style: string) => {
      if (style === "serif") return "font-[family-name:var(--font-heading)] italic tracking-wide";
      if (style === "bold") return "font-black tracking-wider uppercase text-[15px]";
      return "font-medium tracking-wide";
    };
    return (
      <>
        <section className="relative bg-cpm-bg-primary px-4 py-16 sm:px-8 overflow-hidden">
          <div className="mx-auto max-w-5xl">
            <p className="mb-10 text-center text-xs font-semibold uppercase tracking-[0.2em] text-cpm-text-tertiary">
              <span className="inline-flex items-center gap-3">
                <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-cpm-border-hover" />
                {p.title}
                <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-cpm-border-hover" />
              </span>
            </p>
            <div className="relative">
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-r from-cpm-bg-primary to-transparent" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-l from-cpm-bg-primary to-transparent" />
              <div className="flex overflow-hidden">
                <div className="flex shrink-0 items-center gap-20" style={{ animation: "marquee 30s linear infinite" }}>
                  {doubled.map((logo, i) => (
                    <div key={`a-${i}`} className="flex items-center gap-3 whitespace-nowrap transition-all duration-500 hover:opacity-100 group">
                      <span className={`text-[18px] ${fontCls(logo.style)} opacity-40 text-cpm-text-primary transition-all duration-500 group-hover:opacity-100 group-hover:text-cpm-accent`}>
                        {logo.name}
                      </span>
                      <div className="h-1 w-1 rounded-full bg-cpm-border-hover group-hover:bg-cpm-accent transition-colors duration-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  },
};

// ============================================================
// 12. CTA BANNER
// ============================================================
const CtaBanner = {
  label: "CTA Banner",
  fields: {
    heading: { type: "text" as const },
    description: { type: "textarea" as const },
    buttonText: { type: "text" as const, label: "Button Text" },
    buttonLink: { type: "text" as const, label: "Button Link" },
  },
  defaultProps: {
    heading: "Partner with Confidence",
    description: "Join the growing number of property owners who trust Christiano Property Management to maximise their rental income while preserving their property's value and character.",
    buttonText: "Contact Us Today",
    buttonLink: "#contact",
  },
  render: (props: Record<string, unknown>) => {
    const p = props as { heading: string; description: string; buttonText: string; buttonLink: string };
    return (
      <>
        <section className="relative bg-cpm-bg-primary px-4 py-20 sm:px-8 overflow-hidden">
          <div className="mx-auto max-w-4xl" style={{ animation: "scaleIn 0.6s ease-out" }}>
            {/* Glassmorphism card */}
            <div
              className="relative rounded-2xl p-12 text-center backdrop-blur-xl overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(200,169,106,0.08), rgba(200,169,106,0.03))", border: "1px solid rgba(200,169,106,0.15)" }}
            >
              {/* Top gradient accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: "linear-gradient(90deg, transparent, var(--cpm-accent), transparent)" }}
              />
              {/* Traveling gold line animation */}
              <div className="absolute top-0 left-0 h-[2px] w-1/3 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" style={{ animation: "marquee 4s linear infinite" }} />
              {/* Corner accent decorations */}
              <div className="absolute top-0 left-0 h-6 w-[2px] bg-gradient-to-b from-cpm-accent/60 to-transparent" />
              <div className="absolute top-0 left-0 h-[2px] w-6 bg-gradient-to-r from-cpm-accent/60 to-transparent" />
              <div className="absolute top-0 right-0 h-6 w-[2px] bg-gradient-to-b from-cpm-accent/60 to-transparent" />
              <div className="absolute top-0 right-0 h-[2px] w-6 bg-gradient-to-l from-cpm-accent/60 to-transparent" />
              <div className="absolute bottom-0 left-0 h-6 w-[2px] bg-gradient-to-t from-cpm-accent/60 to-transparent" />
              <div className="absolute bottom-0 left-0 h-[2px] w-6 bg-gradient-to-r from-cpm-accent/60 to-transparent" />
              <div className="absolute bottom-0 right-0 h-6 w-[2px] bg-gradient-to-t from-cpm-accent/60 to-transparent" />
              <div className="absolute bottom-0 right-0 h-[2px] w-6 bg-gradient-to-l from-cpm-accent/60 to-transparent" />
              {/* Decorative geometric elements */}
              <div
                className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full opacity-10"
                style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-gold-dark))", animation: "float 6s ease-in-out infinite" }}
              />
              <div
                className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full opacity-5"
                style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-gold-dark))", animation: "float 8s ease-in-out infinite 2s" }}
              />
              <div className="relative z-10">
                <h2 className="mb-4 font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">
                  {p.heading}
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-cpm-text-secondary">{p.description}</p>
                {p.buttonText && (
                  <a
                    href={safeHref(p.buttonLink)}
                    className="group inline-flex items-center gap-2.5 rounded-xl px-8 py-3.5 text-sm font-semibold text-cpm-bg-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,169,106,0.3)] active:scale-[0.98]"
                    style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-accent-hover))" }}
                  >
                    {p.buttonText}
                    <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </>
    );
  },
};

// ============================================================
// 13. STATS SECTION
// ============================================================
const StatsSection = {
  label: "Stats Section",
  fields: {
    stats: {
      type: "array" as const,
      label: "Stats",
      defaultItemProps: { value: "100+", label: "Metric", icon: "star" },
      getItemSummary: (item: Record<string, unknown>) => `${(item as { value?: string }).value} - ${(item as { label?: string }).label}`,
      arrayFields: {
        value: { type: "text" as const },
        label: { type: "text" as const },
        icon: { type: "select" as const, options: [{ label: "Calendar", value: "calendar" }, { label: "Building", value: "building" }, { label: "Users", value: "users" }, { label: "Star", value: "star" }, { label: "Trending Up", value: "trending" }, { label: "Award", value: "award" }] },
      },
    },
  },
  defaultProps: {
    stats: [
      { value: "9+", label: "Years Experience", icon: "calendar" },
      { value: "50+", label: "Properties Managed", icon: "building" },
      { value: "1000+", label: "Happy Guests", icon: "users" },
      { value: "4.9", label: "Average Rating", icon: "star" },
    ],
  },
  Component: (props: Record<string, unknown>) => {
    const p = props as { stats: { value: string; label: string; icon: string }[] };
    const [visible, setVisible] = React.useState(false);
    const [counts, setCounts] = React.useState<Record<string, number>>({});
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
      }, { threshold: 0.3 });
      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    }, []);

    React.useEffect(() => {
      if (!visible) return;
      const targets: Record<string, number> = {};
      (p.stats || []).forEach((stat, i) => {
        const numStr = stat.value.replace(/[^0-9.]/g, "");
        targets[i] = parseFloat(numStr) || 0;
      });
      const duration = 2000;
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const updated: Record<string, number> = {};
        Object.entries(targets).forEach(([k, target]) => {
          updated[k] = Math.round(target * eased * 10) / 10;
        });
        setCounts(updated);
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, [visible, p.stats]);

    const iconPaths: Record<string, string> = {
      calendar: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5",
      building: "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z",
      users: "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z",
      star: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z",
      trending: "M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941",
      award: "M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.043 6.043 0 0 1-2.54.89m0 0c-.732.085-1.472.085-2.21 0",
    };

    const formatValue = (value: string, count: number) => {
      if (value.includes("+")) return `${Math.round(count)}+`;
      if (value.includes(".")) return count.toFixed(1);
      return String(Math.round(count));
    };

    return (
      <>
        <section ref={ref} className="relative bg-cpm-bg-secondary px-4 py-24 sm:px-8 overflow-hidden">
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full opacity-[0.04] blur-3xl" style={{ background: "radial-gradient(circle, var(--cpm-accent), transparent)" }} />
          <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-8 lg:grid-cols-4">
            {(p.stats || []).map((stat, i) => (
              <div
                key={i}
                className="group text-center"
                style={{ animation: `scaleIn 0.6s ease-out ${i * 0.15}s both` }}
              >
                {/* Icon */}
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cpm-accent/10 bg-cpm-accent/5 transition-all duration-500 group-hover:border-cpm-accent/30 group-hover:bg-cpm-accent/10 group-hover:shadow-[0_0_25px_rgba(200,169,106,0.1)]">
                  <svg className="h-6 w-6 text-cpm-accent transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d={iconPaths[stat.icon] || iconPaths.star} />
                  </svg>
                </div>
                {/* Number */}
                <div
                  className="font-[family-name:var(--font-heading)] text-4xl font-light sm:text-5xl transition-transform duration-300 group-hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-text-primary))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {visible ? formatValue(stat.value, counts[i] || 0) : stat.value}
                </div>
                <div className="mx-auto mt-3 h-[2px] w-12 bg-gradient-to-r from-transparent via-cpm-accent to-transparent transition-all duration-300 group-hover:w-16" />
                <div className="mt-3 text-sm text-cpm-text-secondary transition-colors duration-300 group-hover:text-cpm-text-primary">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>
      </>
    );
  },
};

// ============================================================
// 14. FOOTER SECTION
// ============================================================
const FooterSection = {
  label: "Footer Section",
  fields: {
    logoUrl: { type: "text" as const, label: "Logo URL" },
    copyright: { type: "text" as const },
    email: { type: "text" as const },
    phone: { type: "text" as const },
    description: { type: "textarea" as const, label: "Footer Description" },
    facebookUrl: { type: "text" as const, label: "Facebook URL" },
    instagramUrl: { type: "text" as const, label: "Instagram URL" },
    linkedinUrl: { type: "text" as const, label: "LinkedIn URL" },
  },
  defaultProps: {
    logoUrl: LOGO_URL,
    copyright: COPYRIGHT,
    email: CONTACT.email,
    phone: CONTACT.phone,
    description: "Luxury short-term rental management across Malta. Transparent fees, no hidden markups, full-service operations.",
    facebookUrl: SOCIAL.facebook,
    instagramUrl: SOCIAL.instagram,
    linkedinUrl: SOCIAL.linkedin,
  },
  render: (props: Record<string, unknown>) => {
    const p = props as { logoUrl: string; copyright: string; email: string; phone: string; description: string; facebookUrl: string; instagramUrl: string; linkedinUrl: string };
    const links = [
      { label: "Home", href: "#home" },
      { label: "About", href: "#about" },
      { label: "Properties", href: "#properties" },
      { label: "Book Direct", href: "#book" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
      { label: "Contact", href: "#contact" },
      { label: "Testimonials", href: "#testimonials" },
    ];
    return (
      <>
        <footer className="mt-auto border-t border-cpm-border bg-cpm-bg-primary px-4 py-16 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2 lg:col-span-1">
                <img src={p.logoUrl || LOGO_URL} alt="Christiano Property Management" className="mb-4 h-12 w-auto object-contain" loading="lazy" />
                <p className="text-sm leading-relaxed text-cpm-text-secondary">
                  {p.description || "Luxury short-term rental management across Malta. Transparent fees, no hidden markups, full-service operations."}
                </p>
                {/* Newsletter */}
                <form
                  className="mt-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const email = (form.elements.namedItem("newsletter-email") as HTMLInputElement)?.value;
                    if (email) { toast.success("Subscribed! You'll hear from us soon."); form.reset(); }
                  }}
                >
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-cpm-text-tertiary">Stay Updated</p>
                  <div className="flex gap-2">
                    <input name="newsletter-email" type="email" required placeholder="Your email" className="w-full rounded-lg border border-cpm-border bg-cpm-bg-secondary px-3 py-2 text-sm text-cpm-text-primary outline-none transition-all focus:border-cpm-accent/50 placeholder-cpm-text-tertiary" />
                    <button type="submit" className="shrink-0 rounded-lg bg-cpm-accent px-4 py-2 text-xs font-semibold text-cpm-bg-primary transition-all hover:bg-cpm-accent-hover active:scale-[0.97]">Subscribe</button>
                  </div>
                </form>
                <div className="mt-4 h-[2px] w-12 bg-gradient-to-r from-cpm-accent to-transparent" />
              </div>
              <div>
                <h4 className="mb-4 text-sm font-semibold text-cpm-text-primary">Quick Links</h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.href}>
                      <a href={link.href} className="text-sm text-cpm-text-secondary transition-all duration-200 hover:text-cpm-accent hover:pl-1">{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-4 text-sm font-semibold text-cpm-text-primary">Contact</h4>
                <div className="space-y-3 text-sm text-cpm-text-secondary">
                  <a href={`mailto:${p.email}`} className="block transition-colors hover:text-cpm-accent">{p.email}</a>
                  <a href={`tel:${p.phone}`} className="block transition-colors hover:text-cpm-accent">{p.phone}</a>
                  <p>{CONTACT.location}</p>
                </div>
              </div>
              <div>
                <h4 className="mb-4 text-sm font-semibold text-cpm-text-primary">Follow Us</h4>
                <div className="flex gap-3">
                  <a href={safeHref(p.facebookUrl, "https://facebook.com")} aria-label="Facebook" className="group flex h-10 w-10 items-center justify-center rounded-xl border border-cpm-border text-cpm-text-secondary transition-all duration-300 hover:border-cpm-accent/30 hover:text-cpm-accent hover:shadow-[0_0_15px_rgba(200,169,106,0.1)]">
                    <svg className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                  <a href={safeHref(p.instagramUrl, "https://instagram.com")} aria-label="Instagram" className="group flex h-10 w-10 items-center justify-center rounded-xl border border-cpm-border text-cpm-text-secondary transition-all duration-300 hover:border-cpm-accent/30 hover:text-cpm-accent hover:shadow-[0_0_15px_rgba(200,169,106,0.1)]">
                    <svg className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </a>
                  <a href={safeHref(p.linkedinUrl, "https://linkedin.com")} aria-label="LinkedIn" className="group flex h-10 w-10 items-center justify-center rounded-xl border border-cpm-border text-cpm-text-secondary transition-all duration-300 hover:border-cpm-accent/30 hover:text-cpm-accent hover:shadow-[0_0_15px_rgba(200,169,106,0.1)]">
                    <svg className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-12 flex items-center justify-between border-t border-cpm-border pt-8">
              <p className="text-sm text-cpm-text-tertiary">{p.copyright}</p>
              <a href="#home" className="group flex items-center gap-1.5 text-xs font-medium text-cpm-text-tertiary transition-colors hover:text-cpm-accent">
                Back to Top
                <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
              </a>
            </div>
          </div>
        </footer>
      </>
    );
  },
};

// ============================================================
// 15. DIVIDER
// ============================================================
const Divider = {
  label: "Divider",
  fields: {
    title: { type: "text" as const },
  },
  defaultProps: {
    title: "",
  },
  render: (props: Record<string, unknown>) => {
    const p = props as { title: string };
    if (p.title) {
      return (
        <>
            <div className="flex items-center gap-4 px-4 py-8 sm:px-8">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-cpm-accent/30 to-cpm-accent/30" />
            <span className="text-xs font-medium uppercase tracking-[0.15em] text-cpm-text-tertiary">{p.title}</span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-cpm-accent/30 to-cpm-accent/30" />
          </div>
        </>
      );
    }
    return (
      <>
        <div className="flex items-center justify-center px-4 py-8 sm:px-8">
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cpm-accent/20 to-transparent" />
          <div className="mx-3 h-2 w-2 rotate-45 rounded-sm bg-cpm-accent/40" style={{ animation: "dotPulse 2s ease-in-out infinite" }} />
          <div className="h-[1px] w-full bg-gradient-to-l from-transparent via-cpm-accent/20 to-transparent" />
        </div>
      </>
    );
  },
};

// ============================================================
// GUESTY BOOKING ENGINE BLOCKS
// ============================================================

// 16. GUESTY PROPERTY SEARCH
const GuestyPropertySearch = {
  label: "Guesty · Property Search",
  fields: {
    title: { type: "text" as const },
    subtitle: { type: "textarea" as const },
    buttonText: { type: "text" as const, label: "Search Button Text" },
  },
  defaultProps: {
    title: "Find Your Perfect Stay",
    subtitle: "Search our curated collection of luxury properties across Malta",
    buttonText: "Search Properties",
  },
  Component: (props: Record<string, unknown>) => {
    const p = props as { title: string; subtitle: string; buttonText: string };
    const [location, setLocation] = React.useState("");
    const [checkIn, setCheckIn] = React.useState("");
    const [checkOut, setCheckOut] = React.useState("");
    const [guests, setGuests] = React.useState("2");
    const [minPrice, setMinPrice] = React.useState("");
    const [maxPrice, setMaxPrice] = React.useState("");
    const [showAdvanced, setShowAdvanced] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => { setMounted(true); }, []);

    const handleSearch = () => {
      if (!location && !checkIn && !checkOut) {
        toast.error("Please enter at least a location or dates");
        return;
      }
      if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
        toast.error("Check-out must be after check-in");
        return;
      }
      const detail: Record<string, string | number> = {};
      if (location) detail.location = location;
      if (checkIn) detail.checkIn = checkIn;
      if (checkOut) detail.checkOut = checkOut;
      detail.guests = parseInt(guests) || 2;
      if (minPrice) detail.minPrice = parseInt(minPrice);
      if (maxPrice) detail.maxPrice = parseInt(maxPrice);
      window.dispatchEvent(new CustomEvent("guesty-search", { detail }));
      toast.success("Searching properties...");
    };

    if (!mounted) {
      return (
        <section className="bg-cpm-bg-primary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-4xl animate-pulse">
            <div className="mb-4 h-8 w-64 rounded bg-cpm-border" />
            <div className="mb-8 h-4 w-96 rounded bg-cpm-border" />
            <div className="h-32 rounded-2xl bg-cpm-bg-secondary" />
          </div>
        </section>
      );
    }

    const inputCls = "w-full rounded-xl border border-cpm-border bg-cpm-bg-primary py-3 pl-10 pr-4 text-sm text-cpm-text-primary placeholder-cpm-text-tertiary outline-none transition-all duration-300 focus:border-cpm-accent/50 focus:shadow-[0_0_0_3px_rgba(200,169,106,0.1)]";
    const inputNoIconCls = "w-full rounded-xl border border-cpm-border bg-cpm-bg-primary py-3 px-4 text-sm text-cpm-text-primary placeholder-cpm-text-tertiary outline-none transition-all duration-300 focus:border-cpm-accent/50 focus:shadow-[0_0_0_3px_rgba(200,169,106,0.1)]";

    return (
      <>
        <section className="relative bg-cpm-bg-primary px-4 py-20 sm:px-8 lg:py-32 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, var(--cpm-accent) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-cpm-accent/5 blur-3xl" style={{ animation: "float 6s ease-in-out infinite" }} />

          <div className="relative mx-auto max-w-4xl" style={{ animation: "fadeInUp 0.6s ease-out" }}>
            <div className="mb-12 text-center">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.title}</h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
              <p className="mx-auto mt-4 max-w-2xl text-base text-cpm-text-secondary">{p.subtitle}</p>
            </div>

            <div className="rounded-2xl border border-cpm-accent/10 p-6 sm:p-8 backdrop-blur-xl" style={{ background: "linear-gradient(135deg, rgba(21,23,27,0.95), rgba(14,15,17,0.9))" }}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="lg:col-span-1">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-cpm-text-tertiary">Where</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cpm-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City or location" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-cpm-text-tertiary">Check-in</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cpm-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                    <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-cpm-text-tertiary">Check-out</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cpm-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                    <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-cpm-text-tertiary">Guests</label>
                  <select value={guests} onChange={(e) => setGuests(e.target.value)} className={inputNoIconCls}>
                    {[1,2,3,4,5,6,7,8,9,10].map((n) => (<option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>))}
                  </select>
                </div>
              </div>

              {/* Quick location select */}
              <div className="mt-4 flex flex-wrap gap-2">
                {["Valletta", "Sliema", "St. Julian's", "Gzira", "Mdina"].map((loc) => (
                  <button key={loc} type="button" onClick={() => setLocation(loc)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${location === loc ? "bg-cpm-accent text-cpm-bg-primary" : "bg-cpm-bg-primary text-cpm-text-secondary border border-cpm-border hover:border-cpm-accent/30 hover:text-cpm-text-primary"}`}>
                    {loc}
                  </button>
                ))}
              </div>

              {/* Advanced filters toggle */}
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="mt-4 flex items-center gap-1.5 text-xs font-medium text-cpm-text-secondary transition-colors hover:text-cpm-accent">
                <svg className={`h-3.5 w-3.5 transition-transform duration-300 ${showAdvanced ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                Price range
              </button>

              {showAdvanced && (
                <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-2" style={{ animation: "fadeInUp 0.2s ease-out" }}>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-cpm-text-tertiary">Min Price / night</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-cpm-text-tertiary">€</span>
                      <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" min="0" className={inputNoIconCls} style={{ paddingLeft: "1.75rem" }} />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-cpm-text-tertiary">Max Price / night</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-cpm-text-tertiary">€</span>
                      <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="999" min="0" className={inputNoIconCls} style={{ paddingLeft: "1.75rem" }} />
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <button onClick={handleSearch} className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl px-8 py-3.5 text-sm font-semibold text-cpm-bg-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,169,106,0.25)] active:scale-[0.98]" style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-accent-hover))" }}>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                  {p.buttonText}
                </button>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  },
};

// --- Shared helper components for Guesty blocks (defined outside to avoid re-mount on every render) ---

function GuestyRenderStars(rating: number) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(<svg key={i} className={`h-3.5 w-3.5 ${i <= Math.round(rating) ? "text-cpm-accent" : "text-cpm-border-hover"}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>);
  }
  return <span className="flex items-center gap-0.5">{stars}</span>;
}

function GuestySkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-cpm-border bg-cpm-bg-secondary">
      <div className="h-48 w-full bg-cpm-border" style={{ backgroundImage: "linear-gradient(90deg, var(--cpm-border) 25%, #252830 50%, var(--cpm-border) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      <div className="p-4 space-y-3"><div className="h-4 w-3/4 rounded bg-cpm-border" /><div className="h-3 w-1/2 rounded bg-cpm-border" /><div className="h-5 w-1/3 rounded bg-cpm-border" /></div>
    </div>
  );
}

function GuestyAmenityIcon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    wifi: "M9.348 14.652a3.75 3.75 0 010-5.304m5.304 0a3.75 3.75 0 010 5.304m-7.425 2.121a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788",
    parking: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25V3.375c0-.621.504-1.125 1.125-1.125h9.75c.621 0 1.125.504 1.125 1.125v10.875",
    pool: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z",
    ac: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636",
    kitchen: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z",
    tv: "M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z",
    default: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
  };
  return (
    <svg className="h-5 w-5 text-cpm-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d={icons[name.toLowerCase()] || icons.default} />
    </svg>
  );
}

function GuestyStatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-cpm-border bg-cpm-bg-secondary p-4 transition-all duration-300 hover:border-cpm-accent/20" style={{ animation: "scaleIn 0.4s ease-out" }}>
      <p className="text-xs font-medium uppercase tracking-[0.1em] text-cpm-text-tertiary">{label}</p>
      <p className={`mt-1 text-2xl font-light ${color}`}>{value}</p>
    </div>
  );
}

// 17. GUESTY PROPERTY GRID
const GuestyPropertyGrid = {
  label: "Guesty · Property Grid",
  fields: {
    title: { type: "text" as const },
    itemsPerPage: {
      type: "select" as const,
      options: [{ label: "6 per page", value: "6" }, { label: "9 per page", value: "9" }, { label: "12 per page", value: "12" }],
    },
    showFilters: {
      type: "select" as const,
      options: [{ label: "Show Filters", value: "true" }, { label: "Hide Filters", value: "false" }],
    },
  },
  defaultProps: {
    title: "Available Properties",
    itemsPerPage: "6",
    showFilters: "true",
  },
  Component: (props: Record<string, unknown>) => {
    const p = props as { title: string; itemsPerPage: string; showFilters: string };
    type MappedProp = {
      id: string; slug: string; title: string; propertyType: string;
      location: { city: string; country: string; address: string };
      images: { url: string; caption?: string }[];
      rates: { baseRate: number; currency: string };
      reviews: { score: number; total: number; count: number }[];
      amenities: string[];
      maxGuests: number; bedrooms: number; bathrooms: number;
      summary: string; status: string; source: string;
    };
    const [properties, setProperties] = React.useState<MappedProp[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [sort, setSort] = React.useState("default");
    const [mounted, setMounted] = React.useState(false);
    const [searchParams, setSearchParams] = React.useState<Record<string, string | number> | null>(null);

    const abortRef = React.useRef<AbortController | null>(null);

    const fetchProperties = React.useCallback(async (params?: Record<string, string | number>) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);
      try {
        const sp = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== "") sp.set(k, String(v)); });
        }
        sp.set("limit", p.itemsPerPage || "6");
        const res = await fetch(`/api/guesty/listings?${sp.toString()}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        let items: MappedProp[] = data.listings || [];
        if (sort === "price-asc") items.sort((a, b) => a.rates.baseRate - b.rates.baseRate);
        else if (sort === "price-desc") items.sort((a, b) => b.rates.baseRate - a.rates.baseRate);
        else if (sort === "rating") items.sort((a, b) => (b.reviews[0]?.score || 0) - (a.reviews[0]?.score || 0));
        setProperties(items);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError((err as Error).message || "Failed to load properties");
          toast.error("Failed to load properties");
        }
      } finally { setLoading(false); }
    }, [sort, p.itemsPerPage]);

    React.useEffect(() => { setMounted(true); }, []);
    React.useEffect(() => { if (mounted) fetchProperties(searchParams || undefined); return () => abortRef.current?.abort(); }, [mounted, fetchProperties]);

    React.useEffect(() => {
      const handler = (e: Event) => {
        const detail = (e as CustomEvent).detail as Record<string, string | number> | undefined;
        if (detail) { setSearchParams(detail); fetchProperties(detail); }
      };
      window.addEventListener("guesty-search", handler);
      return () => window.removeEventListener("guesty-search", handler);
    }, [fetchProperties]);

    const handleRetry = () => { fetchProperties(searchParams || undefined); };
    const filterCls = "rounded-xl border border-cpm-border bg-cpm-bg-primary px-4 py-2.5 text-sm text-cpm-text-primary outline-none transition-all focus:border-cpm-accent/50";

    return (
      <>
        <section className="bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10" style={{ animation: "fadeInUp 0.6s ease-out" }}>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.title}</h2>
              <div className="mt-1 text-sm text-cpm-text-tertiary">{loading ? "Loading..." : error ? "Error" : `${properties.length} propert${properties.length === 1 ? "y" : "ies"} found`}</div>
              <div className="mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
            </div>

            {p.showFilters === "true" && (
              <div className="mb-8 flex flex-wrap items-center gap-3" style={{ animation: "fadeInUp 0.7s ease-out" }}>
                <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort properties" className={filterCls}>
                  <option value="default">Sort: Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            )}

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: parseInt(p.itemsPerPage) || 6 }).map((_, i) => <GuestySkeletonCard key={i} />)}</div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <svg className="mb-4 h-16 w-16 text-cpm-error/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                <h3 className="text-lg font-medium text-cpm-text-primary">Failed to load properties</h3>
                <p className="mt-2 text-sm text-cpm-text-secondary">{error}</p>
                <button onClick={handleRetry} className="mt-4 rounded-xl border border-cpm-accent/20 bg-cpm-accent/5 px-6 py-2.5 text-sm font-medium text-cpm-accent transition-all duration-300 hover:bg-cpm-accent hover:text-cpm-bg-primary">Try Again</button>
              </div>
            ) : properties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <svg className="mb-4 h-16 w-16 text-cpm-border-hover" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                <h3 className="text-lg font-medium text-cpm-text-primary">No properties found</h3>
                <p className="mt-2 text-sm text-cpm-text-secondary">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {properties.slice(0, parseInt(p.itemsPerPage) || 6).map((prop, i) => {
                  const img = prop.images?.[0]?.url || "/placeholder.jpg";
                  const rating = prop.reviews?.[0]?.score || 0;
                  const reviewCount = prop.reviews?.[0]?.count || 0;
                  const amenities = (prop.amenities || []).slice(0, 3);
                  return (
                    <div key={prop.id || i} className="group overflow-hidden rounded-2xl border border-cpm-border bg-cpm-bg-secondary transition-all duration-500 hover:-translate-y-1 hover:border-cpm-accent/20 hover:shadow-[0_8px_30px_rgba(200,169,106,0.06)]" style={{ animation: `scaleIn 0.5s ease-out ${i * 0.06}s both` }}>
                      <div className="relative h-48 overflow-hidden">
                        <img src={img} alt={prop.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-cpm-bg-secondary via-transparent to-transparent opacity-60" />
                        <div className="absolute right-3 top-3 rounded-full bg-cpm-accent/90 px-2.5 py-0.5 text-xs font-semibold text-cpm-bg-primary">{prop.propertyType}</div>
                        {rating > 0 && (
                          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-cpm-bg-primary/80 px-2.5 py-0.5 text-xs font-medium text-cpm-text-primary backdrop-blur-sm">
                            <svg className="h-3.5 w-3.5 text-cpm-accent" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            {rating.toFixed(1)} <span className="text-cpm-text-tertiary">({reviewCount})</span>
                          </div>
                        )}
                        {/* Wishlist heart button */}
                        <button onClick={(e) => { e.stopPropagation(); /* wishlist toggle */ }} className="absolute bottom-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-cpm-bg-primary/70 text-cpm-text-primary/60 backdrop-blur-sm transition-all hover:text-cpm-error hover:scale-110" aria-label="Save to wishlist">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="mb-1 text-base font-medium text-cpm-text-primary">{prop.title}</h3>
                        <p className="mb-3 flex items-center gap-1 text-sm text-cpm-text-secondary">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                          {prop.location?.city || "Malta"}{prop.location?.address ? `, ${prop.location.address}` : ""}
                        </p>
                        <div className="mb-3 flex items-center gap-4 text-xs text-cpm-text-secondary">
                          <span className="flex items-center gap-1"><svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>{prop.bedrooms} Bed</span>
                          <span className="flex items-center gap-1"><svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>{prop.bathrooms} Bath</span>
                          <span className="flex items-center gap-1"><svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>{prop.maxGuests}</span>
                        </div>
                        {amenities.length > 0 && (
                          <div className="mb-3 flex flex-wrap gap-1.5">
                            {amenities.map((a) => (
                              <span key={a} className="rounded-full bg-cpm-bg-primary px-2 py-0.5 text-[10px] font-medium text-cpm-text-secondary">{a}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-semibold text-cpm-accent">€{prop.rates.baseRate}</span>
                            <span className="text-xs text-cpm-text-tertiary"> / night</span>
                          </div>
                        </div>
                        <button onClick={() => window.dispatchEvent(new CustomEvent("guesty-select", { detail: { slug: prop.slug, id: prop.id } }))} className="mt-3 w-full rounded-xl border border-cpm-accent/20 bg-cpm-accent/5 px-4 py-2 text-xs font-medium text-cpm-accent transition-all duration-300 hover:bg-cpm-accent hover:text-cpm-bg-primary active:scale-[0.98]">View Details</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </>
    );
  },
};

// 18. GUESTY PROPERTY DETAIL
const GuestyPropertyDetail = {
  label: "Guesty · Property Detail",
  fields: {
    defaultSlug: { type: "text" as const, label: "Default Property Slug" },
  },
  defaultProps: {
    defaultSlug: "valletta-apartment-1",
  },
  Component: (props: Record<string, unknown>) => {
    const p = props as { defaultSlug: string };
    type MappedProp = {
      id: string; slug: string; title: string; nickname: string; description: string; summary: string;
      propertyType: string; location: { city: string; country: string; address: string; coordinates: { lat: number; lng: number } };
      amenities: string[]; images: { url: string; caption?: string }[];
      rates: { baseRate: number; currency: string; minimumStay: { value: number; type: string } };
      reviews: { score: number; total: number; count: number }[];
      houseRules: string[]; maxGuests: number; bedrooms: number; bathrooms: number;
      status: string; source: string;
    };
    const [slug, setSlug] = React.useState(p.defaultSlug);
    const [property, setProperty] = React.useState<MappedProp | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [activeImage, setActiveImage] = React.useState(0);
    const [lightboxOpen, setLightboxOpen] = React.useState(false);

    const abortRef = React.useRef<AbortController | null>(null);

    const fetchProperty = React.useCallback(async (s: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);
      setActiveImage(0);
      try {
        const res = await fetch(`/api/guesty/listings/${s}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProperty(data.listing || data);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError((err as Error).message || "Failed to load property");
          setProperty(null);
          toast.error("Failed to load property");
        }
      } finally { setLoading(false); }
    }, []);

    React.useEffect(() => { fetchProperty(slug); return () => abortRef.current?.abort(); }, [slug, fetchProperty]);

    React.useEffect(() => {
      const handler = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (detail?.slug) { setSlug(detail.slug); window.scrollTo({ top: 0, behavior: "smooth" }); }
      };
      window.addEventListener("guesty-select", handler);
      return () => window.removeEventListener("guesty-select", handler);
    }, []);

    const images = (property?.images || []).map((img) => img.url);
    const rating = property?.reviews?.[0]?.score || 0;
    const reviewCount = property?.reviews?.[0]?.count || 0;

    if (loading) {
      return (
        <section className="bg-cpm-bg-primary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-6xl animate-pulse space-y-6">
            <div className="h-[400px] rounded-2xl bg-cpm-bg-secondary" style={{ backgroundImage: "linear-gradient(90deg, var(--cpm-bg-secondary) 25%, #1e2025 50%, var(--cpm-bg-secondary) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
            <div className="grid gap-6 lg:grid-cols-3"><div className="lg:col-span-2 space-y-4"><div className="h-8 w-3/4 rounded bg-cpm-bg-secondary" /><div className="h-4 w-full rounded bg-cpm-bg-secondary" /><div className="h-4 w-2/3 rounded bg-cpm-bg-secondary" /></div><div className="h-48 rounded-2xl bg-cpm-bg-secondary" /></div>
          </div>
        </section>
      );
    }

    if (error || !property) {
      return (
        <section className="bg-cpm-bg-primary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto flex max-w-4xl flex-col items-center justify-center py-20 text-center">
            <svg className="mb-4 h-16 w-16 text-cpm-border-hover" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
            <h3 className="mb-2 text-lg font-medium text-cpm-text-primary">{error ? "Error loading property" : "Select a Property"}</h3>
            <p className="mb-4 text-sm text-cpm-text-secondary">{error || "Browse our properties above and click \"View Details\" to see more information."}</p>
            {error && <button onClick={() => fetchProperty(slug)} className="rounded-xl border border-cpm-accent/20 bg-cpm-accent/5 px-6 py-2.5 text-sm font-medium text-cpm-accent transition-all duration-300 hover:bg-cpm-accent hover:text-cpm-bg-primary">Try Again</button>}
          </div>
        </section>
      );
    }

    return (
      <>
        <section className="bg-cpm-bg-primary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-6xl" style={{ animation: "fadeInUp 0.5s ease-out" }}>
            <button onClick={() => window.dispatchEvent(new CustomEvent("guesty-search", { detail: {} }))} className="mb-8 inline-flex items-center gap-2 text-sm text-cpm-text-secondary transition-colors hover:text-cpm-accent">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
              Back to Properties
            </button>

            {/* Image Gallery */}
            <div className="mb-8 overflow-hidden rounded-2xl border border-cpm-border">
              <div className="relative h-64 sm:h-96 lg:h-[500px]">
                <img src={images[activeImage] || "/placeholder.jpg"} alt={property.title} className="h-full w-full object-cover transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-cpm-bg-primary/60 via-transparent to-transparent" />
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 overflow-x-auto px-4 pb-2">
                    {images.map((img, idx) => (
                      <button key={idx} onClick={() => setActiveImage(idx)} className={`h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-300 ${idx === activeImage ? "border-cpm-accent opacity-100" : "border-transparent opacity-60 hover:opacity-80"}`}>
                        <img src={img} alt={`${property.title} — Photo ${idx + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
                <button onClick={() => setLightboxOpen(true)} className="absolute right-4 top-4 rounded-full bg-cpm-bg-primary/70 px-3 py-1.5 text-xs font-medium text-cpm-text-primary backdrop-blur-sm transition-all hover:bg-cpm-bg-primary/90">
                  <svg className="mr-1 inline h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" /></svg>
                  {images.length} Photos
                </button>
              </div>
            </div>

            {/* Lightbox */}
            {lightboxOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-cpm-bg-primary/95 backdrop-blur-sm" onClick={() => setLightboxOpen(false)}>
                <button className="absolute right-6 top-6 text-cpm-text-primary hover:text-cpm-accent" onClick={() => setLightboxOpen(false)}>
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                </button>
                <div className="relative max-h-[85vh] max-w-[85vw]" onClick={(e) => e.stopPropagation()}>
                  <img src={images[activeImage] || "/placeholder.jpg"} alt="" className="max-h-[80vh] rounded-2xl object-contain" />
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-3">
                    <button onClick={() => setActiveImage(Math.max(0, activeImage - 1))} className="rounded-full bg-cpm-bg-secondary px-3 py-2 text-cpm-text-primary hover:bg-cpm-border" disabled={activeImage === 0}>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
                    </button>
                    <span className="flex items-center text-sm text-cpm-text-secondary">{activeImage + 1} / {images.length}</span>
                    <button onClick={() => setActiveImage(Math.min(images.length - 1, activeImage + 1))} className="rounded-full bg-cpm-bg-secondary px-3 py-2 text-cpm-text-primary hover:bg-cpm-border" disabled={activeImage === images.length - 1}>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-8">
                {/* Property Info */}
                <div className="rounded-2xl border border-cpm-border bg-cpm-bg-secondary p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-light tracking-tight text-cpm-text-primary sm:text-3xl">{property.title}</h1>
                      <p className="mt-1 flex items-center gap-1 text-cpm-text-secondary">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                        {property.location?.address || ""}, {property.location?.city || "Malta"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full border border-cpm-accent/30 bg-cpm-accent/10 px-3 py-1 text-xs font-semibold text-cpm-accent uppercase">{property.propertyType}</span>
                      {rating > 0 && (
                        <span className="flex items-center gap-1">{GuestyRenderStars(rating)}<span className="text-sm font-medium text-cpm-text-primary">{rating.toFixed(1)}</span><span className="text-xs text-cpm-text-tertiary">({reviewCount})</span></span>
                      )}
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {[
                      { label: "Bedrooms", value: String(property.bedrooms), icon: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
                      { label: "Bathrooms", value: String(property.bathrooms), icon: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" },
                      { label: "Max Guests", value: String(property.maxGuests), icon: "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" },
                      { label: "Min Stay", value: `${property.rates.minimumStay?.value || 1} night${(property.rates.minimumStay?.value || 1) > 1 ? "s" : ""}`, icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" },
                      { label: "Location", value: property.location?.city || "Malta", icon: "M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2 rounded-xl bg-cpm-bg-primary p-3 text-center">
                        <svg className="h-5 w-5 text-cpm-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
                        <span className="text-xs text-cpm-text-tertiary">{item.label}</span>
                        <span className="text-sm font-medium text-cpm-text-primary">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                {(property.description || property.summary) && (
                  <div className="rounded-2xl border border-cpm-border bg-cpm-bg-secondary p-6 sm:p-8">
                    <h3 className="mb-4 text-lg font-medium text-cpm-text-primary">About this property</h3>
                    <p className="whitespace-pre-line text-sm leading-[1.8] text-cpm-text-secondary">{property.description || property.summary}</p>
                  </div>
                )}

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <div className="rounded-2xl border border-cpm-border bg-cpm-bg-secondary p-6 sm:p-8">
                    <h3 className="mb-6 text-lg font-medium text-cpm-text-primary">Amenities</h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {property.amenities.map((amenity, idx) => (
                        <div key={idx} className="flex items-center gap-3 rounded-xl bg-cpm-bg-primary p-3">
                          <GuestyAmenityIcon name={amenity} />
                          <span className="text-sm text-cpm-text-primary">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* House Rules */}
                {property.houseRules && property.houseRules.length > 0 && (
                  <div className="rounded-2xl border border-cpm-border bg-cpm-bg-secondary p-6 sm:p-8">
                    <h3 className="mb-6 text-lg font-medium text-cpm-text-primary">House Rules</h3>
                    <ul className="space-y-3">
                      {property.houseRules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-cpm-text-secondary">
                          <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-cpm-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Map placeholder */}
                <div className="rounded-2xl border border-cpm-border bg-cpm-bg-secondary p-6 sm:p-8">
                  <h3 className="mb-4 text-lg font-medium text-cpm-text-primary">Location</h3>
                  <div className="flex h-48 items-center justify-center rounded-xl bg-cpm-bg-primary">
                    <div className="text-center">
                      <svg className="mx-auto mb-2 h-8 w-8 text-cpm-border-hover" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" /></svg>
                      <p className="text-sm text-cpm-text-tertiary">Map integration coming soon</p>
                      <p className="text-xs text-cpm-border-hover">{property.location?.address}, {property.location?.city}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar - Price card */}
              <div>
                <div className="sticky top-24 rounded-2xl border border-cpm-accent/10 p-6 backdrop-blur-xl" style={{ background: "linear-gradient(135deg, rgba(21,23,27,0.95), rgba(14,15,17,0.9))" }}>
                  <div className="mb-4">
                    <span className="text-3xl font-light text-cpm-accent">€{property.rates.baseRate}</span>
                    <span className="text-sm text-cpm-text-tertiary"> / night</span>
                  </div>
                  <button onClick={() => window.dispatchEvent(new CustomEvent("guesty-select", { detail: { slug: property.slug, id: property.id, action: "book" } }))} className="w-full rounded-xl px-6 py-3.5 text-sm font-semibold text-cpm-bg-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,169,106,0.25)] active:scale-[0.98]" style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-accent-hover))" }}>Book Now</button>
                  <p className="mt-3 text-center text-xs text-cpm-text-tertiary">You won&apos;t be charged yet</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  },
};

// 19. GUESTY BOOKING WIDGET
const GuestyBookingWidget = {
  label: "Guesty · Booking Widget",
  fields: {
    defaultSlug: { type: "text" as const, label: "Default Property Slug" },
    title: { type: "text" as const },
  },
  defaultProps: {
    defaultSlug: "valletta-apartment-1",
    title: "Complete Your Booking",
  },
  Component: (props: Record<string, unknown>) => {
    const p = props as { defaultSlug: string; title: string };
    type MappedProp = { id: string; slug: string; title: string; rates: { baseRate: number }; maxGuests: number; images: { url: string }[] };
    type MappedQuote = { id: string; externalId: string; status: string; listingId: string; checkIn: string; checkOut: string; guest: { firstName: string; lastName: string; email: string; phone: string; adults: number }; money: { rentalAmount: number; cleaningFee: number; serviceFee: number; totalAmount: number; currency: string }; sourceSystem: string; notes: string; createdAt: string };

    const [slug, setSlug] = React.useState(p.defaultSlug);
    const [step, setStep] = React.useState(1);
    const [loading, setLoading] = React.useState(false);
    const [submitting, setSubmitting] = React.useState(false);
    const [property, setProperty] = React.useState<MappedProp | null>(null);
    const [propLoading, setPropLoading] = React.useState(true);
    const [bookingResult, setBookingResult] = React.useState<MappedQuote | null>(null);
    const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

    const [dates, setDates] = React.useState({ checkIn: "", checkOut: "", guests: "2" });
    const [guestInfo, setGuestInfo] = React.useState({ firstName: "", lastName: "", email: "", phone: "", notes: "" });

    const fetchProperty = React.useCallback(async (s: string) => {
      setPropLoading(true);
      try {
        const res = await fetch(`/api/guesty/listings/${s}`);
        if (res.ok) { const data = await res.json(); setProperty(data.listing || data); }
      } catch { /* silent */ }
      finally { setPropLoading(false); }
    }, []);

    React.useEffect(() => { fetchProperty(slug); }, [slug, fetchProperty]);

    React.useEffect(() => {
      const handler = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (detail?.slug) {
          setSlug(detail.slug);
          setStep(1);
          setDates({ checkIn: "", checkOut: "", guests: "2" });
          setGuestInfo({ firstName: "", lastName: "", email: "", phone: "", notes: "" });
          setBookingResult(null);
          setFormErrors({});
        }
      };
      window.addEventListener("guesty-select", handler);
      return () => window.removeEventListener("guesty-select", handler);
    }, []);

    const nights = dates.checkIn && dates.checkOut ? Math.max(1, Math.round((new Date(dates.checkOut).getTime() - new Date(dates.checkIn).getTime()) / 86400000)) : 0;
    const basePrice = (property?.rates.baseRate || 0) * nights;
    const cleaningFee = Math.round(property?.rates.baseRate ? Math.max(50, property.rates.baseRate * 0.3) : 0);
    const serviceFee = Math.round(basePrice * 0.12 * 100) / 100;
    const totalPrice = Math.round((basePrice + cleaningFee + serviceFee) * 100) / 100;

    const validateStep1 = () => {
      const errs: Record<string, string> = {};
      if (!dates.checkIn) errs.checkIn = "Check-in date is required";
      if (!dates.checkOut) errs.checkOut = "Check-out date is required";
      if (dates.checkIn && dates.checkOut && new Date(dates.checkOut) <= new Date(dates.checkIn)) errs.checkOut = "Check-out must be after check-in";
      setFormErrors(errs);
      return Object.keys(errs).length === 0;
    };

    const validateStep2 = () => {
      const errs: Record<string, string> = {};
      if (!guestInfo.firstName.trim()) errs.firstName = "First name is required";
      if (!guestInfo.lastName.trim()) errs.lastName = "Last name is required";
      if (!guestInfo.email.trim()) errs.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestInfo.email)) errs.email = "Invalid email format";
      setFormErrors(errs);
      return Object.keys(errs).length === 0;
    };

    const submitBooking = async () => {
      if (!property || !validateStep2()) return;
      setSubmitting(true);
      setFormErrors({});
      try {
        const res = await fetch("/api/guesty/quotes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            listingId: property.slug || property.id,
            checkIn: dates.checkIn,
            checkOut: dates.checkOut,
            guest: {
              firstName: guestInfo.firstName.trim(),
              lastName: guestInfo.lastName.trim(),
              email: guestInfo.email.trim(),
              phone: guestInfo.phone.trim() || undefined,
              adults: parseInt(dates.guests) || 1,
            },
            source: "direct",
            notes: guestInfo.notes.trim() || undefined,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          const quote = data.quote || data;
          setBookingResult(quote);
          setStep(3);
          window.dispatchEvent(new CustomEvent("guesty-booking-confirmed", { detail: { quoteId: quote.id || quote.externalId, listingId: property.slug, title: property.title, checkIn: quote.checkIn || dates.checkIn, checkOut: quote.checkOut || dates.checkOut, guests: parseInt(dates.guests), money: quote.money || { totalAmount: totalPrice }, guest: quote.guest, sourceSystem: quote.sourceSystem } }));
          toast.success("Booking confirmed!");
        } else {
          setFormErrors({ submit: data.error || "Booking failed. Please try again." });
          toast.error(data.error || "Booking failed");
        }
      } catch {
        setFormErrors({ submit: "Network error. Please check your connection." });
        toast.error("Network error");
      } finally { setSubmitting(false); }
    };

    const inputCls = "w-full rounded-xl border border-cpm-border bg-cpm-bg-primary px-4 py-3 text-sm text-cpm-text-primary outline-none transition-all duration-300 focus:border-cpm-accent/50 focus:shadow-[0_0_0_3px_rgba(200,169,106,0.1)] placeholder-cpm-text-tertiary";
    const errorInputCls = "w-full rounded-xl border border-cpm-error/50 bg-cpm-bg-primary px-4 py-3 text-sm text-cpm-text-primary outline-none transition-all duration-300 focus:border-cpm-error focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)] placeholder-cpm-text-tertiary";

    return (
      <>
        <section data-booking-widget className="bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 text-center" style={{ animation: "fadeInUp 0.6s ease-out" }}>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.title}</h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
            </div>

            <div className="rounded-2xl border border-cpm-accent/10 p-6 sm:p-8 backdrop-blur-xl" style={{ background: "linear-gradient(135deg, rgba(21,23,27,0.95), rgba(14,15,17,0.9))" }}>
              {/* Progress Indicator */}
              <div className="mb-8 flex items-center justify-center gap-2">
                {[1, 2, 3].map((s) => (
                  <React.Fragment key={s}>
                    <div className={`flex items-center gap-2 ${s <= step ? "text-cpm-accent" : "text-cpm-text-tertiary"}`}>
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${s < step ? "bg-cpm-accent text-cpm-bg-primary" : s === step ? "border-2 border-cpm-accent text-cpm-accent" : "border-2 border-cpm-border-hover text-cpm-text-tertiary"}`}>
                        {s < step ? <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg> : s}
                      </div>
                      <span className="hidden text-xs font-medium sm:inline">{s === 1 ? "Dates" : s === 2 ? "Details" : "Confirm"}</span>
                    </div>
                    {s < 3 && <div className={`h-[1px] w-8 sm:w-16 ${s < step ? "bg-cpm-accent" : "bg-cpm-border-hover"}`} />}
                  </React.Fragment>
                ))}
              </div>

              {/* Step 1: Dates */}
              {step === 1 && (
                <div className="space-y-5" style={{ animation: "fadeInUp 0.3s ease-out" }}>
                  <div className="mb-6 rounded-xl bg-cpm-bg-primary p-4">
                    <p className="text-sm font-medium text-cpm-text-primary">{propLoading ? "Loading property..." : property?.title || "Select a property"}</p>
                    <p className="text-xs text-cpm-text-tertiary">€{property?.rates.baseRate || "..."} / night · Up to {property?.maxGuests || "..."} guests</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-cpm-text-primary">Check-in <span className="text-cpm-accent">*</span></label>
                      <input type="date" value={dates.checkIn} onChange={(e) => { setDates({ ...dates, checkIn: e.target.value }); setFormErrors({ ...formErrors, checkIn: "" }); }} className={formErrors.checkIn ? errorInputCls : inputCls} />
                      {formErrors.checkIn && <p className="mt-1 text-xs text-cpm-error">{formErrors.checkIn}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-cpm-text-primary">Check-out <span className="text-cpm-accent">*</span></label>
                      <input type="date" value={dates.checkOut} onChange={(e) => { setDates({ ...dates, checkOut: e.target.value }); setFormErrors({ ...formErrors, checkOut: "" }); }} className={formErrors.checkOut ? errorInputCls : inputCls} />
                      {formErrors.checkOut && <p className="mt-1 text-xs text-cpm-error">{formErrors.checkOut}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-cpm-text-primary">Guests</label>
                      <select value={dates.guests} onChange={(e) => setDates({ ...dates, guests: e.target.value })} className={inputCls}>
                        {[1,2,3,4,5,6,7,8,9,10].map((n) => (<option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>))}
                      </select>
                    </div>
                  </div>
                  <button onClick={() => { if (validateStep1()) setStep(2); }} className="w-full rounded-xl px-8 py-3.5 text-sm font-semibold text-cpm-bg-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,169,106,0.25)] active:scale-[0.98]" style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-accent-hover))" }}>
                    Continue
                  </button>
                </div>
              )}

              {/* Step 2: Guest Info */}
              {step === 2 && (
                <div className="space-y-4" style={{ animation: "fadeInUp 0.3s ease-out" }}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-cpm-text-primary">First Name <span className="text-cpm-accent">*</span></label>
                      <input type="text" value={guestInfo.firstName} onChange={(e) => { setGuestInfo({ ...guestInfo, firstName: e.target.value }); setFormErrors({ ...formErrors, firstName: "" }); }} className={formErrors.firstName ? errorInputCls : inputCls} placeholder="First name" />
                      {formErrors.firstName && <p className="mt-1 text-xs text-cpm-error">{formErrors.firstName}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-cpm-text-primary">Last Name <span className="text-cpm-accent">*</span></label>
                      <input type="text" value={guestInfo.lastName} onChange={(e) => { setGuestInfo({ ...guestInfo, lastName: e.target.value }); setFormErrors({ ...formErrors, lastName: "" }); }} className={formErrors.lastName ? errorInputCls : inputCls} placeholder="Last name" />
                      {formErrors.lastName && <p className="mt-1 text-xs text-cpm-error">{formErrors.lastName}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-cpm-text-primary">Email <span className="text-cpm-accent">*</span></label>
                      <input type="email" value={guestInfo.email} onChange={(e) => { setGuestInfo({ ...guestInfo, email: e.target.value }); setFormErrors({ ...formErrors, email: "" }); }} className={formErrors.email ? errorInputCls : inputCls} placeholder="you@email.com" />
                      {formErrors.email && <p className="mt-1 text-xs text-cpm-error">{formErrors.email}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-cpm-text-primary">Phone</label>
                      <input type="tel" value={guestInfo.phone} onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })} className={inputCls} placeholder="+356 XXXXXXXX" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-cpm-text-primary">Special Requests</label>
                    <textarea rows={3} value={guestInfo.notes} onChange={(e) => setGuestInfo({ ...guestInfo, notes: e.target.value })} className={`${inputCls} resize-none`} placeholder="Any special requests..." />
                  </div>
                  {formErrors.submit && <p className="text-sm text-cpm-error">{formErrors.submit}</p>}
                  <div className="flex gap-3">
                    <button onClick={() => { setStep(1); setFormErrors({}); }} className="flex-1 rounded-xl border border-cpm-border px-6 py-3.5 text-sm font-medium text-cpm-text-secondary transition-all duration-300 hover:border-cpm-accent/30 hover:text-cpm-text-primary">Back</button>
                    <button onClick={() => { if (validateStep2()) setStep(3); }} className="flex-[2] rounded-xl px-8 py-3.5 text-sm font-semibold text-cpm-bg-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,169,106,0.25)] active:scale-[0.98]" style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-accent-hover))" }}>Review Booking</button>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Confirm */}
              {step === 3 && !bookingResult && (
                <div className="space-y-5" style={{ animation: "fadeInUp 0.3s ease-out" }}>
                  <div className="rounded-xl bg-cpm-bg-primary p-4 space-y-3">
                    <div className="flex items-center gap-4">
                      <img src={property?.images?.[0]?.url || "/placeholder.jpg"} alt={property?.title || "Property"} className="h-20 w-20 rounded-lg object-cover" />
                      <div><p className="font-medium text-cpm-text-primary">{property?.title}</p><p className="text-xs text-cpm-text-secondary">{dates.checkIn} → {dates.checkOut} · {dates.guests} guest{parseInt(dates.guests) > 1 ? "s" : ""}</p></div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-cpm-bg-primary p-4 space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-cpm-text-secondary">€{property?.rates.baseRate || 0} × {nights} night{nights > 1 ? "s" : ""}</span><span className="text-cpm-text-primary">€{basePrice.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-cpm-text-secondary">Cleaning fee</span><span className="text-cpm-text-primary">€{cleaningFee.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-cpm-text-secondary">Service fee (12%)</span><span className="text-cpm-text-primary">€{serviceFee.toFixed(2)}</span></div>
                    <div className="border-t border-cpm-border pt-2 flex justify-between"><span className="font-medium text-cpm-text-primary">Total</span><span className="text-lg font-semibold text-cpm-accent">€{totalPrice.toFixed(2)}</span></div>
                  </div>
                  {formErrors.submit && <p className="text-sm text-cpm-error">{formErrors.submit}</p>}
                  <div className="flex gap-3">
                    <button onClick={() => { setStep(2); setFormErrors({}); }} className="flex-1 rounded-xl border border-cpm-border px-6 py-3.5 text-sm font-medium text-cpm-text-secondary transition-all duration-300 hover:border-cpm-accent/30 hover:text-cpm-text-primary">Back</button>
                    <button onClick={submitBooking} disabled={submitting} className="flex-[2] rounded-xl px-8 py-3.5 text-sm font-semibold text-cpm-bg-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,169,106,0.25)] active:scale-[0.98] disabled:opacity-50" style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-accent-hover))" }}>
                      {submitting ? "Confirming..." : `Confirm Booking — €${totalPrice.toFixed(2)}`}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirmation */}
              {step === 3 && bookingResult && (
                <div className="py-8 text-center" style={{ animation: "scaleIn 0.4s ease-out" }}>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cpm-success/10">
                    <svg className="h-8 w-8 text-cpm-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                  </div>
                  <h3 className="text-xl font-medium text-cpm-text-primary">Booking Confirmed!</h3>
                  <p className="mt-1 text-sm text-cpm-text-tertiary">Reference: <span className="font-mono text-cpm-accent">{bookingResult.id || bookingResult.externalId}</span></p>
                </div>
              )}
            </div>
          </div>
        </section>
      </>
    );
  },
};

// 20. GUESTY BOOKING CONFIRMATION
const GuestyBookingConfirmation = {
  label: "Guesty · Booking Confirmation",
  fields: {
    title: { type: "text" as const },
    subtitle: { type: "textarea" as const },
  },
  defaultProps: {
    title: "Booking Confirmed!",
    subtitle: "Your reservation has been successfully placed. Check your email for confirmation details.",
  },
  Component: (props: Record<string, unknown>) => {
    const p = props as { title: string; subtitle: string };
    const [booking, setBooking] = React.useState<Record<string, unknown> | null>(null);

    React.useEffect(() => {
      const handler = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (detail) setBooking(detail);
      };
      window.addEventListener("guesty-booking-confirmed", handler);
      return () => window.removeEventListener("guesty-booking-confirmed", handler);
    }, []);

    if (!booking) return null;

    const nights = (() => {
      const ci = booking.checkIn as string;
      const co = booking.checkOut as string;
      if (ci && co) return Math.max(1, Math.round((new Date(co).getTime() - new Date(ci).getTime()) / 86400000));
      return 0;
    })();
    const money = booking.money as Record<string, number> | undefined;
    const total = money?.totalAmount || 0;
    const guest = booking.guest as Record<string, string> | undefined;
    const guestName = guest ? `${guest.firstName || ""} ${guest.lastName || ""}`.trim() : "N/A";

    return (
      <>
        <section className="bg-cpm-bg-primary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-2xl" style={{ animation: "scaleIn 0.5s ease-out" }}>
            <div className="rounded-2xl border border-cpm-success/20 p-8 sm:p-10 backdrop-blur-xl text-center" style={{ background: "linear-gradient(135deg, rgba(21,23,27,0.95), rgba(14,15,17,0.9))" }}>
              {/* Animated checkmark */}
              <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-cpm-success/10" style={{ animation: "pulseRing 2s cubic-bezier(0,0,0.2,1) infinite" }} />
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-cpm-success/30 bg-cpm-success/10">
                  <svg className="h-10 w-10 text-cpm-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                </div>
              </div>

              <h2 className="mb-2 font-[family-name:var(--font-heading)] text-2xl font-light tracking-tight text-cpm-text-primary sm:text-3xl">{p.title}</h2>
              <p className="mb-8 text-sm text-cpm-text-secondary">{p.subtitle}</p>

              {/* Booking details */}
              <div className="mb-8 rounded-xl bg-cpm-bg-primary p-5 text-left space-y-3">
                {[
                  { label: "Confirmation Code", value: (booking.quoteId || booking.id || "N/A") as string, highlight: true },
                  { label: "Property", value: (booking.title || "N/A") as string },
                  { label: "Guest", value: guestName },
                  { label: "Check-in", value: (booking.checkIn || "N/A") as string },
                  { label: "Check-out", value: (booking.checkOut || "N/A") as string },
                  { label: "Nights", value: String(nights || "N/A") },
                  { label: "Guests", value: String(booking.guests || "N/A") },
                  { label: "Total", value: `€${Number(total || 0).toFixed(2)}`, highlight: true },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-cpm-text-tertiary">{item.label}</span>
                    <span className={`text-sm font-medium ${item.highlight ? "font-mono text-cpm-accent" : "text-cpm-text-primary"}`}>{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Contact info */}
              <div className="mb-8 rounded-xl bg-cpm-bg-primary p-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-cpm-text-tertiary">Need help?</p>
                <a href={`mailto:${CONTACT.email}`} className="mt-1 text-sm text-cpm-accent hover:text-cpm-accent-hover transition-colors">{CONTACT.email}</a>
                <span className="mx-2 text-cpm-border-hover">|</span>
                <a href={`tel:${CONTACT.phone}`} className="text-sm text-cpm-accent hover:text-cpm-accent-hover transition-colors">{CONTACT.phone}</a>
              </div>

              <button onClick={() => { setBooking(null); window.dispatchEvent(new CustomEvent("guesty-search", { detail: {} })); }} className="w-full rounded-xl px-8 py-3.5 text-sm font-semibold text-cpm-bg-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,169,106,0.25)] active:scale-[0.98]" style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-accent-hover))" }}>
                Book Another Stay
              </button>
            </div>
          </div>
        </section>
      </>
    );
  },
};

// 21. GUESTY BOOKING DASHBOARD
const GuestyBookingDashboard = {
  label: "Guesty · Booking Dashboard",
  fields: {
    title: { type: "text" as const },
  },
  defaultProps: {
    title: "Booking Management",
  },
  Component: (props: Record<string, unknown>) => {
    const p = props as { title: string };
    type BookingRow = {
      id: string; confirmationCode?: string; guestName: string; guestEmail: string;
      propertyName: string; checkIn: string; checkOut: string; nights: number;
      totalPrice: number; status: string; createdAt?: string;
    };
    const [bookings, setBookings] = React.useState<BookingRow[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [search, setSearch] = React.useState("");

    const fetchBookings = React.useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
        if (search) params.set("search", search);
        const res = await fetch(`/api/bookings?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setBookings(data.bookings || []);
      } catch (err) {
        setError((err as Error).message || "Failed to load bookings");
        toast.error("Failed to load bookings");
      } finally { setLoading(false); }
    }, [statusFilter, search]);

    React.useEffect(() => { fetchBookings(); }, [fetchBookings]);

    React.useEffect(() => {
      const handler = () => fetchBookings();
      window.addEventListener("guesty-booking-confirmed", handler);
      return () => window.removeEventListener("guesty-booking-confirmed", handler);
    }, [fetchBookings]);

    const updateStatus = async (id: string, action: string) => {
      try {
        const res = await fetch(`/api/bookings/${id}?action=${action}`, { method: "PATCH" });
        if (res.ok) { toast.success(`Booking ${action}ed`); fetchBookings(); }
        else { const err = await res.json(); toast.error(err.error || "Action failed"); }
      } catch { toast.error("Failed to update booking"); }
    };

    const stats = {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      completed: bookings.filter((b) => b.status === "completed").length,
    };

    const statusColor = (status: string) => {
      const colors: Record<string, string> = {
        pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        confirmed: "bg-cpm-success/10 text-cpm-success border-cpm-success/20",
        completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        cancelled: "bg-cpm-error/10 text-cpm-error border-cpm-error/20",
      };
      return colors[status] || colors.pending;
    };

    const filtered = bookings.filter((b) => {
      if (statusFilter === "all") return true;
      return b.status === statusFilter;
    });

    if (loading) {
      return (
        <section className="bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-cpm-border" />
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-cpm-border" />)}</div>
            <div className="h-64 rounded-xl bg-cpm-border" />
          </div>
        </section>
      );
    }

    return (
      <>
        <section className="bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10" style={{ animation: "fadeInUp 0.6s ease-out" }}>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.title}</h2>
              <div className="mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
            </div>

            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-cpm-error/20 bg-cpm-error/5 p-4">
                <svg className="h-5 w-5 flex-shrink-0 text-cpm-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                <p className="text-sm text-cpm-error">{error}</p>
                <button onClick={fetchBookings} className="ml-auto text-xs font-medium text-cpm-accent hover:text-cpm-accent-hover">Retry</button>
              </div>
            )}

            {/* Stats */}
            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4" style={{ animation: "fadeInUp 0.7s ease-out" }}>
              <GuestyStatCard label="Total Bookings" value={stats.total} color="text-cpm-text-primary" />
              <GuestyStatCard label="Pending" value={stats.pending} color="text-amber-400" />
              <GuestyStatCard label="Confirmed" value={stats.confirmed} color="text-cpm-success" />
              <GuestyStatCard label="Completed" value={stats.completed} color="text-blue-400" />
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-wrap items-center gap-3" style={{ animation: "fadeInUp 0.8s ease-out" }}>
              {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
                <button key={status} onClick={() => setStatusFilter(status)} className={`rounded-xl px-4 py-2 text-xs font-medium transition-all duration-300 ${statusFilter === status ? "bg-cpm-accent text-cpm-bg-primary" : "border border-cpm-border bg-cpm-bg-primary text-cpm-text-secondary hover:border-cpm-accent/30 hover:text-cpm-text-primary"}`}>
                  {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search bookings" placeholder="Search bookings..." className="ml-auto rounded-xl border border-cpm-border bg-cpm-bg-primary px-4 py-2 text-xs text-cpm-text-primary outline-none transition-all focus:border-cpm-accent/50 w-48 placeholder-cpm-text-tertiary" />
            </div>

            {/* Desktop Table */}
            <div className="hidden overflow-x-auto rounded-2xl border border-cpm-border lg:block" style={{ animation: "fadeInUp 0.9s ease-out" }}>
              <table className="w-full min-w-[800px] text-sm">
                <thead><tr className="border-b border-cpm-border bg-cpm-bg-primary">
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-cpm-text-tertiary">Code</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-cpm-text-tertiary">Guest</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-cpm-text-tertiary">Property</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-cpm-text-tertiary">Dates</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-cpm-text-tertiary">Total</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-cpm-text-tertiary">Status</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-cpm-text-tertiary">Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-cpm-text-tertiary">No bookings found</td></tr>
                  ) : filtered.map((b) => (
                    <tr key={b.id} className="border-b border-cpm-border/50 transition-colors hover:bg-cpm-bg-primary/50">
                      <td className="px-4 py-3 font-mono text-xs text-cpm-accent">{b.confirmationCode || b.id}</td>
                      <td className="px-4 py-3"><div className="text-cpm-text-primary">{b.guestName}</div><div className="text-xs text-cpm-text-tertiary">{b.guestEmail}</div></td>
                      <td className="px-4 py-3 text-cpm-text-secondary">{b.propertyName}</td>
                      <td className="px-4 py-3 text-xs text-cpm-text-secondary"><div>{b.checkIn}</div><div>{b.checkOut}</div></td>
                      <td className="px-4 py-3 font-medium text-cpm-text-primary">€{Number(b.totalPrice).toFixed(2)}</td>
                      <td className="px-4 py-3"><span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColor(b.status)}`}>{b.status}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          {b.status === "pending" && (
                            <>
                              <button onClick={() => updateStatus(b.id, "confirm")} className="rounded-lg bg-cpm-success/10 px-2.5 py-1 text-xs font-medium text-cpm-success transition-all hover:bg-cpm-success/20">Confirm</button>
                              <button onClick={() => updateStatus(b.id, "cancel")} className="rounded-lg bg-cpm-error/10 px-2.5 py-1 text-xs font-medium text-cpm-error transition-all hover:bg-cpm-error/20">Cancel</button>
                            </>
                          )}
                          {b.status === "confirmed" && (
                            <>
                              <button onClick={() => updateStatus(b.id, "complete")} className="rounded-lg bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400 transition-all hover:bg-blue-500/20">Complete</button>
                              <button onClick={() => updateStatus(b.id, "cancel")} className="rounded-lg bg-cpm-error/10 px-2.5 py-1 text-xs font-medium text-cpm-error transition-all hover:bg-cpm-error/20">Cancel</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-4 lg:hidden">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-cpm-text-tertiary">No bookings found</div>
              ) : filtered.map((b) => (
                <div key={b.id} className="rounded-2xl border border-cpm-border bg-cpm-bg-primary p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-xs text-cpm-accent">{b.confirmationCode || b.id}</p>
                      <p className="mt-1 text-sm font-medium text-cpm-text-primary">{b.guestName}</p>
                      <p className="text-xs text-cpm-text-tertiary">{b.guestEmail}</p>
                    </div>
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColor(b.status)}`}>{b.status}</span>
                  </div>
                  <div className="border-t border-cpm-border pt-3">
                    <p className="text-sm text-cpm-text-secondary">{b.propertyName}</p>
                    <p className="text-xs text-cpm-text-tertiary">{b.checkIn} → {b.checkOut}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-cpm-border pt-3">
                    <span className="text-lg font-semibold text-cpm-accent">€{Number(b.totalPrice).toFixed(2)}</span>
                    <div className="flex gap-1.5">
                      {b.status === "pending" && (
                        <>
                          <button onClick={() => updateStatus(b.id, "confirm")} className="rounded-lg bg-cpm-success/10 px-2.5 py-1 text-xs font-medium text-cpm-success">Confirm</button>
                          <button onClick={() => updateStatus(b.id, "cancel")} className="rounded-lg bg-cpm-error/10 px-2.5 py-1 text-xs font-medium text-cpm-error">Cancel</button>
                        </>
                      )}
                      {b.status === "confirmed" && (
                        <>
                          <button onClick={() => updateStatus(b.id, "complete")} className="rounded-lg bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400">Complete</button>
                          <button onClick={() => updateStatus(b.id, "cancel")} className="rounded-lg bg-cpm-error/10 px-2.5 py-1 text-xs font-medium text-cpm-error">Cancel</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  },
};

// ============================================================
// IMAGE GALLERY (masonry grid with lightbox)
// ============================================================
const ImageGallery = {
  label: "Image Gallery",
  fields: {
    title: { type: "text" as const },
    images: {
      type: "array" as const,
      label: "Images",
      defaultItemProps: { url: "", caption: "" },
      getItemSummary: (item: Record<string, unknown>) => (item as { caption?: string }).caption || "Image",
      arrayFields: {
        url: { type: "text" as const, label: "Image URL" },
        caption: { type: "text" as const },
      },
    },
    columns: { type: "select" as const, options: [{ label: "2 Columns", value: "2" }, { label: "3 Columns", value: "3" }, { label: "4 Columns", value: "4" }] },
  },
  defaultProps: {
    title: "Property Gallery",
    images: [
      { url: IMG_2625, caption: "Modern Living Space" },
      { url: IMG_9593, caption: "Sea View Terrace" },
      { url: IMG_9588, caption: "Luxury Bedroom" },
      { url: IMG_9590, caption: "Fully Equipped Kitchen" },
      { url: IMG_7136, caption: "Private Pool Area" },
      { url: IMG_6590, caption: "Rooftop Sunset" },
    ],
    columns: "3",
  },
  Component: (props: Record<string, unknown>) => {
    const p = props as { title: string; images: { url: string; caption: string }[]; columns: string };
    const [lightbox, setLightbox] = React.useState<number | null>(null);
    const cols = p.columns === "2" ? "sm:grid-cols-2" : p.columns === "4" ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";
    return (
      <>
        <section className="bg-cpm-bg-primary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.title}</h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
            </div>
            <div className={`grid ${cols} gap-3`}>
              {(p.images || []).map((img, i) => (
                <div key={i} className="group relative cursor-pointer overflow-hidden rounded-xl" style={{ animation: `scaleIn 0.4s ease-out ${i * 0.05}s both` }} onClick={() => setLightbox(i)}>
                  <div className="relative aspect-square overflow-hidden">
                    <img src={img.url} alt={img.caption} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-cpm-bg-primary/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    {img.caption && <p className="absolute bottom-0 left-0 right-0 px-3 pb-3 text-sm font-medium text-cpm-text-primary opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">{img.caption}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        {lightbox !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-cpm-bg-primary/95 backdrop-blur-md" onClick={() => setLightbox(null)}>
            <button className="absolute right-6 top-6 text-cpm-text-primary hover:text-cpm-accent z-10" onClick={() => setLightbox(null)}><svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button>
            <div className="relative max-h-[85vh] max-w-[85vw]" onClick={(e) => e.stopPropagation()}>
              <img src={(p.images || [])[lightbox]?.url || ""} alt="" className="max-h-[80vh] rounded-2xl object-contain" />
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-3">
                <button onClick={() => setLightbox(Math.max(0, lightbox - 1))} className="rounded-full bg-cpm-bg-secondary px-3 py-2 text-cpm-text-primary hover:bg-cpm-border disabled:opacity-30" disabled={lightbox === 0}><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg></button>
                <span className="text-sm text-cpm-text-secondary">{lightbox + 1} / {(p.images || []).length}</span>
                <button onClick={() => setLightbox(Math.min((p.images || []).length - 1, lightbox + 1))} className="rounded-full bg-cpm-bg-secondary px-3 py-2 text-cpm-text-primary hover:bg-cpm-border" disabled={lightbox === (p.images || []).length - 1}><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg></button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  },
};

// ============================================================
// TIMELINE (vertical process/history steps)
// ============================================================
const Timeline = {
  label: "Timeline",
  fields: {
    title: { type: "text" as const },
    steps: {
      type: "array" as const, label: "Steps",
      defaultItemProps: { title: "Step", description: "Description", date: "", icon: "circle" },
      getItemSummary: (item: Record<string, unknown>) => (item as { title?: string }).title || "Step",
      arrayFields: {
        title: { type: "text" as const },
        description: { type: "textarea" as const },
        date: { type: "text" as const, label: "Date/Label" },
        icon: { type: "select" as const, options: [{ label: "Circle", value: "circle" }, { label: "Check", value: "check" }, { label: "Star", value: "star" }, { label: "Flag", value: "flag" }] },
      },
    },
  },
  defaultProps: {
    title: "How It Works",
    steps: [
      { title: "Free Assessment", description: "We visit your property, evaluate its potential, and provide a detailed management proposal with revenue projections.", date: "Step 1", icon: "circle" },
      { title: "Onboarding", description: "Our team handles everything — professional photography, listing creation, platform setup, and property preparation.", date: "Step 2", icon: "check" },
      { title: "Active Management", description: "We manage your property full-time: pricing, guest communication, cleaning, maintenance, and performance reporting.", date: "Step 3", icon: "star" },
      { title: "Growth & Returns", description: "Watch your rental income grow with our data-driven approach, transparent reporting, and continuous optimisation.", date: "Step 4", icon: "flag" },
    ],
  },
  render: (props: Record<string, unknown>) => {
    const p = props as { title: string; steps: { title: string; description: string; date: string; icon: string }[] };
    const iconSvgs: Record<string, string> = {
      circle: "M12 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
      check: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
      star: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292Z",
      flag: "M3 3v1.5M3 21v-6m0 0 2.25-2.25M3 16.5a2.25 2.25 0 0 1 2.25 2.25M21 16.5V6a2.25 2.25 0 0 0-2.25-2.25H9M21 16.5a2.25 2.25 0 0 1-2.25 2.25m0 0-1.5-1.5M15 3H9m12 16.5V3",
    };
    return (
      <>
        <section className="bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-4xl">
            <div className="mb-14 text-center">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.title}</h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
            </div>
            <div className="relative">
              <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-cpm-accent via-cpm-accent/30 to-cpm-accent/10" />
              <div className="space-y-12">
                {(p.steps || []).map((step, i) => (
                  <div key={i} className="relative flex gap-6" style={{ animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both` }}>
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-cpm-accent bg-cpm-bg-primary">
                      <svg className="h-4 w-4 text-cpm-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={iconSvgs[step.icon] || iconSvgs.circle} /></svg>
                    </div>
                    <div className="pt-1">
                      {step.date && <span className="mb-1 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-cpm-accent">{step.date}</span>}
                      <h3 className="mb-1 text-lg font-medium text-cpm-text-primary">{step.title}</h3>
                      <p className="text-sm leading-relaxed text-cpm-text-secondary">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </>
    );
  },
};

// ============================================================
// TEXT BLOCK (customisable heading + body + badge)
// ============================================================
const TextBlock = {
  label: "Text Block",
  fields: {
    heading: { type: "text" as const, label: "Heading" },
    body: { type: "textarea" as const, label: "Body Text" },
    badge: { type: "text" as const, label: "Badge Text" },
    align: { type: "select" as const, options: [{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }] },
    size: { type: "select" as const, options: [{ label: "Large", value: "lg" }, { label: "Medium", value: "md" }, { label: "Small", value: "sm" }] },
    style: { type: "select" as const, options: [{ label: "Default", value: "default" }, { label: "Gold Accent", value: "gold" }, { label: "Glass Card", value: "glass" }] },
  },
  defaultProps: { heading: "Welcome to Christiano", body: "Your luxury property management partner in Malta. We bring five-star hospitality standards to short-term rental management.", badge: "", align: "center", size: "lg", style: "default" },
  render: (props: Record<string, unknown>) => {
    const p = props as { heading: string; body: string; badge: string; align: string; size: string; style: string };
    const alignCls = p.align === "center" ? "text-center" : p.align === "right" ? "text-right" : "text-left";
    const headingSize = p.size === "lg" ? "text-3xl sm:text-4xl" : p.size === "sm" ? "text-xl" : "text-2xl";
    const bodySize = p.size === "lg" ? "text-base" : p.size === "sm" ? "text-sm" : "text-base";
    const maxW = p.size === "lg" ? "max-w-4xl" : p.size === "sm" ? "max-w-2xl" : "max-w-3xl";
    const wrapperCls = p.style === "glass" ? "rounded-2xl border border-cpm-accent/10 p-8 sm:p-12 backdrop-blur-xl" : p.style === "gold" ? "rounded-2xl border-l-4 border-l-cpm-accent p-8 sm:p-12 bg-cpm-accent/5" : "py-4";
    return (
      <>
        <section className={`bg-cpm-bg-primary px-4 sm:px-8`}>
          <div className={`mx-auto ${maxW} ${wrapperCls}`}>
            <div className={alignCls}>
              {p.badge && <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-cpm-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-cpm-accent"><span className="h-1.5 w-1.5 rounded-full bg-cpm-accent" />{p.badge}</span>}
              {p.heading && <h2 className={`mb-4 font-[family-name:var(--font-heading)] ${headingSize} font-light tracking-tight text-cpm-text-primary`}>{p.heading}</h2>}
              {p.body && <p className={`${bodySize} leading-relaxed text-cpm-text-secondary`} style={{ whiteSpace: "pre-line" }}>{p.body}</p>}
            </div>
          </div>
        </section>
      </>
    );
  },
};

// ============================================================
// FEATURE GRID (icon + text 3-column grid)
// ============================================================
const FeatureGrid = {
  label: "Feature Grid",
  fields: {
    title: { type: "text" as const },
    subtitle: { type: "textarea" as const },
    items: {
      type: "array" as const, label: "Features",
      defaultItemProps: { title: "Feature", description: "Description", icon: "star" },
      getItemSummary: (item: Record<string, unknown>) => (item as { title?: string }).title || "Feature",
      arrayFields: {
        title: { type: "text" as const },
        description: { type: "textarea" as const },
        icon: { type: "text" as const, label: "Icon (lucide name)" },
      },
    },
  },
  defaultProps: {
    title: "Why Malta?",
    subtitle: "The Mediterranean gem that offers an unbeatable combination of lifestyle, culture, and investment opportunity.",
    items: [
      { title: "300 Days of Sunshine", description: "Malta enjoys one of the highest sunshine counts in Europe, making it a year-round destination.", icon: "sun" },
      { title: "English Speaking", description: "English is an official language, making communication seamless for international guests and owners.", icon: "globe" },
      { title: "EU Member", description: "Malta is part of the European Union, offering stability and access to EU funding programmes.", icon: "flag" },
      { title: "Tax Benefits", description: "Favourable property tax structures and no capital gains tax on qualifying properties.", icon: "trending-up" },
      { title: "Strategic Location", description: "Central Mediterranean location with excellent flight connections across Europe and beyond.", icon: "plane" },
      { title: "Rich Heritage", description: "UNESCO World Heritage sites, ancient architecture, and a vibrant cultural scene.", icon: "landmark" },
    ],
  },
  render: (props: Record<string, unknown>) => {
    const p = props as { title: string; subtitle: string; items: { title: string; description: string; icon: string }[] };
    const icons: Record<string, string> = {
      sun: "M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z",
      globe: "M12 21a9.004 9.004 0 0 0 8.716 8.716 4.24 4.24 0 0 0-3.374-3.374M3 9.75c0 5.592 3.824 10.29 9 11.622 5.176 1.332 9 6.03 9 11.622M3.75 4.875c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125H9.75c-.621 0-1.125-.504-1.125-1.125v-9.75",
      flag: "M3 3v1.5M3 21v-6m0 0 2.25-2.25M3 16.5a2.25 2.25 0 0 1 2.25 2.25M21 16.5V6a2.25 2.25 0 0 0-2.25-2.25H9M21 16.5a2.25 2.25 0 0 1-2.25 2.25m0 0-1.5-1.5M15 3H9m12 16.5V3",
      "trending-up": "M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941",
      plane: "M6 12 3.75 3.75M6 12h12m-3.75 0 9 0 0 1-18 0 9 9 0 0 1 18 0Zm-9.75 0h.008v.008H6v-.008ZM6.75 15a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Zm14.25 0a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z",
      landmark: "M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
      shield: "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176 1.332 9 6.03 9 11.622Z",
      home: "m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
      star: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292Z",
      check: "M4.5 12.75l6 6 9-13.5",
    };
    return (
      <>
        <section className="bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.title}</h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
              {p.subtitle && <p className="mx-auto mt-4 max-w-2xl text-base text-cpm-text-secondary">{p.subtitle}</p>}
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(p.items || []).map((item, i) => (
                <div key={i} className="group rounded-2xl border border-cpm-border bg-cpm-bg-primary p-6 transition-all duration-500 hover:-translate-y-1 hover:border-cpm-accent/20 hover:shadow-[0_8px_30px_rgba(200,169,106,0.06)]" style={{ animation: `scaleIn 0.5s ease-out ${i * 0.08}s both` }}>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cpm-accent to-cpm-gold-dark text-cpm-bg-primary transition-transform duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(200,169,106,0.2)]">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d={icons[item.icon] || icons.star} /></svg>
                  </div>
                  <h3 className="mb-2 text-base font-medium text-cpm-text-primary transition-colors duration-300 group-hover:text-cpm-accent">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-cpm-text-secondary">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  },
};

// ============================================================
// MAP SECTION (Google Maps embed with location info)
// ============================================================
const MapSection = {
  label: "Map Section",
  fields: {
    title: { type: "text" as const },
    description: { type: "textarea" as const },
    latitude: { type: "text" as const, label: "Latitude" },
    longitude: { type: "text" as const, label: "Longitude" },
    address: { type: "text" as const, label: "Display Address" },
    height: { type: "select" as const, options: [{ label: "Short (300px)", value: "300" }, { label: "Medium (450px)", value: "450" }, { label: "Tall (600px)", value: "600" }] },
  },
  defaultProps: {
    title: "Our Location",
    description: "Visit our office in the heart of Malta.",
    latitude: "35.8961",
    longitude: "14.4645",
    address: CONTACT.location,
    height: "450",
  },
  render: (props: Record<string, unknown>) => {
    const p = props as { title: string; description: string; latitude: string; longitude: string; address: string; height: string };
    return (
      <>
        <section className="bg-cpm-bg-primary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 text-center">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.title}</h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
              {p.description && <p className="mx-auto mt-4 max-w-2xl text-base text-cpm-text-secondary">{p.description}</p>}
            </div>
            <div className="overflow-hidden rounded-2xl border border-cpm-border transition-all duration-300 hover:border-cpm-accent/20">
              <div className="relative flex items-center justify-center bg-cpm-bg-secondary" style={{ minHeight: `${p.height}px` }}>
                <iframe
                  src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3000!2d${p.longitude}!3d${p.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s${encodeURIComponent(p.address)}!5e0!3m2!1sen!2s!4v1`}
                  width="100%" height="100%"
                  style={{ border: 0, minHeight: `${p.height}px` }}
                  allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Location Map"
                />
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 rounded-xl bg-cpm-bg-primary/90 px-4 py-3 backdrop-blur-sm">
                  <svg className="h-4 w-4 text-cpm-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                  <span className="text-sm font-medium text-cpm-text-primary">{p.address}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  },
};

// ============================================================
// SPACER (height spacer for layout control)
// ============================================================
const Spacer = {
  label: "Spacer",
  fields: {
    size: { type: "select" as const, options: [{ label: "XS (16px)", value: "16" }, { label: "SM (32px)", value: "32" }, { label: "MD (48px)", value: "48" }, { label: "LG (64px)", value: "64" }, { label: "XL (96px)", value: "96" }, { label: "2XL (128px)", value: "128" }] },
  },
  defaultProps: { size: "64" },
  render: (props: Record<string, unknown>) => {
    const p = props as { size: string };
    return (
      <div style={{ height: `${p.size}px` }} className="w-full" />
    );
  },
};

// ============================================================
// THEME SETTINGS (invisible on render, configurable in editor)
// ============================================================
const ThemeSettings = {
  label: "Theme Settings",
  fields: {
    accentColor: {
      type: "text" as const,
      label: "Accent Color",
    },
    backgroundShade: {
      type: "select" as const,
      label: "Background Shade",
      options: [
        { label: "Darkest", value: "darkest" },
        { label: "Dark", value: "dark" },
        { label: "Medium", value: "medium" },
      ],
    },
    fontBody: {
      type: "select" as const,
      label: "Body Font",
      options: [
        { label: "Outfit", value: "Outfit" },
        { label: "Inter", value: "Inter" },
        { label: "Lato", value: "Lato" },
        { label: "DM Sans", value: "DM Sans" },
        { label: "Poppins", value: "Poppins" },
      ],
    },
    fontHeading: {
      type: "select" as const,
      label: "Heading Font",
      options: [
        { label: "Cormorant Garamond", value: "Cormorant Garamond" },
        { label: "Playfair Display", value: "Playfair Display" },
        { label: "Libre Baskerville", value: "Libre Baskerville" },
        { label: "Fraunces", value: "Fraunces" },
        { label: "DM Serif Display", value: "DM Serif Display" },
      ],
    },
    borderRadius: {
      type: "select" as const,
      label: "Border Radius",
      options: [
        { label: "Sharp", value: "sharp" },
        { label: "Subtle", value: "subtle" },
        { label: "Rounded", value: "rounded" },
        { label: "Pill", value: "pill" },
      ],
    },
    animationSpeed: {
      type: "select" as const,
      label: "Animation Speed",
      options: [
        { label: "Instant", value: "instant" },
        { label: "Fast", value: "fast" },
        { label: "Normal", value: "normal" },
        { label: "Slow", value: "slow" },
        { label: "Disabled", value: "disabled" },
      ],
    },
  },
  defaultProps: {
    accentColor: "",
    backgroundShade: "darkest",
    fontBody: "Outfit",
    fontHeading: "Cormorant Garamond",
    borderRadius: "rounded",
    animationSpeed: "normal",
  },
  render: (props: Record<string, unknown>) => {
    const p = props as {
      accentColor: string;
      backgroundShade: string;
      fontBody: string;
      fontHeading: string;
      borderRadius: string;
      animationSpeed: string;
    };

    // Build CSS overrides based on editor configuration
    const bgMap: Record<string, { primary: string; secondary: string; tertiary: string; border: string; borderHover: string }> = {
      darkest: {
        primary: "#0e0f11",
        secondary: "#15171b",
        tertiary: "#1a1c21",
        border: "#1b1e23",
        borderHover: "#2a2d33",
      },
      dark: {
        primary: "#12141a",
        secondary: "#1a1c24",
        tertiary: "#22252e",
        border: "#2a2d38",
        borderHover: "#3a3d48",
      },
      medium: {
        primary: "#1a1c24",
        secondary: "#22252e",
        tertiary: "#2a2d38",
        border: "#353842",
        borderHover: "#454855",
      },
    };

    const radiusMap: Record<string, string> = {
      sharp: "4px",
      subtle: "8px",
      rounded: "12px",
      pill: "9999px",
    };

    const bg = bgMap[p.backgroundShade] || bgMap.darkest;
    const accent = p.accentColor || "#c8a96a";
    const fontBody = p.fontBody || "Outfit";
    const fontHeading = p.fontHeading || "Cormorant Garamond";
    const radius = radiusMap[p.borderRadius] || radiusMap.rounded;
    const speed = p.animationSpeed || "normal";

    // Helper: lighten a hex color by a percentage
    function lightenHex(hex: string, percent: number): string {
      const cleaned = hex.replace("#", "");
      const r = Math.min(255, parseInt(cleaned.substring(0, 2), 16) + Math.round(255 * percent / 100));
      const g = Math.min(255, parseInt(cleaned.substring(2, 4), 16) + Math.round(255 * percent / 100));
      const b = Math.min(255, parseInt(cleaned.substring(4, 6), 16) + Math.round(255 * percent / 100));
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    // Helper: parse hex to rgba
    function hexToRgba(hex: string, alpha: number): string {
      const cleaned = hex.replace("#", "");
      const r = parseInt(cleaned.substring(0, 2), 16);
      const g = parseInt(cleaned.substring(2, 4), 16);
      const b = parseInt(cleaned.substring(4, 6), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    }

    // Compute a hover variant (lighten by ~20%)
    const accentHover = p.accentColor ? lightenHex(p.accentColor, 20) : "#d4b87a";
    // Compute dim variant (30% opacity)
    const accentDim = p.accentColor ? hexToRgba(p.accentColor, 0.3) : "rgba(200, 169, 106, 0.3)";
    // Parse hex to rgba for shadow-glow
    const shadowGlow = p.accentColor
      ? `0 0 30px ${hexToRgba(p.accentColor, 0.15)}`
      : "0 0 30px rgba(200,169,106,0.15)";

    // Animation speed CSS classes
    const speedCss = `
      .cpm-speed-instant * { animation-duration: 0.01s !important; transition-duration: 0.01s !important; }
      .cpm-speed-fast * { animation-duration: 0.3s !important; transition-duration: 0.15s !important; }
      .cpm-speed-normal * { /* default */ }
      .cpm-speed-slow * { animation-duration: 2s !important; transition-duration: 0.8s !important; }
      .cpm-speed-disabled * { animation: none !important; transition: none !important; }
    `;

    // Font CSS overrides
    const fontCss = `
      body, .font-body { font-family: '${fontBody}', system-ui, sans-serif !important; }
      h1, h2, h3, h4, h5, h6, .font-heading, .font-\\[family-name\\:var\\(--font-heading\\)\\] { font-family: '${fontHeading}', serif !important; }
    `;

    // Border radius global override
    const radiusCss = `
      * { border-radius: ${radius} !important; }
    `;

    const cssOverrides = `
      :root {
        --cpm-accent: ${accent};
        --cpm-accent-hover: ${accentHover};
        --cpm-accent-dim: ${accentDim};
        --cpm-bg-primary: ${bg.primary};
        --cpm-bg-secondary: ${bg.secondary};
        --cpm-bg-tertiary: ${bg.tertiary};
        --cpm-border: ${bg.border};
        --cpm-border-hover: ${bg.borderHover};
        --cpm-shadow-glow: ${shadowGlow};
        --cpm-radius: ${radius};
        --cpm-speed: ${speed};
        --font-body: '${fontBody}', system-ui, sans-serif;
        --font-heading: '${fontHeading}', serif;
        --background: ${bg.primary};
        --foreground: #ede9e0;
        --card: ${bg.secondary};
        --card-foreground: #ede9e0;
        --popover: ${bg.secondary};
        --popover-foreground: #ede9e0;
        --primary: ${accent};
        --primary-foreground: ${bg.primary};
        --secondary: ${bg.border};
        --secondary-foreground: #ede9e0;
        --muted: ${bg.border};
        --muted-foreground: var(--cpm-text-secondary);
        --accent: ${accent};
        --accent-foreground: ${bg.primary};
        --border: ${bg.border};
        --input: ${bg.border};
        --ring: ${accent};
        --chart-1: ${accent};
        --sidebar: ${bg.secondary};
        --sidebar-primary: ${accent};
        --sidebar-primary-foreground: ${bg.primary};
        --sidebar-accent: ${bg.border};
        --sidebar-accent-foreground: #ede9e0;
        --sidebar-border: ${bg.border};
        --sidebar-ring: ${accent};
      }

      ${fontCss}

      ${radiusCss}

      ${speedCss}
    `;

    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: cssOverrides }} />
        <div className="min-h-0" />
      </>
    );
  },
};

// ============================================================
// 28. TEAM SECTION
// ============================================================
const TeamSection = {
  label: "Team Section",
  fields: {
    title: { type: "text" as const },
    subtitle: { type: "textarea" as const },
    members: {
      type: "array" as const,
      label: "Team Members",
      defaultItemProps: { name: "Team Member", role: "Role", bio: "Short bio.", imageUrl: "" },
      getItemSummary: (item: Record<string, unknown>) => (item as { name?: string }).name || "Team Member",
      arrayFields: {
        name: { type: "text" as const },
        role: { type: "text" as const },
        bio: { type: "textarea" as const },
        imageUrl: { type: "text" as const, label: "Photo URL" },
      },
    },
  },
  defaultProps: {
    title: "Meet the Team",
    subtitle: "The dedicated professionals behind our success.",
    members: [
      { name: "Christiano", role: "Founder & CEO", bio: "With over 9 years of Superhost experience and a background in international luxury hotel management.", imageUrl: "" },
      { name: "Sarah", role: "Guest Relations Manager", bio: "Ensuring every guest receives a five-star experience from booking to checkout.", imageUrl: "" },
      { name: "James", role: "Operations Lead", bio: "Coordinating cleaning, maintenance, and property preparation to the highest standards.", imageUrl: "" },
    ],
  },
  render: (props: Record<string, unknown>) => {
    const p = props as {
      title: string;
      subtitle: string;
      members: { name: string; role: string; bio: string; imageUrl: string }[];
    };
    return (
      <>
        <section className="bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center" style={{ animation: "fadeInUp 0.6s ease-out" }}>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.title}</h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
              {p.subtitle && <p className="mt-4 text-base text-cpm-text-secondary">{p.subtitle}</p>}
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(p.members || []).map((member, i) => {
                const initials = member.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                return (
                  <div
                    key={i}
                    className="group relative rounded-2xl border border-cpm-border bg-cpm-bg-primary p-6 text-center transition-all duration-500 hover:-translate-y-1 hover:border-cpm-accent/30 hover:shadow-[0_8px_30px_rgba(200,169,106,0.08)]"
                    style={{ animation: `fadeInUp 0.6s ease-out ${i * 0.12}s both` }}
                  >
                    {/* Photo or initials */}
                    <div className="mx-auto mb-5 flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-full border-2 border-cpm-accent/20 transition-all duration-500 group-hover:border-cpm-accent/50 group-hover:shadow-[0_0_30px_rgba(200,169,106,0.15)]">
                      {member.imageUrl ? (
                        <img src={member.imageUrl} alt={member.name} className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <div
                          className="flex h-full w-full items-center justify-center text-2xl font-light"
                          style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-gold-dark))" }}
                        >
                          <span className="text-cpm-bg-primary">{initials}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="mb-1 text-lg font-medium text-cpm-text-primary transition-colors duration-300 group-hover:text-cpm-accent">{member.name}</h3>
                    <p className="mb-3 text-sm font-medium text-cpm-accent">{member.role}</p>
                    <p className="text-sm leading-relaxed text-cpm-text-secondary">{member.bio}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </>
    );
  },
};

// ============================================================
// 29. VIDEO SECTION
// ============================================================
const VideoSection = {
  label: "Video Section",
  fields: {
    title: { type: "text" as const },
    description: { type: "textarea" as const },
    videoUrl: { type: "text" as const, label: "YouTube/Vimeo Embed URL" },
    thumbnailUrl: { type: "text" as const, label: "Thumbnail Image URL" },
    aspectRatio: {
      type: "select" as const,
      options: [
        { label: "16:9", value: "16:9" },
        { label: "4:3", value: "4:3" },
        { label: "1:1", value: "1:1" },
      ],
    },
  },
  defaultProps: {
    title: "Watch Our Story",
    description: "Discover how we deliver exceptional property management across Malta.",
    videoUrl: "",
    thumbnailUrl: "",
    aspectRatio: "16:9",
  },
  render: (props: Record<string, unknown>) => {
    const p = props as {
      title: string;
      description: string;
      videoUrl: string;
      thumbnailUrl: string;
      aspectRatio: string;
    };
    const aspectClass = p.aspectRatio === "4:3" ? "aspect-[4/3]" : p.aspectRatio === "1:1" ? "aspect-square" : "aspect-video";
    // Extract embed URL from YouTube/Vimeo
    let embedUrl = "";
    if (p.videoUrl) {
      if (p.videoUrl.includes("youtube.com/watch")) {
        const vid = new URL(p.videoUrl).searchParams.get("v");
        if (vid) embedUrl = `https://www.youtube.com/embed/${vid}`;
      } else if (p.videoUrl.includes("youtu.be/")) {
        const vid = p.videoUrl.split("youtu.be/")[1]?.split("?")[0];
        if (vid) embedUrl = `https://www.youtube.com/embed/${vid}`;
      } else if (p.videoUrl.includes("vimeo.com/")) {
        const vid = p.videoUrl.split("vimeo.com/")[1]?.split("?")[0];
        if (vid) embedUrl = `https://player.vimeo.com/video/${vid}`;
      } else {
        embedUrl = p.videoUrl;
      }
    }
    return (
      <>
        <section className="bg-cpm-bg-primary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center" style={{ animation: "fadeInUp 0.6s ease-out" }}>
              {p.title && <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.title}</h2>}
              {p.title && <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />}
              {p.description && <p className="mt-4 text-base text-cpm-text-secondary">{p.description}</p>}
            </div>
            <div
              className="overflow-hidden rounded-2xl border border-cpm-border transition-all duration-500 hover:border-cpm-accent/20 hover:shadow-[0_0_30px_rgba(200,169,106,0.08)]"
              style={{ animation: "fadeInUp 0.8s ease-out 0.2s both" }}
            >
              <div className={aspectClass}>
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={p.title || "Video"}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-cpm-bg-secondary">
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-cpm-accent/20 bg-cpm-accent/10">
                        <svg className="h-7 w-7 text-cpm-accent" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      <p className="text-sm text-cpm-text-secondary">Video Coming Soon</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </>
    );
  },
};

// ============================================================
// 30. NEWSLETTER SECTION
// ============================================================
const NewsletterSection = {
  label: "Newsletter Section",
  fields: {
    heading: { type: "text" as const },
    description: { type: "textarea" as const },
    buttonText: { type: "text" as const, label: "Subscribe Button Text" },
    successMessage: { type: "textarea" as const, label: "Success Message" },
  },
  defaultProps: {
    heading: "Stay in the Loop",
    description: "Subscribe to our newsletter for the latest property listings, exclusive deals, and local Malta tips.",
    buttonText: "Subscribe",
    successMessage: "Thank you for subscribing! We'll be in touch soon.",
  },
  Component: (props: Record<string, unknown>) => {
    const p = props as { heading: string; description: string; buttonText: string; successMessage: string };
    const [email, setEmail] = React.useState("");
    const [subscribed, setSubscribed] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Please enter a valid email address.");
        return;
      }
      setLoading(true);
      // Simulate subscription
      setTimeout(() => {
        setLoading(false);
        setSubscribed(true);
        toast.success(p.successMessage || "Successfully subscribed!");
      }, 800);
    };

    return (
      <>
        <section className="relative bg-cpm-bg-primary px-4 py-20 sm:px-8 overflow-hidden">
          {/* Background decorative gradient */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ background: "radial-gradient(ellipse at center, var(--cpm-accent), transparent 70%)" }} />
          <div className="mx-auto max-w-2xl" style={{ animation: "scaleIn 0.6s ease-out" }}>
            {/* Glassmorphism card */}
            <div
              className="relative rounded-2xl p-10 text-center backdrop-blur-xl overflow-hidden sm:p-12"
              style={{ background: "linear-gradient(135deg, rgba(200,169,106,0.08), rgba(200,169,106,0.03))", border: "1px solid rgba(200,169,106,0.15)" }}
            >
              {/* Top gradient accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, var(--cpm-accent), transparent)" }} />
              {/* Corner accent decorations */}
              <div className="absolute top-0 left-0 h-6 w-[2px] bg-gradient-to-b from-cpm-accent/60 to-transparent" />
              <div className="absolute top-0 left-0 h-[2px] w-6 bg-gradient-to-r from-cpm-accent/60 to-transparent" />
              <div className="absolute top-0 right-0 h-6 w-[2px] bg-gradient-to-b from-cpm-accent/60 to-transparent" />
              <div className="absolute top-0 right-0 h-[2px] w-6 bg-gradient-to-l from-cpm-accent/60 to-transparent" />
              <div className="absolute bottom-0 left-0 h-6 w-[2px] bg-gradient-to-t from-cpm-accent/60 to-transparent" />
              <div className="absolute bottom-0 left-0 h-[2px] w-6 bg-gradient-to-r from-cpm-accent/60 to-transparent" />
              <div className="absolute bottom-0 right-0 h-6 w-[2px] bg-gradient-to-t from-cpm-accent/60 to-transparent" />
              <div className="absolute bottom-0 right-0 h-[2px] w-6 bg-gradient-to-l from-cpm-accent/60 to-transparent" />

              <div className="relative z-10">
                {!subscribed ? (
                  <>
                    {/* Envelope icon */}
                    <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-cpm-accent/10">
                      <svg className="h-7 w-7 text-cpm-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <h2 className="mb-3 font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.heading}</h2>
                    <p className="mb-8 text-base text-cpm-text-secondary">{p.description}</p>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="flex-1 rounded-xl border border-cpm-border bg-cpm-bg-primary px-5 py-3.5 text-sm text-cpm-text-primary placeholder-cpm-text-tertiary outline-none transition-all duration-300 focus:border-cpm-accent/50"
                        required
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-cpm-bg-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,169,106,0.3)] active:scale-[0.98] disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-accent-hover))" }}
                      >
                        {loading ? (
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <>
                            {p.buttonText}
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                            </svg>
                          </>
                        )}
                      </button>
                    </form>
                  </>
                ) : (
                  <div style={{ animation: "scaleIn 0.5s ease-out" }}>
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-cpm-success/30 bg-cpm-success/10" style={{ animation: "glowPulse 2s ease-in-out infinite" }}>
                      <svg className="h-8 w-8 text-cpm-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <h3 className="mb-2 font-[family-name:var(--font-heading)] text-2xl font-light text-cpm-text-primary">You're Subscribed!</h3>
                    <p className="text-sm text-cpm-text-secondary">{p.successMessage}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </>
    );
  },
};

// ============================================================
// 31. COMPARISON SECTION
// ============================================================
const ComparisonSection = {
  label: "Comparison Section",
  fields: {
    title: { type: "text" as const },
    columns: {
      type: "array" as const,
      label: "Columns",
      defaultItemProps: { heading: "Plan", description: "Plan description.", highlighted: "false" },
      getItemSummary: (item: Record<string, unknown>) => (item as { heading?: string }).heading || "Plan",
      arrayFields: {
        heading: { type: "text" as const },
        description: { type: "textarea" as const },
        highlighted: {
          type: "select" as const,
          label: "Highlight this column",
          options: [
            { label: "Yes", value: "true" },
            { label: "No", value: "false" },
          ],
        },
        features: {
          type: "array" as const,
          label: "Features",
          defaultItemProps: { text: "Feature", included: "true" },
          getItemSummary: (item: Record<string, unknown>) => (item as { text?: string }).text || "Feature",
          arrayFields: {
            text: { type: "text" as const },
            included: {
              type: "select" as const,
              options: [
                { label: "Included", value: "true" },
                { label: "Not Included", value: "false" },
              ],
            },
          },
        },
      },
    },
  },
  defaultProps: {
    title: "Compare Our Plans",
    columns: [
      {
        heading: "Starter",
        description: "For new property owners looking to get started with professional management.",
        highlighted: "false",
        features: [
          { text: "Basic Listing Setup", included: "true" },
          { text: "Dynamic Pricing", included: "true" },
          { text: "24/7 Guest Communication", included: "false" },
          { text: "Monthly Reports", included: "false" },
        ],
      },
      {
        heading: "Professional",
        description: "Our most popular plan for serious property investors.",
        highlighted: "true",
        features: [
          { text: "Full Listing Optimization", included: "true" },
          { text: "Dynamic Pricing Strategy", included: "true" },
          { text: "24/7 Guest Communication", included: "true" },
          { text: "Monthly Performance Reports", included: "true" },
        ],
      },
      {
        heading: "Premium",
        description: "The ultimate white-glove property management experience.",
        highlighted: "false",
        features: [
          { text: "Everything in Professional", included: "true" },
          { text: "Interior Design Consultation", included: "true" },
          { text: "Priority Maintenance", included: "true" },
          { text: "Dedicated Account Manager", included: "true" },
        ],
      },
    ],
  },
  render: (props: Record<string, unknown>) => {
    const p = props as {
      title: string;
      columns: {
        heading: string;
        description: string;
        highlighted: string;
        features: { text: string; included: string }[];
      }[];
    };
    return (
      <>
        <section className="bg-cpm-bg-primary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center" style={{ animation: "fadeInUp 0.6s ease-out" }}>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.title}</h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
            </div>
            {/* Horizontal scroll on mobile, grid on desktop */}
            <div className="-mx-4 overflow-x-auto px-4 pb-4 lg:overflow-visible lg:px-0 lg:pb-0">
              <div className="flex gap-6 lg:grid lg:grid-cols-3" style={{ minWidth: p.columns?.length ? `${p.columns.length * 320}px` : undefined }}>
                {(p.columns || []).map((col, i) => {
                  const isHighlighted = col.highlighted === "true";
                  return (
                    <div
                      key={i}
                      className={`relative min-w-[300px] flex-1 rounded-2xl p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 ${
                        isHighlighted
                          ? "shadow-[0_8px_40px_rgba(200,169,106,0.12)]"
                          : "hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
                      }`}
                      style={{
                        background: isHighlighted
                          ? "linear-gradient(135deg, rgba(200,169,106,0.12), rgba(200,169,106,0.04))"
                          : "linear-gradient(135deg, rgba(21,23,27,0.9), rgba(21,23,27,0.6))",
                        border: isHighlighted
                          ? "2px solid rgba(200,169,106,0.35)"
                          : "1px solid rgba(27,30,35,1)",
                        animation: `fadeInUp 0.6s ease-out ${i * 0.15}s both`,
                      }}
                    >
                      {/* Highlighted badge */}
                      {isHighlighted && (
                        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-cpm-accent/15 px-3 py-1">
                          <svg className="h-3.5 w-3.5 text-cpm-accent" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-xs font-semibold text-cpm-accent">Recommended</span>
                        </div>
                      )}
                      <h3
                        className={`mb-2 text-xl font-light ${isHighlighted ? "text-cpm-accent" : "text-cpm-text-primary"}`}
                        style={isHighlighted ? {
                          background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-text-primary))",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        } : undefined}
                      >
                        {col.heading}
                      </h3>
                      <p className="mb-6 text-sm leading-relaxed text-cpm-text-secondary">{col.description}</p>
                      {/* Features list */}
                      <div className="space-y-3">
                        {(col.features || []).map((feat, j) => (
                          <div key={j} className="flex items-center gap-3">
                            {feat.included === "true" ? (
                              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-gold-dark))" }}>
                                <svg className="h-3 w-3 text-cpm-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              </div>
                            ) : (
                              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cpm-text-tertiary/20">
                                <svg className="h-3 w-3 text-cpm-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </div>
                            )}
                            <span className={`text-sm ${feat.included === "true" ? "text-cpm-text-primary" : "text-cpm-text-tertiary"}`}>{feat.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </>
    );
  },
};

// ============================================================
// 32. IMAGE WITH TEXT
// ============================================================
const ImageWithText = {
  label: "Image With Text",
  fields: {
    title: { type: "text" as const },
    description: { type: "textarea" as const },
    imageUrl: { type: "text" as const, label: "Image URL" },
    layout: {
      type: "select" as const,
      options: [
        { label: "Image Left", value: "image-left" },
        { label: "Image Right", value: "image-right" },
        { label: "Image Top", value: "image-top" },
      ],
    },
    buttonText: { type: "text" as const, label: "Button Text" },
    buttonLink: { type: "text" as const, label: "Button Link" },
    badge: { type: "text" as const, label: "Badge Text (optional)" },
  },
  defaultProps: {
    title: "Experience Malta Like a Local",
    description: "Our handpicked properties are located in Malta's most desirable neighborhoods, giving you authentic access to the island's rich culture, stunning beaches, and vibrant nightlife.",
    imageUrl: IMG_9593,
    layout: "image-left",
    buttonText: "Explore Properties",
    buttonLink: "#properties",
    badge: "Featured",
  },
  render: (props: Record<string, unknown>) => {
    const p = props as {
      title: string;
      description: string;
      imageUrl: string;
      layout: string;
      buttonText: string;
      buttonLink: string;
      badge: string;
    };
    const isReversed = p.layout === "image-right";
    const isTop = p.layout === "image-top";
    const paragraphs = (p.description || "").split("\n\n");

    const imageBlock = (
      <div className="group relative overflow-hidden rounded-2xl">
        <img
          src={p.imageUrl || IMG_9593}
          alt={p.title}
          className="h-[350px] w-full object-cover transition-transform duration-700 group-hover:scale-105 lg:h-[450px]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cpm-bg-primary/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
    );

    const textBlock = (
      <div className={isTop ? "" : isReversed ? "lg:order-first lg:border-l-2 lg:border-cpm-accent/30 lg:pl-6 lg:pr-0" : "lg:border-l-2 lg:border-cpm-accent/30 lg:pl-6"}>
        {/* Gold accent line */}
        <div
          className="mb-4 h-[2px] w-12 bg-gradient-to-r from-cpm-accent to-cpm-accent/20"
          style={{ animation: "expandWidth 0.8s ease-out forwards" }}
        />
        {/* Badge */}
        {p.badge && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cpm-accent/30 bg-cpm-accent/10 px-4 py-1.5 backdrop-blur-sm">
            <span className="text-xs font-semibold tracking-[0.12em] text-cpm-accent uppercase">{p.badge}</span>
          </div>
        )}
        <h2 className="mb-4 font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl" style={{ animation: "fadeInUp 0.6s ease-out" }}>
          {p.title}
        </h2>
        <div className="space-y-4" style={{ animation: "fadeInUp 0.8s ease-out 0.15s both" }}>
          {paragraphs.map((para, i) => (
            <p key={i} className="text-base leading-[1.8] text-cpm-text-secondary">{para}</p>
          ))}
        </div>
        {p.buttonText && (
          <div className="mt-6" style={{ animation: "fadeInUp 0.8s ease-out 0.3s both" }}>
            <a
              href={safeHref(p.buttonLink)}
              className="group inline-flex items-center gap-2.5 rounded-lg bg-cpm-accent px-8 py-3.5 text-sm font-semibold text-cpm-bg-primary transition-all duration-300 hover:bg-cpm-accent-hover hover:shadow-[0_0_30px_rgba(200,169,106,0.3)] active:scale-[0.98]"
            >
              {p.buttonText}
              <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        )}
      </div>
    );

    return (
      <>
        <section className="bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32">
          <div className={`mx-auto flex max-w-6xl flex-col items-center gap-12 ${isTop ? "" : "lg:flex-row"}`}>
            {imageBlock}
            {textBlock}
          </div>
        </section>
      </>
    );
  },
};

// ============================================================
// 33. SOCIAL PROOF STRIP
// ============================================================
const SocialProofStrip = {
  label: "Social Proof Strip",
  fields: {
    items: {
      type: "array" as const,
      label: "Metrics",
      defaultItemProps: { number: "100", label: "Metric", prefix: "", suffix: "+" },
      getItemSummary: (item: Record<string, unknown>) => `${(item as { number?: string }).number} ${(item as { label?: string }).label}`,
      arrayFields: {
        number: { type: "text" as const, label: "Metric Number" },
        label: { type: "text" as const },
        prefix: { type: "text" as const, label: "Prefix (e.g. $, €)" },
        suffix: { type: "text" as const, label: "Suffix (e.g. %, +)" },
      },
    },
  },
  defaultProps: {
    items: [
      { number: "4.9", label: "Average Rating", prefix: "", suffix: "★" },
      { number: "1000", label: "Happy Guests", prefix: "", suffix: "+" },
      { number: "98", label: "Response Rate", prefix: "", suffix: "%" },
      { number: "50", label: "Properties", prefix: "", suffix: "+" },
    ],
  },
  Component: (props: Record<string, unknown>) => {
    const p = props as {
      items: { number: string; label: string; prefix: string; suffix: string }[];
    };
    const [visible, setVisible] = React.useState(false);
    const [counts, setCounts] = React.useState<Record<string, number>>({});
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
      }, { threshold: 0.3 });
      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    }, []);

    React.useEffect(() => {
      if (!visible) return;
      const targets: Record<string, number> = {};
      (p.items || []).forEach((item, i) => {
        const numStr = item.number.replace(/[^0-9.]/g, "");
        targets[i] = parseFloat(numStr) || 0;
      });
      const duration = 2000;
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const updated: Record<string, number> = {};
        Object.entries(targets).forEach(([k, target]) => {
          updated[k] = Math.round(target * eased * 10) / 10;
        });
        setCounts(updated);
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, [visible, p.items]);

    const formatValue = (item: { number: string; prefix: string; suffix: string }, count: number) => {
      const hasDecimal = item.number.includes(".");
      const formatted = hasDecimal ? count.toFixed(1) : String(Math.round(count));
      return `${item.prefix || ""}${formatted}${item.suffix || ""}`;
    };

    return (
      <>
        <section ref={ref} className="relative bg-cpm-bg-primary px-4 py-16 sm:px-8 overflow-hidden">
          {/* Subtle background gradient */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ background: "radial-gradient(ellipse at center, var(--cpm-accent), transparent 60%)" }} />
          {/* Mobile: scrolling marquee */}
          <div className="lg:hidden">
            <div className="flex gap-0" style={{ animation: "marquee 20s linear infinite" }}>
              {/* Duplicate items for seamless scroll */}
              {[...(p.items || []), ...(p.items || [])].map((item, i) => (
                <div key={i} className="flex shrink-0 items-center gap-3 px-8">
                  <span
                    className="font-[family-name:var(--font-heading)] text-3xl font-light"
                    style={{
                      background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-text-primary))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {visible ? formatValue(item, counts[i % (p.items || []).length] || 0) : `${item.prefix || ""}${item.number}${item.suffix || ""}`}
                  </span>
                  <span className="text-sm text-cpm-text-secondary whitespace-nowrap">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Desktop: grid */}
          <div className="hidden lg:block">
            <div className="mx-auto grid max-w-6xl grid-cols-4 gap-0">
              {(p.items || []).map((item, i) => (
                <div key={i} className="group relative text-center" style={{ animation: `fadeInUp 0.6s ease-out ${i * 0.12}s both` }}>
                  {/* Number */}
                  <div
                    className="font-[family-name:var(--font-heading)] text-4xl font-light transition-transform duration-300 group-hover:scale-105"
                    style={{
                      background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-text-primary))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {visible ? formatValue(item, counts[i] || 0) : `${item.prefix || ""}${item.number}${item.suffix || ""}`}
                  </div>
                  {/* Gold separator line */}
                  <div className="mx-auto my-3 h-[2px] w-12 bg-gradient-to-r from-transparent via-cpm-accent/40 to-transparent transition-all duration-300 group-hover:w-16 group-hover:via-cpm-accent" />
                  {/* Label */}
                  <div className="text-sm text-cpm-text-secondary transition-colors duration-300 group-hover:text-cpm-text-primary">{item.label}</div>
                  {/* Right separator (except last) */}
                  {i < (p.items || []).length - 1 && (
                    <div className="absolute right-0 top-1/2 h-12 -translate-y-1/2 w-[1px] bg-gradient-to-b from-transparent via-cpm-accent/20 to-transparent" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  },
};

// ============================================================
// MALTA & GOZO MAP ANIMATION SECTION
// ============================================================
const MaltaMapSection = {
  label: "Malta & Gozo Map Animation",
  fields: {
    label: { type: "text" as const },
    drawDuration: { type: "number" as const, label: "Draw Duration (ms)" },
    fillDelay: { type: "number" as const, label: "Fill Delay (ms)" },
    sizeClass: {
      type: "select" as const,
      label: "Size Preset",
      options: [
        { label: "Small", value: "w-36 h-24 sm:w-48 sm:h-32 md:w-56 md:h-36" },
        { label: "Medium", value: "w-44 h-32 sm:w-60 sm:h-44 md:w-72 md:h-52" },
        { label: "Large", value: "w-56 h-40 sm:w-72 sm:h-52 md:w-96 md:h-64" },
        { label: "Full Width", value: "w-64 h-44 sm:w-80 sm:h-56 md:w-[28rem] md:h-72 lg:w-[36rem] lg:h-80" },
      ],
    },
    showBrand: {
      type: "select" as const,
      label: "Show Brand Tagline",
      options: [
        { label: "Show", value: "true" },
        { label: "Hide", value: "false" },
      ],
    },
    backgroundStyle: {
      type: "select" as const,
      label: "Background Style",
      options: [
        { label: "Transparent", value: "transparent" },
        { label: "Dark Surface", value: "dark" },
        { label: "Card Surface", value: "card" },
        { label: "Gradient Glow", value: "glow" },
      ],
    },
    paddingY: {
      type: "select" as const,
      label: "Vertical Padding",
      options: [
        { label: "Compact", value: "compact" },
        { label: "Normal", value: "normal" },
        { label: "Spacious", value: "spacious" },
      ],
    },
  },
  defaultProps: {
    label: "",
    drawDuration: 2200,
    fillDelay: 250,
    sizeClass: "w-44 h-32 sm:w-60 sm:h-44 md:w-72 md:h-52",
    showBrand: "true",
    backgroundStyle: "transparent",
    paddingY: "normal",
  },
  Component: (props: Record<string, unknown>) => {
    const p = props as {
      label?: string;
      drawDuration?: number;
      fillDelay?: number;
      sizeClass?: string;
      showBrand?: string;
      backgroundStyle?: string;
      paddingY?: string;
    };

    const paddingMap: Record<string, string> = {
      compact: "py-8",
      normal: "py-16 sm:py-20",
      spacious: "py-24 sm:py-32",
    };

    const bgMap: Record<string, React.CSSProperties & { className?: string }> = {
      transparent: {},
      dark: { className: "bg-cpm-bg-primary" },
      card: { className: "bg-cpm-bg-secondary mx-auto max-w-4xl rounded-3xl border border-cpm-border shadow-[0_0_60px_rgba(200,169,106,0.04)]" },
      glow: {
        className: "relative overflow-hidden",
        style: { background: "radial-gradient(ellipse at 50% 50%, rgba(200,169,106,0.03) 0%, transparent 70%)" },
      },
    };

    const bg = bgMap[p.backgroundStyle || "transparent"] || {};

    return (
      <section className={`relative flex flex-col items-center justify-center px-4 ${paddingMap[p.paddingY || "normal"] || "py-16 sm:py-20"} ${bg.className || ""}`} style={bg.style}>
        {/* Decorative corner accents for card/glow backgrounds */}
        {(p.backgroundStyle === "card" || p.backgroundStyle === "glow") && (
          <>
            <div className="pointer-events-none absolute left-6 top-6 h-px w-16 bg-gradient-to-r from-cpm-accent/20 to-transparent" aria-hidden="true" />
            <div className="pointer-events-none absolute left-6 top-6 h-16 w-px bg-gradient-to-b from-cpm-accent/20 to-transparent" aria-hidden="true" />
            <div className="pointer-events-none absolute right-6 bottom-6 h-px w-16 bg-gradient-to-l from-cpm-accent/20 to-transparent" aria-hidden="true" />
            <div className="pointer-events-none absolute right-6 bottom-6 h-16 w-px bg-gradient-to-t from-cpm-accent/20 to-transparent" aria-hidden="true" />
          </>
        )}
        <div style={{ animation: "fadeInUp 0.8s ease-out" }}>
          <MaltaSVGLoader
            label={p.label || undefined}
            drawDuration={typeof p.drawDuration === "number" ? p.drawDuration : 2200}
            fillDelay={typeof p.fillDelay === "number" ? p.fillDelay : 250}
            sizeClass={p.sizeClass || "w-44 h-32 sm:w-60 sm:h-44 md:w-72 md:h-52"}
            showBrand={p.showBrand !== "false"}
          />
        </div>
      </section>
    );
  },
};

// ============================================================
// PUCK CONFIG EXPORT
// ============================================================
const config = {
  components: {
    HeroSection,
    AboutSection,
    WhyChooseUs,
    ServicesSection,
    PropertyShowcase,
    BookingSection,
    PricingTable,
    TestimonialSection,
    FaqSection,
    ContactSection,
    LogoBar,
    CtaBanner,
    StatsSection,
    FooterSection,
    Divider,
    GuestyPropertySearch,
    GuestyPropertyGrid,
    GuestyPropertyDetail,
    GuestyBookingWidget,
    GuestyBookingConfirmation,
    GuestyBookingDashboard,
    ThemeSettings,
    // NEW BLOCKS:
    ImageGallery, Timeline, TextBlock, FeatureGrid, MapSection, Spacer,
    TeamSection, VideoSection, NewsletterSection, ComparisonSection, ImageWithText, MaltaMapSection, SocialProofStrip,
  },
  categories: {
    Hero: { components: ["HeroSection"] },
    Content: { components: ["AboutSection", "WhyChooseUs", "ServicesSection", "StatsSection", "Timeline", "TextBlock", "FeatureGrid", "TeamSection", "ImageWithText"] },
    Media: { components: ["ImageGallery", "MapSection", "VideoSection"] },
    Properties: { components: ["PropertyShowcase"] },
    Booking: { components: ["BookingSection", "GuestyPropertySearch", "GuestyPropertyGrid", "GuestyPropertyDetail", "GuestyBookingWidget", "GuestyBookingConfirmation", "GuestyBookingDashboard"] },
    Pricing: { components: ["PricingTable", "ComparisonSection"] },
    Testimonials: { components: ["TestimonialSection"] },
    FAQ: { components: ["FaqSection"] },
    Contact: { components: ["ContactSection"] },
    Navigation: { components: ["LogoBar", "CtaBanner", "FooterSection", "SocialProofStrip", "NewsletterSection"] },
    Layout: { components: ["Divider", "Spacer", "MaltaMapSection"] },
    Theme: { components: ["ThemeSettings"] },
  },
};

export default config;

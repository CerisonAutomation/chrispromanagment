/**
 * SINGLE SOURCE OF TRUTH for all static website content.
 * All components read from this blueprint — no hardcoded strings in components.
 */

export interface NavItem {
  id: string;
  label: string;
  href: string;
  external?: boolean;
}

export interface CtaButton {
  label: string;
  href: string;
  variant?: "primary" | "ghost" | "secondary";
  external?: boolean;
  anchorId?: string;
  subtext?: string;
}

export interface SiteBlueprint {
  brand: {
    name: string;
    tagline: string;
    email: string;
    phone: string;
    location: string;
    social: { facebook: string; instagram: string };
  };
  external: {
    bookingEngineUrl: string;
    stayDirectlyUrl: string;
  };
  navItems: NavItem[];
  hero: {
    id: string;
    eyebrow: string;
    headline: string;
    highlightedWord: string;
    subtitle: string;
    primaryCta: CtaButton;
    secondaryCta: CtaButton;
  };
  stats: Array<{ value: string; label: string }>;
  proofStrip: Array<{ icon: string; label: string; desc: string }>;
  metricsTwo: {
    id: string;
    eyebrow: string;
    title: string;
    trustBadges: Array<{ icon: string; title: string; description: string }>;
  };
  process: {
    id: string;
    eyebrow: string;
    title: string;
    highlightedWord: string;
    steps: Array<{ step: string; title: string; body: string }>;
  };
  portfolio: {
    id: string;
    eyebrow: string;
    title: string;
    highlightedWord: string;
    cards: Array<{
      name: string;
      location: string;
      type: string;
      meta: string;
      rating: string;
      externalUrl: string;
    }>;
    primaryCta: CtaButton;
  };
  pricing: {
    id: string;
    eyebrow: string;
    title: string;
    highlightedWord: string;
    intro: string;
    plans: Array<{
      name: string;
      badge?: string;
      price: string;
      subtitle: string;
      tagline: string;
      features: string[];
    }>;
    additionalServicesTitle: string;
    additionalServices: Array<{ name: string; price: string }>;
    additionalNote: string;
  };
  testimonials: {
    id: string;
    eyebrow: string;
    title: string;
    highlightedWord: string;
    items: Array<{ name: string; date: string; rating: number; quote: string }>;
  };
  about: {
    id: string;
    eyebrow: string;
    title: string;
    highlightedWord: string;
    body: string[];
    credentials: string[];
  };
  faq: {
    id: string;
    eyebrow: string;
    title: string;
    highlightedWord: string;
    items: Array<{ question: string; answer: string }>;
  };
  contact: {
    id: string;
    eyebrow: string;
    title: string;
    intro: string;
    ctaCopy: string;
    email: string;
    phone: string;
    locationText: string;
  };
  footer: {
    brandName: string;
    brandTagline: string;
    links: NavItem[];
    socialLinks: Array<{ platform: string; href: string; ariaLabel: string }>;
    copyright: string;
  };
}

export const siteBlueprint: SiteBlueprint = {
  brand: {
    name: "Christiano Vincenti",
    tagline: "Hotel‑level care for your Malta rental property.",
    email: "info@christianopm.com",
    phone: "+356 79790202",
    location: "The Fives A7, Triq Charles Sciberras, St Julian's, Malta",
    social: {
      facebook: "https://facebook.com/christianopropertymanagement",
      instagram: "https://instagram.com/christianopropertymanagement",
    },
  },
  external: {
    bookingEngineUrl: "https://malta.guestybookings.com/en",
    stayDirectlyUrl: "http://malta.staydirectly.com/",
  },
  navItems: [
    { id: "process", label: "How It Works", href: "#process" },
    { id: "portfolio", label: "Properties", href: "#portfolio" },
    { id: "pricing", label: "Pricing", href: "#pricing" },
    { id: "faq", label: "FAQ", href: "#faq" },
  ],
  hero: {
    id: "hero",
    eyebrow: "MALTA'S PREMIER PROPERTY PARTNER · 9+ YEARS EXPERIENCE",
    headline: "Maximise your rental income,",
    highlightedWord: "effortlessly.",
    subtitle: "Full-service short-let management across Malta & Gozo. We handle everything — you earn more.",
    primaryCta: { label: "Get Your Free Assessment", href: "#contact", variant: "primary", subtext: "Response within 24 hours." },
    secondaryCta: { label: "How It Works", href: "#process", variant: "ghost" },
  },
  stats: [
    { value: "€2.4M+", label: "Revenue Generated" },
    { value: "45+", label: "Properties Managed" },
    { value: "4.97", label: "Average Rating" },
    { value: "94%", label: "Occupancy Rate" },
  ],
  proofStrip: [
    { icon: "shield", label: "No Hidden Markups", desc: "Maintenance at cost" },
    { icon: "chart", label: "Owner Dashboard", desc: "Live bookings & revenue" },
    { icon: "clock", label: "24hr Response", desc: "Guaranteed reply" },
    { icon: "star", label: "5-Star Reviews", desc: "Guest satisfaction" },
  ],
  metricsTwo: {
    id: "metrics-two",
    eyebrow: "OUR PERFORMANCE & PROMISE",
    title: "Unrivaled Results, Unwavering Trust",
    trustBadges: [
      { icon: "✓", title: "No Hidden Markups", description: "Maintenance at cost, full transparency." },
      { icon: "📈", title: "Owner Dashboard", description: "Live bookings & revenue tracking." },
      { icon: "⏱️", title: "24hr Response", description: "Guaranteed reply to all inquiries." },
      { icon: "⭐", title: "5-Star Reviews", description: "Consistent guest satisfaction." },
      { icon: "🛡️", title: "Full Legal Compliance", description: "MTA licensing & regulations handled." },
      { icon: "💡", title: "Dynamic Pricing", description: "Optimized for peak ROI." },
      { icon: "✨", title: "Professional Cleaning", description: "Hotel-grade standards after every stay." },
      { icon: "🌐", title: "Global Exposure", description: "Multi-platform listing optimization." },
    ],
  },
  process: {
    id: "process",
    eyebrow: "HOW IT WORKS",
    title: "Three steps to",
    highlightedWord: "stress-free income",
    steps: [
      { step: "01", title: "Free Assessment", body: "Tell us about your property and goals. We'll analyse your potential income and recommend the right plan." },
      { step: "02", title: "We Set You Up", body: "Professional photography, listing optimisation, pricing strategy, and MTA licensing support — all handled." },
      { step: "03", title: "You Earn More", body: "We manage bookings, guests, cleaning, and maintenance. You receive monthly payouts and transparent reports." },
    ],
  },
  portfolio: {
    id: "portfolio",
    eyebrow: "CURATED COLLECTION",
    title: "Properties we",
    highlightedWord: "manage",
    cards: [
      { name: "Seaview Penthouse", location: "Sliema", type: "Penthouse", meta: "3 Bed · Panoramic Views", rating: "4.97", externalUrl: "https://malta.guestybookings.com/en/properties/6878a53de8249000105817f8" },
      { name: "Harbour Terrace", location: "Valletta", type: "Apartment", meta: "2 Bed · Historic · City View", rating: "4.95", externalUrl: "https://malta.guestybookings.com/en/properties/6878a5365a563c0013969391" },
      { name: "Heritage Suite", location: "Mdina", type: "Townhouse", meta: "1 Bed · Private Courtyard", rating: "4.98", externalUrl: "https://malta.guestybookings.com/en/properties/6878a53283f1c400114b71e8" },
    ],
    primaryCta: { label: "View All Properties", href: "http://malta.staydirectly.com/", variant: "ghost", external: true, subtext: "Real-time Availability" },
  },
  pricing: {
    id: "pricing",
    eyebrow: "OUR PRICING",
    title: "Simple,",
    highlightedWord: "transparent pricing",
    intro: "No setup fees. No hidden costs. You only pay when you earn.",
    plans: [
      {
        name: "Essentials",
        price: "15%",
        subtitle: "of booking revenue",
        tagline: "Perfect for owners who want professional listing management with hands-on involvement.",
        features: [
          "Professional photography",
          "Multi-platform listing",
          "Dynamic pricing",
          "Guest communication",
          "Monthly reporting",
          "MTA licence guidance",
        ],
      },
      {
        name: "Complete",
        badge: "MOST POPULAR",
        price: "20%",
        subtitle: "of booking revenue",
        tagline: "Full hands-off management. We handle everything so you don't have to lift a finger.",
        features: [
          "Everything in Essentials",
          "Cleaning coordination",
          "Maintenance at cost",
          "Linen & amenities",
          "Welcome amenities included",
          "Guest property manual",
          "Direct booking website",
          "Owner dashboard access",
          "Priority 24hr support",
          "Quarterly strategy review",
        ],
      },
    ],
    additionalServicesTitle: "Available on both plans — charged separately",
    additionalServices: [
      { name: "Professional Photoshoot", price: "On quotation" },
      { name: "Annual Deep Clean", price: "On quotation" },
      { name: "MTA Licensing", price: "€150 + authority fees" },
      { name: "Procurement & Setup Works", price: "€25/hr + VAT" },
      { name: "Mail & Bills Handling", price: "€10/month" },
      { name: "Interior Design", price: "On quotation" },
    ],
    additionalNote: "Net Room Revenue is calculated on gross rental income, excluding platform commissions, VAT, cleaning fees, damage deposits, and optional extras. All agreements governed by Malta law.",
  },
  testimonials: {
    id: "testimonials",
    eyebrow: "WHAT OUR GUESTS SAY",
    title: "Five-Star Experiences,",
    highlightedWord: "Unforgettable Stays",
    items: [
      { name: "Katie", date: "October 2024", rating: 5, quote: "Christiano was an amazing host and the apartment was flawless. From the slippers to the birthday wine for my husband, everything was spot on." },
      { name: "Eric", date: "October 2024", rating: 5, quote: "Christiano is a gracious, proactive host who made sure I had all the information I needed. Communication was excellent." },
      { name: "Sheldon", date: "September 2024", rating: 5, quote: "Always on hand to help with any queries and was extremely responsive. Definitely recommend it to anyone!" },
      { name: "Anna", date: "September 2024", rating: 5, quote: "The apartment is modern, clean, cozy, and fully equipped. Perfect location, close to the beach and Valletta." },
      { name: "Mikayla", date: "August 2024", rating: 5, quote: "Christiano was the best! Very responsive and helpful. The apartment was clean, and the AC was a huge plus." },
      { name: "Miranda", date: "August 2024", rating: 5, quote: "We loved the apartment—spacious, clean, and felt like home. My daughter wanted to move in forever!" },
      { name: "Molly", date: "August 2024", rating: 5, quote: "Lovely apartment in a great central location. Check-in information was prompt and detailed." },
      { name: "David & Pennie", date: "April 2024", rating: 5, quote: "The apartment was perfect for two couples. Very clean and had all the mod cons you would expect." },
      { name: "Raquel", date: "March 2024", rating: 5, quote: "The Host is very attentive and always available. The apartment was very nice and spacious for families." },
      { name: "Kate", date: "April 2024", rating: 5, quote: "Extremely well equipped, and full of thoughtful touches like the washable slippers and marshmallows!" },
    ],
  },
  about: {
    id: "about",
    eyebrow: "OUR STORY",
    title: "About Christiano",
    highlightedWord: "Property Management",
    body: [
      "At Christiano Property Management, we specialize in managing properties across Malta, one of the Mediterranean's most sought-after destinations.",
      "From cozy apartments to luxurious villas and palazzos, we offer tailored management solutions that maximize both guest satisfaction and property performance. With over 9 years of hosting experience in Malta, we understand the unique appeal of the island.",
      "Our team takes care of everything, from dynamic pricing strategies and 24/7 guest communication to professional cleaning and regular maintenance. We believe in transparency and provide detailed monthly reports so property owners are always in the loop.",
      "Whether you're a seasoned host or new to the vacation rental market, our goal is to make property management hassle-free while optimizing your property's potential.",
    ],
    credentials: [
      "9+ years Superhost experience",
      "International luxury hotel background",
      "45+ properties managed",
      "€2.4M+ revenue generated",
      "4.97 average guest rating",
      "94% occupancy rate",
    ],
  },
  faq: {
    id: "faq",
    eyebrow: "FAQ",
    title: "Common",
    highlightedWord: "questions",
    items: [
      { question: "Do I need an MTA licence to rent short-term in Malta?", answer: "Yes. All short-let properties in Malta require a Malta Tourism Authority (MTA) licence. We guide you through the entire application process as part of our service." },
      { question: "What areas do you cover?", answer: "We manage properties across all of Malta and Gozo, with particular expertise in Sliema, St Julian's, Valletta, Mdina, and Mellieħa." },
      { question: "How quickly can my property go live?", answer: "Most properties are listed within 2–3 weeks of onboarding. This includes professional photography, listing creation, and pricing setup." },
      { question: "What happens with maintenance issues?", answer: "We coordinate all maintenance through our trusted network. Costs are passed through at cost — no markups, ever. You approve anything above a pre-agreed threshold." },
      { question: "Can I block dates for personal use?", answer: "Absolutely. You have full control over your calendar through our owner dashboard. Block dates anytime with no penalties." },
      { question: "What's included in the monthly reporting?", answer: "You receive a detailed monthly statement covering revenue, occupancy, guest reviews, expenses, and a performance summary compared to market benchmarks." },
      { question: "What types of properties do you manage?", answer: "We manage apartments, penthouses, villas, townhouses, farmhouses, maisonettes, and palazzos across Malta and Gozo." },
      { question: "How do you handle guest communication?", answer: "We manage all guest communication before, during, and after their stay — including booking inquiries, check-in instructions, concierge services, and post-stay reviews." },
      { question: "How do you set the rental price for my property?", answer: "We use dynamic pricing algorithms that adjust rates based on seasonality, local events, competitor pricing, and demand patterns to maximize your occupancy and revenue." },
    ],
  },
  contact: {
    id: "contact",
    eyebrow: "GET IN TOUCH",
    title: "Elite Assessment",
    intro: "Ready to elevate your property's performance and income? Start your complimentary assessment today.",
    ctaCopy: "Receive a tailored proposal within 24 hours.",
    email: "info@christianopm.com",
    phone: "+356 79790202",
    locationText: "The Fives A7, Triq Charles Sciberras, St Julian's, Malta",
  },
  footer: {
    brandName: "Christiano Vincenti Property Management",
    brandTagline: "Hotel‑level care for your Malta rental property.",
    links: [
      { id: "process-footer", label: "How It Works", href: "#process" },
      { id: "portfolio-footer", label: "Properties", href: "#portfolio" },
      { id: "pricing-footer", label: "Pricing", href: "#pricing" },
      { id: "faq-footer", label: "FAQ", href: "#faq" },
    ],
    socialLinks: [
      { platform: "Facebook", href: "https://facebook.com/christianopropertymanagement", ariaLabel: "Our Facebook Page" },
      { platform: "Instagram", href: "https://instagram.com/christianopropertymanagement", ariaLabel: "Our Instagram Profile" },
    ],
    copyright: "© 2026 Christiano Property Management. All rights reserved.",
  },
};

// Legacy compatibility
export function getSiteContent() {
  return {
    navigation: siteBlueprint.navItems.map(n => ({ label: n.label, href: n.href })),
    hero: {
      tagline: siteBlueprint.hero.eyebrow,
      headline: siteBlueprint.hero.headline,
      highlightedWord: siteBlueprint.hero.highlightedWord,
      description: siteBlueprint.hero.subtitle,
      ctaText: siteBlueprint.hero.primaryCta.label,
      secondaryCtaText: siteBlueprint.hero.secondaryCta.label,
    },
    stats: siteBlueprint.stats,
  };
}

export async function getSimpleNavigation() {
  return siteBlueprint.navItems.map(n => ({ label: n.label, href: n.href }));
}

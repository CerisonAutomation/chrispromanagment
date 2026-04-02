// =============================================================================
// Christiano Property Management — Centralized Constants
// Single source of truth for all shared values
// =============================================================================

// ─── Site Configuration ────────────────────────────────────────────────────────
export const SITE_NAME = "Christiano Property Management";
export const SITE_SHORT = "CPM";
export const SITE_BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://christianopropertymanagement.com";
export const SITE_DESCRIPTION = "Luxury short-term rental and property management across Malta & Gozo. 9+ years of Superhost experience, transparent fees, no hidden markups, full-service operations for discerning property owners.";

// ─── Brand Values ─────────────────────────────────────────────────────────────
export const BRAND = {
  yearsExperience: "9",
  propertiesManaged: "50+",
  happyGuests: "1000+",
  averageRating: "4.9",
  satisfactionRate: "98%",
  tagline: "Superhost Since 2015",
  superhostYears: "9+ years of Superhost experience",
} as const;

// ─── Contact Information ───────────────────────────────────────────────────────
export const CONTACT = {
  email: "info@christianopropertymanagement.com",
  phone: "+35679790202",
  whatsapp: "+35679790202",
  location: "Birkirkara, Malta",
  address: {
    street: "Birkirkara",
    city: "Birkirkara",
    region: "Central Region",
    postalCode: "BKR",
    country: "MT",
  },
  mapCoords: {
    lat: "35.8961327",
    lng: "14.4644929",
  },
} as const;

// ─── Social Links ──────────────────────────────────────────────────────────────
export const SOCIAL = {
  facebook: "https://facebook.com/christianopropertymanagement",
  instagram: "https://instagram.com/christianopropertymanagement",
  linkedin: "https://linkedin.com/company/christianopropertymanagement",
} as const;

// ─── Navigation ─────────────────────────────────────────────────────────────────
export const NAV_LINKS = [
  { label: "Home", slug: "home" },
  { label: "About", slug: "about" },
  { label: "Properties", slug: "properties" },
  { label: "Book Direct", slug: "book" },
  { label: "Pricing", slug: "pricing" },
  { label: "FAQ", slug: "faq" },
  { label: "Contact", slug: "contact" },
  { label: "Testimonials", slug: "testimonials" },
  { label: "Dashboard", slug: "dashboard" },
] as const;

// ─── Legal / Footer ─────────────────────────────────────────────────────────────
export const COPYRIGHT = `© 2024-2026 ${SITE_NAME}`;

// ─── SEO Page Metadata ──────────────────────────────────────────────────────────
export const PAGE_META: Record<string, { title: string; description: string }> = {
  home: { title: "Christiano Property Management | Luxury Short-Term Rental Management Malta", description: "Luxury short-term rental and property management across Malta and Gozo. 9+ years of Superhost experience, transparent fees, full-service operations." },
  about: { title: "About Us | Christiano Property Management", description: "Learn about Christiano Property Management. 9+ years of luxury short-term rental management across Malta with a background in international hotel hospitality." },
  properties: { title: "Properties | Luxury Rentals Malta & Gozo", description: "Browse our curated collection of luxury short-term rental properties across Malta and Gozo. Villas, apartments, and unique stays." },
  book: { title: "Book Direct | Best Price Guaranteed", description: "Book directly with Christiano Property Management and save. No hidden fees, best price guaranteed, personal service." },
  pricing: { title: "Pricing Plans | Transparent Property Management Fees", description: "Transparent pricing for property management services. No hidden markups. Choose from our flexible management plans." },
  faq: { title: "FAQ | Frequently Asked Questions", description: "Answers to common questions about our property management services, booking process, and what to expect." },
  contact: { title: "Contact Us | Christiano Property Management", description: "Get in touch with Christiano Property Management. We would love to hear from property owners and guests alike." },
  testimonials: { title: "Testimonials | What Our Guests Say", description: "Read genuine testimonials from guests who have stayed at our managed properties across Malta and Gozo." },
  dashboard: { title: "Dashboard | Booking Management", description: "Manage your bookings, view property performance, and access your account dashboard." },
};

// ─── Admin Authentication ───────────────────────────────────────────────────────
export const ADMIN_AUTH = {
  storageKey: "cpm-admin-auth",
  timeKey: "cpm-admin-time",
  sessionDurationMs: 24 * 60 * 60 * 1000, // 24 hours
  demoPassword: "cpm-admin-2024",
} as const;

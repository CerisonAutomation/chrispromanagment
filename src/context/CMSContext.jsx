import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Complete default CMS content - matches original website exactly
const DEFAULT_CMS = {
  brand: {
    name: "Christiano Property Management",
    tagline: "Dedicated to Maximizing Your Property's Potential",
    logoGold: "https://customer-assets.emergentagent.com/job_malta-stays-direct/artifacts/ta7za4jp_cv_logo_no_bg_gold.png",
    logoWhite: "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/image-high-82icb0.png",
    favicon: "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/9f5bb789-c9cd-4da2-9672-7071482f7efb-high.png",
  },
  hero: {
    headline: "Your Home in Malta, Looked After Like a Hotel",
    subheadline: "Handpicked luxury accommodations across Malta's most sought-after locations. Experience exceptional stays with personal attention.",
    ctaPrimary: { text: "Book Your Stay", href: "/properties" },
    ctaSecondary: { text: "List Your Property", action: "openOwnerModal" },
    backgroundImage: "https://images.unsplash.com/photo-1771218830084-fdd272e149a1?w=1920&q=80",
  },
  navigation: {
    primary: [
      { label: "For Owners", href: "/property-owners", icon: "Building" },
      { label: "Book a Stay", href: "/properties", icon: "Home" },
    ],
  },
  about: {
    subtitle: "About Us",
    title: "We Know What a Good Stay Feels Like",
    paragraphs: [
      "At Christiano Property Management, we specialize in managing properties across Malta, one of the Mediterranean's most sought-after destinations. From cozy apartments to luxurious villas and palazzos, we offer tailored management solutions that maximize both guest satisfaction and property performance.",
      "With over 9 years of hosting experience in Malta, we understand the unique appeal of the island and how to make your property stand out in this competitive market. Our team takes care of everything, from dynamic pricing strategies and 24/7 guest communication to professional cleaning and regular maintenance.",
      "We believe in transparency and provide detailed monthly reports so property owners are always in the loop. Whether you're a seasoned host or new to the vacation rental market, our goal is to make property management hassle-free while optimizing your property's potential."
    ],
    image: "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_7990-standard.jpg",
    cta: { text: "Get in Touch", action: "openContactModal" },
  },
  features: [
    { icon: "Star", title: "Personally Curated", description: "Every property handpicked and personally inspected to meet our standards." },
    { icon: "Shield", title: "Always Available", description: "24/7 support throughout your stay. Real people, real solutions." },
    { icon: "Clock", title: "Flexible Service", description: "Early arrivals, late checkouts, and personalized arrangements on request." },
  ],
  pricing: {
    headline: "One fee. No surprises.",
    description: "A single commission on net room revenue. All new properties launch with Superhost credibility from day one.",
    plans: [
      {
        name: "Essentials",
        subtitle: "Core operations. Your property listed, managed, and maintained.",
        rate: "15%",
        rateNote: "of Net Room Revenue + VAT",
        features: {
          listing: [
            "Multi-channel listing creation & management",
            "Superhost status from day one",
            "Smart seasonal pricing optimization",
            "Reviews & reputation management"
          ],
          operations: [
            "Guest communication & 24/7 concierge",
            "Check-in & check-out coordination",
            "Professional cleaning & laundry",
            "Maintenance coordination — at cost",
            "Payment collection & eco-tax compliance"
          ]
        },
        fees: {
          reporting: "€35 per monthly report",
          callout: "€20 + VAT per incident"
        }
      },
      {
        name: "Complete",
        subtitle: "Full-service management. The guest experience that drives better returns.",
        rate: "18%",
        rateNote: "of Net Room Revenue + VAT",
        popular: true,
        features: {
          extras: [
            "Welcome amenities — wine, coffee, toiletries included",
            "Guest property manual included",
            "Property assessment & readiness checklist"
          ],
          included: [
            "Monthly reporting included — saves €420/year",
            "All callout fees included — saves €240+/year",
            "Annual photography refresh included — saves ~€300/year",
            "€100 annual platform fee waived"
          ],
          strategic: [
            "Quarterly performance reviews & optimization",
            "Priority 24-hour owner response time",
            "Dedicated direct booking webpage"
          ]
        }
      }
    ],
    addOns: [
      { name: "Professional photoshoot", price: "On quotation" },
      { name: "Annual deep clean", price: "On quotation" },
      { name: "MTA licensing", price: "€150 one-time + fees" },
      { name: "Setup works", price: "€25/hr + VAT" },
      { name: "Mail & bills handling", price: "€10/month (free in Complete)" },
      { name: "Interior design", price: "On quotation" }
    ],
    note: "Net Room Revenue is calculated on gross rental income, excluding platform commissions, VAT, cleaning fees, damage deposits, and optional extras."
  },
  ecoTax: {
    current: {
      rate: 0.50,
      currency: "EUR",
      perUnit: "per person per night",
      cap: 5.00,
      capNote: "after 10 nights continuous stay"
    },
    upcoming: {
      rate: 1.50,
      effectiveDate: "2026-01-01",
      note: "Rate tripling to €1.50 per person per night in 2026"
    },
    exempt: "Children under 18",
    description: "Malta's Environmental Contribution (Eco-Tax) is collected separately from room rates and shown as a VAT-exempt item."
  },
  propertyOwners: {
    hero: {
      subtitle: "For Property Owners",
      title: "Maximize Your Property's Full Potential",
      description: "With over 9 years of Superhost experience and a background in international luxury hotel management, we specialize in making your property stand out in Malta's competitive market.",
      ctaPrimary: { text: "List Your Property", action: "openOwnerModal" },
      ctaSecondary: { text: "Schedule a Call", action: "openContactModal" },
    },
    whyChooseUs: {
      title: "Why Choose Us?",
      items: [
        { title: "Tailored Property Management", description: "We understand that each property is unique. Our management solutions are fully customizable to meet your specific needs—whether it's guest communication, handling bookings, or detailed upkeep." },
        { title: "Expertise You Can Trust", description: "With a rich background in international luxury hotel management and personal experience as property owners, we know what it takes to go above and beyond. Our team thrives on delivering high-quality experiences for your guests." },
        { title: "Selective Portfolio", description: "We intentionally manage a limited number of properties to provide each client with the highest level of attention and service. Our goal is to be the best, not the biggest." },
        { title: "Comprehensive Services", description: "From dynamic pricing strategies and 24/7 guest communication to professional cleaning and secure payment collection, we handle every aspect of property management." },
      ]
    },
    services: {
      title: "What We Offer",
      subtitle: "What Can You Expect When You Partner with Christiano Property Management",
      included: [
        "Property Assessment - A thorough evaluation to highlight your property's strengths",
        "Property Essentials Checklist - Ensuring all must-haves are in place for guest satisfaction",
        "Copywriting to Make Your Property Stand Out - Captivating descriptions to attract more bookings",
        "Smart Dynamic Pricing to maximize occupancy and returns",
        "Guest Communication before, during, and after stays",
        "Digital and Physical Property Manuals - Easy access to essential information for guests",
        "Secure Payment Collection and Eco-Tax Management",
        "Complete Guest Stay Fulfillment including 24/7 concierge service",
        "Transfers for Guests - Convenient transport arrangements",
        "Professional Cleaning Services after every guest",
        "Laundry and Ironing Services - Fresh linens after every stay",
        "Reviews and Reputation Management",
        "Regular Maintenance and Upkeep",
        "Detailed Monthly Performance Reports - Transparency with data on bookings, earnings, and feedback",
        "Replenishing Consumables at Cost - Restocking essentials without markup",
      ],
      extras: [
        "Home Makeover from A-Z",
        "Furniture Construction",
        "Professional Photoshoot",
        "Inventory Management",
        "Property Registration with MTA",
        "Welcome Amenities Provided for Your Guests",
      ]
    },
    faqs: [
      { q: "What types of properties do you manage?", a: "We manage a wide range of properties, from apartments to villas and palazzos. Whether it's a cozy flat or a luxurious estate, we offer tailored management solutions to fit your needs." },
      { q: "How do you handle guest communication?", a: "We provide 24/7 guest support, ensuring that all guest inquiries, from check-in to check-out, are promptly addressed. Our team manages everything from pre-arrival communication to any issues that may arise during the stay." },
      { q: "What is included in your property management services?", a: "Our comprehensive services include guest communication, listing optimization, professional photography, cleaning coordination, maintenance, and monthly performance reports. We ensure that your property is always well-maintained and your guests are well-cared for." },
      { q: "How do you ensure my property stays in top condition?", a: "We conduct regular maintenance checks and work with trusted professionals for any required repairs or upkeep. We also maintain close contact with cleaning teams to ensure the property is spotless for every guest." },
      { q: "How do you set the rental price for my property?", a: "We use dynamic pricing strategies based on market demand, seasonality, and your property's unique features. This ensures your property is competitively priced while maximizing revenue potential." },
      { q: "How often will I receive updates on my property?", a: "We provide monthly performance reports, detailing occupancy rates, guest reviews, and revenue generated. We value transparency, and you'll have full access to the details of your property's performance." },
      { q: "Do you handle the cleaning and turnover between guests?", a: "Yes, we manage all cleaning services between stays to ensure your property is always guest-ready. We coordinate with professional cleaning companies and conduct post-cleaning inspections to maintain high standards." },
      { q: "What are your fees for property management?", a: "We offer two plans: Essentials at 15% and Complete at 18% of Net Room Revenue. The Complete plan includes additional services like monthly reporting, callout fees, and annual photography refresh at no extra charge." },
      { q: "How do you market my property?", a: "We optimize your property listing on platforms like Airbnb, using professional photos and detailed descriptions. Our Superhost status, with over 9 years of hosting experience, also gives us an edge in marketing to a wide audience of travelers." },
      { q: "How do I get started with your property management services?", a: "It's simple! Contact us through our website or send us an inquiry. We'll schedule a consultation to discuss your property, and from there, we'll guide you through the onboarding process." },
    ],
    stats: [
      { value: "9+", label: "Years Superhost" },
      { value: "100%", label: "Response Rate" },
      { value: "4.9", label: "Average Rating" },
    ],
  },
  portfolio: {
    properties: [
      { name: "De Gregor", location: "Pembroke", image: "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/pembroke-pent-20250427__mg_5998-edit-edit-high.jpg" },
      { name: "Xambekk Place", location: "Bahar ic-Caghaq", beds: 3, baths: 3, sleeps: 6, image: "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_9620-high.jpg" },
      { location: "Valletta", beds: 2, baths: 2, sleeps: 6, image: "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_2625-high-g3dssk.jpg" },
      { location: "Valletta", beds: 2, baths: 2, sleeps: 4, image: "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/valletta-apartment-10-high-1r9pym.jpg" },
      { location: "Valletta", beds: 1, baths: 2, sleeps: 4, image: "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_7136-high.jpg" },
      { location: "Madliena", type: "Event Space", image: "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/65259-1-high-3hwctx.jpg" },
      { location: "Pieta", beds: 2, baths: 2, sleeps: 4, image: "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_6106-high.jpg" },
      { location: "Gzira", beds: 2, baths: 2, sleeps: 4, image: "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_3886-high-vowc5f.jpg" },
      { location: "Swieqi", beds: 3, baths: 2, sleeps: 6, image: "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_0557-high.jpg" },
    ]
  },
  testimonials: [
    { name: "Katie", date: "October 2024", rating: 5, text: "Christiano was an amazing host and the apartment was flawless. From the slippers to the birthday wine for my husband, everything was spot on. The location and apartment were perfect, and we were very happy! I highly recommend staying here!" },
    { name: "Eric", date: "October 2024", rating: 5, text: "Christiano is a gracious, proactive host who made sure I had all the information I needed. The apartment had everything we needed, and Christiano's communication was excellent. I couldn't have been happier!" },
    { name: "Sheldon", date: "September 2024", rating: 5, text: "Christiano was always on hand to help with any queries and was extremely responsive. I'd definitely recommend it to anyone looking to stay somewhere central, walkable, and clean!" },
    { name: "Anna", date: "September 2024", rating: 5, text: "The host is nice and helpful! The apartment is modern, clean, cozy, and fully equipped. Perfect location, close to the beach and Valletta. A lovely experience with everything we needed!" },
    { name: "Mikayla", date: "August 2024", rating: 5, text: "Christiano was the best! Very responsive and helpful. The apartment was clean, and the AC was a huge plus. I definitely recommend this place to anyone visiting during the summer!" },
    { name: "Miranda", date: "August 2024", rating: 5, text: "We loved the apartment—spacious, clean, and felt like home. Perfect size for our family of four. Ideally located for seeing Valletta. My daughter wanted to move in forever!" },
    { name: "Molly", date: "August 2024", rating: 5, text: "Lovely apartment in a great central location. Spacious bedroom, kitchen, and living space with appreciated AC. Check-in information was prompt and detailed, enhancing our stay in Malta. Overall, a fantastic apartment!" },
    { name: "David & Pennie", date: "April 2024", rating: 5, text: "Christiano was a good, responsive host and the apartment was perfect for two couples. It was very clean and had all the mod cons you would expect. I would return and recommend to future travelers." },
    { name: "Raquel", date: "March 2024", rating: 5, text: "The Host is very attentive and always available. We had a great time with the family, and the apartment was very nice and spacious for families." },
    { name: "Kate", date: "April 2024", rating: 5, text: "Christiano is extremely personable and relaxed, and supremely helpful. We'll be back if we can. The flat was bigger than it looks, extremely well equipped, and full of thoughtful touches like the washable slippers and marshmallows!" },
  ],
  contact: {
    phone: "+356 7979 0202",
    email: "info@christianopropertymanagement.com",
    whatsapp: "35679790202",
    address: "The Fives A7, Triq Charles Sciberras, St Julian's, Malta",
    coordinates: { lat: 35.9180, lng: 14.4890 },
    officeHours: "Monday - Sunday: 9:00 AM - 9:00 PM",
  },
  footer: {
    guestLinks: [
      { label: "Browse Properties", href: "/properties" },
      { label: "Booking Inquiries", action: "openContactModal", subject: "Booking Inquiry" },
      { label: "Special Requests", action: "openContactModal", subject: "Special Request" },
    ],
    ownerLinks: [
      { label: "Our Services", href: "/property-owners" },
      { label: "Pricing Plans", href: "/property-owners#pricing" },
      { label: "List Your Property", action: "openOwnerModal" },
      { label: "Management Inquiry", action: "openContactModal", subject: "Property Management Inquiry" },
    ],
    social: {
      instagram: "https://instagram.com/christianopropertymanagement",
      facebook: "https://facebook.com/christianopropertymanagement",
    },
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
  theme: {
    colors: {
      gold: "#D4AF37",
      goldHover: "#E5C158",
      bgDark: "#0F0F10",
      bgCard: "#161618",
      bgAlt: "#0A0A0B",
      textPrimary: "#F5F5F0",
      textSecondary: "#A1A1AA",
      border: "#27272A",
    },
    fonts: {
      heading: "'Playfair Display', serif",
      body: "'Manrope', sans-serif",
    },
    borderRadius: "0",
  },
  seo: {
    title: "Christiano Property Management | Luxury Malta Accommodations",
    description: "Luxury short-term rental and property management across Malta. Transparent fees, no hidden markups, full-service operations for discerning property owners.",
    keywords: "Malta accommodation, luxury rental Malta, property management Malta, Airbnb Malta, vacation rental Malta, short-term rental Malta",
  },
};

const CMSContext = createContext(null);

import { supabase } from "@/integrations/supabase/client";

export const CMSProvider = ({ children }) => {
  const [cms, setCms] = useState(DEFAULT_CMS);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [roles, setRoles] = useState([]);

  const isAdmin = roles.includes("admin");
  const isEditor = isAdmin || roles.includes("editor");

  useEffect(() => {
    loadCMS();

    // Auth state — sync listener first, then initial fetch
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      setSession(sess);
      if (sess?.user) {
        setTimeout(() => loadRoles(sess.user.id), 0);
      } else {
        setRoles([]);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) loadRoles(data.session.user.id);
    });

    // Real-time mirror
    const channel = supabase
      .channel("cms-mirror")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cms_content" },
        () => loadCMS()
      )
      .subscribe();

    return () => {
      sub.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRoles = async (userId) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (!error) setRoles((data || []).map((r) => r.role));
  };

  const loadCMS = async () => {
    try {
      const { data, error } = await supabase
        .from("cms_content")
        .select("section_key, content")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) {
        const merged = { ...DEFAULT_CMS };
        data.forEach((row) => {
          merged[row.section_key] = deepMerge(
            DEFAULT_CMS[row.section_key] || {},
            row.content || {}
          );
        });
        setCms(merged);
      }
    } catch (error) {
      console.log("[CMS] using defaults:", error?.message || error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSection = useCallback(async (section, data) => {
    try {
      const { error } = await supabase.from("cms_content").upsert(
        {
          section_key: section,
          section_label: section,
          content: data,
        },
        { onConflict: "section_key" }
      );
      if (error) throw error;
      setCms((prev) => ({ ...prev, [section]: data }));
      return true;
    } catch (error) {
      console.error("CMS update failed:", error);
      return false;
    }
  }, []);

  // Deprecated — kept for back-compat. Real auth happens via /auth page.
  const verifyAdmin = useCallback(async () => false, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setRoles([]);
  }, []);

  return (
    <CMSContext.Provider
      value={{
        cms,
        isLoading,
        session,
        user: session?.user ?? null,
        roles,
        isAdmin,
        isEditor,
        adminKey: "", // legacy
        updateSection,
        verifyAdmin,
        logout,
        refresh: loadCMS,
      }}
    >
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) throw new Error("useCMS must be used within CMSProvider");
  return context;
};

// Deep merge helper
function deepMerge(target, source) {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

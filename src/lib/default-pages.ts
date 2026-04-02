import type { BlockData } from "@/lib/block-types";
import { LOGO_URL, HERO_BG, ABOUT_IMG, PROP_IMAGES } from "@/lib/images";
import { COPYRIGHT, CONTACT } from "@/lib/constants";

// ============================================================
// DETERMINISTIC ID GENERATOR
// ============================================================
// Use a counter + prefix to create stable, reproducible IDs.
// This is CRITICAL — if IDs change on every import, Puck treats
// blocks as new components, causing the "only footers" bug.
let _idCounter = 0;
function sid(prefix: string): string {
  return `${prefix}-${++_idCounter}`;
}

// ============================================================
// SHARED BLOCK DATA
// ============================================================
const FOOTER_BLOCK = {
  type: "FooterSection",
  props: {
    id: sid("footer"),
    logoUrl: LOGO_URL,
    copyright: COPYRIGHT,
    email: CONTACT.email,
    phone: CONTACT.phone,
  },
};

const TESTIMONIALS = [
  { name: "Katie", date: "October 2024", rating: "5", quote: "Christiano was an amazing host and the apartment was flawless. Every detail was thoughtfully considered, from the welcome hamper to the spotless cleanliness. The location in Valletta was perfect for exploring Malta. We couldn't have asked for a better stay and will definitely be back!" },
  { name: "John", date: "September 2024", rating: "5", quote: "I couldn't have asked for a better property management team. Communication was excellent from the moment I booked. The check-in process was seamless, and the apartment exceeded all expectations. The attention to detail really sets Christiano apart from other rental experiences in Malta." },
  { name: "Sarah & Mark", date: "August 2024", rating: "5", quote: "The attention to detail was remarkable. From the beautifully appointed apartment to the comprehensive local guide, everything was perfect. Christiano's responsiveness and genuine care for our experience made this feel like a true five-star hospitality experience. Highly recommended for anyone visiting Malta." },
  { name: "Eric", date: "October 2024", rating: "5", quote: "Exceptional service from start to finish. The property was immaculate, well-equipped, and perfectly located. What impressed me most was the level of professionalism and care — it felt like staying at a luxury hotel but with the comfort and privacy of a home. Will definitely return." },
];

const STATS = [
  { value: "9+", label: "Years Experience", icon: "calendar" },
  { value: "50+", label: "Properties Managed", icon: "building" },
  { value: "1000+", label: "Happy Guests", icon: "users" },
  { value: "4.9", label: "Average Rating", icon: "star" },
];

const PROPERTY_GRID = [
  { name: "Valletta Apartment 1", imageUrl: PROP_VALLETTA, caption: "2 Bed · 2 Bath · Sleeps 6" },
  { name: "Valletta Apartment 2", imageUrl: PROP_1, caption: "2 Bed · 2 Bath · Sleeps 4" },
  { name: "Bahar ic-Caghaq Villa", imageUrl: PROP_2, caption: "3 Bed · 3 Bath · Sleeps 6" },
  { name: "Madliena Event Space", imageUrl: PROP_MADLIENA, caption: "Unique Event Venue" },
  { name: "Pieta Apartment", imageUrl: PROP_3, caption: "2 Bed · 2 Bath · Sleeps 4" },
  { name: "Gzira Apartment", imageUrl: PROP_GZIRA, caption: "2 Bed · 2 Bath · Sleeps 4" },
];

const WHY_ITEMS = [
  { title: "Tailored Property Management", description: "Every property is unique. We create custom management strategies that maximise your rental income while preserving the character and condition of your property.", icon: "settings" },
  { title: "Expertise You Can Trust", description: "Our founder's background in international luxury hotel management means your property is managed to the highest hospitality standards. 9 years of Superhost status speaks for itself.", icon: "award" },
  { title: "Selective Portfolio", description: "We deliberately limit the number of properties we manage. This means each property receives our full attention, the highest quality of service, and personal dedication.", icon: "gem" },
  { title: "Comprehensive Services", description: "From dynamic pricing and 24/7 guest communication to professional cleaning and detailed monthly reports — we handle everything so you don't have to.", icon: "check-circle" },
];

const SERVICES = [
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
];

const EXTRAS = [
  { name: "Professional Photoshoot", price: "On request" },
  { name: "Deep Clean & Preparation", price: "On request" },
  { name: "MTA Licensing Assistance", price: "€350" },
  { name: "Procurement & Styling", price: "€25/hr" },
  { name: "Mail Handling Service", price: "€10/month" },
  { name: "Interior Design Consultation", price: "On request" },
];

const FAQ_ITEMS = [
  { question: "What types of properties do you manage?", answer: "We manage a diverse portfolio of luxury short-term rental properties across Malta, including apartments in Valletta, villas in Bahar ic-Caghaq, and unique event spaces in Madliena. We focus on properties that meet our high standards of quality and guest experience." },
  { question: "How do you handle guest communication?", answer: "We provide 24/7 guest communication across all major booking platforms. From initial enquiry to post-stay follow-up, our team handles everything professionally and promptly. We respond within minutes, not hours." },
  { question: "What is included in your property management services?", answer: "Our services include multi-channel listing management, dynamic pricing, guest communication, check-in/out coordination, professional cleaning, maintenance, payment processing, reviews management, and monthly performance reports." },
  { question: "How do you ensure my property stays in top condition?", answer: "We conduct thorough property assessments, coordinate regular maintenance, perform professional cleaning between stays, and handle any issues immediately. Our quarterly property reviews ensure everything stays in excellent condition." },
  { question: "How do you set the rental price?", answer: "We use advanced dynamic pricing strategies that consider seasonal demand, local events, competitor analysis, and historical data. This maximises your occupancy rate and revenue while remaining competitive in the market." },
  { question: "What are the biggest worries property owners have?", answer: "The most common concerns are property damage, unreliable guests, and the time commitment required. We address all of these through comprehensive insurance coordination, strict guest vetting, 24/7 support, and a damage deposit system." },
  { question: "How often will I receive updates?", answer: "Essentials plan owners receive monthly performance reports. Complete plan owners get monthly reports plus quarterly in-depth property reviews. You'll also have access to an owner dashboard for real-time insights." },
  { question: "Do you handle cleaning and turnover?", answer: "Absolutely. Professional cleaning and linen service is included in all our plans. We ensure every guest arrives to a spotless, well-prepared property with fresh linens, replenished consumables, and a welcoming atmosphere." },
  { question: "What are your fees?", answer: "Our Essentials plan is 15% of net room revenue, and our Complete plan is 18%. There are no hidden fees or markups. All pricing is transparent and aligned with your success." },
  { question: "How do you market my property?", answer: "We list your property across multiple platforms including Airbnb, Booking.com, VRBO, and more. Combined with professional photography, compelling copywriting, and SEO optimisation, we maximise your property's visibility." },
  { question: "How do I get started?", answer: "Simply contact us for a free property assessment. We'll visit your property, discuss your goals, and provide a personalised management proposal. The onboarding process is smooth and we handle all the setup." },
  { question: "What makes your service special?", answer: "Our international luxury hotel management background, 9 years of Superhost experience, selective portfolio approach, and genuine passion for hospitality set us apart. We treat every property as if it were our own and every guest as a VIP visitor to our home." },
];

// ============================================================
// SHARED NEW BLOCK DATA
// ============================================================

const TEAM_MEMBERS = [
  {
    name: "Christiano",
    role: "Founder & CEO",
    bio: "Former international luxury hotel manager with 9+ years of Superhost experience. Passionate about delivering five-star hospitality to every guest.",
    imageUrl: "",
  },
  {
    name: "Maria",
    role: "Operations Manager",
    bio: "Expert in property operations and guest experience. Ensures every property meets the highest standards of cleanliness and presentation.",
    imageUrl: "",
  },
  {
    name: "Luke",
    role: "Guest Relations",
    bio: "Dedicated to creating memorable experiences for our guests. Available 24/7 to assist with anything they need.",
    imageUrl: "",
  },
];

const SOCIAL_PROOF_ITEMS = [
  { number: "9", label: "Years Experience", prefix: "", suffix: "+" },
  { number: "50", label: "Properties Managed", prefix: "", suffix: "+" },
  { number: "1000", label: "Happy Guests", prefix: "", suffix: "+" },
  { number: "4.9", label: "Average Rating", prefix: "", suffix: "" },
  { number: "98", label: "Satisfaction Rate", prefix: "", suffix: "%" },
  { number: "24", label: "Support Available", prefix: "", suffix: "/7" },
];

const COMPARISON_COLUMNS = [
  {
    heading: "Self-Managed",
    description: "Handle everything yourself — full control but full responsibility.",
    highlighted: false,
    features: [
      { name: "Listing management", included: false },
      { name: "Dynamic pricing", included: false },
      { name: "Guest communication", included: false },
      { name: "Professional cleaning", included: false },
      { name: "Maintenance coordination", included: false },
      { name: "Monthly reports", included: false },
      { name: "Quarterly reviews", included: false },
      { name: "Welcome amenities", included: false },
      { name: "Owner dashboard", included: false },
      { name: "Priority support", included: false },
      { name: "Direct booking page", included: false },
    ],
  },
  {
    heading: "Essentials (15%)",
    description: "Core management services to get your property listed and booked.",
    highlighted: false,
    features: [
      { name: "Listing management", included: true },
      { name: "Dynamic pricing", included: true },
      { name: "Guest communication", included: true },
      { name: "Professional cleaning", included: true },
      { name: "Maintenance coordination", included: true },
      { name: "Monthly reports", included: true },
      { name: "Quarterly reviews", included: false },
      { name: "Welcome amenities", included: false },
      { name: "Owner dashboard", included: false },
      { name: "Priority support", included: false },
      { name: "Direct booking page", included: false },
    ],
  },
  {
    heading: "Complete (18%)",
    description: "The full luxury experience — everything managed to five-star standards.",
    highlighted: true,
    features: [
      { name: "Listing management", included: true },
      { name: "Dynamic pricing", included: true },
      { name: "Guest communication", included: true },
      { name: "Professional cleaning", included: true },
      { name: "Maintenance coordination", included: true },
      { name: "Monthly reports", included: true },
      { name: "Quarterly reviews", included: true },
      { name: "Welcome amenities", included: true },
      { name: "Owner dashboard", included: true },
      { name: "Priority support", included: true },
      { name: "Direct booking page", included: true },
    ],
  },
];

// ============================================================
// PAGE DATA — ALL with DETERMINISTIC IDs
// ============================================================

export const homePageData: BlockData = {
  content: [
    {
      type: "HeroSection",
      props: {
        id: sid("hero-home"),
        title: "Dedicated to Maximizing Your Property's Potential",
        subtitle: "9 years of Superhost experience managing luxury short-term rentals across Malta. International luxury hotel management background. Transparent fees, no hidden markups.",
        backgroundImage: HERO_BG,
        ctaText: "Learn More",
        ctaLink: "#about",
      },
    },
    {
      type: "AboutSection",
      props: {
        id: sid("about-home"),
        title: "About Christiano Property Management",
        description: "Christiano Property Management is a luxury short-term rental management company operating across Malta. With over 9 years of Superhost experience on Airbnb and a background in international luxury hotel management, we bring a five-star standard to every property we manage.\n\nWe believe in transparent, honest partnerships with property owners. Our selective approach means we work with a limited portfolio, ensuring each property receives our undivided attention and the highest level of service.\n\nFrom dynamic pricing strategies and 24/7 guest communication to meticulous cleaning and monthly performance reports, we handle every aspect of your short-term rental so you can enjoy passive income without the hassle.",
        imageUrl: ABOUT_IMG,
      },
    },
    {
      type: "WhyChooseUs",
      props: { id: sid("why-home"), title: "Why Choose Us?", items: WHY_ITEMS },
    },
    {
      type: "ImageWithText",
      props: {
        id: sid("iwt-home"),
        title: "The Malta Advantage",
        description: "Malta's short-term rental market is one of Europe's fastest-growing, driven by year-round tourism, a thriving digital nomad community, and world-class events. With over 300 days of sunshine, UNESCO World Heritage sites, and a strategic Mediterranean location, demand for quality accommodation consistently outpaces supply.\n\nChristiano Property Management leverages this unique market position with dynamic pricing algorithms, multi-platform distribution, and deep local expertise to ensure your property achieves maximum occupancy and revenue — regardless of the season.",
        imageUrl: PROP_VALLETTA,
        layout: "image-right",
        buttonText: "View Our Properties",
        buttonLink: "#properties",
        badge: "Why Malta?",
      },
    },
    {
      type: "ServicesSection",
      props: {
        id: sid("svc-home"),
        title: "What We Offer",
        services: SERVICES,
        extras: EXTRAS,
        ctaText: "View Our Pricing Plans",
        ctaLink: "#pricing",
      },
    },
    {
      type: "StatsSection",
      props: { id: sid("stats-home"), stats: STATS },
    },
    {
      type: "PropertyShowcase",
      props: { id: sid("props-home"), title: "Discover Our Diverse Property Portfolio", properties: PROPERTY_GRID },
    },
    {
      type: "SocialProofStrip",
      props: {
        id: sid("proof-home"),
        items: SOCIAL_PROOF_ITEMS,
      },
    },
    {
      type: "TestimonialSection",
      props: { id: sid("test-home"), title: "What Our Guests Say", testimonials: TESTIMONIALS },
    },
    {
      type: "CtaBanner",
      props: {
        id: sid("cta-home"),
        heading: "Partner with Confidence",
        description: "Join the growing number of property owners who trust Christiano Property Management to maximise their rental income while preserving their property's value and character.",
        buttonText: "Contact Us Today",
        buttonLink: "#contact",
      },
    },
    {
      type: "NewsletterSection",
      props: {
        id: sid("nl-home"),
        heading: "Stay Updated",
        description: "Subscribe to receive exclusive offers, property updates, and Malta travel tips",
        buttonText: "Subscribe",
        successMessage: "Welcome aboard! Check your inbox for a confirmation.",
      },
    },
    FOOTER_BLOCK,
  ],
  root: { props: { title: "Home" } },
};

export const aboutPageData: BlockData = {
  content: [
    {
      type: "HeroSection",
      props: {
        id: sid("hero-about"),
        title: "Our Story",
        subtitle: "A decade of excellence in luxury property management across the beautiful islands of Malta.",
        backgroundImage: HERO_BG,
        ctaText: "View Our Properties",
        ctaLink: "#properties",
      },
    },
    {
      type: "AboutSection",
      props: {
        id: sid("about-about"),
        title: "About Christiano Property Management",
        description: "Christiano Property Management was founded with a singular vision: to bring the unparalleled standards of international luxury hospitality to the short-term rental market in Malta.\n\nOur founder's extensive background in luxury hotel management across Europe and the Middle East provides the foundation for everything we do. Combined with 9 consecutive years of achieving Superhost status on Airbnb, we offer a level of service that few can match.\n\nWe are not a volume-based operation. By deliberately limiting our portfolio, we ensure every property owner receives personal attention, every guest enjoys a five-star experience, and every property is maintained to the highest standards.\n\nOur approach is built on transparency, trust, and a genuine passion for hospitality. We treat every property as if it were our own and every guest as a VIP visitor to our home.",
        imageUrl: ABOUT_IMG,
      },
    },
    {
      type: "TeamSection",
      props: {
        id: sid("team-about"),
        title: "Meet the Team",
        subtitle: "The dedicated professionals behind every five-star guest experience.",
        members: TEAM_MEMBERS,
      },
    },
    {
      type: "ImageWithText",
      props: {
        id: sid("iwt-about"),
        title: "Our Island Home",
        description: "Malta isn't just where we work — it's our home. Every member of the Christiano team lives and breathes the Maltese lifestyle, and that deep local knowledge translates directly into better experiences for our guests and better results for our property owners.\n\nFrom the hidden gems of Valletta's side streets to the best local restaurants in Mdina, from the perfect swimming coves along the Blue Grotto to the vibrant nightlife of St. Julian's — we share insider knowledge that no guidebook can offer. It's this authentic connection to the island that turns a great holiday into an unforgettable one.",
        imageUrl: PROP_3,
        layout: "image-left",
        buttonText: "",
        buttonLink: "",
        badge: "",
      },
    },
    {
      type: "StatsSection",
      props: { id: sid("stats-about"), stats: STATS },
    },
    {
      type: "CtaBanner",
      props: {
        id: sid("cta-about"),
        heading: "Ready to Work With Us?",
        description: "Discover how Christiano Property Management can maximise your property's potential. Get in touch for a free, no-obligation property assessment.",
        buttonText: "Get in Touch",
        buttonLink: "#contact",
      },
    },
    FOOTER_BLOCK,
  ],
  root: { props: { title: "About Us" } },
};

export const propertiesPageData: BlockData = {
  content: [
    {
      type: "HeroSection",
      props: {
        id: sid("hero-props"),
        title: "Our Property Portfolio",
        subtitle: "Discover our handpicked selection of luxury properties across Malta, each maintained to the highest standards.",
        backgroundImage: PROP_VALLETTA,
        ctaText: "Book Direct & Save",
        ctaLink: "#book",
      },
    },
    {
      type: "SocialProofStrip",
      props: {
        id: sid("proof-props"),
        items: [
          { number: "50", label: "Premium Properties", prefix: "", suffix: "+" },
          { number: "6", label: "Malta Locations", prefix: "", suffix: "" },
          { number: "4.9", label: "Guest Rating", prefix: "", suffix: "" },
          { number: "98", label: "Re-booking Rate", prefix: "", suffix: "%" },
        ],
      },
    },
    {
      type: "PropertyShowcase",
      props: { id: sid("grid-props"), title: "Discover Our Diverse Property Portfolio", properties: PROPERTY_GRID },
    },
    {
      type: "VideoSection",
      props: {
        id: sid("vid-props"),
        title: "Experience Malta Like a Local",
        description: "Take a virtual tour of our handpicked properties across Malta's most desirable locations. From the historic streets of Valletta to the stunning coastline of Bahar ic-Caghaq, discover the spaces that make every stay unforgettable.",
        videoUrl: "",
        thumbnailUrl: PROP_VALLETTA,
        aspectRatio: "16:9",
      },
    },
    {
      type: "CtaBanner",
      props: {
        id: sid("cta-props"),
        heading: "Interested in a Property?",
        description: "Book directly with us for the best rates and personal service. No hidden fees, no surprises.",
        buttonText: "Book Direct",
        buttonLink: "#book",
      },
    },
    FOOTER_BLOCK,
  ],
  root: { props: { title: "Properties" } },
};

export const bookPageData: BlockData = {
  content: [
    {
      type: "GuestyPropertySearch",
      props: {
        id: sid("search-book"),
        title: "Find Your Perfect Stay",
        subtitle: "Search our curated collection of luxury properties across Malta",
        buttonText: "Search Properties",
      },
    },
    {
      type: "GuestyPropertyGrid",
      props: {
        id: sid("grid-book"),
        title: "Available Properties",
        itemsPerPage: "6",
        showFilters: "true",
      },
    },
    {
      type: "GuestyPropertyDetail",
      props: {
        id: sid("detail-book"),
        defaultSlug: "valletta-apartment-1",
      },
    },
    {
      type: "GuestyBookingWidget",
      props: {
        id: sid("book-widget"),
        defaultSlug: "valletta-apartment-1",
        title: "Complete Your Booking",
      },
    },
    {
      type: "GuestyBookingConfirmation",
      props: {
        id: sid("confirm-book"),
        title: "Booking Confirmed!",
        subtitle: "Your reservation has been successfully placed. Check your email for confirmation details.",
      },
    },
    FOOTER_BLOCK,
  ],
  root: { props: { title: "Book Direct" } },
};

export const pricingPageData: BlockData = {
  content: [
    {
      type: "HeroSection",
      props: {
        id: sid("hero-price"),
        title: "Transparent Pricing",
        subtitle: "Simple, transparent pricing aligned with your success. No hidden fees, no markups — we only earn when you earn.",
        backgroundImage: PROP_2,
        ctaText: "Get Started",
        ctaLink: "#pricing",
      },
    },
    {
      type: "PricingTable",
      props: {
        id: sid("table-price"),
        heading: "Transparent Pricing, Maximum Value",
      },
    },
    {
      type: "ComparisonSection",
      props: {
        id: sid("comp-price"),
        title: "Plan Comparison",
        columns: COMPARISON_COLUMNS,
      },
    },
    {
      type: "CtaBanner",
      props: {
        id: sid("cta-price"),
        heading: "Ready to Maximise Your Rental Income?",
        description: "Contact us for a free property assessment and personalised management proposal.",
        buttonText: "Contact Us",
        buttonLink: "#contact",
      },
    },
    FOOTER_BLOCK,
  ],
  root: { props: { title: "Pricing Plans" } },
};

export const faqPageData: BlockData = {
  content: [
    {
      type: "HeroSection",
      props: {
        id: sid("hero-faq"),
        title: "Frequently Asked Questions",
        subtitle: "Find answers to common questions about our property management services.",
        backgroundImage: PROP_3,
        ctaText: "Contact Us",
        ctaLink: "#contact",
      },
    },
    {
      type: "FaqSection",
      props: { id: sid("faq-items"), title: "Your Questions, Answered", items: FAQ_ITEMS },
    },
    {
      type: "SocialProofStrip",
      props: {
        id: sid("proof-faq"),
        items: SOCIAL_PROOF_ITEMS,
      },
    },
    {
      type: "CtaBanner",
      props: {
        id: sid("cta-faq"),
        heading: "Still Have Questions?",
        description: "We're always happy to chat about how we can help you get the most from your property.",
        buttonText: "Get in Touch",
        buttonLink: "#contact",
      },
    },
    FOOTER_BLOCK,
  ],
  root: { props: { title: "FAQ" } },
};

export const contactPageData: BlockData = {
  content: [
    {
      type: "HeroSection",
      props: {
        id: sid("hero-contact"),
        title: "Get in Touch",
        subtitle: "We'd love to hear from you. Whether you're a property owner looking for management or a guest wanting to book.",
        backgroundImage: HERO_BG,
        ctaText: "Send a Message",
        ctaLink: "#contact",
      },
    },
    {
      type: "ContactSection",
      props: {
        id: sid("contact-form"),
        title: "Contact Us",
        email: "info@christianopropertymanagement.com",
        phone: "+35679790202",
        whatsapp: "+35679790202",
        location: "Birkirkara, Malta",
        mapLat: "35.8961327",
        mapLng: "14.4644929",
      },
    },
    {
      type: "ImageWithText",
      props: {
        id: sid("iwt-contact"),
        title: "Visit Our Office",
        description: "Our office is centrally located in Birkirkara, the heart of Malta's island. We're always happy to meet property owners in person for a no-obligation chat about how we can help maximise your rental income.\n\nWhether you're based in Malta or overseas, our team is available 24/7 to handle every aspect of your property management. Drop by, give us a call, or send us an email — we'd love to hear from you.",
        imageUrl: PROP_2,
        layout: "image-right",
        buttonText: "Get Directions",
        buttonLink: "#contact",
        badge: "Birkirkara, Malta",
      },
    },
    {
      type: "NewsletterSection",
      props: {
        id: sid("nl-contact"),
        heading: "Stay Updated",
        description: "Subscribe to receive exclusive offers, property updates, and Malta travel tips",
        buttonText: "Subscribe",
        successMessage: "Welcome aboard! Check your inbox for a confirmation.",
      },
    },
    FOOTER_BLOCK,
  ],
  root: { props: { title: "Contact" } },
};

export const testimonialsPageData: BlockData = {
  content: [
    {
      type: "HeroSection",
      props: {
        id: sid("hero-test"),
        title: "Guest Testimonials",
        subtitle: "Don't just take our word for it. Here's what our guests have to say about their experience.",
        backgroundImage: PROP_MADLIENA,
        ctaText: "Book Your Stay",
        ctaLink: "#book",
      },
    },
    {
      type: "TestimonialSection",
      props: { id: sid("test-items"), title: "What Our Guests Say", testimonials: TESTIMONIALS },
    },
    {
      type: "VideoSection",
      props: {
        id: sid("vid-test"),
        title: "Hear From Our Guests",
        description: "Watch video testimonials from guests who have experienced the Christiano difference. Real stories, real experiences, real five-star hospitality.",
        videoUrl: "",
        thumbnailUrl: PROP_MADLIENA,
        aspectRatio: "16:9",
      },
    },
    {
      type: "CtaBanner",
      props: {
        id: sid("cta-test"),
        heading: "Experience the Difference",
        description: "Book your stay with Christiano Property Management and discover why our guests keep coming back.",
        buttonText: "Book Direct",
        buttonLink: "#book",
      },
    },
    FOOTER_BLOCK,
  ],
  root: { props: { title: "Testimonials" } },
};

export const dashboardPageData: BlockData = {
  content: [
    {
      type: "HeroSection",
      props: {
        id: sid("hero-dash"),
        title: "Booking Dashboard",
        subtitle: "Manage all your property bookings in one place. Track reservations, confirm arrivals, and monitor performance.",
        backgroundImage: PROP_VALLETTA,
        ctaText: "View Properties",
        ctaLink: "#properties",
      },
    },
    {
      type: "GuestyBookingDashboard",
      props: {
        id: sid("dash-widget"),
        title: "Booking Management",
      },
    },
    {
      type: "SocialProofStrip",
      props: {
        id: sid("proof-dash"),
        items: [
          { number: "250", label: "Bookings This Year", prefix: "", suffix: "+" },
          { number: "4.9", label: "Guest Rating", prefix: "", suffix: "" },
          { number: "92", label: "Occupancy Rate", prefix: "", suffix: "%" },
          { number: "24", label: "Avg Response Time", prefix: "<", suffix: "min" },
        ],
      },
    },
    FOOTER_BLOCK,
  ],
  root: { props: { title: "Dashboard" } },
};

// ============================================================
// PAGE MAP
// ============================================================
export const defaultPages: Record<string, { title: string; data: BlockData }> = {
  home: { title: "Home", data: homePageData },
  about: { title: "About Us", data: aboutPageData },
  properties: { title: "Properties", data: propertiesPageData },
  book: { title: "Book Direct", data: bookPageData },
  pricing: { title: "Pricing Plans", data: pricingPageData },
  faq: { title: "FAQ", data: faqPageData },
  contact: { title: "Contact", data: contactPageData },
  testimonials: { title: "Testimonials", data: testimonialsPageData },
  dashboard: { title: "Dashboard", data: dashboardPageData },
};

export const pageSlugs = Object.keys(defaultPages);

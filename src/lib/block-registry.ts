// Block Registry — Machine-readable schema of all Puck block types
// Used by AI API routes to inject complete block knowledge into prompts

export interface FieldSchema {
  type: "text" | "textarea" | "select" | "array" | "number" | "richtext";
  label?: string;
  options?: { label: string; value: string }[];
  defaultItemProps?: Record<string, string>;
  arrayFields?: Record<string, FieldSchema>;
  description?: string;
}

export interface BlockSchema {
  label: string;
  fields: Record<string, FieldSchema>;
  defaultProps: Record<string, unknown>;
}

// ============================================================
// COMPLETE BLOCK REGISTRY
// ============================================================
export const BLOCK_REGISTRY: Record<string, BlockSchema> = {
  HeroSection: {
    label: "Hero Section",
    fields: {
      title: { type: "text", description: "Main headline — keep under 80 characters, impactful and benefit-focused" },
      subtitle: { type: "textarea", description: "Supporting text — 2-3 sentences, key value propositions, under 300 characters" },
      backgroundImage: { type: "text", label: "Background Image URL", description: "Full URL to hero background image" },
      ctaText: { type: "text", label: "CTA Button Text", description: "Call-to-action button label, 2-4 words" },
      ctaLink: { type: "text", label: "CTA Button Link", description: "Anchor link like #section-id or full URL" },
    },
    defaultProps: {
      title: "Dedicated to Maximizing Your Property's Potential",
      subtitle: "9 years of Superhost experience managing luxury short-term rentals across Malta.",
      backgroundImage: "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/MUAjN1w9lUA.jpg",
      ctaText: "Learn More",
      ctaLink: "#about",
    },
  },

  AboutSection: {
    label: "About Section",
    fields: {
      title: { type: "text", description: "Section headline — e.g., 'About Christiano Property Management'" },
      description: { type: "textarea", description: "Multi-paragraph about text. Separate paragraphs with double newlines (\\n\\n). 150-400 words total." },
      imageUrl: { type: "text", label: "Image URL", description: "Full URL to about image" },
    },
    defaultProps: {
      title: "About Christiano Property Management",
      description: "Christiano Property Management is a luxury short-term rental management company operating across Malta.",
      imageUrl: "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/9f5bb789-c9cd-4da2-9672-7071482f7efb-high.png",
    },
  },

  WhyChooseUs: {
    label: "Why Choose Us",
    fields: {
      title: { type: "text", description: "Section headline — e.g., 'Why Choose Us?'" },
      items: {
        type: "array",
        label: "Features",
        description: "Array of feature cards, 3-6 items recommended",
        defaultItemProps: { title: "Feature", description: "Description", icon: "star" },
        arrayFields: {
          title: { type: "text", description: "Feature title, 3-6 words" },
          description: { type: "textarea", description: "Feature description, 1-2 sentences, under 200 characters" },
          icon: { type: "text", label: "Icon (lucide name)", description: "Lucide icon name: star, award, gem, check-circle, settings, shield, home, key, users, heart, clock, zap, trending-up, compass, sun, globe, lock" },
        },
      },
    },
    defaultProps: {
      title: "Why Choose Us?",
      items: [
        { title: "Tailored Property Management", description: "Custom strategies for your property.", icon: "settings" },
        { title: "Expertise You Can Trust", description: "9 years of Superhost experience.", icon: "award" },
        { title: "Selective Portfolio", description: "Limited properties, maximum attention.", icon: "gem" },
        { title: "Comprehensive Services", description: "End-to-end management.", icon: "check-circle" },
      ],
    },
  },

  ServicesSection: {
    label: "Services Section",
    fields: {
      title: { type: "text", description: "Section headline — e.g., 'What We Offer'" },
      services: {
        type: "array",
        label: "Services",
        description: "Array of services with included status",
        defaultItemProps: { name: "Service", included: "true" },
        arrayFields: {
          name: { type: "text", description: "Service name" },
          included: {
            type: "select",
            description: "Whether service is included in standard plans",
            options: [
              { label: "Included", value: "true" },
              { label: "Extra", value: "false" },
            ],
          },
        },
      },
      extras: {
        type: "array",
        label: "Optional Extras",
        description: "Array of paid add-on services",
        defaultItemProps: { name: "Extra", price: "" },
        arrayFields: {
          name: { type: "text", description: "Extra service name" },
          price: { type: "text", description: "Price string like '€350' or 'On request'" },
        },
      },
      ctaText: { type: "text", label: "CTA Text", description: "Call-to-action button label" },
      ctaLink: { type: "text", label: "CTA Link", description: "Anchor link or URL" },
    },
    defaultProps: {
      title: "What We Offer",
      services: [
        { name: "Property Assessment", included: "true" },
        { name: "Dynamic Pricing Strategy", included: "true" },
        { name: "Guest Communication (24/7)", included: "true" },
        { name: "Professional Cleaning", included: "true" },
      ],
      extras: [
        { name: "Professional Photoshoot", price: "On request" },
        { name: "MTA Licensing Assistance", price: "€350" },
      ],
      ctaText: "View Our Pricing Plans",
      ctaLink: "#pricing",
    },
  },

  PropertyShowcase: {
    label: "Property Showcase",
    fields: {
      title: { type: "text", description: "Section headline — e.g., 'Discover Our Properties'" },
      properties: {
        type: "array",
        label: "Properties",
        description: "Array of properties to showcase, 3-6 recommended",
        defaultItemProps: { name: "Property", imageUrl: "", caption: "" },
        arrayFields: {
          name: { type: "text", description: "Property name" },
          imageUrl: { type: "text", label: "Image URL", description: "Full URL to property image" },
          caption: { type: "text", description: "Short caption like '2 Bed · 2 Bath · Sleeps 6'" },
        },
      },
    },
    defaultProps: {
      title: "Discover Our Diverse Property Portfolio",
      properties: [
        { name: "Valletta Apartment", imageUrl: "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/valletta-apartment-10-high.jpg", caption: "2 Bed · 2 Bath · Sleeps 6" },
      ],
    },
  },

  BookingSection: {
    label: "Booking Section",
    fields: {
      title: { type: "text", description: "Section headline — e.g., 'Book Direct & Save'" },
      subtitle: { type: "textarea", description: "Supporting text about booking, 1-2 sentences" },
    },
    defaultProps: {
      title: "Check Availability & Book Direct",
      subtitle: "Book directly with us and save. No hidden fees, best price guaranteed.",
    },
  },

  PricingTable: {
    label: "Pricing Table",
    fields: {
      heading: { type: "text", description: "Section headline — e.g., 'Transparent Pricing'" },
    },
    defaultProps: {
      heading: "Transparent Pricing, Maximum Value",
    },
  },

  TestimonialSection: {
    label: "Testimonials",
    fields: {
      title: { type: "text", description: "Section headline — e.g., 'What Our Guests Say'" },
      testimonials: {
        type: "array",
        label: "Testimonials",
        description: "Array of guest testimonials, 2-6 recommended",
        defaultItemProps: { name: "Guest", date: "", rating: "5", quote: "Great stay!" },
        arrayFields: {
          name: { type: "text", description: "Guest name" },
          date: { type: "text", description: "Date string like 'October 2024'" },
          rating: {
            type: "select",
            description: "Star rating 1-5",
            options: [
              { label: "1 Star", value: "1" },
              { label: "2 Stars", value: "2" },
              { label: "3 Stars", value: "3" },
              { label: "4 Stars", value: "4" },
              { label: "5 Stars", value: "5" },
            ],
          },
          quote: { type: "textarea", description: "Guest testimonial quote, 2-4 sentences" },
        },
      },
    },
    defaultProps: {
      title: "What Our Guests Say",
      testimonials: [
        { name: "Katie", date: "October 2024", rating: "5", quote: "Christiano was an amazing host!" },
      ],
    },
  },

  FaqSection: {
    label: "FAQ Section",
    fields: {
      title: { type: "text", description: "Section headline — e.g., 'Your Questions, Answered'" },
      items: {
        type: "array",
        label: "FAQ Items",
        description: "Array of FAQ question/answer pairs, 4-12 recommended",
        defaultItemProps: { question: "Question?", answer: "Answer." },
        arrayFields: {
          question: { type: "text", description: "FAQ question" },
          answer: { type: "textarea", description: "FAQ answer, 2-4 sentences" },
        },
      },
    },
    defaultProps: {
      title: "Your Questions, Answered",
      items: [
        { question: "What types of properties do you manage?", answer: "Luxury short-term rentals across Malta." },
      ],
    },
  },

  ContactSection: {
    label: "Contact Section",
    fields: {
      title: { type: "text", description: "Section headline — e.g., 'Contact Us'" },
      email: { type: "text", description: "Contact email address" },
      phone: { type: "text", description: "Contact phone number" },
      whatsapp: { type: "text", description: "WhatsApp number" },
      location: { type: "text", description: "Physical location string" },
      mapLat: { type: "text", label: "Map Latitude", description: "Google Maps latitude coordinate" },
      mapLng: { type: "text", label: "Map Longitude", description: "Google Maps longitude coordinate" },
    },
    defaultProps: {
      title: "Contact Us",
      email: "info@christianopropertymanagement.com",
      phone: "+35679790202",
      whatsapp: "+35679790202",
      location: "Birkirkara, Malta",
      mapLat: "35.8961327",
      mapLng: "14.4644929",
    },
  },

  LogoBar: {
    label: "Logo Bar",
    fields: {
      title: { type: "text", description: "Small heading above logos — e.g., 'Trusted Partners'" },
      logoUrl: { type: "text", label: "Logo Image URL", description: "Full URL to partner/brand logo" },
    },
    defaultProps: {
      title: "Trusted Partners",
      logoUrl: "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/image-high-82icb0.png",
    },
  },

  CtaBanner: {
    label: "CTA Banner",
    fields: {
      heading: { type: "text", description: "CTA headline, 4-8 words, action-oriented" },
      description: { type: "textarea", description: "Supporting description, 1-2 sentences" },
      buttonText: { type: "text", label: "Button Text", description: "Button label, 2-5 words" },
      buttonLink: { type: "text", label: "Button Link", description: "Anchor link or URL" },
    },
    defaultProps: {
      heading: "Partner with Confidence",
      description: "Join the growing number of property owners who trust Christiano Property Management.",
      buttonText: "Contact Us Today",
      buttonLink: "#contact",
    },
  },

  StatsSection: {
    label: "Stats Section",
    fields: {
      stats: {
        type: "array",
        label: "Stats",
        description: "Array of key metrics, 3-4 recommended for layout balance",
        defaultItemProps: { value: "100+", label: "Metric" },
        arrayFields: {
          value: { type: "text", description: "Stat value like '9+', '50+', '4.9'" },
          label: { type: "text", description: "Stat label like 'Years Experience'" },
        },
      },
    },
    defaultProps: {
      stats: [
        { value: "9+", label: "Years Experience" },
        { value: "50+", label: "Properties Managed" },
        { value: "1000+", label: "Happy Guests" },
        { value: "4.9", label: "Average Rating" },
      ],
    },
  },

  FooterSection: {
    label: "Footer Section",
    fields: {
      logoUrl: { type: "text", label: "Logo URL", description: "Full URL to company logo" },
      copyright: { type: "text", description: "Copyright string like '© 2024-2026 Company Name'" },
      email: { type: "text", description: "Footer email" },
      phone: { type: "text", description: "Footer phone" },
    },
    defaultProps: {
      logoUrl: "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/image-high-82icb0.png",
      copyright: "© 2024-2026 Christiano Property Management",
      email: "info@christianopropertymanagement.com",
      phone: "+35679790202",
    },
  },

  Divider: {
    label: "Divider",
    fields: {
      title: { type: "text", description: "Optional centered text label. Leave empty string for plain line." },
    },
    defaultProps: {
      title: "",
    },
  },

  GuestyPropertySearch: {
    label: "Guesty · Property Search",
    fields: {
      title: { type: "text", description: "Search section headline" },
      subtitle: { type: "textarea", description: "Supporting text below headline" },
      buttonText: { type: "text", description: "Search button label" },
    },
    defaultProps: {
      title: "Find Your Perfect Stay",
      subtitle: "Search our curated collection of luxury properties across Malta",
      buttonText: "Search Properties",
    },
  },

  GuestyPropertyGrid: {
    label: "Guesty · Property Grid",
    fields: {
      title: { type: "text", description: "Grid section headline" },
      itemsPerPage: { type: "select", description: "Number of properties per page", options: [
        { label: "6 Properties", value: "6" },
        { label: "9 Properties", value: "9" },
        { label: "12 Properties", value: "12" },
      ]},
      showFilters: { type: "select", description: "Show filter controls", options: [
        { label: "Show Filters", value: "true" },
        { label: "Hide Filters", value: "false" },
      ]},
    },
    defaultProps: {
      title: "Available Properties",
      itemsPerPage: "6",
      showFilters: "true",
    },
  },

  GuestyPropertyDetail: {
    label: "Guesty · Property Detail",
    fields: {
      defaultSlug: { type: "text", label: "Default Property Slug", description: "Slug of the property to show by default" },
    },
    defaultProps: {
      defaultSlug: "valletta-apartment-1",
    },
  },

  GuestyBookingWidget: {
    label: "Guesty · Booking Widget",
    fields: {
      defaultSlug: { type: "text", label: "Default Property Slug", description: "Slug of the property to book" },
      title: { type: "text", description: "Widget headline" },
    },
    defaultProps: {
      defaultSlug: "valletta-apartment-1",
      title: "Complete Your Booking",
    },
  },

  GuestyBookingConfirmation: {
    label: "Guesty · Booking Confirmation",
    fields: {
      title: { type: "text", description: "Confirmation headline" },
      subtitle: { type: "textarea", description: "Confirmation supporting text" },
    },
    defaultProps: {
      title: "Booking Confirmed!",
      subtitle: "Your reservation has been successfully placed.",
    },
  },

  GuestyBookingDashboard: {
    label: "Guesty · Booking Dashboard",
    fields: {
      title: { type: "text", description: "Dashboard headline" },
    },
    defaultProps: {
      title: "Booking Management",
    },
  },

  ThemeSettings: {
    label: "Theme Settings",
    fields: {
      accentColor: {
        type: "text",
        label: "Accent Color",
        description: "Hex color code for the brand accent color (e.g., #c8a96a). Leave empty to use the default gold.",
      },
      backgroundShade: {
        type: "select",
        label: "Background Shade",
        description: "Controls the darkness level of the background. Does not affect light mode.",
        options: [
          { label: "Darkest", value: "darkest" },
          { label: "Dark", value: "dark" },
          { label: "Medium", value: "medium" },
        ],
      },
    },
    defaultProps: {
      accentColor: "",
      backgroundShade: "darkest",
    },
  },

  TeamSection: {
    label: "Team Section",
    fields: {
      title: { type: "text", description: "Section headline — e.g., 'Meet the Team'" },
      subtitle: { type: "textarea", description: "Supporting text below the headline, 1-2 sentences" },
      members: {
        type: "array",
        label: "Team Members",
        description: "Array of team member cards, 2-6 recommended",
        defaultItemProps: { name: "Team Member", role: "Role", bio: "Short bio.", imageUrl: "" },
        arrayFields: {
          name: { type: "text", description: "Full name of the team member" },
          role: { type: "text", description: "Job title or role" },
          bio: { type: "textarea", description: "Short biography, 1-2 sentences" },
          imageUrl: { type: "text", label: "Photo URL", description: "Full URL to team member photo" },
        },
      },
    },
    defaultProps: {
      title: "Meet the Team",
      subtitle: "The dedicated professionals behind our success.",
      members: [
        { name: "Christiano", role: "Founder & CEO", bio: "With over 9 years of Superhost experience.", imageUrl: "" },
        { name: "Sarah", role: "Guest Relations Manager", bio: "Ensuring every guest receives a five-star experience.", imageUrl: "" },
        { name: "James", role: "Operations Lead", bio: "Coordinating cleaning, maintenance, and preparation.", imageUrl: "" },
      ],
    },
  },

  VideoSection: {
    label: "Video Section",
    fields: {
      title: { type: "text", description: "Section headline — e.g., 'Watch Our Story'" },
      description: { type: "textarea", description: "Supporting text below the headline" },
      videoUrl: { type: "text", label: "YouTube/Vimeo Embed URL", description: "Full YouTube or Vimeo URL. Supports youtube.com/watch?v=, youtu.be/, and vimeo.com/ URLs" },
      thumbnailUrl: { type: "text", label: "Thumbnail Image URL", description: "Full URL to custom video thumbnail image" },
      aspectRatio: {
        type: "select",
        description: "Video aspect ratio",
        options: [
          { label: "16:9 (Widescreen)", value: "16:9" },
          { label: "4:3 (Standard)", value: "4:3" },
          { label: "1:1 (Square)", value: "1:1" },
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
  },

  NewsletterSection: {
    label: "Newsletter Section",
    fields: {
      heading: { type: "text", description: "Newsletter heading — e.g., 'Stay in the Loop'" },
      description: { type: "textarea", description: "Newsletter description, 1-2 sentences" },
      buttonText: { type: "text", label: "Subscribe Button Text", description: "Button label for subscribe action, e.g., 'Subscribe'" },
      successMessage: { type: "textarea", label: "Success Message", description: "Message shown after successful subscription" },
    },
    defaultProps: {
      heading: "Stay in the Loop",
      description: "Subscribe to our newsletter for the latest property listings, exclusive deals, and local Malta tips.",
      buttonText: "Subscribe",
      successMessage: "Thank you for subscribing! We'll be in touch soon.",
    },
  },

  ComparisonSection: {
    label: "Comparison Section",
    fields: {
      title: { type: "text", description: "Section headline — e.g., 'Compare Our Plans'" },
      columns: {
        type: "array",
        label: "Columns",
        description: "Array of comparison columns, 2-4 recommended",
        defaultItemProps: { heading: "Plan", description: "Plan description.", highlighted: "false" },
        arrayFields: {
          heading: { type: "text", description: "Column heading / plan name" },
          description: { type: "textarea", description: "Plan description, 1-2 sentences" },
          highlighted: {
            type: "select",
            label: "Highlight this column",
            description: "Whether to highlight this column with a gold border",
            options: [
              { label: "Yes", value: "true" },
              { label: "No", value: "false" },
            ],
          },
          features: {
            type: "array",
            label: "Features",
            description: "Array of features for this column",
              defaultItemProps: {name: "Feature", included: "true"},
            arrayFields: {
                name: {type: "text", description: "Feature description text"},
              included: {
                type: "select",
                description: "Whether this feature is included",
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
          description: "For new property owners looking to get started.",
          highlighted: "false",
          features: [
              {name: "Basic Listing Setup", included: "true"},
              {name: "Dynamic Pricing", included: "true"},
              {name: "24/7 Guest Communication", included: "false"},
          ],
        },
        {
          heading: "Professional",
          description: "Our most popular plan for serious property investors.",
          highlighted: "true",
          features: [
              {name: "Full Listing Optimization", included: "true"},
              {name: "Dynamic Pricing Strategy", included: "true"},
              {name: "24/7 Guest Communication", included: "true"},
          ],
        },
      ],
    },
  },

  ImageWithText: {
    label: "Image With Text",
    fields: {
      title: { type: "text", description: "Section headline — e.g., 'Experience Malta Like a Local'" },
      description: { type: "textarea", description: "Body text. Separate paragraphs with double newlines. 100-300 words." },
      imageUrl: { type: "text", label: "Image URL", description: "Full URL to the section image" },
      layout: {
        type: "select",
        description: "Image and text layout arrangement",
        options: [
          { label: "Image Left", value: "image-left" },
          { label: "Image Right", value: "image-right" },
          { label: "Image Top", value: "image-top" },
        ],
      },
      buttonText: { type: "text", label: "Button Text", description: "CTA button label, optional" },
      buttonLink: { type: "text", label: "Button Link", description: "CTA button anchor link or URL" },
      badge: { type: "text", label: "Badge Text (optional)", description: "Small badge text displayed above the title, e.g., 'Featured'" },
    },
    defaultProps: {
      title: "Experience Malta Like a Local",
      description: "Our handpicked properties are located in Malta's most desirable neighborhoods.",
      imageUrl: "",
      layout: "image-left",
      buttonText: "Explore Properties",
      buttonLink: "#properties",
      badge: "Featured",
    },
  },

  MaltaMapSection: {
    label: "Malta & Gozo Map Animation",
    fields: {
      label: { type: "text", description: "Optional label text below the map, e.g. 'Home' or 'Properties'" },
      drawDuration: { type: "number", label: "Draw Duration (ms)", description: "Stroke draw animation duration in milliseconds (800-5000)" },
      fillDelay: { type: "number", label: "Fill Delay (ms)", description: "Delay between draw complete and fill starting (0-1000)" },
      sizeClass: {
        type: "select",
        label: "Size Preset",
        description: "Responsive size of the SVG map",
        options: [
          { label: "Small", value: "w-36 h-24 sm:w-48 sm:h-32 md:w-56 md:h-36" },
          { label: "Medium", value: "w-44 h-32 sm:w-60 sm:h-44 md:w-72 md:h-52" },
          { label: "Large", value: "w-56 h-40 sm:w-72 sm:h-52 md:w-96 md:h-64" },
          { label: "Full Width", value: "w-64 h-44 sm:w-80 sm:h-56 md:w-[28rem] md:h-72 lg:w-[36rem] lg:h-80" },
        ],
      },
      showBrand: {
        type: "select",
        label: "Show Brand Tagline",
        description: "Display 'Malta · Gozo' text below the map",
        options: [
          { label: "Show", value: "true" },
          { label: "Hide", value: "false" },
        ],
      },
      backgroundStyle: {
        type: "select",
        label: "Background Style",
        description: "Visual style of the section background",
        options: [
          { label: "Transparent", value: "transparent" },
          { label: "Dark Surface", value: "dark" },
          { label: "Card Surface", value: "card" },
          { label: "Gradient Glow", value: "glow" },
        ],
      },
      paddingY: {
        type: "select",
        label: "Vertical Padding",
        description: "Amount of vertical padding around the map",
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
  },

  SocialProofStrip: {
    label: "Social Proof Strip",
    fields: {
      items: {
        type: "array",
        label: "Metrics",
        description: "Array of social proof metrics, 3-5 recommended",
        defaultItemProps: { number: "100", label: "Metric", prefix: "", suffix: "+" },
        arrayFields: {
          number: { type: "text", label: "Metric Number", description: "Numeric value like '4.9', '1000', '98'" },
          label: { type: "text", description: "Metric label like 'Average Rating', 'Happy Guests'" },
          prefix: { type: "text", label: "Prefix (e.g. $, €)", description: "Optional prefix like '$' or '€'" },
          suffix: { type: "text", label: "Suffix (e.g. %, +)", description: "Optional suffix like '%' or '+'" },
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
  },
};

export const BLOCK_TYPE_NAMES = Object.keys(BLOCK_REGISTRY);

export function getBlockSchema(blockType: string): BlockSchema | null {
  return BLOCK_REGISTRY[blockType] || null;
}

// Generate a compact schema string for AI prompts
export function buildSchemaSummary(): string {
  let summary = "";
  for (const [name, schema] of Object.entries(BLOCK_REGISTRY)) {
    summary += `\n### ${name} (${schema.label})\n`;
    summary += `Default props: ${JSON.stringify(schema.defaultProps)}\n`;
    summary += `Fields:\n`;
    for (const [fieldName, field] of Object.entries(schema.fields)) {
      if (field.type === "array") {
        const subFields = Object.entries(field.arrayFields || {})
          .map(([k, v]) => `  - ${k}: ${v.type}${v.options ? ` (${v.options.map((o) => o.value).join("|")})` : ""}`)
          .join("\n");
        summary += `  - ${fieldName}: array of {${field.defaultItemProps ? JSON.stringify(field.defaultItemProps) : "{}"}}\n    ${subFields}\n`;
      } else {
        summary += `  - ${fieldName}: ${field.type}${field.label ? ` (${field.label})` : ""}${field.options ? ` (${field.options.map((o) => o.value).join("|")})` : ""}\n`;
      }
    }
  }
  return summary;
}

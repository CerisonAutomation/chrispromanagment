/**
 * @fileoverview Canonical unified schema — puckeditor/puck demo (12 blocks) +
 * chrispropmanagment custom blocks (28 blocks).
 *
 * Puck demo source: https://github.com/measuredco/puck/tree/main/apps/demo/config
 * Custom blocks: https://github.com/CerisonAutomation/chrispropmanagment/tree/main/src/blocks
 *
 * Total: 40 blocks across 7 categories.
 */

import { z } from "zod";

// ─── Shared primitives ─────────────────────────────────────────────────────────

export const CSSValueSchema = z.string().regex(/^\d+(px|rem|em|vh|vw|%)$/);
export const ColorSchema = z.string();
export const ImageSchema = z.object({
  url: z.string().url().optional().default(""),
  alt: z.string().optional().default(""),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});
export const LinkSchema = z.object({
  label: z.string().min(1),
  href: z.string(),
});
export const LayoutSchema = z.object({
  padding: CSSValueSchema.optional().default("0px"),
  grow: z.boolean().optional(),
  spanCol: z.number().int().min(1).optional().default(1),
  spanRow: z.number().int().min(1).optional().default(1),
});

// ─── PUCK DEMO BLOCKS (12) ─────────────────────────────────────────────────────

export const ButtonPropsSchema = z.object({
  label: z.string().min(1),
  href: z.string(),
  variant: z.enum(["primary", "secondary"]).default("primary"),
});

export const CardPropsSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  icon: z.string().optional().default("feather"),
  mode: z.enum(["flat", "card"]).default("flat"),
  layout: LayoutSchema.optional().default({ spanCol: 1, spanRow: 1, padding: "0px" }),
});

export const FlexPropsSchema = z.object({
  direction: z.enum(["row", "column"]).default("row"),
  justifyContent: z.enum(["flex-start", "flex-end", "center", "space-between", "space-around"]).default("flex-start"),
  gap: z.number().int().min(0).default(24),
  wrap: z.enum(["nowrap", "wrap"]).default("nowrap"),
  layout: LayoutSchema.optional(),
  items: z.array(z.any()).default([]),
});

export const GridPropsSchema = z.object({
  numColumns: z.number().int().min(1).max(12).default(3),
  gap: z.number().int().min(0).default(24),
  items: z.array(z.any()).default([]),
});

export const HeadingPropsSchema = z.object({
  text: z.string().min(1),
  level: z.enum(["1", "2", "3", "4", "5", "6"]).default("2"),
  size: z.enum(["xs", "s", "m", "l", "xl", "xxl"]).default("xxl"),
  align: z.enum(["left", "center", "right"]).default("left"),
  layout: LayoutSchema.optional().default({ padding: "0px" }),
});

export const HeroPropsSchema = z.object({
  title: z.string().min(1).default("Hero"),
  description: z.string().default("<p>Description</p>"),
  align: z.enum(["left", "center"]).default("left"),
  buttons: z.array(z.object({
    label: z.string().min(1),
    href: z.string(),
    variant: z.enum(["primary", "secondary"]).optional().default("primary"),
  })).min(0).max(4).default([{ label: "Learn more", href: "#" }]),
  image: z.object({
    url: z.string().optional().default(""),
    mode: z.enum(["inline", "background", "custom"]).default("inline"),
  }).optional(),
  padding: CSSValueSchema.optional().default("64px"),
});

export const LogosPropsSchema = z.object({
  logos: z.array(z.object({
    url: z.string().url(),
    alt: z.string().optional().default("Logo"),
  })).optional().default([]),
});

export const RichTextPropsSchema = z.object({
  content: z.string().default("<p>Rich text content</p>"),
  layout: LayoutSchema.optional(),
});

export const SpacePropsSchema = z.object({
  size: CSSValueSchema.default("24px"),
  direction: z.enum(["vertical", "horizontal"]).default("vertical"),
});

export const StatsPropsSchema = z.object({
  items: z.array(z.object({
    title: z.string().min(1),
    description: z.string(),
  })).min(1).max(8).default([{ title: "Stat", description: "0" }]),
});

export const TemplatePropsSchema = z.object({
  title: z.string().optional(),
});

export const TextPropsSchema = z.object({
  text: z.string().min(1),
  size: z.enum(["xs", "s", "m", "l", "xl"]).default("m"),
  align: z.enum(["left", "center", "right"]).default("left"),
  color: z.enum(["default", "muted"]).default("default"),
  maxWidth: z.string().optional(),
  layout: LayoutSchema.optional().default({ padding: "0px" }),
});

// ─── CHRISPROPMANAGMENT CUSTOM BLOCKS (28) ─────────────────────────────────────

export const AboutSectionPropsSchema = z.object({
  heading: z.string().default("About Us"),
  subheading: z.string().optional(),
  body: z.string().default("<p>About us content</p>"),
  image: ImageSchema.optional(),
  layout: z.enum(["imageLeft", "imageRight", "centered"]).default("imageRight"),
  backgroundColor: ColorSchema.optional(),
  padding: CSSValueSchema.optional().default("80px"),
});

export const BookingSectionPropsSchema = z.object({
  heading: z.string().default("Book Your Stay"),
  subheading: z.string().optional(),
  guestyListingId: z.string().optional(),
  showAvailabilityCalendar: z.boolean().default(true),
  showPricing: z.boolean().default(true),
  backgroundColor: ColorSchema.optional(),
  padding: CSSValueSchema.optional().default("64px"),
});

export const CanonicalBlocksPropsSchema = z.object({
  blockType: z.string().default("generic"),
  content: z.record(z.any()).optional().default({}),
});

export const ComparisonSectionPropsSchema = z.object({
  heading: z.string().default("Compare"),
  columns: z.array(z.object({
    title: z.string(),
    features: z.array(z.string()),
    highlighted: z.boolean().optional().default(false),
    badge: z.string().optional(),
  })).min(2).max(4).default([
    { title: "Basic", features: ["Feature A"], highlighted: false },
    { title: "Pro", features: ["Feature A", "Feature B"], highlighted: true },
  ]),
  backgroundColor: ColorSchema.optional(),
  padding: CSSValueSchema.optional().default("80px"),
});

export const ContactSectionPropsSchema = z.object({
  heading: z.string().default("Contact Us"),
  subheading: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  showForm: z.boolean().default(true),
  backgroundColor: ColorSchema.optional(),
  padding: CSSValueSchema.optional().default("80px"),
});

export const ContentPropsSchema = z.object({
  html: z.string().default("<p>Content</p>"),
  maxWidth: CSSValueSchema.optional(),
  align: z.enum(["left", "center", "right"]).default("left"),
  padding: CSSValueSchema.optional().default("0px"),
});

export const CtaBannerPropsSchema = z.object({
  heading: z.string().default("Ready to get started?"),
  subheading: z.string().optional(),
  primaryCta: LinkSchema.default({ label: "Get Started", href: "#" }),
  secondaryCta: LinkSchema.optional(),
  backgroundColor: ColorSchema.optional(),
  padding: CSSValueSchema.optional().default("80px"),
});

export const DividerPropsSchema = z.object({
  style: z.enum(["solid", "dashed", "dotted", "none"]).default("solid"),
  color: ColorSchema.optional(),
  margin: CSSValueSchema.optional().default("0px"),
});

export const ElementsPropsSchema = z.object({
  elements: z.array(z.object({
    type: z.string(),
    props: z.record(z.any()).optional().default({}),
  })).default([]),
});

export const FaqSectionPropsSchema = z.object({
  heading: z.string().default("Frequently Asked Questions"),
  items: z.array(z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
  })).min(1).default([{ question: "Question?", answer: "Answer." }]),
  style: z.enum(["accordion", "open"]).default("accordion"),
  backgroundColor: ColorSchema.optional(),
  padding: CSSValueSchema.optional().default("80px"),
});

export const FeatureGridPropsSchema = z.object({
  heading: z.string().optional(),
  columns: z.number().int().min(1).max(4).default(3),
  features: z.array(z.object({
    icon: z.string().optional(),
    title: z.string().min(1),
    description: z.string(),
  })).min(1).default([{ title: "Feature", description: "Description" }]),
  backgroundColor: ColorSchema.optional(),
  padding: CSSValueSchema.optional().default("80px"),
});

export const FooterSectionPropsSchema = z.object({
  logo: ImageSchema.optional(),
  tagline: z.string().optional(),
  columns: z.array(z.object({
    heading: z.string(),
    links: z.array(LinkSchema),
  })).optional().default([]),
  socialLinks: z.array(z.object({
    platform: z.enum(["twitter", "instagram", "facebook", "linkedin", "youtube", "github"]),
    href: z.string(),
  })).optional().default([]),
  copyright: z.string().optional(),
  backgroundColor: ColorSchema.optional(),
});

export const GuestyBookingConfirmationPropsSchema = z.object({
  heading: z.string().default("Booking Confirmed!"),
  subheading: z.string().optional(),
  confirmationMessage: z.string().default("<p>Your booking has been confirmed.</p>"),
  showSummary: z.boolean().default(true),
});

export const GuestyBookingDashboardPropsSchema = z.object({
  heading: z.string().default("My Bookings"),
  showUpcoming: z.boolean().default(true),
  showPast: z.boolean().default(true),
  emptyMessage: z.string().optional().default("No bookings found."),
});

export const GuestyBookingWidgetPropsSchema = z.object({
  listingId: z.string().optional(),
  showGuestCount: z.boolean().default(true),
  showDatePicker: z.boolean().default(true),
  ctaLabel: z.string().default("Book Now"),
});

export const GuestyPropertyDetailPropsSchema = z.object({
  listingId: z.string().optional(),
  showAmenities: z.boolean().default(true),
  showReviews: z.boolean().default(true),
  showMap: z.boolean().default(true),
  showGallery: z.boolean().default(true),
});

export const GuestyPropertyGridPropsSchema = z.object({
  heading: z.string().optional(),
  columns: z.number().int().min(1).max(4).default(3),
  maxListings: z.number().int().min(1).max(50).default(9),
  showFilters: z.boolean().default(true),
  showPagination: z.boolean().default(true),
});

export const GuestyPropertySearchPropsSchema = z.object({
  placeholder: z.string().default("Search properties..."),
  showFilters: z.boolean().default(true),
  showMap: z.boolean().default(false),
  defaultView: z.enum(["grid", "list", "map"]).default("grid"),
});

export const HelpersPropsSchema = z.object({
  type: z.string().optional(),
});

export const HeroSectionPropsSchema = z.object({
  heading: z.string().default("Welcome"),
  subheading: z.string().optional(),
  body: z.string().optional(),
  image: ImageSchema.optional(),
  backgroundVideo: z.string().url().optional(),
  overlay: z.boolean().default(false),
  overlayOpacity: z.number().min(0).max(1).default(0.4),
  buttons: z.array(z.object({
    label: z.string(),
    href: z.string(),
    variant: z.enum(["primary", "secondary", "ghost"]).default("primary"),
  })).optional().default([{ label: "Explore", href: "#", variant: "primary" }]),
  align: z.enum(["left", "center", "right"]).default("center"),
  minHeight: CSSValueSchema.optional().default("80vh"),
  padding: CSSValueSchema.optional().default("0px"),
});

export const ImageGalleryPropsSchema = z.object({
  images: z.array(ImageSchema).min(1).default([{ url: "", alt: "Gallery image" }]),
  layout: z.enum(["grid", "masonry", "carousel", "lightbox"]).default("grid"),
  columns: z.number().int().min(1).max(6).default(3),
  gap: z.number().int().min(0).default(8),
  aspectRatio: z.enum(["square", "landscape", "portrait", "auto"]).default("landscape"),
});

export const ImageWithTextPropsSchema = z.object({
  heading: z.string().default("Section Heading"),
  body: z.string().default("<p>Section content</p>"),
  image: ImageSchema.optional(),
  imagePosition: z.enum(["left", "right"]).default("right"),
  imageSize: z.enum(["small", "medium", "large"]).default("medium"),
  cta: LinkSchema.optional(),
  backgroundColor: ColorSchema.optional(),
  padding: CSSValueSchema.optional().default("80px"),
});

export const LayoutPropsSchema = z.object({
  type: z.enum(["full", "contained", "narrow"]).default("contained"),
  maxWidth: CSSValueSchema.optional().default("1280px"),
  padding: CSSValueSchema.optional().default("0px"),
  backgroundColor: ColorSchema.optional(),
  children: z.array(z.any()).optional().default([]),
});

export const LogoBarPropsSchema = z.object({
  heading: z.string().optional(),
  logos: z.array(z.object({
    image: ImageSchema,
    alt: z.string().optional().default("Logo"),
    href: z.string().optional(),
  })).min(1).default([{ image: { url: "", alt: "" }, alt: "Logo" }]),
  variant: z.enum(["static", "scrolling"]).default("static"),
  backgroundColor: ColorSchema.optional(),
  padding: CSSValueSchema.optional().default("48px"),
});

export const MaltaMapSectionPropsSchema = z.object({
  heading: z.string().default("Find Us in Malta"),
  subheading: z.string().optional(),
  lat: z.number().default(35.9375),
  lng: z.number().default(14.3754),
  zoom: z.number().int().min(1).max(20).default(12),
  markers: z.array(z.object({
    lat: z.number(),
    lng: z.number(),
    label: z.string().optional(),
  })).optional().default([]),
  mapHeight: CSSValueSchema.optional().default("480px"),
  padding: CSSValueSchema.optional().default("80px"),
});

export const MapSectionPropsSchema = z.object({
  heading: z.string().optional(),
  lat: z.number().default(0),
  lng: z.number().default(0),
  zoom: z.number().int().min(1).max(20).default(12),
  mapHeight: CSSValueSchema.optional().default("400px"),
  padding: CSSValueSchema.optional().default("80px"),
});

export const NewsletterSectionPropsSchema = z.object({
  heading: z.string().default("Stay in the loop"),
  subheading: z.string().optional(),
  placeholder: z.string().default("Enter your email"),
  ctaLabel: z.string().default("Subscribe"),
  successMessage: z.string().default("Thanks for subscribing!"),
  backgroundColor: ColorSchema.optional(),
  padding: CSSValueSchema.optional().default("80px"),
});

export const PricingTablePropsSchema = z.object({
  heading: z.string().default("Pricing"),
  subheading: z.string().optional(),
  billingToggle: z.boolean().default(true),
  plans: z.array(z.object({
    name: z.string().min(1),
    price: z.object({
      monthly: z.number().min(0),
      annual: z.number().min(0).optional(),
    }),
    description: z.string().optional(),
    features: z.array(z.string()).default([]),
    cta: LinkSchema.default({ label: "Get Started", href: "#" }),
    highlighted: z.boolean().default(false),
    badge: z.string().optional(),
  })).min(1).default([{
    name: "Free", price: { monthly: 0 }, features: ["Feature 1"],
    cta: { label: "Get Started", href: "#" }, highlighted: false,
  }]),
  backgroundColor: ColorSchema.optional(),
  padding: CSSValueSchema.optional().default("80px"),
});

export const PropertyShowcasePropsSchema = z.object({
  heading: z.string().default("Featured Properties"),
  subheading: z.string().optional(),
  layout: z.enum(["grid", "featured", "carousel"]).default("grid"),
  columns: z.number().int().min(1).max(4).default(3),
  maxItems: z.number().int().min(1).max(20).default(6),
  showCta: z.boolean().default(true),
  ctaLink: LinkSchema.optional().default({ label: "View All", href: "/properties" }),
  backgroundColor: ColorSchema.optional(),
  padding: CSSValueSchema.optional().default("80px"),
});

export const ServicesSectionPropsSchema = z.object({
  heading: z.string().default("Our Services"),
  subheading: z.string().optional(),
  layout: z.enum(["grid", "list", "cards"]).default("grid"),
  columns: z.number().int().min(1).max(4).default(3),
  services: z.array(z.object({
    icon: z.string().optional(),
    title: z.string().min(1),
    description: z.string(),
    cta: LinkSchema.optional(),
  })).min(1).default([{ title: "Service", description: "Description" }]),
  backgroundColor: ColorSchema.optional(),
  padding: CSSValueSchema.optional().default("80px"),
});

export const SocialProofStripPropsSchema = z.object({
  items: z.array(z.object({
    type: z.enum(["logo", "stat", "badge"]),
    content: z.string(),
    label: z.string().optional(),
  })).min(1).default([{ type: "stat", content: "10K+", label: "Happy Guests" }]),
  backgroundColor: ColorSchema.optional(),
  padding: CSSValueSchema.optional().default("32px"),
});

export const SpacerPropsSchema = z.object({
  height: CSSValueSchema.default("24px"),
  responsive: z.object({
    mobile: CSSValueSchema.optional(),
    tablet: CSSValueSchema.optional(),
  }).optional(),
});

export const StatsSectionPropsSchema = z.object({
  heading: z.string().optional(),
  subheading: z.string().optional(),
  stats: z.array(z.object({
    value: z.string().min(1),
    label: z.string().min(1),
    prefix: z.string().optional(),
    suffix: z.string().optional(),
  })).min(1).default([{ value: "10K+", label: "Happy Guests" }]),
  animateOnScroll: z.boolean().default(true),
  backgroundColor: ColorSchema.optional(),
  padding: CSSValueSchema.optional().default("80px"),
});

export const TeamSectionPropsSchema = z.object({
  heading: z.string().default("Meet the Team"),
  subheading: z.string().optional(),
  members: z.array(z.object({
    name: z.string().min(1),
    role: z.string(),
    bio: z.string().optional(),
    image: ImageSchema.optional(),
    socialLinks: z.array(z.object({
      platform: z.string(),
      href: z.string(),
    })).optional().default([]),
  })).min(1).default([{ name: "Team Member", role: "Role" }]),
  columns: z.number().int().min(1).max(6).default(3),
  backgroundColor: ColorSchema.optional(),
  padding: CSSValueSchema.optional().default("80px"),
});

export const TestimonialSectionPropsSchema = z.object({
  heading: z.string().default("What Our Guests Say"),
  subheading: z.string().optional(),
  testimonials: z.array(z.object({
    quote: z.string().min(1),
    author: z.string().min(1),
    role: z.string().optional(),
    avatar: ImageSchema.optional(),
    rating: z.number().int().min(1).max(5).optional().default(5),
    source: z.enum(["google", "tripadvisor", "airbnb", "booking", "manual"]).optional().default("manual"),
  })).min(1).default([{ quote: "Amazing stay!", author: "Guest", rating: 5 }]),
  layout: z.enum(["grid", "carousel", "masonry"]).default("grid"),
  backgroundColor: ColorSchema.optional(),
  padding: CSSValueSchema.optional().default("80px"),
});

export const TextBlockPropsSchema = z.object({
  content: z.string().default("<p>Text content</p>"),
  align: z.enum(["left", "center", "right"]).default("left"),
  maxWidth: CSSValueSchema.optional(),
  padding: CSSValueSchema.optional().default("0px"),
});

export const ThemeSettingsPropsSchema = z.object({
  primaryColor: ColorSchema.optional().default("#000000"),
  secondaryColor: ColorSchema.optional().default("#ffffff"),
  accentColor: ColorSchema.optional().default("#0066cc"),
  fontFamily: z.string().optional().default("Inter"),
  borderRadius: CSSValueSchema.optional().default("8px"),
  darkMode: z.boolean().optional().default(false),
});

export const TimelinePropsSchema = z.object({
  heading: z.string().optional(),
  items: z.array(z.object({
    date: z.string(),
    title: z.string().min(1),
    description: z.string().optional(),
    icon: z.string().optional(),
  })).min(1).default([{ date: "2024", title: "Event", description: "Description" }]),
  orientation: z.enum(["vertical", "horizontal"]).default("vertical"),
  backgroundColor: ColorSchema.optional(),
  padding: CSSValueSchema.optional().default("80px"),
});

export const VideoSectionPropsSchema = z.object({
  heading: z.string().optional(),
  subheading: z.string().optional(),
  videoUrl: z.string().url().default("https://www.youtube.com/embed/dQw4w9WgXcQ"),
  poster: ImageSchema.optional(),
  autoplay: z.boolean().default(false),
  muted: z.boolean().default(true),
  loop: z.boolean().default(false),
  aspectRatio: z.enum(["16/9", "4/3", "1/1"]).default("16/9"),
  backgroundColor: ColorSchema.optional(),
  padding: CSSValueSchema.optional().default("80px"),
});

export const WhyChooseUsPropsSchema = z.object({
  heading: z.string().default("Why Choose Us"),
  subheading: z.string().optional(),
  reasons: z.array(z.object({
    icon: z.string().optional(),
    title: z.string().min(1),
    description: z.string(),
  })).min(1).default([{ title: "Reason", description: "Because we are the best." }]),
  layout: z.enum(["grid", "list", "alternating"]).default("grid"),
  columns: z.number().int().min(1).max(4).default(3),
  backgroundColor: ColorSchema.optional(),
  padding: CSSValueSchema.optional().default("80px"),
});

// ─── Master block type union ────────────────────────────────────────────────────

export type PuckBlockType =
  // Puck demo (12)
  | "Button" | "Card" | "Flex" | "Grid" | "Heading" | "Hero"
  | "Logos" | "RichText" | "Space" | "Stats" | "Template" | "Text"
  // chrispropmanagment (28)
  | "AboutSection" | "BookingSection" | "CanonicalBlocks" | "ComparisonSection"
  | "ContactSection" | "Content" | "CtaBanner" | "Divider" | "Elements"
  | "FaqSection" | "FeatureGrid" | "FooterSection"
  | "GuestyBookingConfirmation" | "GuestyBookingDashboard" | "GuestyBookingWidget"
  | "GuestyPropertyDetail" | "GuestyPropertyGrid" | "GuestyPropertySearch"
  | "Helpers" | "HeroSection" | "ImageGallery" | "ImageWithText"
  | "Layout" | "LogoBar" | "MaltaMapSection" | "MapSection"
  | "NewsletterSection" | "PricingTable" | "PropertyShowcase"
  | "ServicesSection" | "SocialProofStrip" | "Spacer" | "StatsSection"
  | "TeamSection" | "TestimonialSection" | "TextBlock"
  | "ThemeSettings" | "Timeline" | "VideoSection" | "WhyChooseUs";

export const BLOCK_TYPES: PuckBlockType[] = [
  // Puck demo
  "Button", "Card", "Flex", "Grid", "Heading", "Hero",
  "Logos", "RichText", "Space", "Stats", "Template", "Text",
  // Custom
  "AboutSection", "BookingSection", "CanonicalBlocks", "ComparisonSection",
  "ContactSection", "Content", "CtaBanner", "Divider", "Elements",
  "FaqSection", "FeatureGrid", "FooterSection",
  "GuestyBookingConfirmation", "GuestyBookingDashboard", "GuestyBookingWidget",
  "GuestyPropertyDetail", "GuestyPropertyGrid", "GuestyPropertySearch",
  "Helpers", "HeroSection", "ImageGallery", "ImageWithText",
  "Layout", "LogoBar", "MaltaMapSection", "MapSection",
  "NewsletterSection", "PricingTable", "PropertyShowcase",
  "ServicesSection", "SocialProofStrip", "Spacer", "StatsSection",
  "TeamSection", "TestimonialSection", "TextBlock",
  "ThemeSettings", "Timeline", "VideoSection", "WhyChooseUs",
];

export const CATEGORIES: Record<string, PuckBlockType[]> = {
  // Puck demo categories
  layout: ["Grid", "Flex", "Space", "Layout", "Spacer", "Divider"],
  typography: ["Heading", "Text", "RichText", "TextBlock", "Content"],
  interactive: ["Button", "CtaBanner", "NewsletterSection"],
  // chrispropmanagment categories
  hero: ["Hero", "HeroSection"],
  guesty: [
    "BookingSection", "GuestyBookingConfirmation", "GuestyBookingDashboard",
    "GuestyBookingWidget", "GuestyPropertyDetail", "GuestyPropertyGrid",
    "GuestyPropertySearch", "PropertyShowcase",
  ],
  media: ["ImageGallery", "ImageWithText", "VideoSection", "LogoBar", "Logos"],
  other: [
    "Card", "Template", "AboutSection", "CanonicalBlocks", "ComparisonSection",
    "ContactSection", "Elements", "FaqSection", "FeatureGrid", "FooterSection",
    "Helpers", "MaltaMapSection", "MapSection", "PricingTable",
    "ServicesSection", "SocialProofStrip", "Stats", "StatsSection",
    "TeamSection", "TestimonialSection", "ThemeSettings", "Timeline", "WhyChooseUs",
  ],
};

import { z as zod } from "zod";
export const BLOCK_SCHEMAS: Record<PuckBlockType, zod.ZodSchema<unknown>> = {
  // Puck demo
  Button: ButtonPropsSchema,
  Card: CardPropsSchema,
  Flex: FlexPropsSchema,
  Grid: GridPropsSchema,
  Heading: HeadingPropsSchema,
  Hero: HeroPropsSchema,
  Logos: LogosPropsSchema,
  RichText: RichTextPropsSchema,
  Space: SpacePropsSchema,
  Stats: StatsPropsSchema,
  Template: TemplatePropsSchema,
  Text: TextPropsSchema,
  // Custom
  AboutSection: AboutSectionPropsSchema,
  BookingSection: BookingSectionPropsSchema,
  CanonicalBlocks: CanonicalBlocksPropsSchema,
  ComparisonSection: ComparisonSectionPropsSchema,
  ContactSection: ContactSectionPropsSchema,
  Content: ContentPropsSchema,
  CtaBanner: CtaBannerPropsSchema,
  Divider: DividerPropsSchema,
  Elements: ElementsPropsSchema,
  FaqSection: FaqSectionPropsSchema,
  FeatureGrid: FeatureGridPropsSchema,
  FooterSection: FooterSectionPropsSchema,
  GuestyBookingConfirmation: GuestyBookingConfirmationPropsSchema,
  GuestyBookingDashboard: GuestyBookingDashboardPropsSchema,
  GuestyBookingWidget: GuestyBookingWidgetPropsSchema,
  GuestyPropertyDetail: GuestyPropertyDetailPropsSchema,
  GuestyPropertyGrid: GuestyPropertyGridPropsSchema,
  GuestyPropertySearch: GuestyPropertySearchPropsSchema,
  Helpers: HelpersPropsSchema,
  HeroSection: HeroSectionPropsSchema,
  ImageGallery: ImageGalleryPropsSchema,
  ImageWithText: ImageWithTextPropsSchema,
  Layout: LayoutPropsSchema,
  LogoBar: LogoBarPropsSchema,
  MaltaMapSection: MaltaMapSectionPropsSchema,
  MapSection: MapSectionPropsSchema,
  NewsletterSection: NewsletterSectionPropsSchema,
  PricingTable: PricingTablePropsSchema,
  PropertyShowcase: PropertyShowcasePropsSchema,
  ServicesSection: ServicesSectionPropsSchema,
  SocialProofStrip: SocialProofStripPropsSchema,
  Spacer: SpacerPropsSchema,
  StatsSection: StatsSectionPropsSchema,
  TeamSection: TeamSectionPropsSchema,
  TestimonialSection: TestimonialSectionPropsSchema,
  TextBlock: TextBlockPropsSchema,
  ThemeSettings: ThemeSettingsPropsSchema,
  Timeline: TimelinePropsSchema,
  VideoSection: VideoSectionPropsSchema,
  WhyChooseUs: WhyChooseUsPropsSchema,
};

/** Puck page data shape — matches UserData */
export const PuckPageDataSchema = z.object({
  content: z.array(z.object({
    type: z.string(),
    props: z.record(z.any()),
  })),
  root: z.object({
    props: z.object({ title: z.string().optional() }),
  }),
  zones: z.record(z.string(), z.array(z.object({
    type: z.string(),
    props: z.record(z.any()),
  }))).optional().default({}),
});

export type PuckPageData = z.infer<typeof PuckPageDataSchema>;

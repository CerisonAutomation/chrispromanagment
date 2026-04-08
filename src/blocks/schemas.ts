/**
 * @fileoverview Block Schemas — Zod-based schema definitions for all Puck blocks.
 * Single source of truth for block validation, AI generation, and editor field generation.
 */

import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const BLOCK_TYPES = [
  // Content Blocks
  'HeroSection',
  'Hero',
  'AboutSection',
  'WhyChooseUs',
  'ServicesSection',
  'PropertyShowcase',
  'BookingSection',
  'PricingTable',
  'TestimonialSection',
  'FaqSection',
  'ContactSection',
  'TeamSection',
  'VideoSection',
  'NewsletterSection',
  'ComparisonSection',
  'ImageWithText',
  'ImageGallery',
  'Timeline',
  'TextBlock',
  'FeatureGrid',
  'MapSection',
  // Layout Blocks
  'Divider',
  'Spacer',
  'LogoBar',
  'CtaBanner',
  'StatsSection',
  'SocialProofStrip',
  'FooterSection',
  'MaltaMapSection',
  'ThemeSettings',
  // Guesty Integration Blocks
  'GuestyPropertySearch',
  'GuestyPropertyGrid',
  'GuestyPropertyDetail',
  'GuestyBookingWidget',
  'GuestyBookingConfirmation',
  'GuestyBookingDashboard',
  // Layout Containers
  'Columns',
  'Container',
] as const;

export type PuckBlockType = typeof BLOCK_TYPES[number];

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const CATEGORIES: Record<string, PuckBlockType[]> = {
  'Hero & Headers': ['HeroSection', 'Hero', 'LogoBar'],
  'Content': [
    'AboutSection',
    'WhyChooseUs',
    'ServicesSection',
    'TeamSection',
    'VideoSection',
    'ImageWithText',
    'TextBlock',
    'FeatureGrid',
    'Timeline',
  ],
  'Properties & Booking': [
    'PropertyShowcase',
    'BookingSection',
    'GuestyPropertySearch',
    'GuestyPropertyGrid',
    'GuestyPropertyDetail',
    'GuestyBookingWidget',
    'GuestyBookingConfirmation',
    'GuestyBookingDashboard',
  ],
  'Pricing & Comparison': ['PricingTable', 'ComparisonSection'],
  'Social Proof': ['TestimonialSection', 'StatsSection', 'SocialProofStrip'],
  'Engagement': ['FaqSection', 'ContactSection', 'NewsletterSection', 'CtaBanner'],
  'Media': ['ImageGallery', 'MapSection', 'MaltaMapSection'],
  'Layout': ['Divider', 'Spacer', 'Columns', 'Container'],
  'Footer & Settings': ['FooterSection', 'ThemeSettings'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED SCHEMA PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════════

const urlSchema = z.string().url().optional().or(z.literal(''));
const hexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().or(z.literal(''));

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

export const HeroSectionSchema = z.object({
  title: z.string().max(80).default('Welcome to Our Property'),
  subtitle: z.string().max(300).default('Discover luxury living in Malta'),
  backgroundImage: urlSchema.default(''),
  ctaText: z.string().max(30).default('Learn More'),
  ctaLink: z.string().default('#about'),
});

export const HeroSchema = z.object({
  title: z.string().default('Build Stunning Websites'),
  subtitle: z.string().default('Without Code'),
  description: z.string().default('Create professional websites with our visual editor.'),
  primaryCta: z.string().default('Get Started'),
  primaryCtaLink: z.string().default('#signup'),
  secondaryCta: z.string().default('Learn More'),
  secondaryCtaLink: z.string().default('#features'),
  imageUrl: urlSchema.default(''),
  imageAlt: z.string().default('Hero image'),
  layout: z.enum(['split', 'center', 'background']).default('split'),
  backgroundColor: z.string().default('bg-white'),
  padding: z.number().min(40).max(200).default(100),
  showBadge: z.boolean().default(true),
  badgeText: z.string().default('New: AI-Powered Design'),
});

export const AboutSectionSchema = z.object({
  title: z.string().default('About Us'),
  description: z.string().max(2000).default('About description...'),
  imageUrl: urlSchema.default(''),
});

export const WhyChooseUsSchema = z.object({
  title: z.string().default('Why Choose Us?'),
  items: z.array(z.object({
    title: z.string().default('Feature'),
    description: z.string().default('Description'),
    icon: z.string().default('star'),
  })).default([]),
});

export const ServicesSectionSchema = z.object({
  title: z.string().default('What We Offer'),
  services: z.array(z.object({
    name: z.string().default('Service'),
    included: z.enum(['true', 'false']).default('true'),
  })).default([]),
  extras: z.array(z.object({
    name: z.string().default('Extra'),
    price: z.string().default(''),
  })).default([]),
  ctaText: z.string().default('View Pricing'),
  ctaLink: z.string().default('#pricing'),
});

export const PropertyShowcaseSchema = z.object({
  title: z.string().default('Our Properties'),
  properties: z.array(z.object({
    name: z.string().default('Property'),
    imageUrl: urlSchema.default(''),
    caption: z.string().default(''),
  })).default([]),
});

export const BookingSectionSchema = z.object({
  title: z.string().default('Book Your Stay'),
  subtitle: z.string().default('Check availability and book instantly.'),
  showPricingBreakdown: z.enum(['true', 'false']).default('true'),
  instantBookOnly: z.enum(['true', 'false']).default('true'),
});

export const PricingTableSchema = z.object({
  heading: z.string().default('Transparent Pricing'),
});

export const TestimonialSectionSchema = z.object({
  title: z.string().default('What Our Guests Say'),
  testimonials: z.array(z.object({
    name: z.string().default('Guest'),
    date: z.string().default(''),
    rating: z.enum(['1', '2', '3', '4', '5']).default('5'),
    quote: z.string().default('Great experience!'),
  })).default([]),
});

export const FaqSectionSchema = z.object({
  title: z.string().default('Frequently Asked Questions'),
  items: z.array(z.object({
    question: z.string().default('Question?'),
    answer: z.string().default('Answer.'),
  })).default([]),
});

export const ContactSectionSchema = z.object({
  title: z.string().default('Contact Us'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().default(''),
  whatsapp: z.string().default(''),
  location: z.string().default(''),
  mapLat: z.string().default(''),
  mapLng: z.string().default(''),
});

export const TeamSectionSchema = z.object({
  title: z.string().default('Meet the Team'),
  subtitle: z.string().default(''),
  members: z.array(z.object({
    name: z.string().default('Team Member'),
    role: z.string().default('Role'),
    bio: z.string().default(''),
    imageUrl: urlSchema.default(''),
  })).default([]),
});

export const VideoSectionSchema = z.object({
  title: z.string().default('Watch Our Story'),
  description: z.string().default(''),
  videoUrl: urlSchema.default(''),
  thumbnailUrl: urlSchema.default(''),
  aspectRatio: z.enum(['16:9', '4:3', '1:1']).default('16:9'),
});

export const NewsletterSectionSchema = z.object({
  heading: z.string().default('Stay in the Loop'),
  description: z.string().default('Subscribe to our newsletter.'),
  buttonText: z.string().default('Subscribe'),
  successMessage: z.string().default('Thank you for subscribing!'),
});

export const ComparisonSectionSchema = z.object({
  title: z.string().default('Compare Our Plans'),
  columns: z.array(z.object({
    heading: z.string().default('Plan'),
    description: z.string().default(''),
    highlighted: z.enum(['true', 'false']).default('false'),
    features: z.array(z.object({
      name: z.string().default('Feature'),
      included: z.enum(['true', 'false']).default('true'),
    })).default([]),
  })).default([]),
});

export const ImageWithTextSchema = z.object({
  title: z.string().default('Section Title'),
  description: z.string().default(''),
  imageUrl: urlSchema.default(''),
  layout: z.enum(['image-left', 'image-right', 'image-top']).default('image-left'),
  buttonText: z.string().default(''),
  buttonLink: z.string().default(''),
  badge: z.string().default(''),
});

export const ImageGallerySchema = z.object({
  title: z.string().default('Gallery'),
  images: z.array(z.object({
    url: urlSchema.default(''),
    alt: z.string().default('Image'),
  })).default([]),
  columns: z.enum(['2', '3', '4']).default('3'),
});

export const TimelineSchema = z.object({
  title: z.string().default('Our Journey'),
  items: z.array(z.object({
    year: z.string().default('2024'),
    title: z.string().default('Event'),
    description: z.string().default(''),
  })).default([]),
});

export const TextBlockSchema = z.object({
  content: z.string().default('Your text content here.'),
});

export const FeatureGridSchema = z.object({
  title: z.string().default('Key Features'),
  features: z.array(z.object({
    title: z.string().default('Feature'),
    description: z.string().default(''),
    icon: z.string().default('star'),
  })).default([]),
});

export const MapSectionSchema = z.object({
  title: z.string().default('Find Us'),
  address: z.string().default(''),
  latitude: z.string().default(''),
  longitude: z.string().default(''),
  zoom: z.enum(['12', '15', '18']).default('14'),
});

export const DividerSchema = z.object({
  title: z.string().default(''),
});

export const SpacerSchema = z.object({
  height: z.enum(['16', '32', '64', '96']).default('32'),
});

export const LogoBarSchema = z.object({
  title: z.string().default('Trusted Partners'),
  logoUrl: urlSchema.default(''),
});

export const CtaBannerSchema = z.object({
  heading: z.string().default('Partner with Confidence'),
  description: z.string().default(''),
  buttonText: z.string().default('Contact Us'),
  buttonLink: z.string().default('#contact'),
});

export const StatsSectionSchema = z.object({
  stats: z.array(z.object({
    value: z.string().default('100+'),
    label: z.string().default('Metric'),
  })).default([]),
});

export const SocialProofStripSchema = z.object({
  items: z.array(z.object({
    number: z.string().default('100'),
    label: z.string().default('Metric'),
    prefix: z.string().default(''),
    suffix: z.string().default('+'),
  })).default([]),
});

export const FooterSectionSchema = z.object({
  logoUrl: urlSchema.default(''),
  copyright: z.string().default('© 2024 Company Name'),
  email: z.string().default(''),
  phone: z.string().default(''),
});

export const MaltaMapSectionSchema = z.object({
  label: z.string().default(''),
  drawDuration: z.number().min(800).max(5000).default(2200),
  fillDelay: z.number().min(0).max(1000).default(250),
  sizeClass: z.string().default('w-44 h-32 sm:w-60 sm:h-44 md:w-72 md:h-52'),
  showBrand: z.enum(['true', 'false']).default('true'),
  backgroundStyle: z.enum(['transparent', 'dark', 'card', 'glow']).default('transparent'),
  paddingY: z.enum(['compact', 'normal', 'spacious']).default('normal'),
});

export const ThemeSettingsSchema = z.object({
  accentColor: hexColorSchema.default(''),
  backgroundShade: z.enum(['darkest', 'dark', 'medium']).default('darkest'),
});

// Guesty Blocks
export const GuestyPropertySearchSchema = z.object({
  title: z.string().default('Find Your Perfect Stay'),
  subtitle: z.string().default('Search our curated collection'),
  buttonText: z.string().default('Search Properties'),
});

export const GuestyPropertyGridSchema = z.object({
  title: z.string().default('Available Properties'),
  itemsPerPage: z.enum(['6', '9', '12']).default('6'),
  showFilters: z.enum(['true', 'false']).default('true'),
});

export const GuestyPropertyDetailSchema = z.object({
  defaultSlug: z.string().default(''),
});

export const GuestyBookingWidgetSchema = z.object({
  listingId: z.string().default(''),
  accountId: z.string().default(''),
  widgetMode: z.enum(['iframe', 'sdk']).default('iframe'),
  title: z.string().default('Book Your Stay'),
  subtitle: z.string().default(''),
  showTitle: z.boolean().default(true),
  primaryColor: hexColorSchema.default('#c8a96a'),
  locale: z.string().default('en'),
  currency: z.enum(['EUR', 'USD', 'GBP', 'CAD', 'AUD']).default('EUR'),
  minNights: z.number().min(1).max(30).default(2),
  defaultGuests: z.number().min(1).max(20).default(2),
});

export const GuestyBookingConfirmationSchema = z.object({
  title: z.string().default('Booking Confirmed!'),
  subtitle: z.string().default('Your reservation has been successfully placed.'),
});

export const GuestyBookingDashboardSchema = z.object({
  title: z.string().default('Booking Management'),
});

// Layout Containers
export const ColumnsSchema = z.object({
  columns: z.number().min(1).max(6).default(2),
  gap: z.number().min(0).max(100).default(32),
  padding: z.number().min(0).max(200).default(64),
  backgroundColor: z.string().default('white'),
});

export const ContainerSchema = z.object({
  maxWidth: z.string().default('80rem'),
  padding: z.number().min(0).max(200).default(64),
  backgroundColor: z.string().default('white'),
});

// ═══════════════════════════════════════════════════════════════════════════════
// SCHEMA REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

export const BLOCK_SCHEMAS: Record<PuckBlockType, z.ZodTypeAny> = {
  HeroSection: HeroSectionSchema,
  Hero: HeroSchema,
  AboutSection: AboutSectionSchema,
  WhyChooseUs: WhyChooseUsSchema,
  ServicesSection: ServicesSectionSchema,
  PropertyShowcase: PropertyShowcaseSchema,
  BookingSection: BookingSectionSchema,
  PricingTable: PricingTableSchema,
  TestimonialSection: TestimonialSectionSchema,
  FaqSection: FaqSectionSchema,
  ContactSection: ContactSectionSchema,
  TeamSection: TeamSectionSchema,
  VideoSection: VideoSectionSchema,
  NewsletterSection: NewsletterSectionSchema,
  ComparisonSection: ComparisonSectionSchema,
  ImageWithText: ImageWithTextSchema,
  ImageGallery: ImageGallerySchema,
  Timeline: TimelineSchema,
  TextBlock: TextBlockSchema,
  FeatureGrid: FeatureGridSchema,
  MapSection: MapSectionSchema,
  Divider: DividerSchema,
  Spacer: SpacerSchema,
  LogoBar: LogoBarSchema,
  CtaBanner: CtaBannerSchema,
  StatsSection: StatsSectionSchema,
  SocialProofStrip: SocialProofStripSchema,
  FooterSection: FooterSectionSchema,
  MaltaMapSection: MaltaMapSectionSchema,
  ThemeSettings: ThemeSettingsSchema,
  GuestyPropertySearch: GuestyPropertySearchSchema,
  GuestyPropertyGrid: GuestyPropertyGridSchema,
  GuestyPropertyDetail: GuestyPropertyDetailSchema,
  GuestyBookingWidget: GuestyBookingWidgetSchema,
  GuestyBookingConfirmation: GuestyBookingConfirmationSchema,
  GuestyBookingDashboard: GuestyBookingDashboardSchema,
  Columns: ColumnsSchema,
  Container: ContainerSchema,
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export function getBlockSchema(blockType: PuckBlockType): z.ZodTypeAny | null {
  return BLOCK_SCHEMAS[blockType] ?? null;
}

export function validateBlockProps<T>(blockType: PuckBlockType, props: unknown): T | null {
  const schema = BLOCK_SCHEMAS[blockType];
  if (!schema) return null;
  
  const result = schema.safeParse(props);
  return result.success ? (result.data as T) : null;
}

export function getBlockDefaults(blockType: PuckBlockType): Record<string, unknown> {
  const schema = BLOCK_SCHEMAS[blockType];
  if (!schema) return {};
  
  try {
    const result = schema.safeParse({});
    return result.success ? result.data : {};
  } catch {
    return {};
  }
}

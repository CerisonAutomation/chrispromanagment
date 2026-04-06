// =============================================================================
// CANONICAL BLOCKS INDEX - Single Source of Truth
// All 35 blocks exported with canonical structure
// =============================================================================

// =============================================================================
// BLOCK IMPORTS - All Puck Components (used for both exports and registry)
// =============================================================================

import {HeroSection} from "./hero-section";
import {AboutSection} from "./about-section";
import {WhyChooseUs} from "./why-choose-us";
import {ServicesSection} from "./services-section";
import {PropertyShowcase} from "./property-showcase";
import {BookingSection} from "./booking-section";
import {PricingTable} from "./pricing-table";
import {TestimonialSection} from "./testimonial-section";
import {FaqSection} from "./faq-section";
import {ContactSection} from "./contact-section";
import {LogoBar} from "./logo-bar";
import {CtaBanner} from "./cta-banner";
import {StatsSection} from "./stats-section";
import {FooterSection} from "./footer-section";
import {Divider} from "./divider";
import {GuestyPropertySearch} from "./guesty-property-search";
import {GuestyPropertyGrid} from "./guesty-property-grid";
import {GuestyPropertyDetail} from "./guesty-property-detail";
import {GuestyBookingWidget} from "./guesty-booking-widget";
import {GuestyBookingConfirmation} from "./guesty-booking-confirmation";
import {GuestyBookingDashboard} from "./guesty-booking-dashboard";
import {ImageGallery} from "./image-gallery";
import {Timeline} from "./timeline";
import {TextBlock} from "./text-block";
import {FeatureGrid} from "./feature-grid";
import {MapSection} from "./map-section";
import {Spacer} from "./spacer";
import {ThemeSettings} from "./theme-settings";
import {TeamSection} from "./team-section";
import {VideoSection} from "./video-section";
import {NewsletterSection} from "./newsletter-section";
import {ComparisonSection} from "./comparison-section";
import {ImageWithText} from "./image-with-text";
import {MaltaMapSection} from "./malta-map-section";
import {SocialProofStrip} from "./social-proof-strip";

// =============================================================================
// BLOCK EXPORTS
// =============================================================================

export {HeroSection};
export {AboutSection};
export {WhyChooseUs};
export {ServicesSection};
export {PropertyShowcase};
export {BookingSection};
export {PricingTable};
export {TestimonialSection};
export {FaqSection};
export {ContactSection};
export {LogoBar};
export {CtaBanner};
export {StatsSection};
export {FooterSection};
export {Divider};
export {GuestyPropertySearch};
export {GuestyPropertyGrid};
export {GuestyPropertyDetail};
export {GuestyBookingWidget};
export {GuestyBookingConfirmation};
export {GuestyBookingDashboard};
export {ImageGallery};
export {Timeline};
export {TextBlock};
export {FeatureGrid};
export {MapSection};
export {Spacer};
export {ThemeSettings};
export {TeamSection};
export {VideoSection};
export {NewsletterSection};
export {ComparisonSection};
export {ImageWithText};
export {MaltaMapSection};
export {SocialProofStrip};

// =============================================================================
// CANONICAL CATEGORY MAPPING
// =============================================================================

export const BLOCK_CATEGORIES = {
  Content: [
    "HeroSection",
    "AboutSection",
    "WhyChooseUs",
    "ServicesSection",
    "PropertyShowcase",
    "FaqSection",
    "ContactSection",
    "ImageWithText",
    "TextBlock",
    "ComparisonSection",
    "FeatureGrid",
  ],
  "Social Proof": [
    "TestimonialSection",
    "StatsSection",
    "LogoBar",
    "SocialProofStrip",
    "TeamSection",
  ],
  Media: [
    "ImageGallery",
    "VideoSection",
    "MapSection",
    "MaltaMapSection",
    "Timeline",
  ],
  Conversion: [
    "CtaBanner",
    "BookingSection",
    "NewsletterSection",
    "PricingTable",
  ],
  Layout: [
    "Divider",
    "Spacer",
    "FooterSection",
    "ThemeSettings",
  ],
  Guesty: [
    "GuestyPropertySearch",
    "GuestyPropertyGrid",
    "GuestyPropertyDetail",
    "GuestyBookingWidget",
    "GuestyBookingConfirmation",
    "GuestyBookingDashboard",
  ],
} as const;

// =============================================================================
// BLOCK REGISTRY - For dynamic lookup (uses imports from top of file)
// =============================================================================

export const BLOCK_REGISTRY = {
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
  ImageGallery,
  Timeline,
  TextBlock,
  FeatureGrid,
  MapSection,
  Spacer,
  ThemeSettings,
  TeamSection,
  VideoSection,
  NewsletterSection,
  ComparisonSection,
  ImageWithText,
  MaltaMapSection,
  SocialProofStrip,
} as const;

// =============================================================================
// CANONICAL CONFIG EXPORT - Matches puck.config.tsx
// =============================================================================

export const config = {
  categories: BLOCK_CATEGORIES,
  components: BLOCK_REGISTRY,
} as const;

export default config;

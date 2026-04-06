// =============================================================================
// CANONICAL BLOCKS INDEX - Single Source of Truth
// All 35 blocks exported with canonical structure
// =============================================================================

// =============================================================================
// BLOCK EXPORTS - All Puck Components
// =============================================================================

export {HeroSection} from "./hero-section";
export {AboutSection} from "./about-section";
export {WhyChooseUs} from "./why-choose-us";
export {ServicesSection} from "./services-section";
export {PropertyShowcase} from "./property-showcase";
export {BookingSection} from "./booking-section";
export {PricingTable} from "./pricing-table";
export {TestimonialSection} from "./testimonial-section";
export {FaqSection} from "./faq-section";
export {ContactSection} from "./contact-section";
export {LogoBar} from "./logo-bar";
export {CtaBanner} from "./cta-banner";
export {StatsSection} from "./stats-section";
export {FooterSection} from "./footer-section";
export {Divider} from "./divider";
export {GuestyPropertySearch} from "./guesty-property-search";
export {GuestyPropertyGrid} from "./guesty-property-grid";
export {GuestyPropertyDetail} from "./guesty-property-detail";
export {GuestyBookingWidget} from "./guesty-booking-widget";
export {GuestyBookingConfirmation} from "./guesty-booking-confirmation";
export {GuestyBookingDashboard} from "./guesty-booking-dashboard";
export {ImageGallery} from "./image-gallery";
export {Timeline} from "./timeline";
export {TextBlock} from "./text-block";
export {FeatureGrid} from "./feature-grid";
export {MapSection} from "./map-section";
export {Spacer} from "./spacer";
export {ThemeSettings} from "./theme-settings";
export {TeamSection} from "./team-section";
export {VideoSection} from "./video-section";
export {NewsletterSection} from "./newsletter-section";
export {ComparisonSection} from "./comparison-section";
export {ImageWithText} from "./image-with-text";
export {MaltaMapSection} from "./malta-map-section";
export {SocialProofStrip} from "./social-proof-strip";

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
// BLOCK REGISTRY - For dynamic lookup
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

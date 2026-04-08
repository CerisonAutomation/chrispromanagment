/**
 * Canonical block components for Puck CMS
 * Barrel export for all block components
 */

// Hero
export { Hero } from './hero';

// Content blocks
export { Features, Testimonials } from './content';

// Layout blocks
export { TextBlock } from './text-block';
export { Divider } from './divider';
export { Spacer, Columns, Container } from './layout';

// Marketing blocks
export { CtaBanner } from './cta-banner';
export { SocialProofStrip } from './social-proof-strip';

// Content display
export { ImageWithText } from './image-with-text';
export { ImageGallery, ImageGalleryBlock } from './image-gallery';
export { VideoSection } from './video-section';

// Navigation
export { FooterSection } from './footer-section';

// Social proof
export { TestimonialSection } from './testimonial-section';
export { StatsSection } from './stats-section';
export { FeatureGrid } from './feature-grid';

// Conversion
export { PricingTable } from './pricing-table';
export { FaqSection } from './faq-section';
export { TeamSection } from './team-section';
export { LogoBar } from './logo-bar';
export { NewsletterSection } from './newsletter-section';
export { Timeline } from './timeline';
export { WhyChooseUs } from './why-choose-us';
export { ComparisonSection } from './comparison-section';
export { ServicesSection } from './services-section';
export { AboutSection } from './about-section';
export { ContactSection } from './contact-section';
export { BookingSection } from './booking-section';

// Guesty blocks
export { GuestyPropertyGridBlock } from './guesty-property-grid';
export { GuestyPropertyDetailBlock } from './guesty-property-detail';
export { GuestyPropertySearchBlock } from './guesty-property-search';
export { GuestyBookingWidgetBlock } from './guesty-booking-widget';

// Stub for missing blocks that may be referenced
export const AllCanonicalBlocks: Record<string, any> = {};

// Default export
export default AllCanonicalBlocks;

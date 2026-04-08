/**
 * Canonical block registry barrel export.
 * ALL Puck blocks must be registered here — this is the single source of truth
 * imported by puck.config.tsx and the block renderer.
 */

// ─── Layout & Structure ───────────────────────────────────────────────────────────────────
export * from './layout';

// ─── Content Blocks ────────────────────────────────────────────────────────────────────
export * from './hero';
export * from './text-block';
export * from './content';
export * from './elements';
export * from './image-with-text';
export * from './image-gallery';
export * from './video-section';

// ─── Marketing & Conversion ──────────────────────────────────────────────────────────
export * from './cta-banner';
export * from './feature-grid';
export * from './stats-section';
export * from './social-proof-strip';
export * from './logo-bar';
export * from './testimonial-section';
export * from './pricing-table';
export * from './comparison-section';
export * from './why-choose-us';

// ─── Sections ───────────────────────────────────────────────────────────────────────
export * from './about-section';
export * from './services-section';
export * from './team-section';
export * from './faq-section';
export * from './contact-section';
export * from './newsletter-section';
export * from './timeline';
export * from './footer-section';
export * from './map-section';
export * from './malta-map-section';

// ─── Property & Booking ────────────────────────────────────────────────────────────────
export * from './property-showcase';
export * from './booking-section';

// ─── Guesty Integration Blocks ───────────────────────────────────────────────────────
export { GuestyBookingWidgetBlock } from './guesty-booking-widget';
export { GuestyPropertyGridBlock } from './guesty-property-grid';
export { GuestyPropertyDetailBlock } from './guesty-property-detail';
export { GuestyPropertySearchBlock } from './guesty-property-search';
export { GuestyBookingConfirmationBlock } from './guesty-booking-confirmation';
export { GuestyBookingDashboardBlock } from './guesty-booking-dashboard';

// Component exports (for use outside Puck)
export { GuestyBookingWidget } from './guesty-booking-widget';
export { GuestyPropertyGrid } from './guesty-property-grid';
export { GuestyPropertyDetail } from './guesty-property-detail';
export { GuestyPropertySearch } from './guesty-property-search';
export { GuestyBookingConfirmation } from './guesty-booking-confirmation';
export { GuestyBookingDashboard } from './guesty-booking-dashboard';

// ─── Theme & Meta ──────────────────────────────────────────────────────────────────────
export * from './theme-settings';

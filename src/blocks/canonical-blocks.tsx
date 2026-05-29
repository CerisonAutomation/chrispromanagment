/**
 * @fileoverview Canonical Blocks — Central export of all Puck block implementations.
 * This file provides a unified map of all block types to their implementations.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CONTENT BLOCKS
// ═══════════════════════════════════════════════════════════════════════════════

import { Hero, HeroSection } from './hero';
import { AboutSection } from './about-section';
import { WhyChooseUs } from './why-choose-us';
import { ServicesSection } from './services-section';
import { BookingSection } from './booking-section';
import { PricingTable } from './pricing-table';
import { TestimonialSection } from './testimonial-section';
import { FaqSection } from './faq-section';
import { ContactSection } from './contact-section';
import { TeamSection } from './team-section';
import { VideoSection } from './video-section';
import { NewsletterSection } from './newsletter-section';
import { ComparisonSection } from './comparison-section';
import { ImageWithText } from './image-with-text';
import { ImageGalleryBlock as ImageGallery } from './image-gallery';
import { Timeline } from './timeline';
import { TextBlock } from './text-block';
import { FeatureGrid } from './feature-grid';

// ═══════════════════════════════════════════════════════════════════════════════
// LAYOUT BLOCKS
// ═══════════════════════════════════════════════════════════════════════════════

import { Divider } from './divider';
import { Spacer, Columns, Container } from './layout';
import { LogoBar } from './logo-bar';
import { CtaBanner } from './cta-banner';
import { StatsSection } from './stats-section';
import { SocialProofStrip } from './social-proof-strip';
import { FooterSection } from './footer-section';
import { MaltaMapSection } from './malta-map-section';
import { ThemeSettings } from './theme-settings';

// ═══════════════════════════════════════════════════════════════════════════════
// GUESTY INTEGRATION BLOCKS
// ═══════════════════════════════════════════════════════════════════════════════

import { GuestyPropertySearchBlock as GuestyPropertySearch } from './guesty-property-search';
import { GuestyPropertyGridBlock as GuestyPropertyGrid } from './guesty-property-grid';
import { GuestyPropertyDetailBlock as GuestyPropertyDetail } from './guesty-property-detail';
import { GuestyBookingWidgetBlock as GuestyBookingWidget } from './guesty-booking-widget';
import { GuestyBookingConfirmationBlock as GuestyBookingConfirmation } from './guesty-booking-confirmation';
import { GuestyBookingDashboardBlock as GuestyBookingDashboard } from './guesty-booking-dashboard';

// ═══════════════════════════════════════════════════════════════════════════════
// PROPERTY SHOWCASE (inline block — no separate file dependency)
// ═══════════════════════════════════════════════════════════════════════════════

const PropertyShowcase = {
  label: 'Property Showcase',
  fields: {
    title: { type: 'text' as const },
    properties: {
      type: 'array' as const,
      label: 'Properties',
      defaultItemProps: { name: 'Property', imageUrl: '', caption: '' },
      arrayFields: {
        name: { type: 'text' as const },
        imageUrl: { type: 'text' as const, label: 'Image URL' },
        caption: { type: 'text' as const },
      },
    },
  },
  defaultProps: {
    title: 'Our Properties',
    properties: [],
  },
  render: (props: Record<string, unknown>) => {
    const { title, properties } = props as { title: string; properties: Array<{ name: string; imageUrl: string; caption: string }> };
    return (
      <section className="bg-cpm-bg-primary px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center font-[family-name:var(--font-heading)] text-3xl font-light text-cpm-text-primary">
            {title}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(properties || []).map((property, i) => (
              <div key={i} className="group overflow-hidden rounded-xl border border-cpm-border bg-cpm-bg-secondary">
                {property.imageUrl && (
                  <img
                    src={property.imageUrl}
                    alt={property.name}
                    className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-medium text-cpm-text-primary">{property.name}</h3>
                  {property.caption && (
                    <p className="mt-1 text-sm text-cpm-text-secondary">{property.caption}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  },
};

const MapSection = {
  label: 'Map Section',
  fields: {
    title: { type: 'text' as const },
    address: { type: 'text' as const },
    latitude: { type: 'text' as const, label: 'Latitude' },
    longitude: { type: 'text' as const, label: 'Longitude' },
    zoom: {
      type: 'select' as const,
      label: 'Zoom Level',
      options: [
        { label: 'City', value: '12' },
        { label: 'Street', value: '15' },
        { label: 'Building', value: '18' },
      ],
    },
  },
  defaultProps: {
    title: 'Find Us',
    address: 'Birkirkara, Malta',
    latitude: '35.8961327',
    longitude: '14.4644929',
    zoom: '15',
  },
  render: (props: Record<string, unknown>) => {
    const { title, address, latitude, longitude, zoom } = props as {
      title: string;
      address: string;
      latitude: string;
      longitude: string;
      zoom: string;
    };
    const lat = parseFloat(latitude) || 35.8961327;
    const lng = parseFloat(longitude) || 14.4644929;
    const z = parseInt(zoom) || 15;

    return (
      <section className="bg-cpm-bg-secondary px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center font-[family-name:var(--font-heading)] text-3xl font-light text-cpm-text-primary">
            {title}
          </h2>
          <div className="overflow-hidden rounded-xl border border-cpm-border">
            <iframe
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${lat}%2C${lng}!5e0!3m2!1sen!2s!4v1600000000000!5m2!1sen!2s&zoom=${z}`}
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map showing ${address}`}
            />
          </div>
          {address && (
            <p className="mt-4 text-center text-sm text-cpm-text-secondary">{address}</p>
          )}
        </div>
      </section>
    );
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED BLOCK REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * AllCanonicalBlocks — Map of all block types to their implementations.
 * Used by puck.config.tsx to wire up the CMS editor.
 */
export const AllCanonicalBlocks = {
  // Content Blocks
  Hero,
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
  TeamSection,
  VideoSection,
  NewsletterSection,
  ComparisonSection,
  ImageWithText,
  ImageGallery,
  Timeline,
  TextBlock,
  FeatureGrid,
  MapSection,

  // Layout Blocks
  Divider,
  Spacer,
  Columns,
  Container,
  LogoBar,
  CtaBanner,
  StatsSection,
  SocialProofStrip,
  FooterSection,
  MaltaMapSection,
  ThemeSettings,

  // Guesty Integration Blocks
  GuestyPropertySearch,
  GuestyPropertyGrid,
  GuestyPropertyDetail,
  GuestyBookingWidget,
  GuestyBookingConfirmation,
  GuestyBookingDashboard,
} as const;

// Re-export individual blocks for direct imports
export {
  Hero,
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
  TeamSection,
  VideoSection,
  NewsletterSection,
  ComparisonSection,
  ImageWithText,
  ImageGallery,
  Timeline,
  TextBlock,
  FeatureGrid,
  MapSection,
  Divider,
  Spacer,
  Columns,
  Container,
  LogoBar,
  CtaBanner,
  StatsSection,
  SocialProofStrip,
  FooterSection,
  MaltaMapSection,
  ThemeSettings,
  GuestyPropertySearch,
  GuestyPropertyGrid,
  GuestyPropertyDetail,
  GuestyBookingWidget,
  GuestyBookingConfirmation,
  GuestyBookingDashboard,
};

export type CanonicalBlockType = keyof typeof AllCanonicalBlocks;

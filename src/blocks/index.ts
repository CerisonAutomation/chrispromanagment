/**
 * Canonical blocks barrel — single import surface for puck.config.tsx.
 * All duplicate/legacy block files have been removed; every export here
 * maps 1-to-1 to a file in src/blocks/.
 * @module blocks
 */

// ─── Layout ──────────────────────────────────────────────────────────────────
export { HeroSection,            HeroSectionConfig }           from "./hero-section";
export { CtaBanner,              CtaBannerConfig }              from "./cta-banner";
export { FooterSection,          FooterSectionConfig }          from "./footer-section";
export { Layout,                 LayoutConfig }                 from "./layout";
export { Divider,                DividerConfig }                from "./divider";
export { Spacer,                 SpacerConfig }                 from "./spacer";

// ─── Content ─────────────────────────────────────────────────────────────────
export { AboutSection,           AboutSectionConfig }           from "./about-section";
export { ContentBlock,           ContentBlockConfig }           from "./content";
export { TextBlock,              TextBlockConfig }              from "./text-block";
export { ImageWithText,          ImageWithTextConfig }          from "./image-with-text";
export { VideoSection,           VideoSectionConfig }           from "./video-section";
export { Timeline,               TimelineConfig }               from "./timeline";

// ─── Property / Guesty ───────────────────────────────────────────────────────
export { PropertyShowcase,       PropertyShowcaseConfig }       from "./property-showcase";
export { BookingSection,         BookingSectionConfig }         from "./booking-section";
export { GuestyBookingWidget,    GuestyBookingWidgetConfig }    from "./guesty-booking-widget";
export { GuestyPropertyGrid,     GuestyPropertyGridConfig }     from "./guesty-property-grid";
export { GuestyPropertyDetail,   GuestyPropertyDetailConfig }  from "./guesty-property-detail";
export { GuestyPropertySearch,   GuestyPropertySearchConfig }  from "./guesty-property-search";
export { GuestyBookingDashboard, GuestyBookingDashboardConfig } from "./guesty-booking-dashboard";
export { GuestyBookingConfirmation, GuestyBookingConfirmationConfig } from "./guesty-booking-confirmation";
export { ImageGallery,           ImageGalleryConfig }           from "./image-gallery";

// ─── Sections ────────────────────────────────────────────────────────────────
export { ServicesSection,        ServicesSectionConfig }        from "./services-section";
export { TestimonialSection,     TestimonialSectionConfig }     from "./testimonial-section";
export { StatsSection,           StatsSectionConfig }           from "./stats-section";
export { FeatureGrid,            FeatureGridConfig }            from "./feature-grid";
export { FaqSection,             FaqSectionConfig }             from "./faq-section";
export { TeamSection,            TeamSectionConfig }            from "./team-section";
export { PricingTable,           PricingTableConfig }           from "./pricing-table";
export { ComparisonSection,      ComparisonSectionConfig }      from "./comparison-section";
export { WhyChooseUs,            WhyChooseUsConfig }            from "./why-choose-us";
export { SocialProofStrip,       SocialProofStripConfig }       from "./social-proof-strip";
export { NewsletterSection,      NewsletterSectionConfig }      from "./newsletter-section";
export { LogoBar,                LogoBarConfig }                from "./logo-bar";
export { ContactSection,         ContactSectionConfig }         from "./contact-section";

// ─── Media / Map ─────────────────────────────────────────────────────────────
export { MaltaMapSection,        MaltaMapSectionConfig }        from "./malta-map-section";
export { MapSection,             MapSectionConfig }             from "./map-section";

// ─── Theme / Elements ────────────────────────────────────────────────────────
export { ThemeSettings,          ThemeSettingsConfig }          from "./theme-settings";
export { Elements,               ElementsConfig }               from "./elements";

// ─── Canonical bundle (Puck AI preview renderer) ─────────────────────────────
export { default as CanonicalBlocks } from "./canonical-blocks";

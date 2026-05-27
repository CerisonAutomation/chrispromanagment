/**
 * ============================================================
 * ADVANCED GAME-CHANGER BLOCKS - CAROUSEL & PREMIUM FEATURES
 * ============================================================
 */

import { z } from 'zod';

// Advanced Schemas
export const ADVANCED_SCHEMAS = {
  // 🎠 CAROUSEL HERO
  carousel_hero: z.object({
    slides: z.array(z.object({
      image: z.string().url(),
      badge: z.string(),
      headline: z.string(),
      subheadline: z.string(),
      cta1Text: z.string(),
      cta1Link: z.string(),
      cta2Text: z.string().optional(),
      cta2Link: z.string().optional(),
    })).default([]),
    autoplay: z.boolean().default(true),
    interval: z.number().default(5000),
    showDots: z.boolean().default(true),
    showArrows: z.boolean().default(true),
    transitionEffect: z.enum(['fade', 'slide', 'zoom']).default('fade'),
  }),

  // 🎨 IMAGE CAROUSEL / GALLERY
  image_carousel: z.object({
    title: z.string(),
    images: z.array(z.object({
      src: z.string().url(),
      alt: z.string(),
      caption: z.string().optional(),
    })).default([]),
    layout: z.enum(['carousel', 'grid', 'masonry', 'fullscreen']).default('carousel'),
    autoplay: z.boolean().default(false),
    interval: z.number().default(4000),
    itemsPerView: z.number().default(1),
  }),

  // 💬 TESTIMONIAL CAROUSEL
  testimonial_carousel: z.object({
    title: z.string(),
    items: z.array(z.object({
      name: z.string(),
      role: z.string().optional(),
      avatar: z.string().url().optional(),
      rating: z.number().min(1).max(5),
      text: z.string(),
      date: z.string(),
    })).default([]),
    autoplay: z.boolean().default(true),
    interval: z.number().default(6000),
    showRating: z.boolean().default(true),
    style: z.enum(['card', 'quote', 'minimal']).default('card'),
  }),

  // 🏠 PROPERTY CAROUSEL
  property_carousel: z.object({
    title: z.string(),
    properties: z.array(z.object({
      id: z.string(),
      name: z.string(),
      location: z.string(),
      image: z.string().url(),
      price: z.string(),
      beds: z.number(),
      baths: z.number(),
      link: z.string(),
    })).default([]),
    itemsPerView: z.object({
      mobile: z.number().default(1),
      tablet: z.number().default(2),
      desktop: z.number().default(3),
    }),
    autoplay: z.boolean().default(false),
    showPrice: z.boolean().default(true),
  }),

  // 📊 STATS COUNTER (Animated)
  animated_stats: z.object({
    title: z.string(),
    stats: z.array(z.object({
      value: z.string(),
      label: z.string(),
      icon: z.string().optional(),
      suffix: z.string().optional(),
      prefix: z.string().optional(),
    })).default([]),
    animationDuration: z.number().default(2000),
    style: z.enum(['minimal', 'card', 'gradient', 'bold']).default('card'),
    columns: z.enum(['2', '3', '4', '5']).default('4'),
  }),

  // 🎬 VIDEO HERO
  video_hero: z.object({
    videoUrl: z.string().url(),
    posterImage: z.string().url().optional(),
    headline: z.string(),
    subheadline: z.string(),
    overlayOpacity: z.number().min(0).max(100).default(50),
    cta1Text: z.string(),
    cta1Link: z.string(),
    cta2Text: z.string().optional(),
    cta2Link: z.string().optional(),
    autoplay: z.boolean().default(true),
    loop: z.boolean().default(true),
    muted: z.boolean().default(true),
  }),

  // 🗺️ INTERACTIVE MAP WITH PINS
  interactive_map: z.object({
    title: z.string(),
    centerLat: z.number().default(35.9),
    centerLng: z.number().default(14.5),
    zoom: z.number().default(12),
    markers: z.array(z.object({
      lat: z.number(),
      lng: z.number(),
      title: z.string(),
      description: z.string(),
      image: z.string().url().optional(),
      link: z.string().optional(),
    })).default([]),
    style: z.enum(['standard', 'satellite', 'dark', 'light']).default('dark'),
    height: z.number().default(600),
  }),

  // 📧 ADVANCED CONTACT FORM
  advanced_form: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    fields: z.array(z.object({
      name: z.string(),
      label: z.string(),
      type: z.enum(['text', 'email', 'tel', 'textarea', 'select', 'checkbox', 'radio', 'file']),
      required: z.boolean().default(false),
      placeholder: z.string().optional(),
      options: z.array(z.string()).optional(),
    })).default([]),
    submitText: z.string().default('Submit'),
    successMessage: z.string(),
    redirectUrl: z.string().optional(),
    emailTo: z.string().email(),
  }),

  // ⏰ COUNTDOWN TIMER
  countdown: z.object({
    title: z.string(),
    description: z.string().optional(),
    targetDate: z.string(),
    showDays: z.boolean().default(true),
    showHours: z.boolean().default(true),
    showMinutes: z.boolean().default(true),
    showSeconds: z.boolean().default(true),
    style: z.enum(['minimal', 'bold', 'card']).default('bold'),
    onComplete: z.object({
      message: z.string(),
      redirectUrl: z.string().optional(),
    }).optional(),
  }),

  // 🎯 BEFORE/AFTER SLIDER
  before_after: z.object({
    title: z.string(),
    beforeImage: z.string().url(),
    afterImage: z.string().url(),
    beforeLabel: z.string().default('Before'),
    afterLabel: z.string().default('After'),
    startPosition: z.number().min(0).max(100).default(50),
  }),

  // 📱 SOCIAL FEED
  social_feed: z.object({
    title: z.string(),
    platform: z.enum(['instagram', 'twitter', 'facebook']),
    username: z.string(),
    limit: z.number().default(6),
    layout: z.enum(['grid', 'masonry', 'carousel']).default('grid'),
    showCaptions: z.boolean().default(true),
  }),

  // 🔥 PARALLAX SECTION
  parallax_section: z.object({
    backgroundImage: z.string().url(),
    title: z.string(),
    subtitle: z.string().optional(),
    content: z.string(),
    overlayOpacity: z.number().min(0).max(100).default(60),
    speed: z.number().min(0).max(1).default(0.5),
    height: z.enum(['auto', 'full', 'large', 'medium']).default('large'),
  }),
};

// Advanced Block Registry
export const ADVANCED_BLOCKS = {
  carousel_hero: {
    id: 'carousel_hero',
    name: '🎠 Carousel Hero',
    category: 'premium',
    icon: '🎠',
    schema: ADVANCED_SCHEMAS.carousel_hero,
    defaults: {
      autoplay: true,
      interval: 5000,
      showDots: true,
      showArrows: true,
      transitionEffect: 'fade',
      slides: [
        {
          image: 'https://images.unsplash.com/photo-1771218830084-fdd272e149a1?w=1920&q=80',
          badge: "Malta's Premier",
          headline: 'Luxury Property Management',
          subheadline: 'Full-service management across Malta & Gozo',
          cta1Text: 'Get Started',
          cta1Link: '/owners',
          cta2Text: 'View Properties',
          cta2Link: '/properties',
        },
        {
          image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1920&q=80',
          badge: 'Superhost Experience',
          headline: '9+ Years of Excellence',
          subheadline: 'Trusted by property owners across Malta',
          cta1Text: 'Learn More',
          cta1Link: '/owners',
          cta2Text: 'Contact Us',
          cta2Link: '#contact',
        },
      ],
    },
  },

  image_carousel: {
    id: 'image_carousel',
    name: '🎨 Image Carousel',
    category: 'media',
    icon: '🖼️',
    schema: ADVANCED_SCHEMAS.image_carousel,
    defaults: {
      title: 'Property Gallery',
      layout: 'carousel',
      autoplay: false,
      interval: 4000,
      itemsPerView: 1,
      images: [
        { src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200', alt: 'Modern apartment', caption: 'Sliema Luxury Apartment' },
        { src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200', alt: 'Villa exterior', caption: 'Valletta Penthouse' },
        { src: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200', alt: 'Interior design', caption: 'St Julians Modern Living' },
      ],
    },
  },

  testimonial_carousel: {
    id: 'testimonial_carousel',
    name: '💬 Testimonial Carousel',
    category: 'social',
    icon: '💬',
    schema: ADVANCED_SCHEMAS.testimonial_carousel,
    defaults: {
      title: 'What Our Clients Say',
      autoplay: true,
      interval: 6000,
      showRating: true,
      style: 'card',
      items: [
        {
          name: 'Katie',
          role: 'Property Owner',
          rating: 5,
          text: 'Christiano was an amazing host and the apartment was flawless. From the slippers to the birthday wine, everything was spot on.',
          date: 'October 2024',
        },
        {
          name: 'Eric',
          role: 'Guest',
          rating: 5,
          text: 'Christiano is a gracious, proactive host who made sure I had all the information I needed. Communication was excellent.',
          date: 'October 2024',
        },
      ],
    },
  },

  property_carousel: {
    id: 'property_carousel',
    name: '🏠 Property Carousel',
    category: 'properties',
    icon: '🏠',
    schema: ADVANCED_SCHEMAS.property_carousel,
    defaults: {
      title: 'Featured Properties',
      autoplay: false,
      showPrice: true,
      itemsPerView: { mobile: 1, tablet: 2, desktop: 3 },
      properties: [],
    },
  },

  animated_stats: {
    id: 'animated_stats',
    name: '📊 Animated Stats',
    category: 'data',
    icon: '📊',
    schema: ADVANCED_SCHEMAS.animated_stats,
    defaults: {
      title: 'Our Impact',
      animationDuration: 2000,
      style: 'card',
      columns: '4',
      stats: [
        { value: '2400000', prefix: '€', label: 'Revenue Generated', icon: 'TrendingUp' },
        { value: '45', suffix: '+', label: 'Properties Managed', icon: 'Home' },
        { value: '4.97', suffix: '★', label: 'Average Rating', icon: 'Star' },
        { value: '94', suffix: '%', label: 'Occupancy Rate', icon: 'Calendar' },
      ],
    },
  },

  video_hero: {
    id: 'video_hero',
    name: '🎬 Video Hero',
    category: 'premium',
    icon: '🎬',
    schema: ADVANCED_SCHEMAS.video_hero,
    defaults: {
      videoUrl: 'https://player.vimeo.com/video/example',
      posterImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920',
      headline: 'Experience Malta',
      subheadline: 'Luxury living in the Mediterranean',
      overlayOpacity: 50,
      cta1Text: 'Explore Now',
      cta1Link: '/properties',
      autoplay: true,
      loop: true,
      muted: true,
    },
  },

  before_after: {
    id: 'before_after',
    name: '🎯 Before/After',
    category: 'media',
    icon: '↔️',
    schema: ADVANCED_SCHEMAS.before_after,
    defaults: {
      title: 'Property Transformation',
      beforeImage: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200',
      afterImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
      beforeLabel: 'Before',
      afterLabel: 'After',
      startPosition: 50,
    },
  },

  countdown: {
    id: 'countdown',
    name: '⏰ Countdown Timer',
    category: 'conversion',
    icon: '⏰',
    schema: ADVANCED_SCHEMAS.countdown,
    defaults: {
      title: 'Special Offer Ends In',
      description: 'Book now and save 20%',
      targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      showDays: true,
      showHours: true,
      showMinutes: true,
      showSeconds: true,
      style: 'bold',
    },
  },
};

export const ADVANCED_CATEGORIES = [
  { id: 'premium', name: '⭐ Premium', icon: '⭐' },
  { id: 'carousel', name: '🎠 Carousels', icon: '🎠' },
  { id: 'interactive', name: '🎮 Interactive', icon: '🎮' },
];

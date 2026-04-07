'use client';

import React from 'react';
import Image from 'next/image';
import {Button} from '@/components/ui/button';
import {ArrowRight, Play} from 'lucide-react';

// =============================================================================
// HERO BLOCKS
// =============================================================================

export const HeroBlock = {
  label: "Hero Block",
  fields: {
    title: {
      type: 'text',
      label: 'Title',
    },
    subtitle: {
      type: 'text',
      label: 'Subtitle',
    },
    description: {
      type: 'textarea',
      label: 'Description',
    },
    primaryCta: {
      type: 'text',
      label: 'Primary CTA Text',
    },
    primaryCtaLink: {
      type: 'text',
      label: 'Primary CTA Link',
    },
    secondaryCta: {
      type: 'text',
      label: 'Secondary CTA Text',
    },
    secondaryCtaLink: {
      type: 'text',
      label: 'Secondary CTA Link',
    },
    imageUrl: {
      type: 'text',
      label: 'Hero Image URL',
    },
    imageAlt: {
      type: 'text',
      label: 'Image Alt Text',
    },
    layout: {
      type: 'select',
      label: 'Layout',
      options: [
        { label: 'Left Text, Right Image', value: 'split' },
        { label: 'Center Text, Below Image', value: 'center' },
        { label: 'Full Background', value: 'background' },
      ],
    },
    backgroundColor: {
      type: 'select',
      label: 'Background',
      options: [
        { label: 'White', value: 'bg-white' },
        { label: 'Light', value: 'bg-neutral-50' },
        { label: 'Dark', value: 'bg-neutral-900 text-white' },
        { label: 'Primary', value: 'bg-primary text-white' },
        { label: 'Gradient', value: 'bg-gradient-to-br from-primary to-primary-foreground' },
      ],
    },
    padding: {
      type: 'number',
      label: 'Padding (px)',
      min: 40,
      max: 200,
    },
    showBadge: {
      type: 'checkbox',
      label: 'Show Badge',
    },
    badgeText: {
      type: 'text',
      label: 'Badge Text',
    },
  },
  defaultProps: {
    title: 'Build Stunning Websites',
    subtitle: 'Without Code',
    description: 'Create professional, responsive websites with our visual editor. No coding required.',
    primaryCta: 'Get Started',
    primaryCtaLink: '#signup',
    secondaryCta: 'Learn More',
    secondaryCtaLink: '#features',
    imageUrl: '',
    imageAlt: 'Hero image',
    layout: 'split',
    backgroundColor: 'bg-white',
    padding: 100,
    showBadge: true,
    badgeText: 'New: AI-Powered Design',
  },
  render: (props: any) => {
    const {
      title, subtitle, description, primaryCta, primaryCtaLink,
      secondaryCta, secondaryCtaLink, imageUrl, imageAlt, layout,
      backgroundColor, padding, showBadge, badgeText,
    } = props;

    const isDark = backgroundColor?.includes('neutral-900') || backgroundColor?.includes('primary');

    if (layout === 'split') {
      return (
        <section className={`${backgroundColor} w-full`} style={{ padding: `${padding}px 0` }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                {showBadge && badgeText && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isDark ? 'bg-white/10 text-white' : 'bg-primary/10 text-primary'}`}>
                    {badgeText}
                  </span>
                )}
                <div>
                  <span className={`text-sm font-semibold tracking-wide uppercase ${isDark ? 'text-white/70' : 'text-primary'}`}>
                    {subtitle}
                  </span>
                  <h1 className={`mt-2 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                    {title}
                  </h1>
                </div>
                <p className={`text-lg ${isDark ? 'text-white/80' : 'text-neutral-600'}`}>
                  {description}
                </p>
                <div className="flex flex-wrap gap-4">
                  {primaryCta && (
                    <Button size="lg" asChild>
                      <a href={primaryCtaLink}>{primaryCta} <ArrowRight className="ml-2 h-4 w-4" /></a>
                    </Button>
                  )}
                  {secondaryCta && (
                    <Button size="lg" variant={isDark ? 'secondary' : 'outline'} asChild>
                      <a href={secondaryCtaLink}>{secondaryCta}</a>
                    </Button>
                  )}
                </div>
              </div>
              {imageUrl && (
                <div className="relative aspect-square lg:aspect-auto lg:h-[500px] rounded-2xl overflow-hidden">
                  <Image src={imageUrl} alt={imageAlt} fill className="object-cover" />
                </div>
              )}
            </div>
          </div>
        </section>
      );
    }

    if (layout === 'center') {
      return (
        <section className={`${backgroundColor} w-full`} style={{ padding: `${padding}px 0` }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {showBadge && badgeText && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isDark ? 'bg-white/10 text-white' : 'bg-primary/10 text-primary'}`}>
                {badgeText}
              </span>
            )}
            <div className="mt-4">
              <span className={`text-sm font-semibold tracking-wide uppercase ${isDark ? 'text-white/70' : 'text-primary'}`}>
                {subtitle}
              </span>
              <h1 className={`mt-2 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                {title}
              </h1>
            </div>
            <p className={`mt-6 text-lg max-w-2xl mx-auto ${isDark ? 'text-white/80' : 'text-neutral-600'}`}>
              {description}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {primaryCta && (
                <Button size="lg" asChild>
                  <a href={primaryCtaLink}>{primaryCta} <ArrowRight className="ml-2 h-4 w-4" /></a>
                </Button>
              )}
              {secondaryCta && (
                <Button size="lg" variant={isDark ? 'secondary' : 'outline'} asChild>
                  <a href={secondaryCtaLink}>{secondaryCta}</a>
                </Button>
              )}
            </div>
            {imageUrl && (
              <div className="mt-12 relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
                <Image src={imageUrl} alt={imageAlt} fill className="object-cover" />
              </div>
            )}
          </div>
        </section>
      );
    }

    // Background layout
    return (
      <section className={`${backgroundColor} w-full relative overflow-hidden`} style={{ padding: `${padding}px 0` }}>
        {imageUrl && (
          <div className="absolute inset-0 z-0">
            <Image src={imageUrl} alt={imageAlt} fill className="object-cover" />
            <div className="absolute inset-0 bg-black/50" />
          </div>
        )}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {showBadge && badgeText && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/10 text-white">
              {badgeText}
            </span>
          )}
          <div className="mt-4">
            <span className="text-sm font-semibold tracking-wide uppercase text-white/70">
              {subtitle}
            </span>
            <h1 className="mt-2 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              {title}
            </h1>
          </div>
          <p className="mt-6 text-lg max-w-2xl mx-auto text-white/80">
            {description}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {primaryCta && (
              <Button size="lg" variant="default" className="bg-white text-black hover:bg-white/90" asChild>
                <a href={primaryCtaLink}>{primaryCta} <ArrowRight className="ml-2 h-4 w-4" /></a>
              </Button>
            )}
            {secondaryCta && (
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                <a href={secondaryCtaLink}><Play className="mr-2 h-4 w-4" /> {secondaryCta}</a>
              </Button>
            )}
          </div>
        </div>
      </section>
    );
  },
};

// =============================================================================
// CTA BLOCK
// =============================================================================

export const CtaBlock = {
  label: "CTA Block",
  fields: {
    title: {
      type: 'text',
      label: 'Title',
    },
    description: {
      type: 'textarea',
      label: 'Description',
    },
    ctaText: {
      type: 'text',
      label: 'CTA Text',
    },
    ctaLink: {
      type: 'text',
      label: 'CTA Link',
    },
    backgroundColor: {
      type: 'select',
      label: 'Background',
      options: [
        { label: 'Primary', value: 'bg-primary' },
        { label: 'Dark', value: 'bg-neutral-900' },
        { label: 'Light', value: 'bg-neutral-100' },
        { label: 'Gradient', value: 'bg-gradient-to-r from-primary to-secondary' },
      ],
    },
    layout: {
      type: 'select',
      label: 'Layout',
      options: [
        { label: 'Center', value: 'center' },
        { label: 'Split', value: 'split' },
      ],
    },
  },
  defaultProps: {
    title: 'Ready to Get Started?',
    description: 'Join thousands of satisfied customers and transform your business today.',
    ctaText: 'Start Free Trial',
    ctaLink: '#signup',
    backgroundColor: 'bg-primary',
    layout: 'center',
  },
  render: ({ title, description, ctaText, ctaLink, backgroundColor, layout }: any) => {
    const isDark = !backgroundColor?.includes('neutral-100');
    
    return (
      <section className={`${backgroundColor} w-full py-20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`${layout === 'split' ? 'flex flex-col lg:flex-row items-center justify-between gap-8' : 'text-center'}`}>
            <div className={layout === 'split' ? 'lg:max-w-xl' : 'max-w-3xl mx-auto'}>
              <h2 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                {title}
              </h2>
              <p className={`mt-4 text-lg ${isDark ? 'text-white/80' : 'text-neutral-600'}`}>
                {description}
              </p>
            </div>
            <Button 
              size="lg" 
              className={isDark ? 'bg-white text-primary hover:bg-white/90' : ''}
              asChild
            >
              <a href={ctaLink}>{ctaText} <ArrowRight className="ml-2 h-4 w-4" /></a>
            </Button>
          </div>
        </div>
      </section>
    );
  },
};

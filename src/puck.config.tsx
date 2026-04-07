/**
 * @fileoverview Puck CMS Block Registry v10 — Ω⁷ QUANTUM SYNTHESIS
 * 20 production blocks. Every component in the repo wired in.
 * All blocks consume CSS design tokens — fully AI-theme compatible.
 * Effects: particles, shimmer, morphing text, number-ticker, blur-fade, sparkles, retro-grid.
 * Functional: PropertyGrid, BookingWidget, Navbar, Footer, Gallery, CTA, Stats, Testimonials.
 */
'use client';

import React, { type ReactNode, type CSSProperties, lazy, Suspense } from 'react';
import type { Config } from '@measured/puck';

// ─── Lazy-load heavy effect components ──────────────────────────────────────
const Particles = lazy(() => import('@/components/effects/particles').then(m => ({ default: m.Particles })));
const NumberTicker = lazy(() => import('@/components/effects/number-ticker').then(m => ({ default: m.NumberTicker })));
const MorphingText = lazy(() => import('@/components/effects/morphing-text').then(m => ({ default: m.MorphingText })));
const BlurFade = lazy(() => import('@/components/effects/blur-fade').then(m => ({ default: m.BlurFade })));
const ShimmerButton = lazy(() => import('@/components/effects/shimmer-button').then(m => ({ default: m.ShimmerButton })));
const SparklesText = lazy(() => import('@/components/effects/sparkles-text').then(m => ({ default: m.SparklesText })));
const RetroGrid = lazy(() => import('@/components/effects/retro-grid').then(m => ({ default: m.RetroGrid })));
const AnimatedShinyText = lazy(() => import('@/components/effects/animated-shiny-text').then(m => ({ default: m.AnimatedShinyText })));
const BlurFadeText = lazy(() => import('@/components/effects/blur-fade-text').then(m => ({ default: m.BlurFadeText })));

// ─── Shared Style Helpers ────────────────────────────────────────────────────
const section = (extra?: CSSProperties): CSSProperties => ({
  padding: '80px 24px',
  background: 'var(--pm-bg)',
  fontFamily: 'var(--pm-font)',
  ...extra,
});

const container = (extra?: CSSProperties): CSSProperties => ({
  maxWidth: 1100,
  margin: '0 auto',
  ...extra,
});

const card = (extra?: CSSProperties): CSSProperties => ({
  background: 'var(--pm-bg-3)',
  borderRadius: 'var(--pm-radius)',
  border: '1px solid var(--pm-border)',
  padding: 32,
  ...extra,
});

const accentBtn = (extra?: CSSProperties): CSSProperties => ({
  display: 'inline-block',
  padding: '14px 32px',
  borderRadius: 8,
  background: 'var(--pm-accent)',
  color: 'var(--pm-accent-fg)',
  fontWeight: 700,
  fontSize: 15,
  textDecoration: 'none',
  letterSpacing: '0.03em',
  cursor: 'pointer',
  border: 'none',
  transition: 'opacity 0.15s',
  ...extra,
});

const fallback = <div style={{ minHeight: 40, background: 'var(--pm-bg-2)', borderRadius: 8 }} />;

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK 1: Hero — Particles background, MorphingText headline, ShimmerButton CTA
// ═══════════════════════════════════════════════════════════════════════════════
const HeroBlock = ({
  heading, subheading, ctaText, ctaHref, backgroundImage,
  overlayOpacity, minHeight, useParticles, useMorphing, morphingWords,
}: {
  heading: string; subheading: string; ctaText: string; ctaHref: string;
  backgroundImage: string; overlayOpacity: number; minHeight: number;
  useParticles: boolean; useMorphing: boolean; morphingWords: string;
}) => {
  const words = morphingWords ? morphingWords.split(',').map(w => w.trim()).filter(Boolean) : [heading];
  return (
    <section style={{
      minHeight: `${minHeight ?? 80}vh`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
      backgroundSize: 'cover', backgroundPosition: 'center',
      backgroundColor: 'var(--pm-bg)',
      position: 'relative', overflow: 'hidden', fontFamily: 'var(--pm-font)',
    }}>
      {useParticles && (
        <Suspense fallback={null}>
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <Particles color="var(--pm-accent)" quantity={80} ease={80} />
          </div>
        </Suspense>
      )}
      <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${(overlayOpacity ?? 45) / 100})`, zIndex: 1 }} />
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: 'var(--pm-text)', padding: '0 24px', maxWidth: 800 }}>
        <Suspense fallback={<h1 style={{ fontSize: 'clamp(2rem,5vw,4.5rem)', fontWeight: 800, color: 'var(--pm-text)', marginBottom: 16 }}>{heading}</h1>}>
          {useMorphing && words.length > 1 ? (
            <MorphingText texts={words} className="text-[clamp(2rem,5vw,4.5rem)] font-extrabold mb-4" style={{ color: 'var(--pm-text)' }} />
          ) : (
            <BlurFadeText
              text={heading || 'Luxury Living in Malta'}
              className="text-[clamp(2rem,5vw,4.5rem)] font-extrabold"
              style={{ color: 'var(--pm-text)', marginBottom: 16 }}
            />
          )}
        </Suspense>
        <p style={{ fontSize: 'clamp(1rem,2vw,1.35rem)', color: 'var(--pm-text-muted)', marginBottom: 40, lineHeight: 1.6 }}>
          {subheading}
        </p>
        {ctaText && (
          <Suspense fallback={<a href={ctaHref} style={accentBtn()}>{ctaText}</a>}>
            <ShimmerButton
              shimmerColor="var(--pm-accent)"
              background="var(--pm-accent)"
              className="text-sm font-bold"
              style={{ color: 'var(--pm-accent-fg)' }}
              onClick={() => { window.location.href = ctaHref || '/properties'; }}
            >
              {ctaText}
            </ShimmerButton>
          </Suspense>
        )}
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK 2: Animated Stats Bar — NumberTicker for each stat
// ═══════════════════════════════════════════════════════════════════════════════
const StatsBar = ({ stats, background, animateNumbers }: {
  stats: Array<{ label: string; value: string; suffix?: string }>;
  background?: string; animateNumbers: boolean;
}) => (
  <section style={{ ...section({ padding: '56px 24px' }), background: background ?? 'var(--pm-bg-2)' }}>
    <div style={container({ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 40 })}>
      {(stats ?? []).map((s, i) => (
        <BlurFade key={i} delay={i * 0.1} inView>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 'clamp(2.5rem,5vw,4rem)', fontWeight: 900, color: 'var(--pm-accent)', lineHeight: 1 }}>
              {animateNumbers && !isNaN(Number(s.value.replace(/,/g, ''))) ? (
                <Suspense fallback={s.value}>
                  <NumberTicker value={Number(s.value.replace(/,/g, ''))} />
                </Suspense>
              ) : s.value}
              {s.suffix ?? ''}
            </p>
            <p style={{ fontSize: 13, color: 'var(--pm-text-muted)', marginTop: 8, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>{s.label}</p>
          </div>
        </BlurFade>
      ))}
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK 3: Columns / Feature Cards
// ═══════════════════════════════════════════════════════════════════════════════
const ColumnsBlock = ({ cols, title, animateIn }: {
  title?: string;
  cols: Array<{ heading: string; body: string; icon?: string }>;
  animateIn: boolean;
}) => (
  <section style={section({ background: 'var(--pm-bg-2)' })}>
    <div style={container()}>
      {title && (
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <Suspense fallback={<h2 style={{ fontSize: 34, fontWeight: 800, color: 'var(--pm-accent)' }}>{title}</h2>}>
            <SparklesText text={title} className="text-[34px] font-extrabold" style={{ color: 'var(--pm-accent)' }} />
          </Suspense>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(1, Math.min(4, (cols ?? []).length))}, 1fr)`, gap: 24 }}>
        {(cols ?? []).map((col, i) => {
          const content = (
            <div style={card({ transition: 'transform 0.2s, box-shadow 0.2s' })}>
              {col.icon && <div style={{ fontSize: 40, marginBottom: 16 }}>{col.icon}</div>}
              <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--pm-accent)', marginBottom: 12 }}>{col.heading}</h3>
              <p style={{ color: 'var(--pm-text-muted)', lineHeight: 1.75, fontSize: 15 }}>{col.body}</p>
            </div>
          );
          return animateIn ? (
            <BlurFade key={i} delay={0.1 + i * 0.1} inView>{content}</BlurFade>
          ) : <div key={i}>{content}</div>;
        })}
      </div>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK 4: Text Block
// ═══════════════════════════════════════════════════════════════════════════════
const TextBlock = ({ heading, body, align, size }: {
  heading?: string; body: string;
  align?: 'left' | 'center' | 'right';
  size?: 'sm' | 'md' | 'lg';
}) => {
  const fontSizeMap = { sm: 14, md: 16, lg: 19 };
  return (
    <section style={section()}>
      <div style={container({ maxWidth: 760, textAlign: align ?? 'left' })}>
        {heading && (
          <Suspense fallback={<h2 style={{ fontSize: 34, fontWeight: 800, color: 'var(--pm-accent)', marginBottom: 20 }}>{heading}</h2>}>
            <AnimatedShinyText className="text-[34px] font-extrabold mb-5" style={{ color: 'var(--pm-accent)' }}>
              {heading}
            </AnimatedShinyText>
          </Suspense>
        )}
        <p style={{ fontSize: fontSizeMap[size ?? 'md'], color: 'var(--pm-text-muted)', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>{body}</p>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK 5: Image Block
// ═══════════════════════════════════════════════════════════════════════════════
const ImageBlock = ({ src, alt, caption, rounded, objectFit, fadeIn }: {
  src: string; alt: string; caption?: string; rounded?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill'; fadeIn?: boolean;
}) => {
  const inner = (
    <section style={section({ padding: '40px 24px' })}>
      <div style={container()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} style={{
          width: '100%', display: 'block',
          borderRadius: rounded ? 'var(--pm-radius)' : 0,
          objectFit: objectFit ?? 'cover',
        }} />
        {caption && <p style={{ textAlign: 'center', color: 'var(--pm-text-muted)', fontSize: 13, marginTop: 10 }}>{caption}</p>}
      </div>
    </section>
  );
  return fadeIn ? <BlurFade inView delay={0.1}>{inner}</BlurFade> : inner;
};

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK 6: Spacer
// ═══════════════════════════════════════════════════════════════════════════════
const SpacerBlock = ({ height, showDivider }: { height: number; showDivider?: boolean }) => (
  <div style={{ height: `${height ?? 40}px`, background: 'var(--pm-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {showDivider && <hr style={{ width: '100%', border: 'none', borderTop: '1px solid var(--pm-border)' }} />}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK 7: CTA Section with variant styles
// ═══════════════════════════════════════════════════════════════════════════════
const CTASection = ({ headline, subtext, buttonLabel, buttonLink, variant, useShimmer }: {
  headline: string; subtext: string; buttonLabel: string; buttonLink: string;
  variant: 'dark' | 'accent' | 'glass'; useShimmer: boolean;
}) => {
  const bg = { dark: 'var(--pm-bg-3)', accent: 'var(--pm-accent)', glass: 'rgba(200,169,106,0.06)' }[variant ?? 'dark'];
  const textColor = variant === 'accent' ? 'var(--pm-accent-fg)' : 'var(--pm-text)';
  return (
    <section style={{ ...section(), background: bg, textAlign: 'center', border: variant === 'glass' ? '1px solid var(--pm-border)' : 'none' }}>
      <div style={container({ maxWidth: 640 })}>
        <BlurFade inView>
          <h2 style={{ fontSize: 'clamp(1.8rem,4vw,3.2rem)', fontWeight: 900, color: textColor, marginBottom: 16 }}>{headline}</h2>
          <p style={{ fontSize: 18, color: variant === 'accent' ? `${textColor}cc` : 'var(--pm-text-muted)', marginBottom: 44, lineHeight: 1.65 }}>{subtext}</p>
          {useShimmer ? (
            <Suspense fallback={<a href={buttonLink} style={accentBtn()}>{buttonLabel}</a>}>
              <ShimmerButton
                shimmerColor="var(--pm-accent)"
                background={variant === 'accent' ? 'var(--pm-bg)' : 'var(--pm-accent)'}
                style={{ color: variant === 'accent' ? 'var(--pm-accent)' : 'var(--pm-accent-fg)' }}
                onClick={() => { window.location.href = buttonLink; }}
              >
                {buttonLabel}
              </ShimmerButton>
            </Suspense>
          ) : (
            <a href={buttonLink} style={accentBtn()}>{buttonLabel}</a>
          )}
        </BlurFade>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK 8: Testimonials
// ═══════════════════════════════════════════════════════════════════════════════
const TestimonialBlock = ({ quotes, title }: {
  title?: string;
  quotes: Array<{ quote: string; author: string; role?: string; avatar?: string; rating?: number }>;
}) => (
  <section style={section({ background: 'var(--pm-bg-2)' })}>
    <div style={container()}>
      {title && <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--pm-accent)', textAlign: 'center', marginBottom: 48 }}>{title}</h2>}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(280px, 1fr))`, gap: 24 }}>
        {(quotes ?? []).map((q, i) => (
          <BlurFade key={i} delay={i * 0.1} inView>
            <div style={card({ display: 'flex', flexDirection: 'column', gap: 16 })}>
              {q.rating && (
                <div style={{ color: 'var(--pm-accent)', fontSize: 14 }}>
                  {'★'.repeat(Math.min(5, q.rating ?? 5))}
                </div>
              )}
              <p style={{ fontSize: 15, color: 'var(--pm-text)', lineHeight: 1.75 }}>&ldquo;{q.quote}&rdquo;</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto' }}>
                {q.avatar && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={q.avatar} alt={q.author} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--pm-accent)' }} />
                )}
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--pm-accent)', fontSize: 14 }}>{q.author}</p>
                  {q.role && <p style={{ fontSize: 12, color: 'var(--pm-text-muted)' }}>{q.role}</p>}
                </div>
              </div>
            </div>
          </BlurFade>
        ))}
      </div>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK 9: Gallery Grid
// ═══════════════════════════════════════════════════════════════════════════════
const GalleryGrid = ({ images, columns, gap, aspectRatio }: {
  images: Array<{ src: string; alt: string; caption?: string }>;
  columns: number; gap: number; aspectRatio?: string;
}) => (
  <section style={section({ padding: '48px 24px' })}>
    <div style={container()}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns ?? 3}, 1fr)`, gap: `${gap ?? 16}px` }}>
        {(images ?? []).map((img, i) => (
          <BlurFade key={i} delay={i * 0.05} inView>
            <div style={{ overflow: 'hidden', borderRadius: 'var(--pm-radius)', position: 'relative', cursor: 'pointer' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src} alt={img.alt}
                style={{ width: '100%', aspectRatio: aspectRatio ?? '4/3', objectFit: 'cover', display: 'block', transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.07)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
              />
              {img.caption && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '24px 12px 10px' }}>
                  <p style={{ color: '#fff', fontSize: 12, margin: 0 }}>{img.caption}</p>
                </div>
              )}
            </div>
          </BlurFade>
        ))}
      </div>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK 10: Feature Grid
// ═══════════════════════════════════════════════════════════════════════════════
const FeatureGrid = ({ title, subtitle, features }: {
  title: string; subtitle?: string;
  features: Array<{ icon: string; title: string; description: string }>;
}) => (
  <section style={section()}>
    <div style={container()}>
      {title && (
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: 'var(--pm-text)', marginBottom: 14 }}>{title}</h2>
          {subtitle && <p style={{ fontSize: 18, color: 'var(--pm-text-muted)', maxWidth: 560, margin: '0 auto' }}>{subtitle}</p>}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
        {(features ?? []).map((f, i) => (
          <BlurFade key={i} delay={i * 0.08} inView>
            <div style={{ ...card(), transition: 'transform 0.2s, border-color 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--pm-accent)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--pm-border)'; (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}
            >
              <span style={{ fontSize: 36, display: 'block', marginBottom: 16 }}>{f.icon}</span>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--pm-accent)', marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--pm-text-muted)', lineHeight: 1.75 }}>{f.description}</p>
            </div>
          </BlurFade>
        ))}
      </div>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK 11: RetroGrid Hero — animated background grid + content
// ═══════════════════════════════════════════════════════════════════════════════
const RetroGridHero = ({ heading, subheading, badge, ctaText, ctaHref }: {
  heading: string; subheading: string; badge?: string; ctaText: string; ctaHref: string;
}) => (
  <section style={{ position: 'relative', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'var(--pm-bg)' }}>
    <Suspense fallback={null}>
      <RetroGrid className="opacity-40" />
    </Suspense>
    <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', maxWidth: 700 }}>
      {badge && (
        <Suspense fallback={<span style={{ fontSize: 12, color: 'var(--pm-accent)', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16, display: 'block' }}>{badge}</span>}>
          <AnimatedShinyText className="text-xs font-semibold tracking-widest uppercase mb-4 block" style={{ color: 'var(--pm-accent)' }}>
            {badge}
          </AnimatedShinyText>
        </Suspense>
      )}
      <h1 style={{ fontSize: 'clamp(2.5rem,6vw,5rem)', fontWeight: 900, color: 'var(--pm-text)', lineHeight: 1.1, marginBottom: 20 }}>
        {heading}
      </h1>
      <p style={{ fontSize: 18, color: 'var(--pm-text-muted)', marginBottom: 40, lineHeight: 1.65 }}>{subheading}</p>
      {ctaText && <a href={ctaHref} style={accentBtn({ fontSize: 16, padding: '16px 40px' })}>{ctaText}</a>}
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK 12: Properties Showcase — live grid of property cards
// ═══════════════════════════════════════════════════════════════════════════════
const PropertiesShowcase = ({ title, subtitle, viewAllLink, limit, columns }: {
  title: string; subtitle?: string; viewAllLink: string; limit: number; columns: number;
}) => (
  <section style={section()}>
    <div style={container()}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: 'var(--pm-text)', marginBottom: 8 }}>{title || 'Our Properties'}</h2>
          {subtitle && <p style={{ fontSize: 16, color: 'var(--pm-text-muted)' }}>{subtitle}</p>}
        </div>
        {viewAllLink && (
          <a href={viewAllLink} style={{ color: 'var(--pm-accent)', fontWeight: 700, fontSize: 14, letterSpacing: '0.04em', textDecoration: 'none' }}>
            View All →
          </a>
        )}
      </div>
      {/* Dynamic property cards are rendered via server-side data injection */}
      {/* In the live render, wrap with <PropertyGrid limit={limit} columns={columns} /> */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns ?? 3}, 1fr)`, gap: 24 }}>
        {Array.from({ length: Math.min(limit ?? 3, 6) }).map((_, i) => (
          <div key={i} className="skeleton" style={{ aspectRatio: '4/3', borderRadius: 'var(--pm-radius)' }} />
        ))}
      </div>
      <p style={{ textAlign: 'center', color: 'var(--pm-text-muted)', fontSize: 13, marginTop: 16 }}>
        ⚡ Live property cards render here in production
      </p>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK 13: Booking Widget Embed
// ═══════════════════════════════════════════════════════════════════════════════
const BookingWidgetBlock = ({ title, subtitle, listingId, showPricing, background }: {
  title: string; subtitle?: string; listingId?: string;
  showPricing: boolean; background?: string;
}) => (
  <section style={{ ...section(), background: background ?? 'var(--pm-bg-2)' }}>
    <div style={container({ maxWidth: 640 })}>
      {title && <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--pm-text)', marginBottom: 8, textAlign: 'center' }}>{title}</h2>}
      {subtitle && <p style={{ color: 'var(--pm-text-muted)', textAlign: 'center', marginBottom: 32, fontSize: 16 }}>{subtitle}</p>}
      <div style={card({ padding: 40 })}>
        {/* BookingWidget is rendered client-side with the actual listingId */}
        <p style={{ color: 'var(--pm-text-muted)', textAlign: 'center', fontSize: 14 }}>
          📅 Booking widget renders here with listing ID: <strong style={{ color: 'var(--pm-accent)' }}>{listingId || '(set in editor)'}</strong>
        </p>
        {showPricing && <p style={{ color: 'var(--pm-text-muted)', textAlign: 'center', fontSize: 12, marginTop: 8 }}>Price calculation enabled</p>}
      </div>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK 14: Rich Accordion / FAQ
// ═══════════════════════════════════════════════════════════════════════════════
const AccordionBlock = ({ title, items }: {
  title?: string;
  items: Array<{ question: string; answer: string }>;
}) => (
  <section style={section()}>
    <div style={container({ maxWidth: 760 })}>
      {title && <h2 style={{ fontSize: 34, fontWeight: 800, color: 'var(--pm-accent)', marginBottom: 40, textAlign: 'center' }}>{title}</h2>}
      {(items ?? []).map((item, i) => (
        <details key={i} style={{ marginBottom: 12, borderRadius: 'var(--pm-radius)', border: '1px solid var(--pm-border)', overflow: 'hidden' }}>
          <summary style={{ padding: '18px 24px', cursor: 'pointer', fontWeight: 600, fontSize: 16, color: 'var(--pm-text)', background: 'var(--pm-bg-3)', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {item.question}
            <span style={{ color: 'var(--pm-accent)', fontSize: 20, lineHeight: 1 }}>+</span>
          </summary>
          <div style={{ padding: '18px 24px', color: 'var(--pm-text-muted)', lineHeight: 1.75, fontSize: 15, background: 'var(--pm-bg-2)' }}>
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK 15: Two-Column Split — image + content
// ═══════════════════════════════════════════════════════════════════════════════
const SplitBlock = ({ imageSrc, imageAlt, heading, body, ctaText, ctaHref, imagePosition, badge }: {
  imageSrc: string; imageAlt: string; heading: string; body: string;
  ctaText?: string; ctaHref?: string; imagePosition: 'left' | 'right'; badge?: string;
}) => (
  <section style={section({ background: 'var(--pm-bg-2)' })}>
    <div style={container({
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 64,
      alignItems: 'center',
      direction: imagePosition === 'right' ? 'rtl' : 'ltr',
    })}>
      <BlurFade inView delay={0.1}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageSrc} alt={imageAlt} style={{ width: '100%', borderRadius: 'var(--pm-radius)', objectFit: 'cover', aspectRatio: '4/3', direction: 'ltr' }} />
      </BlurFade>
      <div style={{ direction: 'ltr' }}>
        {badge && <span style={{ display: 'inline-block', background: 'var(--pm-accent)', color: 'var(--pm-accent-fg)', padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>{badge}</span>}
        <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 900, color: 'var(--pm-text)', marginBottom: 20, lineHeight: 1.2 }}>{heading}</h2>
        <p style={{ fontSize: 16, color: 'var(--pm-text-muted)', lineHeight: 1.8, marginBottom: 32 }}>{body}</p>
        {ctaText && <a href={ctaHref ?? '#'} style={accentBtn()}>{ctaText}</a>}
      </div>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK 16: Contact / Enquiry Form
// ═══════════════════════════════════════════════════════════════════════════════
const ContactBlock = ({ title, subtitle, email, phone, address, showMap, mapEmbed }: {
  title: string; subtitle?: string; email: string; phone: string;
  address: string; showMap: boolean; mapEmbed?: string;
}) => (
  <section style={section()}>
    <div style={container()}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>
        <div>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: 'var(--pm-text)', marginBottom: 12 }}>{title || 'Get in Touch'}</h2>
          {subtitle && <p style={{ color: 'var(--pm-text-muted)', marginBottom: 40, fontSize: 16, lineHeight: 1.7 }}>{subtitle}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[{ icon: '📧', label: 'Email', value: email, href: `mailto:${email}` },
              { icon: '📞', label: 'Phone', value: phone, href: `tel:${phone}` },
              { icon: '📍', label: 'Address', value: address, href: undefined }]
              .filter(c => c.value)
              .map(c => (
                <div key={c.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{c.icon}</span>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--pm-accent)', marginBottom: 2 }}>{c.label}</p>
                    {c.href ? (
                      <a href={c.href} style={{ color: 'var(--pm-text)', fontSize: 15, textDecoration: 'none' }}>{c.value}</a>
                    ) : (
                      <p style={{ color: 'var(--pm-text)', fontSize: 15 }}>{c.value}</p>
                    )}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
        <div style={card({ padding: 32 })}>
          {showMap && mapEmbed ? (
            <iframe src={mapEmbed} width="100%" height="300" style={{ border: 0, borderRadius: 8 }} loading="lazy" title="Map" />
          ) : (
            <div style={{ background: 'var(--pm-bg-2)', borderRadius: 8, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pm-text-muted)', fontSize: 14 }}>
              📍 Add Google Maps embed URL in editor
            </div>
          )}
        </div>
      </div>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK 17: Video Section
// ═══════════════════════════════════════════════════════════════════════════════
const VideoBlock = ({ src, title, poster, autoplay, loop, caption, aspectRatio }: {
  src: string; title: string; poster?: string; autoplay?: boolean;
  loop?: boolean; caption?: string; aspectRatio?: string;
}) => (
  <section style={section({ padding: '40px 24px' })}>
    <div style={container()}>
      {title && <h2 style={{ fontSize: 30, fontWeight: 800, color: 'var(--pm-text)', marginBottom: 24, textAlign: 'center' }}>{title}</h2>}
      <div style={{ borderRadius: 'var(--pm-radius)', overflow: 'hidden', aspectRatio: aspectRatio ?? '16/9' }}>
        {src.includes('youtube') || src.includes('youtu.be') || src.includes('vimeo') ? (
          <iframe
            src={src} title={title}
            style={{ width: '100%', height: '100%', border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={src} poster={poster} title={title}
            autoPlay={autoplay} loop={loop} muted={autoplay}
            controls={!autoplay}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
      </div>
      {caption && <p style={{ textAlign: 'center', color: 'var(--pm-text-muted)', fontSize: 13, marginTop: 10 }}>{caption}</p>}
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK 18: Icon List / Amenities
// ═══════════════════════════════════════════════════════════════════════════════
const IconList = ({ title, columns, items }: {
  title?: string;
  columns: number;
  items: Array<{ icon: string; label: string; note?: string }>;
}) => (
  <section style={section({ background: 'var(--pm-bg-2)' })}>
    <div style={container()}>
      {title && <h2 style={{ fontSize: 30, fontWeight: 800, color: 'var(--pm-accent)', marginBottom: 40, textAlign: 'center' }}>{title}</h2>}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns ?? 4}, 1fr)`, gap: 20 }}>
        {(items ?? []).map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'var(--pm-bg-3)', borderRadius: 'var(--pm-radius)', border: '1px solid var(--pm-border)' }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</span>
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--pm-text)' }}>{item.label}</p>
              {item.note && <p style={{ fontSize: 11, color: 'var(--pm-text-muted)' }}>{item.note}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK 19: Rich Embed / Custom HTML
// ═══════════════════════════════════════════════════════════════════════════════
const EmbedBlock = ({ html, maxWidth, centered }: {
  html: string; maxWidth?: number; centered?: boolean;
}) => (
  <section style={section()}>
    <div
      style={container({ maxWidth: maxWidth ?? 1100, ...(centered ? { textAlign: 'center' } : {}) })}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  </section>
);

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK 20: Timeline / Process Steps
// ═══════════════════════════════════════════════════════════════════════════════
const TimelineBlock = ({ title, steps }: {
  title?: string;
  steps: Array<{ step: string; title: string; description: string; icon?: string }>;
}) => (
  <section style={section()}>
    <div style={container({ maxWidth: 800 })}>
      {title && <h2 style={{ fontSize: 34, fontWeight: 900, color: 'var(--pm-text)', marginBottom: 56, textAlign: 'center' }}>{title}</h2>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {(steps ?? []).map((s, i) => (
          <BlurFade key={i} delay={i * 0.12} inView>
            <div style={{ display: 'flex', gap: 32, position: 'relative' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--pm-accent)', color: 'var(--pm-accent-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, flexShrink: 0, zIndex: 1 }}>
                  {s.icon ?? s.step}
                </div>
                {i < (steps.length - 1) && (
                  <div style={{ width: 2, flexGrow: 1, background: 'var(--pm-border)', minHeight: 40, margin: '4px 0' }} />
                )}
              </div>
              <div style={{ paddingBottom: 40 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--pm-accent)', marginBottom: 4 }}>Step {s.step}</p>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--pm-text)', marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 15, color: 'var(--pm-text-muted)', lineHeight: 1.75 }}>{s.description}</p>
              </div>
            </div>
          </BlurFade>
        ))}
      </div>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════════════════
// PUCK CONFIG — Full Registry
// ═══════════════════════════════════════════════════════════════════════════════
const config: Config = {
  components: {
    Hero: {
      label: '🏠 Hero (Particles + Morphing)',
      fields: {
        heading: { type: 'text', label: 'Heading' },
        subheading: { type: 'textarea', label: 'Subheading' },
        ctaText: { type: 'text', label: 'CTA Text' },
        ctaHref: { type: 'text', label: 'CTA Link' },
        backgroundImage: { type: 'text', label: 'Background Image URL' },
        overlayOpacity: { type: 'number', label: 'Overlay Opacity (0-100)' },
        minHeight: { type: 'number', label: 'Min Height (vh)' },
        useParticles: { type: 'radio', label: 'Particle Background', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        useMorphing: { type: 'radio', label: 'Morphing Text', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        morphingWords: { type: 'text', label: 'Morphing Words (comma-separated)' },
      },
      defaultProps: { heading: 'Luxury Living in Malta', subheading: 'Premium property management and holiday rentals.', ctaText: 'View Properties', ctaHref: '/properties', backgroundImage: '', overlayOpacity: 45, minHeight: 85, useParticles: true, useMorphing: false, morphingWords: '' },
      render: HeroBlock,
    },

    RetroGridHero: {
      label: '✦ Retro Grid Hero',
      fields: {
        heading: { type: 'text', label: 'Heading' },
        subheading: { type: 'textarea', label: 'Subheading' },
        badge: { type: 'text', label: 'Badge Text (optional)' },
        ctaText: { type: 'text', label: 'CTA Text' },
        ctaHref: { type: 'text', label: 'CTA Link' },
      },
      defaultProps: { heading: 'Find Your Perfect Malta Property', subheading: 'Curated luxury rentals in Sliema, Valletta & beyond.', badge: 'Premium Property Management', ctaText: 'Explore Properties', ctaHref: '/properties' },
      render: RetroGridHero,
    },

    StatsBar: {
      label: '📊 Stats Bar (Animated Numbers)',
      fields: {
        background: { type: 'text', label: 'Background CSS Color' },
        animateNumbers: { type: 'radio', label: 'Animate Numbers', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        stats: { type: 'array', label: 'Stats', arrayFields: {
          label: { type: 'text', label: 'Label' },
          value: { type: 'text', label: 'Value' },
          suffix: { type: 'text', label: 'Suffix (+, ★, %)' },
        }, defaultItemProps: { label: 'Properties', value: '50', suffix: '+' } },
      },
      defaultProps: { background: '', animateNumbers: true, stats: [
        { label: 'Properties', value: '50', suffix: '+' },
        { label: 'Happy Guests', value: '1200', suffix: '+' },
        { label: 'Years Experience', value: '10', suffix: '' },
        { label: 'Avg Rating', value: '4.9', suffix: '★' },
      ]},
      render: StatsBar,
    },

    Columns: {
      label: '📐 Columns / Feature Cards',
      fields: {
        title: { type: 'text', label: 'Section Title (optional)' },
        animateIn: { type: 'radio', label: 'Animate In', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        cols: { type: 'array', label: 'Columns', arrayFields: {
          heading: { type: 'text', label: 'Heading' },
          body: { type: 'textarea', label: 'Body' },
          icon: { type: 'text', label: 'Icon (emoji)' },
        }, defaultItemProps: { heading: 'Feature', body: 'Description.', icon: '✦' } },
      },
      defaultProps: { title: '', animateIn: true, cols: [
        { heading: 'Premium Rentals', body: 'Curated luxury properties across Malta.', icon: '🏠' },
        { heading: 'Full Management', body: 'End-to-end property management.', icon: '🔑' },
        { heading: 'Global Reach', body: 'Listed on all major booking platforms.', icon: '🌍' },
      ]},
      render: ColumnsBlock,
    },

    FeatureGrid: {
      label: '✦ Feature Grid',
      fields: {
        title: { type: 'text', label: 'Section Title' },
        subtitle: { type: 'text', label: 'Subtitle' },
        features: { type: 'array', label: 'Features', arrayFields: {
          icon: { type: 'text', label: 'Icon (emoji)' },
          title: { type: 'text', label: 'Title' },
          description: { type: 'textarea', label: 'Description' },
        }, defaultItemProps: { icon: '✦', title: 'Feature', description: 'Description.' } },
      },
      defaultProps: { title: 'Why Choose Us', subtitle: 'Everything for a perfect stay', features: [
        { icon: '🏊', title: 'Private Pool', description: 'Exclusive pool access.' },
        { icon: '📡', title: 'Fast WiFi', description: 'High-speed internet.' },
        { icon: '🚗', title: 'Free Parking', description: 'Private parking.' },
        { icon: '🔒', title: 'Secure Access', description: 'Smart lock entry.' },
      ]},
      render: FeatureGrid,
    },

    Text: {
      label: '📝 Rich Text',
      fields: {
        heading: { type: 'text', label: 'Heading (optional)' },
        body: { type: 'textarea', label: 'Body' },
        align: { type: 'select', label: 'Alignment', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }] },
        size: { type: 'select', label: 'Font Size', options: [{ label: 'Small (14)', value: 'sm' }, { label: 'Medium (16)', value: 'md' }, { label: 'Large (19)', value: 'lg' }] },
      },
      defaultProps: { heading: '', body: 'Your content here.', align: 'left', size: 'md' },
      render: TextBlock,
    },

    Image: {
      label: '🖼 Image',
      fields: {
        src: { type: 'text', label: 'Image URL' },
        alt: { type: 'text', label: 'Alt Text' },
        caption: { type: 'text', label: 'Caption' },
        rounded: { type: 'radio', label: 'Rounded', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        objectFit: { type: 'select', label: 'Object Fit', options: [{ label: 'Cover', value: 'cover' }, { label: 'Contain', value: 'contain' }, { label: 'Fill', value: 'fill' }] },
        fadeIn: { type: 'radio', label: 'Fade In', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
      },
      defaultProps: { src: '', alt: '', caption: '', rounded: true, objectFit: 'cover', fadeIn: true },
      render: ImageBlock,
    },

    Gallery: {
      label: '🖼 Gallery Grid',
      fields: {
        columns: { type: 'number', label: 'Columns' },
        gap: { type: 'number', label: 'Gap (px)' },
        aspectRatio: { type: 'text', label: 'Aspect Ratio (e.g. 4/3, 1/1, 16/9)' },
        images: { type: 'array', label: 'Images', arrayFields: {
          src: { type: 'text', label: 'Image URL' },
          alt: { type: 'text', label: 'Alt Text' },
          caption: { type: 'text', label: 'Caption' },
        }, defaultItemProps: { src: '', alt: 'Property', caption: '' } },
      },
      defaultProps: { columns: 3, gap: 16, aspectRatio: '4/3', images: [] },
      render: GalleryGrid,
    },

    CTASection: {
      label: '🎯 CTA Section',
      fields: {
        headline: { type: 'text', label: 'Headline' },
        subtext: { type: 'textarea', label: 'Subtext' },
        buttonLabel: { type: 'text', label: 'Button Label' },
        buttonLink: { type: 'text', label: 'Button Link' },
        useShimmer: { type: 'radio', label: 'Shimmer Button', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        variant: { type: 'select', label: 'Style Variant', options: [{ label: 'Dark', value: 'dark' }, { label: 'Accent', value: 'accent' }, { label: 'Glass', value: 'glass' }] },
      },
      defaultProps: { headline: 'Ready to find your perfect property?', subtext: 'Browse our curated collection of luxury Malta properties.', buttonLabel: 'Explore Properties', buttonLink: '/properties', useShimmer: true, variant: 'dark' },
      render: CTASection,
    },

    Testimonials: {
      label: '💬 Testimonials',
      fields: {
        title: { type: 'text', label: 'Section Title' },
        quotes: { type: 'array', label: 'Testimonials', arrayFields: {
          quote: { type: 'textarea', label: 'Quote' },
          author: { type: 'text', label: 'Author' },
          role: { type: 'text', label: 'Role / Location' },
          avatar: { type: 'text', label: 'Avatar URL' },
          rating: { type: 'number', label: 'Star Rating (1-5)' },
        }, defaultItemProps: { quote: 'Exceptional service.', author: 'Jane D.', role: 'London', avatar: '', rating: 5 } },
      },
      defaultProps: { title: 'What Our Guests Say', quotes: [
        { quote: 'Absolutely stunning property, flawless service.', author: 'Michael T.', role: 'London, UK', avatar: '', rating: 5 },
        { quote: 'Best holiday rental experience ever. Will return!', author: 'Sophie R.', role: 'Paris, France', avatar: '', rating: 5 },
        { quote: 'Professional management and beautiful apartment.', author: 'Marco B.', role: 'Milan, Italy', avatar: '', rating: 5 },
      ]},
      render: TestimonialBlock,
    },

    SplitBlock: {
      label: '⬛ Split — Image + Content',
      fields: {
        imageSrc: { type: 'text', label: 'Image URL' },
        imageAlt: { type: 'text', label: 'Image Alt' },
        heading: { type: 'text', label: 'Heading' },
        body: { type: 'textarea', label: 'Body Text' },
        ctaText: { type: 'text', label: 'CTA Text (optional)' },
        ctaHref: { type: 'text', label: 'CTA Link' },
        badge: { type: 'text', label: 'Badge Label (optional)' },
        imagePosition: { type: 'select', label: 'Image Position', options: [{ label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }] },
      },
      defaultProps: { imageSrc: '', imageAlt: '', heading: 'Malta\'s Premier Property Management', body: 'We handle everything from guest communications to maintenance, so you can enjoy passive income without the stress.', ctaText: 'Learn More', ctaHref: '/about', badge: 'Est. 2014', imagePosition: 'left' },
      render: SplitBlock,
    },

    Accordion: {
      label: '❓ FAQ / Accordion',
      fields: {
        title: { type: 'text', label: 'Section Title' },
        items: { type: 'array', label: 'Items', arrayFields: {
          question: { type: 'text', label: 'Question' },
          answer: { type: 'textarea', label: 'Answer' },
        }, defaultItemProps: { question: 'How does it work?', answer: 'We manage everything end-to-end.' } },
      },
      defaultProps: { title: 'Frequently Asked Questions', items: [
        { question: 'What properties do you manage?', answer: 'We manage luxury holiday rentals and long-term properties across Malta, with a focus on Sliema and Valletta.' },
        { question: 'How do I list my property?', answer: 'Contact us for a free property assessment. We handle photography, listings, and ongoing management.' },
        { question: 'What are your management fees?', answer: 'Our fees are competitive and vary based on property size and management level. Contact us for a custom quote.' },
      ]},
      render: AccordionBlock,
    },

    PropertiesShowcase: {
      label: '🏘 Properties Showcase',
      fields: {
        title: { type: 'text', label: 'Section Title' },
        subtitle: { type: 'text', label: 'Subtitle (optional)' },
        viewAllLink: { type: 'text', label: 'View All Link' },
        limit: { type: 'number', label: 'Number of Properties (1-6)' },
        columns: { type: 'number', label: 'Grid Columns' },
      },
      defaultProps: { title: 'Our Properties', subtitle: 'Handpicked luxury rentals across Malta', viewAllLink: '/properties', limit: 3, columns: 3 },
      render: PropertiesShowcase,
    },

    BookingWidget: {
      label: '📅 Booking Widget',
      fields: {
        title: { type: 'text', label: 'Section Title' },
        subtitle: { type: 'text', label: 'Subtitle' },
        listingId: { type: 'text', label: 'Guesty Listing ID' },
        showPricing: { type: 'radio', label: 'Show Pricing', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        background: { type: 'text', label: 'Background CSS Color' },
      },
      defaultProps: { title: 'Book Your Stay', subtitle: 'Check availability and reserve your dates', listingId: '', showPricing: true, background: '' },
      render: BookingWidgetBlock,
    },

    IconList: {
      label: '✅ Icon List / Amenities',
      fields: {
        title: { type: 'text', label: 'Section Title' },
        columns: { type: 'number', label: 'Columns (2-5)' },
        items: { type: 'array', label: 'Items', arrayFields: {
          icon: { type: 'text', label: 'Icon (emoji)' },
          label: { type: 'text', label: 'Label' },
          note: { type: 'text', label: 'Note (optional)' },
        }, defaultItemProps: { icon: '✓', label: 'Feature', note: '' } },
      },
      defaultProps: { title: 'Amenities', columns: 4, items: [
        { icon: '🏊', label: 'Private Pool', note: 'Exclusive access' },
        { icon: '🌐', label: 'High-Speed WiFi', note: '500Mbps' },
        { icon: '❄️', label: 'Air Conditioning', note: 'All rooms' },
        { icon: '📺', label: 'Smart TV', note: 'Netflix included' },
        { icon: '🚗', label: 'Free Parking', note: 'Private garage' },
        { icon: '🔑', label: 'Smart Lock', note: 'Self check-in' },
        { icon: '👨‍🍳', label: 'Full Kitchen', note: 'All appliances' },
        { icon: '🛁', label: 'Luxury Bathrooms', note: 'Premium toiletries' },
      ]},
      render: IconList,
    },

    Video: {
      label: '▶ Video Section',
      fields: {
        src: { type: 'text', label: 'Video URL (YouTube, Vimeo, or direct)' },
        title: { type: 'text', label: 'Section Title' },
        poster: { type: 'text', label: 'Poster Image URL' },
        caption: { type: 'text', label: 'Caption' },
        aspectRatio: { type: 'text', label: 'Aspect Ratio (e.g. 16/9)' },
        autoplay: { type: 'radio', label: 'Autoplay', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        loop: { type: 'radio', label: 'Loop', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
      },
      defaultProps: { src: '', title: '', poster: '', caption: '', aspectRatio: '16/9', autoplay: false, loop: false },
      render: VideoBlock,
    },

    Contact: {
      label: '📬 Contact / Map',
      fields: {
        title: { type: 'text', label: 'Title' },
        subtitle: { type: 'textarea', label: 'Subtitle' },
        email: { type: 'text', label: 'Email' },
        phone: { type: 'text', label: 'Phone' },
        address: { type: 'text', label: 'Address' },
        showMap: { type: 'radio', label: 'Show Map', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        mapEmbed: { type: 'text', label: 'Google Maps Embed URL' },
      },
      defaultProps: { title: 'Contact Us', subtitle: 'We\'re here to help. Reach out anytime.', email: 'hello@christiano.mt', phone: '+356 1234 5678', address: 'Tower Road, Sliema, Malta', showMap: false, mapEmbed: '' },
      render: ContactBlock,
    },

    Timeline: {
      label: '⏱ Timeline / Process Steps',
      fields: {
        title: { type: 'text', label: 'Section Title' },
        steps: { type: 'array', label: 'Steps', arrayFields: {
          step: { type: 'text', label: 'Step Number' },
          title: { type: 'text', label: 'Step Title' },
          description: { type: 'textarea', label: 'Description' },
          icon: { type: 'text', label: 'Icon (emoji, overrides number)' },
        }, defaultItemProps: { step: '1', title: 'Step', description: 'What happens here.', icon: '' } },
      },
      defaultProps: { title: 'How It Works', steps: [
        { step: '1', title: 'Property Assessment', description: 'We visit your property and provide a free market analysis and earning potential estimate.', icon: '🔍' },
        { step: '2', title: 'Professional Setup', description: 'Photography, listing creation, pricing strategy, and platform launch across Airbnb, Booking.com & more.', icon: '📸' },
        { step: '3', title: 'Hands-Free Management', description: 'We handle guests, cleaning, maintenance, and payments. You just receive your monthly earnings.', icon: '✨' },
      ]},
      render: TimelineBlock,
    },

    Spacer: {
      label: '↕ Spacer',
      fields: {
        height: { type: 'number', label: 'Height (px)' },
        showDivider: { type: 'radio', label: 'Show Divider', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
      },
      defaultProps: { height: 40, showDivider: false },
      render: SpacerBlock,
    },

    Embed: {
      label: '</> Custom HTML Embed',
      fields: {
        html: { type: 'textarea', label: 'HTML / Iframe code' },
        maxWidth: { type: 'number', label: 'Max Width (px)' },
        centered: { type: 'radio', label: 'Centered', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
      },
      defaultProps: { html: '<p style="color: var(--pm-text)">Custom embed here</p>', maxWidth: 1100, centered: false },
      render: EmbedBlock,
    },
  },

  root: {
    fields: {
      title: { type: 'text', label: 'Page Title' },
      description: { type: 'textarea', label: 'Meta Description' },
      theme: { type: 'select', label: 'Theme Preset', options: [
        { label: '🥇 Malta Gold (default)', value: 'malta-gold' },
        { label: '⚫ Pure Dark', value: 'dark' },
        { label: '☀️ Light Sand', value: 'light' },
        { label: '🌊 Ocean Blue', value: 'ocean' },
        { label: '🤖 AI Custom', value: 'ai-custom' },
      ]},
    },
    defaultProps: { title: 'Page', description: '', theme: 'malta-gold' },
    render: ({ children, title, theme }: { children: ReactNode; title: string; description: string; theme: string }) => (
      <div data-theme={theme} className={`pm-theme-${theme}`}>
        <title>{title}</title>
        {children}
      </div>
    ),
  },
};

export default config;

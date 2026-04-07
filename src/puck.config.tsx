/**
 * @fileoverview Puck visual editor config — canonical block registry v9.
 * Production-hardened: inline editing, design tokens, 8 premium blocks.
 * All blocks consume CSS custom properties for full AI-theme compatibility.
 */
'use client';

import type { Config } from '@measured/puck';
import type { ReactNode, CSSProperties } from 'react';

// ─── Design Token Defaults ──────────────────────────────────────────────────
// These are overridden by the AIThemeCreator via CSS vars on :root
export const DEFAULT_TOKENS = {
  '--pm-bg': '#0e0f11',
  '--pm-bg-2': '#111214',
  '--pm-bg-3': '#1a1b1f',
  '--pm-border': '#2a2b30',
  '--pm-accent': '#c8a96a',
  '--pm-accent-fg': '#0e0f11',
  '--pm-text': '#e8e4dc',
  '--pm-text-muted': '#e8e4dc80',
  '--pm-radius': '12px',
  '--pm-font': "'Inter', system-ui, sans-serif",
} as const;

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
  transition: 'opacity 0.15s',
  cursor: 'pointer',
  ...extra,
});

// ─── Block: Hero ─────────────────────────────────────────────────────────────
const HeroBlock = ({
  heading, subheading, ctaText, ctaHref, backgroundImage, overlayOpacity, minHeight,
}: {
  heading: string; subheading: string; ctaText: string; ctaHref: string;
  backgroundImage: string; overlayOpacity: number; minHeight: number;
}) => (
  <section style={{
    minHeight: `${minHeight ?? 80}vh`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
    backgroundSize: 'cover', backgroundPosition: 'center',
    backgroundColor: 'var(--pm-bg)',
    position: 'relative', fontFamily: 'var(--pm-font)',
  }}>
    <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${(overlayOpacity ?? 45) / 100})` }} />
    <div style={{ position: 'relative', textAlign: 'center', color: 'var(--pm-text)', padding: '0 24px', maxWidth: 760 }}>
      <h1 style={{ fontSize: 'clamp(2rem,5vw,4rem)', fontWeight: 800, marginBottom: 16, lineHeight: 1.15, color: 'var(--pm-text)' }}>
        {heading || 'Luxury Living in Malta'}
      </h1>
      <p style={{ fontSize: 'clamp(1rem,2vw,1.35rem)', color: 'var(--pm-text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
        {subheading || 'Premium property management.'}
      </p>
      {ctaText && (
        <a href={ctaHref || '/properties'} style={accentBtn()}>
          {ctaText}
        </a>
      )}
    </div>
  </section>
);

// ─── Block: Columns ──────────────────────────────────────────────────────────
const ColumnsBlock = ({ cols, title }: {
  title?: string;
  cols: Array<{ heading: string; body: string; icon?: string }>;
}) => (
  <section style={section({ background: 'var(--pm-bg-2)' })}>
    <div style={container()}>
      {title && <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--pm-accent)', marginBottom: 48, textAlign: 'center' }}>{title}</h2>}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(1, Math.min(4, (cols ?? []).length))}, 1fr)`, gap: 24 }}>
        {(cols ?? []).map((col, i) => (
          <div key={i} style={card()}>
            {col.icon && <div style={{ fontSize: 36, marginBottom: 16 }}>{col.icon}</div>}
            <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--pm-accent)', marginBottom: 12 }}>{col.heading}</h3>
            <p style={{ color: 'var(--pm-text-muted)', lineHeight: 1.7, fontSize: 15 }}>{col.body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Block: Text ─────────────────────────────────────────────────────────────
const TextBlock = ({ heading, body, align, size }: {
  heading?: string; body: string;
  align?: 'left' | 'center' | 'right';
  size?: 'sm' | 'md' | 'lg';
}) => {
  const fontSizeMap = { sm: 14, md: 16, lg: 18 };
  return (
    <section style={section()}>
      <div style={container({ maxWidth: 760, textAlign: align ?? 'left' })}>
        {heading && <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--pm-accent)', marginBottom: 16 }}>{heading}</h2>}
        <p style={{ fontSize: fontSizeMap[size ?? 'md'], color: 'var(--pm-text-muted)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{body}</p>
      </div>
    </section>
  );
};

// ─── Block: Image ────────────────────────────────────────────────────────────
const ImageBlock = ({ src, alt, caption, rounded, objectFit }: {
  src: string; alt: string; caption?: string; rounded?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill';
}) => (
  <section style={section({ padding: '32px 24px' })}>
    <div style={container()}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} style={{
        width: '100%', display: 'block',
        borderRadius: rounded ? 'var(--pm-radius)' : 0,
        objectFit: objectFit ?? 'cover',
      }} />
      {caption && <p style={{ textAlign: 'center', color: 'var(--pm-text-muted)', fontSize: 13, marginTop: 8 }}>{caption}</p>}
    </div>
  </section>
);

// ─── Block: Spacer ───────────────────────────────────────────────────────────
const SpacerBlock = ({ height }: { height: number }) => (
  <div style={{ height: `${height ?? 40}px`, background: 'var(--pm-bg)' }} />
);

// ─── Block: CTA Section ──────────────────────────────────────────────────────
const CTASection = ({ headline, subtext, buttonLabel, buttonLink, variant }: {
  headline: string; subtext: string; buttonLabel: string; buttonLink: string;
  variant: 'dark' | 'accent' | 'glass';
}) => {
  const bg = { dark: 'var(--pm-bg-3)', accent: 'var(--pm-accent)', glass: 'rgba(200,169,106,0.08)' }[variant ?? 'dark'];
  const textColor = variant === 'accent' ? 'var(--pm-accent-fg)' : 'var(--pm-text)';
  return (
    <section style={{ ...section(), background: bg, textAlign: 'center', border: variant === 'glass' ? '1px solid var(--pm-border)' : 'none', borderRadius: 'var(--pm-radius)' }}>
      <div style={container({ maxWidth: 640 })}>
        <h2 style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 800, color: textColor, marginBottom: 16 }}>{headline}</h2>
        <p style={{ fontSize: 18, color: variant === 'accent' ? 'var(--pm-accent-fg)' : 'var(--pm-text-muted)', marginBottom: 40, lineHeight: 1.6 }}>{subtext}</p>
        <a href={buttonLink} style={accentBtn({ background: variant === 'accent' ? 'var(--pm-bg)' : 'var(--pm-accent)', color: variant === 'accent' ? 'var(--pm-accent)' : 'var(--pm-accent-fg)' })}>
          {buttonLabel}
        </a>
      </div>
    </section>
  );
};

// ─── Block: Stats Bar ────────────────────────────────────────────────────────
const StatsBar = ({ stats, background }: {
  stats: Array<{ label: string; value: string; suffix?: string }>;
  background?: string;
}) => (
  <section style={{ ...section({ padding: '48px 24px' }), background: background ?? 'var(--pm-bg-2)' }}>
    <div style={container({ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 32 })}>
      {(stats ?? []).map((s, i) => (
        <div key={i} style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 800, color: 'var(--pm-accent)', lineHeight: 1 }}>
            {s.value}{s.suffix ?? ''}
          </p>
          <p style={{ fontSize: 14, color: 'var(--pm-text-muted)', marginTop: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.label}</p>
        </div>
      ))}
    </div>
  </section>
);

// ─── Block: Testimonial ──────────────────────────────────────────────────────
const TestimonialBlock = ({ quotes }: {
  quotes: Array<{ quote: string; author: string; role?: string; avatar?: string }>;
}) => (
  <section style={section({ background: 'var(--pm-bg-2)' })}>
    <div style={container({ display: 'grid', gridTemplateColumns: `repeat(${Math.min(3, (quotes ?? []).length)}, 1fr)`, gap: 24 })}>
      {(quotes ?? []).map((q, i) => (
        <div key={i} style={card({ padding: 28 })}>
          <p style={{ fontSize: 16, color: 'var(--pm-text)', lineHeight: 1.7, marginBottom: 20 }}>
            &ldquo;{q.quote}&rdquo;
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {q.avatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={q.avatar} alt={q.author} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
            )}
            <div>
              <p style={{ fontWeight: 700, color: 'var(--pm-accent)', fontSize: 14 }}>{q.author}</p>
              {q.role && <p style={{ fontSize: 12, color: 'var(--pm-text-muted)' }}>{q.role}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

// ─── Block: Gallery Grid ─────────────────────────────────────────────────────
const GalleryGrid = ({ images, columns, gap }: {
  images: Array<{ src: string; alt: string; caption?: string }>;
  columns: number; gap: number;
}) => (
  <section style={section({ padding: '48px 24px' })}>
    <div style={container()}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns ?? 3}, 1fr)`, gap: `${gap ?? 16}px` }}>
        {(images ?? []).map((img, i) => (
          <div key={i} style={{ overflow: 'hidden', borderRadius: 'var(--pm-radius)', position: 'relative' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} alt={img.alt} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }} />
            {img.caption && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', padding: '8px 12px' }}>
                <p style={{ color: '#fff', fontSize: 12, margin: 0 }}>{img.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Block: Feature Grid ─────────────────────────────────────────────────────
const FeatureGrid = ({ title, subtitle, features }: {
  title: string; subtitle?: string;
  features: Array<{ icon: string; title: string; description: string }>;
}) => (
  <section style={section()}>
    <div style={container()}>
      {title && (
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--pm-text)', marginBottom: 12 }}>{title}</h2>
          {subtitle && <p style={{ fontSize: 18, color: 'var(--pm-text-muted)' }}>{subtitle}</p>}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
        {(features ?? []).map((f, i) => (
          <div key={i} style={card({ display: 'flex', flexDirection: 'column', gap: 12 })}>
            <span style={{ fontSize: 32 }}>{f.icon}</span>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--pm-accent)' }}>{f.title}</h3>
            <p style={{ fontSize: 14, color: 'var(--pm-text-muted)', lineHeight: 1.7 }}>{f.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Puck Config ─────────────────────────────────────────────────────────────
const config: Config = {
  components: {
    Hero: {
      label: '🏠 Hero',
      fields: {
        heading: { type: 'text', label: 'Heading' },
        subheading: { type: 'textarea', label: 'Subheading' },
        ctaText: { type: 'text', label: 'CTA Button Text' },
        ctaHref: { type: 'text', label: 'CTA Link' },
        backgroundImage: { type: 'text', label: 'Background Image URL' },
        overlayOpacity: { type: 'number', label: 'Overlay Opacity (0-100)' },
        minHeight: { type: 'number', label: 'Min Height (vh)' },
      },
      defaultProps: {
        heading: 'Luxury Living in Malta',
        subheading: 'Premium property management and holiday rentals.',
        ctaText: 'View Properties',
        ctaHref: '/properties',
        backgroundImage: '',
        overlayOpacity: 45,
        minHeight: 80,
      },
      render: HeroBlock,
    },
    Columns: {
      label: '📐 Columns',
      fields: {
        title: { type: 'text', label: 'Section Title (optional)' },
        cols: {
          type: 'array',
          label: 'Columns',
          arrayFields: {
            heading: { type: 'text', label: 'Heading' },
            body: { type: 'textarea', label: 'Body' },
            icon: { type: 'text', label: 'Icon (emoji)' },
          },
          defaultItemProps: { heading: 'Feature', body: 'Description here.', icon: '✦' },
        },
      },
      defaultProps: {
        title: '',
        cols: [
          { heading: 'Premium Rentals', body: 'Curated luxury properties across Malta.', icon: '🏠' },
          { heading: 'Full Management', body: 'End-to-end property management service.', icon: '🔑' },
          { heading: 'Global Reach', body: 'Listed on all major booking platforms.', icon: '🌍' },
        ],
      },
      render: ColumnsBlock,
    },
    Text: {
      label: '📝 Text',
      fields: {
        heading: { type: 'text', label: 'Heading (optional)' },
        body: { type: 'textarea', label: 'Body' },
        align: { type: 'select', label: 'Alignment', options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ]},
        size: { type: 'select', label: 'Font Size', options: [
          { label: 'Small', value: 'sm' },
          { label: 'Medium', value: 'md' },
          { label: 'Large', value: 'lg' },
        ]},
      },
      defaultProps: { heading: '', body: 'Your content here.', align: 'left', size: 'md' },
      render: TextBlock,
    },
    Image: {
      label: '🖼 Image',
      fields: {
        src: { type: 'text', label: 'Image URL' },
        alt: { type: 'text', label: 'Alt Text' },
        caption: { type: 'text', label: 'Caption (optional)' },
        rounded: { type: 'radio', label: 'Rounded', options: [
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ]},
        objectFit: { type: 'select', label: 'Object Fit', options: [
          { label: 'Cover', value: 'cover' },
          { label: 'Contain', value: 'contain' },
          { label: 'Fill', value: 'fill' },
        ]},
      },
      defaultProps: { src: '', alt: '', caption: '', rounded: true, objectFit: 'cover' },
      render: ImageBlock,
    },
    Spacer: {
      label: '↕ Spacer',
      fields: { height: { type: 'number', label: 'Height (px)' } },
      defaultProps: { height: 40 },
      render: SpacerBlock,
    },
    CTASection: {
      label: '🎯 CTA Section',
      fields: {
        headline: { type: 'text', label: 'Headline' },
        subtext: { type: 'textarea', label: 'Subtext' },
        buttonLabel: { type: 'text', label: 'Button Label' },
        buttonLink: { type: 'text', label: 'Button Link' },
        variant: { type: 'select', label: 'Style Variant', options: [
          { label: 'Dark', value: 'dark' },
          { label: 'Accent', value: 'accent' },
          { label: 'Glass', value: 'glass' },
        ]},
      },
      defaultProps: {
        headline: 'Ready to find your perfect property?',
        subtext: 'Browse our curated collection of luxury Malta properties.',
        buttonLabel: 'Explore Properties',
        buttonLink: '/properties',
        variant: 'dark',
      },
      render: CTASection,
    },
    StatsBar: {
      label: '📊 Stats Bar',
      fields: {
        background: { type: 'text', label: 'Background Color (CSS)' },
        stats: {
          type: 'array',
          label: 'Stats',
          arrayFields: {
            label: { type: 'text', label: 'Label' },
            value: { type: 'text', label: 'Value' },
            suffix: { type: 'text', label: 'Suffix (optional, e.g. +)' },
          },
          defaultItemProps: { label: 'Properties', value: '50', suffix: '+' },
        },
      },
      defaultProps: {
        background: '',
        stats: [
          { label: 'Properties', value: '50', suffix: '+' },
          { label: 'Happy Guests', value: '1,200', suffix: '+' },
          { label: 'Years Experience', value: '10', suffix: '' },
          { label: 'Avg. Rating', value: '4.9', suffix: '★' },
        ],
      },
      render: StatsBar,
    },
    Testimonials: {
      label: '💬 Testimonials',
      fields: {
        quotes: {
          type: 'array',
          label: 'Testimonials',
          arrayFields: {
            quote: { type: 'textarea', label: 'Quote' },
            author: { type: 'text', label: 'Author Name' },
            role: { type: 'text', label: 'Role / Location' },
            avatar: { type: 'text', label: 'Avatar URL (optional)' },
          },
          defaultItemProps: { quote: 'Exceptional service and stunning property.', author: 'Jane D.', role: 'Guest, Malta', avatar: '' },
        },
      },
      defaultProps: {
        quotes: [
          { quote: 'Absolutely stunning property, flawless service from start to finish.', author: 'Michael T.', role: 'London, UK', avatar: '' },
          { quote: 'Best holiday rental experience we\'ve ever had. Will be back!', author: 'Sophie R.', role: 'Paris, France', avatar: '' },
          { quote: 'Professional management and beautiful apartment in Sliema.', author: 'Marco B.', role: 'Milan, Italy', avatar: '' },
        ],
      },
      render: TestimonialBlock,
    },
    Gallery: {
      label: '🖼 Gallery Grid',
      fields: {
        columns: { type: 'number', label: 'Columns (1-4)' },
        gap: { type: 'number', label: 'Gap (px)' },
        images: {
          type: 'array',
          label: 'Images',
          arrayFields: {
            src: { type: 'text', label: 'Image URL' },
            alt: { type: 'text', label: 'Alt Text' },
            caption: { type: 'text', label: 'Caption (optional)' },
          },
          defaultItemProps: { src: '', alt: 'Property image', caption: '' },
        },
      },
      defaultProps: { columns: 3, gap: 16, images: [] },
      render: GalleryGrid,
    },
    FeatureGrid: {
      label: '✦ Feature Grid',
      fields: {
        title: { type: 'text', label: 'Section Title' },
        subtitle: { type: 'text', label: 'Subtitle (optional)' },
        features: {
          type: 'array',
          label: 'Features',
          arrayFields: {
            icon: { type: 'text', label: 'Icon (emoji)' },
            title: { type: 'text', label: 'Title' },
            description: { type: 'textarea', label: 'Description' },
          },
          defaultItemProps: { icon: '✦', title: 'Feature', description: 'Feature description.' },
        },
      },
      defaultProps: {
        title: 'Why Choose Us',
        subtitle: 'Everything you need for a perfect stay',
        features: [
          { icon: '🏊', title: 'Private Pool', description: 'Exclusive pool access for guests.' },
          { icon: '📡', title: 'Fast WiFi', description: 'High-speed internet throughout.' },
          { icon: '🚗', title: 'Free Parking', description: 'Private parking included.' },
          { icon: '🔒', title: 'Secure Access', description: 'Smart lock keyless entry.' },
        ],
      },
      render: FeatureGrid,
    },
  },
  root: {
    fields: {
      title: { type: 'text', label: 'Page Title' },
      description: { type: 'textarea', label: 'Meta Description' },
      theme: {
        type: 'select',
        label: 'Theme Preset',
        options: [
          { label: 'Malta Gold (default)', value: 'malta-gold' },
          { label: 'Pure Dark', value: 'dark' },
          { label: 'Light Sand', value: 'light' },
          { label: 'Ocean Blue', value: 'ocean' },
          { label: 'AI Custom', value: 'ai-custom' },
        ],
      },
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

/**
 * @fileoverview Puck visual editor config — canonical component registry.
 * All Puck blocks are registered here. Import this in editor + renderer.
 */
import type { Config } from '@measured/puck';

// ─── Hero Block ───────────────────────────────────────────────────────────────
const HeroBlock = ({
  heading, subheading, ctaText, ctaHref, backgroundImage,
}: {
  heading: string; subheading: string; ctaText: string; ctaHref: string; backgroundImage: string;
}) => (
  <section
    style={{
      minHeight: '80vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
      backgroundSize: 'cover', backgroundPosition: 'center',
      backgroundColor: backgroundImage ? 'transparent' : '#0e0f11',
      position: 'relative',
    }}
  >
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
    <div style={{ position: 'relative', textAlign: 'center', color: '#fff', padding: '0 24px', maxWidth: 720 }}>
      <h1 style={{ fontSize: 'clamp(2rem,5vw,4rem)', fontWeight: 700, marginBottom: 16, lineHeight: 1.15 }}>
        {heading || 'Welcome to Malta Gold'}
      </h1>
      <p style={{ fontSize: 'clamp(1rem,2vw,1.35rem)', color: '#e8e4dccc', marginBottom: 32, lineHeight: 1.6 }}>
        {subheading || 'Luxury property management in Malta'}
      </p>
      {ctaText && (
        <a href={ctaHref || '/properties'}
          style={{
            display: 'inline-block', padding: '14px 32px', borderRadius: 8,
            background: '#c8a96a', color: '#0e0f11', fontWeight: 700,
            fontSize: 15, textDecoration: 'none', letterSpacing: '0.03em',
          }}>
          {ctaText}
        </a>
      )}
    </div>
  </section>
);

// ─── Columns Block ────────────────────────────────────────────────────────────
const ColumnsBlock = ({ cols }: { cols: Array<{ heading: string; body: string; icon?: string }> }) => (
  <section style={{ padding: '80px 24px', background: '#111214' }}>
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: `repeat(${Math.max(1, (cols ?? []).length)}, 1fr)`, gap: 32 }}>
      {(cols ?? []).map((col, i) => (
        <div key={i} style={{ background: '#1a1b1f', borderRadius: 12, padding: 32, border: '1px solid #2a2b30' }}>
          {col.icon && <div style={{ fontSize: 32, marginBottom: 16 }}>{col.icon}</div>}
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#c8a96a', marginBottom: 12 }}>{col.heading}</h3>
          <p style={{ color: '#e8e4dc99', lineHeight: 1.7, fontSize: 15 }}>{col.body}</p>
        </div>
      ))}
    </div>
  </section>
);

// ─── Text Block ───────────────────────────────────────────────────────────────
const TextBlock = ({ heading, body, align }: { heading?: string; body: string; align?: 'left' | 'center' | 'right' }) => (
  <section style={{ padding: '64px 24px', background: '#0e0f11' }}>
    <div style={{ maxWidth: 760, margin: '0 auto', textAlign: align ?? 'left' }}>
      {heading && <h2 style={{ fontSize: 32, fontWeight: 700, color: '#c8a96a', marginBottom: 16 }}>{heading}</h2>}
      <p style={{ fontSize: 16, color: '#e8e4dccc', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{body}</p>
    </div>
  </section>
);

// ─── Image Block ─────────────────────────────────────────────────────────────
const ImageBlock = ({ src, alt, caption, rounded }: { src: string; alt: string; caption?: string; rounded?: boolean }) => (
  <section style={{ padding: '32px 24px', background: '#0e0f11' }}>
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} style={{ width: '100%', borderRadius: rounded ? 16 : 0, display: 'block' }} />
      {caption && <p style={{ textAlign: 'center', color: '#e8e4dc50', fontSize: 13, marginTop: 8 }}>{caption}</p>}
    </div>
  </section>
);

// ─── Spacer Block ─────────────────────────────────────────────────────────────
const SpacerBlock = ({ height }: { height: number }) => (
  <div style={{ height: `${height ?? 40}px` }} />
);

// ─── Config ───────────────────────────────────────────────────────────────────
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
      },
      defaultProps: {
        heading: 'Luxury Living in Malta',
        subheading: 'Premium property management and holiday rentals.',
        ctaText: 'View Properties',
        ctaHref: '/properties',
        backgroundImage: '',
      },
      render: HeroBlock,
    },
    Columns: {
      label: '📐 Columns',
      fields: {
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
      },
      defaultProps: { heading: '', body: 'Your content here.', align: 'left' },
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
      },
      defaultProps: { src: '', alt: '', caption: '', rounded: true },
      render: ImageBlock,
    },
    Spacer: {
      label: '↕ Spacer',
      fields: {
        height: { type: 'number', label: 'Height (px)' },
      },
      defaultProps: { height: 40 },
      render: SpacerBlock,
    },
  },
  root: {
    fields: {
      title: { type: 'text', label: 'Page Title' },
      theme: {
        type: 'select', label: 'Theme',
        options: [
          { label: 'Malta Gold (default)', value: 'malta-gold' },
          { label: 'Pure Dark', value: 'dark' },
          { label: 'Light', value: 'light' },
        ],
      },
    },
    defaultProps: { title: 'Page', theme: 'malta-gold' },
    render: ({ children, title }: { children: React.ReactNode; title: string }) => (
      <div data-theme="malta-gold">
        <title>{title}</title>
        {children}
      </div>
    ),
  },
};

export default config;

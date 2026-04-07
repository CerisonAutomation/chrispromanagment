'use client';

import React from 'react';
import Image from 'next/image';
import {Button} from '@/components/ui/button';
import {ArrowRight, Camera, ChevronDown, Globe, Link2, MessageCircle} from 'lucide-react';

// =============================================================================
// TEXT BLOCKS
// =============================================================================

export const HeadingBlock = {
  label: "Heading Block",
  fields: {
    text: {
      type: 'text',
      label: 'Heading Text',
    },
    level: {
      type: 'select',
      label: 'Heading Level',
      options: [
        { label: 'H1', value: 'h1' },
        { label: 'H2', value: 'h2' },
        { label: 'H3', value: 'h3' },
        { label: 'H4', value: 'h4' },
        { label: 'H5', value: 'h5' },
      ],
    },
    align: {
      type: 'select',
      label: 'Alignment',
      options: [
        { label: 'Left', value: 'text-left' },
        { label: 'Center', value: 'text-center' },
        { label: 'Right', value: 'text-right' },
      ],
    },
    color: {
      type: 'select',
      label: 'Color',
      options: [
        { label: 'Default', value: 'text-neutral-900' },
        { label: 'Primary', value: 'text-primary' },
        { label: 'White', value: 'text-white' },
        { label: 'Muted', value: 'text-neutral-500' },
      ],
    },
  },
  defaultProps: {
    text: 'Heading Text',
    level: 'h2',
    align: 'text-left',
    color: 'text-neutral-900',
  },
  render: ({ text, level, align, color }: any) => {
    const sizeClass = ({
      h1: 'text-4xl md:text-5xl lg:text-6xl font-bold',
      h2: 'text-3xl md:text-4xl font-bold',
      h3: 'text-2xl md:text-3xl font-semibold',
      h4: 'text-xl md:text-2xl font-semibold',
      h5: 'text-lg md:text-xl font-medium',
    } as Record<string, string>)[level as string] || 'text-2xl font-bold';

    return (
      <div className={align}>
        {level === 'h1' && <h1 className={`${sizeClass} ${color}`}>{text}</h1>}
        {level === 'h2' && <h2 className={`${sizeClass} ${color}`}>{text}</h2>}
        {level === 'h3' && <h3 className={`${sizeClass} ${color}`}>{text}</h3>}
        {level === 'h4' && <h4 className={`${sizeClass} ${color}`}>{text}</h4>}
        {level === 'h5' && <h5 className={`${sizeClass} ${color}`}>{text}</h5>}
      </div>
    );
  },
};

export const TextBlock = {
  label: "Text Block",
  fields: {
    text: {
      type: 'textarea',
      label: 'Text Content',
    },
    align: {
      type: 'select',
      label: 'Alignment',
      options: [
        { label: 'Left', value: 'text-left' },
        { label: 'Center', value: 'text-center' },
        { label: 'Right', value: 'text-right' },
      ],
    },
    size: {
      type: 'select',
      label: 'Text Size',
      options: [
        { label: 'Small', value: 'text-sm' },
        { label: 'Base', value: 'text-base' },
        { label: 'Large', value: 'text-lg' },
        { label: 'Extra Large', value: 'text-xl' },
      ],
    },
    color: {
      type: 'select',
      label: 'Color',
      options: [
        { label: 'Default', value: 'text-neutral-900' },
        { label: 'Muted', value: 'text-neutral-600' },
        { label: 'White', value: 'text-white' },
        { label: 'Primary', value: 'text-primary' },
      ],
    },
  },
  defaultProps: {
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    align: 'text-left',
    size: 'text-base',
    color: 'text-neutral-600',
  },
  render: ({ text, align, size, color }: any) => {
    return (
      <div className={align}>
        <p className={`${size} ${color} leading-relaxed`}>{text}</p>
      </div>
    );
  },
};

export const RichTextBlock = {
  label: "Rich Text Block",
  fields: {
    content: {
      type: 'textarea',
      label: 'HTML Content',
    },
    align: {
      type: 'select',
      label: 'Alignment',
      options: [
        { label: 'Left', value: 'text-left' },
        { label: 'Center', value: 'text-center' },
        { label: 'Right', value: 'text-right' },
      ],
    },
  },
  defaultProps: {
    content: '<p>Write your <strong>rich text</strong> content here with <em>formatting</em>.</p>',
    align: 'text-left',
  },
  render: ({ content, align }: any) => {
    return (
      <div className={`prose prose-neutral max-w-none ${align}`} dangerouslySetInnerHTML={{ __html: content }} />
    );
  },
};

// =============================================================================
// MEDIA BLOCKS
// =============================================================================

export const ImageBlock = {
  label: "Image Block",
  fields: {
    src: {
      type: 'text',
      label: 'Image URL',
    },
    alt: {
      type: 'text',
      label: 'Alt Text',
    },
    width: {
      type: 'number',
      label: 'Width (px)',
    },
    height: {
      type: 'number',
      label: 'Height (px)',
    },
    aspectRatio: {
      type: 'select',
      label: 'Aspect Ratio',
      options: [
        { label: 'Auto', value: 'auto' },
        { label: 'Square (1:1)', value: '1/1' },
        { label: 'Landscape (16:9)', value: '16/9' },
        { label: 'Portrait (3:4)', value: '3/4' },
        { label: 'Wide (21:9)', value: '21/9' },
      ],
    },
    borderRadius: {
      type: 'select',
      label: 'Border Radius',
      options: [
        { label: 'None', value: 'rounded-none' },
        { label: 'Small', value: 'rounded-md' },
        { label: 'Medium', value: 'rounded-xl' },
        { label: 'Large', value: 'rounded-3xl' },
        { label: 'Full', value: 'rounded-full' },
      ],
    },
    caption: {
      type: 'text',
      label: 'Caption',
    },
  },
  defaultProps: {
    src: '',
    alt: 'Image description',
    width: 800,
    height: 600,
    aspectRatio: 'auto',
    borderRadius: 'rounded-xl',
    caption: '',
  },
  render: ({ src, alt, aspectRatio, borderRadius, caption }: any) => {
    if (!src) {
      return (
        <div className={`${borderRadius} bg-neutral-100 border-2 border-dashed border-neutral-300 flex items-center justify-center aspect-video`}>
          <span className="text-neutral-400">No image selected</span>
        </div>
      );
    }

    return (
      <figure className="w-full">
        <div className={`relative overflow-hidden ${borderRadius}`} style={{ aspectRatio: aspectRatio !== 'auto' ? aspectRatio : undefined }}>
          <Image src={src} alt={alt} fill className="object-cover" />
        </div>
        {caption && <figcaption className="mt-2 text-center text-sm text-neutral-500">{caption}</figcaption>}
      </figure>
    );
  },
};

export const VideoBlock = {
  label: "Video Block",
  fields: {
    url: {
      type: 'text',
      label: 'Video URL (YouTube/Vimeo)',
    },
    autoplay: {
      type: 'checkbox',
      label: 'Autoplay',
    },
    controls: {
      type: 'checkbox',
      label: 'Show Controls',
    },
    muted: {
      type: 'checkbox',
      label: 'Muted',
    },
    borderRadius: {
      type: 'select',
      label: 'Border Radius',
      options: [
        { label: 'None', value: '0' },
        { label: 'Small', value: '8px' },
        { label: 'Medium', value: '16px' },
        { label: 'Large', value: '24px' },
      ],
    },
  },
  defaultProps: {
    url: '',
    autoplay: false,
    controls: true,
    muted: true,
    borderRadius: '16px',
  },
  render: ({ url, autoplay, controls, muted, borderRadius }: any) => {
    if (!url) {
      return (
        <div className="bg-neutral-100 border-2 border-dashed border-neutral-300 flex items-center justify-center aspect-video rounded-xl">
          <span className="text-neutral-400">No video URL provided</span>
        </div>
      );
    }

    let embedUrl = url;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.match(/(?:v=|youtu\.be\/)([^&?]+)/)?.[1];
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&controls=${controls ? 1 : 0}&mute=${muted ? 1 : 0}`;
      }
    } else if (url.includes('vimeo.com')) {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      if (videoId) {
        embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=${autoplay ? 1 : 0}&controls=${controls ? 1 : 0}&muted=${muted ? 1 : 0}`;
      }
    }

    return (
      <div className="relative aspect-video" style={{ borderRadius }}>
        <iframe
          src={embedUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
          style={{ borderRadius }}
        />
      </div>
    );
  },
};

// =============================================================================
// INTERACTIVE BLOCKS
// =============================================================================

export const ButtonBlock = {
  label: "Button Block",
  fields: {
    text: {
      type: 'text',
      label: 'Button Text',
    },
    link: {
      type: 'text',
      label: 'Link URL',
    },
    variant: {
      type: 'select',
      label: 'Variant',
      options: [
        { label: 'Primary', value: 'default' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Outline', value: 'outline' },
        { label: 'Ghost', value: 'ghost' },
      ],
    },
    size: {
      type: 'select',
      label: 'Size',
      options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'default' },
        { label: 'Large', value: 'lg' },
      ],
    },
    align: {
      type: 'select',
      label: 'Alignment',
      options: [
        { label: 'Left', value: 'text-left' },
        { label: 'Center', value: 'text-center' },
        { label: 'Right', value: 'text-right' },
      ],
    },
    showIcon: {
      type: 'checkbox',
      label: 'Show Arrow Icon',
    },
  },
  defaultProps: {
    text: 'Click Me',
    link: '#',
    variant: 'default',
    size: 'default',
    align: 'text-left',
    showIcon: true,
  },
  render: ({ text, link, variant, size, align, showIcon }: any) => {
    return (
      <div className={align}>
        <Button variant={variant} size={size} asChild>
          <a href={link}>
            {text}
            {showIcon && <ArrowRight className="ml-2 h-4 w-4" />}
          </a>
        </Button>
      </div>
    );
  },
};

export const NewsletterBlock = {
  label: "Newsletter Block",
  fields: {
    title: {
      type: 'text',
      label: 'Title',
    },
    description: {
      type: 'textarea',
      label: 'Description',
    },
    placeholder: {
      type: 'text',
      label: 'Input Placeholder',
    },
    buttonText: {
      type: 'text',
      label: 'Button Text',
    },
    backgroundColor: {
      type: 'select',
      label: 'Background',
      options: [
        { label: 'White', value: 'bg-white' },
        { label: 'Light', value: 'bg-neutral-50' },
        { label: 'Primary', value: 'bg-primary' },
        { label: 'Dark', value: 'bg-neutral-900' },
      ],
    },
  },
  defaultProps: {
    title: 'Subscribe to Our Newsletter',
    description: 'Get the latest updates and exclusive content delivered to your inbox.',
    placeholder: 'Enter your email',
    buttonText: 'Subscribe',
    backgroundColor: 'bg-neutral-50',
  },
  render: ({ title, description, placeholder, buttonText, backgroundColor }: any) => {
    const isDark = backgroundColor?.includes('primary') || backgroundColor?.includes('neutral-900');
    
    return (
      <section className={`${backgroundColor} w-full py-16`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className={`text-2xl md:text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            {title}
          </h3>
          <p className={`mb-8 ${isDark ? 'text-white/80' : 'text-neutral-600'}`}>
            {description}
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder={placeholder}
              className={`flex-1 px-4 py-3 rounded-lg border ${isDark ? 'bg-white/10 border-white/20 text-white placeholder:text-white/50' : 'bg-white border-neutral-300'}`}
            />
            <Button type="submit" className={isDark ? 'bg-white text-primary hover:bg-white/90' : ''}>
              {buttonText}
            </Button>
          </form>
        </div>
      </section>
    );
  },
};

// =============================================================================
// NAVIGATION & FOOTER
// =============================================================================

export const HeaderBlock = {
  label: "Header Block",
  fields: {
    logoText: {
      type: 'text',
      label: 'Logo Text',
    },
    logoUrl: {
      type: 'text',
      label: 'Logo Image URL',
    },
    navLinks: {
      type: 'textarea',
      label: 'Navigation Links (JSON)',
    },
    ctaText: {
      type: 'text',
      label: 'CTA Button Text',
    },
    ctaLink: {
      type: 'text',
      label: 'CTA Button Link',
    },
    transparent: {
      type: 'checkbox',
      label: 'Transparent Background',
    },
  },
  defaultProps: {
    logoText: 'Brand',
    logoUrl: '',
    navLinks: '[{"label":"Home","href":"/"},{"label":"Features","href":"#features"},{"label":"Pricing","href":"#pricing"},{"label":"Contact","href":"#contact"}]',
    ctaText: 'Get Started',
    ctaLink: '#signup',
    transparent: false,
  },
  render: ({ logoText, logoUrl, navLinks, ctaText, ctaLink, transparent }: any) => {
    const links = JSON.parse(navLinks || '[]');
    
    return (
      <header className={`w-full py-4 ${transparent ? 'absolute top-0 left-0 right-0 z-50' : 'bg-white border-b border-neutral-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              {logoUrl ? (
                <img src={logoUrl} alt={logoText} className="h-8 w-auto" />
              ) : (
                <span className={`text-xl font-bold ${transparent ? 'text-white' : 'text-neutral-900'}`}>
                  {logoText}
                </span>
              )}
            </a>
            <nav className="hidden md:flex items-center gap-8">
              {links.map((link: any, i: number) => (
                <a 
                  key={i}
                  href={link.href}
                  className={`text-sm font-medium hover:opacity-70 transition-opacity ${transparent ? 'text-white' : 'text-neutral-600'}`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            {ctaText && (
              <Button size="sm" asChild>
                <a href={ctaLink}>{ctaText}</a>
              </Button>
            )}
          </div>
        </div>
      </header>
    );
  },
};

export const FooterBlock = {
  label: "Footer Block",
  fields: {
    logoText: {
      type: 'text',
      label: 'Logo Text',
    },
    description: {
      type: 'textarea',
      label: 'Description',
    },
    columns: {
      type: 'textarea',
      label: 'Footer Columns (JSON)',
    },
    socialLinks: {
      type: 'textarea',
      label: 'Social Links (JSON)',
    },
    copyright: {
      type: 'text',
      label: 'Copyright Text',
    },
  },
  defaultProps: {
    logoText: 'Brand',
    description: 'Building the future of web design, one pixel at a time.',
    columns: '[{"title":"Product","links":[{"label":"Features","href":"#"},{"label":"Pricing","href":"#"},{"label":"Documentation","href":"#"}]},{"title":"Company","links":[{"label":"About","href":"#"},{"label":"Blog","href":"#"},{"label":"Careers","href":"#"}]},{"title":"Legal","links":[{"label":"Privacy","href":"#"},{"label":"Terms","href":"#"},{"label":"Security","href":"#"}]}]',
    socialLinks: '[{"platform":"Twitter","href":"#"},{"platform":"LinkedIn","href":"#"},{"platform":"GitHub","href":"#"}]',
    copyright: '© 2025 Brand. All rights reserved.',
  },
  render: ({ logoText, description, columns, socialLinks, copyright }: any) => {
    const parsedColumns = JSON.parse(columns || '[]');
    const parsedSocial = JSON.parse(socialLinks || '[]');

    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      Globe,
      GitHub: Link2,
      LinkedIn: Link2,
      Twitter: MessageCircle,
      Facebook: MessageCircle,
      Instagram: Camera,
    };

    return (
      <footer className="bg-neutral-900 text-white w-full py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2">
              <span className="text-xl font-bold">{logoText}</span>
              <p className="mt-4 text-neutral-400 max-w-sm">{description}</p>
              <div className="mt-6 flex gap-4">
                {parsedSocial.map((social: any, i: number) => {
                  const IconComponent = iconMap[social.platform] || Globe;
                  return (
                    <a key={i} href={social.href} className="text-neutral-400 hover:text-white transition-colors">
                      <IconComponent className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>
            {parsedColumns.map((column: any, i: number) => (
              <div key={i}>
                <h4 className="font-semibold text-white mb-4">{column.title}</h4>
                <ul className="space-y-3">
                  {column.links.map((link: any, j: number) => (
                    <li key={j}>
                      <a href={link.href} className="text-neutral-400 hover:text-white transition-colors">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-neutral-800 text-center text-neutral-500 text-sm">
            {copyright}
          </div>
        </div>
      </footer>
    );
  },
};

// =============================================================================
// FAQ ACCORDION
// =============================================================================

export const FaqBlock = {
  label: "FAQ Block",
  fields: {
    title: {
      type: 'text',
      label: 'Section Title',
    },
    items: {
      type: 'textarea',
      label: 'FAQ Items (JSON)',
    },
  },
  defaultProps: {
    title: 'Frequently Asked Questions',
    items: '[{"question":"What is your refund policy?","answer":"We offer a 30-day money-back guarantee on all plans. No questions asked."},{"question":"How do I get started?","answer":"Simply sign up for an account and you can start building immediately. No credit card required."},{"question":"Can I cancel anytime?","answer":"Yes, you can cancel your subscription at any time. Your data will be retained for 30 days."}]',
  },
  render: ({ title, items }: any) => {
    const faqs = JSON.parse(items || '[]');
    
    return (
      <section className="w-full py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{title}</h2>
          <div className="space-y-4">
            {faqs.map((faq: any, i: number) => (
              <details key={i} className="group border border-neutral-200 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-neutral-50 transition-colors">
                  <span className="font-semibold text-neutral-900">{faq.question}</span>
                  <ChevronDown className="h-5 w-5 text-neutral-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-neutral-600">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    );
  },
};

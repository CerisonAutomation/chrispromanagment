// =============================================================================
// SEO & METADATA SYSTEM - Complete SEO Management
// =============================================================================
// Addresses: Section 4 - SEO & Metadata System

import { Result, ok, err } from '@/domain/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PageMetadata {
  // Basic
  title: string;
  description: string;
  keywords: string[];
  
  // Open Graph
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: 'website' | 'article' | 'product' | 'profile';
  
  // Twitter
  twitterCard: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterImage: string;
  twitterSite: string;
  twitterCreator: string;
  
  // Technical
  canonicalUrl: string;
  noIndex: boolean;
  noFollow: boolean;
  
  // Structured Data (JSON-LD)
  jsonLd: Record<string, unknown> | null;
  
  // Dynamic
  lastModified: string;
  changeFrequency: ChangeFrequency;
  priority: number; // 0.0 - 1.0
  
  // Locale
  locale: string;
  alternateLocales: string[];
}

export type ChangeFrequency = 
  | 'always' 
  | 'hourly' 
  | 'daily' 
  | 'weekly' 
  | 'monthly' 
  | 'yearly' 
  | 'never';

export interface SeoAnalysis {
  score: number; // 0-100
  issues: SeoIssue[];
  suggestions: string[];
  readability: ReadabilityScore;
}

export interface SeoIssue {
  type: 'error' | 'warning' | 'info';
  field: keyof PageMetadata;
  message: string;
}

export interface ReadabilityScore {
  fleschKincaid: number;
  gradeLevel: string;
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
}

// ---------------------------------------------------------------------------
// Default Metadata
// ---------------------------------------------------------------------------

export function createDefaultMetadata(slug: string, title: string): PageMetadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://christianopropertymanagement.com';
  
  return {
    title,
    description: '',
    keywords: [],
    ogTitle: title,
    ogDescription: '',
    ogImage: '',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterImage: '',
    twitterSite: '@christiano',
    twitterCreator: '@christiano',
    canonicalUrl: `${baseUrl}/${slug}`,
    noIndex: false,
    noFollow: false,
    jsonLd: null,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.5,
    locale: 'en',
    alternateLocales: ['mt', 'it'],
  };
}

// ---------------------------------------------------------------------------
// SEO Analyzer
// ---------------------------------------------------------------------------

export class SeoAnalyzer {
  /**
   * Analyze metadata and return issues
   */
  analyze(metadata: PageMetadata): SeoAnalysis {
    const issues: SeoIssue[] = [];
    const suggestions: string[] = [];

    // Title checks
    if (!metadata.title) {
      issues.push({ type: 'error', field: 'title', message: 'Title is required' });
    } else if (metadata.title.length < 30) {
      issues.push({ type: 'warning', field: 'title', message: 'Title should be at least 30 characters' });
    } else if (metadata.title.length > 60) {
      issues.push({ type: 'warning', field: 'title', message: 'Title should be under 60 characters' });
    }

    // Description checks
    if (!metadata.description) {
      issues.push({ type: 'error', field: 'description', message: 'Meta description is required' });
    } else if (metadata.description.length < 120) {
      issues.push({ type: 'warning', field: 'description', message: 'Description should be at least 120 characters' });
    } else if (metadata.description.length > 160) {
      issues.push({ type: 'warning', field: 'description', message: 'Description should be under 160 characters' });
    }

    // Keywords
    if (metadata.keywords.length === 0) {
      suggestions.push('Add relevant keywords for better search visibility');
    }

    // Open Graph
    if (!metadata.ogImage) {
      issues.push({ type: 'warning', field: 'ogImage', message: 'Add an OG image for social sharing' });
    }

    // Canonical
    if (!metadata.canonicalUrl) {
      issues.push({ type: 'warning', field: 'canonicalUrl', message: 'Set a canonical URL to prevent duplicate content' });
    }

    // Calculate score
    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;
    const score = Math.max(0, 100 - (errorCount * 20) - (warningCount * 5));

    // Readability (would need content text)
    const readability: ReadabilityScore = {
      fleschKincaid: 0,
      gradeLevel: 'N/A',
      wordCount: 0,
      sentenceCount: 0,
      avgWordsPerSentence: 0,
    };

    return { score, issues, suggestions, readability };
  }

  /**
   * Auto-generate SEO from content
   */
  autoGenerate(content: string, existing: Partial<PageMetadata>): PageMetadata {
    const words = content.split(/\s+/).filter(Boolean);
    const sentences = content.split(/[.!?]+/).filter(Boolean);
    
    // Generate description from first 150 chars of content
    const description = existing.description || 
      content.substring(0, 150).replace(/[#*_]/g, '').trim() + '...';

    // Calculate readability
    const wordCount = words.length;
    const sentenceCount = sentences.length;
    const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    
    // Simple Flesch-Kincaid approximation
    const syllables = words.reduce((acc, word) => acc + this.countSyllables(word), 0);
    const fleschKincaid = sentenceCount > 0 && wordCount > 0
      ? 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * (syllables / wordCount))
      : 0;

    const readability: ReadabilityScore = {
      fleschKincaid: Math.round(fleschKincaid * 10) / 10,
      gradeLevel: this.getGradeLevel(fleschKincaid),
      wordCount,
      sentenceCount,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    };

    // Generate JSON-LD structured data
    const jsonLd = this.generateJsonLd(existing.title || '', description, existing.ogImage || '');

    return {
      ...createDefaultMetadata(existing.canonicalUrl?.split('/').pop() || 'page', existing.title || ''),
      ...existing,
      description,
      ogDescription: existing.ogDescription || description,
      jsonLd,
    };
  }

  private countSyllables(word: string): number {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^aeiouy]es?|ed|[aeiouy]+e$)/g, '');
    return word.match(/[aeiouy]/g)?.length || 1;
  }

  private getGradeLevel(score: number): string {
    if (score >= 90) return '5th grade';
    if (score >= 80) return '6th grade';
    if (score >= 70) return '7th grade';
    if (score >= 60) return '8th-9th grade';
    if (score >= 50) return '10th-12th grade';
    if (score >= 30) return 'College';
    return 'College graduate';
  }

  private generateJsonLd(title: string, description: string, image: string): Record<string, unknown> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://christianopropertymanagement.com';
    
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: title,
      description,
      url: siteUrl,
      image: image || undefined,
      publisher: {
        '@type': 'Organization',
        name: 'Christiano Property Management',
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/logo.svg`,
        },
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    };
  }
}

// ---------------------------------------------------------------------------
// Sitemap Generator
// ---------------------------------------------------------------------------

export interface SitemapConfig {
  baseUrl: string;
  pages: SitemapPage[];
  images?: SitemapImage[];
}

export interface SitemapPage {
  url: string;
  lastModified: string;
  changeFrequency: ChangeFrequency;
  priority: number;
}

export interface SitemapImage {
  url: string;
  title?: string;
  caption?: string;
}

export function generateSitemap(config: SitemapConfig): string {
  const urls = config.pages.map(page => `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority.toFixed(1)}</priority>
  </url>`).join('');

  const images = config.images ? `
  <url>
    <loc>${config.baseUrl}</loc>
    ${config.images.map(img => `
    <image:image>
      <image:loc>${img.url}</image:loc>
      ${img.title ? `<image:title>${img.title}</image:title>` : ''}
      ${img.caption ? `<image:caption>${img.caption}</image:caption>` : ''}
    </image:image>`).join('')}
  </url>` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
         xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}${images}
</urlset>`;
}

export function generateRobotsTxt(baseUrl: string, sitemapUrl: string): string {
  return `# Robots.txt for ${baseUrl}

User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /puck/

Sitemap: ${sitemapUrl}
`;
}

// ---------------------------------------------------------------------------
// Instance
// ---------------------------------------------------------------------------

export const seoAnalyzer = new SeoAnalyzer();

// ---------------------------------------------------------------------------
// Default Export
// ---------------------------------------------------------------------------

export default {
  createDefaultMetadata,
  seoAnalyzer,
  generateSitemap,
  generateRobotsTxt,
};
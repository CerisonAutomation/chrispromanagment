/**
 * @fileoverview Dynamic sitemap — static pages + all published CMS pages.
 * Regenerates at most every 24 h (revalidate: 86400).
 */
import type { MetadataRoute } from 'next';
import { getAllPages } from '@/lib/supabase';
import { env } from '@/lib/env';

export const revalidate = 86_400;

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: '', changeFrequency: 'daily', priority: 1.0 },
  { url: '/properties', changeFrequency: 'daily', priority: 0.9 },
  { url: '/about', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/contact', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { url: '/terms', changeFrequency: 'yearly', priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.SITE_URL.replace(/\/$/, '');
  const pages = await getAllPages();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((p) => ({
    ...p,
    url: `${baseUrl}${p.url}`,
    lastModified: new Date(),
  }));

  const cmsEntries: MetadataRoute.Sitemap = pages
    .filter((p) => p.published && p.slug !== 'home' && p.slug !== '')
    .map((p) => ({
      url: `${baseUrl}/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  return [...staticEntries, ...cmsEntries];
}

/**
 * @fileoverview Dynamic sitemap — includes all published CMS pages + property pages.
 * Regenerates at most every 24 h (revalidate: 86400).
 */
import type { MetadataRoute } from 'next';
import { getAllPages } from '@/lib/supabase';
import { env } from '@/lib/env';

export const revalidate = 86_400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.SITE_URL;
  const pages = await getAllPages();

  const cmsEntries: MetadataRoute.Sitemap = pages
    .filter((p) => p.published)
    .map((p) => ({
      url: `${baseUrl}/${p.slug}`.replace(/\/+/g, '/').replace(':/', '://'),
      lastModified: new Date(p.updated_at),
      changeFrequency: 'weekly',
      priority: p.slug === 'home' || p.slug === '' ? 1.0 : 0.8,
    }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...cmsEntries,
  ];
}

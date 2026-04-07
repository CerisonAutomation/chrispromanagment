/**
 * @fileoverview Next.js sitemap — auto-generated, includes all CMS pages.
 */
import type { MetadataRoute } from 'next';
import { getAllPages } from '@/lib/supabase';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chrispropmanagment.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getAllPages();
  const published = pages.filter(p => p.published);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/properties`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ];

  const cmsRoutes: MetadataRoute.Sitemap = published
    .filter(p => !['home', 'about', 'contact'].includes(p.slug))
    .map(p => ({
      url: `${BASE}/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

  return [...staticRoutes, ...cmsRoutes];
}

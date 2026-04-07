/**
 * @fileoverview robots.ts — prevents crawling of admin/API routes.
 */
import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/_next/'],
      },
    ],
    sitemap: `${env.SITE_URL}/sitemap.xml`,
  };
}

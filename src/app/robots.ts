/**
 * @fileoverview robots.txt — blocks admin/puck/api from search engines.
 */
import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chrispropmanagment.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/puck', '/api'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}

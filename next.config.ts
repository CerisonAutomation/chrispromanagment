/**
 * @fileoverview Next.js configuration — images, headers, bundle analyzer.
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js
 */
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ── Images ────────────────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Guesty CDN
      { protocol: 'https', hostname: '*.cloudinary.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '*.guesty.com' },
      { protocol: 'https', hostname: 'pictures.guesty.com' },
      // Supabase Storage
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
    ],
  },

  // ── Security headers ──────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        // Cache static assets aggressively
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  // ── Redirects ─────────────────────────────────────────────
  async redirects() {
    return [
      // Legacy URL cleanup
      {
        source: '/property/:id',
        destination: '/properties/:id',
        permanent: true,
      },
    ];
  },

  // ── Experimental ──────────────────────────────────────────
  experimental: {
    // Optimize CSS (requires critters)
    optimizeCss: false,
    // PPR — uncomment when stable
    // ppr: true,
  },

  // ── Logging ───────────────────────────────────────────────
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
};

export default nextConfig;

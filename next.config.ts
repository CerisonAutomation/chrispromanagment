/**
 * @fileoverview Next.js 15 configuration — production-hardened.
 * Vercel deployment target: fra1 (Frankfurt)
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js
 */
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '*.cloudinary.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '*.guesty.com' },
      { protocol: 'https', hostname: 'pictures.guesty.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' https://r2cdn.perplexity.ai",
              "connect-src 'self' https://*.supabase.co https://*.guesty.com https://api.openai.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },

  async redirects() {
    return [
      { source: '/property/:id', destination: '/properties/:id', permanent: true },
    ];
  },

  // Suppress noisy warnings from heavy editor deps
  serverExternalPackages: ['@measured/puck'],

  experimental: {
    optimizeCss: false,
  },

  logging: {
    fetches: { fullUrl: process.env.NODE_ENV === 'development' },
  },

  // Silence non-breaking peer dep warnings during build
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ─── Images ─────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.guesty.com' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // ─── Security headers ───────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },

  // ─── Redirects ──────────────────────────────────────────────────────────
  async redirects() {
    return [
      { source: '/cms', destination: '/admin/pages', permanent: true },
      { source: '/editor', destination: '/puck/home', permanent: true },
    ];
  },

  // ─── Build ──────────────────────────────────────────────────────────────
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,

  // ─── Ignore Prisma/Drizzle build errors ─────────────────────────────────
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },

  // ─── Webpack: ignore legacy DB deps that are no longer used ─────────────
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Prevent Prisma from being bundled (removed from deps but may be cached)
      '@prisma/client': false,
      'prisma': false,
    };
    return config;
  },
};

export default nextConfig;

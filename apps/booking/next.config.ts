import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.guesty.com' },
    ],
  },
  transpilePackages: ['@cpm/shared-types', '@cpm/shared-utils', '@cpm/ui-components'],
};

export default nextConfig;

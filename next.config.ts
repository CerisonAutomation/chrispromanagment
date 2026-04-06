// =============================================================================
// NEXT.JS CONFIGURATION - Performance Optimized
// Target: 100 Lighthouse score, <1s FCP, <3s TTI
// =============================================================================

import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  // =============================================================================
  // OUTPUT CONFIGURATION
  // =============================================================================
  output: "standalone",

  // =============================================================================
  // IMAGE OPTIMIZATION
  // =============================================================================
  images: {
    // Remote patterns for image CDNs
    remotePatterns: [
      {
        protocol: "https",
        hostname: "primary.jwwb.nl",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.jwwb.nl",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
    ],
    // Format optimization
    formats: ["image/avif", "image/webp"],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    // Image sizes for srcset
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimum cache lifetime
    minimumCacheTTL: 31536000, // 1 year
  },

  // =============================================================================
  // COMPILER OPTIONS
  // =============================================================================
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === "production"
        ? {exclude: ["error", "warn"]}
        : false,
  },

  // =============================================================================
  // EXPERIMENTAL FEATURES
  // =============================================================================
  experimental: {
    // Optimize package imports
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "recharts",
      "date-fns",
    ],
    // Enable server actions
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // =============================================================================
  // REDIRECTS
  // =============================================================================
  async redirects() {
    return [
      {
        source: "/puck",
        destination: "/#/admin",
        permanent: true,
      },
      {
        source: "/puck/:path*",
        destination: "/#/admin/edit/:path*",
        permanent: true,
      },
    ];
  },

  // =============================================================================
  // HEADERS - Security & Caching
  // =============================================================================
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Security headers
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Cache headers for static assets
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // API routes - no caching
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate",
          },
          {
            key: "Vary",
            value: "Accept-Encoding",
          },
        ],
      },
      // Image optimization headers
      {
        source: "/_next/image/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Static files
      {
        source: "/:path*.(ico|png|jpg|jpeg|gif|webp|svg|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // =============================================================================
  // TYPE CHECKING - ENABLED for production safety
  // =============================================================================
  typescript: {
    ignoreBuildErrors: false,
    // Additional type checking for stricter mode
    tsconfigPath: "./tsconfig.json",
  },

  // =============================================================================
  // WEBPACK CONFIGURATION
  // =============================================================================
  webpack: (config, {dev, isServer}) => {
    // Optimize bundle splitting
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            // Separate vendor chunks
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
              priority: 10,
            },
            // Separate large libraries
            ui: {
              test: /[\\/]node_modules[\\/](@radix-ui|class-variance-authority|clsx|tailwind-merge)[\\/]/,
              name: "ui-libs",
              chunks: "all",
              priority: 20,
            },
            // Separate animations
            animations: {
              test: /[\\/]node_modules[\\/](framer-motion|@reactuses\/core)[\\/]/,
              name: "animations",
              chunks: "all",
              priority: 20,
            },
          },
        },
        // Enable module concatenation
        concatenateModules: true,
        // Minimize runtime chunk
        runtimeChunk: {
          name: "runtime",
        },
      };
    }

    return config;
  },

  // =============================================================================
  // TRAILING SLASH
  // =============================================================================
  trailingSlash: false,

  // =============================================================================
  // REACT STRICT MODE (disabled for production performance)
  // =============================================================================
  reactStrictMode: false,
};

export default nextConfig;

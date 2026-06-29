import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const appDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Enable React strict mode for catching issues early
  reactStrictMode: true,

  // Compress responses with gzip
  compress: true,

  turbopack: {
    root: appDir,
  },

  // Caching headers for heavy static resources
  async headers() {
    return [
      {
        source: '/pdf.worker.min.mjs',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Optimize package imports — tree-shake heavy icon and animation libraries
  // so only the icons/exports actually used are bundled
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
    ],
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Reduce powered-by header exposure
  poweredByHeader: false,
};

export default nextConfig;

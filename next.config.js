/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Vercel Edge Network applies Brotli/gzip; double-compressing wastes CPU.
  compress: false,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/wikipedia/commons/**',
      },
    ],
  },

  async redirects() {
    return [
      // Non-www → www canonical redirect (CDN-level, before middleware).
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'globalstudyboard.com' }],
        destination: 'https://www.globalstudyboard.com/:path*',
        permanent: true,
      },
      // Legacy locale prefixes retired (single-language English site).
      // Handled here at routing level so middleware never runs for these paths.
      { source: '/hi', destination: '/', permanent: true },
      { source: '/en', destination: '/', permanent: true },
      { source: '/hi/:path*', destination: '/:path*', permanent: true },
      { source: '/en/:path*', destination: '/:path*', permanent: true },
      // Legacy /colleges/abroad/* links from the first release (now 404 in GSC).
      // The site is region-first — map each old destination to its region hub.
      { source: '/colleges/abroad/usa', destination: '/regions/usa', permanent: true },
      { source: '/colleges/abroad/uk', destination: '/regions/uk-ireland', permanent: true },
      { source: '/colleges/abroad/canada', destination: '/regions/canada', permanent: true },
      { source: '/colleges/abroad/australia', destination: '/regions/australia-nz', permanent: true },
      { source: '/colleges/abroad/germany', destination: '/regions/europe', permanent: true },
      // Base + any other old abroad path → the destinations index.
      { source: '/colleges/abroad', destination: '/regions', permanent: true },
      { source: '/colleges/abroad/:slug*', destination: '/regions', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value:
              'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), interest-cohort=()',
          },
          { key: 'X-DNS-Prefetch-Control', value: 'off' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

const isDev = process.env.NODE_ENV !== 'production';

// CSP for a statically-generated site (do NOT switch to a nonce here).
// Every page on GlobalStudyBoard is statically prerendered for speed/SEO/cost.
// A per-request nonce CANNOT coexist with static HTML: the nonce in the CSP
// header is regenerated each request, but the prerendered <script> tags are
// baked once at build time with no nonce — so a nonce + 'strict-dynamic' policy
// blocks 100% of the page's own scripts (external chunks AND inline hydration),
// React never hydrates, and every interactive control (region picker, menu,
// search) silently dies. We therefore allow same-origin + inline scripts. There
// is no user-injected HTML on the site (all dangerouslySetInnerHTML uses are
// trusted JSON-LD), and React escapes all rendered output, so 'unsafe-inline'
// is an acceptable posture. If a true nonce is ever wanted, every route must
// first be moved to dynamic rendering (force-dynamic) — otherwise it WILL break.
//
// Lives here rather than in middleware.ts (deleted Aug 2026): the output was
// byte-identical on every production request, so a 92-line edge function ran on
// every page hit purely to set static headers. headers() applies these at the
// CDN with zero function invocations.
const scriptSrcParts = [
  "'self'",
  "'unsafe-inline'",
  'https://www.googletagmanager.com',
  // Google AdSense / Auto ads — loader + the supporting scripts it pulls into
  // the top frame. Google does NOT publish a stable allowlist (they officially
  // support only a nonce/'strict-dynamic' policy, which a statically-prerendered
  // site cannot use — see the note above), so we allow the well-known Google
  // ad-serving domains. Ad *creatives* load INSIDE the ad iframe under its own
  // origin, not this CSP, so the rotating creative domains don't need listing.
  'https://*.googlesyndication.com',
  'https://partner.googleadservices.com',
  'https://adservice.google.com',
  'https://www.googletagservices.com',
  'https://googleads.g.doubleclick.net',
  'https://*.adtrafficquality.google',
  'https://adtrafficquality.google',
  'https://fundingchoicesmessages.google.com',
  'https://va.vercel-scripts.com',
  'https://vitals.vercel-insights.com',
  "'wasm-unsafe-eval'",
  'blob:',
];
// Next.js compiles dev bundles with `eval-source-map`, so `next dev` needs
// 'unsafe-eval' or React never boots locally. headers() runs in dev too.
if (isDev) scriptSrcParts.push("'unsafe-eval'");

const cspDirectives = [
  "default-src 'self'",
  `script-src ${scriptSrcParts.join(' ')}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https: blob:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://www.googletagmanager.com https://vitals.vercel-insights.com https://*.googlesyndication.com https://googleads.g.doubleclick.net https://*.g.doubleclick.net https://adservice.google.com https://*.adtrafficquality.google https://adtrafficquality.google https://fundingchoicesmessages.google.com https://www.google.com https://csi.gstatic.com",
  "frame-src 'self' https://*.googlesyndication.com https://googleads.g.doubleclick.net https://www.google.com https://*.adtrafficquality.google https://adtrafficquality.google https://fundingchoicesmessages.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "worker-src 'self' blob:",
];
// middleware gated this on request hostname (!isLocalhost). headers() has no
// request object, so gate on build mode instead: byte-identical in production
// and under `next dev`; `next start` on localhost now also emits it, which is
// inert (http://localhost is a potentially-trustworthy origin, never upgraded).
if (!isDev) cspDirectives.push('upgrade-insecure-requests');

const CSP = cspDirectives.join('; ');

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
      // Non-www → www canonical redirect (CDN-level).
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'globalstudyboard.com' }],
        destination: 'https://www.globalstudyboard.com/:path*',
        permanent: true,
      },
      // Legacy locale prefixes retired (single-language English site).
      // Handled here at routing level.
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
          // Migrated from middleware.ts (deleted Aug 2026) — the only two headers
          // it set that this block did not already cover.
          { key: 'Content-Security-Policy', value: CSP },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Single-language (English) site. Retire any legacy locale-prefixed URLs
  // (/hi/*, /en/*) with a permanent redirect to the bare English URL.
  if (pathname === '/hi' || pathname === '/en') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url, 301);
  }
  if (pathname.startsWith('/hi/') || pathname.startsWith('/en/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || '/';
    return NextResponse.redirect(url, 301);
  }

  const hostname = request.nextUrl.hostname;
  const isLocalhost =
    hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  const isDev = process.env.NODE_ENV !== 'production';

  // NOTE — CSP for a statically-generated site (do NOT switch to a nonce here).
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
  const scriptSrcParts = [
    "'self'",
    "'unsafe-inline'",
    'https://www.googletagmanager.com',
    'https://pagead2.googlesyndication.com',
    'https://googleads.g.doubleclick.net',
    'https://va.vercel-scripts.com',
    'https://vitals.vercel-insights.com',
    "'wasm-unsafe-eval'",
    'blob:',
  ];
  if (isDev) scriptSrcParts.push("'unsafe-eval'");

  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrcParts.join(' ')}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://www.googletagmanager.com https://vitals.vercel-insights.com",
    "frame-src 'self' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "worker-src 'self' blob:",
  ];
  if (!isLocalhost) csp.push('upgrade-insecure-requests');

  const cspValue = csp.join('; ');

  const response = NextResponse.next();

  response.headers.set('Content-Security-Policy', cspValue);
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  response.headers.set('X-DNS-Prefetch-Control', 'off');

  if (!isLocalhost) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|api/|images/|fonts/|favicon\\.ico|icon\\.png|apple-icon\\.png|manifest\\.webmanifest|ads\\.txt|robots\\.txt|sitemap|[^/]+\\.(?:png|jpe?g|gif|webp|svg|ico|ttf|woff2?|otf|txt|xml|json|html|pdf|css)).*)',
  ],
};

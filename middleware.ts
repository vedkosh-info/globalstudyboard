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

  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  const nonce = btoa(String.fromCharCode(...nonceBytes));

  const scriptSrcParts = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
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

  // Forward the CSP on the REQUEST headers so the Next.js renderer can read the
  // nonce out of it during SSR and stamp it onto every inline framework script
  // it emits. Without this, 'strict-dynamic' blocks Next.js's own bootstrap /
  // hydration / chunk scripts (they ship without a nonce) and the page breaks.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspValue);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  response.headers.set('Content-Security-Policy', cspValue);
  response.headers.set('x-nonce', nonce);
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

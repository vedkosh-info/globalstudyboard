import { NextResponse, type NextRequest } from 'next/server';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/lib/i18n';

const COOKIE_NAME = 'gsb_lang';

const ROOT_ONLY_PATTERNS = [
  /^\/opengraph-image/,
  /^\/twitter-image/,
  /^\/feed\.xml/,
  /^\/sitemap/,
  /^\/.well-known\//,
  /^\/manifest\.webmanifest/,
  /^\/images\//,
  /^\/favicon\.ico/,
  /^\/icon/,
  /^\/apple-icon/,
  /^\/ads\.txt/,
  /^\/robots\.txt/,
];

/** Country → preferred locale. India → Hindi; everything else → English. */
const GEO_LOCALE_MAP: Record<string, string> = {
  IN: 'hi',
};

function detectLocale(request: NextRequest): string {
  const saved = request.cookies.get(COOKIE_NAME)?.value;
  if (saved && (SUPPORTED_LOCALES as readonly string[]).includes(saved)) return saved;

  const country = request.headers.get('x-vercel-ip-country');
  if (country) {
    const geo = GEO_LOCALE_MAP[country.toUpperCase()];
    if (geo) return geo;
  }

  const acceptLang = request.headers.get('accept-language');
  if (acceptLang) {
    const lang = acceptLang.split(',')[0].trim().split('-')[0].toLowerCase();
    if ((SUPPORTED_LOCALES as readonly string[]).includes(lang)) return lang;
  }

  return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const segments = pathname.split('/');
  const firstSegment = segments[1] ?? '';
  const pathnameHasLocale = (SUPPORTED_LOCALES as readonly string[]).includes(firstSegment);
  const isRootOnly = ROOT_ONLY_PATTERNS.some((re) => re.test(pathname));

  let resolvedLocale = DEFAULT_LOCALE;
  let rewrittenPath: string | null = null;

  if (!isRootOnly) {
    if (firstSegment === DEFAULT_LOCALE) {
      // /en or /en/* → 308 redirect to bare URL (bare is canonical for English)
      const url = request.nextUrl.clone();
      const tail = pathname.slice(3);
      url.pathname = tail.length === 0 ? '/' : tail;
      return NextResponse.redirect(url, 308);
    }

    if (pathnameHasLocale) {
      resolvedLocale = firstSegment as typeof DEFAULT_LOCALE;
    } else {
      // Bare URL → internal rewrite to /en so app/[lang]/... renders it
      resolvedLocale = DEFAULT_LOCALE;
      rewrittenPath = pathname === '/' ? '/en' : `/en${pathname}`;
    }
  }

  const hostname = request.nextUrl.hostname;
  const isLocalhost =
    hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  const isDev = process.env.NODE_ENV !== 'production';

  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  const nonce = btoa(String.fromCharCode(...nonceBytes));

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('x-locale', resolvedLocale);

  const response =
    rewrittenPath !== null
      ? NextResponse.rewrite(new URL(rewrittenPath, request.url), {
          request: { headers: requestHeaders },
        })
      : NextResponse.next({ request: { headers: requestHeaders } });

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

  response.headers.set('Content-Security-Policy', csp.join('; '));
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

  // Detect preferred locale for first-time visitors to offer a locale switcher
  void detectLocale;

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|api/|images/|fonts/|favicon\\.ico|icon\\.png|apple-icon\\.png|manifest\\.webmanifest|ads\\.txt|robots\\.txt|sitemap|[^/]+\\.(?:png|jpe?g|gif|webp|svg|ico|ttf|woff2?|otf|txt|xml|json|html|pdf|css)).*)',
  ],
};

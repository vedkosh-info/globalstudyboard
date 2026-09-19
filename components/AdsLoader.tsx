'use client';

import Script from 'next/script';
import { useSelectedLayoutSegments } from 'next/navigation';
import { ADSENSE_SCRIPT_SRC } from '@/lib/adsense';

/**
 * Google AdSense loader for "full page" Auto ads — mounted once in the root layout.
 *
 * NOT loaded on the account surfaces (/login, /account, /admin, /auth): Google's
 * publisher policies forbid ads on screens without publisher content or used
 * for navigation/behavioural purposes, and AdSense may disable serving on
 * password-protected/account content. The route segment is known at SSR
 * (useSelectedLayoutSegments), so this stays static and hydration-safe. The
 * owner mirrors it as AdSense → Ads → By site → Page exclusions.
 *
 * `lazyOnload`, not `afterInteractive`: in the App Router the latter emits
 * <link rel="preload" as="script"> in <head>, so the 58 KB loader (and the
 * ~225 KB ad chain behind it) downloaded at High priority next to the CSS and
 * fonts on every page and pushed Time-to-Interactive to ~5 s. lazyOnload defers
 * it until the window load event — content and Core Web Vitals first, ads after.
 */
const NO_ADS_SEGMENTS = new Set(['login', 'account', 'admin', 'auth']);

export default function AdsLoader() {
  const segments = useSelectedLayoutSegments();
  if (NO_ADS_SEGMENTS.has(segments[0] ?? '')) return null;
  return <Script id="google-adsense" async src={ADSENSE_SCRIPT_SRC} crossOrigin="anonymous" strategy="lazyOnload" />;
}

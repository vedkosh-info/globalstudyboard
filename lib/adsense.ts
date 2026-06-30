// Google AdSense publisher identity.
//
// This is PUBLIC, not a secret — the same id appears verbatim in the page source
// of every site that runs AdSense. We hardcode it (rather than an env var) so a
// fresh deploy works immediately without touching the Vercel dashboard.
//
// "Full page / auto ads" are enabled from the AdSense dashboard (Ads → Auto ads).
// The ONLY code requirement is:
//   1. the loader <script> on every page  → added in app/layout.tsx
//   2. the ownership <meta> tag           → added via app/layout.tsx metadata
//   3. a matching public/ads.txt line     → google.com, pub-…, DIRECT, f08c47fec0942fa0
//
// No per-page <ins> ad units are needed for auto ads; Google places them.

/** AdSense client id (with the `ca-` prefix), used in the loader script + meta tag. */
export const ADSENSE_CLIENT_ID = 'ca-pub-5355138646489429';

/** Loader script URL for the AdSense / Auto ads library. */
export const ADSENSE_SCRIPT_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;

import type { MetadataRoute } from 'next';

/**
 * Web app manifest.
 *
 * Also the source of truth for the Android app: the Trusted Web Activity in
 * `android-app/` points at this manifest, and Play's listing icon is generated
 * from the same artwork as `/icons/icon-512.png`. Keep `name`, the colours and
 * the icon set in sync with `android-app/build.gradle` — a mismatch shows up as
 * a different icon or splash colour between the installed PWA and the Play app.
 *
 * The 192px and 512px PNGs are required: Android derives every launcher-icon
 * density and the splash image from them, and an SVG-only icon set is not
 * enough for an installable app.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'GlobalStudyBoard — Universities, Exams & Scholarships',
    short_name: 'GlobalStudyBoard',
    description:
      'Free guide to universities, entrance exams, and scholarships worldwide — USA, UK, Europe, Canada, Australia, India and more.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#FFF8E7',
    theme_color: '#14532D',
    lang: 'en',
    dir: 'ltr',
    categories: ['education', 'books', 'reference'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
    shortcuts: [
      { name: 'Universities', short_name: 'Universities', url: '/colleges' },
      { name: 'Entrance exams', short_name: 'Exams', url: '/exams' },
      { name: 'Guides', short_name: 'Guides', url: '/guides' },
      { name: 'Scholarships', short_name: 'Scholarships', url: '/scholarships' },
    ],
  };
}

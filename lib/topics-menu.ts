/**
 * Compact per-destination track projection for the desktop "Topics" mega-menu.
 *
 * Server-only by convention: `lib/tracks` + `lib/topics` (≈0.35 MB) must never
 * reach the browser. Until November 2026 this projection was computed in the
 * root layout and passed to the client menu as a prop, which serialised all
 * nine destinations (~13.6 KB raw) into the HTML AND the RSC payload of every
 * one of ~3,400 prerendered pages — although the menu only ever shows one
 * destination, and only once opened (its links are not in the server HTML).
 * It is now served once as a static, CDN-cached JSON file
 * (`app/search/catalogue/topics-menu/route.ts`) that the menu fetches on intent.
 */
import { REGIONS } from '@/lib/regions';
import { tracksForRegion, trackHref, isMultiHubTrack, topicsForTrack } from '@/lib/tracks';
import type { TopicsMenuData } from '@/lib/topics-menu-types';

export function buildTopicsMenu(): TopicsMenuData {
  const out: TopicsMenuData = {};
  for (const region of REGIONS) {
    out[region.slug] = tracksForRegion(region.slug).map((t) => ({
      label: t.label,
      href: trackHref(t),
      preview: isMultiHubTrack(t)
        ? topicsForTrack(t)
            .slice(0, 3)
            .map((h) => h.label)
            .join(' · ')
        : null,
    }));
  }
  return out;
}

import type { RegionSlug } from '@/lib/regions';

/**
 * The fragment key a destination page uses to hand its destination to the
 * tools (`#region=<slug>`), and the link to the tools index that carries it.
 * Kept apart from lib/tools (the registry) so the site chrome — the header nav,
 * the strip under it and the quick-actions dock, which render on every page —
 * can link to the tools without pulling the registry into the layout bundle.
 */
export const REGION_HINT_KEY = 'region';

/** `/tools`, carrying the page's destination when it has one (the index hands it on to the tool opened next). */
export const toolsIndexHref = (region?: RegionSlug | null): string => (region ? `/tools#${REGION_HINT_KEY}=${region}` : '/tools');

/** `/tools/<slug>`, carrying the page's destination when it has one (lib/tools `toolHref` is this). */
export const toolPageHref = (slug: string, region?: RegionSlug | null): string =>
  region ? `/tools/${slug}#${REGION_HINT_KEY}=${region}` : `/tools/${slug}`;

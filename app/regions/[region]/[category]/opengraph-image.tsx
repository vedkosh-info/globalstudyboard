import { REGION_SLUGS } from '@/lib/regions';
import { REGION_CATEGORIES } from '@/lib/region-nav';
import { regionOgImage, OG_SIZE, OG_ALT, OG_CONTENT_TYPE } from '@/lib/region-og';

export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// opengraph-image does not cascade into nested dynamic segments, so each region
// category page (8 regions × 4 categories) gets the per-region card explicitly.
// The card keys off the region only — the category is part of the route params.
export function generateStaticParams() {
  return REGION_SLUGS.flatMap((region) =>
    REGION_CATEGORIES.map((category) => ({ region, category })),
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ region: string; category: string }>;
}) {
  const { region } = await params;
  return regionOgImage(region);
}

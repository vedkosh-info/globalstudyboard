import { REGION_SLUGS } from '@/lib/regions';
import { regionOgImage, OG_SIZE, OG_ALT, OG_CONTENT_TYPE } from '@/lib/region-og';

export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// One statically-generated per-region social card (8 destinations) — SSG-safe.
export function generateStaticParams() {
  return REGION_SLUGS.map((region) => ({ region }));
}

export default async function Image({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params;
  return regionOgImage(region);
}

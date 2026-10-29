import { NextResponse } from 'next/server';
import { searchCatalogue } from '@/lib/search-catalogue';
import { getRegionBySlug, REGION_SLUGS } from '@/lib/regions';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return REGION_SLUGS.map((region) => ({ region }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ region: string }> }) {
  const { region: slug } = await params;
  const region = getRegionBySlug(slug);
  if (!region) return NextResponse.json({ error: 'Unknown destination' }, { status: 404 });
  return NextResponse.json(searchCatalogue(region.slug), {
    headers: { 'Cache-Control': 'public, max-age=0, must-revalidate', 'X-Robots-Tag': 'noindex' },
  });
}

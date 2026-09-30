import { NextResponse } from 'next/server';
import { compareCatalogue } from '@/lib/compare-catalogue';

/**
 * GET /tools/compare-universities/catalogue — the fact sheets of all 118
 * profiles as static JSON (prerendered at build; changes only with a deploy).
 * Fetched by the tool chunk on mount rather than passed as page props, so the
 * catalogue is not in the HTML/flight payload of the public shell.
 */
export const dynamic = 'force-static';

export function GET() {
  return NextResponse.json(compareCatalogue(), {
    headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
  });
}

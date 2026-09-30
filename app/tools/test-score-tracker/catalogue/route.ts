import { NextResponse } from 'next/server';
import { scoresCatalogue } from '@/lib/test-scores-catalogue';

/**
 * GET /tools/test-score-tracker/catalogue — the tracker's exam picker and
 * each university's own test list as static JSON (prerendered at build;
 * changes only with a deploy). Fetched by the tool chunk on mount rather than
 * passed as page props, so the catalogue data is not in the public shell.
 */
export const dynamic = 'force-static';

export function GET() {
  return NextResponse.json(scoresCatalogue(), {
    headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
  });
}

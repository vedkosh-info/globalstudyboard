import { NextResponse } from 'next/server';
import { plannerCatalogue } from '@/lib/planner-catalogue';

/**
 * GET /tools/application-planner/catalogue — the planner's university + exam
 * pickers as static JSON (prerendered at build; changes only with a deploy).
 * Fetched by the tool chunk on mount rather than passed as page props, so the
 * catalogue data is not in the HTML/flight payload of the public shell.
 */
export const dynamic = 'force-static';

export function GET() {
  return NextResponse.json(plannerCatalogue(), {
    headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
  });
}

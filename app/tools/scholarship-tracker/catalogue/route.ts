import { NextResponse } from 'next/server';
import { scholarshipCatalogue } from '@/lib/scholarship-catalogue';

/** Public identities only; private tracking records never enter this static response. */
export const dynamic = 'force-static';

export function GET() {
  return NextResponse.json(scholarshipCatalogue(), {
    headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
  });
}

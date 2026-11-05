import { NextResponse } from 'next/server';
import { PROGRAMMES } from '@/lib/application-check-catalogue';

export const dynamic = 'force-static';

export function GET() {
  return NextResponse.json(PROGRAMMES, {
    headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
  });
}

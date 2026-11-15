import { NextResponse } from 'next/server';
import { buildTopicsMenu } from '@/lib/topics-menu';

// Prerendered once per deploy; one hot URL, so it is a CDN hit for nearly
// every visitor (see lib/topics-menu.ts for why it is not a layout prop).
export const dynamic = 'force-static';

export function GET() {
  return NextResponse.json(buildTopicsMenu(), {
    headers: { 'Cache-Control': 'public, max-age=0, must-revalidate', 'X-Robots-Tag': 'noindex' },
  });
}

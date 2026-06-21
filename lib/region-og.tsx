import { ImageResponse } from 'next/og';
import { getRegionBySlug, REGION_TAGLINES, type RegionSlug } from '@/lib/regions';

// Shared 1200×630 social card for region pages, drawn in code (no binary asset,
// no emoji — Satori can't render flag emoji) so each destination gets an on-brand,
// never-stale card. Used by both the opengraph-image and twitter-image route
// conventions under /regions/[region]. Palette matches app/opengraph-image.tsx
// (forest #14532D / cream #FFF8E7 / terracotta #F0A37C).
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_ALT = 'Study in your chosen destination — GlobalStudyBoard';
export const OG_CONTENT_TYPE = 'image/png';

export function regionOgImage(regionSlug: string) {
  const r = getRegionBySlug(regionSlug);
  const name = r?.displayName ?? 'the World';
  const tagline =
    (r && REGION_TAGLINES[r.slug as RegionSlug]) ?? 'Free, source-verified admission guidance.';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#14532D',
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Brand row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '72px',
              height: '72px',
              borderRadius: '18px',
              backgroundColor: '#FFF8E7',
              color: '#14532D',
              fontSize: '44px',
              fontWeight: 700,
            }}
          >
            G
          </div>
          <div style={{ display: 'flex', color: '#FFF8E7', fontSize: '34px', fontWeight: 600 }}>
            GlobalStudyBoard
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              color: 'rgba(255,248,231,0.7)',
              fontSize: '32px',
              fontWeight: 600,
              marginBottom: '8px',
            }}
          >
            Study in
          </div>
          <div
            style={{
              display: 'flex',
              color: '#FFF8E7',
              fontSize: '82px',
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: '-2px',
              maxWidth: '1000px',
            }}
          >
            {name}
          </div>
          <div
            style={{
              display: 'flex',
              color: '#F0A37C',
              fontSize: '30px',
              fontWeight: 600,
              marginTop: '26px',
              maxWidth: '1000px',
            }}
          >
            {tagline}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', color: 'rgba(255,248,231,0.72)', fontSize: '24px' }}>
          Universities · Exams · Scholarships · Student visa — each verified
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}

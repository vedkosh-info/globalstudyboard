import { ImageResponse } from 'next/og';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getRegionBySlug, REGION_TAGLINES, type RegionSlug } from '@/lib/regions';

// Shared 1200×630 social card for region pages, drawn in code (no binary asset,
// no emoji — Satori can't render flag emoji) so each destination gets an on-brand,
// never-stale card. Used by both the opengraph-image and twitter-image route
// conventions under /regions/[region]. Palette matches app/opengraph-image.tsx
// (forest #14532D / cream #FFF8E7 / terracotta #F0A37C).
export const OG_SIZE = { width: 1200, height: 630 };
// Fallback alt for the file-convention route only. Every page now passes the
// card in object form via lib/seo.ts `regionOgImage()`, whose alt names the
// destination ("Study in the United States — GlobalStudyBoard"), so this text
// is what a consumer sees only when no page-level image is set.
export const OG_ALT = 'Study destination guide — universities, exams, scholarships and visas — GlobalStudyBoard';
export const OG_CONTENT_TYPE = 'image/png';

/**
 * The brand mark for the card's brand row — the same globe-and-mortarboard the
 * favicon, app icons and Organization logo use (public/icons/icon-192.png), so a
 * shared link no longer shows a different mark from the browser tab. Read from
 * disk at build time (these routes prerender); if the file is ever unavailable the
 * caller falls back to the old code-drawn "G" tile rather than failing the card.
 */
export function brandMarkDataUrl(): string | null {
  try {
    const png = readFileSync(join(process.cwd(), 'public', 'icons', 'icon-192.png'));
    return `data:image/png;base64,${png.toString('base64')}`;
  } catch {
    return null;
  }
}

/** The brand row shared by every card: the mark tile + the wordmark. */
export function BrandRow({ tile, wordmark }: { tile: number; wordmark: number }) {
  const mark = brandMarkDataUrl();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      {mark ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mark}
          width={tile}
          height={tile}
          alt=""
          style={{ width: `${tile}px`, height: `${tile}px`, borderRadius: '18px' }}
        />
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: `${tile}px`,
            height: `${tile}px`,
            borderRadius: '18px',
            backgroundColor: '#FFF8E7',
            color: '#14532D',
            fontSize: `${Math.round(tile * 0.6)}px`,
            fontWeight: 700,
          }}
        >
          G
        </div>
      )}
      <div style={{ display: 'flex', color: '#FFF8E7', fontSize: `${wordmark}px`, fontWeight: 600 }}>
        GlobalStudyBoard
      </div>
    </div>
  );
}

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
        <BrandRow tile={72} wordmark={34} />

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

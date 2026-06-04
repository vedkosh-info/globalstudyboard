import { ImageResponse } from 'next/og';

export const alt = 'GlobalStudyBoard — Universities, Exams & Scholarships Worldwide';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Branded 1200x630 social card, drawn in code (no binary asset) so it stays
// on-brand and never goes stale. Used for og:image and (via re-export) twitter:image.
export default function OpengraphImage() {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '76px',
              height: '76px',
              borderRadius: '18px',
              backgroundColor: '#FFF8E7',
              color: '#14532D',
              fontSize: '46px',
              fontWeight: 700,
            }}
          >
            G
          </div>
          <div style={{ display: 'flex', color: '#FFF8E7', fontSize: '36px', fontWeight: 600 }}>
            GlobalStudyBoard
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              color: '#FFF8E7',
              fontSize: '66px',
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-1.5px',
              maxWidth: '980px',
            }}
          >
            {'Universities, Exams & Scholarships — Worldwide'}
          </div>
          <div
            style={{
              display: 'flex',
              color: '#F0A37C',
              fontSize: '30px',
              fontWeight: 600,
              marginTop: '26px',
            }}
          >
            {'Free, source-verified admission guidance'}
          </div>
        </div>
        <div style={{ display: 'flex', color: 'rgba(255,248,231,0.72)', fontSize: '26px' }}>
          {'USA · UK · Europe · Canada · Australia · India · and more'}
        </div>
      </div>
    ),
    { ...size },
  );
}

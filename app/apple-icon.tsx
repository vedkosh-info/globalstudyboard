import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// Apple touch icon (home-screen) — code-drawn monogram on brand green.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#14532D',
          color: '#FFF8E7',
          fontSize: '112px',
          fontWeight: 700,
          fontFamily: 'serif',
        }}
      >
        G
      </div>
    ),
    { ...size },
  );
}

'use client';
import Script from 'next/script';
import { useEffect } from 'react';

interface GoogleAdProps {
  /** Ad unit slot ID from your AdSense dashboard */
  slot: string;
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: { [key: string]: unknown }[];
  }
}

// Add NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXX to your .env.local
const PUB_ID = process.env.NEXT_PUBLIC_ADSENSE_ID;

export default function GoogleAd({ slot, format = 'auto', className = '' }: GoogleAdProps) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* AdSense blocked or not yet loaded */
    }
  }, []);

  if (!PUB_ID) return null;

  return (
    <>
      <Script
        id="adsense-loader"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUB_ID}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <div className={`overflow-hidden ${className}`} aria-label="Advertisement">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={PUB_ID}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </>
  );
}

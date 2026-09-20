import { preload } from 'react-dom';
import { Info } from 'lucide-react';
import type { ImageAsset } from '@/lib/images';

// The ONE way images render on GlobalStudyBoard. Server component — never add
// 'use client' (nothing here is interactive, and the registry must stay off the
// client bundle).
//
// - Pre-encoded static files from public/images (AVIF primary, WebP fallback) served
//   straight from the CDN with a 1-year immutable cache (next.config.js headers) —
//   zero Vercel image-transformation cost.
// - Explicit width/height → the browser reserves the box before load → zero CLS.
// - Lazy by default; `priority` for the single LCP hero (eager + fetchPriority=high
//   + a <link rel=preload> in <head> so the scanner finds it before the body parses).
// - `alt` is required by the registry and is always honest (describes what is shown).
// - ALWAYS labelled, ON the image. Independent QA (22 Aug 2026, content-policy §14)
//   ruled that a line on /disclaimer alone is not sufficient: consumer/advertising law
//   across our audience countries turns on the impression created ON THE PAGE, and the
//   European Commission's Art. 50 FAQ (Art. 50 applies since 2 Aug 2026) says a
//   disclosure must be perceivable — e.g. a visible label — "upon first exposure at the
//   latest". Every image is an AI archetype (owner decision 12 Sep 2026 — no real
//   photographs), so the label always says so. Owner decision 20 Sep 2026: wording
//   "AI-generated · not a photo", no popup, the text itself linked to the image policy,
//   Back must work. The pill form and top-right placement follow the 18 Sep 16-agent
//   review, which rejected an icon-only cue: a bare (i) reads as "credit", so the page
//   would still give the impression of a real photograph to everyone who never clicks.
//   Words always visible, no client JavaScript. The pill is a plain <a> (full
//   navigation), so the browser Back button returns to this page with its scroll
//   position, exactly as before.

interface Props {
  /** From imageFor(); null renders nothing (never a placeholder). */
  asset: ImageAsset | null;
  /** hero = full width (nominally 1400w, 16:9); card = grid thumb (nominally 560w). */
  variant?: 'hero' | 'card';
  /** True for the page's LCP image only. */
  priority?: boolean;
  /**
   * Set on pages about a NAMED real entity (a college profile). The image is an
   * archetype, and sitting beside a real institution's name it must say so plainly.
   * Constrained flag, not free text, so a caller cannot write a misleading caption.
   */
  representative?: boolean;
  /** Override the responsive `sizes` hint for a non-standard slot (e.g. a side column). */
  sizes?: string;
  className?: string;
}

const SIZES = {
  hero: '(min-width: 1024px) 768px, (min-width: 640px) 90vw, 100vw',
  card: '(min-width: 1024px) 360px, (min-width: 640px) 45vw, 100vw',
} as const;

const DISCLAIMER_ANCHOR = '/disclaimer#ai-generated-images';

export default function ContentImage({
  asset,
  variant = 'hero',
  priority = false,
  representative = false,
  sizes: sizesOverride,
  className = '',
}: Props) {
  if (!asset) return null;

  const hero = variant === 'hero';
  const width = hero ? asset.width : asset.widthSm;
  const height = hero ? asset.height : asset.heightSm;
  const sizes = sizesOverride ?? SIZES[variant];
  // Width descriptors come from the registry's TRUE pixel sizes, never hard-coded:
  // a source that came back at 1024px (the known silently-ignored-imageSize bug) must
  // not be advertised to the browser as 1400w.
  const avif = hero ? `${asset.srcSm} ${asset.widthSm}w, ${asset.src} ${asset.width}w` : asset.srcSm;
  const webp = hero ? `${asset.srcSmWebp} ${asset.widthSm}w, ${asset.srcWebp} ${asset.width}w` : asset.srcSmWebp;
  const fallback = hero ? asset.srcWebp : asset.srcSmWebp;

  if (priority) {
    // Emitted into <head> by React, ahead of the render-blocking stylesheet, so the
    // LCP image starts downloading before the parser reaches the <picture> in the body.
    preload(asset.src, { as: 'image', type: 'image/avif', imageSrcSet: avif, imageSizes: sizes, fetchPriority: 'high' });
  }

  // Both wordings are unconditionally true for every image in the library. "Institution"
  // (not "campus" / "university") is the one noun true for all 118 college records and
  // has no "another campus of the same university" reading on multi-campus universities.
  const negation = representative ? 'not this institution' : 'not a photo';

  return (
    <figure className={`relative m-0 ${className}`.trim()}>
      <picture>
        <source type="image/avif" srcSet={avif} sizes={sizes} />
        <source type="image/webp" srcSet={webp} sizes={sizes} />
        {/* Plain <img> on purpose: the asset is already optimised on disk, so next/image
            would only add per-request transformation cost (and a Vercel quota) for no gain. */}
        <img
          src={fallback}
          alt={asset.alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          className={`w-full h-auto bg-cream-100 border border-stone-200 ${hero ? 'rounded-2xl' : 'rounded-xl'}`}
        />
      </picture>
      {/*
        The disclosure, overlaid top-right INSIDE the figure (12px inset clears the
        rounded corner). Cream text on ink/75 composites to ≥9:1 against ANY pixel behind
        it, including a pure-white sky (WCAG 1.4.3, AAA), so the control is identified by
        its text and 1.4.11 needs no boundary contrast; the 1px cream ring is a cosmetic
        edge, not the contrast mechanism. A light pill was measured at ~1:1 against skies
        — never use one here. text-xs (12px) is the site's floor for load-bearing
        disclosures (footer disclaimer, LastUpdated); never smaller — this label is a
        legal statement. The global terracotta focus ring is invisible over warm photos,
        so this link carries its own cream outline + dark halo.
      */}
      <figcaption
        className={`absolute z-10 max-w-[calc(100%-1.5rem)] ${hero ? 'top-3 right-3' : 'top-2 right-2'}`}
      >
        <a
          href={DISCLAIMER_ANCHOR}
          // print: Chromium's PDF compositor drops any element carrying backdrop-filter —
          // the whole pill, text included — so the blur is switched off for print and the
          // dark fill is forced to print (economy mode would otherwise leave cream-on-white).
          className={`inline-flex items-center rounded-full bg-ink/75 font-semibold text-cream-50 no-underline ring-1 ring-cream-50/40 shadow-sm backdrop-blur-sm hover:bg-ink/90 hover:no-underline hover:text-cream-50 motion-safe:transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-cream-50 focus-visible:outline-offset-2 focus-visible:shadow-[0_0_0_5px_rgba(10,10,10,0.6)] print:backdrop-blur-none print:bg-ink print:[print-color-adjust:exact] print:[-webkit-print-color-adjust:exact] ${
            hero ? 'h-8 gap-1.5 px-2.5 text-xs' : 'h-7 gap-1 px-2 text-xs'
          }`}
        >
          {/* Screen readers hear "AI-generated, not a photo" (the middle dot is decorative). */}
          <span>
            AI-generated
            <span aria-hidden="true"> · </span>
            <span className="sr-only">, </span>
            {negation}
          </span>
          <Info aria-hidden="true" className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
          <span className="sr-only"> — read how we use AI images</span>
        </a>
      </figcaption>
    </figure>
  );
}

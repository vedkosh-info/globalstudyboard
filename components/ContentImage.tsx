import { preload } from 'react-dom';
import AiImageBadge from '@/components/AiImageBadge';
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
//   "AI-generated · not a photo", the text itself linked to the image policy, Back
//   must work. Owner decision 22 Sep 2026 (an EXPLICIT OVERRIDE, logged in the audit
//   log — the 18 Sep review had recommended the words stay visible at rest): only
//   the circular (i) shows by default; a click reveals the words beside it in the
//   same pill, and the revealed text is a plain <a> (full navigation, so Back returns
//   here with scroll intact). The words are still in the server HTML and in the
//   button's accessible name, so crawlers and screen readers get the disclosure
//   without a click. Rendered by the tiny client island AiImageBadge, which receives
//   ONLY strings — the registry never reaches the client bundle.

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
      {/* The disclosure, top-right INSIDE the figure (12px inset clears the rounded
          corner); collapsed to the (i) at rest — see AiImageBadge for the behaviour
          and the contrast/print notes. The figcaption keeps the image ↔ caption
          semantics; the visible middle dot is decorative, the spoken form uses a comma. */}
      <figcaption
        className={`absolute z-10 max-w-[calc(100%-1.5rem)] ${hero ? 'top-3 right-3' : 'top-2 right-2'}`}
      >
        <AiImageBadge
          label={`AI-generated \u00b7 ${negation}`}
          spokenLabel={`AI-generated, ${negation}`}
          href={DISCLAIMER_ANCHOR}
          variant={variant}
        />
      </figcaption>
    </figure>
  );
}

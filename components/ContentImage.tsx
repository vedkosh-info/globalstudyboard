import { preload } from 'react-dom';
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
// - ALWAYS labelled. Independent QA (22 Aug 2026, content-policy §14) ruled that a line
//   on /disclaimer alone is not sufficient: consumer/advertising law across our audience
//   countries turns on the impression created ON THE PAGE. Every image is an AI archetype
//   (owner decision 12 Sep 2026 — no real photographs), so the caption always says so.
//   A grid may suppress the per-image caption ONLY by passing `sharedLabelId` — the DOM
//   id of the one shared caption it renders itself — and never for `representative`.

interface Props {
  /** From imageFor(); null renders nothing (never a placeholder). */
  asset: ImageAsset | null;
  /** hero = full width (nominally 1400w, 16:9); card = grid thumb (nominally 560w). */
  variant?: 'hero' | 'card';
  /** True for the page's LCP image only. */
  priority?: boolean;
  /**
   * Suppress this image's own caption because the PARENT renders one shared caption
   * for the whole grid — pass that caption element's DOM id. The image is then linked
   * to it for assistive technology via aria-describedby. Ignored when `representative`.
   */
  sharedLabelId?: string;
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
  sharedLabelId,
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

  // Both wordings are unconditionally true for every image in the library.
  const label = representative
    ? 'AI-generated image — not a photograph of this institution'
    : 'AI-generated image — not a photograph of a real place';
  const ownLabel = representative || !sharedLabelId;

  return (
    <figure className={`m-0 ${className}`.trim()} aria-describedby={ownLabel ? undefined : sharedLabelId}>
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
      {ownLabel && (
        // text-xs (12px) is the site's floor for load-bearing disclosures (footer
        // disclaimer, LastUpdated). Never smaller — this caption is a legal statement.
        <figcaption className={`text-xs text-stone-600 ${hero ? 'mt-2' : 'mt-1.5'}`}>
          <a
            href={DISCLAIMER_ANCHOR}
            className="hover:text-forest-700 underline decoration-stone-300 underline-offset-2"
          >
            {label}
          </a>
        </figcaption>
      )}
    </figure>
  );
}

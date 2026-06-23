import type { ComponentType } from 'react';
import { US, CA, GB, EU, AU, RU, AE, IN } from 'country-flag-icons/react/3x2';
import type { RegionSlug } from '@/lib/regions';

/**
 * Region flag as an inline SVG — renders identically on every platform.
 * (Emoji flags like 🇺🇸 do NOT render on Windows, which ships no flag font and
 * shows the country-code letters instead.) Self-hosted SVG, CSP-safe, no network.
 *
 * Pass a Tailwind height (`h-4`, `h-5`, …); width is derived from the 3:2 box.
 */
type FlagComponent = ComponentType<{ className?: string; title?: string }>;

const FLAG_BY_REGION: Record<RegionSlug, FlagComponent> = {
  usa: US,
  canada: CA,
  'uk-ireland': GB,
  europe: EU,
  'australia-nz': AU,
  russia: RU,
  'middle-east': AE,
  india: IN,
};

export default function RegionFlag({
  slug,
  className = 'h-4',
}: {
  slug: RegionSlug;
  className?: string;
}) {
  const Flag = FLAG_BY_REGION[slug];
  if (!Flag) return null;
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 overflow-hidden rounded-[3px] align-[-0.15em] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] ${className}`}
    >
      <Flag className="h-full w-auto" />
    </span>
  );
}

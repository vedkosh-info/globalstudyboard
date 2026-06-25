'use client';

import { AUDIENCE_CHOICES, AUDIENCE_LABEL, defaultAudienceFor } from '@/lib/audience';
import { useAudience } from '@/components/AudienceProvider';
import { useRegion } from '@/components/RegionProvider';

/**
 * Compact "Domestic / International" status toggle. A global, session-level
 * preference: when unset, each page uses its own default (domestic for India,
 * international elsewhere). No popup — it just sits in the context bar and quietly
 * re-skins the audience-specific blocks on pages that have them.
 */
export default function AudienceToggle() {
  const { chosenAudience, setAudience } = useAudience();
  const { pageRegion, effectiveRegion } = useRegion();
  const pageDefault = defaultAudienceFor(pageRegion ?? effectiveRegion);
  const active = chosenAudience ?? pageDefault;

  return (
    <div
      role="group"
      aria-label="I am a domestic or international student"
      className="flex shrink-0 items-center rounded-full border border-forest-200 bg-white p-0.5"
    >
      {AUDIENCE_CHOICES.map((a) => {
        const on = a === active;
        return (
          <button
            key={a}
            type="button"
            onClick={() => setAudience(a)}
            aria-pressed={on}
            className={
              on
                ? 'rounded-full bg-forest-700 px-2.5 py-1 text-xs font-semibold text-cream-50 transition-colors'
                : 'rounded-full px-2.5 py-1 text-xs font-medium text-stone-600 transition-colors hover:text-forest-700'
            }
          >
            {AUDIENCE_LABEL[a]}
          </button>
        );
      })}
    </div>
  );
}

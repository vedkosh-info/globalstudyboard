'use client';

import type { ReactNode } from 'react';
import type { Audience, AudienceChoice } from '@/lib/audience';
import { isAudienceVisible } from '@/lib/audience';
import { useAudience } from '@/components/AudienceProvider';

/**
 * Wraps an audience-specific block. The block ALWAYS renders into the server
 * HTML (so crawlers and direct-link visitors read it); it is only hidden with a
 * `hidden` class when it doesn't match the active audience.
 *
 * `active = chosenAudience ?? pageDefault`. `pageDefault` is computed by the
 * server page from its own region (`defaultAudienceFor(region)`), so SSR and the
 * first client render agree — there is no hydration flash for the default
 * audience; the class only changes if the visitor explicitly toggles.
 *
 * A `common` (or untagged) block has no gate — it shows to everyone.
 */
export default function AudienceGate({
  audience,
  pageDefault,
  children,
}: {
  audience: Audience | undefined;
  pageDefault: AudienceChoice;
  children: ReactNode;
}) {
  const { chosenAudience } = useAudience();
  const active = chosenAudience ?? pageDefault;
  const hidden = !isAudienceVisible(audience, active);
  return (
    <div data-audience={audience ?? 'common'} className={hidden ? 'hidden' : undefined}>
      {children}
    </div>
  );
}

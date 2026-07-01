'use client';

import { useEffect, useState } from 'react';
import { List } from 'lucide-react';

import type { Audience, AudienceChoice } from '@/lib/audience';
import { isAudienceVisible } from '@/lib/audience';
import { useAudience } from '@/components/AudienceProvider';

export interface TocItem {
  label: string;
  anchor: string;
  /** Audience this section serves — the ToC entry hides in sync with the section. */
  audience?: Audience;
}

/**
 * "On this page" table of contents. Server-provided section list; renders jump
 * links to each section's stable #anchor, hides audience-specific entries in sync
 * with the reader's toggle, and highlights the section currently in view
 * (IntersectionObserver, progressive — links work with JS off). Premium, compact,
 * fully responsive; motion respects `prefers-reduced-motion` via global CSS.
 */
export default function OnThisPage({
  items,
  pageDefault,
}: {
  items: TocItem[];
  pageDefault: AudienceChoice;
}) {
  const { chosenAudience } = useAudience();
  const active = chosenAudience ?? pageDefault;
  const visible = items.filter((it) => isAudienceVisible(it.audience, active));

  const [current, setCurrent] = useState<string>('');

  useEffect(() => {
    const ids = visible.map((it) => it.anchor);
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const onscreen = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (onscreen[0]?.target.id) setCurrent(onscreen[0].target.id);
      },
      // Trigger a little below the sticky header, before the section leaves the top.
      { rootMargin: '-96px 0px -66% 0px', threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // Re-run when the visible set changes (audience toggle).
  }, [visible.map((v) => v.anchor).join('|')]); // eslint-disable-line react-hooks/exhaustive-deps

  if (visible.length < 3) return null;

  return (
    <nav
      aria-label="On this page"
      className="rounded-2xl border border-stone-200 bg-cream-50 p-5"
    >
      <p className="m-0 mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
        <List className="h-3.5 w-3.5 text-forest-600" aria-hidden="true" />
        On this page
      </p>
      <ul className="m-0 grid list-none grid-cols-1 gap-x-6 gap-y-1.5 p-0 sm:grid-cols-2">
        {visible.map((it) => {
          const isCurrent = current === it.anchor;
          return (
            <li key={it.anchor} className="m-0">
              <a
                href={`#${it.anchor}`}
                aria-current={isCurrent ? 'location' : undefined}
                className={`block border-l-2 py-0.5 pl-3 text-sm no-underline hover:no-underline transition-colors ${
                  isCurrent
                    ? 'border-forest-600 font-medium text-forest-800'
                    : 'border-stone-200 text-stone-600 hover:border-forest-300 hover:text-forest-700'
                }`}
              >
                {it.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

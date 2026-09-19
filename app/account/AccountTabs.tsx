'use client';

import { useEffect, useRef, type KeyboardEvent } from 'react';
import type { LucideIcon } from 'lucide-react';

/**
 * Tab strip for /account — a real WAI-ARIA tablist (the VedKosh account page's
 * pattern): ArrowLeft/ArrowRight cycle (wrapping), Home/End jump, roving
 * tabIndex so exactly one tab is in the page tab order, and aria-selected +
 * aria-controls wiring to always-mounted panels (hidden, never unmounted, so a
 * half-typed name or an open delete confirmation is never discarded by a tab
 * change).
 */

export interface AccountTab {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const tabButtonId = (id: string) => `acct-tab-${id}`;
export const tabPanelId = (id: string) => `acct-panel-${id}`;

export default function AccountTabs({
  tabs,
  activeId,
  onChange,
}: {
  tabs: AccountTab[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  // Only a KEYBOARD move should steal focus; a pointer click already focused
  // the button it hit.
  const pendingFocus = useRef<string | null>(null);

  useEffect(() => {
    const id = pendingFocus.current;
    if (!id) return;
    pendingFocus.current = null;
    const el = btnRefs.current[id];
    if (!el) return;
    el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    el.focus({ preventScroll: true });
  }, [activeId]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = tabs.findIndex((t) => t.id === activeId);
    if (idx < 0) return;
    let next: number;
    if (e.key === 'ArrowRight') next = (idx + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    else return;
    e.preventDefault();
    const target = tabs[next];
    if (!target) return;
    pendingFocus.current = target.id;
    onChange(target.id);
  };

  return (
    <div
      role="tablist"
      aria-label="Account sections"
      aria-orientation="horizontal"
      onKeyDown={onKeyDown}
      className="flex flex-wrap gap-2"
    >
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              btnRefs.current[tab.id] = el;
            }}
            type="button"
            role="tab"
            id={tabButtonId(tab.id)}
            aria-selected={active}
            aria-controls={tabPanelId(tab.id)}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-1 ${
              active
                ? 'border-forest-600 bg-forest-50 text-forest-800'
                : 'border-stone-300 bg-white text-stone-700 hover:border-forest-300 hover:bg-forest-50/60'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

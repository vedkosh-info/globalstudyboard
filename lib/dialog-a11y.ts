'use client';

import { lockBodyScroll, unlockBodyScroll } from '@/lib/scroll-lock';

/**
 * The modal-dialog treatment every in-page dialog on the site shares:
 * `lockBackground()` locks body scroll and makes the page `inert`, and
 * `trapTab()` keeps Tab / Shift+Tab cycling inside the panel.
 *
 * Shared by the notification, feedback, sign-in, tester and response-report
 * dialogs so their background behavior cannot drift. The BACKGROUND list must be
 * extended by hand whenever a new top-level chrome element is added.
 */

export const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

/**
 * Everything that must go inert while a dialog is open. `header`/`main`/`footer`
 * are the page; the context bar sits BETWEEN header and main so a three-selector
 * sweep misses it; the notification panel is portaled to the body; the
 * quick-actions dock is a top-level sibling of the dialog and would otherwise
 * stay tabbable underneath it.
 */
export const BACKGROUND = ['header', 'main', 'footer', '[data-gsb-context-bar]', '[data-gsb-notifications]', '[data-gsb-skip-link]', '.gsb-dock'];

const inertLocks = new WeakMap<Element, { count: number; previous: string | null }>();

/** Lock body scroll + inert the page; returns the function that undoes both. */
export function lockBackground(exclude?: Element | null): () => void {
  lockBodyScroll();
  // A portaled dialog may contain a semantic header of its own. Never inert
  // its descendants or its outer wrapper along with the page chrome.
  const background = Array.from(new Set(BACKGROUND.flatMap((sel) => Array.from(document.querySelectorAll(sel)))))
    .filter((el) => !exclude || (el !== exclude && !el.contains(exclude) && !exclude.contains(el)));
  background.forEach((el) => {
    const existing = inertLocks.get(el);
    if (existing) existing.count += 1;
    else inertLocks.set(el, { count: 1, previous: el.getAttribute('inert') });
    el.setAttribute('inert', '');
  });
  let released = false;
  return () => {
    if (released) return;
    released = true;
    background.forEach((el) => {
      const lock = inertLocks.get(el);
      if (!lock || --lock.count > 0) return;
      if (lock.previous === null) el.removeAttribute('inert');
      else el.setAttribute('inert', lock.previous);
      inertLocks.delete(el);
    });
    unlockBodyScroll();
  };
}

/**
 * Keep Tab cycling inside `panel`. `el.tabIndex >= 0` matters: the bare `input`
 * in FOCUSABLE also matches off-screen honeypots and hidden file inputs (both
 * tabIndex={-1}); real Tab skips them, but they must never become a wrap target.
 */
export function trapTab(e: { key: string; shiftKey: boolean; preventDefault: () => void }, panel: HTMLElement | null): void {
  if (e.key !== 'Tab' || !panel) return;
  const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.getClientRects().length > 0 && el.tabIndex >= 0 && !el.matches(':disabled') && !el.closest('[inert]'),
  );
  if (items.length === 0) {
    e.preventDefault();
    panel.focus();
    return;
  }
  const first = items[0];
  const last = items[items.length - 1];
  const activeEl = document.activeElement;
  if (e.shiftKey && (activeEl === first || activeEl === panel)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && (activeEl === last || activeEl === panel)) {
    e.preventDefault();
    first.focus();
  }
}

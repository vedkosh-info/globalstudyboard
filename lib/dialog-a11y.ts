'use client';

/**
 * The modal-dialog treatment every in-page dialog on the site shares:
 * `lockBackground()` locks body scroll and makes the page `inert`, and
 * `trapTab()` keeps Tab / Shift+Tab cycling inside the panel.
 *
 * Extracted from TesterInviteModal (which still carries its own verbatim copy —
 * migrate it here when it is next touched) so the two feedback dialogs and any
 * future dialog cannot drift: in particular the BACKGROUND list, which must be
 * extended by hand whenever a new top-level chrome element is added.
 */

export const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Everything that must go inert while a dialog is open. `header`/`main`/`footer`
 * are the page; the context bar sits BETWEEN header and main so a three-selector
 * sweep misses it; the quick-actions dock is a top-level sibling of the dialog
 * and would otherwise stay tabbable underneath it.
 */
export const BACKGROUND = ['header', 'main', 'footer', '[data-gsb-context-bar]', '.gsb-dock'];

/** Lock body scroll + inert the page; returns the function that undoes both. */
export function lockBackground(): () => void {
  const previous = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  const background = BACKGROUND.flatMap((sel) => Array.from(document.querySelectorAll(sel)));
  background.forEach((el) => el.setAttribute('inert', ''));
  return () => {
    document.body.style.overflow = previous;
    background.forEach((el) => el.removeAttribute('inert'));
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
    (el) => el.offsetParent !== null && el.tabIndex >= 0,
  );
  if (items.length === 0) return;
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

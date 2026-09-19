/**
 * Body scroll lock for modal overlays (sign-in sheet, tester-invite dialog).
 *
 * Why not `body { overflow: hidden }`: globals.css gives <html> a non-visible
 * `overflow-x` (hidden), and per CSS overflow propagation that stops <body>'s
 * overflow from reaching the viewport — so the classic idiom never locked
 * anything here (measured on production, Sept 2026: with the tester-invite
 * dialog open and `body.style.overflow === 'hidden'`, a wheel event still
 * scrolled the page 0 → 406 px). VedKosh hit the identical bug.
 *
 * Mechanism: `body.gsb-scroll-lock` (globals.css) sets `position: fixed;
 * inset-inline: 0` — the page leaves the scroll flow, so there is nothing left
 * to scroll. `top: -scrollY` keeps the same pixels painted behind the overlay,
 * and a padding-right equal to the vanished scrollbar prevents a desktop layout
 * shift. Deliberately NOT overflow-based: an overflow-y on html/body would kill
 * the header's position:sticky site-wide.
 *
 * Ref-counted so stacked lockers compose: the scroll position is captured by
 * the first lock and restored only when the last locker releases.
 */

let lockCount = 0;
let savedScrollY = 0;
/** The path the scroll offset was captured on — restoring it on another page would be wrong. */
let savedPath = '';

export function lockBodyScroll(): void {
  if (typeof window === 'undefined') return;
  lockCount += 1;
  if (lockCount > 1) return;
  const body = document.body;
  savedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  savedPath = window.location.pathname;
  // Measure the viewport scrollbar BEFORE fixing the body (it disappears after).
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  body.style.top = `-${savedScrollY}px`;
  if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
  body.classList.add('gsb-scroll-lock');
}

export function unlockBodyScroll(): void {
  if (typeof window === 'undefined' || lockCount === 0) return;
  lockCount -= 1;
  if (lockCount > 0) return;
  const body = document.body;
  body.classList.remove('gsb-scroll-lock');
  body.style.top = '';
  body.style.paddingRight = '';
  // A locker that closes BECAUSE the route changed (the sign-in sheet closes
  // on navigation) must not drag the new page to the old page's offset — it
  // would land the visitor mid-page on a page they have not seen yet.
  if (window.location.pathname !== savedPath) return;
  // Restore instantly: html has scroll-behavior: smooth, which would otherwise
  // animate this jump.
  const html = document.documentElement;
  const prevBehavior = html.style.scrollBehavior;
  html.style.scrollBehavior = 'auto';
  window.scrollTo(0, savedScrollY);
  html.style.scrollBehavior = prevBehavior;
}

'use client';

import { useEffect, useState } from 'react';
import { useRegion } from '@/components/RegionProvider';
import { resumableFragment } from '@/lib/auth-events';
import { REGION_SLUGS, type RegionSlug } from '@/lib/regions';
import { REGION_HINT_KEY, TOOLS } from '@/lib/tools';

/**
 * The destination a DESTINATION page hands to a tool (review, CRIT2-2).
 *
 * The tools follow the header (`effectiveRegion` = the remembered choice ??
 * the page's own destination ?? India), and a /tools page declares no
 * destination of its own — so a visitor who had not chosen one and clicked
 * "Budget for the United States" on the USA hub got the INDIA budget, in
 * rupees. Links from destination pages therefore carry the destination as a
 * fragment, `#region=<slug>` (`toolHref(slug, region)`, `scoreTrackerHref`),
 * and every tool and report gate mounts this hook, which:
 *
 * - validates the slug against REGION_SLUGS and hands it to the region engine
 *   as the page's own destination (`setPageRegion`) — the same provisional
 *   skin a `<PageRegion>` gives a guide or a hub. It is never written to the
 *   cookie, and it never beats a remembered choice: the engine always ranks
 *   the visitor's own choice first (§16.2–16.3, one destination control);
 * - LEAVES `region=` in the address bar. It is inert for search (a fragment
 *   never reaches the server), never remembered and never over a remembered
 *   choice — and it is what keeps the destination through a reload (the
 *   "Reload page" buttons, a refresh), Back/Forward and a redirect sign-in
 *   (lib/auth-events `resumableFragment`). Stripping it sent every one of
 *   those back to India (review G8-SK-2);
 * - carries it to the NEXT tool page — the tool's report, the report's way
 *   back, or another tool (the tracker's "Open the Application Planner") —
 *   and writes it into that page's address bar too, so the report survives a
 *   reload as well. Leaving for any other page releases it: a
 *   destination-neutral page shows the default again, exactly as after
 *   leaving a guide.
 *
 * Returns true once the hint has been read and applied. The gate renders the
 * tool only then, so a tool never draws its first frame for the wrong
 * destination — the tools re-tune when the destination changes, but that
 * would first close a form or flash another destination's list. The URL is
 * read in an effect, not during render: after a client-side navigation Next
 * writes the new URL during the commit (useInsertionEffect), so a render-time
 * read would still see the page the visitor came from.
 */

function isRegionSlug(value: string | null): value is RegionSlug {
  return value !== null && (REGION_SLUGS as readonly string[]).includes(value);
}

function regionIn(fragment: string): RegionSlug | null {
  const value = new URLSearchParams(fragment).get(REGION_HINT_KEY);
  return isRegionSlug(value) ? value : null;
}

const hintInHash = (): RegionSlug | null => regionIn(window.location.hash.slice(1));

/** `/tools/<slug>` or `/tools/<slug>/report` for a tool in the registry — the paths that mount a gate. */
const TOOL_PATH = /^\/tools\/([a-z0-9]+(?:-[a-z0-9]+)*)(?:\/report)?\/?$/;
function isToolPath(pathname: string): boolean {
  const slug = TOOL_PATH.exec(pathname)?.[1];
  return slug !== undefined && TOOLS.some((t) => t.slug === slug);
}

/**
 * Put a handed-over fragment into the address bar, keeping any allow-listed
 * key already there (an address-bar `region=` wins over a carried one). Only
 * the allow-listed shapes are ever written, and a fragment of some other kind
 * already in the URL is left alone.
 */
function restoreFragment(fragment: string): void {
  if (!resumableFragment(`#${fragment}`)) return;
  const current = window.location.hash;
  if (current && !resumableFragment(current)) return;
  const params = new URLSearchParams(current.slice(1));
  let changed = false;
  new URLSearchParams(fragment).forEach((value, key) => {
    if (params.has(key)) return;
    params.set(key, value);
    changed = true;
  });
  const next = `#${params.toString()}`;
  if (!changed || !resumableFragment(next)) return;
  // Next's own history state is kept, as the tracker's `exam=` strip does.
  window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search + next);
}

/**
 * A fragment waiting for the gate that mounts at `to`. Two things set it:
 *
 * - a gate that is left for another tool page (the carry). The decision is made
 *   in the gate's cleanup from `location.pathname`, which already holds the
 *   destination by then (Next writes the URL in the commit's insertion phase;
 *   a Back/Forward changes it before popstate) — not by a timer, because a
 *   report page wraps its gate in <Suspense>, and on a slow link the gate
 *   mounts in a LATER commit than the one that unmounted the tool (G8-SK-3).
 *   The header shows the default while that loading screen is up — the old
 *   gate must release its destination, since nothing else would if the
 *   visitor left before the new one arrived — and the carried destination
 *   returns when the gate mounts;
 * - a ToolLink click (components/tools/ToolLink): the link navigates to the
 *   bare path and hands the fragment over here, because Next scrolls a
 *   fragment-bearing navigation to the page's first element when no element
 *   has that id — the site header and the destination control ended up above
 *   the viewport (G8-SK-5).
 *
 * Every gate mount takes it (or discards it); the ToolLink that set one
 * releases it if its page is left for somewhere else; app/tools/error.tsx
 * settles it; and it expires after a minute, so a navigation abandoned on a
 * loading screen is never picked up by a later, unrelated visit.
 */
export interface ToolHandOff {
  to: string;
  fragment: string;
  at: number;
  /** The page a ToolLink was clicked on (null for a carry). */
  from: string | null;
}

const HAND_OFF_TTL_MS = 60_000;
let pending: ToolHandOff | null = null;

/** Hand `fragment` to the gate that mounts at `to` (ToolLink). */
export function handOffToTool(to: string, fragment: string): ToolHandOff {
  pending = { to, fragment, at: Date.now(), from: window.location.pathname };
  return pending;
}

/**
 * ToolLink's cleanup: drop `handOff` once the visitor has gone somewhere that
 * is neither its tool nor the page it was clicked on (a later click
 * superseded it). A link that unmounts while its page is still showing keeps
 * it — the navigation may still be on its way.
 */
export function releaseHandOff(handOff: ToolHandOff): void {
  const here = window.location.pathname;
  if (pending === handOff && here !== handOff.to && here !== handOff.from) pending = null;
}

/**
 * The /tools error boundary: the gate a hand-off was waiting for is gone. Park
 * it in the address bar when it was meant for this page (so "Reload page"
 * still opens on that destination), then drop it, so a later visit reached
 * through another page never picks it up.
 */
export function settleHandOffs(): void {
  if (pending && pending.to === window.location.pathname) restoreFragment(pending.fragment);
  pending = null;
}

export function useDestinationHint(): boolean {
  const { setPageRegion } = useRegion();
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const handed = pending && pending.to === window.location.pathname && Date.now() - pending.at < HAND_OFF_TTL_MS ? pending.fragment : null;
    pending = null;
    if (handed) restoreFragment(handed);

    let held: RegionSlug | null = null;
    const apply = (slug: RegionSlug) => {
      held = slug;
      setPageRegion(slug);
    };
    // The address bar decides whenever it names a destination (an unknown one
    // is ignored, not replaced); the handed-over value covers only a URL that
    // carried a fragment of another kind, which restoreFragment leaves alone.
    const urlNamesOne = new URLSearchParams(window.location.hash.slice(1)).has(REGION_HINT_KEY);
    const first = urlNamesOne ? hintInHash() : handed ? regionIn(handed) : null;
    if (first) apply(first);
    setSettled(true);

    // The same fragment arriving without a page load (edited in the address bar).
    const onHash = () => {
      const next = hintInHash();
      if (next) apply(next);
    };
    window.addEventListener('hashchange', onHash);
    return () => {
      window.removeEventListener('hashchange', onHash);
      if (!held) return;
      setPageRegion(null);
      const to = window.location.pathname;
      if (isToolPath(to)) pending = { to, fragment: `${REGION_HINT_KEY}=${held}`, at: Date.now(), from: null };
    };
  }, [setPageRegion]);

  return settled;
}

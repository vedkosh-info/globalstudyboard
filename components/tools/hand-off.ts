/**
 * The in-memory hand-over of a `#region=` (or `#exam=`) fragment to the tool
 * gate that mounts next — see components/tools/useDestinationHint for the full
 * contract. Kept in its own module, with no registry import, so ToolLink can be
 * used by the site chrome (the header nav, the strip under it and the dock
 * render on every page) without pulling lib/tools into the layout bundle.
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
 * The site chrome's pathname effect (components/ToolsEntranceLink, mounted on
 * every page): a navigation that lands anywhere other than the hand-off's tool
 * or the page it was clicked on releases it. releaseHandOff alone cannot cover
 * the chrome's Tools links — the header and strip links never unmount, and the
 * dock and menu links unmount during the click, while the page is still `from`
 * — so without this an abandoned Tools click stayed live for its whole TTL and
 * skinned a later, unrelated /tools visit. A carry (`from` null) is kept only
 * at its destination.
 */
export function notePath(pathname: string): void {
  if (pending && pathname !== pending.to && pathname !== pending.from) pending = null;
}

/** A gate mounting at `pathname` takes the fragment meant for it (fresh only) and clears the slot either way. */
export function takeHandOff(pathname: string): string | null {
  const handed = pending && pending.to === pathname && Date.now() - pending.at < HAND_OFF_TTL_MS ? pending.fragment : null;
  pending = null;
  return handed;
}

/** A gate being left for another tool page carries its destination to it. */
export function carryHandOff(to: string, fragment: string): void {
  pending = { to, fragment, at: Date.now(), from: null };
}

/** The error boundary's view: the pending hand-off (if any), then clear it. */
export function drainHandOff(): ToolHandOff | null {
  const p = pending;
  pending = null;
  return p;
}

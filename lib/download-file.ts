/**
 * Saving a file the student asked for.
 *
 * Safari, and every browser on an iPhone or an iPad, drops a download that
 * starts after an await: the tap's permission is already gone. Those browsers
 * need a tab opened in the same tap, before the wait. Firefox cancels a save
 * when the link is removed, or the blob address is revoked, in the same turn.
 * Other browsers keep a normal download.
 */

export function webKitNeedsTab(
  nav: { userAgent: string; platform: string; maxTouchPoints: number } | null =
    typeof navigator === 'undefined' ? null : navigator,
): boolean {
  if (!nav) return false;
  const ua = nav.userAgent;
  const iOS = /iP(ad|hone|od)/.test(ua) || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1);
  const desktopSafari = /Safari/i.test(ua) && !/Chrome|Chromium|CriOS|Edg|OPR|FxiOS|Firefox|Android/i.test(ua);
  return iOS || desktopSafari;
}

/** Open the holding tab in the same tap, before any await. Null everywhere else. */
export function openDownloadHold(): Window | null {
  if (typeof window === 'undefined' || !webKitNeedsTab()) return null;
  return window.open('about:blank', '_blank');
}

export function closeDownloadHold(hold: Window | null) {
  if (hold && !hold.closed) hold.close();
}

/**
 * Hand the browser a file. `hold` is the tab opened before an await, on
 * Safari and iOS only. Returns `tab` when the file opened there.
 */
export function saveBlob(blob: Blob, filename: string, hold: Window | null = null): 'tab' | 'file' {
  const url = URL.createObjectURL(blob);
  if (hold && !hold.closed) {
    hold.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return 'tab';
  }
  closeDownloadHold(hold);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  // Same-turn removal cancels the save in Firefox.
  setTimeout(() => a.remove(), 1_000);
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return 'file';
}

/**
 * Event dispatched by every "Get the Android app" trigger (footer, mobile menu,
 * quick-actions dock) to open the global <TesterInviteModal/>.
 *
 * Kept in `lib` rather than in either component so the triggers and the modal
 * share one source of truth without importing each other — and so a trigger
 * stays a two-line change instead of prop-drilling through the layout.
 */
export const OPEN_TESTER_INVITE_EVENT = 'gsb:open-tester-invite';

/** Open the invite modal from any client component. */
export function openTesterInvite(): void {
  window.dispatchEvent(new CustomEvent(OPEN_TESTER_INVITE_EVENT));
}

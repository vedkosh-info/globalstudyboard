/**
 * Native app links — one source of truth for every "Get the app" control.
 *
 * The Android app is a Trusted Web Activity wrapping www.globalstudyboard.com
 * (see `android-app/`). It is currently distributed through Google Play's
 * **internal testing** track only, so there is no public store listing yet:
 * `ANDROID_APP_URL` would 404 for anyone who is not already an enrolled tester.
 *
 * Until the app is public, every "Get the app" trigger opens
 * <TesterInviteModal/> to collect a prospective tester's Google-account email.
 * The owner then adds that address to the Play Console tester list and Play
 * emails the invite (see `scripts/apps-script/tester-invites-webapp.gs`).
 *
 * WHEN THE APP GOES PUBLIC: flip `ANDROID_APP_IS_PUBLIC` to `true`. The triggers
 * then link straight to `ANDROID_APP_URL` and the modal stays mounted but
 * dormant — nothing dispatches its open event, so it simply never opens. Keep
 * the harness: it is reused for the closed-testing phase and for iOS TestFlight.
 */

/** Play Console application ID. Must match `android-app/build.gradle`. */
export const ANDROID_PACKAGE_ID = 'com.bcode8labs.globalstudyboard';

/** Public Play Store listing — only reachable once the app ships to production. */
export const ANDROID_APP_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_ID}`;

/**
 * Play's internal-testing opt-in page. Only works for an address the owner has
 * already added to the "GlobalStudyBoard Testers" list in the Play Console, so
 * it is NEVER linked publicly — it goes out in the manual invite email.
 */
export const ANDROID_INTERNAL_TEST_URL =
  'https://play.google.com/apps/internaltest/4701607353482478094';

/**
 * Whether the Play listing is public. `false` => triggers open the invite modal.
 * Flip to `true` on the day the app is live in production.
 */
export const ANDROID_APP_IS_PUBLIC = false;

/** iOS App Store listing — null until the app ships. Never render a dead link. */
export const IOS_APP_URL: string | null = null;

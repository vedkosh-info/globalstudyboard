'use client';

import { ANDROID_APP_IS_PUBLIC, ANDROID_APP_URL } from '@/lib/app-links';
import { openTesterInvite } from '@/lib/tester-invite';

/**
 * The single "Get the Android app" trigger, used by the footer, the mobile menu
 * and the quick-actions dock.
 *
 * While the app is in closed beta it opens <TesterInviteModal/> to collect a
 * tester's Google-account email. The day `ANDROID_APP_IS_PUBLIC` flips to true
 * it becomes a plain link to the Play listing — one constant, every trigger.
 * Styling is passed in so each host keeps its own look.
 */
export default function GetAppButton({
  className,
  children,
  role,
  onNavigate,
  ariaLabel,
}: {
  className?: string;
  children: React.ReactNode;
  /**
   * Accessible name, for hosts that shorten the VISIBLE label on small screens.
   * Keep the visible text a substring of this (WCAG 2.5.3 Label in Name), so
   * voice-control users can still say what they see.
   */
  ariaLabel?: string;
  /** e.g. "menuitem" when the host renders a menu. */
  role?: string;
  /** Let the host close itself (menu / dock) when the control is used. */
  onNavigate?: () => void;
}) {
  // The hook attribute is `data-gsb-android-cta` (used by the standalone-mode
  // CSS rule and the dialog's focus restore). It used to be
  // `data-get-app-trigger`, and a common ad-blocker cosmetic filter hides ANY
  // element carrying that attribute name — verified 19 Sep 2026 in the owner's
  // Chrome: the live pill computed display:none while a fresh button with only
  // that attribute was hidden too and one with only the text was not. Keep the
  // name project-specific and free of "get-app" / "app-banner" tokens.
  if (ANDROID_APP_IS_PUBLIC) {
    return (
      <a
        data-gsb-android-cta
        role={role}
        href={ANDROID_APP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={ariaLabel}
        onClick={onNavigate}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      data-gsb-android-cta
      role={role}
      className={className}
      aria-label={ariaLabel}
      aria-haspopup="dialog"
      onClick={() => {
        onNavigate?.();
        openTesterInvite();
      }}
    >
      {children}
    </button>
  );
}

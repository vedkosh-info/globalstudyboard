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
}: {
  className?: string;
  children: React.ReactNode;
  /** e.g. "menuitem" when the host renders a menu. */
  role?: string;
  /** Let the host close itself (menu / dock) when the control is used. */
  onNavigate?: () => void;
}) {
  if (ANDROID_APP_IS_PUBLIC) {
    return (
      <a
        data-get-app-trigger
        role={role}
        href={ANDROID_APP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onNavigate}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      data-get-app-trigger
      role={role}
      className={className}
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

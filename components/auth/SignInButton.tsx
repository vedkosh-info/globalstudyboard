'use client';

import { openSignIn, type SignInIntent } from '@/lib/auth-events';

/**
 * The single "Sign in" trigger, used by the context bar and the mobile menu.
 * Opens the global sign-in sheet (SignInHost) and returns the visitor to the
 * page they are on afterwards. Styling is passed in so each host keeps its own
 * look; the accessible name is identical everywhere (WCAG 3.2.4) and hosts that
 * shorten the VISIBLE label keep it a substring of that name (WCAG 2.5.3).
 *
 * `data-sign-in-trigger` is the focus-restore fallback the sheet uses when the
 * element that opened it has since unmounted (the mobile menu closes itself).
 * Unlike the App trigger it is never hidden inside the installed app.
 */
export default function SignInButton({
  className,
  children,
  ariaLabel,
  title,
  role,
  intent = 'account',
  onNavigate,
}: {
  className?: string;
  children: React.ReactNode;
  /** Only when the visible label is shortened/hidden; must still contain the visible text (WCAG 2.5.3). */
  ariaLabel?: string;
  title?: string;
  role?: string;
  intent?: SignInIntent;
  /** Let the host close itself (menu) when the control is used. */
  onNavigate?: () => void;
}) {
  return (
    <button
      type="button"
      data-sign-in-trigger
      role={role}
      className={className}
      aria-label={ariaLabel}
      title={title}
      aria-haspopup="dialog"
      onClick={() => {
        onNavigate?.();
        openSignIn({ intent });
      }}
    >
      {children}
    </button>
  );
}

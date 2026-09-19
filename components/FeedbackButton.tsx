'use client';

import { FEEDBACK_TRIGGER, openFeedback, type FeedbackKind, type FeedbackPrefill } from '@/lib/feedback';

/**
 * The single "Share feedback" / "Report an issue" trigger, used by the
 * quick-actions dock, the footer, the mobile menu and the contact page.
 *
 * Opens the global <FeedbackHost/> dialog on the given tab. Styling is passed in
 * so each host keeps its own look; the accessible name always names the kind so
 * a screen-reader user hears "Report an issue" rather than a generic label.
 * `FEEDBACK_TRIGGER` lets the dialog restore focus to a surviving trigger when
 * the one that opened it (a menu row, a dock item) has since unmounted.
 */
export default function FeedbackButton({
  kind,
  prefill,
  className,
  children,
  role,
  onNavigate,
}: {
  /**
   * Which tab the dialog opens on. Omit for a generic trigger: the dialog then
   * continues an unsent draft on its own tab, or starts on Suggestion.
   */
  kind?: FeedbackKind;
  /** Starting values for an empty form (see `FeedbackPrefill`). */
  prefill?: FeedbackPrefill;
  className?: string;
  children: React.ReactNode;
  /** e.g. "menuitem" when the host renders a menu. */
  role?: string;
  /** Let the host close itself (menu / dock) when the control is used. */
  onNavigate?: () => void;
}) {
  return (
    <button
      type="button"
      {...{ [FEEDBACK_TRIGGER]: '' }}
      role={role}
      className={className}
      aria-haspopup="dialog"
      onClick={() => {
        onNavigate?.();
        openFeedback(kind, prefill);
      }}
    >
      {children}
    </button>
  );
}

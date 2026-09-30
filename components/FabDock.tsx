'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, X, ChevronUp, Clock, Smartphone, MessageSquarePlus, Bug, Wrench } from 'lucide-react';
import GetAppButton from '@/components/GetAppButton';
import ToolsEntranceLink from '@/components/ToolsEntranceLink';
import FeedbackButton from '@/components/FeedbackButton';
import { FEEDBACK_RETURN, FEEDBACK_RETURN_SCOPE } from '@/lib/feedback';

const GOOGLE_URL = 'https://www.google.com/preferences/source?q=globalstudyboard.com';
const SCROLL_SHOW = 300;

/**
 * A single expandable "quick actions" dock — replaces the three separate floating
 * buttons that used to stack down the right edge and overlap content on phones.
 * Collapsed, it is ONE button in the corner. Expanded, it reveals labelled
 * actions: back-to-top (when scrolled), recent pages (opens the drawer via a
 * custom event), the feedback / issue-report quick links (open the global
 * feedback dialog on the matching tab), the Android app, the Google
 * preferred-source link and, nearest the button, the tools index. It is a
 * disclosure (a button with aria-expanded that reveals a labelled group of
 * ordinary buttons and links), not an ARIA menu — it never implemented the
 * menu keyboard contract, so it no longer claims to be one.
 */
export default function FabDock() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  // Rendered actions only: inside the installed app the Android-app item is
  // display:none (globals.css), and focusing it would be a no-op that traps
  // the arrow keys on it.
  const items = useCallback(
    () =>
      Array.from(actionsRef.current?.querySelectorAll<HTMLElement>('.gsb-dock-item') ?? []).filter(
        (el) => el.getClientRects().length > 0,
      ),
    [],
  );

  // Opening lands focus on the action NEAREST the toggle — the last one, Tools
  // — the same "nearest the trigger" rule as the destination and account
  // panels, which open downward from theirs; this list grows upward. Focusing
  // it also scrolls a capped list (short screens) to the toggle end, so Tools
  // is never the item clipped away. Up moves into the list, Down wraps, and Tab
  // from Tools reaches the toggle, which follows the list in the DOM.
  useEffect(() => {
    if (open) items().at(-1)?.focus();
  }, [open, items]);

  // Closing the dock unmounts the focused action. When the page stays — a
  // dialog (feedback, the Android app), a link opened in a new tab, a
  // modifier-click, or Tools while already on /tools — move focus to the toggle
  // first, or it drops to <body>; a dialog then records the toggle as the place
  // to return to (Safari and Firefox on macOS never focus a clicked button, so
  // without this the dialog would record <body>). Synchronous on
  // purpose: a requestAnimationFrame callback never runs in a background tab.
  const closeKeepingFocus = useCallback(() => {
    toggleRef.current?.focus();
    setOpen(false);
  }, []);

  // Up/Down/Home/End move between the actions, as in the other panels.
  const onActionsKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const list = items();
    if (list.length === 0) return;
    const i = list.indexOf(document.activeElement as HTMLElement);
    const go = (n: number) => {
      e.preventDefault();
      list[(n + list.length) % list.length]?.focus();
    };
    if (e.key === 'ArrowDown') go(i + 1);
    else if (e.key === 'ArrowUp') go(i - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(list.length - 1);
  };

  // Track scroll so "Back to top" only appears once it's useful.
  useEffect(() => {
    let ticking = false;
    const update = () => {
      setScrolled(window.scrollY > SCROLL_SHOW);
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Collapse on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Collapse on Escape (restoring focus to the toggle) and outside click.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const scrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setOpen(false);
  }, []);

  const openRecent = useCallback(() => {
    // Toggle first, so the drawer records it as the place to return focus to.
    toggleRef.current?.focus();
    document.dispatchEvent(new CustomEvent('gsb:openRecent'));
    setOpen(false);
  }, []);

  return (
    <div ref={ref} className="gsb-dock no-print" {...{ [FEEDBACK_RETURN_SCOPE]: '' }}>
      {open && (
        <div ref={actionsRef} id="gsb-dock-actions" className="gsb-dock-actions" role="group" aria-label="Quick actions" onKeyDown={onActionsKeyDown}>
          {scrolled && (
            <button type="button" className="gsb-dock-item" onClick={scrollTop}>
              <ChevronUp size={18} aria-hidden="true" /> Back to top
            </button>
          )}
          <button type="button" className="gsb-dock-item" onClick={openRecent}>
            <Clock size={18} aria-hidden="true" /> Recent pages
          </button>
          {/* Feedback quick links — each opens the global dialog on its own tab. */}
          <FeedbackButton
            kind="suggestion"
            className="gsb-dock-item"
            onNavigate={closeKeepingFocus}
          >
            <MessageSquarePlus size={18} aria-hidden="true" /> Share feedback
          </FeedbackButton>
          <FeedbackButton
            kind="issue"
            className="gsb-dock-item"
            onNavigate={closeKeepingFocus}
          >
            <Bug size={18} aria-hidden="true" /> Report an issue
          </FeedbackButton>
          <GetAppButton
            className="gsb-dock-item"
            onNavigate={closeKeepingFocus}
          >
            <Smartphone size={18} aria-hidden="true" /> Get the Android app
          </GetAppButton>
          <a
            href={GOOGLE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="gsb-dock-item"
            onClick={closeKeepingFocus}
          >
            <span className="gsb-dock-g" aria-hidden="true">G</span> Prefer on Google
          </a>
          {/* The tools index, nearest the button: the dock is fixed on every page,
              so Tools is one tap away at any scroll position, on phones and
              desktops alike (on a short screen the list is capped and scrolls,
              and it opens scrolled to this end). */}
          <ToolsEntranceLink
            className="gsb-dock-item"
            onClick={(e: ReactMouseEvent<HTMLAnchorElement>) => {
              if (pathname === '/tools' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) closeKeepingFocus();
              else setOpen(false);
            }}
          >
            <Wrench size={18} aria-hidden="true" /> Tools
          </ToolsEntranceLink>
        </div>
      )}
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="gsb-dock-toggle"
        aria-label={open ? 'Close quick actions' : 'Open quick actions'}
        aria-expanded={open}
        aria-controls={open ? 'gsb-dock-actions' : undefined}
        {...{ [FEEDBACK_RETURN]: '' }}
      >
        {open ? <X size={22} aria-hidden="true" /> : <Sparkles size={20} aria-hidden="true" />}
      </button>
    </div>
  );
}

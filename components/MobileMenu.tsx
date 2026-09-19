'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { REGION_CATEGORIES, chromeCategoryLabel, chromeCategoryPath } from '@/lib/region-nav';
import { useRegion } from '@/components/RegionProvider';
import GetAppButton from '@/components/GetAppButton';
import SignInButton from '@/components/auth/SignInButton';
import { useAuth } from '@/components/auth/AuthProvider';
import { isAuthConfigured } from '@/lib/supabase/config';
import FeedbackButton from '@/components/FeedbackButton';
import { FEEDBACK_RETURN, FEEDBACK_RETURN_SCOPE } from '@/lib/feedback';

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { effectiveRegion, pageRegion, ready } = useRegion();
  const { hasSession } = useAuth();
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Region-scoped category links, like the desktop nav, so the menu re-tunes to
  // the chosen destination (destination-neutral in the server HTML — see
  // chromeCategoryPath).
  const tunedIsKnown = ready || pageRegion !== null;
  const links = [
    { label: 'Home', href: '/' },
    { label: 'Destinations', href: '/regions' },
    ...REGION_CATEGORIES.map((cat) => ({
      label: chromeCategoryLabel(cat, effectiveRegion, tunedIsKnown),
      href: chromeCategoryPath(cat, effectiveRegion, tunedIsKnown),
    })),
    { label: 'Topics', href: '/topics' },
    { label: 'Ask GSB AI', href: '/gsb-ai', highlight: true },
  ];

  // Match the RegionSwitcher / TopicsMenu disclosure behaviour: close on Escape
  // (restoring focus to the toggle) and on an outside click.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    /* shrink-0: the header row can overflow (long destination name + the
       212px wordmark), and whatever is shrinkable absorbs it. This button is
       the ONLY route to site navigation below lg, so it must never be the one
       that gives — the destination pill truncates instead (it is built to). */
    <div ref={ref} className="shrink-0 lg:hidden" {...{ [FEEDBACK_RETURN_SCOPE]: '' }}>
      <button
        ref={btnRef}
        {...{ [FEEDBACK_RETURN]: '' }}
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        className="text-stone-700 p-1.5 rounded-md hover:bg-stone-100 transition-colors"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <div
          id="mobile-menu-panel"
          className="absolute top-20 left-0 right-0 bg-cream-100 z-50 border-t border-stone-200 shadow-lg"
        >
          <nav className="flex flex-col px-4 py-3 gap-0.5" aria-label="Mobile">
            {links.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                onClick={() => setOpen(false)}
                className={
                  'highlight' in link && link.highlight
                    ? 'bg-forest-700 hover:bg-forest-800 text-cream-50 px-3 py-2.5 rounded-lg text-sm font-semibold no-underline transition-colors mt-1'
                    : 'text-stone-700 hover:text-forest-700 hover:bg-stone-50 px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-colors'
                }
              >
                {link.label}
              </Link>
            ))}
            {/* Account — a link once signed in, otherwise the shared sign-in
                trigger (opens the sheet; the menu closes itself first). Absent
                entirely while accounts are unconfigured. */}
            {isAuthConfigured() &&
              (hasSession ? (
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="text-stone-700 hover:text-forest-700 hover:bg-stone-50 px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-colors"
                >
                  My account
                </Link>
              ) : (
                <SignInButton
                  onNavigate={() => setOpen(false)}
                  className="text-left text-stone-700 hover:text-forest-700 hover:bg-stone-50 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Sign in
                </SignInButton>
              ))}
            {/* Android app — a button, not a link: while the app is in closed
                beta this opens the tester-invite dialog (see GetAppButton). */}
            <GetAppButton
              onNavigate={() => setOpen(false)}
              className="text-left text-stone-700 hover:text-forest-700 hover:bg-stone-50 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Get the Android app
            </GetAppButton>
            {/* Feedback quick link — opens the global feedback dialog (the
                suggestion / issue tab is the first control inside it). */}
            <FeedbackButton
              onNavigate={() => setOpen(false)}
              className="text-left bg-transparent text-stone-700 hover:text-forest-700 hover:bg-stone-50 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Share feedback
            </FeedbackButton>
          </nav>
        </div>
      )}
    </div>
  );
}

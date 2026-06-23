'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, X, ChevronUp, Clock } from 'lucide-react';

const GOOGLE_URL = 'https://www.google.com/preferences/source?q=globalstudyboard.com';
const SCROLL_SHOW = 300;

/**
 * A single expandable "quick actions" dock — replaces the three separate floating
 * buttons that used to stack down the right edge and overlap content on phones.
 * Collapsed, it is ONE button in the corner. Expanded, it reveals labelled
 * actions: back-to-top (when scrolled), recent pages (opens the drawer via a
 * custom event), and the Google preferred-source link.
 */
export default function FabDock() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

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
    document.dispatchEvent(new CustomEvent('gsb:openRecent'));
    setOpen(false);
  }, []);

  return (
    <div ref={ref} className="gsb-dock no-print">
      {open && (
        <div className="gsb-dock-actions" role="menu" aria-label="Quick actions">
          {scrolled && (
            <button type="button" role="menuitem" className="gsb-dock-item" onClick={scrollTop}>
              <ChevronUp size={18} aria-hidden="true" /> Back to top
            </button>
          )}
          <button type="button" role="menuitem" className="gsb-dock-item" onClick={openRecent}>
            <Clock size={18} aria-hidden="true" /> Recent pages
          </button>
          <a
            role="menuitem"
            href={GOOGLE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="gsb-dock-item"
            onClick={() => setOpen(false)}
          >
            <span className="gsb-dock-g" aria-hidden="true">G</span> Prefer on Google
          </a>
        </div>
      )}
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="gsb-dock-toggle"
        aria-label={open ? 'Close quick actions' : 'Open quick actions'}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {open ? <X size={22} aria-hidden="true" /> : <Sparkles size={20} aria-hidden="true" />}
      </button>
    </div>
  );
}

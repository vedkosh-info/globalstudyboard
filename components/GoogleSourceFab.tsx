'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const GOOGLE_URL = 'https://www.google.com/preferences/source?q=globalstudyboard.com';
const AUTO_DISMISS_MS = 8000;

export default function GoogleSourceFab() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const close = () => {
    setIsOpen(false);
    clearTimer();
  };

  const toggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      clearTimer();
      if (next) {
        timerRef.current = setTimeout(() => setIsOpen(false), AUTO_DISMISS_MS);
      }
      return next;
    });
  };

  useEffect(() => () => clearTimer(), []);

  // Close on navigation
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { close(); }, [pathname]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (rowRef.current && !rowRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <div ref={rowRef} className={`gsb-fab-google-row${isOpen ? ' is-open' : ''}`}>
      {isOpen && (
        <a
          href={GOOGLE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="gsb-fab-google-toast"
          onClick={close}
        >
          <span className="gsb-fab-toast-text">
            Prefer{' '}
            <span className="gsb-fab-toast-brand">GlobalStudyBoard</span>
            {' '}on Google
          </span>
          <span className="gsb-fab-toast-plus">+</span>
        </a>
      )}
      <button
        type="button"
        onClick={toggle}
        className="gsb-fab gsb-fab--google"
        aria-label="Add GlobalStudyBoard as Google Preferred Source"
        aria-expanded={isOpen}
        title="Prefer GlobalStudyBoard on Google"
      >
        <span className="gsb-fab-g">G</span>
      </button>
    </div>
  );
}

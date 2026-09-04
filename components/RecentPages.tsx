"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Clock, BookOpen, GraduationCap, Map, Award, Globe, Home, Menu, X, Trash2 } from 'lucide-react';
import { useHistory, type HistoryItem } from '@/hooks/useHistory';

function PathIcon({ path }: { path: string }) {
  const cls = "text-[#1B3A6B]";
  const size = 15;
  if (path.startsWith('/colleges')) return <GraduationCap size={size} className={cls} />;
  if (path.startsWith('/exams')) return <BookOpen size={size} className={cls} />;
  if (path.startsWith('/guides')) return <Map size={size} className={cls} />;
  if (path.startsWith('/scholarships')) return <Award size={size} className={cls} />;
  if (path.startsWith('/regions')) return <Globe size={size} className={cls} />;
  return <Clock size={size} className={cls} />;
}

function pathType(path: string): string {
  if (path.startsWith('/colleges')) return 'University';
  if (path.startsWith('/exams')) return 'Exam';
  if (path.startsWith('/guides')) return 'Guide';
  if (path.startsWith('/scholarships')) return 'Scholarship';
  if (path.startsWith('/regions')) return 'Region';
  if (path.startsWith('/gsb-ai')) return 'GSB AI';
  return 'Page';
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

function getPageTitle(): string {
  if (typeof document === 'undefined') return '';
  const h1 = document.querySelector('h1');
  if (h1?.textContent) return h1.textContent.trim().substring(0, 55);
  const title = document.title.replace(/\s*[·|–—]\s*GlobalStudyBoard.*$/i, '').trim();
  return title || 'Page';
}

/**
 * Applied to the recent-pages drawer while it is closed. `inert` removes it from
 * the tab order AND the accessibility tree; `aria-hidden` covers browsers without
 * `inert`. It must be `inert={true}` — React 18 treats `inert` as a boolean
 * attribute and silently drops `inert=""` as false — and React 18's typings don't
 * declare it, hence the cast.
 */
const CLOSED_TO_ASSISTIVE_TECH = { inert: true, 'aria-hidden': true } as unknown as
  React.HTMLAttributes<HTMLDivElement>;

export default function RecentPages() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [, setTick] = useState(0);
  const [cleared, setCleared] = useState(false);
  const { history, addToHistory, clearHistory } = useHistory();

  // Record visit on each navigation
  useEffect(() => {
    if (!pathname || pathname === '/') return;
    const title = getPageTitle();
    if (title) addToHistory(pathname, title);
  }, [pathname, addToHistory]);

  // Refresh relative timestamps every 60s while open
  useEffect(() => {
    if (!isOpen) return;
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [isOpen]);

  // Close on navigation
  useEffect(() => { setIsOpen(false); }, [pathname]);

  // Open when the quick-actions dock asks for it.
  useEffect(() => {
    const open = () => setIsOpen(true);
    document.addEventListener('gsb:openRecent', open as EventListener);
    return () => document.removeEventListener('gsb:openRecent', open as EventListener);
  }, []);

  const handleClear = () => {
    clearHistory();
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  };

  const items = history.filter((p: HistoryItem) => p.path !== '/');
  const hasRecent = items.length > 0;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1300, backgroundColor: 'rgba(0,0,0,0.25)' }}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/*
        Drawer. When closed it stays mounted just off-screen (that is what makes the
        slide animate), so it MUST be taken out of the tab order and the a11y tree:
        `pointer-events: none` alone stopped the mouse but left six links and buttons
        tabbable inside an invisible panel, and screen readers still announced a
        dialog that was not on screen.
      */}
      <div
        role="dialog"
        aria-label="Recently visited pages"
        {...(isOpen ? {} : CLOSED_TO_ASSISTIVE_TECH)}
        onClick={(e) => e.stopPropagation()}
        className="gsb-full-vh"
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          width: '18rem',
          zIndex: 1400,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'transform 0.4s ease-in-out',
          background: '#ffffff',
          borderLeft: '1px solid #e2e8f0',
          boxShadow: '-16px 0 40px rgba(0,0,0,0.08)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1B3A6B', fontFamily: 'var(--font-display, Fraunces, serif)', letterSpacing: '-0.01em' }}>
            Recent Activity
          </h3>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.25rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#1B3A6B'; (e.currentTarget as HTMLButtonElement).style.background = '#f0f4ff'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Home + Menu row */}
        <div style={{ display: 'flex', gap: '0.5rem', margin: '0.75rem 1rem 0' }}>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              document.dispatchEvent(new CustomEvent('gsb:openMobileMenu'));
            }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', padding: '0.75rem', borderRadius: '1rem', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#f0f4ff'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#c7d2fe'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0'; }}
          >
            <span style={{ padding: '0.5rem', background: '#fff', borderRadius: '0.625rem', color: '#1B3A6B', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex' }}>
              <Menu size={15} />
            </span>
            <p style={{ margin: 0, fontWeight: 700, color: '#1e293b', fontSize: '0.75rem' }}>Menu</p>
          </button>
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', padding: '0.75rem', borderRadius: '1rem', border: `1px solid ${pathname === '/' ? '#a5b4fc' : '#e2e8f0'}`, background: pathname === '/' ? '#eef2ff' : '#f8fafc', textDecoration: 'none', transition: 'all 0.15s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#f0f4ff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = '#c7d2fe'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = pathname === '/' ? '#eef2ff' : '#f8fafc'; (e.currentTarget as HTMLAnchorElement).style.borderColor = pathname === '/' ? '#a5b4fc' : '#e2e8f0'; }}
          >
            <span style={{ padding: '0.5rem', background: '#fff', borderRadius: '0.625rem', color: '#1B3A6B', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex' }}>
              <Home size={15} />
            </span>
            <p style={{ margin: 0, fontWeight: 700, color: '#1e293b', fontSize: '0.75rem' }}>Home</p>
          </Link>
        </div>

        {/* Section label */}
        <p style={{ margin: '1rem 1.5rem 0.25rem', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8' }}>
          {hasRecent ? 'Recently visited' : 'Start exploring'}
        </p>

        {/* History cards */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {hasRecent ? items.map((item: HistoryItem) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setIsOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
                borderRadius: '0.875rem',
                border: `1px solid ${pathname === item.path ? '#a5b4fc' : '#f1f5f9'}`,
                background: pathname === item.path ? '#eef2ff' : '#f8fafc',
                textDecoration: 'none',
                transition: 'all 0.15s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#f0f4ff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = '#c7d2fe'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = pathname === item.path ? '#eef2ff' : '#f8fafc'; (e.currentTarget as HTMLAnchorElement).style.borderColor = pathname === item.path ? '#a5b4fc' : '#f1f5f9'; }}
            >
              <span style={{ padding: '0.5rem', background: '#fff', borderRadius: '0.625rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', flexShrink: 0 }}>
                <PathIcon path={item.path} />
              </span>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600, color: '#1e293b', fontSize: '0.8125rem', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.title}
                </p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {pathType(item.path)}
                  {item.visitedAt > 0 ? ` · ${relativeTime(item.visitedAt)}` : ''}
                </p>
              </div>
            </Link>
          )) : (
            <p style={{ margin: '0.5rem 0', fontSize: '0.8125rem', color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>
              Pages you visit will appear here
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '0 1rem 1.25rem', flexShrink: 0 }}>
          {hasRecent && (
            <button
              type="button"
              onClick={handleClear}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', padding: '0.625rem', borderRadius: '0.875rem', border: '1px solid #e2e8f0', background: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.15s' }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.color = '#ef4444'; el.style.borderColor = '#fecaca'; el.style.background = '#fff5f5'; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.color = '#94a3b8'; el.style.borderColor = '#e2e8f0'; el.style.background = 'none'; }}
            >
              <Trash2 size={13} />
              {cleared ? 'History cleared ✓' : 'Clear History'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

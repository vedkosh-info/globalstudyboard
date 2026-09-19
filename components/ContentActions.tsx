'use client';

import { useState, useEffect, useCallback } from 'react';
import { ThumbsUp, ThumbsDown, Share2, Printer, Check } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { CONTACT_EMAIL } from '@/lib/site-meta';
import { FEEDBACK_RETURN, FEEDBACK_RETURN_SCOPE, openFeedback } from '@/lib/feedback';

interface ContentActionsProps {
  title: string;
}

export default function ContentActions({ title }: ContentActionsProps) {
  const pathname = usePathname();
  const likeKey = `gsb_like_${pathname}`;

  const [isLiked, setIsLiked] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [shareConfirm, setShareConfirm] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(likeKey) === '1') setIsLiked(true);
    } catch { /* private mode or storage unavailable */ }
  }, [likeKey]);

  // A personal bookmark-style mark kept on this device only. (It used to also
  // render a "1" pill styled like a community counter, backed by nothing but
  // the visitor's own localStorage — a placebo, removed September 2026.)
  const handleLike = useCallback(() => {
    const next = !isLiked;
    setIsLiked(next);
    try {
      if (next) localStorage.setItem(likeKey, '1');
      else localStorage.removeItem(likeKey);
    } catch { /* ignore */ }
  }, [isLiked, likeKey]);

  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: `${title} | GlobalStudyBoard`, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareConfirm(true);
        setTimeout(() => setShareConfirm(false), 2500);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setShareConfirm(true);
          setTimeout(() => setShareConfirm(false), 2500);
        } catch { /* clipboard unavailable */ }
      }
    }
  }, [title]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // `nowrap` + a wrapping row: at 375px the four labels used to break
  // mid-word ("Helpf/ul", "Sha/re", "Pri/nt") because the row could not wrap.
  const btnBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 12px', borderRadius: '999px', border: 'none',
    cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap',
    fontSize: '0.8125rem', fontWeight: 600,
    fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
  };

  return (
    <div className="no-print" {...{ [FEEDBACK_RETURN_SCOPE]: '' }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '2px',
        paddingTop: '20px',
        borderTop: '1px solid #e7e5e4',
      }}>
        {/* Like */}
        <button
          onClick={handleLike}
          title={isLiked ? 'Mark as not helpful' : 'Mark as helpful'}
          aria-pressed={isLiked}
          style={{
            ...btnBase,
            background: isLiked ? 'rgba(20,83,45,0.09)' : 'transparent',
            color: isLiked ? '#14532D' : '#78716c',
          }}
        >
          <ThumbsUp size={17} strokeWidth={1.75} fill={isLiked ? 'currentColor' : 'none'} />
          <span>{isLiked ? 'Marked helpful' : 'Helpful'}</span>
        </button>

        {/* Report issue — the reason chips below open the site-wide feedback
            dialog on its "Report an issue" tab with the reason + page title
            filled in. (Until September 2026 a chip only flipped a local
            "Thanks — we'll review this page" state and sent NOTHING — a placebo
            of exactly the misleading-claim kind Google Play rejected this app
            for. Every report now reaches the team; see /api/feedback.) */}
        <button
          onClick={() => setShowReport((r) => !r)}
          title="Report an issue with this page"
          aria-expanded={showReport}
          {...{ [FEEDBACK_RETURN]: '' }}
          style={{
            ...btnBase,
            background: showReport ? 'rgba(194,65,12,0.08)' : 'transparent',
            color: showReport ? '#9a3412' : '#78716c',
          }}
        >
          <ThumbsDown size={17} strokeWidth={1.75} />
          <span>Report an issue</span>
        </button>

        {/* Spacer only where all four pills fit on one row; below 480px the
            row wraps and the pills simply flow left-to-right. */}
        <div className="hidden min-[480px]:block" style={{ flex: 1 }} />

        {/* Share */}
        <button
          onClick={handleShare}
          title="Share this page"
          style={{
            ...btnBase,
            background: shareConfirm ? 'rgba(20,83,45,0.09)' : 'transparent',
            color: shareConfirm ? '#14532D' : '#78716c',
          }}
        >
          {shareConfirm ? <Check size={17} strokeWidth={2.5} /> : <Share2 size={17} strokeWidth={1.75} />}
          <span>{shareConfirm ? 'Copied!' : 'Share'}</span>
        </button>

        {/* Print */}
        <button
          onClick={handlePrint}
          title="Print this page"
          style={{ ...btnBase, background: 'transparent', color: '#78716c' }}
        >
          <Printer size={17} strokeWidth={1.75} />
          <span>Print</span>
        </button>
      </div>

      {/* Report panel — pick a reason, then describe it in the feedback dialog */}
      {showReport && (
        <div style={{
          marginTop: '12px',
          background: '#fff7f4',
          border: '1px solid #fdddd4',
          borderRadius: '14px',
          padding: '16px 20px',
        }}>
          <p style={{
            margin: '0 0 12px', fontSize: '0.8125rem', fontWeight: 700, color: '#7c2d12',
            fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
          }}>
            What&apos;s the issue? Pick one and tell us more.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
            {['Inaccurate information', 'Outdated details', 'Missing information', 'Broken link', 'Other'].map((reason) => (
              <button
                key={reason}
                type="button"
                aria-haspopup="dialog"
                onClick={() => {
                  setShowReport(false);
                  openFeedback('issue', { title: `${reason} — ${title}` });
                }}
                style={{
                  padding: '6px 14px', borderRadius: '999px',
                  border: '1px solid #fdddd4', background: '#fff',
                  color: '#7c2d12', fontSize: '0.75rem', fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
                }}
              >
                {reason}
              </button>
            ))}
          </div>
          <p style={{
            margin: 0, fontSize: '0.6875rem', color: '#78716c',
            fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
          }}>
            Reports go straight to the team and help us keep every page accurate. You can also email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#14532D', fontWeight: 600 }}>
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

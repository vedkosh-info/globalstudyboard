'use client';

import { useState, useEffect, useCallback } from 'react';
import { ThumbsUp, ThumbsDown, Share2, Printer, Check } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { CONTACT_EMAIL } from '@/lib/site-meta';

interface ContentActionsProps {
  title: string;
}

export default function ContentActions({ title }: ContentActionsProps) {
  const pathname = usePathname();
  const likeKey = `gsb_like_${pathname}`;
  const countKey = `gsb_likecount_${pathname}`;

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [shareConfirm, setShareConfirm] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(likeKey) === '1') setIsLiked(true);
      const n = parseInt(localStorage.getItem(countKey) ?? '0', 10);
      if (!isNaN(n) && n > 0) setLikeCount(n);
    } catch { /* private mode or storage unavailable */ }
  }, [likeKey, countKey]);

  const handleLike = useCallback(() => {
    const next = !isLiked;
    setIsLiked(next);
    setLikeCount((prev) => {
      const n = next ? prev + 1 : Math.max(0, prev - 1);
      try { localStorage.setItem(countKey, String(n)); } catch { /* ignore */ }
      return n;
    });
    try {
      if (next) localStorage.setItem(likeKey, '1');
      else localStorage.removeItem(likeKey);
    } catch { /* ignore */ }
  }, [isLiked, likeKey, countKey]);

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

  const btnBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 14px', borderRadius: '999px', border: 'none',
    cursor: 'pointer', transition: 'all 0.18s',
    fontSize: '0.8125rem', fontWeight: 600,
    fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
  };

  return (
    <div className="no-print">
      <div style={{
        display: 'flex',
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
          <span>Helpful</span>
          {likeCount > 0 && (
            <span style={{
              background: isLiked ? '#14532D' : '#e7e5e4',
              color: isLiked ? '#fff' : '#57534e',
              fontSize: '0.6875rem', fontWeight: 700,
              padding: '1px 7px', borderRadius: '999px', lineHeight: '1.6',
            }}>
              {likeCount}
            </span>
          )}
        </button>

        {/* Report issue */}
        <button
          onClick={() => { setShowReport((r) => !r); setReportSubmitted(false); }}
          title="Report an issue with this page"
          aria-expanded={showReport}
          style={{
            ...btnBase,
            background: showReport ? 'rgba(194,65,12,0.08)' : 'transparent',
            color: showReport ? '#9a3412' : '#78716c',
          }}
        >
          <ThumbsDown size={17} strokeWidth={1.75} />
          <span>Report issue</span>
        </button>

        <div style={{ flex: 1 }} />

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

      {/* Report panel */}
      {showReport && (
        <div style={{
          marginTop: '12px',
          background: reportSubmitted ? '#f0fdf4' : '#fff7f4',
          border: `1px solid ${reportSubmitted ? '#bbf7d0' : '#fdddd4'}`,
          borderRadius: '14px',
          padding: '16px 20px',
        }}>
          {reportSubmitted ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={16} color="#14532D" strokeWidth={2.5} />
              <p style={{
                margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#14532D',
                fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
              }}>
                Thanks — we&apos;ll review this page and correct any issues.
              </p>
            </div>
          ) : (
            <>
              <p style={{
                margin: '0 0 12px', fontSize: '0.8125rem', fontWeight: 700, color: '#7c2d12',
                fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
              }}>
                What&apos;s the issue?
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                {['Inaccurate information', 'Outdated details', 'Missing information', 'Broken link', 'Other'].map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setReportSubmitted(true)}
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
                margin: 0, fontSize: '0.6875rem', color: '#a8a29e',
                fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
              }}>
                Reports help us improve accuracy. You can also email{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#14532D', fontWeight: 600 }}>
                  {CONTACT_EMAIL}
                </a>
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

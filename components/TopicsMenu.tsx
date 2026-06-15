'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

import { TOPICS, TOPIC_GROUP_LABELS, type TopicGroup } from '@/lib/topics';
import { useRegion } from '@/components/RegionProvider';

const GROUP_ORDER: TopicGroup[] = [
  'exams',
  'fields',
  'after-12th',
  'study-abroad',
  'study-in-usa',
  'study-in-canada',
  'study-in-australia-nz',
  'study-in-europe',
  'study-in-middle-east',
  'study-in-russia-cis',
  'study-in-uk-ireland',
  'prep-funding',
];

/** Desktop "Topics" mega-menu — a grouped dropdown of every topic hub. */
export default function TopicsMenu() {
  const [open, setOpen] = useState(false);
  const { effectiveRegion } = useRegion();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="inline-flex items-center gap-1 text-sm font-medium text-stone-700 hover:text-forest-700 px-3 py-2 rounded-md hover:bg-forest-50 transition-colors"
      >
        Topics
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-[min(92vw,720px)] bg-cream-50 border border-stone-200 rounded-2xl shadow-xl p-5 grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 z-50">
          {GROUP_ORDER.map((group) => {
            const topics = TOPICS.filter(
              (t) => t.group === group && (!t.region || t.region === effectiveRegion),
            );
            if (topics.length === 0) return null;
            return (
              <div key={group}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 mb-2 m-0">
                  {TOPIC_GROUP_LABELS[group]}
                </p>
                <ul className="list-none p-0 m-0 space-y-1.5">
                  {topics.map((t) => (
                    <li key={t.slug}>
                      <Link
                        href={`/topics/${t.slug}`}
                        onClick={() => setOpen(false)}
                        className="text-sm text-stone-700 hover:text-forest-700 no-underline block"
                      >
                        {t.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          <div className="col-span-2 lg:col-span-3 border-t border-stone-200 pt-3">
            <Link
              href="/topics"
              onClick={() => setOpen(false)}
              className="text-sm font-semibold text-forest-700 hover:text-forest-800 no-underline"
            >
              Browse all topics →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

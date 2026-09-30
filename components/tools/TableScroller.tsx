'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

/**
 * A table wider than its column scrolls sideways inside this wrapper
 * (readable columns on a phone instead of crushed cells). While — and only
 * while — it actually overflows, the wrapper is a named, focusable group with
 * a visible hint, so a keyboard can reach every column (WCAG 2.1.1; Safari
 * never makes a scroller focusable on its own) and a table that fits adds no
 * empty tab stop. `role="group"` named by the section heading, not a second
 * same-named region landmark inside the <section>.
 *
 * The tab stop is never pulled out from under keyboard focus: if the table
 * starts to fit while the wrapper holds focus (the window widens, the page is
 * zoomed out), the wrapper stays focusable until focus leaves it — removing
 * tabindex from the focused element would drop focus to <body>.
 *
 * Cells keep whole words on screen: the site's body rule
 * (`overflow-wrap: anywhere`, styles/globals.css) lets an auto-sized column
 * shrink below its longest word, which split names like "Duolingo" or
 * "IELTS" mid-word in a narrow column. `break-word` wraps only a token that
 * cannot fit its column, so min-content stays the longest word and a very long
 * one (a web address) widens the table, which then scrolls here instead of
 * being clipped. Print restores `anywhere`: a printed page cannot scroll, so a
 * table must always fit its width there.
 */
export default function TableScroller({ labelledBy, className = 'mt-3 rounded-sm', children }: { labelledBy: string; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const hintId = useId();
  const [scrolls, setScrolls] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setScrolls(el.scrollWidth > el.clientWidth + 1);
    check();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', check);
      return () => window.removeEventListener('resize', check);
    }
    const ro = new ResizeObserver(check);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, []);

  // A tab stop while the table overflows, and for as long as it holds focus.
  const stop = scrolls || focused;

  return (
    <>
      {scrolls && (
        <p id={hintId} className="m-0 mt-2 text-xs text-stone-600 print:hidden">
          Scroll the table sideways to see every column.
        </p>
      )}
      <div
        ref={ref}
        className={`${className} overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2 print:overflow-visible [&_:is(th,td)]:[overflow-wrap:break-word] [&_:is(th,td)]:[word-break:normal] print:[&_:is(th,td)]:[overflow-wrap:anywhere]`}
        // Only the wrapper itself counts: focus on a link inside a cell never holds the tab stop.
        onFocus={(e) => {
          if (e.target === e.currentTarget) setFocused(true);
        }}
        onBlur={(e) => {
          if (e.target === e.currentTarget) setFocused(false);
        }}
        {...(stop ? { tabIndex: 0, role: 'group', 'aria-labelledby': labelledBy } : {})}
        {...(scrolls ? { 'aria-describedby': hintId } : {})}
      >
        {children}
      </div>
    </>
  );
}

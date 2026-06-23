'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { REGION_CATEGORIES, categoryLabel, regionCategoryPath } from '@/lib/region-nav';
import { useRegion } from '@/components/RegionProvider';

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { effectiveRegion } = useRegion();
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Region-scoped category links, like the desktop nav, so the menu re-tunes to
  // the chosen destination.
  const links = [
    { label: 'Home', href: '/' },
    { label: 'Destinations', href: '/regions' },
    ...REGION_CATEGORIES.map((cat) => ({
      label: categoryLabel(cat, effectiveRegion),
      href: regionCategoryPath(effectiveRegion, cat),
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
    <div ref={ref} className="lg:hidden">
      <button
        ref={btnRef}
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
          </nav>
        </div>
      )}
    </div>
  );
}

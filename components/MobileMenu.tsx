'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Home } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', href: '/', home: true },
  { label: 'Universities', href: '/regions' },
  { label: 'Exams', href: '/exams' },
  { label: 'Scholarships', href: '/scholarships' },
  { label: 'Guides', href: '/guides' },
  { label: 'Ask GSB AI', href: '/gsb-ai', highlight: true },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="text-stone-700 p-1.5 rounded-md hover:bg-stone-100 transition-colors"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-cream-100 z-50 border-t border-stone-200 shadow-lg">
          <nav className="flex flex-col px-4 py-3 gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={
                  link.highlight
                    ? 'bg-forest-700 hover:bg-forest-800 text-cream-50 px-3 py-2.5 rounded-lg text-sm font-semibold no-underline transition-colors mt-1'
                    : 'inline-flex items-center gap-2 text-stone-700 hover:text-forest-700 hover:bg-stone-50 px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-colors'
                }
              >
                {link.home && <Home className="w-4 h-4" aria-hidden="true" />}
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}

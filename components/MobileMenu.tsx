'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Indian Colleges', href: '/colleges/india', highlight: false },
  { label: 'Study Abroad', href: '/colleges/abroad', highlight: false },
  { label: 'Entrance Exams', href: '/exams', highlight: false },
  { label: 'Admission Guides', href: '/guides', highlight: false },
  { label: 'GSB AI', href: '/gsb-ai', highlight: true },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="text-white p-1.5 rounded-md hover:bg-brand-500 transition-colors"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-brand-700 z-50 border-t border-brand-500 shadow-lg">
          <nav className="flex flex-col px-4 py-3 gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={
                  link.highlight
                    ? 'bg-gold-500 hover:bg-gold-400 text-brand-900 px-3 py-2.5 rounded-lg text-sm font-semibold no-underline transition-colors'
                    : 'text-white/90 hover:text-gold-300 hover:bg-brand-600 px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-colors'
                }
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 pt-2 border-t border-brand-600">
              <Link
                href="/hi"
                onClick={() => setOpen(false)}
                className="text-white/50 hover:text-gold-300 px-3 py-2 rounded-lg text-xs no-underline block transition-colors"
              >
                हिन्दी में पढ़ें
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}

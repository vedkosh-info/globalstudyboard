'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Updates <html lang> on the client after hydration.
// The root layout defaults to lang="en"; this corrects it for /hi/* routes.
export default function LocaleSetter() {
  const pathname = usePathname();
  useEffect(() => {
    const lang = pathname === '/hi' || pathname.startsWith('/hi/') ? 'hi' : 'en';
    document.documentElement.lang = lang;
  }, [pathname]);
  return null;
}

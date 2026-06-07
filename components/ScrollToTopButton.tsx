"use client";

import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

const VISIBILITY_SCROLL_Y = 300;

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const updateVisibility = () => {
      setIsVisible(window.scrollY > VISIBILITY_SCROLL_Y);
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateVisibility);
    };

    updateVisibility();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`gsb-fab gsb-fab--scroll ${isVisible ? 'is-visible' : 'is-hidden'}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      title="Scroll to top"
    >
      <ChevronUp size={22} strokeWidth={2.5} />
    </button>
  );
}

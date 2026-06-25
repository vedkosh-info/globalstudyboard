'use client';

import { useEffect, useRef, useState } from 'react';
import { AUDIENCE_LABEL } from '@/lib/audience';
import { useAudience } from '@/components/AudienceProvider';

/**
 * Visually-hidden polite live region that announces an audience switch to screen
 * readers — only on an actual change, never on first load (mirrors
 * RegionAnnouncer). Keeps the toggle accessible without visual noise.
 */
export default function AudienceAnnouncer() {
  const { chosenAudience } = useAudience();
  const [message, setMessage] = useState('');
  const prev = useRef<string | null>(null);

  useEffect(() => {
    if (!chosenAudience) return;
    if (prev.current !== null && prev.current !== chosenAudience) {
      setMessage(`Now showing ${AUDIENCE_LABEL[chosenAudience]} student information.`);
    }
    prev.current = chosenAudience;
  }, [chosenAudience]);

  return (
    <div aria-live="polite" className="sr-only">
      {message}
    </div>
  );
}

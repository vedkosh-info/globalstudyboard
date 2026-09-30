'use client';

import dynamic from 'next/dynamic';
import { useAuth } from '@/components/auth/AuthProvider';
import { isAuthConfigured } from '@/lib/supabase/config';
import { ToolChunkFailed, ToolSignInCard, ToolSkeleton, ToolUnavailable } from '@/components/tools/ToolStates';
import { useDestinationHint } from '@/components/tools/useDestinationHint';

/**
 * The Compare Universities gate — the same shape as the other tools
 * (constitution §18): cookie PRESENCE decides in the browser, the tool chunk
 * (and with it the Supabase SDK) loads only for a signed-in visitor, RLS is
 * the enforcement.
 *
 * Two things every gate does (review, 29 Sep 2026): a tool chunk that cannot be
 * downloaded resolves to the statically imported ToolChunkFailed card instead
 * of crashing the whole page (CRIT2-1); and the tool renders only once
 * useDestinationHint has applied a destination handed over by the page the
 * visitor came from (`#region=<slug>`, CRIT2-2).
 */
const CompareApp = dynamic(() => import('./CompareApp').catch(() => ({ default: ToolChunkFailed })), {
  ssr: false,
  loading: () => <ToolSkeleton label="Loading your comparisons…" />,
});

export default function CompareGate() {
  const { hasSession, ready } = useAuth();
  const destinationSettled = useDestinationHint();

  if (!isAuthConfigured()) return <ToolUnavailable />;
  if (!ready) return <ToolSkeleton label="Checking your sign-in…" />;
  if (!hasSession) {
    return (
      <ToolSignInCard
        title="Sign in to open your comparisons"
        intro="It is free. Sign in with a one-time e-mail code or link, or with Google — no password. Your comparisons then follow your account to every device."
      />
    );
  }
  if (!destinationSettled) return <ToolSkeleton label="Loading your comparisons…" />;
  return <CompareApp />;
}

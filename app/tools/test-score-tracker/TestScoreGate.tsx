'use client';

import dynamic from 'next/dynamic';
import { useAuth } from '@/components/auth/AuthProvider';
import { isAuthConfigured } from '@/lib/supabase/config';
import { ToolChunkFailed, ToolSignInCard, ToolSkeleton, ToolUnavailable } from '@/components/tools/ToolStates';
import { useDestinationHint } from '@/components/tools/useDestinationHint';

/**
 * The Test Score Tracker gate — the same shape as the other tools
 * (constitution §18): cookie PRESENCE decides in the browser, the tool chunk
 * (and with it the Supabase SDK) loads only for a signed-in visitor, RLS is
 * the enforcement.
 *
 * `examNames` (slug → short name, a compact projection from the server page)
 * lets the tool still name each recorded test if its full test list fails to
 * load.
 *
 * Two things every gate does (review, 29 Sep 2026): a tool chunk that cannot be
 * downloaded resolves to the statically imported ToolChunkFailed card instead
 * of crashing the whole page (CRIT2-1); and the tool renders only once
 * useDestinationHint has applied a destination handed over by the page the
 * visitor came from (`#region=<slug>`, CRIT2-2).
 */
const TestScoreApp = dynamic(() => import('./TestScoreApp').catch(() => ({ default: ToolChunkFailed })), {
  ssr: false,
  loading: () => <ToolSkeleton label="Loading your scores…" />,
});

export default function TestScoreGate({ examNames }: { examNames: Record<string, string> }) {
  const { hasSession, ready } = useAuth();
  const destinationSettled = useDestinationHint();

  if (!isAuthConfigured()) return <ToolUnavailable />;
  if (!ready) return <ToolSkeleton label="Checking your sign-in…" />;
  if (!hasSession) {
    return (
      <ToolSignInCard
        title="Sign in to open your score tracker"
        intro="It is free. Sign in with a one-time e-mail code or link, or with Google — no password. Your scores then follow your account to every device."
      />
    );
  }
  if (!destinationSettled) return <ToolSkeleton label="Loading your scores…" />;
  return <TestScoreApp examNames={examNames} />;
}

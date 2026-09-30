'use client';

import dynamic from 'next/dynamic';
import { useAuth } from '@/components/auth/AuthProvider';
import { isAuthConfigured } from '@/lib/supabase/config';
import { ToolChunkFailed, ToolSignInCard, ToolSkeleton, ToolUnavailable } from '@/components/tools/ToolStates';
import { useDestinationHint } from '@/components/tools/useDestinationHint';

/**
 * Decides, in the browser, what the tool area shows: the tool for a signed-in
 * visitor, a sign-in card otherwise. Reads only cookie PRESENCE via AuthProvider
 * (no SDK in this chunk); the tool itself — and the Supabase SDK — arrive in a
 * separate chunk only when there is a session. Row-Level Security is the real
 * gate: a signed-out request can read nothing.
 *
 * Two things every gate does (review, 29 Sep 2026): a tool chunk that cannot be
 * downloaded resolves to the statically imported ToolChunkFailed card instead
 * of crashing the whole page (CRIT2-1); and the tool renders only once
 * useDestinationHint has applied a destination handed over by the page the
 * visitor came from (`#region=<slug>`, CRIT2-2).
 */
const PlannerApp = dynamic(() => import('./PlannerApp').catch(() => ({ default: ToolChunkFailed })), {
  ssr: false,
  loading: () => <ToolSkeleton label="Loading your planner…" />,
});

export default function PlannerGate() {
  const { hasSession, ready } = useAuth();
  const destinationSettled = useDestinationHint();

  if (!isAuthConfigured()) return <ToolUnavailable />;
  if (!ready) return <ToolSkeleton label="Checking your sign-in…" />;
  if (!hasSession) {
    return (
      <ToolSignInCard
        title="Sign in to open your planner"
        intro="It is free. Sign in with a one-time e-mail code or link, or with Google — no password. Your plan then follows your account to every device."
      />
    );
  }
  if (!destinationSettled) return <ToolSkeleton label="Loading your planner…" />;
  return <PlannerApp />;
}

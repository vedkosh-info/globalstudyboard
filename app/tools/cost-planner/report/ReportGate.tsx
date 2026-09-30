'use client';

import dynamic from 'next/dynamic';
import { useAuth } from '@/components/auth/AuthProvider';
import { isAuthConfigured } from '@/lib/supabase/config';
import { ToolChunkFailed, ToolSignInCard, ToolSkeleton, ToolUnavailable } from '@/components/tools/ToolStates';
import { useDestinationHint } from '@/components/tools/useDestinationHint';

/**
 * Cookie PRESENCE decides sign-in card vs report; the report chunk (with the SDK)
 * loads only for a session. As in the tool gates: a chunk that cannot be
 * downloaded shows ToolChunkFailed, never a crashed page, and the report waits
 * for useDestinationHint (the destination the tool was open on carries over).
 */
const BudgetReportApp = dynamic(() => import('./BudgetReportApp').catch(() => ({ default: ToolChunkFailed })), {
  ssr: false,
  loading: () => <ToolSkeleton label="Loading your report…" />,
});

export default function ReportGate() {
  const { hasSession, ready } = useAuth();
  const destinationSettled = useDestinationHint();

  if (!isAuthConfigured()) return <ToolUnavailable />;
  if (!ready) return <ToolSkeleton label="Checking your sign-in…" />;
  if (!hasSession) {
    return <ToolSignInCard title="Sign in to see your report" intro="It is free. Sign in with a one-time e-mail code or link, or with Google — no password. Your budgets then follow your account to every device." />;
  }
  if (!destinationSettled) return <ToolSkeleton label="Loading your report…" />;
  return <BudgetReportApp />;
}

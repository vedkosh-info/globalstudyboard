'use client';

import dynamic from 'next/dynamic';
import { useAuth } from '@/components/auth/AuthProvider';
import { isAuthConfigured } from '@/lib/supabase/config';
import { ToolChunkFailed, ToolSignInCard, ToolSkeleton, ToolUnavailable } from '@/components/tools/ToolStates';
import { useDestinationHint } from '@/components/tools/useDestinationHint';
import { SCHOLARSHIP_UI as UI } from '@/lib/scholarship-ui';

const ScholarshipApp = dynamic(() => import('./ScholarshipApp').catch(() => ({ default: ToolChunkFailed })), { ssr: false, loading: () => <ToolSkeleton label={UI.title} /> });

export default function ScholarshipGate() {
  const { ready, hasSession } = useAuth();
  const destinationSettled = useDestinationHint();
  if (!isAuthConfigured()) return <ToolUnavailable />;
  if (!ready) return <ToolSkeleton label={UI.title} />;
  if (!hasSession) return <ToolSignInCard title={UI.title} intro={UI.intro} />;
  if (!destinationSettled) return <ToolSkeleton label={UI.title} />;
  return <ScholarshipApp />;
}

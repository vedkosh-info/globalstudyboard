'use client';

import dynamic from 'next/dynamic';
import { ListChecks } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { ToolChunkFailed, ToolSignInCard, ToolSkeleton, ToolUnavailable } from '@/components/tools/ToolStates';
import { useDestinationHint } from '@/components/tools/useDestinationHint';
import { isAuthConfigured } from '@/lib/supabase/config';

const title = 'Application Check';
const ApplicationCheckApp = dynamic(() => import('./ApplicationCheckApp').catch(() => ({ default: ToolChunkFailed })), {
  ssr: false, loading: () => <ToolSkeleton label={title} />,
});

export default function ApplicationCheckGate() {
  const { ready, hasSession } = useAuth();
  const destinationReady = useDestinationHint();
  if (ready && hasSession && destinationReady) return <ApplicationCheckApp />;
  if (hasSession) return <ToolSkeleton label={title} />;
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-forest-200 bg-forest-50 p-5 sm:p-6" aria-label="Example result">
        <p className="m-0 flex items-center gap-2 text-sm font-semibold text-forest-800"><ListChecks size={19} aria-hidden="true" /> Example result</p>
        <h2 className="mb-0 mt-2 font-display text-xl font-bold text-ink">Your overall band reaches the minimum. One skill falls short.</h2>
        <p className="mb-0 mt-1 max-w-prose text-base leading-relaxed text-stone-700">
          Some programmes set an IELTS Academic minimum for every skill. Enter the overall and lowest bands from one test to see which requirement needs attention.
        </p>
      </section>
      {!ready ? <ToolSkeleton label={title} /> : isAuthConfigured()
        ? <ToolSignInCard title="Check your programme" intro="Start with a reviewed programme for your destination. You can see the first steps without filling in a profile." />
        : <ToolUnavailable />}
    </div>
  );
}

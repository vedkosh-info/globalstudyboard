'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ClipboardCheck, ClipboardPlus } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { AUTH_CHANGED_EVENT, CONNECTION_LOST, requireAuth, takeResumeIntent } from '@/lib/auth-events';
import { isAuthConfigured } from '@/lib/supabase/config';
import type { RegionSlug } from '@/lib/regions';
import { toolHref } from '@/lib/tools';
import ToolLink from '@/components/tools/ToolLink';

/**
 * "Add to planner" on a university profile — adds the university to the
 * signed-in visitor's Application Planner (/tools/application-planner). Sits
 * beside the Save button and follows its exact contract: NO Supabase import in
 * this chunk (the SDK is `import()`ed on demand), the sign-in sheet opens for a
 * signed-out visitor and the add completes in place after a code sign-in, and a
 * redirect sign-in (Google / e-mailed link) stashes a path-scoped intent that
 * finishes the add on landing. Renders nothing while accounts are unconfigured.
 *
 * Once the university is in the planner the control becomes a LINK to it,
 * carrying the university's destination (`#region=`, lib/tools toolHref): a
 * visitor who has not chosen one lands on the planner for THAT destination,
 * where the application just added is listed — not on the India default
 * (independent review, CRIT2-2). A ToolLink, so the tool opens at the top of
 * the page with the header in view (G8-SK-5).
 *
 * A failed add says why in the words the tools use (lib/tools-shared, loaded
 * with the SDK on click): a dropped connection keeps the session and says to
 * try again; only a definite "session gone" signs the device out.
 */

type PlanState = 'unknown' | 'in' | 'out';

const cache = new Map<string, boolean>();
let listener = false;
function installListener() {
  if (listener || typeof window === 'undefined') return;
  listener = true;
  window.addEventListener(AUTH_CHANGED_EVENT, () => cache.clear());
}

const ENDED = 'Your session ended — sign in again to add it.';
const RETRY = 'Could not add it. Please try again.';
/** The planner's tables are not created yet (the owner-run migration is pending) — the tool says the same. */
const SWITCHING_ON = 'The planner is being switched on — please try again in a little while.';

const PILL =
  'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-1';

export default function AddToPlannerButton({
  slug,
  name,
  region,
  url,
  className = '',
}: {
  slug: string;
  name: string;
  region: RegionSlug;
  url?: string | null;
  className?: string;
}) {
  const { hasSession, ready } = useAuth();
  const [state, setState] = useState<PlanState>(() => (cache.has(slug) ? (cache.get(slug) ? 'in' : 'out') : 'unknown'));
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const resumed = useRef(false);

  const add = useCallback(async () => {
    setBusy(true);
    setNote('');
    try {
      // The shared session rules, lazily (bundle guard — this chunk stays SDK-free).
      // If the chunk itself cannot be fetched, the connection is the problem.
      const tools = await import('@/lib/tools-shared').catch(() => null);
      if (!tools) {
        setNote(CONNECTION_LOST);
        return;
      }
      const { checkToolSession, isSetupError, sessionMessage } = tools;
      // A write or read that failed without a reason of its own: only a
      // definite "session gone" from the auth server signs the device out; a
      // dropped connection keeps the session and says so (independent review
      // SH-01 — this used to sign a student out on any network blip).
      const failed = async (err: { code?: string; message?: string } | null) =>
        isSetupError(err) ? SWITCHING_ON : sessionMessage(await checkToolSession({ noteEnded: false }), RETRY, ENDED);
      const s = await checkToolSession({ noteEnded: false });
      if (s.kind === 'unconfigured') return;
      if (s.kind !== 'ok') {
        setNote(sessionMessage(s, '', ENDED));
        return;
      }
      const { supabase, user } = s;
      // Already there (e.g. added from the planner itself)? Just link to it.
      const { data: existing, error: readError } = await supabase.from('planner_applications').select('id').eq('user_id', user.id).eq('college_slug', slug).limit(1);
      if (readError) {
        setNote(await failed(readError));
        return;
      }
      if (!existing?.length) {
        const { error } = await supabase
          .from('planner_applications')
          .insert({ user_id: user.id, college_slug: slug, name: name.slice(0, 160), region, official_url: url && /^https:\/\/\S+$/.test(url) ? url.slice(0, 500) : null });
        if (error) {
          setNote(/planner_applications_cap/.test(error.message) ? 'Your planner is full (100 applications).' : await failed(error));
          return;
        }
      }
      cache.set(slug, true);
      setState('in');
      setNote(existing?.length ? 'Already in your planner.' : 'Added to your planner.');
    } catch {
      setNote(RETRY);
    } finally {
      setBusy(false);
    }
  }, [slug, name, region, url]);

  useEffect(installListener, []);

  useEffect(() => {
    if (!ready || !hasSession) {
      if (ready && !hasSession) setState('out');
      return;
    }
    if (!resumed.current && takeResumeIntent('plan')) {
      resumed.current = true;
      void add();
      return;
    }
    if (cache.has(slug)) return;
    let active = true;
    void import('@/lib/supabase/client').then(async ({ getSupabaseBrowserClient }) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !active) return;
      const { data } = await supabase.from('planner_applications').select('id').eq('user_id', user.id).eq('college_slug', slug).limit(1);
      if (!active || cache.has(slug)) return;
      const inPlan = Boolean(data?.length);
      cache.set(slug, inPlan);
      setState(inPlan ? 'in' : 'out');
    });
    return () => {
      active = false;
    };
  }, [ready, hasSession, slug, add]);

  if (!isAuthConfigured()) return null;

  const onClick = async () => {
    if (busy) return;
    if (!hasSession) {
      const verdict = await requireAuth({ intent: 'plan' });
      if (verdict !== 'ok') return;
    }
    await add();
  };

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {state === 'in' ? (
        <ToolLink href={toolHref('application-planner', region)} className={`${PILL} border-forest-600 bg-forest-50 text-forest-800 no-underline hover:bg-forest-100`}>
          <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" /> In your planner
        </ToolLink>
      ) : (
        <button
          type="button"
          onClick={() => void onClick()}
          aria-busy={busy || undefined}
          aria-label={`Add ${name} to your application planner`}
          className={`${PILL} border-forest-300 bg-white text-forest-700 hover:border-forest-400 hover:bg-forest-50 ${busy ? 'cursor-wait' : ''}`}
        >
          <ClipboardPlus className="h-3.5 w-3.5" aria-hidden="true" /> Add to planner
        </button>
      )}
      <span role="status" aria-live="polite" className="text-xs text-stone-600">
        {note}
      </span>
    </span>
  );
}

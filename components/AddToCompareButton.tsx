'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Columns3, Check } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { AUTH_CHANGED_EVENT, CONNECTION_LOST, requireAuth, takeResumeIntent } from '@/lib/auth-events';
import { isAuthConfigured } from '@/lib/supabase/config';
import { getRegionBySlug, type RegionSlug } from '@/lib/regions';
import { COMPARE_LIMITS, DEFAULT_CRITERIA, defaultSetLabel } from '@/lib/compare';
import { toolHref } from '@/lib/tools';
import ToolLink from '@/components/tools/ToolLink';

/**
 * "Add to compare" on a university profile — the peer of AddToPlannerButton
 * with the same one-click contract: NO Supabase import in this chunk (the SDK
 * is `import()`ed on demand), the sign-in sheet opens for a signed-out visitor
 * and the add completes in place after a code sign-in, and a redirect sign-in
 * stashes a path-scoped intent that finishes the add on landing.
 *
 * One click never opens a picker: the university goes into the visitor's most
 * recently updated comparison for ITS OWN destination, silently creating one
 * (seeded with the six default criteria) when none exists. A full comparison
 * (4 universities) is never overwritten — the note says so and links to the tool.
 *
 * Every link to the tool carries the university's destination (`#region=`,
 * lib/tools toolHref): a visitor who has not chosen one lands on the
 * comparisons for THAT destination — the one this button just added to — not
 * on the India default, where it was only counted (independent review, CRIT2-2).
 * Each is a ToolLink, so the tool opens at the top of the page with the header
 * in view (G8-SK-5).
 *
 * A failed add says why in the words the tools use (lib/tools-shared, loaded
 * with the SDK on click): a dropped connection keeps the session and says to
 * try again; only a definite "session gone" signs the device out.
 */

type CompareState = 'unknown' | 'in' | 'out';

const cache = new Map<string, boolean>();
let listener = false;
function installListener() {
  if (listener || typeof window === 'undefined') return;
  listener = true;
  window.addEventListener(AUTH_CHANGED_EVENT, () => cache.clear());
}

const ENDED = 'Your session ended — sign in again to add it.';
const RETRY = 'Could not add it. Please try again.';
/** The comparison tables are not created yet (the owner-run migration is pending) — the tool says the same. */
const SWITCHING_ON = 'The comparison tool is being switched on — please try again in a little while.';

const PILL =
  'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-1';

export default function AddToCompareButton({
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
  const [state, setState] = useState<CompareState>(() => (cache.has(slug) ? (cache.get(slug) ? 'in' : 'out') : 'unknown'));
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<React.ReactNode>('');
  const resumed = useRef(false);
  const busyRef = useRef(false);

  const add = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
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
      // The most recently updated comparison for this destination — or a new one.
      const { data: sets, error: setsError } = await supabase
        .from('compare_sets')
        .select('id, label')
        .eq('user_id', user.id)
        .eq('region', region)
        .order('updated_at', { ascending: false })
        .limit(1);
      if (setsError) {
        setNote(await failed(setsError));
        return;
      }
      let setId = sets?.[0]?.id as string | undefined;
      let seedFailed = false;
      if (!setId) {
        const regionName = getRegionBySlug(region)?.displayName ?? region;
        const { data: allSets, error: labelsError } = await supabase.from('compare_sets').select('label').eq('user_id', user.id);
        if (labelsError) {
          setNote(await failed(labelsError));
          return;
        }
        const { data: created, error: createError } = await supabase
          .from('compare_sets')
          .insert({ user_id: user.id, region, label: defaultSetLabel(regionName, allSets ?? []), notes: null })
          .select('id')
          .single();
        if (createError || !created) {
          setNote(/compare_sets_cap/.test(createError?.message ?? '') ? `You have reached the ${COMPARE_LIMITS.sets}-comparison limit.` : await failed(createError));
          return;
        }
        setId = created.id as string;
        const { error: seedError } = await supabase.from('compare_criteria').insert(DEFAULT_CRITERIA.map((c) => ({ user_id: user.id, set_id: setId, label: c.label, weight: c.weight })));
        if (seedError) seedFailed = true;
      } else {
        // Already in THAT comparison? Just link to it (the same rule the tool applies).
        // A failed read must not be taken for an empty comparison (it would skip
        // both the "already in it" answer and the four-university check).
        const { data: rows, error: rowsError } = await supabase.from('compare_entries').select('id, college_slug').eq('set_id', setId);
        if (rowsError) {
          setNote(await failed(rowsError));
          return;
        }
        if (rows?.some((r) => r.college_slug === slug)) {
          cache.set(slug, true);
          setState('in');
          setNote('Already in your comparison.');
          return;
        }
        if ((rows?.length ?? 0) >= COMPARE_LIMITS.entriesPerSet) {
          const regionName = getRegionBySlug(region)?.displayName ?? region;
          setNote(
            <>
              Your comparison for {regionName} already has {COMPARE_LIMITS.entriesPerSet} universities —{' '}
              <ToolLink href={toolHref('compare-universities', region)} className="text-forest-700 underline hover:text-forest-800">
                open Compare Universities
              </ToolLink>{' '}
              to swap one out.
            </>,
          );
          return;
        }
      }
      const { error } = await supabase.from('compare_entries').insert({
        user_id: user.id,
        set_id: setId,
        college_slug: slug,
        name: name.slice(0, COMPARE_LIMITS.entryName),
        official_url: url && /^https:\/\/\S+$/.test(url) ? url.slice(0, COMPARE_LIMITS.url) : null,
        note: null,
      });
      if (error) {
        setNote(/compare_entries_cap/.test(error.message) ? `That comparison already holds ${COMPARE_LIMITS.entriesPerSet} universities.` : await failed(error));
        return;
      }
      cache.set(slug, true);
      setState('in');
      setNote(seedFailed ? 'Added to a new comparison — its starting criteria could not be added; add your own in the tool.' : 'Added to your comparison.');
    } catch {
      setNote(RETRY);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [slug, name, region, url]);

  useEffect(installListener, []);

  useEffect(() => {
    if (!ready || !hasSession) {
      if (ready && !hasSession) setState('out');
      return;
    }
    if (!resumed.current && takeResumeIntent('compare')) {
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
      const { data } = await supabase.from('compare_entries').select('id').eq('user_id', user.id).eq('college_slug', slug).limit(1);
      if (!active || cache.has(slug)) return;
      const inSet = Boolean(data?.length);
      cache.set(slug, inSet);
      setState(inSet ? 'in' : 'out');
    });
    return () => {
      active = false;
    };
  }, [ready, hasSession, slug, add]);

  if (!isAuthConfigured()) return null;

  const onClick = async () => {
    if (busyRef.current) return;
    if (!hasSession) {
      const verdict = await requireAuth({ intent: 'compare' });
      if (verdict !== 'ok') return;
    }
    await add();
  };

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {state === 'in' ? (
        <ToolLink href={toolHref('compare-universities', region)} className={`${PILL} border-forest-600 bg-forest-50 text-forest-800 no-underline hover:bg-forest-100`}>
          <Check className="h-3.5 w-3.5" aria-hidden="true" /> In your comparison
        </ToolLink>
      ) : (
        <button
          type="button"
          onClick={() => void onClick()}
          aria-busy={busy || undefined}
          aria-label={`Add ${name} to your university comparison`}
          className={`${PILL} border-forest-300 bg-white text-forest-700 hover:border-forest-400 hover:bg-forest-50 ${busy ? 'cursor-wait' : ''}`}
        >
          <Columns3 className="h-3.5 w-3.5" aria-hidden="true" /> Add to compare
        </button>
      )}
      <span role="status" aria-live="polite" className="text-xs text-stone-600">
        {note}
      </span>
    </span>
  );
}

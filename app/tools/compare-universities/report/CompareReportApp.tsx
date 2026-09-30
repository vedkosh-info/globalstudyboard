'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { RotateCw } from 'lucide-react';
import { useRegion } from '@/components/RegionProvider';
import { getRegionBySlug } from '@/lib/regions';
import ReportView from '@/components/tools/ReportView';
import { RecordPicker, ReportNotice, ReportOffline } from '@/components/tools/ReportStates';
import { LOAD_FAILED_HELP, ToolSkeleton, ToolSessionEnded } from '@/components/tools/ToolStates';
import { buildCompareReport } from '@/lib/reports/compare-report';
import { defaultPaperFor, type Paper } from '@/lib/reports/model';
import { TIMED_OUT, checkToolSession, explainLoadFailure, withDeadline } from '@/lib/tools-shared';
import { toolHref } from '@/lib/tools';
import { mostRecentSet, type CompareCriterion, type CompareEntry, type CompareScore, type CompareSet } from '@/lib/compare';
import type { CompareFacts } from '@/lib/compare-catalogue';

/**
 * The Compare Universities report — one comparison: `?set=<id>` when the
 * student came from a specific comparison, otherwise the destination's most
 * recently touched one (the same rule the tool and the profile button use).
 * The fact sheets come from the tool's static catalogue route (never the
 * page payload); a deep-linked comparison from another destination still
 * renders, labelled with its own destination.
 *
 * A comparison with a profiled university is never built without that
 * catalogue: a failed or hung fetch (aborted after CATALOGUE_TIMEOUT_MS) is
 * shown as a load failure with "Try again" — never a report that calls every
 * profile "Added by you — no verified facts" and drops its facts and sources
 * (review RH-1). A comparison of typed-in universities only needs no catalogue.
 *
 * The first read runs under the tools' shared deadline (lib/tools-shared
 * withDeadline): a stalled connection ends on the offline card, never a
 * skeleton for ever. Choosing another comparison keeps the address bar's
 * fragment (`#region=`, the destination a hub handed over), so a reload keeps it too.
 */

type LoadState = 'loading' | 'ready' | 'setup' | 'error' | 'offline' | 'signed-out';
type CatalogueState = 'loading' | 'ready' | 'error';
const TOOL = toolHref('compare-universities');
const PATH = `${TOOL}/report`;
const CATALOGUE_URL = '/tools/compare-universities/catalogue';
/** As in the tool: a fetch of the fact sheets that has not settled by then is reported as failed, never left as an endless skeleton. */
const CATALOGUE_TIMEOUT_MS = 12_000;
/** For a comparison of typed-in universities only — stable, so the report is not rebuilt on every render. */
const NO_FACTS: Map<string, CompareFacts> = new Map();

// The report's notice card and buttons — the same look as ReportNotice (components/tools/ReportStates).
const CARD = 'rounded-2xl border border-stone-200 bg-white p-5 shadow-sm';
const BTN =
  'inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold no-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2';
const BTN_PRIMARY = `${BTN} bg-forest-700 text-cream-50 hover:bg-forest-800`;
const BTN_SECONDARY = `${BTN} border border-forest-300 bg-white text-forest-700 hover:border-forest-400 hover:bg-forest-50`;

export default function CompareReportApp() {
  const { effectiveRegion } = useRegion();
  const router = useRouter();
  const params = useSearchParams();
  const wanted = params.get('set');

  const [load, setLoad] = useState<LoadState>('loading');
  const [sets, setSets] = useState<CompareSet[]>([]);
  const [criteria, setCriteria] = useState<CompareCriterion[]>([]);
  const [entries, setEntries] = useState<CompareEntry[]>([]);
  const [scores, setScores] = useState<CompareScore[]>([]);
  const [facts, setFacts] = useState<Map<string, CompareFacts> | null>(null);
  const [catalogueState, setCatalogueState] = useState<CatalogueState>('loading');
  /** Bumped by "Try again" to fetch the fact sheets again (0 = the first fetch). */
  const [catalogueTry, setCatalogueTry] = useState(0);
  /** How many fetches have failed — the failure's wording (and its re-announcement) follows this, never a retry in progress. */
  const [catalogueFailures, setCatalogueFailures] = useState(0);
  /** Set by "Try again": once the facts arrive the button is gone, so focus goes to the report's title. */
  const retryFocus = useRef(false);
  const [includeNotes, setIncludeNotes] = useState(false);
  const [paperChoice, setPaperChoice] = useState<Paper | null>(null);

  // The fact sheets (static JSON, cached for an hour). An error answer, a network
  // failure, a hung request and an empty list are all a failure — never an empty map.
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), CATALOGUE_TIMEOUT_MS);
    const failed = () => {
      setCatalogueState('error');
      setCatalogueFailures((n) => n + 1);
    };
    void fetch(CATALOGUE_URL, { signal: controller.signal })
      .then((r) => (r.ok ? (r.json() as Promise<unknown>) : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (!active) return;
        if (!Array.isArray(data) || data.length === 0) {
          failed();
          return;
        }
        setFacts(new Map((data as CompareFacts[]).map((f) => [f.slug, f])));
        setCatalogueState('ready');
      })
      .catch(() => {
        if (active) failed();
      })
      .finally(() => window.clearTimeout(timer));
    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [catalogueTry]);

  useEffect(() => {
    if (catalogueState !== 'ready' || !retryFocus.current) return;
    retryFocus.current = false;
    // "Try again" left with the failure card, dropping focus to the page: land on
    // the report's title (it is not a tab stop, so it is made focusable for this) —
    // unless the student has already moved on.
    const now = document.activeElement;
    if (now && now !== document.body) return;
    const title = document.getElementById('report-title');
    if (title) {
      title.setAttribute('tabindex', '-1');
      title.focus();
    }
  }, [catalogueState]);

  const retryCatalogue = () => {
    if (catalogueState === 'loading') return;
    retryFocus.current = true;
    setCatalogueState('loading');
    setCatalogueTry((n) => n + 1);
  };

  useEffect(() => {
    let active = true;
    void withDeadline<LoadState | null>(async (signal, expired) => {
      const s = await checkToolSession();
      if (!active || expired()) return null;
      // The auth server could not be reached: say so (the session is untouched) rather than spin forever.
      if (s.kind === 'offline') return 'offline';
      // Signed out: the gate normally swaps in the sign-in card; never leave a spinner if it does not.
      if (s.kind !== 'ok') return 'signed-out';
      const [a, b, c, d] = await Promise.all([
        s.supabase.from('compare_sets').select('*').eq('user_id', s.user.id).order('created_at', { ascending: true }).range(0, 49).abortSignal(signal),
        s.supabase.from('compare_criteria').select('*').eq('user_id', s.user.id).order('created_at', { ascending: true }).range(0, 399).abortSignal(signal),
        s.supabase.from('compare_entries').select('*').eq('user_id', s.user.id).order('created_at', { ascending: true }).range(0, 199).abortSignal(signal),
        s.supabase.from('compare_scores').select('*').eq('user_id', s.user.id).order('created_at', { ascending: true }).range(0, 999).abortSignal(signal),
      ]);
      if (!active || expired()) return null;
      const err = a.error ?? b.error ?? c.error ?? d.error;
      // A failed read is most often the connection: ask before blaming anything else.
      if (err) return explainLoadFailure(err);
      setSets((a.data ?? []) as CompareSet[]);
      setCriteria((b.data ?? []) as CompareCriterion[]);
      setEntries((c.data ?? []) as CompareEntry[]);
      setScores((d.data ?? []) as CompareScore[]);
      return 'ready';
    })
      .catch((): LoadState => 'error')
      .then((next) => {
        // No answer in time: the same card as a connection that could not be reached.
        if (active && next) setLoad(next === TIMED_OUT ? 'offline' : next);
      });
    return () => {
      active = false;
    };
  }, []);

  // In a sentence after "for": "No comparison for the United States yet" (lib/regions proseName).
  const regionProse = getRegionBySlug(effectiveRegion)?.proseName ?? effectiveRegion;
  const regionSets = useMemo(
    () => sets.filter((x) => x.region === effectiveRegion).sort((a, b) => (b.updated_at || b.created_at).localeCompare(a.updated_at || a.created_at)),
    [sets, effectiveRegion],
  );
  const set = useMemo<CompareSet | null>(() => (wanted ? sets.find((x) => x.id === wanted) : undefined) ?? mostRecentSet(regionSets), [wanted, sets, regionSets]);
  const setEntries_ = useMemo(() => (set ? entries.filter((e) => e.set_id === set.id) : []), [entries, set]);
  const notesAvailable = Boolean(set && (set.notes?.trim() || setEntries_.some((e) => Boolean(e.note?.trim()))));
  const withNotes = includeNotes && notesAvailable;
  // Only a profiled university needs the fact sheets: the report waits for them, or says they failed.
  const needsFacts = setEntries_.some((e) => Boolean(e.college_slug));
  const factsFor = facts ?? (needsFacts ? null : NO_FACTS);
  const doc = useMemo(
    () => (set && factsFor ? buildCompareReport({ set, entries, criteria, scores, facts: factsFor, includeNotes: withNotes }) : null),
    [set, entries, criteria, scores, factsFor, withNotes],
  );

  const options = useMemo(() => {
    const list = regionSets.map((x) => ({ id: x.id, label: x.label }));
    if (set && !regionSets.some((x) => x.id === set.id)) list.unshift({ id: set.id, label: `${set.label} (${getRegionBySlug(set.region)?.displayName ?? set.region})` });
    return list;
  }, [regionSets, set]);

  if (load === 'loading') return <ToolSkeleton label="Loading your comparison…" />;
  if (load === 'setup') {
    return <ReportNotice title="The comparison tool is being switched on" text="Its tables are not created yet, so there is nothing to report on. Please check back soon." href={TOOL} linkLabel="Open Compare Universities" />;
  }
  if (load === 'signed-out') return <ToolSessionEnded />;
  if (load === 'offline') {
    return <ReportOffline href={TOOL} linkLabel="Open Compare Universities" />;
  }
  if (load === 'error') {
    return <ReportNotice alert title="Could not load your comparisons" text={LOAD_FAILED_HELP} href={TOOL} linkLabel="Open Compare Universities" />;
  }
  if (!set) {
    return (
      <ReportNotice
        title={`No comparison for ${regionProse} yet`}
        text="The report covers a comparison for the destination chosen in the header. Start one in Compare Universities first — or change the destination above."
        href={TOOL}
        linkLabel="Open Compare Universities"
      />
    );
  }
  // A failure stays on screen while a retry runs (its button says so), so focus is never pulled from under it.
  if (needsFacts && catalogueFailures > 0 && catalogueState !== 'ready') {
    return <CatalogueFailed failures={catalogueFailures} retrying={catalogueState === 'loading'} onRetry={retryCatalogue} />;
  }
  if (!doc) return <ToolSkeleton label="Loading your comparison…" />;

  return (
    <ReportView
      doc={doc}
      toolHref={TOOL}
      includeNotes={withNotes}
      onIncludeNotes={setIncludeNotes}
      notesAvailable={notesAvailable}
      paper={paperChoice ?? defaultPaperFor(set.region)}
      onPaper={setPaperChoice}
      // The fragment stays (a hub's `#region=` hand-off survives a reload); `scroll: false` also keeps Next from hash-scrolling to it.
      picker={<RecordPicker label="Comparison" value={set.id} options={options} onChange={(id) => router.replace(`${PATH}?set=${encodeURIComponent(id)}${window.location.hash}`, { scroll: false })} />}
    />
  );
}

/**
 * The fact sheets could not be loaded. The report does not print a comparison
 * without them. Only the words are the alert (keyed on the failure count, so a
 * repeat is announced again); the buttons sit outside it, so "Trying again…"
 * never re-reads the message.
 */
function CatalogueFailed({ failures, retrying, onRetry }: { failures: number; retrying: boolean; onRetry: () => void }) {
  return (
    <div className={`${CARD} max-w-2xl`}>
      <div role="alert">
        <h2 className="m-0 font-display text-xl font-bold tracking-editorial text-ink">
          <span key={failures}>{failures > 1 ? 'The university facts still could not be loaded' : 'The university facts could not be loaded'}</span>
        </h2>
        <p className="m-0 mt-2 text-sm leading-relaxed text-stone-700">
          The report prints each profile&rsquo;s facts beside your own scores, so it waits for them rather than leave them out. Try again,
          or reload the page. You are still signed in, and nothing you saved has changed.
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {/* Never `disabled` mid-retry: a focused button that became disabled would drop focus to the page. */}
        <button type="button" onClick={onRetry} className={BTN_PRIMARY} aria-busy={retrying || undefined}>
          <RotateCw className={`h-4 w-4 ${retrying ? 'motion-safe:animate-spin' : ''}`} aria-hidden="true" /> {retrying ? 'Trying again…' : 'Try again'}
        </button>
        <Link href={TOOL} className={BTN_SECONDARY}>
          Open Compare Universities
        </Link>
      </div>
    </div>
  );
}

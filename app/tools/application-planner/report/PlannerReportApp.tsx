'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRegion } from '@/components/RegionProvider';
import { REGIONS_ALPHABETICAL, getRegionBySlug, type RegionSlug } from '@/lib/regions';
import ReportView from '@/components/tools/ReportView';
import { ReportNotice, ReportOffline } from '@/components/tools/ReportStates';
import { LOAD_FAILED_HELP, ToolSkeleton, ToolSessionEnded } from '@/components/tools/ToolStates';
import { buildPlannerReport } from '@/lib/reports/planner-report';
import { defaultPaperFor, type Paper } from '@/lib/reports/model';
import { TIMED_OUT, checkToolSession, explainLoadFailure, withDeadline } from '@/lib/tools-shared';
import { toolHref } from '@/lib/tools';
import { inDestination, type ExamOption, type PlannerApplication, type PlannerTask } from '@/lib/planner';

/**
 * The Application Planner report — loads the student's own rows (Row-Level
 * Security scopes every query to them), builds the ReportDocument for the
 * destination in context and hands it to the shared ReportView. Re-tunes in
 * place when the header's destination changes (§18 "region in context"), and
 * covers exactly what the planner shows for that destination (`inDestination`),
 * so the two never disagree.
 */

type LoadState = 'loading' | 'ready' | 'setup' | 'error' | 'offline' | 'signed-out';
const TOOL = toolHref('application-planner');
/** The planner's own static exam list — read only to link each test date's official site. */
const CATALOGUE_URL = '/tools/application-planner/catalogue';
const CATALOGUE_TIMEOUT_MS = 12_000;

export default function PlannerReportApp() {
  const { effectiveRegion } = useRegion();
  const [load, setLoad] = useState<LoadState>('loading');
  const [apps, setApps] = useState<PlannerApplication[]>([]);
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [includeNotes, setIncludeNotes] = useState(false);
  const [paperChoice, setPaperChoice] = useState<Paper | null>(null);
  const [exams, setExams] = useState<ExamOption[]>([]);

  // Best effort, beside the plan: with the exam list, each test date links its
  // test body's official site; without it (a failed or slow fetch) the report
  // is complete, just without those links — it never waits on this or fails.
  useEffect(() => {
    let active = true;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), CATALOGUE_TIMEOUT_MS);
    void fetch(CATALOGUE_URL, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { exams?: unknown } | null) => {
        if (active && Array.isArray(data?.exams)) setExams(data.exams as ExamOption[]);
      })
      .catch(() => undefined)
      .finally(() => clearTimeout(timer));
    return () => {
      active = false;
      clearTimeout(timer);
      ctrl.abort();
    };
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      // Bounded like the planner's own first read: the session check (and the
      // token refresh inside it) and the two reads can each stall on a dead
      // connection, and the skeleton must not stay forever. Past the deadline
      // the reads are aborted and the page says it could not reach the server
      // (the session is untouched); a throw is reported as a load failure.
      const outcome = await withDeadline(async (signal) => {
        const s = await checkToolSession();
        // The auth server could not be reached: say so (the session is untouched) rather than spin forever.
        if (s.kind === 'offline') return 'offline' as const;
        // Signed out: the gate normally swaps in the sign-in card; never leave a spinner if it does not.
        if (s.kind !== 'ok') return 'signed-out' as const;
        const [a, b] = await Promise.all([
          s.supabase.from('planner_applications').select('*').eq('user_id', s.user.id).order('created_at', { ascending: false }).range(0, 199).abortSignal(signal),
          s.supabase.from('planner_tasks').select('*').eq('user_id', s.user.id).order('created_at', { ascending: true }).range(0, 1999).abortSignal(signal),
        ]);
        const err = a.error ?? b.error;
        // A failed read is most often the connection: ask before blaming anything else.
        if (err) return explainLoadFailure(err);
        return { apps: (a.data ?? []) as PlannerApplication[], tasks: (b.data ?? []) as PlannerTask[] };
      }).catch(() => 'error' as const);
      if (!active) return;
      if (outcome === TIMED_OUT) {
        setLoad('offline');
        return;
      }
      if (typeof outcome === 'string') {
        setLoad(outcome);
        return;
      }
      setApps(outcome.apps);
      setTasks(outcome.tasks);
      setLoad('ready');
    })();
    return () => {
      active = false;
    };
  }, []);

  const prose = getRegionBySlug(effectiveRegion)?.proseName ?? effectiveRegion;
  const regionApps = useMemo(() => inDestination(apps, tasks, effectiveRegion).apps, [apps, tasks, effectiveRegion]);
  // Other destinations are counted, never mixed in (§18) — named here so a
  // student who lands on an empty destination knows where their plan is.
  const elsewhere = useMemo(() => {
    const counts = new Map<RegionSlug, number>();
    for (const a of apps) if (a.region !== effectiveRegion) counts.set(a.region, (counts.get(a.region) ?? 0) + 1);
    const parts = REGIONS_ALPHABETICAL.filter((r) => counts.has(r.slug)).map((r) => `${r.proseName} (${counts.get(r.slug)})`);
    return parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}` : parts[0] ?? '';
  }, [apps, effectiveRegion]);
  const notesAvailable = regionApps.some((a) => Boolean(a.notes?.trim()));
  const withNotes = includeNotes && notesAvailable;
  const doc = useMemo(
    () => (load === 'ready' ? buildPlannerReport({ region: effectiveRegion, apps, tasks, includeNotes: withNotes, exams }) : null),
    [load, effectiveRegion, apps, tasks, withNotes, exams],
  );

  if (load === 'loading') return <ToolSkeleton label="Loading your plan…" />;
  if (load === 'setup') {
    return <ReportNotice title="The planner is being switched on" text="Its tables are not created yet, so there is nothing to report on. Please check back soon." href={TOOL} linkLabel="Open the planner" />;
  }
  if (load === 'signed-out') return <ToolSessionEnded />;
  if (load === 'offline') {
    return <ReportOffline href={TOOL} linkLabel="Open the planner" />;
  }
  if (load === 'error' || !doc) {
    return <ReportNotice alert title="Could not load your plan" text={LOAD_FAILED_HELP} href={TOOL} linkLabel="Open the planner" />;
  }
  if (regionApps.length === 0) {
    return (
      <ReportNotice
        title={`No applications for ${prose} yet`}
        text={
          elsewhere
            ? `The report covers the destination chosen in the header. Your plan has applications for ${elsewhere} — change the destination in the header to report on them.`
            : 'The report covers the destination chosen in the header. Add universities to your plan first — or change the destination in the header.'
        }
        href={TOOL}
        linkLabel="Open the planner"
      />
    );
  }

  return (
    <ReportView
      doc={doc}
      toolHref={TOOL}
      includeNotes={withNotes}
      onIncludeNotes={setIncludeNotes}
      notesAvailable={notesAvailable}
      paper={paperChoice ?? defaultPaperFor(effectiveRegion)}
      onPaper={setPaperChoice}
    />
  );
}

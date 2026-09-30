'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRegion } from '@/components/RegionProvider';
import { useAudience } from '@/components/AudienceProvider';
import { defaultAudienceFor } from '@/lib/audience';
import { getRegionBySlug } from '@/lib/regions';
import ReportView from '@/components/tools/ReportView';
import { ReportNotice, ReportOffline } from '@/components/tools/ReportStates';
import { LOAD_FAILED_HELP } from '@/components/tools/ToolStates';
import { ToolSkeleton, ToolSessionEnded } from '@/components/tools/ToolStates';
import { buildScoresReport } from '@/lib/reports/scores-report';
import { defaultPaperFor, type Paper } from '@/lib/reports/model';
import { checkToolSession, explainLoadFailure, isSetupError } from '@/lib/tools-shared';
import { toolHref } from '@/lib/tools';
import type { ScoresCatalogue, ShortlistApplication, TestScore, TestScoreSection } from '@/lib/test-scores';

/**
 * The Test Score Tracker report — the student's attempts (all of them; a
 * score is theirs wherever they apply) plus the readiness view for the
 * destination chosen in the header. There is no record picker: one report per
 * destination view. The planner's applications are read for the readiness
 * table; if the planner is not switched on yet the table simply says so. The
 * §16.7 audience is read exactly as the tool reads it, so a domestic student's
 * printed readiness table carries the same caveat the screen shows.
 */

type LoadState = 'loading' | 'ready' | 'setup' | 'error' | 'offline' | 'signed-out';
const TOOL = toolHref('test-score-tracker');
const CATALOGUE_URL = '/tools/test-score-tracker/catalogue';
/** As in the tool: a fetch of the test list that has not settled by then is reported as failed, never left as an endless skeleton. */
const CATALOGUE_TIMEOUT_MS = 12_000;

export default function ScoreReportApp() {
  const { effectiveRegion } = useRegion();
  const { chosenAudience } = useAudience();
  const domestic = (chosenAudience ?? defaultAudienceFor(effectiveRegion)) === 'domestic';

  const [load, setLoad] = useState<LoadState>('loading');
  const [scores, setScores] = useState<TestScore[]>([]);
  const [sections, setSections] = useState<TestScoreSection[]>([]);
  const [apps, setApps] = useState<ShortlistApplication[]>([]);
  const [shortlist, setShortlist] = useState<'ready' | 'setup' | 'error'>('ready');
  const [catalogue, setCatalogue] = useState<ScoresCatalogue | null>(null);
  const [catalogueFailed, setCatalogueFailed] = useState(false);
  const [includeNotes, setIncludeNotes] = useState(false);
  const [paperChoice, setPaperChoice] = useState<Paper | null>(null);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), CATALOGUE_TIMEOUT_MS);
    void fetch(CATALOGUE_URL, { signal: controller.signal })
      .then((r) => (r.ok ? (r.json() as Promise<ScoresCatalogue>) : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (!active) return;
        if (!Array.isArray(data?.exams) || data.exams.length === 0) setCatalogueFailed(true);
        else setCatalogue(data);
      })
      .catch(() => {
        if (active) setCatalogueFailed(true);
      })
      .finally(() => window.clearTimeout(timer));
    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      const s = await checkToolSession();
      if (!active) return;
      if (s.kind === 'offline') {
        setLoad('offline');
        return;
      }
      if (s.kind !== 'ok') {
        // Signed out: the gate normally swaps in the sign-in card; never leave a spinner if it does not.
        setLoad('signed-out');
        return;
      }
      const [a, b, c] = await Promise.all([
        s.supabase.from('test_scores').select('*').eq('user_id', s.user.id).order('test_date', { ascending: false }).range(0, 199),
        s.supabase.from('test_score_sections').select('*').eq('user_id', s.user.id).order('position', { ascending: true }).range(0, 999),
        s.supabase.from('planner_applications').select('id, name, region, college_slug').eq('user_id', s.user.id).order('created_at', { ascending: true }).range(0, 199),
      ]);
      if (!active) return;
      const err = a.error ?? b.error;
      if (err) {
        // A failed read is most often the connection: ask before blaming anything else.
        const why = await explainLoadFailure(err);
        if (active) setLoad(why);
        return;
      }
      setScores((a.data ?? []) as TestScore[]);
      setSections((b.data ?? []) as TestScoreSection[]);
      // A shortlist that could not be read is reported as such — never as an empty one.
      if (c.error) setShortlist(isSetupError(c.error) ? 'setup' : 'error');
      else setApps((c.data ?? []) as ShortlistApplication[]);
      setLoad('ready');
    })();
    return () => {
      active = false;
    };
  }, []);

  const regionProse = getRegionBySlug(effectiveRegion)?.proseName ?? effectiveRegion;
  const examsMap = useMemo(() => new Map((catalogue?.exams ?? []).map((e) => [e.slug, e])), [catalogue]);
  const collegesMap = useMemo(() => new Map((catalogue?.colleges ?? []).map((c) => [c.slug, c])), [catalogue]);
  const notesAvailable = scores.some((s) => Boolean(s.note?.trim()));
  const withNotes = includeNotes && notesAvailable;
  const doc = useMemo(
    () => (catalogue ? buildScoresReport({ region: effectiveRegion, scores, sections, exams: examsMap, applications: apps, colleges: collegesMap, shortlist, domestic, includeNotes: withNotes }) : null),
    [catalogue, effectiveRegion, scores, sections, examsMap, apps, collegesMap, shortlist, domestic, withNotes],
  );

  // Failure states first: once the test list has loaded, a document can be built
  // from EMPTY data, and the report would then claim "No scores recorded yet"
  // for scores it never read (Rule A).
  if (load === 'setup') {
    return <ReportNotice title="The score tracker is being switched on" text="Its tables are not created yet, so there is nothing to report on. Please check back soon." href={TOOL} linkLabel="Open the Test Score Tracker" />;
  }
  if (load === 'signed-out') return <ToolSessionEnded />;
  if (load === 'offline') {
    return <ReportOffline href={TOOL} linkLabel="Open the Test Score Tracker" />;
  }
  if (load === 'error') {
    return <ReportNotice alert title="Could not load your scores" text={LOAD_FAILED_HELP} href={TOOL} linkLabel="Open the Test Score Tracker" />;
  }
  if (catalogueFailed) {
    return <ReportNotice alert title="The list of tests could not be loaded" text="The report needs it to name each test. Please reload the page." href={TOOL} linkLabel="Open the Test Score Tracker" />;
  }
  if (load === 'loading' || !catalogue || !doc) {
    return <ToolSkeleton label="Loading your scores…" />;
  }
  if (scores.length === 0) {
    return (
      <ReportNotice
        title="No scores recorded yet"
        text={`The report lists every attempt you record, with the validity rule its test body publishes (or a note where it publishes none), and the readiness view for your shortlist in ${regionProse}. Record a score in the tracker first.`}
        href={TOOL}
        linkLabel="Open the Test Score Tracker"
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

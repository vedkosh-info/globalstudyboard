'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { CalendarDays, Check, ChevronDown, Download, ExternalLink, Plus, RotateCw, Search, Trash2, X } from 'lucide-react';
import ReportView from '@/components/tools/ReportView';
import { saveBlob } from '@/lib/download-file';
import { buildPlannerReport } from '@/lib/reports/planner-report';
import { defaultPaperFor, type Paper } from '@/lib/reports/model';
import type { User } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { checkToolSession, CONNECTION_LOST, explainLoadFailure, isUnansweredWrite, SESSION_ENDED, sessionMessage, TIMED_OUT, withDeadline, type ToolSession, type WriteOutcome } from '@/lib/tools-shared';
import { ToolLoadError, ToolOffline, ToolSetup, ToolSkeleton, ToolSessionEnded } from '@/components/tools/ToolStates';
import { useRegion } from '@/components/RegionProvider';
import CountrySelect from '@/components/tools/CountrySelect';
import RegionFlag from '@/components/RegionFlag';
import { REGIONS_ALPHABETICAL, getRegionBySlug, type Region, type RegionSlug } from '@/lib/regions';
import {
  APPLICATION_STATUSES,
  DATE_RE,
  LIMITS,
  PRIORITIES,
  PRIORITY_LABEL,
  STARTER_CHECKLIST,
  STATUS_HINT,
  STATUS_LABEL,
  TASK_KINDS,
  TASK_KIND_LABEL,
  cleanNotes,
  cleanText,
  cleanUrl,
  daysUntil,
  examForTitle,
  formatDue,
  inDestination,
  plannerCsv,
  relativeDue,
  todayIso,
  type ApplicationStatus,
  type CollegeOption,
  type ExamOption,
  type PlannerApplication,
  type PlannerTask,
  type Priority,
  type TaskKind,
} from '@/lib/planner';
import { groupExamsForDestination } from '@/lib/exam-picker';

/**
 * The Application Planner (signed-in view). Loaded as its own chunk by
 * PlannerGate, so this is the ONLY place on the route that imports the Supabase
 * SDK. Reads and writes go straight to the two planner tables through the
 * visitor's own cookie-bound session — Row-Level Security scopes every row to
 * them (migration 0003), the same model as the Save button.
 *
 * Everything shown is student-authored: the site asserts no date, fee or
 * outcome (constitution Rule A / §4.5). An entry links to its official site
 * when one is known, and the timeline carries the verify nudge (§5).
 *
 * Region in context (§18, like the other three tools): the planner shows ONE
 * destination — the one chosen in the header — and re-tunes in place when it
 * changes. Its list, status counts, totals, timeline, CSV and report all
 * follow `inDestination`: that destination's applications and their items,
 * plus the items not tied to a university (test dates belong to no
 * destination, so they show under each). Other destinations' applications are
 * counted, never mixed in, and there is no second destination control: the
 * add form adds to the destination on screen, and the profile search offers
 * that destination's universities (matches elsewhere are counted).
 *
 * If the static university/test list fails to load — or has not arrived within
 * CATALOGUE_TIMEOUT_MS — the plan stays fully usable; only the profile search
 * and the test-date form wait for the list, each saying so with a retry
 * (never "0 results", as if nothing matched).
 *
 * Accessibility: no drag-and-drop (status is a <select>); every action is a
 * real button or form; one polite live region announces outcomes; focus moves
 * to the new card after an add and back to "Add university" after a removal.
 * Ticking an item in Upcoming never strands focus: the row leaves, focus goes
 * to the next row (else the heading), and the status says where to undo it.
 *
 * Test dates (the items not tied to a university) have a home of their own —
 * "Your test dates", beside the form that adds them — where each can be
 * ticked, unticked and removed, like a university's checklist items. Upcoming
 * lists open items only, so without it a ticked or mistyped test date could
 * never be undone or removed, yet stayed in every destination's CSV and report
 * (review G5-S3).
 *
 * Failures are shown, not only announced: a form puts the reason beside its own
 * fields (the write returns it), and a select / checkbox / Remove puts it in
 * the alert under the summary. A failed write never signs the student out by
 * itself — only a definite "session gone" from the auth server does; a
 * connection problem keeps the session and everything typed (lib/tools-shared).
 *
 * Nothing waits forever: the first read and every write run under the shared
 * deadline (lib/tools-shared `withDeadline`). A write that got no answer may
 * still have reached the server, so its message says the outcome is unknown —
 * never "not saved" — and how to check (see underDeadline below).
 */

// ── Styling tokens (site design language, no one-offs) ─────────────────────
const CARD = 'rounded-2xl border border-stone-200 bg-white p-5 shadow-sm';
// A SOLID focus ring (forest-500, 4.42:1 on white) with a 1px white offset —
// the same field focus as the Test Score Tracker, so every tool reads alike (§15.2).
const FIELD =
  'w-full rounded-xl border border-stone-450 bg-white px-3 text-base text-ink placeholder:text-stone-500 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:ring-offset-1 sm:text-sm';
const INPUT = `${FIELD} h-10`;
const LABEL = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-600';
// An unavailable control looks unavailable — dimmed, a not-allowed cursor, no
// hover change: `disabled:` when there is nothing to do, `aria-disabled:` for a
// control held while a save it would interrupt is in flight (it stays
// focusable; `disabled` mid-flight would drop focus to <body>).
const BTN =
  'inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60';
const BTN_PRIMARY = `${BTN} bg-forest-700 text-cream-50 hover:bg-forest-800 aria-disabled:hover:bg-forest-700`;
const BTN_SECONDARY = `${BTN} border border-forest-300 bg-white text-forest-700 hover:border-forest-400 hover:bg-forest-50 aria-disabled:hover:border-forest-300 aria-disabled:hover:bg-white`;
const BTN_DANGER = `${BTN} border border-red-300 bg-white text-red-700 hover:bg-red-50 focus-visible:ring-red-500`;
const BTN_GHOST =
  'inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-stone-700';
/** A form's close (×) button. */
const CLOSE_X =
  '-m-1 rounded-lg p-1 text-stone-600 hover:bg-stone-100 hover:text-forest-800 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:hover:bg-transparent aria-disabled:hover:text-stone-600';
const CHIP = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold';
/** A list that did not load — the Test Score Tracker's box, so every tool reads alike. */
const WARN_BOX = 'rounded-xl border border-terracotta-200 bg-terracotta-50 px-4 py-3 text-sm leading-relaxed text-stone-800';

const STATUS_CHIP: Record<ApplicationStatus, string> = {
  researching: 'border-stone-200 bg-stone-100 text-stone-800',
  preparing: 'border-cream-300 bg-cream-200 text-stone-900',
  applied: 'border-forest-200 bg-forest-50 text-forest-800',
  offer: 'border-terracotta-200 bg-terracotta-50 text-terracotta-800',
  accepted: 'border-forest-700 bg-forest-700 text-cream-50',
  closed: 'border-stone-300 bg-stone-200 text-stone-700',
};

const PRIORITY_CHIP: Record<Priority, string> = {
  safe: 'border-forest-200 bg-forest-50 text-forest-800',
  target: 'border-cream-300 bg-cream-100 text-stone-800',
  reach: 'border-terracotta-200 bg-terracotta-50 text-terracotta-800',
};

type LoadState = 'loading' | 'ready' | 'setup' | 'error' | 'offline' | 'signed-out';

/** The latest outcome: 'ok' is announced (screen readers), 'error' is also shown. */
type Notice = { tone: 'ok' | 'error'; text: string } | null;

function dueTone(iso: string): string {
  const n = daysUntil(iso);
  if (n < 0) return 'text-red-700';
  if (n <= 7) return 'text-terracotta-700';
  return 'text-stone-700';
}

function regionName(slug: RegionSlug): string {
  return getRegionBySlug(slug)?.displayName ?? slug;
}

const regionOf = (slug: RegionSlug): Region => getRegionBySlug(slug) ?? REGIONS_ALPHABETICAL[0];

/** "A", "A and B", "A, B and C". */
function joinList(parts: string[]): string {
  return parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}` : parts[0] ?? '';
}

// ── Writes that get no answer ────────────────────────────────────────────────
// A request on a stalled connection never settles by itself — nor does the
// token refresh the SDK runs before it, which ignores any abort signal — so
// every write runs under the shared deadline (WRITE_TIMEOUT_MS, the Test Score
// Tracker's contract, review TRK-R2-6). A write handed to the SDK that got no
// answer may still have reached the server: the sentence says the outcome is
// UNKNOWN, never "not saved", and how to check. An insert says to reload before
// adding again (a second insert would list it twice); a change or a removal is
// safe to repeat, so it says so.

/** A change (status, estimate, a tick) that got no answer — its control rolls back, so it can simply be made again. */
const CHANGE_UNCONFIRMED =
  'We could not confirm whether that change was saved — the server did not answer. It is shown as it was before: make it again (saving the same change twice does no harm), or reload the page to check your planner.';
/**
 * Notes that got no answer. Unlike the controls above, the box is NOT rolled
 * back — the typed text stays in it — and a reload would replace it with
 * whatever was saved, so the sentence says to copy it first (review R4B-SK-1).
 */
const NOTES_UNCONFIRMED =
  'We could not confirm whether your notes were saved — the server did not answer. They are still in the box: press Save notes again (saving them twice does no harm). If you reload the page to check, copy them first — a reload shows only what was saved.';
const addUnconfirmed = (what: string): string =>
  `We could not confirm whether ${what} was added — the server did not answer, so it may or may not have been added. Reload the page to check your planner before adding it again, so it is not listed twice.`;
const removeUnconfirmed = (what: string): string =>
  `We could not confirm whether ${what} was removed — the server did not answer, so it may or may not have been removed. Try again (removing it twice does no harm), or reload the page to check your planner.`;

/**
 * No answer from the database: postgrest-js reports a request that got no HTTP
 * response as status 0 (it does not retry a write), and a gateway's 502 or 504
 * means the gateway never heard back either. The write may or may not have run,
 * so it is never explained as a refusal — nor as CONNECTION_LOST's "Nothing was
 * lost", which a later session check would say once the connection is back or
 * still down (review G4-V2-1).
 */
const unanswered = isUnansweredWrite;

/** How far one write got — all an unanswered write can truthfully be said to have done. */
interface WriteProgress {
  /** The request has been handed to the SDK: with no answer, it may have reached the server. */
  sent: boolean;
  /** The server refused it with this sentence's meaning; only explaining why (a session check) was still pending. */
  refused: string | null;
}

/**
 * One planner write under the shared deadline. Resolves to the write's own
 * outcome, or — when the deadline passes first, or the write throws — to what
 * can truthfully be said: nothing was sent (only the session check stalled:
 * CONNECTION_LOST), the server had already refused (that refusal), or the
 * request may have reached the server (`unknown`). The write reads `expired()`
 * to skip anything it would do after the student has been told.
 */
async function underDeadline(
  unknown: string,
  run: (signal: AbortSignal, expired: () => boolean, progress: WriteProgress) => Promise<WriteOutcome>,
): Promise<WriteOutcome> {
  const progress: WriteProgress = { sent: false, refused: null };
  const settle = (): string => (!progress.sent ? CONNECTION_LOST : progress.refused ?? unknown);
  const outcome = await withDeadline((signal, expired) => run(signal, expired, progress)).catch(settle);
  return outcome === TIMED_OUT ? settle() : outcome;
}

// ── Component ────────────────────────────────────────────────────────────────
const CATALOGUE_URL = '/tools/application-planner/catalogue';
/** A list that has not arrived by then is treated as failed (and can be retried), never as an endless "Loading…". */
const CATALOGUE_TIMEOUT_MS = 12_000;

type PlannerCatalogue = { colleges: CollegeOption[]; exams: ExamOption[] };
type CatalogueState = 'loading' | 'ready' | 'error';

/**
 * The picker list as the two forms that need it see it. `failed` stays true
 * while a retry runs (with `retrying`), so the retry button — and the focus on
 * it — never disappears mid-retry.
 */
interface ListStatus {
  phase: 'loading' | 'ready' | 'failed';
  retrying: boolean;
  /** How many fetches have failed; a message keyed on it is re-announced on a repeat failure. */
  failures: number;
  onRetry: () => void;
}

export default function PlannerApp() {
  const { effectiveRegion, country } = useRegion();
  const region = regionOf(effectiveRegion);
  /** The destination on screen, for async callbacks whose answer may land after the header changed it. */
  const regionRef = useRef(effectiveRegion);
  const [catalogue, setCatalogue] = useState<PlannerCatalogue | null>(null);
  const [catalogueState, setCatalogueState] = useState<CatalogueState>('loading');
  /** Bumped by "Try again" to re-fetch the list (0 = the first fetch). */
  const [catalogueTry, setCatalogueTry] = useState(0);
  /** How many fetches of the list have failed — the failure messages follow this, so they never change while a retry is still running. */
  const [catalogueFailures, setCatalogueFailures] = useState(0);
  const [load, setLoad] = useState<LoadState>('loading');
  const [apps, setApps] = useState<PlannerApplication[]>([]);
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [notice, setNotice] = useState<Notice>(null);
  const [adding, setAdding] = useState(false);
  // While the add form's save is in flight, nothing in the planner closes the
  // form: its × and Cancel and the header toggle wait (shown unavailable), so a
  // click can never look as if it stopped a save that then lands (review RT-4).
  // Only a destination change in the site header closes it — and the save's
  // answer then says where the university went (see addApplication).
  const [addSaving, setAddSaving] = useState(false);
  /** Identity of the add form on screen — bumped whenever it opens or closes (see addApplication). */
  const addFormToken = useRef(0);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [statusFilter, setStatusFilter] = useState<'all' | ApplicationStatus>('all');
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const headingRefs = useRef<Map<string, HTMLHeadingElement>>(new Map());
  const pendingFocus = useRef<string | null>(null);
  const userRef = useRef<User | null>(null);

  /**
   * The SDK client + a user verified with the auth server (checked once, then
   * cached), or the sentence that says why there is none: the connection
   * (nothing signed out) or an ended session (the gate is already swapping in
   * the sign-in card).
   */
  const session = useCallback(async (): Promise<ToolSession | string> => {
    const supabase = getSupabaseBrowserClient();
    if (supabase && userRef.current) return { supabase, user: userRef.current };
    const s = await checkToolSession();
    if (s.kind !== 'ok') return sessionMessage(s, SESSION_ENDED);
    userRef.current = s.user;
    return { supabase: s.supabase, user: s.user };
  }, []);

  /**
   * A write failed and the database did not say why: ask the auth server
   * whether the connection or the session is the problem. Only a definite
   * "session gone" signs the device out; a network failure keeps the session
   * and the student's input and says to check the connection (independent
   * review SH-01 — this used to sign a student out on any failed save).
   */
  const fail = useCallback(async (fallback: string): Promise<string> => {
    const s = await checkToolSession();
    if (s.kind === 'ok') userRef.current = s.user;
    else if (s.kind !== 'offline') userRef.current = null;
    return sessionMessage(s, fallback);
  }, []);

  /** Show why a select / checkbox / Remove did not save (a form shows its own reason inline). */
  const report = useCallback((why: WriteOutcome) => {
    if (why) setNotice({ tone: 'error', text: why });
  }, []);

  // The pickers (static JSON, cached for an hour) — off the page payload. A
  // failed, empty or never-settling fetch is a FAILURE with a retry, never an
  // empty list: an empty list would read as "no university matches" (review
  // CRIT2-5). The fetch is aborted after CATALOGUE_TIMEOUT_MS, the body read too.
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), CATALOGUE_TIMEOUT_MS);
    const failed = () => {
      setCatalogueState('error');
      setCatalogueFailures((n) => n + 1);
    };
    void fetch(CATALOGUE_URL, { signal: controller.signal })
      .then((r) => (r.ok ? (r.json() as Promise<PlannerCatalogue>) : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (!active) return;
        if (!Array.isArray(data?.colleges) || data.colleges.length === 0 || !Array.isArray(data.exams) || data.exams.length === 0) {
          failed();
          return;
        }
        setCatalogue(data);
        setCatalogueState('ready');
        if (catalogueTry > 0) setNotice({ tone: 'ok', text: 'The lists of universities and tests have loaded.' });
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

  const retryCatalogue = useCallback(() => {
    if (catalogueState === 'loading') return; // one fetch at a time — the button says "Trying again…"
    setCatalogueState('loading');
    setCatalogueTry((n) => n + 1);
  }, [catalogueState]);

  // Initial load — bounded like a write: the session check (and the token
  // refresh inside it) and the two reads can each stall on a dead connection,
  // and the skeleton must not stay forever. Past the deadline the reads are
  // aborted and the page says it could not reach the server (nothing was
  // signed out, nothing changed); a throw is reported as a load failure.
  useEffect(() => {
    let active = true;
    void (async () => {
      const outcome = await withDeadline(async (signal) => {
        const s = await checkToolSession();
        if (s.kind === 'offline') return 'offline' as const;
        // Signed out: the gate normally swaps in the sign-in card; never leave a spinner if it does not.
        if (s.kind !== 'ok') return 'signed-out' as const;
        userRef.current = s.user;
        const [a, t] = await Promise.all([
          s.supabase.from('planner_applications').select('*').eq('user_id', s.user.id).order('created_at', { ascending: false }).range(0, 199).abortSignal(signal),
          s.supabase.from('planner_tasks').select('*').eq('user_id', s.user.id).order('created_at', { ascending: true }).range(0, 1999).abortSignal(signal),
        ]);
        const err = a.error ?? t.error;
        // A failed read is most often the connection: ask before blaming anything else.
        if (err) return explainLoadFailure(err);
        return { apps: (a.data ?? []) as PlannerApplication[], tasks: (t.data ?? []) as PlannerTask[] };
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

  useEffect(() => {
    addFormToken.current += 1;
  }, [adding]);

  // The destination in the header changed: the planner re-tunes in place, and
  // the add form closes — what it holds (a picked profile) belongs to the old
  // destination. Its identity moves on here, not only once the close has
  // rendered, so a save answering in between already knows its form is gone
  // (see addApplication). The same rule as the cost planner and Compare.
  useEffect(() => {
    regionRef.current = effectiveRegion;
    addFormToken.current += 1;
    setAdding(false);
    setAddSaving(false);
  }, [effectiveRegion]);

  // First visit with nothing saved: open the add form, so the search box is the first step.
  // Later destination changes do not pop the form open again.
  const offeredAdd = useRef(false);
  useEffect(() => {
    if (load !== 'ready' || offeredAdd.current) return;
    offeredAdd.current = true;
    if (!apps.some((a) => a.region === effectiveRegion)) setAdding(true);
  }, [load, apps, effectiveRegion]);

  // Focus the card added last (after its heading has mounted).
  useEffect(() => {
    const id = pendingFocus.current;
    if (!id) return;
    const el = headingRefs.current.get(id);
    if (el) {
      pendingFocus.current = null;
      el.focus({ preventScroll: false });
    }
  }, [apps]);

  // §18: ONE destination on screen. Everything below — the list, the status
  // counts, the totals, the timeline, the CSV and the report — is this scope.
  const scope = useMemo(() => inDestination(apps, tasks, effectiveRegion), [apps, tasks, effectiveRegion]);
  const regionApps = scope.apps;
  const [includeNotes, setIncludeNotes] = useState(false);
  const [paperChoice, setPaperChoice] = useState<Paper | null>(null);
  const plannerNotes = useMemo(() => regionApps.some((a) => Boolean(a.notes?.trim())), [regionApps]);
  const plannerDoc = useMemo(
    () => buildPlannerReport({ region: effectiveRegion, apps, tasks, includeNotes: includeNotes && plannerNotes, exams: catalogue?.exams ?? [] }),
    [effectiveRegion, apps, tasks, includeNotes, plannerNotes, catalogue],
  );
  /** Other destinations' applications: counted, never mixed in. */
  const otherRegions = useMemo(() => {
    const counts = new Map<RegionSlug, number>();
    for (const a of apps) if (a.region !== effectiveRegion) counts.set(a.region, (counts.get(a.region) ?? 0) + 1);
    return REGIONS_ALPHABETICAL.filter((r) => counts.has(r.slug)).map((r) => ({ region: r, n: counts.get(r.slug)! }));
  }, [apps, effectiveRegion]);
  /** Our profiles for this destination, once the list has loaded. */
  const regionProfiles = useMemo(
    () => (catalogue ? catalogue.colleges.filter((c) => c.region === effectiveRegion && (!country || c.country === country)).length : null),
    [catalogue, effectiveRegion, country],
  );
  const list: ListStatus = {
    phase: catalogueState === 'ready' ? 'ready' : catalogueFailures > 0 ? 'failed' : 'loading',
    retrying: catalogueState === 'loading',
    failures: catalogueFailures,
    onRetry: retryCatalogue,
  };

  const tasksByApp = useMemo(() => {
    const m = new Map<string, PlannerTask[]>();
    for (const t of tasks) {
      if (!t.application_id) continue;
      const list = m.get(t.application_id) ?? [];
      list.push(t);
      m.set(t.application_id, list);
    }
    return m;
  }, [tasks]);

  const appName = useCallback((id: string | null) => (id ? apps.find((a) => a.id === id)?.name ?? '' : ''), [apps]);

  const upcoming = useMemo(
    () =>
      [...scope.linked, ...scope.general]
        .filter((t) => t.due_on && !t.done)
        .sort((x, y) => (x.due_on! < y.due_on! ? -1 : x.due_on! > y.due_on! ? 1 : 0)),
    [scope],
  );
  /**
   * What the timeline says when nothing is open. Dated items that are all ticked
   * done are not "no dated items": say so, and where to untick one — this is the
   * first thing read after a tick empties the list (review R4B-SK-2).
   */
  const upcomingEmpty = useMemo(() => {
    const linked = scope.linked.some((t) => t.due_on);
    const general = scope.general.some((t) => t.due_on);
    if (!linked && !general) return 'No dated items yet. Add a deadline inside an application, or a test date below.';
    const where = linked && general ? 'under “Your test dates” or in its university’s checklist' : general ? 'under “Your test dates”' : 'in its university’s checklist';
    return `Nothing open — every dated item is ticked done. To bring one back, untick it ${where}.`;
  }, [scope]);
  const overdueCount = upcoming.filter((t) => daysUntil(t.due_on!) < 0).length;
  const soonCount = upcoming.filter((t) => {
    const n = daysUntil(t.due_on!);
    return n >= 0 && n <= 30;
  }).length;

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const a of regionApps) c[a.status] = (c[a.status] ?? 0) + 1;
    return c;
  }, [regionApps]);
  // A filter whose chip has disappeared (its last application was removed, or
  // the header moved to a destination without one) falls back to "all" instead
  // of stranding the visitor on an empty list with no control to clear it
  // (independent review).
  const activeStatus: 'all' | ApplicationStatus = statusFilter !== 'all' && !statusCounts[statusFilter] ? 'all' : statusFilter;
  const visible = regionApps.filter((a) => activeStatus === 'all' || a.status === activeStatus);

  // ── Mutations ───────────────────────────────────────────────────────────
  // Each resolves to null when it saved, or the sentence that says why not —
  // and each runs under the shared deadline (underDeadline, above).
  const addApplication = useCallback(
    async (input: Omit<PlannerApplication, 'id' | 'created_at' | 'updated_at'>, withChecklist: boolean): Promise<WriteOutcome> => {
      // The form that sent this save. Only a destination change in the header
      // closes it mid-save (its own × and Cancel wait): the answer still counts
      // — it just must not close a newer form or pull focus out of it, and a
      // refusal is shown here because its form is gone.
      const token = addFormToken.current;
      const stillOpen = () => addFormToken.current === token;
      const unknown = addUnconfirmed(input.name);
      const refused = (why: string): WriteOutcome => {
        if (stillOpen()) return why;
        setNotice({
          tone: 'error',
          // An unanswered add explains itself; any other refusal says that its form is gone.
          text: why === unknown ? why : `${input.name} may not have been added — the destination changed while it was saving. Reload the page to check your planner before adding it again.`,
        });
        return null;
      };
      setAddSaving(true);
      try {
        const got: { app?: PlannerApplication; session?: ToolSession } = {};
        const why = await underDeadline(unknown, async (signal, expired, progress) => {
          const s = await session();
          if (typeof s === 'string') return s;
          progress.sent = true;
          const { data, error, status } = await s.supabase
            .from('planner_applications')
            .insert({ user_id: s.user.id, ...input })
            .select('*')
            .abortSignal(signal)
            .single();
          if (expired()) return null;
          if (error || !data) {
            if (/planner_applications_cap/.test(error?.message ?? '')) return `You have reached the ${LIMITS.applications}-application limit — remove one you no longer need, then add this one.`;
            if (unanswered(status, error)) return unknown;
            progress.refused = 'Could not add it. Please try again.';
            return fail(progress.refused);
          }
          got.app = data as PlannerApplication;
          got.session = s;
          return null;
        });
        const app = got.app;
        const s = got.session;
        if (why || !app || !s) return refused(why ?? unknown);
        // The starting checklist is a second write with its own deadline. The
        // university is added whatever happens to it, so its outcome only
        // changes the notice: added, refused, or unknown (then a second
        // checklist added by hand could list the items twice — reload first).
        let newTasks: PlannerTask[] = [];
        let checklist: 'added' | 'failed' | 'unconfirmed' = 'added';
        if (withChecklist) {
          const outcome = await withDeadline(async (signal) => {
            const { data: rows, error: checklistError, status } = await s.supabase
              .from('planner_tasks')
              .insert(STARTER_CHECKLIST.map((c) => ({ user_id: s.user.id, application_id: app.id, title: c.title, kind: c.kind })))
              .select('*')
              .abortSignal(signal);
            if (checklistError) return unanswered(status, checklistError) ? ('unconfirmed' as const) : ('failed' as const);
            return (rows ?? []) as PlannerTask[];
          }).catch(() => 'unconfirmed' as const);
          if (outcome === TIMED_OUT) checklist = 'unconfirmed';
          else if (typeof outcome === 'string') checklist = outcome;
          else newTasks = outcome;
        }
        const current = stillOpen();
        // The form adds to the destination on screen, so the new card is
        // normally right there. If the header changed while it saved, it is
        // kept under its own destination and the notice says where.
        const shown = app.region === regionRef.current;
        if (current && shown) {
          pendingFocus.current = app.id;
          // A status filter would hide the new (Researching) card — and the focus meant for it.
          setStatusFilter('all');
        }
        setApps((prev) => [app, ...prev]);
        if (newTasks.length) setTasks((prev) => [...prev, ...newTasks]);
        setExpanded((prev) => new Set(prev).add(app.id));
        if (current) setAdding(false);
        const where = shown ? '' : ` to your plan for ${regionOf(app.region).proseName}`;
        if (checklist === 'failed') {
          setNotice({ tone: 'error', text: `Added ${app.name}${where}, but its starting checklist could not be added — add the items you need inside it.` });
        } else if (checklist === 'unconfirmed') {
          setNotice({
            tone: 'error',
            text: `Added ${app.name}${where}, but we could not confirm whether its starting checklist was added — the server did not answer. Reload the page to check before adding those items yourself.`,
          });
        } else {
          setNotice({
            tone: 'ok',
            text: `Added ${app.name}${where}${newTasks.length ? ` with ${newTasks.length} checklist items` : ''}${shown ? '' : ' — change the destination in the header to see it'}.`,
          });
        }
        return null;
      } finally {
        // Only this save's own form is unlocked: once a destination change has
        // closed it, the flag belongs to whatever form is open now.
        if (stillOpen()) setAddSaving(false);
      }
    },
    [fail, session],
  );

  const patchApplication = useCallback(
    async (id: string, patch: Partial<Pick<PlannerApplication, 'status' | 'priority' | 'notes'>>, announce?: string): Promise<WriteOutcome> => {
      const before = apps.find((a) => a.id === id);
      if (!before) return null;
      setApps((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
      // Roll back ONLY the fields this call changed, and only while they still
      // hold this call's value — a later edit that already saved, to another
      // field or to the same one, must survive (independent review).
      const rollBack = () =>
        setApps((prev) =>
          prev.map((a) => {
            if (a.id !== id) return a;
            const revert: Partial<PlannerApplication> = {};
            for (const k of Object.keys(patch) as Array<keyof typeof patch>) if (a[k] === patch[k]) (revert as Record<string, unknown>)[k] = before[k];
            return { ...a, ...revert };
          }),
        );
      // Notes keep their typed text in the box through a rollback; a control does not.
      const unknown = 'notes' in patch ? NOTES_UNCONFIRMED : CHANGE_UNCONFIRMED;
      const why = await underDeadline(unknown, async (signal, expired, progress) => {
        const s = await session();
        if (typeof s === 'string') return s;
        progress.sent = true;
        const { error, status } = await s.supabase.from('planner_applications').update(patch).eq('id', id).eq('user_id', s.user.id).abortSignal(signal);
        if (expired() || !error) return null;
        if (unanswered(status, error)) return unknown;
        progress.refused = 'Could not save that change. Please try again.';
        return fail(progress.refused);
      });
      if (why) {
        rollBack();
        return why;
      }
      if (announce) setNotice({ tone: 'ok', text: announce });
      return null;
    },
    [apps, fail, session],
  );

  const deleteApplication = useCallback(
    async (id: string): Promise<WriteOutcome> => {
      const target = apps.find((a) => a.id === id);
      if (!target) return null;
      const unknown = removeUnconfirmed(target.name);
      const why = await underDeadline(unknown, async (signal, expired, progress) => {
        const s = await session();
        if (typeof s === 'string') return s;
        progress.sent = true;
        const { error, status } = await s.supabase.from('planner_applications').delete().eq('id', id).eq('user_id', s.user.id).abortSignal(signal);
        if (expired() || !error) return null;
        if (unanswered(status, error)) return unknown;
        progress.refused = `Could not remove ${target.name}. Please try again.`;
        return fail(progress.refused);
      });
      // Not removed, or not known to be: the card stays, and so does focus.
      if (why) return why;
      // The card's controls unmount with it: focus goes to "Add university" —
      // unless the student has moved on while the removal ran.
      const card = headingRefs.current.get(id)?.closest('article');
      const active = document.activeElement;
      const stranded = !active || active === document.body || Boolean(card?.contains(active));
      setApps((prev) => prev.filter((a) => a.id !== id));
      setTasks((prev) => prev.filter((t) => t.application_id !== id));
      setNotice({ tone: 'ok', text: `Removed ${target.name}.` });
      if (stranded) addBtnRef.current?.focus();
      return null;
    },
    [apps, fail, session],
  );

  const addTask = useCallback(
    async (input: { application_id: string | null; title: string; kind: TaskKind; due_on: string | null }): Promise<WriteOutcome> => {
      const unknown = addUnconfirmed(`“${input.title}”`);
      const got: { row?: PlannerTask } = {};
      const why = await underDeadline(unknown, async (signal, expired, progress) => {
        const s = await session();
        if (typeof s === 'string') return s;
        progress.sent = true;
        const { data, error, status } = await s.supabase
          .from('planner_tasks')
          .insert({ user_id: s.user.id, ...input })
          .select('*')
          .abortSignal(signal)
          .single();
        if (expired()) return null;
        if (error || !data) {
          if (/planner_tasks_cap/.test(error?.message ?? '')) return `You have reached the ${LIMITS.tasks.toLocaleString('en-US')}-item limit — remove items you no longer need, then add this one.`;
          if (unanswered(status, error)) return unknown;
          progress.refused = 'Could not add the item. Please try again.';
          return fail(progress.refused);
        }
        got.row = data as PlannerTask;
        return null;
      });
      const row = got.row;
      if (why || !row) return why ?? unknown;
      setTasks((prev) => [...prev, row]);
      setNotice({ tone: 'ok', text: `Added “${row.title}”.` });
      return null;
    },
    [fail, session],
  );

  const toggleTask = useCallback(
    async (id: string, done: boolean): Promise<WriteOutcome> => {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done } : t)));
      // Undo only while the item still shows this call's value — a later tick that already saved must survive.
      const rollBack = () => setTasks((prev) => prev.map((t) => (t.id === id && t.done === done ? { ...t, done: !done } : t)));
      const why = await underDeadline(CHANGE_UNCONFIRMED, async (signal, expired, progress) => {
        const s = await session();
        if (typeof s === 'string') return s;
        progress.sent = true;
        const { error, status } = await s.supabase.from('planner_tasks').update({ done }).eq('id', id).eq('user_id', s.user.id).abortSignal(signal);
        if (expired() || !error) return null;
        if (unanswered(status, error)) return CHANGE_UNCONFIRMED;
        progress.refused = 'Could not save that change. Please try again.';
        return fail(progress.refused);
      });
      if (why) {
        rollBack();
        return why;
      }
      return null;
    },
    [fail, session],
  );

  const deleteTask = useCallback(
    async (id: string): Promise<WriteOutcome> => {
      const target = tasks.find((t) => t.id === id);
      const label = target ? `“${target.title}”` : 'the item';
      const unknown = removeUnconfirmed(label);
      const why = await underDeadline(unknown, async (signal, expired, progress) => {
        const s = await session();
        if (typeof s === 'string') return s;
        progress.sent = true;
        const { error, status } = await s.supabase.from('planner_tasks').delete().eq('id', id).eq('user_id', s.user.id).abortSignal(signal);
        if (expired() || !error) return null;
        if (unanswered(status, error)) return unknown;
        progress.refused = `Could not remove ${label}. Please try again.`;
        return fail(progress.refused);
      });
      if (why) return why;
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setNotice({ tone: 'ok', text: `Removed ${label}.` });
      return null;
    },
    [fail, session, tasks],
  );

  // Ticking an item in Upcoming takes its row away (the list shows open items
  // only), and the focused checkbox with it: focus goes to the row named here —
  // the next one, else the one before, else the heading — once the list has
  // rendered, and only if focus really dropped to the page (never pulled from
  // where the student has since moved). A checklist that re-sorts a ticked item
  // needs nothing: React re-focuses a node it moves.
  const focusAfterTick = useRef<string | null>(null);
  useEffect(() => {
    const target = focusAfterTick.current;
    if (!target) return;
    focusAfterTick.current = null;
    const active = document.activeElement;
    if (active && active !== document.body) return;
    document.getElementById(target)?.focus();
  }, [tasks]);

  // The destination on screen, like the report (the whole plan is in the account data download).
  const downloadCsv = () => {
    const csv = plannerCsv(apps, tasks, effectiveRegion, catalogue?.exams ?? []);
    saveBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `globalstudyboard-application-planner-${effectiveRegion}-${todayIso()}.csv`);
    setNotice({ tone: 'ok', text: `Your plan for ${region.proseName} was downloaded as a CSV file.` });
  };

  const toggleExpanded = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // The header toggle would close the add form: it waits while that form saves.
  const addLocked = adding && addSaving;

  // ── Render ──────────────────────────────────────────────────────────────
  if (load === 'loading') return <ToolSkeleton label="Loading your planner…" />;
  if (load === 'signed-out') return <ToolSessionEnded />;
  if (load === 'offline') return <ToolOffline />;
  if (load === 'setup') return <ToolSetup name="The planner" />;
  if (load === 'error') return <ToolLoadError what="planner" />;

  // What the empty state offers to search — only what the loaded list really holds.
  const profileWhere = country ?? region.proseName;
  const searchOffer =
    regionProfiles === null
      ? 'search our university profiles or add your own'
      : regionProfiles === 0
        ? `type its name under “Add your own” (we have no university profiles for ${profileWhere} yet)`
        : `search our ${regionProfiles} ${regionProfiles === 1 ? 'profile' : 'profiles'} for ${profileWhere} or add your own`;
  const anythingSaved = apps.length > 0 || tasks.length > 0;

  return (
    <div className="space-y-5">
      {/* Destination + summary + actions */}
      <div className={`${CARD} space-y-4`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="m-0 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-600">
              <RegionFlag slug={effectiveRegion} className="h-3.5" /> Applications for {region.proseName}
            </p>
            <CountrySelect region={region} />
            {otherRegions.length > 0 && (
              <p className="m-0 mt-1 text-sm text-stone-700">
                You also have{' '}
                {joinList(
                  otherRegions.map(({ region: r, n }, i) =>
                    i === 0 ? `${n} ${n === 1 ? 'application' : 'applications'} for ${r.proseName}` : `${n} for ${r.proseName}`,
                  ),
                )}
                .
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <button
                type="button"
                onClick={downloadCsv}
                className={BTN_SECONDARY}
                disabled={regionApps.length === 0 && scope.general.length === 0}
                aria-describedby={anythingSaved ? 'planner-scope-hint' : undefined}
              >
                <Download className="h-4 w-4" aria-hidden="true" /> Download CSV
              </button>
              <button
                ref={addBtnRef}
                type="button"
                onClick={() => {
                  if (!addLocked) setAdding((v) => !v);
                }}
                aria-expanded={adding}
                aria-controls="planner-add-panel"
                aria-disabled={addLocked || undefined}
                className={BTN_PRIMARY}
              >
                <Plus className="h-4 w-4" aria-hidden="true" /> Add university
              </button>
            </div>
            {anythingSaved && (
              <p id="planner-scope-hint" className="m-0 max-w-xs text-xs leading-relaxed text-stone-600 sm:text-right">
                This file covers {region.proseName} and your test dates. Every destination is in the data download on your{' '}
                <Link href="/account?tab=data" className="text-forest-700 underline hover:text-forest-800">
                  account page
                </Link>
                .
              </p>
            )}
          </div>
        </div>
        {(regionApps.length > 0 || scope.general.length > 0) && (
          <dl className="m-0 grid gap-3 border-t border-stone-200 pt-4 min-[480px]:grid-cols-3 min-[480px]:gap-4">
            <div className="min-w-0">
              <dt className="text-xs font-semibold uppercase leading-snug tracking-wide text-stone-600 [overflow-wrap:normal] [word-break:normal]">Applications</dt>
              <dd className="m-0 font-display text-2xl font-bold text-ink">{regionApps.length}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-semibold uppercase leading-snug tracking-wide text-stone-600 [overflow-wrap:normal] [word-break:normal]">Due in 30 days</dt>
              <dd className="m-0 font-display text-2xl font-bold text-ink">{soonCount}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-semibold uppercase leading-snug tracking-wide text-stone-600 [overflow-wrap:normal] [word-break:normal]">Overdue</dt>
              <dd className={`m-0 font-display text-2xl font-bold ${overdueCount ? 'text-red-700' : 'text-ink'}`}>{overdueCount}</dd>
            </div>
          </dl>
        )}
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {notice?.tone === 'ok' ? notice.text : ''}
      </p>
      <p role="alert" className={notice?.tone === 'error' ? 'm-0 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800' : 'sr-only'}>
        {notice?.tone === 'error' ? notice.text : ''}
      </p>

      {adding && (
        <AddApplicationPanel
          key={region.slug}
          id="planner-add-panel"
          colleges={catalogue?.colleges ?? null}
          list={list}
          region={region}
          country={country}
          onCancel={() => {
            setAdding(false);
            addBtnRef.current?.focus();
          }}
          onSubmit={addApplication}
        />
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        {/* Applications — this destination's only */}
        <section aria-labelledby="planner-apps-heading" className="min-w-0 space-y-4">
          <h2 id="planner-apps-heading" className={`font-display text-2xl font-bold tracking-editorial text-ink m-0 ${regionApps.length > 0 ? '' : 'sr-only'}`}>
            Your applications
          </h2>

          {regionApps.length > 0 && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
              {(['all', ...APPLICATION_STATUSES] as const).map((s) => {
                const active = activeStatus === s;
                const n = s === 'all' ? regionApps.length : statusCounts[s] ?? 0;
                if (s !== 'all' && n === 0) return null;
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setStatusFilter(s)}
                    className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 ${
                      active ? 'border-forest-600 bg-forest-50 text-forest-800' : 'border-stone-300 bg-white text-stone-700 hover:border-forest-300 hover:bg-forest-50/60'
                    }`}
                  >
                    {s === 'all' ? 'All' : STATUS_LABEL[s]}
                    <span className="rounded-full bg-stone-100 px-1.5 text-xs font-semibold text-stone-700">{n}</span>
                  </button>
                );
              })}
            </div>
          )}

          {regionApps.length === 0 ? (
            adding ? null : (
              <div className={`${CARD} text-center`}>
                <h3 className="font-display text-xl font-bold tracking-editorial text-ink">No applications for {region.proseName} yet</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-700">
                  {searchOffer}. Then enter the deadlines that matter to you.
                </p>
                <button type="button" onClick={() => setAdding(true)} className={`${BTN_PRIMARY} mt-4`}>
                  <Plus className="h-4 w-4" aria-hidden="true" /> Add a university
                </button>
              </div>
            )
          ) : visible.length === 0 ? (
            <p className="text-sm text-stone-700">No applications match this filter.</p>
          ) : (
            <ul className="list-none space-y-4 p-0 m-0">
              {visible.map((app) => (
                <li key={app.id}>
                  <ApplicationCard
                    app={app}
                    tasks={tasksByApp.get(app.id) ?? []}
                    expanded={expanded.has(app.id)}
                    onToggleExpand={() => toggleExpanded(app.id)}
                    onStatus={(status) => void patchApplication(app.id, { status }, `${app.name}: ${STATUS_LABEL[status]}.`).then(report)}
                    onPriority={(priority) => void patchApplication(app.id, { priority }).then(report)}
                    onSaveNotes={(notes) => patchApplication(app.id, { notes }, 'Notes saved.')}
                    onDelete={() => void deleteApplication(app.id).then(report)}
                    onAddTask={(t) => addTask({ application_id: app.id, ...t })}
                    onToggleTask={(id, done) => void toggleTask(id, done).then(report)}
                    onDeleteTask={(id) => void deleteTask(id).then(report)}
                    headingRef={(el) => {
                      if (el) headingRefs.current.set(app.id, el);
                      else headingRefs.current.delete(app.id);
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Timeline — this destination's dates, plus the test dates (which belong to none). Sticky beside
            the list on wide screens, and never taller than the window: a sticky column that is taller keeps
            its lower part — the test-date form — out of reach until the end of the page, so it scrolls itself. */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto" aria-labelledby="planner-upcoming-heading">
          <div className={CARD}>
            <h2
              id="planner-upcoming-heading"
              tabIndex={-1}
              className="flex items-center gap-2 font-display text-xl font-bold tracking-editorial text-ink outline-none m-0"
            >
              <CalendarDays className="h-5 w-5 text-forest-700" aria-hidden="true" /> Upcoming
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-stone-600">
              Dates you entered for {region.proseName}, plus your test dates, which belong to no single destination. Deadlines change every
              year — confirm each on the official site.
            </p>
            {upcoming.length === 0 ? (
              <p className="mt-3 text-sm text-stone-700">{upcomingEmpty}</p>
            ) : (
              <ul className="mt-3 list-none divide-y divide-stone-200 p-0 m-0">
                {upcoming.map((t, i) => (
                  <li key={t.id} className="flex items-start gap-3 py-2.5">
                    <input
                      type="checkbox"
                      id={`up-${t.id}`}
                      checked={t.done}
                      onChange={(e) => {
                        if (!e.target.checked) return; // open items only: here an item can only be ticked
                        // The row leaves this list: say where it went (and so where to undo it), and hand
                        // focus to the next row — else the one before, else the heading.
                        const uni = appName(t.application_id);
                        const neighbour = upcoming[i + 1] ?? upcoming[i - 1];
                        setNotice({ tone: 'ok', text: `Marked “${t.title}” done. To undo it, untick it ${uni ? `in ${uni}’s checklist` : 'under “Your test dates”'}.` });
                        if (document.activeElement?.id === `up-${t.id}`) focusAfterTick.current = neighbour ? `up-${neighbour.id}` : 'planner-upcoming-heading';
                        void toggleTask(t.id, true).then(report);
                      }}
                      className="mt-1 h-4 w-4 shrink-0 accent-forest-700"
                      aria-label={`Mark “${t.title}” done`}
                    />
                    <div className="min-w-0 flex-1 [overflow-wrap:break-word] [word-break:normal]">
                      <label htmlFor={`up-${t.id}`} className="block text-sm font-medium text-ink">
                        {t.title}
                      </label>
                      <p className="m-0 text-xs text-stone-600">
                        {appName(t.application_id) ? `${appName(t.application_id)} · ` : ''}
                        <time dateTime={t.due_on!}>{formatDue(t.due_on!)}</time>
                        <span className={`ml-1 font-semibold ${dueTone(t.due_on!)}`}>· {relativeDue(t.due_on!)}</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <TestDatesCard
            items={scope.general}
            exams={catalogue?.exams ?? null}
            region={region}
            list={list}
            onSubmit={addTask}
            onToggle={(id, done) => void toggleTask(id, done).then(report)}
            onRemove={async (id) => {
              const why = await deleteTask(id);
              report(why);
              return why;
            }}
          />
        </aside>
      </div>

      {(regionApps.length > 0 || scope.general.length > 0) && (
        <ReportView
          compact
          doc={plannerDoc}
          includeNotes={includeNotes}
          onIncludeNotes={setIncludeNotes}
          notesAvailable={plannerNotes}
          paper={paperChoice ?? defaultPaperFor(effectiveRegion)}
          onPaper={setPaperChoice}
        />
      )}
    </div>
  );
}

// ── Add university ───────────────────────────────────────────────────────────
function AddApplicationPanel({
  id,
  colleges,
  list,
  region,
  country,
  onCancel,
  onSubmit,
}: {
  id: string;
  /** null until the picker list has loaded. */
  colleges: CollegeOption[] | null;
  list: ListStatus;
  /** The destination on screen — every university added here goes to it (no second destination control, §18). */
  region: Region;
  /** Optional country inside that destination. Profiles offered are that country's only. */
  country: string | null;
  onCancel: () => void;
  /** Resolves to null when it saved, or the reason it did not (shown here, beside the form). */
  onSubmit: (input: Omit<PlannerApplication, 'id' | 'created_at' | 'updated_at'>, withChecklist: boolean) => Promise<WriteOutcome>;
}) {
  const uid = useId();
  const [mode, setMode] = useState<'catalogue' | 'custom'>('catalogue');
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<CollegeOption | null>(null);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [program, setProgram] = useState('');
  const [intake, setIntake] = useState(region.intakes[0] ?? '');
  const [priority, setPriority] = useState<'' | Priority>('');
  const [checklist, setChecklist] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  // Synchronous latch: a double-Enter lands twice in one tick, before `busy` re-renders.
  const busyRef = useRef(false);
  const firstRef = useRef<HTMLInputElement>(null);
  /** Stands in for the search box while the list has not loaded. */
  const retryRef = useRef<HTMLButtonElement>(null);
  /** "Try again" was pressed HERE — once the list arrives the button is gone, so focus lands on the search box. */
  const retried = useRef(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  // Focus the message only AFTER the render that shows it: a synchronous
  // focus() runs before React commits the text, so a screen reader would hear
  // nothing (the paragraph carries no role="alert", so focus is the only cue).
  // The tick re-focuses an identical repeated message.
  const [errorTick, setErrorTick] = useState(0);
  useEffect(() => {
    if (errorTick) errorRef.current?.focus();
  }, [errorTick]);
  const showError = (message: string) => {
    setError(message);
    setErrorTick((n) => n + 1);
  };

  useEffect(() => {
    (firstRef.current ?? retryRef.current)?.focus();
  }, [mode]);

  // One course area on the profile is the programme. Several stay as choices — guessing one would be wrong.
  useEffect(() => {
    const only = picked?.courses?.length === 1 ? picked.courses[0] : '';
    if (only) setProgram((cur) => (cur.trim() ? cur : only));
  }, [picked]);

  // The search box is swapped for the retry when the list fails (and back when
  // it loads): if that swap took the student's focus with it, put it on the
  // replacement — never leave it on the page body.
  const phase = list.phase;
  useEffect(() => {
    const dropped = !document.activeElement || document.activeElement === document.body;
    if (phase === 'failed' && mode === 'catalogue' && dropped) retryRef.current?.focus();
    if (phase === 'ready' && retried.current) {
      retried.current = false;
      if (dropped) firstRef.current?.focus();
    }
  }, [phase, mode]);

  /** How many of our profiles are for this destination (null until the list loads). */
  const inCountry = useCallback((c: CollegeOption) => c.region === region.slug && (!country || c.country === country), [region.slug, country]);
  const regionCount = useMemo(() => (colleges ? colleges.filter(inCountry).length : null), [colleges, inCountry]);

  // The search offers THIS destination's profiles (§18); matches for other
  // destinations are counted in the help line, never offered here — adding one
  // would put it under a destination the planner is not showing.
  const search = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2 || picked || !colleges) return { results: [] as CollegeOption[], here: 0, elsewhere: 0, otherCountry: 0 };
    const tokens = q.split(/\s+/);
    const hits = colleges.filter((c) => {
      const hay = `${c.name} ${c.place}`.toLowerCase();
      return tokens.every((t) => hay.includes(t));
    });
    const mine = hits.filter(inCountry);
    const otherDest = hits.filter((c) => c.region !== region.slug).length;
    return { results: mine.slice(0, 8), here: mine.length, elsewhere: otherDest, otherCountry: hits.length - mine.length - otherDest };
  }, [query, colleges, picked, region.slug, inCountry]);
  const results = search.results;
  /** A city this destination's profiles really have, for the placeholder (a fixed "e.g. Toronto" would find nothing elsewhere). */
  const where = country ?? region.proseName;
  const example = useMemo(() => colleges?.find(inCountry)?.place.split(',')[0] ?? null, [colleges, inCountry]);

  const searchHelp = (() => {
    if (!colleges) return 'Loading the university list…';
    if (regionCount === 0) return `We have no university profiles for ${where} yet — add it under “Add your own”.`;
    if (query.trim().length < 2) return 'Type at least two letters.';
    const { here, elsewhere, otherCountry } = search;
    const mine =
      here === 0
        ? `No match in ${where}`
        : here > results.length
          ? `${here} matches in ${where} — showing the first ${results.length}; keep typing to narrow them`
          : `${here} ${here === 1 ? 'match' : 'matches'} in ${where}`;
    const another = otherCountry ? `; ${otherCountry} in another country here — choose that country above` : '';
    const other = elsewhere
      ? `; ${elsewhere} in other destinations — to add ${elsewhere === 1 ? 'it' : 'one'}, change the destination in the header`
      : '';
    return `${mine}${another}${other}.`;
  })();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busyRef.current) return;
    const finalName = mode === 'catalogue' ? picked?.name ?? '' : cleanText(name, LIMITS.name);
    if (!finalName) {
      showError(
        mode === 'custom'
          ? 'Enter the university name.'
          : list.phase === 'ready'
            ? 'Pick a university from the results, or switch to "Add your own".'
            : list.phase === 'failed'
              ? 'The list of university profiles has not loaded — use “Try again”, or reload the page.'
              : 'The list of university profiles is still loading — try again in a moment.',
      );
      return;
    }
    const rawUrl = mode === 'catalogue' ? picked?.url ?? '' : url.trim();
    const finalUrl = rawUrl ? cleanUrl(rawUrl) : '';
    if (rawUrl && !finalUrl) {
      showError('The official link must start with https:// and contain no spaces.');
      return;
    }
    setError('');
    busyRef.current = true;
    setBusy(true);
    let why: WriteOutcome = null;
    try {
      why = await onSubmit(
        {
          college_slug: mode === 'catalogue' ? picked?.slug ?? null : null,
          name: finalName,
          region: mode === 'catalogue' && picked ? picked.region : region.slug,
          program: cleanText(program, LIMITS.program) || null,
          intake: cleanText(intake, LIMITS.intake) || null,
          official_url: finalUrl || null,
          status: 'researching',
          priority: priority || null,
          notes: null,
        },
        checklist,
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
    if (why) {
      // Everything typed stays in the form: a refusal can simply be tried
      // again, and an unanswered add says to check the planner first.
      showError(why);
    }
  };

  // While the save is in flight the form stays open: × and Cancel wait (shown
  // unavailable, still focusable), so neither can seem to stop a save that then lands.
  const cancel = () => {
    if (!busyRef.current) onCancel();
  };

  const tabBtn = (active: boolean) =>
    `inline-flex h-9 items-center rounded-full border px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 ${
      active ? 'border-forest-600 bg-forest-50 text-forest-800' : 'border-stone-300 bg-white text-stone-700 hover:border-forest-300'
    }`;

  return (
    <form id={id} onSubmit={(e) => void submit(e)} className={`${CARD} space-y-4`} aria-labelledby={`${uid}-h`} aria-describedby={`${uid}-dest`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={`${uid}-h`} className="font-display text-xl font-bold tracking-editorial text-ink m-0">
            Add a university
          </h2>
          <p id={`${uid}-dest`} className="m-0 mt-1 text-sm text-stone-700">
            <RegionFlag slug={region.slug} className="mr-1.5 h-3.5" />
            {country ?? region.proseName}
          </p>
        </div>
        <button type="button" onClick={cancel} className={CLOSE_X} aria-label="Close the add form" aria-disabled={busy || undefined}>
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="How to add">
        <button type="button" aria-pressed={mode === 'catalogue'} onClick={() => setMode('catalogue')} className={tabBtn(mode === 'catalogue')}>
          From our profiles
        </button>
        <button type="button" aria-pressed={mode === 'custom'} onClick={() => setMode('custom')} className={tabBtn(mode === 'custom')}>
          Add your own
        </button>
      </div>

      {mode === 'catalogue' ? (
        <div>
          {list.phase === 'failed' ? (
            // Never an empty search that answers "no match": say the list did
            // not load, and offer the retry in the search box's place. Not
            // live: the test-date card's alert (always on the page) announces
            // the failure once, naming both lists.
            <>
              <p className={LABEL}>Search our university profiles</p>
              <div className={WARN_BOX}>
                <p id={`${uid}-qerr`} className="m-0">
                  <span className="font-semibold text-ink">
                    {list.failures > 1 ? 'The list of university profiles still could not be loaded.' : 'The list of university profiles could not be loaded.'}
                  </span>{' '}
                  Searching it needs the list — try again, or reload the page. Your plan is safe, and you are still signed in.
                </p>
                <button
                  ref={retryRef}
                  type="button"
                  onClick={() => {
                    retried.current = true;
                    list.onRetry();
                  }}
                  className={`${BTN_SECONDARY} mt-3`}
                  aria-busy={list.retrying || undefined}
                  aria-describedby={`${uid}-qerr`}
                >
                  <RotateCw className={`h-4 w-4 ${list.retrying ? 'motion-safe:animate-spin' : ''}`} aria-hidden="true" />{' '}
                  {list.retrying ? 'Trying again…' : 'Try again'}
                </button>
              </div>
            </>
          ) : (
            <>
              <label htmlFor={`${uid}-q`} className={LABEL}>
                {regionCount ? `Search ${regionCount} ${regionCount === 1 ? 'university' : 'universities'} in ${region.proseName}` : 'Search our university profiles'}
              </label>
              {picked ? (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-forest-200 bg-forest-50 px-3 py-2">
                  <p className="m-0 text-sm text-ink">
                    <span className="font-semibold">{picked.name}</span> <span className="text-stone-600">· {picked.place}</span>
                  </p>
                  <button type="button" onClick={() => setPicked(null)} className={BTN_GHOST}>
                    Change
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" aria-hidden="true" />
                  <input
                    ref={firstRef}
                    id={`${uid}-q`}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={example ? `University or city, e.g. ${example}` : 'University or city'}
                    autoComplete="off"
                    className={`${INPUT} pl-9`}
                    aria-describedby={`${uid}-qhelp`}
                  />
                  <p id={`${uid}-qhelp`} className="mt-1 text-xs text-stone-600">
                    {searchHelp}
                  </p>
                  {results.length > 0 && (
                    <ul className="mt-1 list-none divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200 bg-white p-0 m-0 shadow-sm">
                      {results.map((c) => (
                        <li key={c.slug}>
                          <button
                            type="button"
                            onClick={() => {
                              setPicked(c);
                              setQuery('');
                            }}
                            className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-forest-50 focus-visible:bg-forest-50 focus-visible:outline-none"
                          >
                            {/* Every result is for the destination on screen (named above), so no per-row flag — an umbrella
                                destination's flag would sit beside universities in other countries. */}
                            <span className="min-w-0">
                              <span className="block font-semibold text-ink">{c.name}</span>
                              <span className="block text-xs text-stone-600">{c.place}</span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor={`${uid}-name`} className={LABEL}>
              University name
            </label>
            <input ref={firstRef} id={`${uid}-name`} value={name} onChange={(e) => setName(e.target.value)} maxLength={LIMITS.name} required className={INPUT} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor={`${uid}-url`} className={LABEL}>
              Official website <span className="font-normal normal-case tracking-normal text-stone-500">(optional, https)</span>
            </label>
            <input id={`${uid}-url`} type="url" inputMode="url" value={url} onChange={(e) => setUrl(e.target.value)} maxLength={LIMITS.url} placeholder="https://" className={INPUT} />
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor={`${uid}-program`} className={LABEL}>
            Programme <span className="font-normal normal-case tracking-normal text-stone-500">(optional)</span>
          </label>
          <input
            id={`${uid}-program`}
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            maxLength={LIMITS.program}
            placeholder={(picked?.courses?.length ?? 0) > 0 ? 'Choose or type your own' : 'e.g. MSc Computer Science'}
            list={(picked?.courses?.length ?? 0) > 0 ? `${uid}-courses` : undefined}
            className={INPUT}
          />
          {(picked?.courses?.length ?? 0) > 0 && (
            <datalist id={`${uid}-courses`}>
              {picked!.courses!.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          )}
        </div>
        <div>
          <label htmlFor={`${uid}-intake`} className={LABEL}>
            Intake <span className="font-normal normal-case tracking-normal text-stone-500">(optional)</span>
          </label>
          <input
            id={`${uid}-intake`}
            value={intake}
            onChange={(e) => setIntake(e.target.value)}
            maxLength={LIMITS.intake}
            placeholder="Type a year if you know it"
            list={`${uid}-intakes`}
            className={INPUT}
          />
          <datalist id={`${uid}-intakes`}>
            {region.intakes.map((i) => (
              <option key={i} value={i} />
            ))}
          </datalist>
        </div>
        <div>
          <label htmlFor={`${uid}-priority`} className={LABEL}>
            Your own estimate <span className="font-normal normal-case tracking-normal text-stone-500">(optional)</span>
          </label>
          <select id={`${uid}-priority`} value={priority} onChange={(e) => setPriority(e.target.value as '' | Priority)} className={INPUT} aria-describedby={`${uid}-phelp`}>
            <option value="">Not set</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>
          <p id={`${uid}-phelp`} className="mt-1 text-xs text-stone-600">Your view only — we never predict admission.</p>
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm text-stone-700">
        <input type="checkbox" checked={checklist} onChange={(e) => setChecklist(e.target.checked)} className="mt-1 h-4 w-4 accent-forest-700" />
        <span>
          Add a starter checklist ({STARTER_CHECKLIST.length} items, editable). Confirm the real list with the university.
        </span>
      </label>

      <p ref={errorRef} tabIndex={-1} className={`m-0 text-sm text-red-700 outline-none ${error ? '' : 'sr-only'}`}>
        {error}
      </p>

      <div className="flex flex-wrap gap-2">
        <button type="submit" className={BTN_PRIMARY} aria-busy={busy || undefined}>
          {busy ? 'Adding…' : 'Add to my planner'}
        </button>
        <button type="button" onClick={cancel} className={BTN_SECONDARY} aria-disabled={busy || undefined}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Application card ─────────────────────────────────────────────────────────
function ApplicationCard({
  app,
  tasks,
  expanded,
  onToggleExpand,
  onStatus,
  onPriority,
  onSaveNotes,
  onDelete,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  headingRef,
}: {
  app: PlannerApplication;
  tasks: PlannerTask[];
  expanded: boolean;
  onToggleExpand: () => void;
  onStatus: (s: ApplicationStatus) => void;
  onPriority: (p: Priority | null) => void;
  /** Resolves to null when it saved, or the reason it did not (shown beside the Save button). */
  onSaveNotes: (notes: string | null) => Promise<WriteOutcome>;
  onDelete: () => void;
  /** Resolves to null when it saved, or the reason it did not (shown under the add form). */
  onAddTask: (t: { title: string; kind: TaskKind; due_on: string | null }) => Promise<WriteOutcome>;
  onToggleTask: (id: string, done: boolean) => void;
  onDeleteTask: (id: string) => void;
  headingRef: (el: HTMLHeadingElement | null) => void;
}) {
  const uid = useId();
  const [confirm, setConfirm] = useState(false);
  const [notes, setNotes] = useState(app.notes ?? '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesError, setNotesError] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskKind, setTaskKind] = useState<TaskKind>('application');
  const [taskDue, setTaskDue] = useState('');
  const [taskError, setTaskError] = useState('');
  const [taskBusy, setTaskBusy] = useState(false);
  const taskBusyRef = useRef(false);
  const taskInputRef = useRef<HTMLInputElement>(null);
  const removeBtnRef = useRef<HTMLButtonElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const confirmWasOpen = useRef(false);

  // The remove-confirmation swaps the clicked button for two others: keep
  // keyboard focus on the new "Remove" (open) or back on the trigger (cancel).
  useEffect(() => {
    if (confirm) confirmBtnRef.current?.focus();
    else if (confirmWasOpen.current) removeBtnRef.current?.focus();
    confirmWasOpen.current = confirm;
  }, [confirm]);

  const done = tasks.filter((t) => t.done).length;
  const nextDue = tasks.filter((t) => t.due_on && !t.done).map((t) => t.due_on!).sort()[0];
  const notesDirty = notes !== (app.notes ?? '');
  const officialHost = (() => {
    try {
      return app.official_url ? new URL(app.official_url).hostname.replace(/^www\./, '') : null;
    } catch {
      return null;
    }
  })();

  const submitTask = async (e: FormEvent) => {
    e.preventDefault();
    if (taskBusyRef.current) return;
    const title = cleanText(taskTitle, LIMITS.taskTitle);
    if (!title) {
      setTaskError('Enter what needs doing.');
      return;
    }
    if (taskDue && !DATE_RE.test(taskDue)) {
      setTaskError('Enter the date as YYYY-MM-DD.');
      return;
    }
    setTaskError('');
    taskBusyRef.current = true;
    setTaskBusy(true);
    let why: WriteOutcome = null;
    try {
      why = await onAddTask({ title, kind: taskKind, due_on: taskDue || null });
    } finally {
      taskBusyRef.current = false;
      setTaskBusy(false);
    }
    if (why) {
      setTaskError(why); // the item stays typed in, ready to try again
    } else {
      setTaskTitle('');
      setTaskDue('');
    }
  };

  return (
    <article className={CARD} aria-labelledby={`${uid}-h`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 id={`${uid}-h`} ref={headingRef} tabIndex={-1} className="font-display text-xl font-bold tracking-editorial text-ink outline-none m-0">
            {app.college_slug ? (
              <Link href={`/colleges/${app.college_slug}`} className="no-underline hover:underline">
                {app.name}
              </Link>
            ) : (
              app.name
            )}
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-stone-700 m-0">
            <span className="inline-flex items-center gap-1.5">
              <RegionFlag slug={app.region} /> {regionName(app.region)}
            </span>
            {app.program && <span>· {app.program}</span>}
            {app.intake && <span>· {app.intake}</span>}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`${CHIP} ${STATUS_CHIP[app.status]}`}>{STATUS_LABEL[app.status]}</span>
            {app.priority && <span className={`${CHIP} ${PRIORITY_CHIP[app.priority]}`}>{PRIORITY_LABEL[app.priority]} (your estimate)</span>}
            {tasks.length > 0 && (
              <span className={`${CHIP} border-stone-200 bg-white text-stone-700`}>
                <Check className="mr-1 h-3 w-3" aria-hidden="true" /> {done}/{tasks.length} done
              </span>
            )}
            {nextDue && (
              <span className={`${CHIP} border-stone-200 bg-white ${dueTone(nextDue)}`}>
                Next: {formatDue(nextDue)} · {relativeDue(nextDue)}
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <label className="text-sm">
            <span className="sr-only">Status for {app.name}</span>
            <select value={app.status} onChange={(e) => onStatus(e.target.value as ApplicationStatus)} className={`${INPUT} w-auto`} title={STATUS_HINT[app.status]}>
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={onToggleExpand} aria-expanded={expanded} aria-controls={`${uid}-body`} className={BTN_GHOST}>
            Details <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div id={`${uid}-body`} hidden={!expanded} className="mt-4 space-y-5 border-t border-stone-200 pt-4">
        {/* Checklist */}
        <section aria-labelledby={`${uid}-tasks`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 id={`${uid}-tasks`} className="text-sm font-semibold uppercase tracking-wide text-stone-600 m-0">
              Checklist &amp; deadlines
            </h4>
            {app.official_url && (
              <a
                href={app.official_url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline text-sm font-medium text-forest-700 underline hover:text-forest-800 [overflow-wrap:break-word] [word-break:normal] [&_svg]:inline [&_svg]:align-[-0.125em]"
              >
                Official site{officialHost ? ` (${officialHost})` : ''} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </div>
          {tasks.length === 0 ? (
            <p className="mt-2 text-sm text-stone-700">Nothing here yet — add the deadline and documents this university asks for.</p>
          ) : (
            <ul className="mt-2 list-none divide-y divide-stone-100 p-0 m-0">
              {[...tasks]
                .sort((a, b) => Number(a.done) - Number(b.done) || (a.due_on ?? '9999').localeCompare(b.due_on ?? '9999'))
                .map((t) => (
                  <li key={t.id} className="flex items-start gap-3 py-2">
                    <input
                      type="checkbox"
                      id={`t-${t.id}`}
                      checked={t.done}
                      onChange={(e) => onToggleTask(t.id, e.target.checked)}
                      className="mt-1 h-4 w-4 shrink-0 accent-forest-700"
                    />
                    <label htmlFor={`t-${t.id}`} className={`min-w-0 flex-1 text-sm [overflow-wrap:break-word] [word-break:normal] ${t.done ? 'text-stone-500 line-through' : 'text-ink'}`}>
                      {t.title}
                      <span className="ml-2 inline-flex items-center rounded-full border border-stone-200 bg-stone-50 px-1.5 text-[11px] font-semibold text-stone-600 no-underline">
                        {TASK_KIND_LABEL[t.kind]}
                      </span>
                      {t.due_on && (
                        <span className={`ml-2 text-xs font-semibold ${t.done ? 'text-stone-500' : dueTone(t.due_on)}`}>
                          <time dateTime={t.due_on}>{formatDue(t.due_on)}</time>
                          {!t.done && ` · ${relativeDue(t.due_on)}`}
                        </span>
                      )}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteTask(t.id);
                        // The clicked button unmounts with its row — land on the add-item field.
                        taskInputRef.current?.focus();
                      }}
                      aria-label={`Remove “${t.title}”`} className="shrink-0 rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-red-700">
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
            </ul>
          )}
          <form onSubmit={(e) => void submitTask(e)} className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:items-end">
            <div>
              <label htmlFor={`${uid}-tt`} className={LABEL}>
                Add an item
              </label>
              <input ref={taskInputRef} id={`${uid}-tt`} value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} maxLength={LIMITS.taskTitle} placeholder="e.g. Application deadline" className={INPUT} />
            </div>
            <div>
              <label htmlFor={`${uid}-tk`} className={LABEL}>
                Kind
              </label>
              <select id={`${uid}-tk`} value={taskKind} onChange={(e) => setTaskKind(e.target.value as TaskKind)} className={INPUT}>
                {TASK_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {TASK_KIND_LABEL[k]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`${uid}-td`} className={LABEL}>
                Due <span className="font-normal normal-case tracking-normal text-stone-500">(optional)</span>
              </label>
              <input id={`${uid}-td`} type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} className={INPUT} />
            </div>
            <button type="submit" className={BTN_SECONDARY} aria-busy={taskBusy || undefined}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Add
            </button>
            <p role="alert" className={`m-0 text-sm text-red-700 sm:col-span-4 ${taskError ? '' : 'sr-only'}`}>
              {taskError}
            </p>
          </form>
        </section>

        {/* Estimate + notes */}
        <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)]">
          <div>
            <label htmlFor={`${uid}-pr`} className={LABEL}>
              Your own estimate
            </label>
            <select id={`${uid}-pr`} value={app.priority ?? ''} onChange={(e) => onPriority((e.target.value || null) as Priority | null)} className={`${INPUT} w-auto`}>
              <option value="">Not set</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABEL[p]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${uid}-notes`} className={LABEL}>
              Private notes
            </label>
            <textarea
              id={`${uid}-notes`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={LIMITS.notes}
              rows={3}
              placeholder="Contacts, fee notes, reminders — nothing sensitive, please."
              className={`${FIELD} py-2`}
            />
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                disabled={!notesDirty}
                aria-busy={savingNotes || undefined}
                onClick={() => {
                  setSavingNotes(true);
                  setNotesError('');
                  void onSaveNotes(cleanNotes(notes) || null)
                    .then((why) => setNotesError(why ?? ''))
                    .finally(() => setSavingNotes(false));
                }}
                className={BTN_SECONDARY}
              >
                {savingNotes ? 'Saving…' : 'Save notes'}
              </button>
              <span className="text-xs text-stone-600">
                {notes.length}/{LIMITS.notes}
              </span>
            </div>
            <p role="alert" className={`m-0 mt-2 text-sm text-red-700 ${notesError ? '' : 'sr-only'}`}>
              {notesError}
            </p>
          </div>
        </div>

        {/* Remove */}
        <div className="border-t border-stone-200 pt-4">
          {confirm ? (
            <div className="flex flex-wrap items-center gap-2 text-sm text-stone-700">
              <span>
                Remove <strong>{app.name}</strong>{tasks.length ? ` and its ${tasks.length} item${tasks.length === 1 ? '' : 's'}` : ''}?
              </span>
              <button ref={confirmBtnRef} type="button" onClick={onDelete} className={BTN_DANGER}>
                Remove
              </button>
              <button type="button" onClick={() => setConfirm(false)} className={BTN_SECONDARY}>
                Keep it
              </button>
            </div>
          ) : (
            <button ref={removeBtnRef} type="button" onClick={() => setConfirm(true)} className={`${BTN_GHOST} text-red-700 hover:text-red-800`}>
              <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove this application
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

// ── Test dates (the items not tied to a university) ──────────────────────────
/**
 * The home of the items not tied to a university — the test dates added
 * here. Upcoming lists open items only, so this is where a test date can be
 * ticked, unticked (a mis-click, or a date that moved) and removed, exactly as
 * a university's checklist items can be inside its card (review G5-S3). They
 * belong to no destination, so the list is the same whichever one is chosen;
 * each row links the test body's official site, where the date must be
 * confirmed. Below it, the form that adds one — its picker offers the header
 * destination's tests first, in the same order as the Test Score Tracker's.
 */
function TestDatesCard({
  items,
  exams,
  region,
  list,
  onSubmit,
  onToggle,
  onRemove,
}: {
  /** Every item not tied to a university, done or not. */
  items: PlannerTask[];
  /** null until the list has loaded. */
  exams: ExamOption[] | null;
  /** The destination in the header — its tests are offered first. */
  region: Region;
  list: ListStatus;
  /** Resolves to null when it saved, or the reason it did not (shown in the form). */
  onSubmit: (t: { application_id: null; title: string; kind: TaskKind; due_on: string | null }) => Promise<WriteOutcome>;
  onToggle: (id: string, done: boolean) => void;
  /** Resolves to null when it removed the item, or the reason it did not (the planner shows it). */
  onRemove: (id: string) => Promise<WriteOutcome>;
}) {
  const uid = useId();
  const [exam, setExam] = useState('');
  const [what, setWhat] = useState<'test' | 'registration'>('test');
  const [due, setDue] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const retryRef = useRef<HTMLButtonElement>(null);
  /** "Try again" was pressed HERE — once the list arrives the button is gone, so focus lands on the test picker. */
  const retried = useRef(false);
  /** The test picker has focus — so a failure that replaces it moves focus to the retry (and never pulls focus here otherwise). */
  const selectFocused = useRef(false);
  /** Removals in flight: one per item at a time (a second click would only repeat the answer). */
  const removingRef = useRef(new Set<string>());
  const [removing, setRemoving] = useState<ReadonlySet<string>>(() => new Set());

  // Soonest first, done or not — a tick never reorders the list, so the rows
  // stay where they are under the pointer (a short, dated list reads best in
  // date order; a university's checklist sinks its done items instead).
  const sorted = useMemo(
    () => [...items].sort((a, b) => (a.due_on ?? '9999-12-31').localeCompare(b.due_on ?? '9999-12-31') || a.created_at.localeCompare(b.created_at)),
    [items],
  );
  const groups = useMemo(() => (exams ? groupExamsForDestination(region.slug, exams) : null), [exams, region.slug]);

  const phase = list.phase;
  useEffect(() => {
    const dropped = !document.activeElement || document.activeElement === document.body;
    if (phase === 'failed' && selectFocused.current) {
      selectFocused.current = false;
      if (dropped) retryRef.current?.focus();
    }
    if (phase === 'ready' && retried.current) {
      retried.current = false;
      if (dropped) selectRef.current?.focus();
    }
  }, [phase]);

  const remove = async (t: PlannerTask, i: number) => {
    if (removingRef.current.has(t.id)) return;
    removingRef.current.add(t.id);
    setRemoving(new Set(removingRef.current));
    // Where focus goes once the row has gone: the next one, else the one before, else the heading.
    const next = sorted[i + 1] ?? sorted[i - 1];
    let why: WriteOutcome = null;
    try {
      why = await onRemove(t.id);
    } finally {
      removingRef.current.delete(t.id);
      setRemoving(new Set(removingRef.current));
    }
    // Not removed, or not known to be: the row stays, and focus stays on its Remove button.
    if (why) return;
    // The row leaves, and this button with it — unless the student has moved on meanwhile.
    const active = document.activeElement;
    if (active && active !== document.body && active.id !== `gt-rm-${t.id}`) return;
    ((next && document.getElementById(`gt-${next.id}`)) || headingRef.current)?.focus();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busyRef.current) return;
    if (!exams) {
      setError(list.phase === 'failed' ? 'The list of tests has not loaded — use “Try again”, or reload the page.' : 'The list of tests is still loading — try again in a moment.');
      return;
    }
    const ex = exams.find((x) => x.slug === exam);
    if (!ex) {
      setError('Choose a test.');
      return;
    }
    if (!DATE_RE.test(due)) {
      setError('Enter the date.');
      return;
    }
    setError('');
    busyRef.current = true;
    setBusy(true);
    let why: WriteOutcome = null;
    try {
      why = await onSubmit({
        application_id: null,
        title: `${ex.shortName} — ${what === 'test' ? 'test date' : 'registration deadline'}`,
        kind: 'test',
        due_on: due,
      });
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
    if (why) {
      setError(why); // the choice stays in the form, ready to try again
    } else {
      setExam('');
      setDue('');
    }
  };

  return (
    <section className={`${CARD} space-y-3`} aria-labelledby={`${uid}-h`}>
      <h2 id={`${uid}-h`} ref={headingRef} tabIndex={-1} className="font-display text-lg font-bold tracking-editorial text-ink outline-none m-0">
        Your test dates
      </h2>
      <p className="m-0 text-xs leading-relaxed text-stone-600">
        Registration deadlines and test days for any of our {exams ? `${exams.length} ` : ''}exams. They belong to no single destination, so
        they appear on your timeline whichever destination you choose. Test dates and registration deadlines change — confirm each on the test
        body’s official site.
      </p>
      {sorted.length > 0 && (
        <ul className="list-none divide-y divide-stone-100 p-0 m-0">
          {sorted.map((t, i) => (
            <li key={t.id} className="flex items-start gap-3 py-2">
              <input
                type="checkbox"
                id={`gt-${t.id}`}
                checked={t.done}
                onChange={(e) => onToggle(t.id, e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-forest-700"
              />
              <div className="min-w-0 flex-1 [overflow-wrap:break-word] [word-break:normal]">
                <label htmlFor={`gt-${t.id}`} className={`block text-sm ${t.done ? 'text-stone-500 line-through' : 'text-ink'}`}>
                  {t.title}
                  {t.due_on && DATE_RE.test(t.due_on) && (
                    <span className={`ml-2 text-xs font-semibold ${t.done ? 'text-stone-500' : dueTone(t.due_on)}`}>
                      <time dateTime={t.due_on}>{formatDue(t.due_on)}</time>
                      {!t.done && ` · ${relativeDue(t.due_on)}`}
                    </span>
                  )}
                </label>
                {(() => {
                  const ex = exams ? examForTitle(t.title, exams) : null;
                  return ex?.url ? (
                    <a
                      href={ex.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="mt-0.5 inline text-xs font-medium text-forest-700 underline hover:text-forest-800 [&_svg]:inline [&_svg]:align-[-0.125em]"
                    >
                      {/* Named with the test: every row has one, and a list of identical "Official site" links reads as noise. */}
                      Confirm on the {ex.shortName} official site <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : null;
                })()}
              </div>
              <button
                type="button"
                id={`gt-rm-${t.id}`}
                onClick={() => void remove(t, i)}
                // Named with its date: two sittings of one test share a title.
                aria-label={`Remove “${t.title}”${t.due_on && DATE_RE.test(t.due_on) ? `, ${formatDue(t.due_on)}` : ''}`}
                aria-busy={removing.has(t.id) || undefined}
                className="shrink-0 rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={(e) => void submit(e)} className={`space-y-3 ${sorted.length > 0 ? 'border-t border-stone-200 pt-3' : ''}`} aria-labelledby={`${uid}-fh`}>
        <h3 id={`${uid}-fh`} className="text-sm font-semibold uppercase tracking-wide text-stone-600 m-0">
          Add a test date
        </h3>
        <div>
          {list.phase === 'failed' ? (
            // Never an empty picker: say the list did not load, and offer the retry in its place.
            <>
              <p className={LABEL}>Test</p>
              <div className={WARN_BOX}>
                {/* The ONLY live announcement of a failed fetch: this card is always on the page, while the add panel's
                    message stays silent so a failure is never read twice. One fetch loads both lists, so it names both —
                    a retry from either button is announced truthfully. Keyed on the failure count: each new failure is
                    announced (a repeat too); a retry in progress changes nothing here — the button says so. */}
                <p id={`${uid}-err`} role="alert" className="m-0 font-semibold text-ink">
                  <span key={list.failures}>
                    {list.failures > 1 ? 'The lists of universities and tests still could not be loaded.' : 'The lists of universities and tests could not be loaded.'}
                  </span>
                </p>
                <p className="m-0 mt-1">Choosing a test needs the list of tests — try again, or reload the page. Your plan is safe, and you are still signed in.</p>
                <button
                  ref={retryRef}
                  type="button"
                  onClick={() => {
                    retried.current = true;
                    list.onRetry();
                  }}
                  className={`${BTN_SECONDARY} mt-3`}
                  aria-busy={list.retrying || undefined}
                  aria-describedby={`${uid}-err`}
                >
                  <RotateCw className={`h-4 w-4 ${list.retrying ? 'motion-safe:animate-spin' : ''}`} aria-hidden="true" />{' '}
                  {list.retrying ? 'Trying again…' : 'Try again'}
                </button>
              </div>
            </>
          ) : (
            <>
              <label htmlFor={`${uid}-e`} className={LABEL}>
                Test
              </label>
              <select
                ref={selectRef}
                id={`${uid}-e`}
                value={exam}
                onChange={(e) => setExam(e.target.value)}
                onFocus={() => {
                  selectFocused.current = true;
                }}
                onBlur={() => {
                  selectFocused.current = false;
                }}
                className={INPUT}
              >
                <option value="">{exams ? 'Choose…' : 'Loading the list of tests…'}</option>
                {groups && groups.suggested.length > 0 && (
                  <optgroup label={`Suggested for ${region.proseName}`}>
                    {groups.suggested.map((x) => (
                      <option key={x.slug} value={x.slug}>
                        {x.shortName} — {x.fullName}
                      </option>
                    ))}
                  </optgroup>
                )}
                {groups && groups.others.length > 0 && (
                  <optgroup label="All other tests">
                    {groups.others.map((x) => (
                      <option key={x.slug} value={x.slug}>
                        {x.shortName} — {x.fullName}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </>
          )}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <label htmlFor={`${uid}-w`} className={LABEL}>
              What
            </label>
            <select id={`${uid}-w`} value={what} onChange={(e) => setWhat(e.target.value as 'test' | 'registration')} className={INPUT}>
              <option value="test">Test date</option>
              <option value="registration">Registration deadline</option>
            </select>
          </div>
          <div>
            <label htmlFor={`${uid}-d`} className={LABEL}>
              Date
            </label>
            <input id={`${uid}-d`} type="date" value={due} onChange={(e) => setDue(e.target.value)} className={INPUT} />
          </div>
        </div>
        <p role="alert" className={`m-0 text-sm text-red-700 ${error ? '' : 'sr-only'}`}>
          {error}
        </p>
        <button type="submit" className={`${BTN_SECONDARY} w-full`} aria-busy={busy || undefined}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Add to timeline
        </button>
      </form>
    </section>
  );
}

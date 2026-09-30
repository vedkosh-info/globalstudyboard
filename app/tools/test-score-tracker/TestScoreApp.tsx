'use client';

import { ToolLoadError, ToolOffline, ToolSessionEnded, ToolSetup, ToolSkeleton } from '@/components/tools/ToolStates';
import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Download, ExternalLink, FileText, Pencil, Plus, RotateCw, Trash2, X } from 'lucide-react';
import type { PostgrestError } from '@supabase/supabase-js';
import { useRegion } from '@/components/RegionProvider';
import { useAudience } from '@/components/AudienceProvider';
import { defaultAudienceFor } from '@/lib/audience';
import RegionFlag from '@/components/RegionFlag';
import { REGIONS_ALPHABETICAL, getRegionBySlug, type Region, type RegionSlug } from '@/lib/regions';
import { DATE_RE, todayIso } from '@/lib/planner';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { reportHref, toolHref } from '@/lib/tools';
import { CONNECTION_LOST, SESSION_ENDED, TIMED_OUT, checkToolSession, explainLoadFailure, isSetupError, isUnansweredWrite, withDeadline } from '@/lib/tools-shared';
import {
  DATED_KINDS,
  bodyInSentence,
  otherEditionYear,
  validityKindLabel,
  validityFor,
  validityNudge,
  validityStatus,
  type ExamValidity,
  type ValidityStatus,
  type ValidityTone,
} from '@/lib/test-validity';
import {
  DOMESTIC_READINESS_CAVEAT,
  readinessIntro,
  SCORE_LIMITS,
  cleanScoreNote,
  cleanScoreText,
  cleanSectionLabel,
  cleanSectionValue,
  groupByExam,
  pickerGroups,
  readiness,
  scoresCsv,
  shortlistExamSlugs,
  type ExamPick,
  type ScoresCatalogue,
  type ShortlistApplication,
  type TestScore,
  type TestScoreSection,
} from '@/lib/test-scores';

/**
 * Test Score Tracker (signed-in view). Loaded as its own chunk by
 * TestScoreGate, so this is the ONLY place on the route that imports the
 * Supabase SDK. Reads and deletes go straight to `test_scores` /
 * `test_score_sections`; every SAVE goes through `save_test_score()`, one
 * database transaction that writes the attempt and its sections together or
 * not at all (migration 0006). Row-Level Security scopes every row to the
 * visitor. The planner's applications are READ (never written) for the
 * readiness view.
 *
 * Region in context: a score is the student's wherever they apply, so every
 * attempt is always listed — but the destination chosen in the header decides
 * which tests the picker offers first, which exams' groups come first, and
 * whose shortlist the readiness view checks; it re-tunes in place when the
 * header control changes. Other destinations' applications are counted, never
 * mixed in (§16.3, §18).
 *
 * What the tool never does (Rule A, Rule E, §4.5): compute a "best" or
 * combined score, convert one test's scale into another's, or say whether a
 * score meets a requirement. It shows the student's own entries, the official
 * validity rule with its source, and presence-only readiness.
 *
 * Accessibility: outcome messages are VISIBLE (a status line for successes, an
 * alert for failures) and announced — a repeat of the same message too; a form
 * error sits under the field that failed, which is marked aria-invalid, and a
 * polite summary counts them; focus moves into the form when it opens, back to
 * the control that opened it when it closes, and to the next attempt (else
 * Record) after a delete; one form at a time, and never silently replaced over
 * unsaved input; a save in flight is never made to look cancellable (Cancel
 * and X explain instead of closing) — and a save or delete that has not
 * settled within WRITE_TIMEOUT_MS is given up on with a message that says its
 * outcome is unknown, so a dead connection never locks the form; every busy
 * button stays focusable (`aria-busy` + a synchronous ref latch, never
 * `disabled` mid-flight).
 *
 * If the static test list fails to load — or has not arrived within
 * CATALOGUE_TIMEOUT_MS — the student still sees (and can delete and download)
 * every recorded attempt; only recording, editing and the readiness view wait
 * for the list, with a retry.
 */

// ── Styling tokens (site design language, shared with the other tools) ─────
const CARD = 'rounded-2xl border border-stone-200 bg-white p-5 shadow-sm';
// A SOLID focus ring (forest-500, 4.42:1 on white) with a 1px white offset: the
// red border of an invalid field wins the cascade over focus:border-*, so on a
// focused invalid field the ring alone must mark focus (WCAG 1.4.11).
const FIELD =
  'w-full rounded-xl border border-stone-450 bg-white px-3 text-base text-ink placeholder:text-stone-500 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:ring-offset-1 aria-[invalid=true]:border-red-500 sm:text-sm';
const INPUT = `${FIELD} h-10`;
const TEXTAREA = `${FIELD} min-h-[5.5rem] py-2 leading-relaxed`;
const SELECT = `${FIELD} h-10`;
const LABEL = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-600';
const FIELD_ERROR = 'm-0 mt-1 text-sm text-red-700';
const BTN =
  'inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';
const BTN_PRIMARY = `${BTN} bg-forest-700 text-cream-50 hover:bg-forest-800`;
const BTN_SECONDARY = `${BTN} border border-forest-300 bg-white text-forest-700 hover:border-forest-400 hover:bg-forest-50`;
const BTN_DANGER = `${BTN} border border-red-300 bg-white text-red-700 hover:bg-red-50 focus-visible:ring-red-500`;
const BTN_GHOST =
  'inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-stone-700';
const ICON_BTN =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-600 transition-colors hover:bg-stone-100 hover:text-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500';
const LINK = 'inline-flex items-center gap-1 text-forest-700 underline underline-offset-2 hover:text-forest-800';
const CHIP = 'inline-flex items-center rounded-full border border-stone-200 bg-cream-50 px-2.5 py-0.5 text-xs font-medium text-stone-800';
const WARN_BOX = 'rounded-xl border border-terracotta-200 bg-terracotta-50 px-4 py-3 text-sm leading-relaxed text-stone-800';

const CATALOGUE_URL = '/tools/test-score-tracker/catalogue';
/** A fetch of the test list that has not settled by then is treated as failed: the scores show (degraded) instead of a skeleton that never ends. */
const CATALOGUE_TIMEOUT_MS = 12_000;
// A save or delete that has not settled within WRITE_TIMEOUT_MS
// (lib/tools-shared.ts, withDeadline) is given up on. A request on a stalled
// connection never settles by itself — nor does the token refresh the SDK runs
// BEFORE it, which ignores any abort signal — and while a save runs, Cancel, X
// and every other opener wait for it (independent review, TRK-R2-6).
/**
 * A save given up on: it may have reached the server, so the outcome is said
 * to be unknown — never "not saved". Saving again from the same form updates
 * the same row (a new attempt's id is made when its form opens), so it cannot
 * create a duplicate; recording it afresh from a NEW form could.
 */
const saveUnconfirmed = (isNew: boolean): string =>
  `We could not confirm whether this saved — the server did not answer in time, so it may or may not have been saved. Save again from this form (it will not create a duplicate), or reload the page to check your scores${isNew ? ' before recording it again' : ''}.`;
/** A delete given up on: the attempt may or may not be gone. Deleting it again is safe either way. */
const DELETE_UNCONFIRMED = 'We could not confirm whether that attempt was deleted — the server did not answer in time. Try again, or reload the page to check your scores.';
/**
 * A delete that got no HTTP answer at all (postgrest-js resolves a failed
 * fetch with `status: 0` and never retries a DELETE): it may have reached the
 * server before the connection failed, so its outcome is just as unknown —
 * never "not deleted", and never CONNECTION_LOST's "Nothing was lost".
 */
const DELETE_NO_ANSWER = 'We could not confirm whether that attempt was deleted — no answer came back from the server. Check your connection, then try again or reload the page to check your scores.';
/**
 * A save of an attempt this page tried to delete without learning the outcome,
 * refused because the attempt is gone: the likeliest cause is that delete, not
 * another tab. "Most likely" because another tab or device could have deleted
 * it too — both end the same way.
 */
const UNCONFIRMED_DELETE_WENT_THROUGH = 'That attempt no longer exists, so your changes were not saved — most likely the delete we could not confirm earlier went through.';
const TONE_CLASS: Record<ValidityTone, string> = {
  ok: 'text-forest-700',
  soon: 'text-terracotta-700',
  expired: 'text-red-700',
  info: 'text-stone-600',
  // Older than a recommended age (IELTS): flagged, never "expired".
  advisory: 'text-terracotta-700',
};

type LoadState = 'loading' | 'ready' | 'setup' | 'error' | 'offline' | 'signed-out';
type CatalogueState = 'loading' | 'ready' | 'error';
type PlannerState = 'ready' | 'setup' | 'error';
/** A new attempt's id is made when its form opens, so a retry after a lost response updates that row instead of adding a duplicate. */
type FormState = { mode: 'add'; exam?: string; newId: string } | { mode: 'edit'; score: TestScore };
/** A v4 UUID (the database column is uuid-typed). crypto.randomUUID needs Safari 15.4+ / Chrome 92+; older browsers get the same format from getRandomValues. */
const newAttemptId = (): string =>
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16));
const addForm = (exam?: string): FormState => ({ mode: 'add', exam, newId: newAttemptId() });
/** The test a form opens on ('' = none chosen yet), or null for no form. */
const openingExam = (f: FormState | null): string | null => (f === null ? null : f.mode === 'edit' ? f.score.exam_slug : (f.exam ?? ''));
/** `seq` changes with every message, so a repeat of the same words is still announced. */
type Notice = { tone: 'ok' | 'error'; text: string; seq: number } | null;
/** Where focus returns when the form closes: the row's Edit button (by id), the control that opened it, or its readiness line. */
type CloseFocus = { editId: string | null; opener: HTMLElement | null; readyLine: string | null };
/**
 * Something asked for a different form (or for this one to close) while the
 * open one has unsaved input — or is mid-save. The open form stays, and says
 * so. `closing` = it was the form's own Cancel / X, pressed mid-save.
 */
type Interruption = { seq: number; saving: true; closing?: boolean } | { seq: number; saving?: false; next: FormState | null; opener: HTMLElement | null; readyLine: string | null };

/** focusAfterRender sentinel: "the Record button" (never passed to querySelector). */
const FOCUS_RECORD = 'record';

interface ScoreInput {
  exam_slug: string;
  score_text: string;
  test_date: string;
  note: string | null;
  sections: Array<{ label: string; value: string }>;
}

/** Why a save failed, in words a student can act on. `null` = it did not fail. */
type SaveOutcome = null | { text: string; gone?: boolean };

const regionOf = (slug: RegionSlug): Region => getRegionBySlug(slug) ?? REGIONS_ALPHABETICAL[0];

const fmtDate = (iso: string): string => {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
};

/** A calendar-valid YYYY-MM-DD (rejects 2026-02-30 and the like). */
function isRealDate(iso: string): boolean {
  if (!DATE_RE.test(iso)) return false;
  const d = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso;
}

/**
 * Two forms are "the same" when they would edit the same attempt, or record
 * the same test. For an open add form the test is the one CHOSEN in it now
 * (`liveExam`, reported by ScoreForm), not the preset it opened with: a
 * preset ACT form switched to SAT is a SAT form, and "Record your ACT score"
 * must not land silently in it (independent review, TRK-R2-2).
 */
function sameTarget(a: FormState, b: FormState, liveExam: string | null): boolean {
  if (a.mode === 'edit' && b.mode === 'edit') return a.score.id === b.score.id;
  if (a.mode !== 'add' || b.mode !== 'add' || b.exam === undefined) return false;
  return (liveExam ?? a.exam ?? '') === b.exam;
}

/**
 * The line under one attempt, or null for none. The rule itself is in the
 * box above, so it is not repeated under every attempt: only what is specific
 * to THIS attempt is — the computed date of a dated rule, a future test date,
 * or that a rule written for one edition ("a CAT 2026 score…") is not this
 * attempt's own year.
 */
function attemptLine(v: ExamValidity | undefined, testDate: string, today: string, shortName: string): ValidityStatus | null {
  if (!v) return null; // the box already says no rule is on file
  if (DATED_KINDS.has(v.kind) || testDate > today) return validityStatus(v, testDate, today, shortName);
  // A year the note itself speaks for (NATA 2026's note sets the 2025 carry-over) is not "another edition".
  const year = otherEditionYear(v, testDate);
  if (year !== null) {
    return { text: `The rule above is written for ${shortName} ${v.edition} — confirm with ${bodyInSentence(v)} how it applies to this ${year} attempt.`, tone: 'info', until: null };
  }
  return null;
}

/** Map a database refusal to a sentence; fall back to asking the auth server whether the session or the connection is the problem. */
async function explainFailure(error: Pick<PostgrestError, 'message' | 'code'> | null, action: 'save' | 'delete' = 'save'): Promise<SaveOutcome & object> {
  const msg = error?.message ?? '';
  // saveScore swaps in UNCONFIRMED_DELETE_WENT_THROUGH when this page itself sent a delete it could not confirm.
  if (/test_score_not_found/.test(msg)) return { text: 'That attempt no longer exists, so your changes were not saved — it may have been deleted in another tab or on another device.', gone: true };
  if (/test_scores_cap/.test(msg)) return { text: `You can record up to ${SCORE_LIMITS.scores} attempts. Delete one you no longer need, then save again.` };
  if (/test_score_sections_cap/.test(msg)) return { text: `An attempt can have up to ${SCORE_LIMITS.sectionsPerScore} section scores.` };
  if (/exam_slug_check/.test(msg)) return { text: 'This test cannot be recorded yet. Please try again later.' };
  if (/test_date_check/.test(msg)) return { text: `The test date must be between 1 January ${SCORE_LIMITS.earliestYear} and today — a score exists only once the test has been sat.` };
  if (/score_text_check|label_check|value_check|note_check/.test(msg)) return { text: 'Something you typed is too long or contains a character we cannot store. Please retype it.' };
  const s = await checkToolSession();
  if (s.kind === 'offline') return { text: CONNECTION_LOST };
  if (s.kind === 'signed-out' || s.kind === 'unconfigured') return { text: SESSION_ENDED };
  return {
    text:
      action === 'save'
        ? 'We could not confirm that saved. Please try again — it will not create a duplicate. If it keeps happening, reload the page.'
        : 'That attempt was not deleted. Please try again — if it keeps happening, reload the page.',
  };
}

// ── Component ────────────────────────────────────────────────────────────────
export default function TestScoreApp({ examNames = {} }: { examNames?: Record<string, string> }) {
  const { effectiveRegion } = useRegion();
  const region = regionOf(effectiveRegion);
  // §16.7: the second personalisation axis. Profiles are common content, so
  // nothing is hidden — but a domestic student is told that tests a profile
  // lists for international applicants may not apply to them.
  const { chosenAudience } = useAudience();
  const audience = chosenAudience ?? defaultAudienceFor(effectiveRegion);

  const [load, setLoad] = useState<LoadState>('loading');
  const [catalogueState, setCatalogueState] = useState<CatalogueState>('loading');
  /** Bumped by "Try again" to re-fetch the test list (0 = the first fetch). */
  const [catalogueTry, setCatalogueTry] = useState(0);
  /** How many fetches of the list have failed — the alert's wording (and its re-announcement) follows this, so it never changes while a retry is still running. */
  const [catalogueFailures, setCatalogueFailures] = useState(0);
  const [plannerState, setPlannerState] = useState<PlannerState>('ready');
  const [scores, setScores] = useState<TestScore[]>([]);
  const [sections, setSections] = useState<TestScoreSection[]>([]);
  const [apps, setApps] = useState<ShortlistApplication[]>([]);
  const [catalogue, setCatalogue] = useState<ScoresCatalogue>({ exams: [], colleges: [] });
  const [notice, setNotice] = useState<Notice>(null);
  const noticeSeq = useRef(0);
  const [form, setForm] = useState<FormState | null>(null);
  /** The form open NOW — a delete that finishes late acts on this, never on the form open when Delete was pressed. */
  const formRef = useRef<FormState | null>(null);
  formRef.current = form;
  /** The test chosen in the open add form (ScoreForm reports it), or null — see sameTarget. */
  const formExam = useRef<string | null>(null);
  /** Attempts whose delete is in flight: an editor of one cannot save meanwhile (the mirror of "wait for the save, then delete"). */
  const deletingIds = useRef(new Set<string>());
  /**
   * Attempts whose delete ended without an answer (the deadline, or no HTTP
   * response at all): they stay listed and editable, but may be gone on the
   * server. A save of one that is refused as not found says so, instead of
   * blaming another tab. Cleared once a later save or delete settles the question.
   */
  const unconfirmedDeletes = useRef(new Set<string>());
  const [interruption, setInterruption] = useState<Interruption | null>(null);
  const interruptionSeq = useRef(0);
  const recordBtnRef = useRef<HTMLButtonElement>(null);
  const closeFocus = useRef<CloseFocus | null>(null);
  /** A CSS selector (or FOCUS_RECORD) to focus after the next render (used after a delete). */
  const focusAfterRender = useRef<string | null>(null);
  /** Bumped whenever a form opens, closes or is replaced — a save that finishes late only closes the form it came from. */
  const formToken = useRef(0);
  /** The open form has input the student has not saved (reported by ScoreForm). */
  const formDirty = useRef(false);
  /** Bumped to send focus into the open form (its first field to fill) — the form's own rule, so a same-target request lands where opening it does. */
  const [formFocusNonce, setFormFocusNonce] = useState(0);
  /** The formToken of the form whose save is in flight, or null — a save left running by a closed form never blocks the next one. */
  const savingToken = useRef<number | null>(null);
  /** Set by "Try again": once the list arrives, focus moves to Record (the retry button is then gone). */
  const retryFocus = useRef(false);
  const prefillDone = useRef(false);
  const [hashTick, setHashTick] = useState(0);

  const today = todayIso();
  // The latest test date the form accepts is TODAY in the visitor's own time
  // zone: a score exists only once the test has been sat (booked sittings belong
  // in the Application Planner). The database CHECK allows current_date + 1 day,
  // so a visitor east of UTC whose local date is already "tomorrow" is never
  // refused. Recomputed every render, so a page left open past midnight moves on.
  const maxDate = today;

  const say = useCallback((tone: 'ok' | 'error', text: string) => {
    noticeSeq.current += 1;
    setNotice({ tone, text, seq: noticeSeq.current });
  }, []);

  // The exam picker + each university's test list (static JSON, cached for an hour) — off the page payload.
  // A fetch that never settles is aborted after CATALOGUE_TIMEOUT_MS (the body read too) and reported as failed.
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), CATALOGUE_TIMEOUT_MS);
    const failed = () => {
      setCatalogueState('error');
      setCatalogueFailures((n) => n + 1);
    };
    void fetch(CATALOGUE_URL, { signal: controller.signal })
      .then((r) => (r.ok ? (r.json() as Promise<ScoresCatalogue>) : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (!active) return;
        if (!Array.isArray(data?.exams) || data.exams.length === 0) {
          failed();
          return;
        }
        setCatalogue(data);
        setCatalogueState('ready');
        if (catalogueTry > 0) say('ok', 'The list of tests has loaded — you can record and edit scores again.');
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
  }, [catalogueTry, say]);

  useEffect(() => {
    if (catalogueState !== 'ready' || !retryFocus.current) return;
    retryFocus.current = false;
    // The "Try again" button unmounts with the warning, which drops its focus to
    // the page: land on Record instead — unless the student has moved on.
    const active = document.activeElement;
    if (!active || active === document.body) recordBtnRef.current?.focus();
  }, [catalogueState]);

  // Initial load.
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
        // The shared diagnosis, as in the other tools and every report: a
        // missing table is the pending migration; otherwise the auth server
        // says whether the connection or the session is to blame (a dead
        // session signs the device out, so the gate swaps in the sign-in card).
        const why = await explainLoadFailure(err);
        if (active) setLoad(why);
        return;
      }
      setScores((a.data ?? []) as TestScore[]);
      setSections((b.data ?? []) as TestScoreSection[]);
      if (c.error) {
        setPlannerState(isSetupError(c.error) ? 'setup' : 'error');
        setApps([]);
      } else {
        setApps((c.data ?? []) as ShortlistApplication[]);
      }
      setLoad('ready');
    })();
    return () => {
      active = false;
    };
  }, []);

  // Focus management: back to the form's opener when it closes.
  useEffect(() => {
    if (form || !closeFocus.current) return;
    const target = closeFocus.current;
    closeFocus.current = null;
    if (target.editId) {
      const el = document.querySelector<HTMLButtonElement>(`[data-score-edit="${target.editId}"]`);
      (el ?? recordBtnRef.current)?.focus();
    } else if (target.opener?.isConnected) {
      target.opener.focus();
    } else if (target.readyLine) {
      // Opened from a readiness line whose button is gone now that a score is
      // recorded: back to that line, not to the top of the tool.
      (document.querySelector<HTMLElement>(`[data-ready-line="${target.readyLine}"]`) ?? recordBtnRef.current)?.focus();
    } else {
      recordBtnRef.current?.focus();
    }
  }, [form]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const catalogueReady = catalogueState === 'ready';
  const examsMap = useMemo(() => new Map(catalogue.exams.map((e) => [e.slug, e])), [catalogue]);
  const collegesMap = useMemo(() => new Map(catalogue.colleges.map((c) => [c.slug, c])), [catalogue]);
  // Without the list (it failed to load) a test is still named: from the page's
  // own compact name map, else its slug.
  const nameOf = useCallback(
    (slug: string) => examsMap.get(slug)?.shortName ?? (Object.hasOwn(examNames, slug) ? examNames[slug] : slug),
    [examsMap, examNames],
  );
  // The CSV names each test too — from the same fallback when the list is unavailable.
  const csvExams = useMemo<Map<string, ExamPick>>(
    () =>
      catalogueReady
        ? examsMap
        : new Map(
            Object.entries(examNames).map(([slug, shortName]): [string, ExamPick] => [
              slug,
              { slug, shortName, fullName: shortName, region: 'global', domain: '', totalMarks: '', websiteUrl: null },
            ]),
          ),
    [catalogueReady, examsMap, examNames],
  );
  const regionApps = useMemo(() => apps.filter((a) => a.region === effectiveRegion), [apps, effectiveRegion]);
  const otherAppsCount = apps.length - regionApps.length;
  const shortlistSlugs = useMemo(() => shortlistExamSlugs(regionApps, collegesMap, new Set(examsMap.keys())), [regionApps, collegesMap, examsMap]);
  const groups = useMemo(() => pickerGroups(effectiveRegion, catalogue.exams, shortlistSlugs), [effectiveRegion, catalogue, shortlistSlugs]);
  const grouped = useMemo(() => groupByExam(scores, groups.suggested.map((e) => e.slug)), [scores, groups]);
  const readinessRows = useMemo(() => readiness(regionApps, collegesMap, scores, examsMap, today), [regionApps, collegesMap, scores, examsMap, today]);
  const sectionsOf = useCallback((id: string) => sections.filter((x) => x.score_id === id).sort((a, b) => a.position - b.position), [sections]);
  /** The list as it is NOW, for a delete that finishes late (its neighbour is found in this, not in the list it started from). */
  const groupedRef = useRef(grouped);
  groupedRef.current = grouped;

  // After a delete: focus the next attempt / its group / the Record button once the list has re-rendered.
  useEffect(() => {
    const sel = focusAfterRender.current;
    if (!sel) return;
    focusAfterRender.current = null;
    // Only when the delete left focus nowhere (its own row, or the editor it
    // closed, unmounted): a student who has moved on meanwhile — into a form,
    // another row — keeps their place (the same rule as retryFocus).
    const active = document.activeElement;
    if (active && active !== document.body) return;
    const el = sel === FOCUS_RECORD ? null : document.querySelector<HTMLElement>(sel);
    // The scores heading is the last resort — the Record button is hidden while the test list is unavailable.
    (el ?? recordBtnRef.current ?? document.getElementById('scores-heading'))?.focus();
  }, [scores]);

  // ── Forms: one at a time, never silently replaced ──────────────────────────
  /** Open `next` (or close, when null), replacing whatever is open. */
  const showForm = (next: FormState | null, opener?: HTMLElement | null, readyLine?: string | null) => {
    formToken.current += 1;
    formDirty.current = false;
    formExam.current = openingExam(next);
    setInterruption(null);
    if (next || opener) closeFocus.current = { editId: next?.mode === 'edit' ? next.score.id : null, opener: opener ?? null, readyLine: readyLine ?? null };
    setForm(next);
  };

  const interrupt = (i: { saving: true; closing?: boolean } | { next: FormState | null; opener: HTMLElement | null; readyLine: string | null }) => {
    interruptionSeq.current += 1;
    setInterruption({ ...i, seq: interruptionSeq.current });
  };

  /** The open form's save is in flight. */
  const formSaving = () => savingToken.current !== null && savingToken.current === formToken.current;

  /**
   * Every entry point that opens a form — or, with `next = null`, closes it
   * from the toggle — goes through here. The Cancel and X buttons inside the
   * form go through cancelForm instead: they ARE the explicit discard (except
   * mid-save, when they explain).
   */
  const requestForm = (next: FormState | null, opener?: HTMLElement | null, readyLine?: string | null) => {
    if (!form) {
      if (next) showForm(next, opener, readyLine);
      return;
    }
    if (next && sameTarget(form, next, formExam.current)) {
      // Asking for the form already open = carry on with it: a pending
      // "discard your changes?" question is answered (kept), and focus lands
      // where opening the form puts it — the score when a test is chosen.
      setInterruption((i) => (i && !i.saving ? null : i));
      setFormFocusNonce((n) => n + 1);
      return;
    }
    if (formSaving()) {
      interrupt({ saving: true });
      return;
    }
    if (formDirty.current) {
      interrupt({ next, opener: opener ?? null, readyLine: readyLine ?? null });
      return;
    }
    showForm(next, opener, readyLine);
  };

  const closeForm = () => showForm(null);
  /**
   * The form's own Cancel and X. Mid-save they do not close it — a close would
   * look like it cancelled the save, which it cannot — and say so instead; the
   * form closes by itself once the score is saved, or stays open with the
   * reason if it is not.
   */
  const cancelForm = () => {
    if (formSaving()) {
      interrupt({ saving: true, closing: true });
      return;
    }
    closeForm();
  };
  const onDirtyChange = useCallback((dirty: boolean) => {
    formDirty.current = dirty;
  }, []);
  const onExamChange = useCallback((slug: string) => {
    formExam.current = slug;
  }, []);

  const describeInterruption = (i: Interruption): { seq: number; text: string; discardLabel: string | null } => {
    if (i.saving) {
      return {
        seq: i.seq,
        text: i.closing
          ? 'This score is still saving — closing the form would not stop it. The form closes by itself once it is saved, or stays open with the reason if it is not.'
          : 'This score is still saving. Wait for it to finish, then try again.',
        discardLabel: null,
      };
    }
    const { next } = i;
    const instead = !next
      ? 'and close the form'
      : next.mode === 'edit'
        ? `and edit your ${nameOf(next.score.exam_slug)} attempt from ${fmtDate(next.score.test_date)} instead`
        : next.exam
          ? `and record your ${nameOf(next.exam)} score instead`
          : 'and start a new score instead';
    return { seq: i.seq, text: `You have unsaved changes in this form. Discard them ${instead}?`, discardLabel: next ? 'Discard changes' : 'Discard and close' };
  };

  // `#exam=<slug>` from an exam page (a FRAGMENT, so the indexable tool URL
  // stays single): open the form on that test, once, when everything is ready,
  // then drop the `exam=` key so a reload does not reopen it. Only that key:
  // a `region=` beside it is what keeps the destination through a reload or
  // Back/Forward (components/tools/useDestinationHint), and anything else in
  // the fragment is not ours to remove. The form's own heading names the
  // test, so no separate message is needed.
  useEffect(() => {
    if (prefillDone.current || load !== 'ready' || catalogueState !== 'ready') return;
    prefillDone.current = true;
    const params = new URLSearchParams(window.location.hash.slice(1));
    const exam = params.get('exam');
    if (exam && examsMap.has(exam)) {
      formToken.current += 1;
      formDirty.current = false;
      formExam.current = exam;
      closeFocus.current = { editId: null, opener: null, readyLine: null }; // falls through to the Record button on close
      setForm(addForm(exam));
    }
    if (params.has('exam')) {
      params.delete('exam');
      const rest = params.toString();
      window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search + (rest ? `#${rest}` : ''));
    }
  }, [load, catalogueState, examsMap, hashTick]);

  // The same fragment arriving without a page load (edited in the address bar,
  // or a link on this page): run the prefill again — but never over a form the
  // student already has open.
  const formOpenRef = useRef(false);
  formOpenRef.current = form !== null;
  useEffect(() => {
    const onHash = () => {
      if (formOpenRef.current || !/(^|&)exam=/.test(window.location.hash.slice(1))) return;
      prefillDone.current = false;
      setHashTick((n) => n + 1);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // ── Writes ────────────────────────────────────────────────────────────────
  /** One atomic call for a new attempt (its id made when the form opened) or an edit. Resolves to null on success, or why it failed. */
  const saveScore = async (id: string, isNew: boolean, input: ScoreInput): Promise<SaveOutcome> => {
    // No pre-flight session check: the call carries the session, and a failure is
    // then classified (connection vs. session vs. a real refusal) by explainFailure.
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return { text: SESSION_ENDED };
    // The deadline covers the whole attempt — the call AND explaining a failure
    // (explainFailure asks the auth server, which hangs on the same dead link).
    const outcome = await withDeadline<SaveOutcome>(async (signal, expired) => {
      const { data, error } = await supabase
        .rpc('save_test_score', {
          p_id: id,
          p_is_new: isNew,
          p_exam_slug: input.exam_slug,
          p_score_text: input.score_text,
          p_test_date: input.test_date,
          p_note: input.note,
          p_sections: input.sections,
        })
        .abortSignal(signal);
      // Given up on already: the student has been told the outcome is unknown.
      if (expired()) return null;
      const saved = data as { score: TestScore; sections: TestScoreSection[] } | null;
      if (error || !saved?.score) {
        const why = await explainFailure(error);
        if (expired()) return null;
        if (why.gone && !isNew) {
          // The attempt is gone on the server — drop it here too; the caller closes the stale editor.
          setScores((prev) => prev.filter((x) => x.id !== id));
          setSections((prev) => prev.filter((x) => x.score_id !== id));
          // This page's own unanswered delete is the likeliest cause — say so.
          if (unconfirmedDeletes.current.delete(id)) return { ...why, text: UNCONFIRMED_DELETE_WENT_THROUGH };
        }
        return why;
      }
      const row = saved.score;
      // The attempt exists after all: an earlier unanswered delete of it did not land.
      unconfirmedDeletes.current.delete(row.id);
      // A retried create returns the row it already made: replace, never add twice.
      setScores((prev) => (prev.some((x) => x.id === row.id) ? prev.map((x) => (x.id === row.id ? row : x)) : [row, ...prev]));
      setSections((prev) => [...prev.filter((x) => x.score_id !== row.id), ...(saved.sections ?? [])]);
      say('ok', `${nameOf(row.exam_slug)} score ${isNew ? 'recorded' : 'updated'}.`);
      return null;
    }).catch((): SaveOutcome => ({ text: saveUnconfirmed(isNew) })); // an unexpected throw: the outcome is just as unknown
    return outcome === TIMED_OUT ? { text: saveUnconfirmed(isNew) } : outcome;
  };

  const deleteScore = async (score: TestScore): Promise<boolean> => {
    // An edit of this very attempt is saving: a delete now would race it (the
    // save's answer could put the row back on screen after the server dropped
    // it). Wait for the save — the form closes when it lands.
    const openNow = formRef.current;
    if (openNow?.mode === 'edit' && openNow.score.id === score.id && formSaving()) {
      say('error', 'This attempt is still saving. Wait for it to finish, then delete it.');
      return false;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      say('error', SESSION_ENDED);
      return false;
    }
    // While the delete runs, an editor of this attempt cannot save (onSubmit
    // checks this set): the save's answer could otherwise put the row back, or
    // report a "deleted in another tab" that never happened.
    deletingIds.current.add(score.id);
    let failure: string | null = null;
    try {
      const outcome = await withDeadline<string | null>(async (signal, expired) => {
        const { error, status } = await supabase.from('test_scores').delete().eq('id', score.id).abortSignal(signal);
        if (!error || expired()) return null;
        // No HTTP answer (an abort is ours, and expired() has caught it): decided
        // here, BEFORE explainFailure, whose wording would otherwise depend on a
        // later session check — "was not deleted" if the connection is back by
        // then, "Nothing was lost" if not. Neither is known (G4-V2-1).
        if (isUnansweredWrite(status, error)) return DELETE_NO_ANSWER;
        return (await explainFailure(error, 'delete')).text;
      }).catch(() => DELETE_UNCONFIRMED);
      failure = outcome === TIMED_OUT ? DELETE_UNCONFIRMED : outcome;
    } finally {
      deletingIds.current.delete(score.id);
    }
    // No answer (the deadline, a throw, or no HTTP response) leaves the outcome
    // unknown. Any other failure is an answer — a refusal, even when the session
    // check behind it then finds the connection gone (CONNECTION_LOST) — and it
    // settles only THIS delete, not an earlier unanswered one, so it leaves the
    // set alone; success removes the row (below).
    if (failure === DELETE_UNCONFIRMED || failure === DELETE_NO_ANSWER) unconfirmedDeletes.current.add(score.id);
    else if (!failure) unconfirmedDeletes.current.delete(score.id);
    if (failure) {
      say('error', failure);
      return false;
    }
    // Everything below acts on the page as it is NOW — the student may have
    // opened, closed or changed a form while the delete ran (TRK-R2-1, RT-4).
    const liveGrouped = groupedRef.current;
    const liveForm = formRef.current;
    // Where focus lands next: the following attempt in the same test, else the previous one, else the test's next group, else Record.
    const group = liveGrouped.find((g) => g.slug === score.exam_slug);
    const idx = group ? group.attempts.findIndex((a) => a.id === score.id) : -1;
    const neighbour = group ? (group.attempts[idx + 1] ?? group.attempts[idx - 1]) : undefined;
    const gIdx = liveGrouped.findIndex((g) => g.slug === score.exam_slug);
    const nextGroup = liveGrouped[gIdx + 1] ?? liveGrouped[gIdx - 1];
    focusAfterRender.current = neighbour
      ? `[data-score-edit="${neighbour.id}"], [data-score-delete="${neighbour.id}"], [data-score-keep="${neighbour.id}"]`
      : nextGroup && nextGroup.slug !== score.exam_slug
        ? `#group-${nextGroup.slug}`
        : FOCUS_RECORD;
    // An editor of this attempt open NOW would save into nothing — close it.
    // Any other form (a new score, another attempt's edit) is left alone.
    if (liveForm?.mode === 'edit' && liveForm.score.id === score.id) {
      closeFocus.current = null;
      showForm(null);
    }
    // A pending "discard your changes and edit this attempt instead?" question
    // now points at nothing: withdraw it. The open form and its input stay.
    setInterruption((i) => (i && !i.saving && i.next?.mode === 'edit' && i.next.score.id === score.id ? null : i));
    setScores((prev) => prev.filter((x) => x.id !== score.id));
    setSections((prev) => prev.filter((x) => x.score_id !== score.id));
    say('ok', `${nameOf(score.exam_slug)} attempt from ${fmtDate(score.test_date)} deleted.`);
    return true;
  };

  const downloadCsv = () => {
    if (scores.length === 0) return;
    const blob = new Blob([scoresCsv(scores, sections, csvExams, today)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `globalstudyboard-test-scores-${today}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    say('ok', 'Your scores were downloaded as a CSV file.');
  };

  const retryCatalogue = () => {
    if (catalogueState === 'loading') return;
    retryFocus.current = true;
    setCatalogueState('loading');
    setCatalogueTry((n) => n + 1);
  };

  // ── Render ──────────────────────────────────────────────────────────────
  // Failure states first, in the shared cards every tool uses: a first read
  // that failed is shown at once, never held behind the skeleton while the
  // test list is still on its way (up to CATALOGUE_TIMEOUT_MS).
  if (load === 'signed-out') return <ToolSessionEnded />;
  if (load === 'offline') return <ToolOffline />;
  if (load === 'setup') return <ToolSetup name="The score tracker" />;
  if (load === 'error') return <ToolLoadError what="scores" />;
  // The first fetch of the test list waits with the scores; a RETRY does not
  // (the scores stay on screen while it runs).
  if (load === 'loading' || (catalogueState === 'loading' && catalogueTry === 0)) return <ToolSkeleton label="Loading your scores…" />;

  const editing = form?.mode === 'edit' ? form.score : null;
  const suggestedNames = groups.suggested.slice(0, 6).map((e) => e.shortName);
  const addOpen = form?.mode === 'add';
  const retrying = catalogueState === 'loading';

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className={`${CARD} space-y-4`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="m-0 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-forest-700">
              <RegionFlag slug={effectiveRegion} className="h-3.5" /> Test scores · your shortlist in {region.proseName}
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-editorial text-ink">
              {scores.length === 0 ? 'No scores recorded yet' : `${scores.length} ${scores.length === 1 ? 'attempt' : 'attempts'} across ${grouped.length} ${grouped.length === 1 ? 'test' : 'tests'}`}
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-stone-700">
              {catalogueReady ? (
                <>
                  Every attempt is listed, whatever the destination. Tests used in {region.proseName} come first, and the readiness view below checks
                  your shortlist there — change the destination in the header to re-tune.
                </>
              ) : (
                // Without the list there is no destination ordering and no readiness view yet — say so, not what the loaded tool does.
                <>
                  Every attempt is listed, whatever the destination. Once the list of tests loads, tests used in {region.proseName} come first and
                  the readiness view below checks your shortlist there.
                </>
              )}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex flex-wrap gap-2 sm:justify-end">
              {catalogueReady && (
                // A disclosure: pressed while the add form is open, it closes it
                // (asking first if something has been typed).
                <button
                  ref={recordBtnRef}
                  type="button"
                  onClick={(e) => requestForm(addOpen ? null : addForm(), e.currentTarget)}
                  className={BTN_PRIMARY}
                  aria-expanded={addOpen}
                  aria-controls={addOpen ? 'score-form-panel' : undefined}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" /> Record a score
                </button>
              )}
              <button
                type="button"
                onClick={downloadCsv}
                className={BTN_SECONDARY}
                disabled={scores.length === 0}
                aria-describedby={scores.length > 0 ? 'score-csv-hint' : undefined}
              >
                <Download className="h-4 w-4" aria-hidden="true" /> Download CSV
              </button>
              <Link href={reportHref('test-score-tracker')} className={`${BTN_SECONDARY} no-underline`}>
                <FileText className="h-4 w-4" aria-hidden="true" /> Report &amp; PDF
              </Link>
            </div>
            {scores.length > 0 && (
              // A spreadsheet re-reads "7.0" as the number 7 on opening; the file itself holds the text as entered.
              <p id="score-csv-hint" className="m-0 max-w-xs text-xs leading-relaxed text-stone-600 sm:text-right">
                Spreadsheet apps may show a score such as 7.0 as 7 — the file keeps it exactly as you entered it.
              </p>
            )}
          </div>
        </div>
        {!catalogueReady && (
          // The static test list failed (nothing to do with the session): the
          // scores stay readable below; only what needs the list waits.
          <div className={WARN_BOX}>
            {/* Keyed on the failure count: each new failure is announced (a repeat too); a retry in progress changes nothing here — the button says so. */}
            <p role="alert" className="m-0 font-semibold text-ink">
              <span key={catalogueFailures}>{catalogueFailures > 1 ? 'The list of tests still could not be loaded.' : 'The list of tests could not be loaded.'}</span>
            </p>
            {/* Read live: with no attempt recorded (or the last one just deleted) there is nothing below to delete or download. */}
            <p className="m-0 mt-1">
              {scores.length > 0
                ? 'Your recorded scores are below, and you can still delete an attempt or download them. Recording or editing a score, and the readiness view, need the list — try again, or reload the page. You are still signed in, and nothing you saved has changed.'
                : 'Recording a score and the readiness view need the list of tests — try again, or reload the page. You are still signed in, and nothing you saved has changed.'}
            </p>
            <button type="button" onClick={retryCatalogue} className={`${BTN_SECONDARY} mt-3`} aria-busy={retrying || undefined}>
              <RotateCw className={`h-4 w-4 ${retrying ? 'motion-safe:animate-spin' : ''}`} aria-hidden="true" /> {retrying ? 'Trying again…' : 'Try again'}
            </button>
          </div>
        )}
        {/* Outcome messages: visible AND announced. Both regions stay mounted so screen readers pick up changes; the keyed inner span re-announces a repeat of the same words. */}
        <p role="status" aria-live="polite" className={notice?.tone === 'ok' ? 'm-0 rounded-xl border border-forest-200 bg-forest-50 px-4 py-2 text-sm text-forest-800' : 'sr-only'}>
          {notice?.tone === 'ok' && <span key={notice.seq}>{notice.text}</span>}
        </p>
        <p role="alert" className={notice?.tone === 'error' ? 'm-0 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800' : 'sr-only'}>
          {notice?.tone === 'error' && <span key={notice.seq}>{notice.text}</span>}
        </p>
      </div>

      {form && catalogueReady && (
        <ScoreForm
          id="score-form-panel"
          key={form.mode === 'edit' ? form.score.id : form.newId}
          region={region}
          exams={catalogue.exams}
          groups={groups}
          initial={editing ? { score: editing, sections: sectionsOf(editing.id) } : null}
          presetExam={form.mode === 'add' ? form.exam : undefined}
          maxDate={maxDate}
          interruption={interruption ? describeInterruption(interruption) : null}
          onDiscard={() => {
            if (!interruption || interruption.saving) return;
            const { next } = interruption;
            // Never discard input for an editor of an attempt that is no longer on
            // the list. deleteScore already withdraws such a question; this is the
            // same rule checked again at the moment it would act.
            if (next?.mode === 'edit' && !scores.some((x) => x.id === next.score.id)) {
              setInterruption(null);
              setFormFocusNonce((n) => n + 1);
              say('error', 'That attempt no longer exists, so nothing was discarded — your changes here are kept.');
              return;
            }
            showForm(next, interruption.opener, interruption.readyLine);
          }}
          onKeepEditing={() => setInterruption(null)}
          onDirtyChange={onDirtyChange}
          onExamChange={onExamChange}
          onSubmit={async (input) => {
            // The attempt being edited is being deleted: saving now would race
            // the delete (the mirror of deleteScore's "still saving" guard).
            if (form.mode === 'edit' && deletingIds.current.has(form.score.id)) {
              return 'This attempt is being deleted, so your changes were not saved. If the delete does not go through, you can save them then.';
            }
            // This form's token: Cancel, X and every other opener wait while
            // the save is in flight, but should the form still be closed or
            // replaced meanwhile, its answer must not close the NEWER form or
            // move focus — the data and the message still apply.
            const token = formToken.current;
            savingToken.current = token;
            // Saving settles an open "discard your changes?" question: they are being kept.
            setInterruption(null);
            let outcome: SaveOutcome;
            try {
              outcome = form.mode === 'edit' ? await saveScore(form.score.id, false, input) : await saveScore(form.newId, true, input);
            } finally {
              if (savingToken.current === token) savingToken.current = null;
            }
            const current = formToken.current === token;
            if (current) setInterruption((i) => (i?.saving ? null : i));
            if (outcome === null) {
              if (current) closeForm();
              return null;
            }
            if (outcome.gone) {
              if (current) {
                closeFocus.current = null;
                closeForm();
                recordBtnRef.current?.focus();
              }
              say('error', outcome.text);
              return null;
            }
            if (!current) {
              say('error', 'The score you closed while it was saving may not have been saved — reload the page to check your scores before recording it again.');
              return null;
            }
            return outcome.text;
          }}
          focusNonce={formFocusNonce}
          onClose={cancelForm}
        />
      )}

      {/* Scores by test */}
      <section aria-labelledby="scores-heading" className="space-y-4">
        <h2 id="scores-heading" tabIndex={-1} className="font-display text-xl font-bold tracking-editorial text-ink focus:outline-none">
          Your scores by test
        </h2>
        {grouped.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-cream-50 p-6 text-sm leading-relaxed text-stone-700">
            {catalogueReady ? (
              <p className="m-0">
                Record a score as you received it. The tool keeps every attempt, shows the validity rule each test body publishes (or a note where
                we found none), and lists your scores beside the tests our profiles of your shortlisted universities name.
                {suggestedNames.length > 0 && ` Tests used in ${region.proseName} include ${suggestedNames.join(', ')}.`}
              </p>
            ) : (
              // The Record button is hidden until the list loads: never invite an action that is not on screen.
              <p className="m-0">Recording a score needs the list of tests, which has not loaded yet — use Try again above, or reload the page.</p>
            )}
          </div>
        ) : (
          grouped.map((g) => (
            <ExamGroup
              key={g.slug}
              exam={examsMap.get(g.slug) ?? null}
              slug={g.slug}
              shortName={nameOf(g.slug)}
              attempts={g.attempts}
              sectionsOf={sectionsOf}
              today={today}
              onEdit={catalogueReady ? (score, el) => requestForm({ mode: 'edit', score }, el) : null}
              onDelete={deleteScore}
            />
          ))
        )}
      </section>

      {/* Readiness for the shortlist */}
      <section aria-labelledby="readiness-heading" className="space-y-3">
        <div>
          <h2 id="readiness-heading" className="font-display text-xl font-bold tracking-editorial text-ink">
            Readiness for your shortlist in {region.proseName}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-stone-700">
            {readinessIntro(region.proseName)} Presence only — whether a score is enough is the university&rsquo;s
            decision, on its official requirements page.
          </p>
          {audience === 'domestic' && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-700">{DOMESTIC_READINESS_CAVEAT}</p>
          )}
        </div>
        {!catalogueReady ? (
          <div className={`${CARD} text-sm leading-relaxed text-stone-700`}>The readiness view needs the list of tests — it appears here once the list has loaded.</div>
        ) : plannerState === 'setup' ? (
          <div className={`${CARD} text-sm leading-relaxed text-stone-700`}>The Application Planner is being switched on for your account — once it is, the universities you shortlist there appear here.</div>
        ) : plannerState === 'error' ? (
          <div className={`${CARD} text-sm leading-relaxed text-stone-700`} role="alert">
            Your shortlist could not be loaded right now. Reload the page to try again.
          </div>
        ) : regionApps.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-cream-50 p-6 text-sm leading-relaxed text-stone-700">
            <p className="m-0">
              Your planner has no applications for {region.proseName} yet.{' '}
              <Link href={toolHref('application-planner')} className={LINK}>
                Open the Application Planner
              </Link>{' '}
              to shortlist universities — the tests our profile of each one names then show up here.
            </p>
            {otherAppsCount > 0 && (
              <p className="m-0 mt-2">
                You have {otherAppsCount} {otherAppsCount === 1 ? 'application' : 'applications'} for other destinations — change the destination in
                the header to check {otherAppsCount === 1 ? 'it' : 'them'}.
              </p>
            )}
          </div>
        ) : (
          <>
            <ul role="list" className="m-0 list-none space-y-3 p-0">
              {readinessRows.map((row) => (
                <li key={row.applicationId} className={CARD}>
                  <h3 className="m-0 font-display text-lg font-bold tracking-editorial text-ink">{row.name}</h3>
                  {row.lines === null ? (
                    <p className="mt-1 text-sm text-stone-600">Added by you without a profile, so there is no test list to check — see the university&rsquo;s official requirements page.</p>
                  ) : row.lines.length === 0 ? (
                    <p className="mt-1 text-sm text-stone-600">Our profile of it lists no admission tests — see the university&rsquo;s official requirements page.</p>
                  ) : (
                    <ul role="list" className="mt-2 m-0 list-none space-y-2 p-0">
                      {row.lines.map((line, lineIdx) => (
                        <li key={`${lineIdx}:${line.text}`} className="rounded-xl border border-stone-100 bg-cream-50/60 px-3 py-2">
                          {!(line.exams.length === 1 && line.text.trim().toLowerCase() === nameOf(line.exams[0].slug).toLowerCase()) && (
                            <p className="m-0 text-sm text-stone-800">{line.text}</p>
                          )}
                          {line.exams.length === 0 ? (
                            // Our own profile wording — sometimes a test the tracker does not record, sometimes not a test at all.
                            <p className="m-0 mt-1 text-xs text-stone-600">
                              From our profile — nothing the tracker records for this line. Check the university&rsquo;s official requirements page.
                            </p>
                          ) : (
                            <ul role="list" className="mt-1.5 m-0 list-none space-y-1.5 p-0">
                              {line.exams.map((ex) => {
                                const readyLine = `${row.applicationId}:${lineIdx}:${ex.slug}`;
                                return (
                                  <li key={ex.slug} data-ready-line={readyLine} tabIndex={-1} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md text-sm">
                                    <span className="font-semibold text-ink">{nameOf(ex.slug)}:</span>
                                    {ex.latest ? (
                                      <>
                                        <span className="text-ink">
                                          {/* Dated after today (the database's one-day slack, a wrong clock, a time-zone change): "dated", never a result in hand. */}
                                          recorded — <strong>{ex.latest.score_text}</strong>
                                          {ex.future ? `, dated ${fmtDate(ex.latest.test_date)}` : ` (${fmtDate(ex.latest.test_date)})`}
                                        </span>
                                        {ex.validity && <span className={`text-xs ${TONE_CLASS[ex.validity.tone]}`}>{ex.validity.text}</span>}
                                      </>
                                    ) : (
                                      <>
                                        <span className="text-stone-600">nothing recorded</span>
                                        <button type="button" className={BTN_GHOST} onClick={(e) => requestForm(addForm(ex.slug), e.currentTarget, readyLine)}>
                                          <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Record your {nameOf(ex.slug)} score
                                        </button>
                                      </>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            {otherAppsCount > 0 && (
              <p className="m-0 text-sm text-stone-600">
                {otherAppsCount} {otherAppsCount === 1 ? 'application' : 'applications'} for other destinations {otherAppsCount === 1 ? 'is' : 'are'} in your
                planner — change the destination in the header to check {otherAppsCount === 1 ? 'it' : 'them'}.
              </p>
            )}
          </>
        )}
      </section>

      <p className="m-0 rounded-xl border border-stone-200 bg-cream-100 px-4 py-3 text-xs leading-relaxed text-stone-700">
        Scores, sections and dates are as you enter them — GlobalStudyBoard verifies none of them, computes no best or combined score, converts no
        test&rsquo;s scale into another&rsquo;s, and never says whether a score meets a requirement. Validity rules are summarised in our own words from
        each test body&rsquo;s official page, linked beside them, and can change: confirm before relying on them. Please keep registration numbers,
        dates of birth and ID numbers out of notes.
      </p>
    </div>
  );
}

// ── One exam's attempts ─────────────────────────────────────────────────────
function ExamGroup({
  exam,
  slug,
  shortName,
  attempts,
  sectionsOf,
  today,
  onEdit,
  onDelete,
}: {
  exam: ExamPick | null;
  slug: string;
  shortName: string;
  attempts: TestScore[];
  sectionsOf: (id: string) => TestScoreSection[];
  today: string;
  /** null while the test list is unavailable (the form needs it). */
  onEdit: ((score: TestScore, el: HTMLElement | null) => void) | null;
  onDelete: (score: TestScore) => Promise<boolean>;
}) {
  const v = validityFor(slug);
  // The same confirm nudge validityStatus() adds for this kind — printed once
  // here; the report and the CSV (flat tables with no rule box) keep it on every row.
  const nudge = v ? validityNudge(v) : null;
  return (
    <article className={CARD} aria-labelledby={`group-${slug}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id={`group-${slug}`} tabIndex={-1} className="m-0 font-display text-lg font-bold tracking-editorial text-ink focus:outline-none">
            {shortName}
          </h3>
          {exam && exam.fullName !== shortName && <p className="m-0 text-sm text-stone-600">{exam.fullName}</p>}
        </div>
        {exam?.websiteUrl && (
          <a href={exam.websiteUrl} target="_blank" rel="noopener noreferrer" className={`${LINK} text-sm`}>
            Official site <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </div>

      {/* The rule, once per test — each attempt below carries only what is specific to it. */}
      <p className="mt-2 rounded-xl border border-stone-100 bg-cream-50/70 px-3 py-2 text-xs leading-relaxed text-stone-700">
        <span className="font-semibold text-ink">{v ? validityKindLabel(v) : 'Validity not on file'}</span>
        {v ? (
          <>
            {' '}
            — {v.note}
            {nudge && ` ${nudge}`}{' '}
            {/* The page or document itself (a bulletin and its section, where the rule lives there), not only the body — as the public table and the report cite it. */}
            <a href={v.source.url} target="_blank" rel="noopener noreferrer" className={LINK}>
              {v.kind === 'unstated' ? `Where to confirm: ${v.source.label}` : `Source: ${v.source.label}`} <ExternalLink className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            {v.also && (
              <>
                {' · '}
                <a href={v.also.url} target="_blank" rel="noopener noreferrer" className={LINK}>
                  {v.also.label} <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </>
            )}{' '}
            <span className="text-stone-500">({v.kind === 'unstated' ? 'checked' : 'verified'} {fmtDate(v.lastVerified)})</span>
          </>
        ) : (
          <> — confirm the validity rule with the official body before relying on it.</>
        )}
      </p>

      <ul role="list" className="mt-3 m-0 list-none divide-y divide-stone-100 p-0">
        {attempts.map((score) => (
          <AttemptRow
            key={score.id}
            score={score}
            shortName={shortName}
            sections={sectionsOf(score.id)}
            status={attemptLine(v, score.test_date, today, shortName)}
            mostRecent={attempts.length > 1 && score.id === (attempts.find((a) => a.test_date <= today) ?? attempts[0]).id}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </article>
  );
}

function AttemptRow({
  score,
  shortName,
  sections,
  status,
  mostRecent,
  onEdit,
  onDelete,
}: {
  score: TestScore;
  shortName: string;
  sections: TestScoreSection[];
  /** null = nothing specific to this attempt (the rule is in the box above). */
  status: ValidityStatus | null;
  mostRecent: boolean;
  onEdit: ((score: TestScore, el: HTMLElement | null) => void) | null;
  onDelete: (score: TestScore) => Promise<boolean>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const deleteBtnRef = useRef<HTMLButtonElement>(null);
  const keepBtnRef = useRef<HTMLButtonElement>(null);
  /** Set when the confirmation closes without deleting: the delete button re-mounts on the next render, so focus it from an effect, not inline. */
  const restoreToDelete = useRef(false);

  useEffect(() => {
    if (confirming) {
      keepBtnRef.current?.focus();
    } else if (restoreToDelete.current) {
      restoreToDelete.current = false;
      // Only when closing the question left focus nowhere (Keep, or the
      // Delete/Deleting… button, unmounted with it). A delete that fails LATE —
      // the write deadline makes that the normal end of a hung delete — must not
      // pull a student who has moved into a form out of the field they are
      // typing in; the alert still announces it (the same rule as focusAfterRender).
      const active = document.activeElement;
      if (!active || active === document.body) deleteBtnRef.current?.focus();
    }
  }, [confirming]);

  const cancelDelete = () => {
    restoreToDelete.current = true;
    setConfirming(false);
  };

  const confirmDelete = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    let ok = false;
    try {
      ok = await onDelete(score);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
    if (!ok) cancelDelete();
  };

  const label = `${shortName} attempt on ${fmtDate(score.test_date)}`;

  return (
    <li className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-display text-xl font-bold tracking-editorial text-ink">{score.score_text}</span>
          <span className="text-sm text-stone-700">{fmtDate(score.test_date)}</span>
          {mostRecent && <span className={CHIP}>Most recent</span>}
        </div>
        {sections.length > 0 && (
          <ul role="list" className="mt-1.5 m-0 flex list-none flex-wrap gap-1.5 p-0" aria-label={`${label} — sections`}>
            {sections.map((x) => (
              <li key={x.id} className={CHIP}>
                {x.label}&nbsp;{x.value}
              </li>
            ))}
          </ul>
        )}
        {status && <p className={`m-0 mt-1.5 text-xs leading-relaxed ${TONE_CLASS[status.tone]}`}>{status.text}</p>}
        {score.note?.trim() && <p className="m-0 mt-1.5 whitespace-pre-line text-sm leading-relaxed text-stone-700">{score.note}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {confirming ? (
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label={`Delete ${label}?`}>
            <span className="text-sm text-stone-700">Delete this attempt?</span>
            <button type="button" className={BTN_DANGER} onClick={() => void confirmDelete()} aria-busy={busy || undefined}>
              {busy ? 'Deleting…' : 'Delete'}
            </button>
            <button ref={keepBtnRef} type="button" className={BTN_SECONDARY} data-score-keep={score.id} onClick={cancelDelete}>
              Keep
            </button>
          </div>
        ) : (
          <>
            {onEdit && (
              <button type="button" className={BTN_GHOST} data-score-edit={score.id} onClick={(e) => onEdit(score, e.currentTarget)} aria-label={`Edit ${label}`}>
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
              </button>
            )}
            <button ref={deleteBtnRef} type="button" className={ICON_BTN} data-score-delete={score.id} onClick={() => setConfirming(true)} aria-label={`Delete ${label}`}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </li>
  );
}

// ── Add / edit form ─────────────────────────────────────────────────────────
type SectionPart = 'label' | 'value';
type FieldError = { field: 'exam' | 'score' | 'date' | 'sections' | 'server'; text: string; index?: number; part?: SectionPart };

const sectionErrorText = (i: number, part: SectionPart | undefined): string =>
  part === 'value' ? `Give section ${i + 1} a score, or remove it.` : `Give section ${i + 1} a name, or remove it.`;

/** How each problem is named in the form's spoken summary. */
const fieldName = (e: FieldError): string => {
  switch (e.field) {
    case 'exam':
      return 'Test';
    case 'score':
      return 'Score';
    case 'date':
      return 'Test date';
    case 'sections':
      return `Section ${(e.index ?? 0) + 1} ${e.part === 'value' ? 'score' : 'name'}`;
    default:
      return '';
  }
};

function ScoreForm({
  id,
  region,
  exams,
  groups,
  initial,
  presetExam,
  maxDate,
  interruption,
  onDiscard,
  onKeepEditing,
  onDirtyChange,
  onExamChange,
  onSubmit,
  focusNonce,
  onClose,
}: {
  id: string;
  region: Region;
  exams: ExamPick[];
  groups: { suggested: ExamPick[]; others: ExamPick[] };
  initial: { score: TestScore; sections: TestScoreSection[] } | null;
  presetExam?: string;
  maxDate: string;
  /** Shown when another form was asked for over unsaved input (or mid-save); `discardLabel` null = a message only. */
  interruption: { seq: number; text: string; discardLabel: string | null } | null;
  onDiscard: () => void;
  onKeepEditing: () => void;
  /** Reports whether anything differs from what the form opened with. */
  onDirtyChange: (dirty: boolean) => void;
  /** Reports the test chosen now ('' = none), so a request for "the same" form compares with it, not with the preset. */
  onExamChange: (slug: string) => void;
  /** Resolves to null when saved, or to the reason it was not (shown in the form, which stays open). */
  onSubmit: (input: ScoreInput) => Promise<string | null>;
  /** Bumped by the parent to focus the first field to fill (the same rule as on open); 0 = never asked. */
  focusNonce: number;
  /** Cancel and X. Mid-save the parent keeps the form open and says why (a close cannot stop a save). */
  onClose: () => void;
}) {
  const uid = useId();
  const [examSlug, setExamSlug] = useState(initial?.score.exam_slug ?? presetExam ?? '');
  const [scoreText, setScoreText] = useState(initial?.score.score_text ?? '');
  const [testDate, setTestDate] = useState(initial?.score.test_date ?? '');
  const [note, setNote] = useState(initial?.score.note ?? '');
  const [secs, setSecs] = useState<Array<{ key: number; label: string; value: string }>>(
    (initial?.sections ?? []).map((x, i) => ({ key: i, label: x.label, value: x.value })),
  );
  const nextKey = useRef(secs.length);
  /** Every problem at once — each shown at its own field, focus on the first (a tall form on a phone should not reveal them one save at a time). */
  const [errors, setErrors] = useState<FieldError[]>([]);
  /** Bumped on every submit that finds problems, so the focus effect and the spoken summary run again for an identical repeat. */
  const [submitNonce, setSubmitNonce] = useState(0);
  const [summary, setSummary] = useState('');
  // The error list the summary was written for: once the student fixes any of
  // those problems the list changes, and the (then stale) count is withdrawn.
  const summaryFor = useRef<FieldError[] | null>(null);
  const pendingFieldFocus = useRef<(() => void) | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const examRef = useRef<HTMLSelectElement>(null);
  const scoreRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const serverErrorRef = useRef<HTMLParagraphElement>(null);
  const addSectionRef = useRef<HTMLButtonElement>(null);
  const keepEditingRef = useRef<HTMLButtonElement>(null);
  const interruptionRef = useRef<HTMLParagraphElement>(null);
  const sectionLabelRefs = useRef<Array<HTMLInputElement | null>>([]);
  const sectionValueRefs = useRef<Array<HTMLInputElement | null>>([]);
  const pendingSectionFocus = useRef<number | null>(null);

  const focusFirstField = () => (examSlug ? scoreRef : examRef).current?.focus();
  /** An edited attempt's stored test date: kept even when it is after today on this device (see submit). */
  const storedDate = initial?.score.test_date ?? null;
  const dateMax = storedDate && storedDate > maxDate ? storedDate : maxDate;

  useEffect(() => {
    focusFirstField();
    // Only on mount: the form opens onto the first thing to fill.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Asked for again while open (the same attempt's Edit, the same test's Record):
  // the same first field as on open — the score, once a test is chosen.
  useEffect(() => {
    if (focusNonce) focusFirstField();
    // Only when the parent asks: focusFirstField reads this render's test choice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusNonce]);

  useEffect(() => {
    if (pendingSectionFocus.current === null) return;
    const i = pendingSectionFocus.current;
    pendingSectionFocus.current = null;
    const el = i >= 0 ? sectionLabelRefs.current[i] : null;
    (el ?? addSectionRef.current)?.focus();
  }, [secs]);

  // Unsaved input? Compared with what the form opened with (an empty section row is not input).
  const initialExam = initial?.score.exam_slug ?? presetExam ?? '';
  const filledSecs = (list: Array<{ label: string; value: string }>) => JSON.stringify(list.filter((s) => s.label.trim() || s.value.trim()).map((s) => [s.label, s.value]));
  const dirty =
    examSlug !== initialExam ||
    scoreText !== (initial?.score.score_text ?? '') ||
    testDate !== (initial?.score.test_date ?? '') ||
    note !== (initial?.score.note ?? '') ||
    filledSecs(secs) !== filledSecs(initial?.sections ?? []);
  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);
  useEffect(() => {
    onExamChange(examSlug);
  }, [examSlug, onExamChange]);

  // The interruption takes focus when it appears (or is asked for again):
  // "Keep editing" — the safe choice — or the message itself when there is no choice.
  const interruptionSeq = interruption?.seq ?? 0;
  const interruptionHasChoice = Boolean(interruption?.discardLabel);
  useEffect(() => {
    if (!interruptionSeq) return;
    (interruptionHasChoice ? keepEditingRef.current : interruptionRef.current)?.focus();
  }, [interruptionSeq, interruptionHasChoice]);

  const keepEditing = () => {
    onKeepEditing();
    focusFirstField();
  };

  const exam = exams.find((e) => e.slug === examSlug) ?? null;
  const errFor = (f: FieldError['field']) => errors.find((x) => x.field === f)?.text ?? '';
  const sectionError = (i: number) => errors.find((x) => x.field === 'sections' && x.index === i);
  const serverError = errFor('server');
  // After the render that shows them (not an animation frame, which a hidden
  // tab never runs), so aria-invalid and the error description are already in
  // place when focus lands: the first invalid field, else a server failure.
  // Keyed on the list (a new array per failure) and the nonce, so a repeat of
  // the same problem still takes focus.
  useEffect(() => {
    const focusField = pendingFieldFocus.current;
    if (focusField) {
      pendingFieldFocus.current = null;
      focusField();
      return;
    }
    if (errors.some((x) => x.field === 'server')) serverErrorRef.current?.focus();
  }, [errors, submitNonce]);
  const clearError = (f: FieldError['field']) => setErrors((cur) => (cur.some((x) => x.field === f || x.field === 'server') ? cur.filter((x) => x.field !== f && x.field !== 'server') : cur));
  /** Typing in one half of a section row clears that half's problem only — not another row's. */
  const clearSectionError = (i: number, part: SectionPart) =>
    setErrors((cur) =>
      cur.some((x) => (x.field === 'sections' && x.index === i && x.part === part) || x.field === 'server')
        ? cur.filter((x) => !(x.field === 'sections' && x.index === i && x.part === part) && x.field !== 'server')
        : cur,
    );

  const addSection = () => {
    if (secs.length >= SCORE_LIMITS.sectionsPerScore) return;
    pendingSectionFocus.current = secs.length;
    setSecs((prev) => [...prev, { key: nextKey.current++, label: '', value: '' }]);
  };

  const removeSection = (i: number) => {
    // Focus the row above; when the last row goes, the "Add a section score" button.
    pendingSectionFocus.current = secs.length === 1 ? -1 : Math.max(0, i - 1);
    setSecs((prev) => prev.filter((_, j) => j !== i));
    // Drop that row's problem; the rows below move up one, and so do theirs.
    setErrors((cur) =>
      cur
        .filter((x) => x.field !== 'server' && !(x.field === 'sections' && x.index === i))
        .map((x) => (x.field === 'sections' && x.index !== undefined && x.index > i ? { ...x, index: x.index - 1, text: sectionErrorText(x.index - 1, x.part) } : x)),
    );
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busyRef.current) return;
    const found: FieldError[] = [];
    const focusFirst: Array<() => void> = [];
    if (!exam) {
      found.push({ field: 'exam', text: 'Choose the test this score is for.' });
      focusFirst.push(() => examRef.current?.focus());
    }
    const cleanScore = cleanScoreText(scoreText);
    if (!cleanScore) {
      found.push({ field: 'score', text: 'Enter the score exactly as you received it — for example 1450, 7.5, 99.2 percentile or A*AA.' });
      focusFirst.push(() => scoreRef.current?.focus());
    }
    if (!isRealDate(testDate)) {
      found.push({ field: 'date', text: 'Enter the test date as a real calendar date.' });
      focusFirst.push(() => dateRef.current?.focus());
    } else if (testDate < `${SCORE_LIMITS.earliestYear}-01-01`) {
      found.push({ field: 'date', text: `The test date must be 1 January ${SCORE_LIMITS.earliestYear} or later.` });
      focusFirst.push(() => dateRef.current?.focus());
    } else if (testDate > maxDate && testDate !== storedDate) {
      // Only a date the student typed or changed. An attempt already stored with
      // a date after today on this device (the database's one-day time-zone
      // slack, a clock or time-zone change — the tool itself says it may be a
      // real sitting) can still be edited: its unchanged date always passes the
      // database check it passed when it was saved (TRK-R2-4).
      found.push({ field: 'date', text: 'The test date can’t be after today on this device — record a score once you have sat the test.' });
      focusFirst.push(() => dateRef.current?.focus());
    }
    // Every half-filled row, each at its own row, with the EMPTY half marked.
    const cleanSecs: Array<{ label: string; value: string }> = [];
    for (let i = 0; i < secs.length; i += 1) {
      const label = cleanSectionLabel(secs[i].label);
      const value = cleanSectionValue(secs[i].value);
      if (!label && !value) continue;
      if (!label || !value) {
        const part: SectionPart = label ? 'value' : 'label';
        found.push({ field: 'sections', index: i, part, text: sectionErrorText(i, part) });
        focusFirst.push(() => (part === 'value' ? sectionValueRefs : sectionLabelRefs).current[i]?.focus());
        continue;
      }
      cleanSecs.push({ label, value });
    }
    if (found.length || !exam) {
      pendingFieldFocus.current = focusFirst[0] ?? null;
      summaryFor.current = found;
      setErrors(found);
      setSubmitNonce((n) => n + 1);
      // Spoken even when focus does not move (Enter in a field that is itself the first problem).
      setSummary(`Not saved — ${found.length === 1 ? '1 field needs' : `${found.length} fields need`} attention: ${found.map(fieldName).join(', ')}.`);
      return;
    }
    setErrors([]);
    setSummary('');
    busyRef.current = true;
    setBusy(true);
    let why: string | null = null;
    try {
      why = await onSubmit({ exam_slug: exam.slug, score_text: cleanScore, test_date: testDate, note: cleanScoreNote(note) || null, sections: cleanSecs });
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
    if (why) {
      setErrors([{ field: 'server', text: why }]);
    }
  };

  const describedBy = (...ids: Array<string | false | undefined>) => ids.filter(Boolean).join(' ') || undefined;

  return (
    <form id={id} onSubmit={submit} className={`${CARD} space-y-4`} aria-labelledby={`${uid}-h`} noValidate>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id={`${uid}-h`} className="m-0 font-display text-xl font-bold tracking-editorial text-ink">
            {initial ? 'Edit this attempt' : exam ? `Record your ${exam.shortName} score` : 'Record a score'}
          </h2>
          <p className="m-0 mt-1 text-sm text-stone-700">Enter it exactly as the test body reported it. Every attempt is kept — nothing is combined or converted.</p>
        </div>
        {/* Mid-save, Cancel and X stay focusable but announce themselves unavailable; pressed, they explain instead of closing. */}
        <button
          type="button"
          onClick={onClose}
          className={`${ICON_BTN} aria-disabled:cursor-not-allowed aria-disabled:opacity-60`}
          aria-label="Close the form"
          aria-disabled={busy || undefined}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {interruption && (
        <div className={WARN_BOX} role="group" aria-labelledby={`${uid}-int`}>
          <p id={`${uid}-int`} ref={interruptionRef} tabIndex={-1} className="m-0 focus:outline-none">
            {interruption.text}
          </p>
          {interruption.discardLabel && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className={BTN_DANGER} onClick={onDiscard}>
                {interruption.discardLabel}
              </button>
              <button ref={keepEditingRef} type="button" className={BTN_SECONDARY} onClick={keepEditing}>
                Keep editing
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={`${uid}-exam`} className={LABEL}>
            Test
          </label>
          <select
            id={`${uid}-exam`}
            ref={examRef}
            value={examSlug}
            onChange={(e) => {
              setExamSlug(e.target.value);
              clearError('exam');
            }}
            className={SELECT}
            aria-invalid={errFor('exam') ? true : undefined}
            aria-describedby={describedBy(errFor('exam') && `${uid}-exam-err`)}
            required
          >
            <option value="">Choose a test…</option>
            {groups.suggested.length > 0 && (
              <optgroup label={`Suggested for ${region.proseName}`}>
                {groups.suggested.map((e) => (
                  <option key={e.slug} value={e.slug}>
                    {e.shortName} — {e.fullName}
                  </option>
                ))}
              </optgroup>
            )}
            {groups.others.length > 0 && (
              <optgroup label="All other tests">
                {groups.others.map((e) => (
                  <option key={e.slug} value={e.slug}>
                    {e.shortName} — {e.fullName}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          {errFor('exam') && (
            <p id={`${uid}-exam-err`} className={FIELD_ERROR}>
              {errFor('exam')}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${uid}-score`} className={LABEL}>
            Score, as received
          </label>
          <input
            id={`${uid}-score`}
            ref={scoreRef}
            value={scoreText}
            onChange={(e) => {
              setScoreText(e.target.value);
              clearError('score');
            }}
            className={INPUT}
            maxLength={SCORE_LIMITS.scoreText}
            placeholder="1450 · 7.5 · 99.2 percentile · A*AA"
            aria-invalid={errFor('score') ? true : undefined}
            aria-describedby={describedBy(errFor('score') && `${uid}-score-err`, exam?.totalMarks && `${uid}-scale`)}
            required
          />
          {errFor('score') && (
            <p id={`${uid}-score-err`} className={FIELD_ERROR}>
              {errFor('score')}
            </p>
          )}
          {exam?.totalMarks && (
            <p id={`${uid}-scale`} className="m-0 mt-1 text-xs text-stone-600">
              {exam.shortName}&rsquo;s own scale: {exam.totalMarks}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${uid}-date`} className={LABEL}>
            Test date
          </label>
          <input
            id={`${uid}-date`}
            ref={dateRef}
            type="date"
            value={testDate}
            onChange={(e) => {
              setTestDate(e.target.value);
              clearError('date');
            }}
            className={INPUT}
            min={`${SCORE_LIMITS.earliestYear}-01-01`}
            max={dateMax}
            aria-invalid={errFor('date') ? true : undefined}
            aria-describedby={describedBy(errFor('date') && `${uid}-date-err`, `${uid}-date-hint`)}
            required
          />
          {errFor('date') && (
            <p id={`${uid}-date-err`} className={FIELD_ERROR}>
              {errFor('date')}
            </p>
          )}
          <p id={`${uid}-date-hint`} className="m-0 mt-1 text-xs text-stone-600">
            The date you sat the test. Booked a sitting? Add it as a test date in your{' '}
            {/* A new tab, so following it never discards what is typed here. The
                carry to the next tool is module state, which a new tab does not
                share, so the destination rides the link's fragment instead (a
                remembered choice still wins there); a full page load in a new
                tab does not hash-scroll, so a plain <a> is safe (G8-SK2-3). */}
            <a href={toolHref('application-planner', region.slug)} target="_blank" rel="noopener noreferrer" className={LINK}>
              Application Planner <ExternalLink className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            .
          </p>
        </div>
      </div>

      <fieldset className="m-0 border-0 p-0">
        <legend className={LABEL}>
          Section scores <span className="font-normal normal-case tracking-normal text-stone-500">(optional, up to {SCORE_LIMITS.sectionsPerScore})</span>
        </legend>
        {secs.length > 0 && (
          <>
            <div className="mb-1 grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_2.25rem] gap-2 text-xs font-medium text-stone-600" aria-hidden="true">
              <span>Section</span>
              <span>Score</span>
              <span />
            </div>
            <ul role="list" className="m-0 list-none space-y-2 p-0">
              {secs.map((s, i) => {
                const err = sectionError(i);
                const errId = err ? `${uid}-sec-err-${s.key}` : undefined;
                return (
                  <li key={s.key} className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_2.25rem] items-center gap-2">
                    <label className="sr-only" htmlFor={`${uid}-sl-${s.key}`}>
                      Section {i + 1} name
                    </label>
                    <input
                      id={`${uid}-sl-${s.key}`}
                      ref={(el) => {
                        sectionLabelRefs.current[i] = el;
                      }}
                      value={s.label}
                      onChange={(e) => {
                        setSecs((prev) => prev.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)));
                        clearSectionError(i, 'label');
                      }}
                      className={INPUT}
                      maxLength={SCORE_LIMITS.sectionLabel}
                      placeholder="Reading"
                      aria-invalid={err?.part === 'label' || undefined}
                      aria-describedby={errId}
                    />
                    <label className="sr-only" htmlFor={`${uid}-sv-${s.key}`}>
                      Section {i + 1} score
                    </label>
                    <input
                      id={`${uid}-sv-${s.key}`}
                      ref={(el) => {
                        sectionValueRefs.current[i] = el;
                      }}
                      value={s.value}
                      onChange={(e) => {
                        setSecs((prev) => prev.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)));
                        clearSectionError(i, 'value');
                      }}
                      className={INPUT}
                      maxLength={SCORE_LIMITS.sectionValue}
                      placeholder="720"
                      aria-invalid={err?.part === 'value' || undefined}
                      aria-describedby={errId}
                    />
                    <button type="button" className={ICON_BTN} onClick={() => removeSection(i)} aria-label={`Remove section ${i + 1}`}>
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                    {err && (
                      <p id={errId} className="col-span-3 m-0 text-sm text-red-700">
                        {sectionErrorText(i, err.part)}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}
        <button ref={addSectionRef} type="button" className={`${BTN_GHOST} mt-2`} onClick={addSection} disabled={secs.length >= SCORE_LIMITS.sectionsPerScore}>
          <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add a section score
        </button>
      </fieldset>

      <div>
        <label htmlFor={`${uid}-note`} className={LABEL}>
          Private note <span className="font-normal normal-case tracking-normal text-stone-500">(optional)</span>
        </label>
        <textarea
          id={`${uid}-note`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={TEXTAREA}
          maxLength={SCORE_LIMITS.note}
          placeholder="Which universities you sent it to, whether you plan to retake…"
          aria-describedby={`${uid}-note-hint`}
        />
        <p id={`${uid}-note-hint`} className="m-0 mt-1 text-xs text-stone-600">
          Readable only by you and, for support, by us. Please keep registration numbers, dates of birth and ID numbers out of it.
        </p>
      </div>

      {/* The count of field problems, spoken politely — visually the errors sit at their fields. The keyed span re-announces an identical repeat; it is withdrawn as soon as any counted problem is fixed, so a screen reader never finds a stale count. */}
      <p className="sr-only" role="status" aria-live="polite">
        {summary && errors === summaryFor.current && <span key={submitNonce}>{summary}</span>}
      </p>

      {/* Failures from the server (not a field) — right beside the Save button, where the student is looking. Focus announces it (no role="alert" too, which would read it twice). */}
      <p ref={serverErrorRef} tabIndex={-1} className={serverError ? 'm-0 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 focus:outline-none' : 'sr-only'}>
        {serverError}
      </p>

      <div className="flex flex-wrap gap-2">
        <button type="submit" className={BTN_PRIMARY} aria-busy={busy || undefined}>
          {busy ? 'Saving…' : initial ? 'Save changes' : 'Save score'}
        </button>
        <button type="button" onClick={onClose} className={`${BTN_SECONDARY} aria-disabled:cursor-not-allowed aria-disabled:opacity-60`} aria-disabled={busy || undefined}>
          Cancel
        </button>
      </div>
    </form>
  );
}

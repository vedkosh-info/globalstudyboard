'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowDownWideNarrow, ChevronDown, ChevronLeft, ChevronRight, Download, ExternalLink, FileText, Plus, RotateCw, Search, Trash2, X } from 'lucide-react';
import { reportHref } from '@/lib/tools';
import type { User } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { checkToolSession, CONNECTION_LOST, explainLoadFailure, isUnansweredWrite, SESSION_ENDED, sessionMessage, TIMED_OUT, withDeadline, type ToolSession, type WriteOutcome } from '@/lib/tools-shared';
import { ToolLoadError, ToolOffline, ToolSetup, ToolSkeleton, ToolSessionEnded } from '@/components/tools/ToolStates';
import { useRegion } from '@/components/RegionProvider';
import RegionFlag from '@/components/RegionFlag';
import AddToPlannerButton from '@/components/AddToPlannerButton';
import { REGIONS_ALPHABETICAL, getRegionBySlug, type Region, type RegionSlug } from '@/lib/regions';
import { RANKING_NUDGE } from '@/lib/college-labels';
import { cleanNotes, cleanUrl } from '@/lib/planner';
import type { CompareFacts } from '@/lib/compare-catalogue';
import {
  COMPARE_LIMITS,
  DEFAULT_CRITERIA,
  PROFILE_NOT_FOUND,
  SCALE,
  SCORE_HINT,
  WEIGHT_HINT,
  cleanLine,
  compareCsv,
  defaultSetLabel,
  entryResult,
  isScale,
  mostRecentSet,
  sortByScore,
  topPick,
  type CompareCriterion,
  type CompareEntry,
  type CompareScore,
  type CompareSet,
  type EntryResult,
  type Scale,
} from '@/lib/compare';

/**
 * Compare Universities (signed-in view). Loaded as its own chunk by
 * CompareGate, so this is the ONLY place on the route that imports the
 * Supabase SDK. Reads and writes go straight to the four compare tables through
 * the visitor's own cookie-bound session — Row-Level Security scopes every row
 * to them (migration 0005).
 *
 * Region in context: comparisons belong to the destination chosen in the
 * header (`effectiveRegion`); the picker offers that destination's profiles;
 * changing the destination re-tunes in place; other destinations' comparisons
 * are counted, never mixed in.
 *
 * Two kinds of content sit in one table and are kept visibly apart: OUR
 * verified facts (the same rows the profile page renders, rankings attributed
 * to their bodies) and the STUDENT'S own criteria, weights and scores. The
 * site computes the arithmetic on the student's numbers, shows it in full,
 * and draws no conclusion of its own (Rule A, Rule E, §4.5).
 *
 * Accessibility: a real <table> (screen-reader table navigation works), every
 * score cell is a native radio group with an sr-only legend, focus moves to a
 * new comparison's heading, back to the add controls after adds and removals;
 * one polite live region announces structural events only (never each score).
 *
 * Failures are shown, not only announced: a form (and a rename, a weight or a
 * note) puts the reason beside itself — the write returns it — and a score
 * chip / Remove puts it in the alert above the comparison, as does a form's
 * save whose comparison view was replaced (another comparison, another
 * destination) before the answer landed. A failed write
 * never signs the student out by itself: only a definite "session gone" from
 * the auth server does; a connection problem keeps the session and everything
 * typed (lib/tools-shared).
 *
 * The fact sheets are a separate static fetch. If it fails (an error answer,
 * no connection, an empty list, or no answer within CATALOGUE_TIMEOUT_MS) the
 * tool says so with "Try again" — it never passes the failure off as "no
 * profiles": the facts read "could not load", the picker says the list is
 * unavailable, and Download CSV waits for it (review CRIT2-5).
 *
 * No wait is endless: the first read and every write run under the shared
 * deadline (lib/tools-shared withDeadline). A read that has not settled shows
 * the offline card, never a skeleton for ever; a write given up on — or one
 * that got no HTTP answer at all — says its outcome is unknown, never "not
 * saved" (the Test Score Tracker's contract; see runWrite).
 */

// ── Styling tokens (site design language, shared with the other tools) ─────
const CARD = 'rounded-2xl border border-stone-200 bg-white p-5 shadow-sm';
// A SOLID focus ring (forest-500, 4.42:1 on white) with a 1px white offset —
// the same field focus as the Test Score Tracker, so every tool reads alike (§15.2).
// A field marked aria-invalid gets the tracker's red border too; it wins the
// cascade over focus:border-*, so on a focused invalid field the ring marks focus.
const FIELD =
  'w-full rounded-xl border border-stone-450 bg-white px-3 text-base text-ink placeholder:text-stone-500 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:ring-offset-1 aria-[invalid=true]:border-red-500 sm:text-sm';
const INPUT = `${FIELD} h-10`;
const LABEL = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-600';
// An unavailable control looks unavailable — dimmed, a not-allowed cursor, no
// hover change: `disabled:` when there is nothing to do, `aria-disabled:` for a
// control that stays focusable while it cannot act — held while a save it would
// interrupt is in flight, or a table-scroll chevron at its end (a `disabled`
// control that has focus drops it to <body>).
const BTN =
  'inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60';
const BTN_PRIMARY = `${BTN} bg-forest-700 text-cream-50 hover:bg-forest-800 aria-disabled:hover:bg-forest-700`;
const BTN_SECONDARY = `${BTN} border border-forest-300 bg-white text-forest-700 hover:border-forest-400 hover:bg-forest-50`;
const BTN_DANGER = `${BTN} border border-red-300 bg-white text-red-700 hover:bg-red-50 focus-visible:ring-red-500`;
const BTN_GHOST =
  'inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-stone-700 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:hover:bg-transparent aria-disabled:hover:text-stone-700';
const ICON_BTN =
  'inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-600 transition-colors hover:bg-stone-100 hover:text-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-stone-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:hover:bg-transparent aria-disabled:hover:text-stone-600';
/** A form's close (×) button. */
const CLOSE_X =
  '-m-1 rounded-lg p-1 text-stone-600 hover:bg-stone-100 hover:text-forest-800 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:hover:bg-transparent aria-disabled:hover:text-stone-600';
const LINK = 'inline-flex items-center gap-1 text-forest-700 underline underline-offset-2 hover:text-forest-800';
const TH_ROW = 'sticky left-0 z-10 bg-white text-left align-top text-sm font-semibold text-ink border-r border-stone-200 px-3 py-2.5 min-w-[11rem] max-w-[13rem]';
const TD = 'align-top px-3 py-2.5 text-sm text-stone-800 min-w-[11rem] max-w-[16rem] border-l border-stone-100';

// A warning that does not stop the tool (the fact sheets did not load) — the Test Score Tracker's look.
const WARN_BOX = 'rounded-xl border border-terracotta-200 bg-terracotta-50 px-4 py-3 text-sm leading-relaxed text-stone-800';
/** The CSV for a comparison of typed-in universities only reads no fact sheet: it needs no catalogue (as its report). */
const NO_FACTS: Map<string, CompareFacts> = new Map();

const CATALOGUE_URL = '/tools/compare-universities/catalogue';
/** A fetch of the fact sheets that has not settled by then is aborted and reported as failed — never "Loading…" for ever. */
const CATALOGUE_TIMEOUT_MS = 12_000;

type LoadState = 'loading' | 'ready' | 'setup' | 'error' | 'offline' | 'signed-out';
type CatalogueState = 'loading' | 'ready' | 'error';

/** The fact sheets' fetch, as the parts of the tool that need it see it. */
interface CatalogueStatus {
  /** A fetch has failed and none has succeeded since (a retry may be running). */
  down: boolean;
  retrying: boolean;
  /** How many fetches have failed — messages follow this, never a retry in progress. */
  failures: number;
  /** Fetch again; `focusAfter` runs once the list arrives if the retry button's leaving dropped focus to the page. */
  retry: (focusAfter: () => void) => void;
}

/** The latest outcome: 'ok' is announced (screen readers), 'error' is also shown. */
type Notice = { tone: 'ok' | 'error'; text: string } | null;

// ── Writes under a deadline ─────────────────────────────────────────────────
// A request on a stalled connection never settles by itself — nor does the
// token refresh the SDK runs BEFORE it, which ignores any abort signal — so a
// form would stay "Saving…" for ever (review TRK-R2-6). Every write therefore
// runs under withDeadline (WRITE_TIMEOUT_MS), and how it ended decides what the
// student is told (the same rules as the Cost & Funding Planner):
//   - it never went out (the session check could not reach the server): nothing
//     was sent, so nothing changed — the connection message;
//   - the server answered with a refusal: a refusal, even if explaining it (a
//     session check on the same slow link) outlasts the deadline;
//   - it went out and no answer came — the deadline, a thrown error, or an
//     answer that is not the database's (see `unanswered`): the outcome is
//     UNKNOWN, and the sentence says so — never "not saved", nor
//     CONNECTION_LOST's "Nothing was lost" (review G4-V2-1). The Application
//     Planner follows the same rules.
/** A write that went out and got no answer from the database (see `unanswered`). */
const NO_ANSWER = Symbol('no-answer');
/**
 * No answer from the database: postgrest-js reports a request that got no HTTP
 * response as status 0 (it never retries a write), and a gateway's 502 or 504
 * means the gateway never heard back either — the write may or may not have run.
 */
const unanswered = isUnansweredWrite;
type WriteEnd = { kind: 'unsent' } | { kind: 'refused'; generic: string } | { kind: 'unknown' };
interface WriteSteps {
  signal: AbortSignal;
  /** True once the deadline has passed: the student has been told already, so apply nothing more. */
  expired: () => boolean;
  /** Call as the request goes out: from here on, no answer means an unknown outcome. */
  sending: () => void;
  /** Call when the server has refused, with the sentence that says so. */
  refused: (generic: string) => void;
}

async function runWrite(run: (w: WriteSteps) => Promise<WriteOutcome | typeof NO_ANSWER>, end: (how: WriteEnd) => WriteOutcome): Promise<WriteOutcome> {
  const seen = { sent: false, refusal: null as string | null };
  const outcome = await withDeadline((signal, expired) =>
    run({
      signal,
      expired,
      sending: () => {
        seen.sent = true;
      },
      refused: (generic) => {
        seen.refusal = generic;
      },
    }),
  ).catch((): typeof TIMED_OUT => TIMED_OUT); // an unexpected throw ends like the deadline
  if (outcome === NO_ANSWER) return end({ kind: 'unknown' });
  if (outcome !== TIMED_OUT) return outcome;
  if (seen.refusal !== null) return end({ kind: 'refused', generic: seen.refusal });
  return end({ kind: seen.sent ? 'unknown' : 'unsent' });
}

/** A write whose outcome is unknown: what it was, then what is safe to do next. */
const UNCONFIRMED_LEAD = 'We could not confirm whether ';
const unconfirmed = (what: string, next: string): string => `${UNCONFIRMED_LEAD}${what} — the server did not answer. ${next}`;
/**
 * True for a sentence built by `unconfirmed` (the only producer of that lead):
 * the write may have landed, so a control must not add anything that assumes
 * it did not — e.g. "keep the old name" (review R4C-SK-1).
 */
const isUnconfirmed = (why: string): boolean => why.startsWith(UNCONFIRMED_LEAD);
/** An update, a score or a delete: sending it again does no harm, whichever way the first one went. */
const SAVE_AGAIN = 'Save it again (saving the same change twice does no harm), or reload the page to check.';
const REMOVE_AGAIN = 'Try again (removing it twice does no harm), or reload the page to check.';
/** A score or a weight is sent again by choosing it again; its chips show the last value known to be saved. */
const CHOOSE_AGAIN = 'It is shown as it was before: choose it again (choosing the same one twice does no harm), or reload the page to check.';
/** A new comparison, criterion or university: a second one could duplicate the first, so check before repeating it. */
const CHECK_FIRST = (what: string) => `Reload the page to check before ${what} again, so you do not end up with two.`;

const regionOf = (slug: RegionSlug): Region => getRegionBySlug(slug) ?? REGIONS_ALPHABETICAL[0];

// ── Component ────────────────────────────────────────────────────────────────
export default function CompareApp() {
  const { effectiveRegion } = useRegion();
  const region = regionOf(effectiveRegion);
  const [load, setLoad] = useState<LoadState>('loading');
  const [sets, setSets] = useState<CompareSet[]>([]);
  const [criteria, setCriteria] = useState<CompareCriterion[]>([]);
  const [entries, setEntries] = useState<CompareEntry[]>([]);
  const [scores, setScores] = useState<CompareScore[]>([]);
  const [facts, setFacts] = useState<Map<string, CompareFacts> | null>(null);
  const [catalogueState, setCatalogueState] = useState<CatalogueState>('loading');
  /** Bumped by "Try again" to fetch the fact sheets again (0 = the first fetch). */
  const [catalogueTry, setCatalogueTry] = useState(0);
  const [catalogueFailures, setCatalogueFailures] = useState(0);
  /** Where focus goes once a retried fetch lands (the "Try again" button leaves with the warning). */
  const retryFocus = useRef<(() => void) | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [creating, setCreating] = useState(false);
  // True while the new-comparison form ON SCREEN has a save in flight. Nothing
  // the student clicks closes that form then: its × and Cancel and the header
  // toggle wait (shown unavailable), so a click can never look as if it stopped
  // a save that then lands (review RT-4). Only a destination change closes it
  // mid-save — and that clears this, so a new form opened for the new
  // destination is never shown locked by the old form's save, and the old
  // save's answer never unlocks the new form's (see createSet).
  const [createSaving, setCreateSaving] = useState(false);
  /** Identity of the new-comparison form on screen — bumped whenever it opens or closes. */
  const createFormToken = useRef(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const newBtnRef = useRef<HTMLButtonElement>(null);
  const setHeadingRef = useRef<HTMLHeadingElement>(null);
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

  /** Show why a score / Remove did not save (a form, rename, weight or note shows its own reason). */
  const report = useCallback((why: WriteOutcome) => {
    if (why) setNotice({ tone: 'error', text: why });
  }, []);

  // The fact sheets (static JSON, cached for an hour) — off the page payload. An
  // error answer, a network failure, a hung request (aborted) and an empty list
  // are all a FAILURE, never an empty map that would read as "no profiles".
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
        if (catalogueTry > 0) setNotice({ tone: 'ok', text: 'Our university profiles have loaded.' });
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
    const then = retryFocus.current;
    retryFocus.current = null;
    // Only if the button's leaving dropped focus to the page — never pull it from where the student has moved on.
    const now = document.activeElement;
    if (!now || now === document.body) then();
  }, [catalogueState]);

  const catalogue = useMemo<CatalogueStatus>(
    () => ({
      down: catalogueFailures > 0 && catalogueState !== 'ready',
      retrying: catalogueFailures > 0 && catalogueState === 'loading',
      failures: catalogueFailures,
      retry: (focusAfter) => {
        if (catalogueState === 'loading') return;
        retryFocus.current = focusAfter;
        setCatalogueState('loading');
        setCatalogueTry((n) => n + 1);
      },
    }),
    [catalogueFailures, catalogueState],
  );

  // Initial load — under the same deadline as a write (the session check and
  // the reads can stall on a dead connection just as a save can): a load that
  // has not settled shows the offline card instead of a skeleton for ever.
  useEffect(() => {
    let active = true;
    void withDeadline<LoadState | null>(async (signal, expired) => {
      const s = await checkToolSession();
      if (!active || expired()) return null;
      if (s.kind === 'offline') return 'offline';
      // Signed out: the gate normally swaps in the sign-in card; never leave a spinner if it does not.
      if (s.kind !== 'ok') return 'signed-out';
      userRef.current = s.user;
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
        if (active && next) setLoad(next === TIMED_OUT ? 'offline' : next);
      });
    return () => {
      active = false;
    };
  }, []);

  // The destination in the header changed: show its comparisons, close any form.
  // The form's identity moves on here, not only once the close has rendered, so
  // a save answering in between already knows its form is gone.
  useEffect(() => {
    createFormToken.current += 1;
    setSelectedId(null);
    setCreating(false);
    setCreateSaving(false);
  }, [effectiveRegion]);

  useEffect(() => {
    createFormToken.current += 1;
  }, [creating]);

  // Focus the comparison created last (after its heading has mounted).
  useEffect(() => {
    if (pendingFocus.current && setHeadingRef.current && sets.some((x) => x.id === pendingFocus.current)) {
      pendingFocus.current = null;
      setHeadingRef.current.focus();
    }
  }, [sets, selectedId]);

  const regionSets = useMemo(() => sets.filter((x) => x.region === effectiveRegion), [sets, effectiveRegion]);
  const set = regionSets.find((x) => x.id === selectedId) ?? mostRecentSet(regionSets);
  const setCriteriaList = useMemo(() => (set ? criteria.filter((c) => c.set_id === set.id) : []), [criteria, set]);
  const setEntries_ = useMemo(() => (set ? entries.filter((e) => e.set_id === set.id) : []), [entries, set]);
  // Only a profiled university needs the fact sheets: a typed-only comparison
  // downloads its CSV during an outage, the same way its report renders.
  const needsFacts = setEntries_.some((e) => Boolean(e.college_slug));
  const csvFacts = facts ?? (needsFacts ? null : NO_FACTS);
  const otherRegions = useMemo(() => {
    const counts = new Map<RegionSlug, number>();
    for (const x of sets) if (x.region !== effectiveRegion) counts.set(x.region, (counts.get(x.region) ?? 0) + 1);
    return REGIONS_ALPHABETICAL.filter((r) => counts.has(r.slug)).map((r) => ({ region: r, n: counts.get(r.slug)! }));
  }, [sets, effectiveRegion]);

  // Identity of the comparison view on screen. SetView is keyed by the
  // comparison's id, so a switch to another comparison, a destination change or
  // a removal replaces it — and every form, rename, weight and note inside it. A
  // save started in the old view still answers, but what would have shown a
  // refusal is gone (review RT-4).
  const viewToken = useRef(0);
  useEffect(() => {
    viewToken.current += 1;
  }, [set?.id]);

  /**
   * For a save made from inside the comparison view — call it as the save
   * starts. If that view has gone by the time the answer lands, a refusal is
   * shown in the alert above the comparison, led by `lost` (what did not save),
   * and the gone control receives null: the reason is never lost with the
   * control that would have shown it. `unsure` does the same for an outcome
   * that is unknown — that sentence names what it was about and is shown as it
   * is, because "… was not saved" would not be true.
   */
  const viewSave = useCallback((lost: string) => {
    const token = viewToken.current;
    const gone = () => viewToken.current !== token;
    const settle = (why: WriteOutcome, generic?: string): WriteOutcome => {
      if (!why || !gone()) return why;
      // What was typed went with the view, so "nothing was lost" no longer holds;
      // and a generic "could not …" would only repeat `lost`.
      const reason = why === CONNECTION_LOST ? 'We could not reach the server — check your connection, then try again.' : why === generic ? 'Please try again.' : why;
      setNotice({ tone: 'error', text: `${lost} ${reason}` });
      return null;
    };
    const unsure = (text: string): WriteOutcome => {
      if (!gone()) return text;
      setNotice({ tone: 'error', text });
      return null;
    };
    return { gone, settle, unsure };
  }, []);

  // ── Mutations ───────────────────────────────────────────────────────────
  // Each resolves to null when it saved, or the sentence that says why not —
  // or that its outcome is unknown (runWrite).
  const createSet = useCallback(
    async (label: string): Promise<WriteOutcome> => {
      // The form that sent this save. A destination change in the header closes
      // it mid-save (and the student may open a new one for the new destination):
      // the answer still counts, but it must not close that newer form, select
      // or focus anything, and a refusal is shown here because its form is gone.
      const token = createFormToken.current;
      const stillOpen = () => createFormToken.current === token;
      // The destination the form was opened for — the header may have moved on by the time the answer lands.
      const where = regionOf(effectiveRegion).proseName;
      const refused = (why: string): WriteOutcome => {
        if (stillOpen()) return why;
        setNotice({
          tone: 'error',
          text: `Your new comparison for ${where} may not have been created — the destination changed while it was saving. Reload the page to check before creating it again.`,
        });
        return null;
      };
      const unsure = (): WriteOutcome => {
        const text = unconfirmed(`your new comparison for ${where} was created`, CHECK_FIRST('creating it'));
        if (stillOpen()) return text;
        setNotice({ tone: 'error', text });
        return null;
      };
      // Two writes: the comparison, then its starting criteria. Once the first
      // has landed the comparison EXISTS — it is shown whatever becomes of the
      // second, which says for itself whether it was refused or went unanswered.
      const made = { row: null as CompareSet | null };
      const finish = (row: CompareSet, seeded: CompareCriterion[], seed: 'ok' | 'refused' | 'unknown') => {
        const current = stillOpen();
        if (current) pendingFocus.current = row.id;
        setSets((prev) => [...prev, row]);
        if (seeded.length) setCriteria((prev) => [...prev, ...seeded]);
        if (current) {
          setSelectedId(row.id);
          setCreating(false);
        }
        // Not current: kept under its own destination, which is no longer the one on screen.
        const named = current ? row.label : `${row.label} for ${regionOf(row.region).proseName}`;
        if (seed === 'refused') setNotice({ tone: 'error', text: `Created ${named}, but its starting criteria could not be added — add your own under “Your criteria”.` });
        else if (seed === 'unknown') {
          setNotice({
            tone: 'error',
            text: `Created ${named}, but we could not confirm whether its starting criteria were added — the server did not answer. Reload the page to check before adding your own.`,
          });
        } else setNotice({ tone: 'ok', text: `Created ${named}.` });
      };
      setCreateSaving(true);
      try {
        return await runWrite(
          async (w) => {
            const s = await session();
            if (w.expired()) return null;
            if (typeof s === 'string') return refused(s);
            w.sending();
            const { data, error, status } = await s.supabase
              .from('compare_sets')
              .insert({ user_id: s.user.id, region: effectiveRegion, label, notes: null })
              .select('*')
              .abortSignal(w.signal)
              .single();
            if (w.expired()) return null;
            if (error || !data) {
              if (unanswered(status, error)) return NO_ANSWER;
              if (/compare_sets_cap/.test(error?.message ?? '')) return refused(`You have reached the ${COMPARE_LIMITS.sets}-comparison limit — remove one you no longer need, then create this one.`);
              const generic = 'Could not create the comparison. Please try again.';
              w.refused(generic);
              const why = await fail(generic);
              return w.expired() ? null : refused(why);
            }
            const created = data as CompareSet;
            made.row = created;
            // Seed the six default criteria — all the student's to rename, reweight or remove.
            const {
              data: seeded,
              error: seedError,
              status: seedStatus,
            } = await s.supabase
              .from('compare_criteria')
              .insert(DEFAULT_CRITERIA.map((c) => ({ user_id: s.user.id, set_id: created.id, label: c.label, weight: c.weight })))
              .select('*')
              .abortSignal(w.signal);
            if (w.expired()) return null;
            finish(created, (seeded ?? []) as CompareCriterion[], !seedError ? 'ok' : unanswered(seedStatus, seedError) ? 'unknown' : 'refused');
            return null;
          },
          (how) => {
            // Only the starting criteria went unanswered: the comparison exists — show it.
            if (made.row) {
              finish(made.row, [], 'unknown');
              return null;
            }
            return how.kind === 'unknown' ? unsure() : refused(how.kind === 'unsent' ? CONNECTION_LOST : how.generic);
          },
        );
      } finally {
        // Only this save's own form is unlocked: once a destination change has
        // closed it, the flag belongs to whatever form is open now.
        if (stillOpen()) setCreateSaving(false);
      }
    },
    [effectiveRegion, fail, session],
  );

  const patchSet = useCallback(
    async (id: string, patch: Partial<Pick<CompareSet, 'label' | 'notes'>>, announce?: string): Promise<WriteOutcome> => {
      const before = sets.find((x) => x.id === id);
      if (!before) return null;
      const { settle, unsure } = viewSave(`The settings for ${before.label} were not saved.`);
      setSets((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
      // An unknown outcome rolls back too: the page shows what is known to be saved.
      const rollBack = () => {
        const revert: Partial<CompareSet> = {};
        for (const k of Object.keys(patch) as Array<keyof typeof patch>) (revert as Record<string, unknown>)[k] = before[k];
        setSets((prev) => prev.map((x) => (x.id === id ? { ...x, ...revert } : x)));
      };
      const generic = 'Could not save that change. Please try again.';
      return runWrite(
        async (w) => {
          const s = await session();
          if (w.expired()) return null;
          if (typeof s === 'string') {
            rollBack();
            return settle(s);
          }
          w.sending();
          const { error, status } = await s.supabase.from('compare_sets').update(patch).eq('id', id).eq('user_id', s.user.id).abortSignal(w.signal);
          if (w.expired()) return null;
          if (error) {
            if (unanswered(status, error)) return NO_ANSWER;
            rollBack();
            w.refused(generic);
            const why = await fail(generic);
            return w.expired() ? null : settle(why, generic);
          }
          setSets((prev) => prev.map((x) => (x.id === id ? { ...x, updated_at: new Date().toISOString() } : x)));
          if (announce) setNotice({ tone: 'ok', text: announce });
          return null;
        },
        (how) => {
          rollBack();
          if (how.kind === 'unknown') return unsure(unconfirmed(`the settings for ${before.label} were saved`, SAVE_AGAIN));
          return how.kind === 'unsent' ? settle(CONNECTION_LOST) : settle(how.generic, how.generic);
        },
      );
    },
    [fail, sets, session, viewSave],
  );

  const deleteSet = useCallback(
    async (id: string): Promise<WriteOutcome> => {
      const target = sets.find((x) => x.id === id);
      if (!target) return null;
      const generic = `Could not remove ${target.label}. Please try again.`;
      return runWrite(
        async (w) => {
          const s = await session();
          if (w.expired()) return null;
          if (typeof s === 'string') return s;
          w.sending();
          const { error, status } = await s.supabase.from('compare_sets').delete().eq('id', id).eq('user_id', s.user.id).abortSignal(w.signal);
          if (w.expired()) return null;
          if (error) {
            if (unanswered(status, error)) return NO_ANSWER;
            w.refused(generic);
            return fail(generic);
          }
          const gone = new Set(entries.filter((e) => e.set_id === id).map((e) => e.id));
          setSets((prev) => prev.filter((x) => x.id !== id));
          setCriteria((prev) => prev.filter((c) => c.set_id !== id));
          setEntries((prev) => prev.filter((e) => e.set_id !== id));
          setScores((prev) => prev.filter((sc) => !gone.has(sc.entry_id)));
          setSelectedId(null);
          setNotice({ tone: 'ok', text: `Removed ${target.label}.` });
          newBtnRef.current?.focus();
          return null;
        },
        (how) => (how.kind === 'unknown' ? unconfirmed(`${target.label} was removed`, REMOVE_AGAIN) : how.kind === 'unsent' ? CONNECTION_LOST : how.generic),
      );
    },
    [entries, fail, sets, session],
  );

  const addCriterion = useCallback(
    async (setId: string, label: string): Promise<WriteOutcome> => {
      const into = sets.find((x) => x.id === setId)?.label ?? 'your comparison';
      const { gone, settle, unsure } = viewSave(`The criterion “${label}” was not added to ${into}.`);
      const generic = 'Could not add the criterion. Please try again.';
      return runWrite(
        async (w) => {
          const s = await session();
          if (w.expired()) return null;
          if (typeof s === 'string') return settle(s);
          w.sending();
          const { data, error, status } = await s.supabase
            .from('compare_criteria')
            .insert({ user_id: s.user.id, set_id: setId, label, weight: 3 })
            .select('*')
            .abortSignal(w.signal)
            .single();
          if (w.expired()) return null;
          if (error || !data) {
            if (unanswered(status, error)) return NO_ANSWER;
            if (/compare_criteria_cap/.test(error?.message ?? '')) return settle(`This comparison has reached the ${COMPARE_LIMITS.criteriaPerSet}-criterion limit — remove one to add another.`);
            w.refused(generic);
            const why = await fail(generic);
            return w.expired() ? null : settle(why, generic);
          }
          const row = data as CompareCriterion;
          setCriteria((prev) => [...prev, row]);
          // Saved while its comparison is off screen: say which one it went to.
          setNotice({ tone: 'ok', text: gone() ? `Added criterion ${row.label} to ${into}.` : `Added criterion ${row.label}.` });
          return null;
        },
        (how) =>
          how.kind === 'unknown'
            ? unsure(unconfirmed(`the criterion “${label}” was added to ${into}`, CHECK_FIRST('adding it')))
            : how.kind === 'unsent'
              ? settle(CONNECTION_LOST)
              : settle(how.generic, how.generic),
      );
    },
    [fail, session, sets, viewSave],
  );

  const patchCriterion = useCallback(
    async (id: string, patch: Partial<Pick<CompareCriterion, 'label' | 'weight'>>): Promise<WriteOutcome> => {
      const before = criteria.find((c) => c.id === id);
      if (!before) return null;
      const where = sets.find((x) => x.id === before.set_id)?.label ?? 'your comparison';
      const { settle, unsure } = viewSave(`Your change to the criterion “${before.label}” in ${where} was not saved.`);
      setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
      const rollBack = () => {
        const revert: Partial<CompareCriterion> = {};
        for (const k of Object.keys(patch) as Array<keyof typeof patch>) (revert as Record<string, unknown>)[k] = before[k];
        setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, ...revert } : c)));
      };
      const generic = 'Could not save that change. Please try again.';
      // A weight is re-sent by choosing it again; a rename by saving the name again.
      const unsureText =
        patch.label === undefined
          ? unconfirmed(`the weight of “${before.label}” in ${where} was saved`, CHOOSE_AGAIN)
          : unconfirmed(`your change to the criterion “${before.label}” in ${where} was saved`, SAVE_AGAIN);
      return runWrite(
        async (w) => {
          const s = await session();
          if (w.expired()) return null;
          if (typeof s === 'string') {
            rollBack();
            return settle(s);
          }
          w.sending();
          const { error, status } = await s.supabase.from('compare_criteria').update(patch).eq('id', id).eq('user_id', s.user.id).abortSignal(w.signal);
          if (w.expired()) return null;
          if (error) {
            if (unanswered(status, error)) return NO_ANSWER;
            rollBack();
            w.refused(generic);
            const why = await fail(generic);
            return w.expired() ? null : settle(why, generic);
          }
          return null;
        },
        (how) => {
          rollBack();
          if (how.kind === 'unknown') return unsure(unsureText);
          return how.kind === 'unsent' ? settle(CONNECTION_LOST) : settle(how.generic, how.generic);
        },
      );
    },
    [criteria, fail, session, sets, viewSave],
  );

  const deleteCriterion = useCallback(
    async (id: string): Promise<WriteOutcome> => {
      const target = criteria.find((c) => c.id === id);
      const generic = `Could not remove the criterion${target ? ` ${target.label}` : ''}. Please try again.`;
      return runWrite(
        async (w) => {
          const s = await session();
          if (w.expired()) return null;
          if (typeof s === 'string') return s;
          w.sending();
          const { error, status } = await s.supabase.from('compare_criteria').delete().eq('id', id).eq('user_id', s.user.id).abortSignal(w.signal);
          if (w.expired()) return null;
          if (error) {
            if (unanswered(status, error)) return NO_ANSWER;
            w.refused(generic);
            return fail(generic);
          }
          setCriteria((prev) => prev.filter((c) => c.id !== id));
          setScores((prev) => prev.filter((sc) => sc.criterion_id !== id));
          setNotice({ tone: 'ok', text: `Removed criterion ${target?.label ?? ''}.` });
          return null;
        },
        (how) =>
          how.kind === 'unknown'
            ? unconfirmed(`the criterion${target ? ` “${target.label}”` : ''} was removed`, REMOVE_AGAIN)
            : how.kind === 'unsent'
              ? CONNECTION_LOST
              : how.generic,
      );
    },
    [criteria, fail, session],
  );

  const addEntry = useCallback(
    async (setId: string, input: { college_slug: string | null; name: string; official_url: string | null }): Promise<WriteOutcome> => {
      const into = sets.find((x) => x.id === setId)?.label ?? 'your comparison';
      const { gone, settle, unsure } = viewSave(`${input.name} was not added to ${into}.`);
      const generic = 'Could not add the university. Please try again.';
      return runWrite(
        async (w) => {
          const s = await session();
          if (w.expired()) return null;
          if (typeof s === 'string') return settle(s);
          w.sending();
          const { data, error, status } = await s.supabase
            .from('compare_entries')
            .insert({ user_id: s.user.id, set_id: setId, ...input, note: null })
            .select('*')
            .abortSignal(w.signal)
            .single();
          if (w.expired()) return null;
          if (error || !data) {
            if (unanswered(status, error)) return NO_ANSWER;
            if (/compare_entries_cap/.test(error?.message ?? '')) return settle(`This comparison has reached the ${COMPARE_LIMITS.entriesPerSet}-university limit — remove one to add another.`);
            w.refused(generic);
            const why = await fail(generic);
            return w.expired() ? null : settle(why, generic);
          }
          const row = data as CompareEntry;
          setEntries((prev) => [...prev, row]);
          // Saved while its comparison is off screen: say which one it went to.
          setNotice({ tone: 'ok', text: gone() ? `Added ${row.name} to ${into}.` : `Added ${row.name}.` });
          return null;
        },
        (how) =>
          how.kind === 'unknown'
            ? unsure(unconfirmed(`${input.name} was added to ${into}`, CHECK_FIRST('adding it')))
            : how.kind === 'unsent'
              ? settle(CONNECTION_LOST)
              : settle(how.generic, how.generic),
      );
    },
    [fail, session, sets, viewSave],
  );

  const patchEntry = useCallback(
    async (id: string, patch: Partial<Pick<CompareEntry, 'note'>>): Promise<WriteOutcome> => {
      const before = entries.find((e) => e.id === id);
      if (!before) return null;
      const { settle, unsure } = viewSave(`Your note on ${before.name} was not saved.`);
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
      const rollBack = () => setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, note: before.note } : e)));
      const generic = 'Could not save that note. Please try again.';
      return runWrite(
        async (w) => {
          const s = await session();
          if (w.expired()) return null;
          if (typeof s === 'string') {
            rollBack();
            return settle(s);
          }
          w.sending();
          const { error, status } = await s.supabase.from('compare_entries').update(patch).eq('id', id).eq('user_id', s.user.id).abortSignal(w.signal);
          if (w.expired()) return null;
          if (error) {
            if (unanswered(status, error)) return NO_ANSWER;
            rollBack();
            w.refused(generic);
            const why = await fail(generic);
            return w.expired() ? null : settle(why, generic);
          }
          return null;
        },
        (how) => {
          rollBack();
          if (how.kind === 'unknown') return unsure(unconfirmed(`your note on ${before.name} was saved`, SAVE_AGAIN));
          return how.kind === 'unsent' ? settle(CONNECTION_LOST) : settle(how.generic, how.generic);
        },
      );
    },
    [entries, fail, session, viewSave],
  );

  const deleteEntry = useCallback(
    async (id: string): Promise<WriteOutcome> => {
      const target = entries.find((e) => e.id === id);
      const name = target?.name ?? 'the university';
      const generic = `Could not remove ${name}. Please try again.`;
      return runWrite(
        async (w) => {
          const s = await session();
          if (w.expired()) return null;
          if (typeof s === 'string') return s;
          w.sending();
          const { error, status } = await s.supabase.from('compare_entries').delete().eq('id', id).eq('user_id', s.user.id).abortSignal(w.signal);
          if (w.expired()) return null;
          if (error) {
            if (unanswered(status, error)) return NO_ANSWER;
            w.refused(generic);
            return fail(generic);
          }
          setEntries((prev) => prev.filter((e) => e.id !== id));
          setScores((prev) => prev.filter((sc) => sc.entry_id !== id));
          setNotice({ tone: 'ok', text: `Removed ${name}.` });
          return null;
        },
        (how) => (how.kind === 'unknown' ? unconfirmed(`${name} was removed`, REMOVE_AGAIN) : how.kind === 'unsent' ? CONNECTION_LOST : how.generic),
      );
    },
    [entries, fail, session],
  );

  /**
   * Score one cell (row exists = scored). ONE idempotent upsert on the
   * (entry, criterion) pair — never an insert-or-update decided from a stale
   * closure, so two fast clicks on the same cell can never race two inserts
   * (and re-sending a score whose outcome was unknown can never add a second).
   * Optimistic: the chip fills at once; the server row replaces the draft.
   */
  const setScore = useCallback(
    async (entryId: string, criterionId: string, score: Scale): Promise<WriteOutcome> => {
      const draftId = `draft-${entryId}-${criterionId}`;
      let previous: CompareScore | undefined;
      setScores((prev) => {
        previous = prev.find((sc) => sc.entry_id === entryId && sc.criterion_id === criterionId);
        return previous
          ? prev.map((sc) => (sc.id === previous!.id ? { ...sc, score } : sc))
          : [...prev, { id: draftId, entry_id: entryId, criterion_id: criterionId, score, created_at: '', updated_at: '' }];
      });
      const rollBack = () =>
        setScores((prev) => (previous ? prev.map((sc) => (sc.entry_id === entryId && sc.criterion_id === criterionId ? { ...sc, score: previous!.score } : sc)) : prev.filter((sc) => sc.id !== draftId)));
      const name = entries.find((e) => e.id === entryId)?.name ?? 'this university';
      const on = criteria.find((c) => c.id === criterionId)?.label;
      const generic = 'Could not save that score. Please try again.';
      return runWrite(
        async (w) => {
          const s = await session();
          if (w.expired()) return null;
          if (typeof s === 'string') {
            rollBack();
            return s;
          }
          w.sending();
          const { data, error, status } = await s.supabase
            .from('compare_scores')
            .upsert({ user_id: s.user.id, entry_id: entryId, criterion_id: criterionId, score }, { onConflict: 'entry_id,criterion_id' })
            .select('*')
            .abortSignal(w.signal)
            .single();
          if (w.expired()) return null;
          if (error || !data) {
            if (unanswered(status, error)) return NO_ANSWER;
            rollBack();
            // The per-university cap (migration 0005). The tool cannot reach it —
            // a score always joins a criterion of the university's own comparison —
            // only a university moved to another comparison through the API keeps
            // the scores it had there; removing it and adding it again clears them.
            if (/compare_scores_cap/.test(error?.message ?? '')) {
              return `${name} already has a score for ${COMPARE_LIMITS.criteriaPerSet} criteria, the most one university can hold, so this score was not saved. Remove it from this comparison and add it again to start its scores afresh.`;
            }
            w.refused(generic);
            return fail(generic);
          }
          const row = data as CompareScore;
          setScores((prev) => prev.map((sc) => (sc.entry_id === entryId && sc.criterion_id === criterionId ? row : sc)));
          return null;
        },
        (how) => {
          rollBack();
          if (how.kind === 'unknown') return unconfirmed(`your score for ${name}${on ? ` on “${on}”` : ''} was saved`, CHOOSE_AGAIN);
          return how.kind === 'unsent' ? CONNECTION_LOST : how.generic;
        },
      );
    },
    [criteria, entries, fail, session],
  );

  const clearScore = useCallback(
    async (entryId: string, criterionId: string): Promise<WriteOutcome> => {
      const existing = scores.find((sc) => sc.entry_id === entryId && sc.criterion_id === criterionId);
      if (!existing || existing.id.startsWith('draft-')) return null;
      const generic = 'Could not clear that score. Please try again.';
      return runWrite(
        async (w) => {
          const s = await session();
          if (w.expired()) return null;
          if (typeof s === 'string') return s;
          w.sending();
          // Delete by the pair, not the id: idempotent even if a draft was just replaced.
          const { error, status } = await s.supabase.from('compare_scores').delete().eq('entry_id', entryId).eq('criterion_id', criterionId).eq('user_id', s.user.id).abortSignal(w.signal);
          if (w.expired()) return null;
          if (error) {
            if (unanswered(status, error)) return NO_ANSWER;
            w.refused(generic);
            return fail(generic);
          }
          setScores((prev) => prev.filter((sc) => !(sc.entry_id === entryId && sc.criterion_id === criterionId)));
          return null;
        },
        (how) => (how.kind === 'unknown' ? unconfirmed('that score was cleared', 'Clear it again (clearing it twice does no harm), or reload the page to check.') : how.kind === 'unsent' ? CONNECTION_LOST : how.generic),
      );
    },
    [fail, scores, session],
  );

  const downloadCsv = () => {
    if (!set || !csvFacts) return;
    const setScores = scores.filter((sc) => setEntries_.some((e) => e.id === sc.entry_id));
    const blob = new Blob([compareCsv(set, setEntries_, setCriteriaList, setScores, csvFacts)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `globalstudyboard-comparison-${set.region}-${set.id.slice(0, 8)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setNotice({ tone: 'ok', text: 'Your comparison was downloaded as a CSV file.' });
  };

  // The header toggle would close the new-comparison form: it waits while that form saves.
  const createLocked = creating && createSaving;

  // ── Render ──────────────────────────────────────────────────────────────
  if (load === 'loading') return <ToolSkeleton label="Loading your comparisons…" />;
  if (load === 'signed-out') return <ToolSessionEnded />;
  if (load === 'offline') return <ToolOffline />;
  if (load === 'setup') return <ToolSetup name="The comparison tool" />;
  if (load === 'error') return <ToolLoadError what="comparisons" />;

  return (
    <div className="space-y-5">
      <div className={`${CARD} flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between`}>
        <div className="min-w-0">
          <p className="m-0 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-600">
            <RegionFlag slug={effectiveRegion} className="h-3.5" /> Comparisons for {region.proseName}
          </p>
          <p className="m-0 mt-1 text-sm leading-relaxed text-stone-700">
            Tuned to the destination chosen in the header — change it there to compare universities elsewhere.
            {otherRegions.length > 0 && <> You also have {otherRegions.map(({ region: r, n }) => `${n} for ${r.proseName}`).join(', ')}.</>}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {set && (
            <>
              <Link href={`${reportHref('compare-universities')}?set=${encodeURIComponent(set.id)}`} className={`${BTN_SECONDARY} no-underline`}>
                <FileText className="h-4 w-4" aria-hidden="true" /> Report &amp; PDF
              </Link>
              <button type="button" onClick={downloadCsv} className={BTN_SECONDARY} disabled={setEntries_.length === 0 || !csvFacts}>
                <Download className="h-4 w-4" aria-hidden="true" /> Download CSV
              </button>
            </>
          )}
          <button
            ref={newBtnRef}
            type="button"
            onClick={() => {
              if (!createLocked) setCreating((v) => !v);
            }}
            aria-expanded={creating}
            aria-controls="compare-new-panel"
            aria-disabled={createLocked || undefined}
            className={BTN_PRIMARY}
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> New comparison
          </button>
        </div>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {notice?.tone === 'ok' ? notice.text : ''}
      </p>
      <p role="alert" className={notice?.tone === 'error' ? 'm-0 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800' : 'sr-only'}>
        {notice?.tone === 'error' ? notice.text : ''}
      </p>

      {catalogue.down && (
        // The fact sheets did not load (nothing to do with the session): the
        // student's own comparisons still work; only what needs the list waits.
        <div className={WARN_BOX}>
          {/* Keyed on the failure count: each new failure is announced (a repeat too); a retry in progress changes nothing here — the button says so. */}
          <p role="alert" className="m-0 font-semibold text-ink">
            <span key={catalogue.failures}>{catalogue.failures > 1 ? 'Our university profiles still could not be loaded.' : 'Our university profiles could not be loaded.'}</span>
          </p>
          {/* Read live, as the sister tool does: never claim a comparison, scores or a CSV button that are not on the page. */}
          <p className="m-0 mt-1">
            {!set
              ? 'The search of our profiles needs the list — try again, or reload the page.'
              : setEntries_.length === 0
                ? 'Your comparison is below and still works, and you can add a university yourself. The search of our profiles needs the list — try again, or reload the page.'
                : needsFacts
                  ? 'Your comparison, criteria and scores are below and still work. Each university’s facts, the search of our profiles and Download CSV need the list — try again, or reload the page.'
                  : 'Your comparison, criteria and scores are below and still work, and so does Download CSV. The search of our profiles needs the list — try again, or reload the page.'}{' '}
            You are still signed in, and nothing you saved has changed.
          </p>
          <button
            type="button"
            onClick={() => catalogue.retry(() => (setHeadingRef.current ?? newBtnRef.current)?.focus())}
            className={`${BTN_SECONDARY} mt-3`}
            aria-busy={catalogue.retrying || undefined}
          >
            <RotateCw className={`h-4 w-4 ${catalogue.retrying ? 'motion-safe:animate-spin' : ''}`} aria-hidden="true" /> {catalogue.retrying ? 'Trying again…' : 'Try again'}
          </button>
        </div>
      )}

      {creating && (
        <NewSetForm
          id="compare-new-panel"
          region={region}
          defaultLabel={defaultSetLabel(region.displayName, sets)}
          onCancel={() => {
            setCreating(false);
            newBtnRef.current?.focus();
          }}
          onSubmit={createSet}
        />
      )}

      {regionSets.length > 1 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label={`Your comparisons for ${region.proseName}`}>
          {regionSets.map((x) => {
            const active = set?.id === x.id;
            const n = entries.filter((e) => e.set_id === x.id).length;
            return (
              <button
                key={x.id}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedId(x.id)}
                className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 ${
                  active ? 'border-forest-600 bg-forest-50 text-forest-800' : 'border-stone-300 bg-white text-stone-700 hover:border-forest-300 hover:bg-forest-50/60'
                }`}
              >
                {x.label}
                <span className="rounded-full bg-stone-100 px-1.5 text-xs font-semibold text-stone-700">{n}</span>
              </button>
            );
          })}
        </div>
      )}

      {!set ? (
        <div className={`${CARD} text-center`}>
          <h2 className="font-display text-xl font-bold tracking-editorial text-ink">No comparison for {region.proseName} yet</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-stone-700">
            Put up to {COMPARE_LIMITS.entriesPerSet} universities side by side — our verified facts on top, your own criteria,
            weights and scores underneath. You decide what matters; we assert nothing.
          </p>
          {!creating && (
            // The heading above names the destination; "for {shortName}" read as broken English ("for Middle East").
            <button type="button" onClick={() => setCreating(true)} className={`${BTN_PRIMARY} mt-4`}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Start a comparison
            </button>
          )}
        </div>
      ) : (
        <SetView
          key={set.id}
          set={set}
          region={region}
          criteria={setCriteriaList}
          entries={setEntries_}
          scores={scores}
          facts={facts}
          catalogue={catalogue}
          headingRef={setHeadingRef}
          onPatchSet={patchSet}
          onDeleteSet={() => void deleteSet(set.id).then(report)}
          onAddCriterion={(label) => addCriterion(set.id, label)}
          onPatchCriterion={patchCriterion}
          onDeleteCriterion={(id) => void deleteCriterion(id).then(report)}
          onAddEntry={(input) => addEntry(set.id, input)}
          onPatchEntry={patchEntry}
          onDeleteEntry={(id) => void deleteEntry(id).then(report)}
          onScore={(e, c, v) => void setScore(e, c, v).then(report)}
          onClearScore={(e, c) => void clearScore(e, c).then(report)}
        />
      )}
    </div>
  );
}

// ── New comparison ───────────────────────────────────────────────────────────
function NewSetForm({
  id,
  region,
  defaultLabel: initialLabel,
  onCancel,
  onSubmit,
}: {
  id: string;
  region: Region;
  defaultLabel: string;
  onCancel: () => void;
  /** Resolves to null when it saved, or the reason it did not (shown in the form). */
  onSubmit: (label: string) => Promise<WriteOutcome>;
}) {
  const uid = useId();
  const [label, setLabel] = useState(initialLabel);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const firstRef = useRef<HTMLInputElement>(null);
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
    firstRef.current?.focus();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busyRef.current) return;
    const finalLabel = cleanLine(label, COMPARE_LIMITS.label);
    if (!finalLabel) {
      showError('Give the comparison a name.');
      return;
    }
    setError('');
    busyRef.current = true;
    setBusy(true);
    let why: WriteOutcome = null;
    try {
      why = await onSubmit(finalLabel);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
    if (why) {
      showError(why); // the name stays typed in, ready to try again
    }
  };

  // While the save is in flight the form stays open: × and Cancel wait (shown
  // unavailable, still focusable), so neither can seem to stop a save that then lands.
  const cancel = () => {
    if (!busyRef.current) onCancel();
  };

  return (
    <form id={id} onSubmit={(e) => void submit(e)} className={`${CARD} space-y-4`} aria-labelledby={`${uid}-h`}>
      <div className="flex items-start justify-between gap-3">
        <h2 id={`${uid}-h`} className="font-display text-xl font-bold tracking-editorial text-ink m-0">
          New comparison for {region.proseName}
        </h2>
        <button type="button" onClick={cancel} className={CLOSE_X} aria-label="Close the new-comparison form" aria-disabled={busy || undefined}>
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div>
        <label htmlFor={`${uid}-label`} className={LABEL}>
          Name
        </label>
        <input ref={firstRef} id={`${uid}-label`} value={label} onChange={(e) => setLabel(e.target.value)} maxLength={COMPARE_LIMITS.label} className={INPUT} placeholder="e.g. Engineering shortlist" aria-describedby={`${uid}-help`} />
        <p id={`${uid}-help`} className="m-0 mt-1 text-xs text-stone-600">
          Starts with six criteria you can rename, reweight or remove.
        </p>
      </div>
      <p ref={errorRef} tabIndex={-1} className={`m-0 text-sm text-red-700 outline-none ${error ? '' : 'hidden'}`}>
        {error}
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className={BTN_PRIMARY} aria-busy={busy}>
          {busy ? 'Creating…' : 'Create comparison'}
        </button>
        <button type="button" onClick={cancel} className={BTN_GHOST} aria-disabled={busy || undefined}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── One comparison ───────────────────────────────────────────────────────────
const FACT_ROWS = 10;

function SetView({
  set,
  region,
  criteria,
  entries,
  scores,
  facts,
  catalogue,
  headingRef,
  onPatchSet,
  onDeleteSet,
  onAddCriterion,
  onPatchCriterion,
  onDeleteCriterion,
  onAddEntry,
  onPatchEntry,
  onDeleteEntry,
  onScore,
  onClearScore,
}: {
  set: CompareSet;
  region: Region;
  criteria: CompareCriterion[];
  entries: CompareEntry[];
  scores: CompareScore[];
  facts: Map<string, CompareFacts> | null;
  catalogue: CatalogueStatus;
  headingRef: React.RefObject<HTMLHeadingElement>;
  /** The returning writes resolve to null when they saved, or the reason they did not (each shown beside its control — or, once this view has been replaced, in the app's alert). */
  onPatchSet: (id: string, patch: Partial<Pick<CompareSet, 'label' | 'notes'>>, announce?: string) => Promise<WriteOutcome>;
  onDeleteSet: () => void;
  onAddCriterion: (label: string) => Promise<WriteOutcome>;
  onPatchCriterion: (id: string, patch: Partial<Pick<CompareCriterion, 'label' | 'weight'>>) => Promise<WriteOutcome>;
  onDeleteCriterion: (id: string) => void;
  onAddEntry: (input: { college_slug: string | null; name: string; official_url: string | null }) => Promise<WriteOutcome>;
  onPatchEntry: (id: string, patch: Partial<Pick<CompareEntry, 'note'>>) => Promise<WriteOutcome>;
  onDeleteEntry: (id: string) => void;
  onScore: (entryId: string, criterionId: string, score: Scale) => void;
  onClearScore: (entryId: string, criterionId: string) => void;
}) {
  const uid = useId();
  const [sortOn, setSortOn] = useState(false);
  const [adding, setAdding] = useState(entries.length === 0);
  const [userOpened, setUserOpened] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const addHeadingRef = useRef<HTMLHeadingElement>(null);
  const wasAdding = useRef(false);
  const firstScoreRef = useRef<HTMLInputElement>(null);
  /** A removed university takes its Remove button with it: land on the add control, else the section heading. */
  const removeEntry = (id: string) => {
    onDeleteEntry(id);
    (addBtnRef.current ?? addHeadingRef.current)?.focus();
  };
  const focusFirstScore = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adding && wasAdding.current) addBtnRef.current?.focus();
    wasAdding.current = adding;
  }, [adding]);

  // The 4th university arrives: guide the student to the first score cell.
  useEffect(() => {
    if (focusFirstScore.current && firstScoreRef.current) {
      focusFirstScore.current = false;
      firstScoreRef.current.focus();
    }
  }, [entries.length]);

  const results = useMemo(() => new Map(entries.map((e) => [e.id, entryResult(e, criteria, scores)])), [entries, criteria, scores]);
  const ordered = sortOn ? sortByScore(entries, results) : entries;
  // Scroll cues only when the table really overflows, each chevron only while it can still move.
  const [scrollState, setScrollState] = useState({ canLeft: false, canRight: false });
  // Which chevron holds keyboard focus, and whether the scroller itself does. Neither
  // loses its tab stop while it has focus — `disabled` (or removing tabindex) on the
  // focused element drops focus to <body> (review RH-6; TableScroller's rule).
  const [chevFocus, setChevFocus] = useState<'left' | 'right' | null>(null);
  const [scrollerFocused, setScrollerFocused] = useState(false);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => setScrollState({ canLeft: el.scrollLeft > 1, canRight: el.scrollLeft + el.clientWidth < el.scrollWidth - 1 });
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    // The table too: it widens when the fact sheets arrive, which the scroller's own box never shows.
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [entries.length, criteria.length]);
  const pick = topPick([...results.values()]);
  const full = entries.length >= COMPARE_LIMITS.entriesPerSet;
  const nameOf = (id: string) => entries.find((e) => e.id === id)?.name ?? '';
  const scrollBy = (dir: 1 | -1) => scrollRef.current?.scrollBy({ left: dir * 220, behavior: 'smooth' });
  const tableScrolls = scrollState.canLeft || scrollState.canRight;
  /** The scroller is a tab stop while the table overflows (arrow keys scroll it), and for as long as it holds focus. */
  const scrollStop = tableScrolls || scrollerFocused;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-bold tracking-editorial text-ink m-0 outline-none">
          {set.label}
        </h2>
        <p className="m-0 text-sm text-stone-600">
          {entries.length} of {COMPARE_LIMITS.entriesPerSet} universities · {criteria.length} criteria
        </p>
      </div>

      {/* Add a university */}
      <section aria-labelledby={`${uid}-add-h`} className={`${CARD} space-y-3`}>
        <h3 ref={addHeadingRef} id={`${uid}-add-h`} tabIndex={-1} className="text-sm font-semibold text-ink m-0 outline-none">
          Universities in this comparison
        </h3>
        {full ? (
          <p className="m-0 text-sm text-stone-700">
            You&rsquo;ve added {COMPARE_LIMITS.entriesPerSet} — the most a comparison can hold. Remove one to add another.
          </p>
        ) : adding ? (
          <AddEntryForm
            id={`${uid}-add`}
            region={region}
            facts={facts}
            catalogue={catalogue}
            existingSlugs={new Set(entries.map((e) => e.college_slug).filter((x): x is string => Boolean(x)))}
            autoFocus={userOpened}
            onSubmit={async (input) => {
              const why = await onAddEntry(input);
              if (!why && entries.length + 1 >= COMPARE_LIMITS.entriesPerSet && criteria.length > 0) {
                focusFirstScore.current = true;
                setAdding(false);
              }
              return why;
            }}
            onClose={() => {
              setAdding(false);
              setUserOpened(false);
            }}
          />
        ) : (
          <button
            ref={addBtnRef}
            type="button"
            onClick={() => {
              setUserOpened(true);
              setAdding(true);
            }}
            className={BTN_SECONDARY}
            aria-expanded={false}
            aria-controls={`${uid}-add`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Add a university
          </button>
        )}
      </section>

      {entries.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            {tableScrolls && <p className="m-0 text-xs text-stone-600">Scroll sideways to see all your universities.</p>}
            <div className="ml-auto flex items-center gap-2">
              {/* Below two universities there is nothing to sort: unavailable, and never shown as pressed. */}
              <button
                type="button"
                aria-pressed={sortOn && entries.length >= 2}
                onClick={() => setSortOn((v) => !v)}
                className={`${BTN_GHOST} ${sortOn && entries.length >= 2 ? 'bg-forest-50 text-forest-800' : ''}`}
                disabled={entries.length < 2}
              >
                <ArrowDownWideNarrow className="h-4 w-4" aria-hidden="true" /> Sort by your score
              </button>
              {/* A table that fits needs no chevrons: `disabled` (no tab stops) — but never while a chevron holds
                  focus (the table can stop overflowing under it: a wider window, zoom out, a rotated tablet).
                  A chevron that cannot move — at an end, or kept focusable that way — is aria-disabled and a
                  press does nothing; `disabled` applies only once focus has left, so it never drops to <body>. */}
              <button
                type="button"
                onClick={() => scrollState.canLeft && scrollBy(-1)}
                onFocus={() => setChevFocus('left')}
                onBlur={() => setChevFocus((f) => (f === 'left' ? null : f))}
                className={ICON_BTN}
                aria-label="Scroll the table left"
                disabled={!tableScrolls && chevFocus !== 'left'}
                aria-disabled={!scrollState.canLeft || undefined}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => scrollState.canRight && scrollBy(1)}
                onFocus={() => setChevFocus('right')}
                onBlur={() => setChevFocus((f) => (f === 'right' ? null : f))}
                className={ICON_BTN}
                aria-label="Scroll the table right"
                disabled={!tableScrolls && chevFocus !== 'right'}
                aria-disabled={!scrollState.canRight || undefined}
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="relative">
            <div
              ref={scrollRef}
              // Only the scroller itself counts: focus on a control inside a cell never holds the tab stop.
              onFocus={(e) => {
                if (e.target === e.currentTarget) setScrollerFocused(true);
              }}
              onBlur={(e) => {
                if (e.target === e.currentTarget) setScrollerFocused(false);
              }}
              {...(scrollStop ? { tabIndex: 0, role: 'region', 'aria-label': 'Comparison table' } : {})}
              className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
            >
              <table className="w-full border-collapse text-sm">
                <caption className="sr-only">
                  {set.label}: our verified facts for each university, then your own criteria, weights and scores.
                </caption>
                <thead>
                  <tr className="border-b border-stone-200 bg-cream-50">
                    <th scope="col" className={`${TH_ROW} bg-cream-50`}>
                      <span className="sr-only">Row</span>
                    </th>
                    {ordered.map((e) => (
                      <th key={e.id} scope="col" className={`${TD} bg-cream-50 font-display text-base font-bold text-ink`}>
                        <span className="block">{e.name}</span>
                        <span className="mt-1.5 flex flex-wrap items-center gap-2">
                          {e.college_slug && (
                            <Link href={`/colleges/${e.college_slug}`} className="text-xs font-semibold text-forest-700 underline underline-offset-2 hover:text-forest-800">
                              View full profile
                            </Link>
                          )}
                          <button type="button" onClick={() => removeEntry(e.id)} className={`${ICON_BTN} h-8 w-8`} aria-label={`Remove ${e.name} from this comparison`}>
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* ── Our verified facts ── */}
                  <tr>
                    <th scope="row" colSpan={ordered.length + 1} className="bg-forest-50/70 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-forest-800">
                      {/* The cell spans the table; the words stick, so they stay readable while the table scrolls sideways. */}
                      <span className="sticky left-3 inline-block">
                        Our verified facts <span className="hidden font-normal normal-case tracking-normal text-stone-600 sm:inline">— as published on each profile</span>
                      </span>
                    </th>
                  </tr>
                  <FactRows ordered={ordered} facts={facts} factsDown={catalogue.down} />
                  {/* ── Your own comparison ── */}
                  <tr>
                    <th scope="row" colSpan={ordered.length + 1} className="border-t-2 border-forest-200 bg-cream-100 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-ink">
                      <span className="sticky left-3 inline-block">
                        Your own comparison <span className="hidden font-normal normal-case tracking-normal text-stone-600 sm:inline">— your criteria, your weights, your scores</span>
                      </span>
                    </th>
                  </tr>
                  {criteria.map((c, ci) => (
                    <tr key={c.id} className="border-t border-stone-100">
                      <th scope="row" className={TH_ROW}>
                        <CriterionHeader criterion={c} onPatch={onPatchCriterion} onDelete={() => onDeleteCriterion(c.id)} />
                      </th>
                      {ordered.map((e, ei) => {
                        const current = scores.find((sc) => sc.entry_id === e.id && sc.criterion_id === c.id)?.score;
                        return (
                          <td key={e.id} className={TD}>
                            <ScoreCell
                              entry={e}
                              criterion={c}
                              value={current && isScale(current) ? current : null}
                              firstRef={ci === 0 && ei === 0 ? firstScoreRef : undefined}
                              onChange={(v) => onScore(e.id, c.id, v)}
                              onClear={() => onClearScore(e.id, c.id)}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="border-t border-stone-200 bg-cream-50/60">
                    <th scope="row" className={`${TH_ROW} bg-cream-50/60`}>
                      Your score
                      <span className="mt-1 block text-[11px] font-normal leading-snug text-stone-600">
                        Arithmetic on your own ratings and weights — not our assessment of any university and not a prediction
                        of admission.
                      </span>
                    </th>
                    {ordered.map((e) => (
                      <td key={e.id} className={`${TD} bg-cream-50/60`}>
                        <ResultCell result={results.get(e.id)!} />
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-stone-100">
                    <th scope="row" className={TH_ROW}>
                      Your note
                      <span className="mt-1 block text-[11px] font-normal leading-snug text-stone-600">Private — no personal details.</span>
                    </th>
                    {ordered.map((e) => (
                      <td key={e.id} className={TD}>
                        <NoteCell entry={e} onSave={(note) => onPatchEntry(e.id, { note })} />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            {scrollState.canRight && <div className="pointer-events-none absolute inset-y-0 right-0 w-8 rounded-r-2xl bg-gradient-to-l from-white to-transparent" aria-hidden="true" />}
          </div>
          <p className="m-0 text-xs leading-relaxed text-stone-600">
            Source for the facts: each university&rsquo;s official website. Details here are for guidance only — tuition,
            deadlines, rankings and eligibility change every academic year, so confirm on the official university site before
            applying.
          </p>

          {pick && (
            <div className="rounded-2xl border border-forest-200 bg-forest-50 p-4 text-sm text-ink">
              {pick.entryIds.length > 1 ? (
                <>
                  <span className="font-semibold">Tied, by your own weights:</span> {pick.entryIds.map(nameOf).join(' and ')} ({pick.percent}%).
                </>
              ) : (
                <>
                  <span className="font-semibold">Your top pick — by your own weights:</span> {nameOf(pick.entryIds[0])} ({pick.percent}%).
                </>
              )}
              <span className="mt-1 block text-xs text-stone-700">Your own top pick, by your own weights — not our recommendation.</span>
            </div>
          )}

          <details className="rounded-2xl border border-stone-200 bg-white px-5 py-3">
            <summary className="cursor-pointer text-sm font-semibold text-ink">How your score is calculated</summary>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">
              For each university we multiply every criterion&rsquo;s weight (1–5) by the score you gave it (1–5), add those
              up, and divide by the most points possible for the criteria you have scored — so a university you have only
              partly scored is not penalised for the blanks. The arithmetic is printed under each result. Nothing here is our
              view of any university; it is your weights applied to your scores.
            </p>
          </details>
        </>
      )}

      {/* Criteria editor */}
      <section aria-labelledby={`${uid}-crit-h`} className={`${CARD} space-y-3`}>
        <h3 id={`${uid}-crit-h`} className="text-sm font-semibold text-ink m-0">
          Your criteria
        </h3>
        <p className="m-0 text-xs leading-relaxed text-stone-600">
          Weights and scores are yours — we don&rsquo;t set, verify or suggest any of them. Edit a criterion&rsquo;s name or weight in the
          table; add your own below (up to {COMPARE_LIMITS.criteriaPerSet}).
        </p>
        <AddCriterionForm disabled={criteria.length >= COMPARE_LIMITS.criteriaPerSet} onSubmit={onAddCriterion} />
      </section>

      <SetSettings set={set} onPatch={onPatchSet} onDelete={onDeleteSet} />
    </div>
  );
}

// ── Fact rows ────────────────────────────────────────────────────────────────
function FactRows({ ordered, facts, factsDown }: { ordered: CompareEntry[]; facts: Map<string, CompareFacts> | null; factsDown: boolean }) {
  const cell = (e: CompareEntry, render: (f: CompareFacts) => React.ReactNode, rowIndex: number) => {
    const f = e.college_slug ? facts?.get(e.college_slug) : undefined;
    if (f) {
      return (
        <td key={e.id} className={TD}>
          {render(f)}
        </td>
      );
    }
    // No facts to show: ONE cell down the whole facts block, saying why — never
    // blanks beside filled cells (a blank reads as a failed lookup), never the
    // same words ten times over. A typed-in university has none; a profile no
    // longer in the catalogue is "not found"; a failed fetch is a failure, not a
    // missing profile.
    if (rowIndex !== 0) return null;
    const loading = Boolean(e.college_slug) && !facts && !factsDown;
    const why = !e.college_slug
      ? 'Added by you — we hold no verified facts for this one; only your own scores below apply.'
      : facts
        ? `${PROFILE_NOT_FOUND}.`
        : factsDown
          ? 'The facts for this university could not be loaded.'
          : 'Loading the facts…';
    return (
      <td key={e.id} rowSpan={FACT_ROWS} className={`${TD} bg-stone-50 text-stone-600`}>
        {why}
        {!loading && e.official_url && (
          <span className="mt-2 block">
            <a href={e.official_url} target="_blank" rel="noopener noreferrer" className={LINK}>
              Official site <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </span>
        )}
      </td>
    );
  };
  const rows: Array<{ label: React.ReactNode; render: (f: CompareFacts) => React.ReactNode }> = [
    {
      label: (
        <>
          Rankings
          <span className="mt-1 block text-[11px] font-normal leading-snug text-stone-600">As published by each body.</span>
        </>
      ),
      render: (f) =>
        f.rankings.length ? (
          <ul className="m-0 list-none space-y-1 p-0">
            {f.rankings.map((r) => (
              <li key={r.body}>
                <span className="font-semibold text-ink">#{r.rank}</span>{' '}
                <a href={r.url} target="_blank" rel="noopener noreferrer" className={LINK}>
                  {r.body} <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-stone-500">No ranking on the profile</span>
        ),
    },
    { label: 'Location', render: (f) => f.place },
    { label: 'Type', render: (f) => f.type },
    {
      label: 'Admission tests accepted',
      render: (f) => (
        <ul className="m-0 list-disc space-y-0.5 pl-4">
          {f.admissionTests.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      ),
    },
    { label: 'Application platform', render: (f) => f.applicationPlatform ?? <span className="text-stone-500">Not stated on the profile</span> },
    { label: 'Programme levels', render: (f) => f.levels.join(', ') },
    { label: 'Language of instruction', render: (f) => (f.englishTaught ? 'English-taught' : 'Local language') },
    { label: 'Established', render: (f) => String(f.established) },
    {
      label: 'Courses',
      render: (f) => (
        <details>
          <summary className="cursor-pointer text-forest-700">
            {f.courses.length} course area{f.courses.length === 1 ? '' : 's'}
          </summary>
          <ul className="m-0 mt-1 list-disc space-y-0.5 pl-4">
            {f.courses.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </details>
      ),
    },
    {
      label: 'Links',
      render: (f) => (
        <span className="flex flex-wrap items-center gap-2">
          {f.url && (
            <a href={f.url} target="_blank" rel="noopener noreferrer" className={LINK}>
              Official site <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          )}
          <AddToPlannerButton slug={f.slug} name={f.name} region={f.region} url={f.url} />
        </span>
      ),
    },
  ];
  return (
    <>
      {rows.map((row, i) => (
        <tr key={i} className="border-t border-stone-100">
          <th scope="row" className={TH_ROW}>
            {row.label}
            {i === 0 && <span className="mt-1 block text-[11px] font-normal leading-snug text-stone-600">{RANKING_NUDGE}</span>}
          </th>
          {ordered.map((e) => cell(e, row.render, i))}
        </tr>
      ))}
    </>
  );
}

// ── A 1–5 radio group (scores and weights share one look) ────────────────────
function FiveScale({
  name,
  legend,
  value,
  hints,
  firstRef,
  onChange,
}: {
  name: string;
  legend: string;
  value: Scale | null;
  hints: Record<Scale, string>;
  firstRef?: React.RefObject<HTMLInputElement>;
  onChange: (v: Scale) => void;
}) {
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="sr-only">{legend}</legend>
      <div className="flex gap-1">
        {SCALE.map((n) => (
          <label key={n} className="relative block h-7 w-7" title={hints[n]}>
            {/* The real radio is invisible but FULL-SIZE over its chip, so the
                hit target, the focus ring and the announced control coincide
                (a 1px clipped input would sit beside the chip, not on it). */}
            <input
              ref={n === 1 ? firstRef : undefined}
              type="radio"
              name={name}
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              className="peer absolute inset-0 m-0 h-full w-full cursor-pointer opacity-0"
              aria-label={`${n} — ${hints[n]}`}
            />
            <span className="pointer-events-none flex h-7 w-7 items-center justify-center rounded-full border border-stone-300 bg-white text-xs font-semibold text-stone-700 transition-colors peer-hover:border-forest-400 peer-checked:border-forest-700 peer-checked:bg-forest-700 peer-checked:text-cream-50 peer-focus-visible:ring-2 peer-focus-visible:ring-forest-500 peer-focus-visible:ring-offset-1">
              {n}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function ScoreCell({
  entry,
  criterion,
  value,
  firstRef,
  onChange,
  onClear,
}: {
  entry: CompareEntry;
  criterion: CompareCriterion;
  value: Scale | null;
  firstRef?: React.RefObject<HTMLInputElement>;
  onChange: (v: Scale) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <FiveScale name={`score-${entry.id}-${criterion.id}`} legend={`Your score for ${criterion.label} — ${entry.name}`} value={value} hints={SCORE_HINT} firstRef={firstRef} onChange={onChange} />
      {value !== null ? (
        <button type="button" onClick={onClear} className="text-[11px] text-stone-600 underline underline-offset-2 hover:text-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 rounded" aria-label={`Clear your score for ${criterion.label} — ${entry.name}`}>
          Clear
        </button>
      ) : (
        <span className="text-[11px] text-stone-500">Not scored</span>
      )}
    </div>
  );
}

function ResultCell({ result }: { result: EntryResult }) {
  if (result.percent === null) return <span className="text-sm text-stone-500">Not scored yet</span>;
  return (
    <div>
      <span className="font-display text-2xl font-bold text-ink">{result.percent}%</span>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-stone-100" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={result.percent} aria-label="Your score">
        <div className="h-full rounded-full bg-forest-600 motion-safe:transition-[width]" style={{ width: `${result.percent}%` }} />
      </div>
      {result.scored < result.total && (
        <p className="m-0 mt-1 text-[11px] text-stone-600">
          Based on {result.scored} of {result.total} of your criteria.
        </p>
      )}
      <p className="m-0 mt-1 break-words text-[11px] leading-snug text-stone-600">{result.formula}</p>
    </div>
  );
}

// ── Criterion header (rename + weight + remove) ─────────────────────────────
function CriterionHeader({
  criterion,
  onPatch,
  onDelete,
}: {
  criterion: CompareCriterion;
  onPatch: (id: string, patch: Partial<Pick<CompareCriterion, 'label' | 'weight'>>) => Promise<WriteOutcome>;
  onDelete: () => void;
}) {
  const uid = useId();
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(criterion.label);
  const [renameError, setRenameError] = useState('');
  const [weightError, setWeightError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const saving = useRef(false);
  const editBtnRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const removeBtnRef = useRef<HTMLButtonElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const wasEditing = useRef(false);
  const confirmWasOpen = useRef(false);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
    else if (wasEditing.current) editBtnRef.current?.focus();
    wasEditing.current = editing;
  }, [editing]);

  useEffect(() => {
    if (confirm) confirmBtnRef.current?.focus();
    else if (confirmWasOpen.current) removeBtnRef.current?.focus();
    confirmWasOpen.current = confirm;
  }, [confirm]);

  const save = async () => {
    if (saving.current) return; // blur after submit (or unmount) must not save twice
    const finalLabel = cleanLine(label, COMPARE_LIMITS.criterionLabel);
    if (!finalLabel) {
      setLabel(criterion.label);
      setRenameError('');
      setEditing(false);
      return;
    }
    if (finalLabel === criterion.label) {
      setRenameError('');
      setEditing(false);
      return;
    }
    saving.current = true;
    try {
      const why = await onPatch(criterion.id, { label: finalLabel });
      if (!why) {
        setRenameError('');
        setEditing(false);
      } else {
        // A refusal left the old name stored, so Escape keeps it. An unknown
        // outcome may have stored the new one: Escape only closes the editor.
        setRenameError(isUnconfirmed(why) ? `${why} Press Escape to close the editor.` : `${why} Or press Escape to keep the old name.`);
        inputRef.current?.focus();
      }
    } finally {
      saving.current = false;
    }
  };

  return (
    <div className="space-y-1.5">
      {editing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
          className="flex items-center gap-1"
        >
          <label htmlFor={`${uid}-l`} className="sr-only">
            Criterion name
          </label>
          <input
            ref={inputRef}
            id={`${uid}-l`}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={COMPARE_LIMITS.criterionLabel}
            className={`${INPUT} h-8 text-sm`}
            aria-invalid={renameError ? true : undefined}
            aria-describedby={renameError ? `${uid}-err` : undefined}
            onBlur={() => void save()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                // A rename in flight finishes first: closing the editor now would let its answer close one reopened meanwhile.
                if (saving.current) return;
                setLabel(criterion.label);
                setRenameError('');
                setEditing(false);
              }
            }}
          />
          {renameError && (
            <p id={`${uid}-err`} role="alert" className="m-0 text-[11px] text-red-700">
              {renameError}
            </p>
          )}
        </form>
      ) : (
        <span className="block">
          <span className="block break-words font-semibold leading-snug">{criterion.label}</span>
          <span className="mt-0.5 flex items-center">
            <button ref={editBtnRef} type="button" onClick={() => setEditing(true)} className="-ml-1 rounded px-1 text-[11px] font-medium text-forest-700 underline underline-offset-2 hover:text-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500" aria-label={`Rename ${criterion.label}`}>
              Rename
            </button>
            {confirm ? (
              <>
                <button ref={confirmBtnRef} type="button" onClick={onDelete} className="rounded px-1 text-[11px] font-semibold text-red-700 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                  Remove
                </button>
                <button type="button" onClick={() => setConfirm(false)} className="rounded px-1 text-[11px] text-stone-700 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500">
                  Keep
                </button>
              </>
            ) : (
              <button ref={removeBtnRef} type="button" onClick={() => setConfirm(true)} className="rounded px-1 text-[11px] text-stone-600 underline underline-offset-2 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500" aria-label={`Remove criterion ${criterion.label}`}>
                Remove
              </button>
            )}
          </span>
        </span>
      )}
      <div>
        <span className="block text-[11px] font-normal uppercase tracking-wide text-stone-600">Weight</span>
        <FiveScale
          name={`weight-${criterion.id}`}
          legend={`Weight of ${criterion.label} (how much it matters to you)`}
          value={isScale(criterion.weight) ? criterion.weight : 3}
          hints={WEIGHT_HINT}
          onChange={(w) => {
            setWeightError('');
            void onPatch(criterion.id, { weight: w }).then((why) => setWeightError(why ?? ''));
          }}
        />
        <p role="alert" className={`m-0 mt-1 text-[11px] font-normal leading-snug text-red-700 ${weightError ? '' : 'sr-only'}`}>
          {weightError}
        </p>
      </div>
    </div>
  );
}

// ── Per-university note ──────────────────────────────────────────────────────
function NoteCell({ entry, onSave }: { entry: CompareEntry; onSave: (note: string | null) => Promise<WriteOutcome> }) {
  const uid = useId();
  const [note, setNote] = useState(entry.note ?? '');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const dirty = cleanLine(note, COMPARE_LIMITS.note) !== (entry.note ?? '');
  const save = async () => {
    const clean = cleanLine(note, COMPARE_LIMITS.note);
    if (clean === (entry.note ?? '')) return;
    setError('');
    const why = await onSave(clean || null);
    // On failure the note stays typed in and "Save note" stays offered.
    if (why) setError(why);
    else setSaved(true);
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
      className="space-y-1"
    >
      <label htmlFor={`${uid}-n`} className="sr-only">
        Your note on {entry.name}
      </label>
      <input
        id={`${uid}-n`}
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          setSaved(false);
        }}
        onBlur={() => void save()}
        maxLength={COMPARE_LIMITS.note}
        className={`${INPUT} h-9 text-sm`}
        placeholder="e.g. strong AI lab, far from family"
      />
      {dirty ? (
        <button type="submit" className={`${BTN_GHOST} h-8 text-xs`}>
          Save note
        </button>
      ) : saved ? (
        <span className="block text-[11px] text-stone-600">Saved.</span>
      ) : null}
      <p role="alert" className={`m-0 text-[11px] leading-snug text-red-700 ${error ? '' : 'sr-only'}`}>
        {error}
      </p>
    </form>
  );
}

// ── One form's error line ────────────────────────────────────────────────────
/**
 * A form's error line, announced exactly ONCE (review A11Y-5): the line has
 * no role="alert" (an alert that also takes focus is read twice) — focus, or
 * one polite status, is the cue — and every focus move happens AFTER the render
 * that shows the words (a synchronous focus() runs before React commits them,
 * so a screen reader would hear nothing). The same rule as the new-comparison
 * form, with one addition for a field the student can fix:
 *   - `showError` — a failure no field is to blame for (the save's answer):
 *     the message itself takes focus;
 *   - `showFieldError` — a field left empty or malformed: the field is marked
 *     aria-invalid with the message as its description (`describe`), and focus
 *     goes to the field; if the field already holds focus (Enter pressed in it)
 *     a focus() would change nothing and be announced by nothing, so the words
 *     go to a polite status instead (`spoken`, rendered by the form).
 * A tick re-runs the focus for an identical repeated message.
 */
function useFormError() {
  const errorRef = useRef<HTMLParagraphElement>(null);
  const [error, setError] = useState<{ text: string; field: string | null } | null>(null);
  const [spoken, setSpoken] = useState<{ text: string; seq: number } | null>(null);
  const [tick, setTick] = useState(0);
  const target = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (tick) target.current?.focus();
  }, [tick]);
  const showError = (text: string) => {
    setError({ text, field: null });
    target.current = errorRef.current;
    setTick((n) => n + 1);
  };
  const showFieldError = (text: string, field: string, el: HTMLElement | null) => {
    setError({ text, field });
    if (el && el === document.activeElement) {
      setSpoken((prev) => ({ text, seq: (prev?.seq ?? 0) + 1 }));
      return;
    }
    target.current = el;
    setTick((n) => n + 1);
  };
  const clearError = () => {
    setError(null);
    setSpoken(null);
  };
  /** The attributes for a field: invalid, and described by the message, only while the message is about it. */
  const describe = (field: string, errorId: string) =>
    error?.field === field ? { 'aria-invalid': true as const, 'aria-describedby': errorId } : {};
  return { errorRef, error: error?.text ?? '', errorField: error?.field ?? null, showError, showFieldError, clearError, describe, spoken };
}

/** The polite status a form speaks a field error through when that field already had focus (see useFormError). */
function SpokenError({ spoken }: { spoken: { text: string; seq: number } | null }) {
  return (
    <p role="status" className="sr-only">
      {spoken && <span key={spoken.seq}>{spoken.text}</span>}
    </p>
  );
}

// ── Add a criterion ──────────────────────────────────────────────────────────
function AddCriterionForm({ disabled, onSubmit }: { disabled: boolean; onSubmit: (label: string) => Promise<WriteOutcome> }) {
  const uid = useId();
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const limitRef = useRef<HTMLParagraphElement>(null);
  const { errorRef, error, errorField, showError, showFieldError, clearError, describe, spoken } = useFormError();

  // Adding the last criterion allowed disables the field and the button that
  // held focus: focus the message that says why, never let it fall to <body>.
  // Only on that change — a comparison that opens already full takes no focus.
  const wasDisabled = useRef(disabled);
  useEffect(() => {
    const became = disabled && !wasDisabled.current;
    wasDisabled.current = disabled;
    if (!became) return;
    const now = document.activeElement;
    if (!now || now === document.body || formRef.current?.contains(now)) limitRef.current?.focus();
  }, [disabled]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busyRef.current || disabled) return;
    const finalLabel = cleanLine(label, COMPARE_LIMITS.criterionLabel);
    if (!finalLabel) {
      showFieldError('Name the criterion.', 'label', inputRef.current);
      return;
    }
    clearError();
    busyRef.current = true;
    setBusy(true);
    let why: WriteOutcome = null;
    try {
      why = await onSubmit(finalLabel);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
    if (!why) {
      setLabel('');
      inputRef.current?.focus();
    } else {
      showError(why); // the name stays typed in, ready to try again
    }
  };

  return (
    <form ref={formRef} onSubmit={(e) => void submit(e)} className="flex flex-wrap items-end gap-2">
      <div className="min-w-[14rem] flex-1">
        <label htmlFor={`${uid}-c`} className={LABEL}>
          Add a criterion
        </label>
        <input
          ref={inputRef}
          id={`${uid}-c`}
          value={label}
          onChange={(e) => {
            setLabel(e.target.value);
            if (errorField === 'label') clearError();
          }}
          maxLength={COMPARE_LIMITS.criterionLabel}
          className={INPUT}
          placeholder="e.g. Research in my field"
          disabled={disabled}
          {...describe('label', `${uid}-err`)}
        />
      </div>
      <button type="submit" className={BTN_SECONDARY} disabled={disabled} aria-busy={busy}>
        <Plus className="h-4 w-4" aria-hidden="true" /> {busy ? 'Adding…' : 'Add'}
      </button>
      <p ref={errorRef} id={`${uid}-err`} tabIndex={-1} className={`m-0 w-full text-sm text-red-700 outline-none ${error ? '' : 'hidden'}`}>
        {error}
      </p>
      <SpokenError spoken={spoken} />
      {disabled && (
        <p ref={limitRef} tabIndex={-1} className="m-0 w-full text-xs text-stone-600 outline-none">
          This comparison has reached the {COMPARE_LIMITS.criteriaPerSet}-criterion limit.
        </p>
      )}
    </form>
  );
}

// ── Add a university ─────────────────────────────────────────────────────────
function AddEntryForm({
  id,
  region,
  facts,
  catalogue,
  existingSlugs,
  autoFocus,
  onSubmit,
  onClose,
}: {
  id: string;
  region: Region;
  facts: Map<string, CompareFacts> | null;
  catalogue: CatalogueStatus;
  existingSlugs: Set<string>;
  autoFocus: boolean;
  /** Resolves to null when it saved, or the reason it did not (shown in the form). */
  onSubmit: (input: { college_slug: string | null; name: string; official_url: string | null }) => Promise<WriteOutcome>;
  onClose: () => void;
}) {
  const uid = useId();
  const [mode, setMode] = useState<'catalogue' | 'custom'>('catalogue');
  const [query, setQuery] = useState('');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const { errorRef, error, errorField, showError, showFieldError, clearError, describe, spoken } = useFormError();

  useEffect(() => {
    if (autoFocus) (mode === 'catalogue' ? searchRef : nameRef).current?.focus();
  }, [autoFocus, mode]);

  // This destination's profiles only (region in context).
  const pool = useMemo(() => (facts ? [...facts.values()].filter((f) => f.region === region.slug) : null), [facts, region.slug]);
  const results = useMemo(() => {
    if (!pool) return [];
    const q = query.trim().toLowerCase();
    const tokens = q.split(/\s+/).filter(Boolean);
    const list = q.length < 2 ? pool : pool.filter((f) => tokens.every((t) => `${f.name} ${f.place}`.toLowerCase().includes(t)));
    return list.slice(0, 8);
  }, [pool, query]);

  const pickProfile = async (f: CompareFacts) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    clearError();
    let why: WriteOutcome = null;
    try {
      why = await onSubmit({ college_slug: f.slug, name: f.name, official_url: f.url });
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
    if (!why) {
      setQuery('');
      searchRef.current?.focus();
    } else {
      showError(why);
    }
  };

  const submitCustom = async (e: FormEvent) => {
    e.preventDefault();
    if (busyRef.current) return;
    const finalName = cleanLine(name, COMPARE_LIMITS.entryName);
    if (!finalName) {
      showFieldError('Enter the university name.', 'name', nameRef.current);
      return;
    }
    const finalUrl = url.trim() ? cleanUrl(url) : '';
    if (url.trim() && !finalUrl) {
      // The link is the field at fault: focus goes there, with the message as its description.
      showFieldError('The official link must start with https:// and contain no spaces.', 'url', urlRef.current);
      return;
    }
    clearError();
    busyRef.current = true;
    setBusy(true);
    let why: WriteOutcome = null;
    try {
      why = await onSubmit({ college_slug: null, name: finalName, official_url: finalUrl || null });
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
    if (!why) {
      setName('');
      setUrl('');
      nameRef.current?.focus();
    } else {
      showError(why); // what was typed stays in the form, ready to try again
    }
  };

  const tabBtn = (active: boolean) =>
    `inline-flex h-9 items-center rounded-full border px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 ${
      active ? 'border-forest-600 bg-forest-50 text-forest-800' : 'border-stone-300 bg-white text-stone-700 hover:border-forest-300'
    }`;

  return (
    <div id={id} className="rounded-xl border border-forest-200 bg-forest-50/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="How to add">
          <button type="button" aria-pressed={mode === 'catalogue'} onClick={() => setMode('catalogue')} className={tabBtn(mode === 'catalogue')}>
            From our profiles
          </button>
          <button type="button" aria-pressed={mode === 'custom'} onClick={() => setMode('custom')} className={tabBtn(mode === 'custom')}>
            Add your own
          </button>
        </div>
        {/* While a university is being added the form stays open: × waits (shown unavailable, still focusable), so it cannot seem to stop that save. */}
        <button
          type="button"
          onClick={() => {
            if (!busyRef.current) onClose();
          }}
          className={CLOSE_X}
          aria-label="Close the add-university form"
          aria-disabled={busy || undefined}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {mode === 'catalogue' ? (
        <div className="mt-3">
          <label htmlFor={`${uid}-q`} className={LABEL}>
            Search universities in {region.proseName}
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" aria-hidden="true" />
            <input ref={searchRef} id={`${uid}-q`} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="University or city" autoComplete="off" className={`${INPUT} pl-9`} aria-describedby={`${uid}-qhelp`} />
          </div>
          <p id={`${uid}-qhelp`} className="mt-1 text-xs text-stone-600">
            {pool
              ? `${results.length} of ${pool.length} profiles shown — pick one to add it.`
              : catalogue.down
                ? // A failed list is said so — never "0 of 0", which would read as no profiles for this destination.
                  'Our university profiles could not be loaded, so there is nothing to search yet.'
                : 'Loading the university list…'}
          </p>
          {catalogue.down && (
            <button
              type="button"
              onClick={() => catalogue.retry(() => searchRef.current?.focus())}
              className={`${BTN_GHOST} mt-1`}
              aria-busy={catalogue.retrying || undefined}
            >
              <RotateCw className={`h-4 w-4 ${catalogue.retrying ? 'motion-safe:animate-spin' : ''}`} aria-hidden="true" /> {catalogue.retrying ? 'Trying again…' : 'Try again'}
            </button>
          )}
          {results.length > 0 && (
            <ul className="mt-1 list-none divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200 bg-white p-0 m-0 shadow-sm">
              {results.map((f) => {
                const already = existingSlugs.has(f.slug);
                return (
                  <li key={f.slug}>
                    <button
                      type="button"
                      disabled={already || busy}
                      onClick={() => void pickProfile(f)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-forest-50 focus-visible:bg-forest-50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <RegionFlag slug={f.region} />
                      <span className="min-w-0">
                        <span className="block font-semibold text-ink">{f.name}</span>
                        <span className="block text-xs text-stone-600">
                          {f.place}
                          {already ? ' · already in this comparison' : ''}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : (
        <form onSubmit={(e) => void submitCustom(e)} className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={`${uid}-name`} className={LABEL}>
              University name
            </label>
            <input
              ref={nameRef}
              id={`${uid}-name`}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorField === 'name') clearError();
              }}
              maxLength={COMPARE_LIMITS.entryName}
              className={INPUT}
              {...describe('name', `${uid}-err`)}
            />
          </div>
          <div>
            <label htmlFor={`${uid}-url`} className={LABEL}>
              Official website <span className="font-normal normal-case tracking-normal text-stone-500">(optional, https://)</span>
            </label>
            <input
              ref={urlRef}
              id={`${uid}-url`}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (errorField === 'url') clearError();
              }}
              inputMode="url"
              maxLength={COMPARE_LIMITS.url}
              className={INPUT}
              placeholder="https://"
              {...describe('url', `${uid}-err`)}
            />
          </div>
          <p className="m-0 text-xs text-stone-600 sm:col-span-2">A university you add yourself has no verified facts here — only your own scores apply.</p>
          <div className="sm:col-span-2">
            <button type="submit" className={BTN_PRIMARY} aria-busy={busy}>
              <Plus className="h-4 w-4" aria-hidden="true" /> {busy ? 'Adding…' : 'Add university'}
            </button>
          </div>
        </form>
      )}
      <p ref={errorRef} id={`${uid}-err`} tabIndex={-1} className={`m-0 mt-3 text-sm text-red-700 outline-none ${error ? '' : 'hidden'}`}>
        {error}
      </p>
      <SpokenError spoken={spoken} />
    </div>
  );
}

// ── Comparison settings (rename, notes, remove) ──────────────────────────────
function SetSettings({
  set,
  onPatch,
  onDelete,
}: {
  set: CompareSet;
  onPatch: (id: string, patch: Partial<Pick<CompareSet, 'label' | 'notes'>>, announce?: string) => Promise<WriteOutcome>;
  onDelete: () => void;
}) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(set.label);
  const [notes, setNotes] = useState(set.notes ?? '');
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState('');
  const removeBtnRef = useRef<HTMLButtonElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const confirmWasOpen = useRef(false);

  useEffect(() => {
    if (confirm) confirmBtnRef.current?.focus();
    else if (confirmWasOpen.current) removeBtnRef.current?.focus();
    confirmWasOpen.current = confirm;
  }, [confirm]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (busyRef.current) return;
    const finalLabel = cleanLine(label, COMPARE_LIMITS.label);
    if (!finalLabel) {
      setError('Give the comparison a name.');
      return;
    }
    setError('');
    busyRef.current = true;
    setBusy(true);
    try {
      const why = await onPatch(set.id, { label: finalLabel, notes: cleanNotes(notes) || null }, 'Comparison settings saved.');
      if (why) setError(why);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  return (
    <div className={CARD}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls={`${uid}-panel`} className="flex w-full items-center justify-between gap-2 rounded-lg text-left text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500">
        Comparison settings
        <ChevronDown className={`h-4 w-4 text-stone-500 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <form id={`${uid}-panel`} onSubmit={(e) => void save(e)} className="mt-4 space-y-3">
          <div>
            <label htmlFor={`${uid}-label`} className={LABEL}>
              Name
            </label>
            <input id={`${uid}-label`} value={label} onChange={(e) => setLabel(e.target.value)} maxLength={COMPARE_LIMITS.label} className={INPUT} />
          </div>
          <div>
            <label htmlFor={`${uid}-notes`} className={LABEL}>
              Notes <span className="font-normal normal-case tracking-normal text-stone-500">(private — no personal details)</span>
            </label>
            <textarea id={`${uid}-notes`} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={COMPARE_LIMITS.notes} rows={4} className={`${FIELD} py-2`} />
          </div>
          <p role="alert" className={`m-0 text-sm text-red-700 ${error ? '' : 'hidden'}`}>
            {error}
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={BTN_PRIMARY} aria-busy={busy}>
              {busy ? 'Saving…' : 'Save settings'}
            </button>
          </div>
          <div className="border-t border-stone-200 pt-3">
            {confirm ? (
              <div className="flex flex-wrap items-center gap-2">
                <p className="m-0 w-full text-sm text-stone-700">Remove this comparison, its criteria, universities and scores? This cannot be undone.</p>
                <button ref={confirmBtnRef} type="button" onClick={onDelete} className={BTN_DANGER}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove comparison
                </button>
                <button type="button" onClick={() => setConfirm(false)} className={BTN_GHOST}>
                  Keep it
                </button>
              </div>
            ) : (
              <button ref={removeBtnRef} type="button" onClick={() => setConfirm(true)} className={`${BTN_GHOST} text-red-700 hover:text-red-800`}>
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove this comparison
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Check, ChevronDown, Download, ExternalLink, FileText, Pencil, Plus, Trash2, X } from 'lucide-react';
import { reportHref } from '@/lib/tools';
import type { User } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { checkToolSession, CONNECTION_LOST, explainLoadFailure, isUnansweredWrite, SESSION_ENDED, sessionMessage, TIMED_OUT, withDeadline, type ToolSession, type WriteOutcome } from '@/lib/tools-shared';
import { ToolLoadError, ToolOffline, ToolSetup, ToolSkeleton, ToolSessionEnded } from '@/components/tools/ToolStates';
import { useRegion } from '@/components/RegionProvider';
import { useAudience } from '@/components/AudienceProvider';
import { defaultAudienceFor } from '@/lib/audience';
import RegionFlag from '@/components/RegionFlag';
import { REGIONS_ALPHABETICAL, getRegionBySlug, type Region, type RegionSlug } from '@/lib/regions';
import { cleanNotes, cleanText } from '@/lib/planner';
import {
  BUDGET_LIMITS,
  CURRENCIES,
  DESTINATION_BUDGETS,
  OTHER_CATEGORY,
  PERIOD_LABEL,
  amountToCents,
  budgetCsv,
  categoryFor,
  cleanLabel,
  cleanYears,
  currencyDecimals,
  formatMoney,
  fundsCoverage,
  isKnownCurrency,
  joinCountries,
  labelInProse,
  parseAmount,
  planTotals,
  type BudgetItem,
  type BudgetKind,
  type BudgetPeriod,
  type BudgetPlan,
  type CategoryDef,
  type FundsRule,
  type FundsSource,
} from '@/lib/cost-planner';

/**
 * The Cost & Funding Planner (signed-in view). Loaded as its own chunk by
 * CostPlannerGate, so this is the ONLY place on the route that imports the
 * Supabase SDK. Reads and writes go straight to the two budget tables through
 * the visitor's own cookie-bound session — Row-Level Security scopes every row
 * to them (migration 0004), the same model as the Application Planner.
 *
 * Region in context: the tool shows the budgets for the destination chosen in
 * the header (`effectiveRegion`) and suggests THAT destination's cost lines
 * and currency, linking a line's official page (or our guide) only where one
 * exists — most lines have no official page of their own, so the copy never
 * says "each" (independent review C8). Changing the destination re-tunes it
 * in place; budgets for other destinations are counted, not mixed in.
 *
 * Every amount is student-authored (constitution Rule A, §4.5, §4.6): the site
 * supplies categories and links, computes exact sums in integer cents, and
 * draws no conclusion about whether the funding "is enough" for any rule.
 *
 * Accessibility: every action is a real button or form; one polite live region
 * announces outcomes; focus moves to a new budget's heading after creation,
 * back to the add-line field after a line is added (rapid entry), and to a
 * stable control after a removal.
 *
 * Failures are shown, not only announced: a form puts the reason beside its own
 * fields (the write returns it), and a Remove puts it in the alert under the
 * destination header — as does a form's save whose budget view was replaced
 * (another budget, another destination) before the answer landed. A failed write never signs the student out by itself —
 * only a definite "session gone" from the auth server does; a connection
 * problem keeps the session and everything typed (lib/tools-shared).
 *
 * No wait is endless: the first read and every write run under the shared
 * deadline (lib/tools-shared withDeadline). A read that has not settled shows
 * the offline card, never a skeleton for ever; a write given up on — or one
 * that got no HTTP answer at all — says its outcome is unknown, never "not
 * saved" (the Test Score Tracker's contract; see runWrite).
 */

// ── Styling tokens (site design language, shared with the planner) ──────────
const CARD = 'rounded-2xl border border-stone-200 bg-white p-5 shadow-sm';
// A SOLID focus ring (forest-500, 4.42:1 on white) with a 1px white offset —
// the same field focus as the Test Score Tracker, so every tool reads alike (§15.2).
// The red border of an invalid field (aria-invalid, set only on the field the
// error is about) wins the cascade over focus:border-*, so the ring alone marks
// focus on a focused invalid field (WCAG 1.4.11).
const FIELD =
  'w-full rounded-xl border border-stone-450 bg-white px-3 text-base text-ink placeholder:text-stone-500 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:ring-offset-1 aria-[invalid=true]:border-red-500 sm:text-sm';
const INPUT = `${FIELD} h-10`;
const LABEL = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-600';
// An unavailable control looks unavailable — dimmed, a not-allowed cursor, no
// hover change: `disabled:` when there is nothing to do, `aria-disabled:` for a
// control held while a save it would interrupt is in flight (it stays
// focusable; `disabled` mid-flight would drop focus to <body>).
const BTN =
  'inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60';
const BTN_PRIMARY = `${BTN} bg-forest-700 text-cream-50 hover:bg-forest-800 aria-disabled:hover:bg-forest-700`;
const BTN_SECONDARY = `${BTN} border border-forest-300 bg-white text-forest-700 hover:border-forest-400 hover:bg-forest-50`;
const BTN_DANGER = `${BTN} border border-red-300 bg-white text-red-700 hover:bg-red-50 focus-visible:ring-red-500`;
const BTN_GHOST =
  'inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-stone-700 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:hover:bg-transparent aria-disabled:hover:text-stone-700';
const ICON_BTN =
  'inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-600 transition-colors hover:bg-stone-100 hover:text-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-stone-600';
/** A form's close (×) button. */
const CLOSE_X =
  '-m-1 rounded-lg p-1 text-stone-600 hover:bg-stone-100 hover:text-forest-800 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:hover:bg-transparent aria-disabled:hover:text-stone-600';
const CHIP = 'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold';
const CHIP_YEAR = `${CHIP} border-forest-200 bg-forest-50 text-forest-800`;
const CHIP_ONCE = `${CHIP} border-stone-200 bg-stone-100 text-stone-700`;
const LINK = 'inline-flex items-center gap-1 text-forest-700 underline underline-offset-2 hover:text-forest-800';

type LoadState = 'loading' | 'ready' | 'setup' | 'error' | 'offline' | 'signed-out';

/** The latest outcome: 'ok' is announced (screen readers), 'error' is also shown. */
type Notice = { tone: 'ok' | 'error'; text: string } | null;

// ── Writes under a deadline ─────────────────────────────────────────────────
// A request on a stalled connection never settles by itself — nor does the
// token refresh the SDK runs BEFORE it, which ignores any abort signal — so a
// form would stay "Saving…" for ever (review TRK-R2-6). Every write therefore
// runs under withDeadline (WRITE_TIMEOUT_MS), and how it ended decides what the
// student is told:
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
const unconfirmed = (what: string, next: string): string => `We could not confirm whether ${what} — the server did not answer. ${next}`;
/** An update or a delete: sending it again does no harm, whichever way the first one went. */
const SAVE_AGAIN = 'Save it again (saving the same change twice does no harm), or reload the page to check.';
const REMOVE_AGAIN = 'Try again (removing it twice does no harm), or reload the page to check.';
/** A new budget or line: a second one could duplicate the first, so check before repeating it. */
const CHECK_FIRST = (what: string) => `Reload the page to check before ${what} again, so you do not end up with two.`;

const regionOf = (slug: RegionSlug): Region => getRegionBySlug(slug) ?? REGIONS_ALPHABETICAL[0];

/** The error text for a bad amount, in the plan's currency terms. */
function amountError(currency: string): string {
  return currencyDecimals(currency) === 0
    ? `Enter a whole number — ${currency} has no decimal places (no letters).`
    : 'Enter an amount as a plain number, e.g. 12500 or 12500.50 (no letters).';
}

/** A stored amount as the text to edit: whole numbers bare, anything else with two decimals. */
function editableAmount(amount: number | string): string {
  const cents = amountToCents(amount);
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
}

/**
 * The cost lines this visitor is offered (§16.7): a domestic student of the
 * destination gets no student-visa line. The empty state's promise and the add
 * form read this one list, so the empty state never names a line the form withholds.
 */
function costsOffered(def: (typeof DESTINATION_BUDGETS)[RegionSlug], domestic: boolean): CategoryDef[] {
  return domestic ? def.costs.filter((c) => c.key !== 'visa') : def.costs;
}

function defaultLabel(region: Region, existing: BudgetPlan[]): string {
  const base = `${region.displayName} budget`;
  const n = existing.filter((p) => p.region === region.slug).length;
  return n === 0 ? base : `${base} ${n + 1}`;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function CostPlannerApp() {
  const { effectiveRegion } = useRegion();
  const { chosenAudience } = useAudience();
  const region = regionOf(effectiveRegion);
  // §16.7: a domestic student of the destination needs no student-visa lines
  // and no visa financial rule — hide those suggestions (an existing line stays).
  const domestic = (chosenAudience ?? defaultAudienceFor(effectiveRegion)) === 'domestic';
  const [load, setLoad] = useState<LoadState>('loading');
  const [plans, setPlans] = useState<BudgetPlan[]>([]);
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [notice, setNotice] = useState<Notice>(null);
  const [creating, setCreating] = useState(false);
  // True while the new-budget form ON SCREEN has a save in flight. Nothing the
  // student clicks closes that form then: its × and Cancel and the header toggle
  // wait (shown unavailable), so a click can never look as if it stopped a save
  // that then lands (review RT-4). Only a destination change closes it mid-save —
  // and that clears this, so a new form opened for the new destination is never
  // shown locked by the old form's save, and the old save's answer never unlocks
  // the new form's (see createPlan).
  const [createSaving, setCreateSaving] = useState(false);
  /** Identity of the new-budget form on screen — bumped whenever it opens or closes. */
  const createFormToken = useRef(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const newBtnRef = useRef<HTMLButtonElement>(null);
  const planHeadingRef = useRef<HTMLHeadingElement>(null);
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

  /** Show why a Remove did not save (a form shows its own reason inline). */
  const report = useCallback((why: WriteOutcome) => {
    if (why) setNotice({ tone: 'error', text: why });
  }, []);

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
      const [p, i] = await Promise.all([
        s.supabase.from('budget_plans').select('*').eq('user_id', s.user.id).order('created_at', { ascending: true }).range(0, 49).abortSignal(signal),
        s.supabase.from('budget_items').select('*').eq('user_id', s.user.id).order('created_at', { ascending: true }).range(0, 999).abortSignal(signal),
      ]);
      if (!active || expired()) return null;
      const err = p.error ?? i.error;
      // A failed read is most often the connection: ask before blaming anything else.
      if (err) return explainLoadFailure(err);
      setPlans((p.data ?? []) as BudgetPlan[]);
      setItems((i.data ?? []) as BudgetItem[]);
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

  // The destination in the header changed: show its budgets, close any form.
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

  // Focus the budget created last (after its heading has mounted).
  useEffect(() => {
    if (pendingFocus.current && planHeadingRef.current && plans.some((p) => p.id === pendingFocus.current)) {
      pendingFocus.current = null;
      planHeadingRef.current.focus();
    }
  }, [plans, selectedId]);

  const regionPlans = useMemo(() => plans.filter((p) => p.region === effectiveRegion), [plans, effectiveRegion]);
  const plan = regionPlans.find((p) => p.id === selectedId) ?? regionPlans[0] ?? null;
  const planItems = useMemo(() => (plan ? items.filter((it) => it.plan_id === plan.id) : []), [items, plan]);
  const otherRegions = useMemo(() => {
    const counts = new Map<RegionSlug, number>();
    for (const p of plans) if (p.region !== effectiveRegion) counts.set(p.region, (counts.get(p.region) ?? 0) + 1);
    return REGIONS_ALPHABETICAL.filter((r) => counts.has(r.slug)).map((r) => ({ region: r, n: counts.get(r.slug)! }));
  }, [plans, effectiveRegion]);

  // Identity of the budget view on screen. PlanView is keyed by the budget's id,
  // so a switch to another budget, a destination change or a removal replaces it
  // — and every form inside it. A save started in the old view still answers,
  // but the form that would have shown a refusal is gone (review RT-4).
  const viewToken = useRef(0);
  useEffect(() => {
    viewToken.current += 1;
  }, [plan?.id]);

  /**
   * For a save made from a form inside the budget view — call it as the save
   * starts. If that view has gone by the time the answer lands, a refusal is
   * shown in the alert under the destination header, led by `lost` (what did
   * not save), and the gone form receives null: the reason is never lost with
   * the form that would have shown it. `unsure` does the same for an outcome
   * that is unknown — that sentence names what it was about and is shown as it
   * is, because "… was not saved" would not be true.
   */
  const viewSave = useCallback((lost: string) => {
    const token = viewToken.current;
    const gone = () => viewToken.current !== token;
    const settle = (why: WriteOutcome, generic?: string): WriteOutcome => {
      if (!why || !gone()) return why;
      // What was typed went with the form, so "nothing was lost" no longer holds;
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
  const createPlan = useCallback(
    async (input: Pick<BudgetPlan, 'label' | 'currency_code' | 'years' | 'intake'>): Promise<WriteOutcome> => {
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
          text: `Your new budget for ${where} may not have been created — the destination changed while it was saving. Reload the page to check before creating it again.`,
        });
        return null;
      };
      const unsure = (): WriteOutcome => {
        const text = unconfirmed(`your new budget for ${where} was created`, CHECK_FIRST('creating it'));
        if (stillOpen()) return text;
        setNotice({ tone: 'error', text });
        return null;
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
              .from('budget_plans')
              .insert({ user_id: s.user.id, region: effectiveRegion, ...input, notes: null })
              .select('*')
              .abortSignal(w.signal)
              .single();
            if (w.expired()) return null;
            if (error || !data) {
              if (unanswered(status, error)) return NO_ANSWER;
              if (/budget_plans_cap/.test(error?.message ?? '')) return refused(`You have reached the ${BUDGET_LIMITS.plans}-budget limit — remove one you no longer need, then create this one.`);
              const generic = 'Could not create the budget. Please try again.';
              w.refused(generic);
              const why = await fail(generic);
              return w.expired() ? null : refused(why);
            }
            const created = data as BudgetPlan;
            if (stillOpen()) {
              pendingFocus.current = created.id;
              setPlans((prev) => [...prev, created]);
              setSelectedId(created.id);
              setCreating(false);
              setNotice({ tone: 'ok', text: `Created ${created.label}.` });
            } else {
              // Kept under its own destination, which is no longer the one on screen.
              setPlans((prev) => [...prev, created]);
              setNotice({ tone: 'ok', text: `Created ${created.label} for ${regionOf(created.region).proseName}.` });
            }
            return null;
          },
          (how) => (how.kind === 'unknown' ? unsure() : refused(how.kind === 'unsent' ? CONNECTION_LOST : how.generic)),
        );
      } finally {
        // Only this save's own form is unlocked: once a destination change has
        // closed it, the flag belongs to whatever form is open now.
        if (stillOpen()) setCreateSaving(false);
      }
    },
    [effectiveRegion, fail, session],
  );

  const patchPlan = useCallback(
    async (id: string, patch: Partial<Pick<BudgetPlan, 'label' | 'currency_code' | 'years' | 'intake' | 'notes'>>, announce?: string): Promise<WriteOutcome> => {
      const before = plans.find((p) => p.id === id);
      if (!before) return null;
      const { settle, unsure } = viewSave(`The settings for ${before.label} were not saved.`);
      setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      // Roll back ONLY the fields this call changed (a later, successful edit to another field survives).
      // An unknown outcome rolls back too: the page shows what is known to be saved.
      const rollBack = () => {
        const revert: Partial<BudgetPlan> = {};
        for (const k of Object.keys(patch) as Array<keyof typeof patch>) (revert as Record<string, unknown>)[k] = before[k];
        setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...revert } : p)));
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
          const { error, status } = await s.supabase.from('budget_plans').update(patch).eq('id', id).eq('user_id', s.user.id).abortSignal(w.signal);
          if (w.expired()) return null;
          if (error) {
            if (unanswered(status, error)) return NO_ANSWER;
            rollBack();
            w.refused(generic);
            const why = await fail(generic);
            return w.expired() ? null : settle(why, generic);
          }
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
    [fail, plans, session, viewSave],
  );

  const deletePlan = useCallback(
    async (id: string): Promise<WriteOutcome> => {
      const target = plans.find((p) => p.id === id);
      if (!target) return null;
      const generic = `Could not remove ${target.label}. Please try again.`;
      return runWrite(
        async (w) => {
          const s = await session();
          if (w.expired()) return null;
          if (typeof s === 'string') return s;
          w.sending();
          const { error, status } = await s.supabase.from('budget_plans').delete().eq('id', id).eq('user_id', s.user.id).abortSignal(w.signal);
          if (w.expired()) return null;
          if (error) {
            if (unanswered(status, error)) return NO_ANSWER;
            w.refused(generic);
            return fail(generic);
          }
          setPlans((prev) => prev.filter((p) => p.id !== id));
          setItems((prev) => prev.filter((it) => it.plan_id !== id));
          setSelectedId(null);
          setNotice({ tone: 'ok', text: `Removed ${target.label}.` });
          newBtnRef.current?.focus();
          return null;
        },
        (how) => (how.kind === 'unknown' ? unconfirmed(`${target.label} was removed`, REMOVE_AGAIN) : how.kind === 'unsent' ? CONNECTION_LOST : how.generic),
      );
    },
    [fail, plans, session],
  );

  const addItem = useCallback(
    async (input: Omit<BudgetItem, 'id' | 'created_at' | 'updated_at'>): Promise<WriteOutcome> => {
      const into = plans.find((p) => p.id === input.plan_id)?.label ?? 'your budget';
      const { gone, settle, unsure } = viewSave(`“${input.label}” was not added to ${into}.`);
      const generic = 'Could not add the line. Please try again.';
      return runWrite(
        async (w) => {
          const s = await session();
          if (w.expired()) return null;
          if (typeof s === 'string') return settle(s);
          w.sending();
          const { data, error, status } = await s.supabase
            .from('budget_items')
            .insert({ user_id: s.user.id, ...input })
            .select('*')
            .abortSignal(w.signal)
            .single();
          if (w.expired()) return null;
          if (error || !data) {
            if (unanswered(status, error)) return NO_ANSWER;
            if (/budget_items_cap/.test(error?.message ?? '')) return settle(`This budget has reached the ${BUDGET_LIMITS.itemsPerPlan}-line limit — remove a line you no longer need, then add this one.`);
            w.refused(generic);
            const why = await fail(generic);
            return w.expired() ? null : settle(why, generic);
          }
          const row = data as BudgetItem;
          setItems((prev) => [...prev, row]);
          // Saved while its budget is off screen: say which budget it went to.
          setNotice({ tone: 'ok', text: gone() ? `Added ${row.label} to ${into}.` : `Added ${row.label}.` });
          return null;
        },
        (how) =>
          how.kind === 'unknown'
            ? unsure(unconfirmed(`“${input.label}” was added to ${into}`, CHECK_FIRST('adding it')))
            : how.kind === 'unsent'
              ? settle(CONNECTION_LOST)
              : settle(how.generic, how.generic),
      );
    },
    [fail, plans, session, viewSave],
  );

  const patchItem = useCallback(
    async (id: string, patch: Partial<Pick<BudgetItem, 'label' | 'amount' | 'period' | 'note'>>): Promise<WriteOutcome> => {
      const before = items.find((it) => it.id === id);
      if (!before) return null;
      const where = plans.find((p) => p.id === before.plan_id)?.label ?? 'your budget';
      const { settle, unsure } = viewSave(`Your change to “${before.label}” in ${where} was not saved.`);
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
      const rollBack = () => {
        const revert: Partial<BudgetItem> = {};
        for (const k of Object.keys(patch) as Array<keyof typeof patch>) (revert as Record<string, unknown>)[k] = before[k];
        setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...revert } : it)));
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
          const { error, status } = await s.supabase.from('budget_items').update(patch).eq('id', id).eq('user_id', s.user.id).abortSignal(w.signal);
          if (w.expired()) return null;
          if (error) {
            if (unanswered(status, error)) return NO_ANSWER;
            rollBack();
            w.refused(generic);
            const why = await fail(generic);
            return w.expired() ? null : settle(why, generic);
          }
          setNotice({ tone: 'ok', text: `Updated ${patch.label ?? before.label}.` });
          return null;
        },
        (how) => {
          rollBack();
          if (how.kind === 'unknown') return unsure(unconfirmed(`your change to “${before.label}” in ${where} was saved`, SAVE_AGAIN));
          return how.kind === 'unsent' ? settle(CONNECTION_LOST) : settle(how.generic, how.generic);
        },
      );
    },
    [fail, items, plans, session, viewSave],
  );

  const deleteItem = useCallback(
    async (id: string): Promise<WriteOutcome> => {
      const target = items.find((it) => it.id === id);
      const name = target?.label ?? 'the line';
      const generic = `Could not remove ${name}. Please try again.`;
      return runWrite(
        async (w) => {
          const s = await session();
          if (w.expired()) return null;
          if (typeof s === 'string') return s;
          w.sending();
          const { error, status } = await s.supabase.from('budget_items').delete().eq('id', id).eq('user_id', s.user.id).abortSignal(w.signal);
          if (w.expired()) return null;
          if (error) {
            if (unanswered(status, error)) return NO_ANSWER;
            w.refused(generic);
            return fail(generic);
          }
          setItems((prev) => prev.filter((it) => it.id !== id));
          setNotice({ tone: 'ok', text: `Removed ${name}.` });
          return null;
        },
        (how) => (how.kind === 'unknown' ? unconfirmed(`${name} was removed`, REMOVE_AGAIN) : how.kind === 'unsent' ? CONNECTION_LOST : how.generic),
      );
    },
    [fail, items, session],
  );

  const downloadCsv = () => {
    if (!plan) return;
    const blob = new Blob([budgetCsv(plan, planItems)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `globalstudyboard-budget-${plan.region}-${plan.id.slice(0, 8)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setNotice({ tone: 'ok', text: 'Your budget was downloaded as a CSV file.' });
  };

  // The header toggle would close the new-budget form: it waits while that form saves.
  const createLocked = creating && createSaving;

  // ── Render ──────────────────────────────────────────────────────────────
  if (load === 'loading') return <ToolSkeleton label="Loading your budget…" />;
  if (load === 'signed-out') return <ToolSessionEnded />;
  if (load === 'offline') return <ToolOffline />;
  if (load === 'setup') return <ToolSetup name="The budget planner" />;
  if (load === 'error') return <ToolLoadError what="budgets" />;

  const def = DESTINATION_BUDGETS[effectiveRegion];

  return (
    <div className="space-y-5">
      {/* Destination header */}
      <div className={`${CARD} flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between`}>
        <div className="min-w-0">
          <p className="m-0 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-600">
            <RegionFlag slug={effectiveRegion} className="h-3.5" /> Budgets for {region.proseName}
          </p>
          <p className="m-0 mt-1 text-sm leading-relaxed text-stone-700">
            Tuned to the destination chosen in the header — change it there to budget for another destination.
            {otherRegions.length > 0 && (
              <>
                {' '}
                You also have {otherRegions.map(({ region: r, n }) => `${n} for ${r.proseName}`).join(', ')}.
              </>
            )}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {plan && (
            <>
              <Link href={`${reportHref('cost-planner')}?budget=${encodeURIComponent(plan.id)}`} className={`${BTN_SECONDARY} no-underline`}>
                <FileText className="h-4 w-4" aria-hidden="true" /> Report &amp; PDF
              </Link>
              <button type="button" onClick={downloadCsv} className={BTN_SECONDARY} disabled={planItems.length === 0}>
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
            aria-controls="budget-new-panel"
            aria-disabled={createLocked || undefined}
            className={BTN_PRIMARY}
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> New budget
          </button>
        </div>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {notice?.tone === 'ok' ? notice.text : ''}
      </p>
      <p role="alert" className={notice?.tone === 'error' ? 'm-0 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800' : 'sr-only'}>
        {notice?.tone === 'error' ? notice.text : ''}
      </p>

      {creating && (
        <NewPlanForm
          id="budget-new-panel"
          region={region}
          defaultLabel={defaultLabel(region, plans)}
          onCancel={() => {
            setCreating(false);
            newBtnRef.current?.focus();
          }}
          onSubmit={createPlan}
        />
      )}

      {regionPlans.length > 1 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label={`Your budgets for ${region.proseName}`}>
          {regionPlans.map((p) => {
            const active = plan?.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedId(p.id)}
                className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 ${
                  active ? 'border-forest-600 bg-forest-50 text-forest-800' : 'border-stone-300 bg-white text-stone-700 hover:border-forest-300 hover:bg-forest-50/60'
                }`}
              >
                {p.label}
                <span className="rounded-full bg-stone-100 px-1.5 text-xs font-semibold text-stone-700">{p.currency_code}</span>
              </button>
            );
          })}
        </div>
      )}

      {!plan ? (
        <div className={`${CARD} text-center`}>
          <h2 className="font-display text-xl font-bold tracking-editorial text-ink">No budget for {region.proseName} yet</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-stone-700">
            {/* Semicolons, because labels carry their own commas ("Housing, food & transport");
                labelInProse keeps proper names and acronyms (SEVIS, the Immigration Health Surcharge) capitalised.
                The same list the add form offers (costsOffered): no visa line for a domestic student (§16.7). */}
            Start one and we&rsquo;ll suggest the lines this destination has —{' '}
            {[...costsOffered(def, domestic).slice(0, 4).map((c) => labelInProse(c)), 'and more'].join('; ')} — with an official page or one of our
            guides linked where we have one. You enter every amount.
          </p>
          {!creating && (
            // The heading above names the destination; "for {shortName}" read as broken English ("for Middle East").
            <button type="button" onClick={() => setCreating(true)} className={`${BTN_PRIMARY} mt-4`}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Start a budget
            </button>
          )}
        </div>
      ) : (
        <PlanView
          key={plan.id}
          plan={plan}
          items={planItems}
          region={region}
          def={def}
          domestic={domestic}
          headingRef={planHeadingRef}
          onPatchPlan={patchPlan}
          onDeletePlan={() => void deletePlan(plan.id).then(report)}
          onAddItem={addItem}
          onPatchItem={patchItem}
          onDeleteItem={(id) => void deleteItem(id).then(report)}
        />
      )}
    </div>
  );
}

// ── New budget ───────────────────────────────────────────────────────────────
function NewPlanForm({
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
  onSubmit: (input: Pick<BudgetPlan, 'label' | 'currency_code' | 'years' | 'intake'>) => Promise<WriteOutcome>;
}) {
  const uid = useId();
  const [label, setLabel] = useState(initialLabel);
  const [currency, setCurrency] = useState(isKnownCurrency(region.currency.code) ? region.currency.code : 'USD');
  const [years, setYears] = useState(1);
  const [intake, setIntake] = useState('');
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
    const finalLabel = cleanText(label, BUDGET_LIMITS.label);
    if (!finalLabel) {
      showError('Give the budget a name.');
      return;
    }
    setError('');
    busyRef.current = true;
    setBusy(true);
    let why: WriteOutcome = null;
    try {
      why = await onSubmit({ label: finalLabel, currency_code: currency, years: cleanYears(years), intake: cleanText(intake, BUDGET_LIMITS.intake) || null });
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
    if (why) {
      showError(why); // everything chosen stays in the form, ready to try again
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
          New budget for {region.proseName}
        </h2>
        <button type="button" onClick={cancel} className={CLOSE_X} aria-label="Close the new-budget form" aria-disabled={busy || undefined}>
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={`${uid}-label`} className={LABEL}>
            Name
          </label>
          <input ref={firstRef} id={`${uid}-label`} value={label} onChange={(e) => setLabel(e.target.value)} maxLength={BUDGET_LIMITS.label} className={INPUT} placeholder="e.g. Toronto option" />
        </div>
        <div>
          <label htmlFor={`${uid}-cur`} className={LABEL}>
            Currency
          </label>
          <select id={`${uid}-cur`} value={currency} onChange={(e) => setCurrency(e.target.value)} className={INPUT} aria-describedby={`${uid}-curhelp`}>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.label}
              </option>
            ))}
          </select>
          <p id={`${uid}-curhelp`} className="mt-1 text-xs text-stone-600">
            Every line in this budget is entered in this currency. We never convert.
          </p>
        </div>
        <div>
          <label htmlFor={`${uid}-years`} className={LABEL}>
            Programme length
          </label>
          <select id={`${uid}-years`} value={years} onChange={(e) => setYears(Number(e.target.value))} className={INPUT} aria-describedby={`${uid}-yhelp`}>
            {Array.from({ length: BUDGET_LIMITS.yearsMax }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'year' : 'years'}
              </option>
            ))}
          </select>
          <p id={`${uid}-yhelp`} className="mt-1 text-xs text-stone-600">
            Per-year lines are multiplied by this.
          </p>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${uid}-intake`} className={LABEL}>
            Intake <span className="font-normal normal-case tracking-normal text-stone-500">(optional)</span>
          </label>
          <input id={`${uid}-intake`} value={intake} onChange={(e) => setIntake(e.target.value)} maxLength={BUDGET_LIMITS.intake} className={INPUT} placeholder={region.intakes[0] ? `e.g. ${region.intakes[0]}` : 'e.g. September 2027'} list={`${uid}-intakes`} />
          <datalist id={`${uid}-intakes`}>
            {region.intakes.map((i) => (
              <option key={i} value={i} />
            ))}
          </datalist>
        </div>
      </div>
      <p ref={errorRef} tabIndex={-1} className={`m-0 text-sm text-red-700 outline-none ${error ? '' : 'hidden'}`}>
        {error}
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className={BTN_PRIMARY} aria-busy={busy}>
          {busy ? 'Creating…' : 'Create budget'}
        </button>
        <button type="button" onClick={cancel} className={BTN_GHOST} aria-disabled={busy || undefined}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── One budget ───────────────────────────────────────────────────────────────
function PlanView({
  plan,
  items,
  region,
  def,
  domestic,
  headingRef,
  onPatchPlan,
  onDeletePlan,
  onAddItem,
  onPatchItem,
  onDeleteItem,
}: {
  plan: BudgetPlan;
  items: BudgetItem[];
  region: Region;
  def: (typeof DESTINATION_BUDGETS)[RegionSlug];
  /** §16.7: a domestic student of this destination — no visa suggestions, no visa financial rule. */
  domestic: boolean;
  headingRef: React.RefObject<HTMLHeadingElement>;
  /** The returning writes resolve to null when they saved, or the reason they did not (each shown in its form — or, once this view has been replaced, in the app's alert). */
  onPatchPlan: (id: string, patch: Partial<Pick<BudgetPlan, 'label' | 'currency_code' | 'years' | 'intake' | 'notes'>>, announce?: string) => Promise<WriteOutcome>;
  onDeletePlan: () => void;
  onAddItem: (input: Omit<BudgetItem, 'id' | 'created_at' | 'updated_at'>) => Promise<WriteOutcome>;
  onPatchItem: (id: string, patch: Partial<Pick<BudgetItem, 'label' | 'amount' | 'period' | 'note'>>) => Promise<WriteOutcome>;
  onDeleteItem: (id: string) => void;
}) {
  const t = planTotals(items, plan.years);
  const costs = items.filter((it) => it.kind === 'cost');
  const funding = items.filter((it) => it.kind === 'funding');
  const cur = plan.currency_code;
  const money = (c: number) => formatMoney(c, cur);
  const yearsLabel = `${plan.years} ${plan.years === 1 ? 'year' : 'years'}`;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="min-w-0 space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-bold tracking-editorial text-ink m-0 outline-none">
            {plan.label}
          </h2>
          <p className="m-0 text-sm text-stone-600">
            {cur} · {yearsLabel}
            {plan.intake ? ` · ${plan.intake}` : ''}
          </p>
        </div>

        <BudgetColumn
          kind="cost"
          title="Costs"
          intro="What studying will cost — per year or one-off. Take each figure from the official page or your offer letter."
          items={costs}
          plan={plan}
          region={region}
          categories={costsOffered(def, domestic)}
          subtotal={{ perYear: t.costPerYear, once: t.costOnce, total: t.costTotal }}
          onAdd={onAddItem}
          onPatch={onPatchItem}
          onDelete={onDeleteItem}
        />

        <BudgetColumn
          kind="funding"
          title="Funding"
          intro="What you have or expect — savings, family, scholarships, loans. Count only what is confirmed, or say so in the note."
          items={funding}
          plan={plan}
          region={region}
          categories={def.funding}
          subtotal={{ perYear: t.fundingPerYear, once: t.fundingOnce, total: t.fundingTotal }}
          onAdd={onAddItem}
          onPatch={onPatchItem}
          onDelete={onDeleteItem}
        />
      </div>

      {/* Sticky, and never taller than the window (as in the planner): a taller sticky column keeps
          its lower part — the settings — out of reach until the end of the list. */}
      <aside className="space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto" aria-labelledby="budget-summary-heading">
        <div className={CARD}>
          <h2 id="budget-summary-heading" className="font-display text-xl font-bold tracking-editorial text-ink m-0">
            Whole programme
          </h2>
          <p className="m-0 mt-1 text-xs text-stone-600">
            One-off lines plus per-year lines × {yearsLabel}, in {cur}.
          </p>
          <dl className="m-0 mt-4 space-y-3">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-sm font-medium text-stone-700">Costs</dt>
              <dd className="m-0 font-display text-xl font-bold text-ink">{money(t.costTotal)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-sm font-medium text-stone-700">Funding</dt>
              <dd className="m-0 font-display text-xl font-bold text-ink">{money(t.fundingTotal)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-t border-stone-200 pt-3">
              <dt className="text-sm font-semibold text-ink">
                {t.difference < 0 ? 'Still to arrange' : t.difference === 0 ? 'Costs and funding are equal' : 'Funding exceeds costs by'}
              </dt>
              <dd className={`m-0 font-display text-2xl font-bold ${t.difference < 0 ? 'text-terracotta-700' : 'text-forest-800'}`}>
                {money(Math.abs(t.difference))}
              </dd>
            </div>
          </dl>
          {(t.costPerYear > 0 || t.fundingPerYear > 0) && (
            <p className="m-0 mt-3 text-xs text-stone-600">
              Per year: {money(t.costPerYear)} costs · {money(t.fundingPerYear)} funding.
            </p>
          )}
          <p className="m-0 mt-4 text-xs leading-relaxed text-stone-600">
            Your own budget, built from the numbers you enter — we don&rsquo;t set, verify or estimate any of them. A budget
            that adds up is not the same as meeting the official financial rule for a student visa; this is a planning
            worksheet, not financial advice.
          </p>
        </div>

        {!domestic && <FundsRuleCard region={region} rule={def.fundsRule} />}

        <PlanSettings plan={plan} region={region} onPatch={onPatchPlan} onDelete={onDeletePlan} />
      </aside>
    </div>
  );
}

// ── The student-visa financial rule, country by country ─────────────────────
/**
 * Claims exactly what is linked (independent review CRIT2-4, G7-SK-3): a
 * country's page is listed as stating the rule only when it states it or names
 * the proof of funds among the visa's documents; a page whose application only
 * asks about your financial support, and a document list that names no
 * financial document, each say so in their own words; every other country of
 * the destination is named as not covered — never implied by a homepage.
 */
function FundsRuleCard({ region, rule }: { region: Region; rule: FundsRule }) {
  const cov = fundsCoverage(rule, region.countries);
  const many = region.countries.length > 1;
  const who = (country: string) => (many ? `${country}: the` : 'The');
  return (
    <div className={CARD}>
      <h3 className="text-sm font-semibold text-ink m-0">Student-visa financial requirement</h3>
      <p className="m-0 mt-1 text-xs leading-relaxed text-stone-600">
        {cov.published.length > 0
          ? `Linked where an official page states the requirement or names the proof of funds the visa asks for${many ? ', country by country' : ''}. Rules and amounts change — check the current rule there before you rely on it.`
          : 'Rules change — confirm on the official source before you rely on anything here.'}
      </p>
      {cov.published.length > 0 && (
        <ul className="m-0 mt-2 list-none space-y-1.5 p-0 text-sm">
          {cov.published.map(({ country, sources }) => (
            <li key={country}>
              {many && <span className="font-semibold text-ink">{country}: </span>}
              <FundsLinks sources={sources} />
            </li>
          ))}
        </ul>
      )}
      {cov.asked.map(({ country, sources }) => (
        <p key={country} className="m-0 mt-2 text-xs leading-relaxed text-stone-700">
          {who(country)} official application asks about your financial support, but the page states no requirement —{' '}
          <FundsLinks sources={sources} />. Confirm with your university or the immigration authority.
        </p>
      ))}
      {cov.noneListed.map(({ country, sources }) => (
        <p key={country} className="m-0 mt-2 text-xs leading-relaxed text-stone-700">
          {who(country)} official study-visa document list names no financial document — <FundsLinks sources={sources} />. Confirm
          with the embassy or your university.
        </p>
      ))}
      {cov.notCovered.length > 0 && (
        <p className="m-0 mt-2 text-xs leading-relaxed text-stone-700">
          Not covered here: {joinCountries(cov.notCovered)}. Confirm the financial rule with the embassy or immigration authority concerned.
        </p>
      )}
      {rule.guides.length > 0 && (
        <>
          <p className="m-0 mt-3 text-xs font-semibold uppercase tracking-wide text-stone-600">Our guides</p>
          <ul className="m-0 mt-1 list-none space-y-1 p-0 text-sm">
            {rule.guides.map((gl) => (
              <li key={gl.slug}>
                <Link href={`/guides/${gl.slug}`} className={LINK}>
                  {gl.title}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/** A country's funds-rule pages, " · "-separated, each opening in a new tab. */
function FundsLinks({ sources }: { sources: FundsSource[] }) {
  return (
    <>
      {sources.map((s, i) => (
        <span key={s.url}>
          {i > 0 ? ' · ' : ''}
          <a href={s.url} target="_blank" rel="noopener noreferrer" className={LINK}>
            {s.label} <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </span>
      ))}
    </>
  );
}

// ── A column of lines + its add form ─────────────────────────────────────────
function BudgetColumn({
  kind,
  title,
  intro,
  items,
  plan,
  region,
  categories,
  subtotal,
  onAdd,
  onPatch,
  onDelete,
}: {
  kind: BudgetKind;
  title: string;
  intro: string;
  items: BudgetItem[];
  plan: BudgetPlan;
  region: Region;
  categories: CategoryDef[];
  subtotal: { perYear: number; once: number; total: number };
  onAdd: (input: Omit<BudgetItem, 'id' | 'created_at' | 'updated_at'>) => Promise<WriteOutcome>;
  onPatch: (id: string, patch: Partial<Pick<BudgetItem, 'label' | 'amount' | 'period' | 'note'>>) => Promise<WriteOutcome>;
  onDelete: (id: string) => void;
}) {
  const uid = useId();
  // An empty column opens its add form by itself (a fresh budget should invite
  // entry); a form the visitor opened is the only one that takes focus.
  const [adding, setAdding] = useState(items.length === 0);
  const [userOpened, setUserOpened] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const wasAdding = useRef(false);
  const cur = plan.currency_code;
  // The add form and the add button replace each other: return focus to the
  // button only once it has re-mounted (never synchronously, which lands on <body>).
  useEffect(() => {
    if (!adding && wasAdding.current) addBtnRef.current?.focus();
    wasAdding.current = adding;
  }, [adding]);
  /** After a removal the clicked button is gone: land on the add button, else on the column heading. */
  const focusAfterRemove = () => (addBtnRef.current ?? headingRef.current)?.focus();

  return (
    <section aria-labelledby={`${uid}-h`} className={`${CARD} space-y-4`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 ref={headingRef} id={`${uid}-h`} tabIndex={-1} className="font-display text-xl font-bold tracking-editorial text-ink m-0 outline-none">
            {title}
          </h3>
          <p className="m-0 mt-1 max-w-xl text-xs leading-relaxed text-stone-600">{intro}</p>
        </div>
        {/* Full-width and left-aligned when it wraps under the intro on a phone; right-aligned beside it from sm up. */}
        <p className="m-0 w-full text-left text-sm text-stone-700 sm:w-auto sm:text-right">
          <span className="block font-display text-lg font-bold text-ink">{formatMoney(subtotal.total, cur)}</span>
          <span className="block text-xs text-stone-600">
            {formatMoney(subtotal.perYear, cur)} per year · {formatMoney(subtotal.once, cur)} one-off
          </span>
        </p>
      </div>

      {items.length > 0 && (
        <ul className="m-0 list-none divide-y divide-stone-200 p-0">
          {items.map((it) => (
            <LineRow
              key={it.id}
              item={it}
              plan={plan}
              region={region}
              category={categoryFor(plan.region, kind, it.category)}
              onPatch={(patch) => onPatch(it.id, patch)}
              onDelete={() => {
                onDelete(it.id);
                focusAfterRemove();
              }}
            />
          ))}
        </ul>
      )}

      {adding ? (
        <AddLineForm
          id={`${uid}-add`}
          kind={kind}
          plan={plan}
          region={region}
          categories={categories}
          existingKeys={new Set(items.map((it) => it.category))}
          autoFocus={userOpened}
          onSubmit={onAdd}
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
          <Plus className="h-4 w-4" aria-hidden="true" /> Add a {kind === 'cost' ? 'cost' : 'funding'} line
        </button>
      )}
    </section>
  );
}

function CategoryLinks({ category, region, forWork }: { category: CategoryDef; region: Region; forWork: boolean }) {
  const workSource = forWork ? region.sources[0] : undefined;
  if (!category.source && !category.guides?.length && !workSource) return null;
  return (
    <span className="text-xs text-stone-600">
      {category.source && (
        <a href={category.source.url} target="_blank" rel="noopener noreferrer" className={LINK}>
          {category.source.label} <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      )}
      {workSource && (
        <>
          {category.source ? ' · ' : ''}
          Official source:{' '}
          <a href={workSource.url} target="_blank" rel="noopener noreferrer" className={LINK}>
            {workSource.label} <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </>
      )}
      {category.guides?.map((gl) => (
        <span key={gl.slug}>
          {' · '}
          <Link href={`/guides/${gl.slug}`} className={LINK}>
            {gl.title}
          </Link>
        </span>
      ))}
    </span>
  );
}

// ── One line (view + inline edit) ────────────────────────────────────────────
function LineRow({
  item,
  plan,
  region,
  category,
  onPatch,
  onDelete,
}: {
  item: BudgetItem;
  plan: BudgetPlan;
  region: Region;
  category: CategoryDef;
  onPatch: (patch: Partial<Pick<BudgetItem, 'label' | 'amount' | 'period' | 'note'>>) => Promise<WriteOutcome>;
  onDelete: () => void;
}) {
  const uid = useId();
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [label, setLabel] = useState(item.label);
  const [amount, setAmount] = useState(editableAmount(item.amount));
  const [period, setPeriod] = useState<BudgetPeriod>(item.period);
  const [note, setNote] = useState(item.note ?? '');
  const [error, setError] = useState('');
  // The field the error is about — only that field is aria-invalid and described
  // by the message; a refusal from the server is about no field (review RH-5).
  const [errorField, setErrorField] = useState<'label' | 'amount' | null>(null);
  const [busy, setBusy] = useState(false);
  const editBtnRef = useRef<HTMLButtonElement>(null);
  const labelRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const removeBtnRef = useRef<HTMLButtonElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const confirmWasOpen = useRef(false);
  const wasEditing = useRef(false);
  // Synchronous latch: a double-Enter lands twice in one tick, before `busy` re-renders.
  const busyRef = useRef(false);
  // Focus lands only AFTER the render that shows the message and marks the
  // field: the invalid field (whose aria-describedby reads the message) or, for
  // a refusal, the message itself. The paragraph carries no role="alert", so
  // focus is the one announcement, never two (review A11Y-5); a new object per
  // error re-focuses an identical repeated one.
  const [errorFocus, setErrorFocus] = useState<{ field: 'label' | 'amount' | null } | null>(null);
  useEffect(() => {
    if (errorFocus) (errorFocus.field === 'label' ? labelRef : errorFocus.field === 'amount' ? amountRef : errorRef).current?.focus();
  }, [errorFocus]);
  const showError = (message: string, field: 'label' | 'amount' | null) => {
    setError(message);
    setErrorField(field);
    setErrorFocus({ field });
  };
  const clearError = () => {
    setError('');
    setErrorField(null);
  };

  // The edit form replaces the row's buttons and vice versa: focus the amount
  // field when it opens and return to the Edit button once it has re-mounted
  // (a synchronous focus() before the re-render would land on <body>).
  useEffect(() => {
    if (editing) amountRef.current?.focus();
    else if (wasEditing.current) editBtnRef.current?.focus();
    wasEditing.current = editing;
  }, [editing]);

  useEffect(() => {
    if (confirm) confirmBtnRef.current?.focus();
    else if (confirmWasOpen.current) removeBtnRef.current?.focus();
    confirmWasOpen.current = confirm;
  }, [confirm]);

  // Cancel waits while a save is in flight (shown unavailable): closing the edit
  // mid-save would let the save's answer close an edit reopened in the meantime.
  const cancel = () => {
    if (busyRef.current) return;
    setEditing(false);
    setLabel(item.label);
    setAmount(editableAmount(item.amount));
    setPeriod(item.period);
    setNote(item.note ?? '');
    clearError();
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (busyRef.current) return;
    const finalLabel = cleanLabel(label);
    const value = parseAmount(amount, currencyDecimals(plan.currency_code));
    if (!finalLabel) {
      showError('Give the line a name.', 'label');
      return;
    }
    if (value === null) {
      showError(amountError(plan.currency_code), 'amount');
      return;
    }
    clearError();
    busyRef.current = true;
    setBusy(true);
    try {
      const why = await onPatch({ label: finalLabel, amount: value, period, note: cleanText(note, BUDGET_LIMITS.note) || null });
      if (!why) setEditing(false);
      else showError(why, null); // the edit stays open with what was typed, ready to try again
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  if (editing) {
    return (
      <li className="py-3">
        <form onSubmit={(e) => void save(e)} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px_130px]" aria-label={`Edit ${item.label}`}>
          <div className="sm:col-span-3">
            <label htmlFor={`${uid}-l`} className={LABEL}>
              Line
            </label>
            <input
              ref={labelRef}
              id={`${uid}-l`}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={BUDGET_LIMITS.itemLabel}
              className={INPUT}
              aria-invalid={errorField === 'label' || undefined}
              aria-describedby={errorField === 'label' ? `${uid}-err` : undefined}
            />
          </div>
          <div className="sm:col-span-1">
            <label htmlFor={`${uid}-a`} className={LABEL}>
              Amount ({plan.currency_code})
            </label>
            <input
              ref={amountRef}
              id={`${uid}-a`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              autoComplete="off"
              className={INPUT}
              aria-invalid={errorField === 'amount' || undefined}
              aria-describedby={errorField === 'amount' ? `${uid}-err` : undefined}
            />
          </div>
          <div>
            <label htmlFor={`${uid}-p`} className={LABEL}>
              Period
            </label>
            <select id={`${uid}-p`} value={period} onChange={(e) => setPeriod(e.target.value as BudgetPeriod)} className={INPUT}>
              <option value="year">Per year</option>
              <option value="once">One-off</option>
            </select>
          </div>
          <div className="sm:col-span-3">
            <label htmlFor={`${uid}-n`} className={LABEL}>
              Note <span className="font-normal normal-case tracking-normal text-stone-500">(optional — no bank or card details)</span>
            </label>
            <input id={`${uid}-n`} value={note} onChange={(e) => setNote(e.target.value)} maxLength={BUDGET_LIMITS.note} className={INPUT} placeholder="e.g. from the 2027 fee page, or applied for" />
          </div>
          <p ref={errorRef} id={`${uid}-err`} tabIndex={-1} className={`m-0 text-sm text-red-700 outline-none sm:col-span-3 ${error ? '' : 'hidden'}`}>
            {error}
          </p>
          <div className="flex flex-wrap gap-2 sm:col-span-3">
            <button type="submit" className={BTN_PRIMARY} aria-busy={busy}>
              <Check className="h-4 w-4" aria-hidden="true" /> {busy ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={cancel} className={BTN_GHOST} aria-disabled={busy || undefined}>
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 py-3">
      <div className="min-w-0 flex-1">
        <p className="m-0 text-sm font-semibold text-ink">{item.label}</p>
        {item.note && <p className="m-0 mt-0.5 text-xs text-stone-700">{item.note}</p>}
        <p className="m-0 mt-0.5">
          <CategoryLinks category={category} region={region} forWork={item.category === 'work'} />
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className={item.period === 'year' ? CHIP_YEAR : CHIP_ONCE}>{PERIOD_LABEL[item.period]}</span>
        <span className="min-w-[6rem] text-right font-display text-base font-bold text-ink">{formatMoney(amountToCents(item.amount), plan.currency_code)}</span>
        {confirm ? (
          <span className="flex items-center gap-1">
            <button ref={confirmBtnRef} type="button" onClick={onDelete} className={`${BTN_DANGER} h-9`}>
              Remove
            </button>
            <button type="button" onClick={() => setConfirm(false)} className={BTN_GHOST}>
              Keep
            </button>
          </span>
        ) : (
          <>
            <button ref={editBtnRef} type="button" onClick={() => setEditing(true)} className={ICON_BTN} aria-label={`Edit ${item.label}`}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>
            <button ref={removeBtnRef} type="button" onClick={() => setConfirm(true)} className={ICON_BTN} aria-label={`Remove ${item.label}`}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </li>
  );
}

// ── Add a line ───────────────────────────────────────────────────────────────
function AddLineForm({
  id,
  kind,
  plan,
  region,
  categories,
  existingKeys,
  autoFocus,
  onSubmit,
  onClose,
}: {
  id: string;
  kind: BudgetKind;
  plan: BudgetPlan;
  region: Region;
  categories: CategoryDef[];
  existingKeys: Set<string>;
  /** True only when the visitor opened this form (never for a column's auto-opened form). */
  autoFocus: boolean;
  /** Resolves to null when it saved, or the reason it did not (shown in the form). */
  onSubmit: (input: Omit<BudgetItem, 'id' | 'created_at' | 'updated_at'>) => Promise<WriteOutcome>;
  onClose: () => void;
}) {
  const uid = useId();
  const options = [...categories, OTHER_CATEGORY];
  // Default to the first suggested line not yet in the budget, else "Something else".
  const firstFree = categories.find((c) => !existingKeys.has(c.key)) ?? OTHER_CATEGORY;
  const [key, setKey] = useState(firstFree.key);
  const category = options.find((c) => c.key === key) ?? OTHER_CATEGORY;
  // A suggested line is named after its category (renamed later with Edit); only
  // "Something else" is named here, so a missing name always has its field on
  // screen (review RH-5: an edited-then-cleared name used to hide the one field
  // that could fix "Give the line a name.").
  const [customLabel, setCustomLabel] = useState('');
  const label = category.key === 'other' ? customLabel : category.label;
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<BudgetPeriod>(firstFree.defaultPeriod);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  // The field the error is about — only that field is aria-invalid and described
  // by the message; a refusal from the server is about no field (review RH-5).
  const [errorField, setErrorField] = useState<'label' | 'amount' | null>(null);
  const [busy, setBusy] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);
  const labelRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const busyRef = useRef(false);
  // Focus lands only AFTER the render that shows the message and marks the
  // field (a synchronous focus() ran before React committed the text, and on a
  // first error the paragraph was still display:none): the invalid field, whose
  // aria-describedby reads the message, or — for a refusal — the message
  // itself. The paragraph carries no role="alert", so focus is the one
  // announcement, never two (review A11Y-5); a new object per error re-focuses
  // an identical repeated one.
  const [errorFocus, setErrorFocus] = useState<{ field: 'label' | 'amount' | null } | null>(null);
  useEffect(() => {
    if (errorFocus) (errorFocus.field === 'label' ? labelRef : errorFocus.field === 'amount' ? amountRef : errorRef).current?.focus();
  }, [errorFocus]);
  const showError = (message: string, field: 'label' | 'amount' | null) => {
    setError(message);
    setErrorField(field);
    setErrorFocus({ field });
  };
  const clearError = () => {
    setError('');
    setErrorField(null);
  };

  useEffect(() => {
    if (autoFocus) selectRef.current?.focus();
  }, [autoFocus]);

  const pick = (k: string) => {
    const c = options.find((o) => o.key === k) ?? OTHER_CATEGORY;
    setKey(c.key);
    setPeriod(c.defaultPeriod);
    // A name error belongs to the "Name it" field, which a suggested line does not show.
    if (errorField === 'label') clearError();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busyRef.current) return;
    const finalLabel = cleanLabel(label);
    const value = parseAmount(amount, currencyDecimals(plan.currency_code));
    if (!finalLabel) {
      showError('Give the line a name.', 'label');
      return;
    }
    if (value === null) {
      showError(amountError(plan.currency_code), 'amount');
      return;
    }
    clearError();
    busyRef.current = true;
    setBusy(true);
    let why: WriteOutcome = null;
    try {
      why = await onSubmit({ plan_id: plan.id, kind, category: category.key, label: finalLabel, amount: value, period, note: cleanText(note, BUDGET_LIMITS.note) || null });
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
    if (why) {
      showError(why, null); // the line stays filled in, ready to try again
      return;
    }
    // Rapid entry: move to the next suggested line, keep the form open.
    const nextFree = categories.find((c) => !existingKeys.has(c.key) && c.key !== category.key) ?? OTHER_CATEGORY;
    setKey(nextFree.key);
    setCustomLabel('');
    setPeriod(nextFree.defaultPeriod);
    setAmount('');
    setNote('');
    selectRef.current?.focus();
  };

  // While a line is saving the form stays open: × and Close wait (shown
  // unavailable, still focusable), so neither can seem to stop a save that then lands.
  const close = () => {
    if (!busyRef.current) onClose();
  };

  return (
    <form id={id} onSubmit={(e) => void submit(e)} className="rounded-xl border border-forest-200 bg-forest-50/50 p-4" aria-labelledby={`${uid}-h`}>
      <div className="flex items-start justify-between gap-3">
        <h4 id={`${uid}-h`} className="text-sm font-semibold text-ink m-0">
          Add a {kind === 'cost' ? 'cost' : 'funding'} line
        </h4>
        <button type="button" onClick={close} className={CLOSE_X} aria-label="Close the add-line form" aria-disabled={busy || undefined}>
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={`${uid}-c`} className={LABEL}>
            Line
          </label>
          <div className="relative">
            <select ref={selectRef} id={`${uid}-c`} value={key} onChange={(e) => pick(e.target.value)} className={`${INPUT} appearance-none pr-9`} aria-describedby={`${uid}-chelp`}>
              {options.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                  {existingKeys.has(c.key) && c.key !== 'other' ? ' · added' : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" aria-hidden="true" />
          </div>
          <p id={`${uid}-chelp`} className="m-0 mt-1 text-xs leading-relaxed text-stone-600">
            {category.hint}{' '}
            <CategoryLinks category={category} region={region} forWork={category.key === 'work'} />
          </p>
        </div>
        {category.key === 'other' && (
          <div className="sm:col-span-2">
            <label htmlFor={`${uid}-l`} className={LABEL}>
              Name it
            </label>
            <input
              ref={labelRef}
              id={`${uid}-l`}
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              maxLength={BUDGET_LIMITS.itemLabel}
              className={INPUT}
              placeholder={kind === 'cost' ? 'e.g. Deposit to secure the place' : 'e.g. Sale of a vehicle'}
              aria-invalid={errorField === 'label' || undefined}
              aria-describedby={errorField === 'label' ? `${uid}-err` : undefined}
            />
          </div>
        )}
        <div>
          <label htmlFor={`${uid}-a`} className={LABEL}>
            Amount ({plan.currency_code})
          </label>
          <input
            ref={amountRef}
            id={`${uid}-a`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            autoComplete="off"
            className={INPUT}
            placeholder="e.g. 12500"
            aria-invalid={errorField === 'amount' || undefined}
            aria-describedby={errorField === 'amount' ? `${uid}-err` : undefined}
          />
        </div>
        <div>
          <label htmlFor={`${uid}-p`} className={LABEL}>
            Period
          </label>
          <select id={`${uid}-p`} value={period} onChange={(e) => setPeriod(e.target.value as BudgetPeriod)} className={INPUT}>
            <option value="year">Per year</option>
            <option value="once">One-off</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${uid}-n`} className={LABEL}>
            Note <span className="font-normal normal-case tracking-normal text-stone-500">(optional — no bank or card details)</span>
          </label>
          <input id={`${uid}-n`} value={note} onChange={(e) => setNote(e.target.value)} maxLength={BUDGET_LIMITS.note} className={INPUT} placeholder="e.g. from the 2027 fee page, or applied for" />
        </div>
      </div>
      <p ref={errorRef} id={`${uid}-err`} tabIndex={-1} className={`m-0 mt-3 text-sm text-red-700 outline-none ${error ? '' : 'hidden'}`}>
        {error}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="submit" className={BTN_PRIMARY} aria-busy={busy}>
          <Plus className="h-4 w-4" aria-hidden="true" /> {busy ? 'Adding…' : 'Add line'}
        </button>
        <button type="button" onClick={close} className={BTN_GHOST} aria-disabled={busy || undefined}>
          Close
        </button>
      </div>
    </form>
  );
}

// ── Budget settings (rename, currency, years, intake, notes, remove) ─────────
function PlanSettings({
  plan,
  region,
  onPatch,
  onDelete,
}: {
  plan: BudgetPlan;
  region: Region;
  onPatch: (id: string, patch: Partial<Pick<BudgetPlan, 'label' | 'currency_code' | 'years' | 'intake' | 'notes'>>, announce?: string) => Promise<WriteOutcome>;
  onDelete: () => void;
}) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(plan.label);
  const [currency, setCurrency] = useState(plan.currency_code);
  const [years, setYears] = useState(plan.years);
  const [intake, setIntake] = useState(plan.intake ?? '');
  const [notes, setNotes] = useState(plan.notes ?? '');
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
    const finalLabel = cleanText(label, BUDGET_LIMITS.label);
    if (!finalLabel) {
      setError('Give the budget a name.');
      return;
    }
    setError('');
    busyRef.current = true;
    setBusy(true);
    try {
      const why = await onPatch(
        plan.id,
        { label: finalLabel, currency_code: currency, years: cleanYears(years), intake: cleanText(intake, BUDGET_LIMITS.intake) || null, notes: cleanNotes(notes) || null },
        'Budget settings saved.',
      );
      if (why) setError(why);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  return (
    <div className={CARD}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`${uid}-panel`}
        className="flex w-full items-center justify-between gap-2 text-left text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 rounded-lg"
      >
        Budget settings
        <ChevronDown className={`h-4 w-4 text-stone-500 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <form id={`${uid}-panel`} onSubmit={(e) => void save(e)} className="mt-4 space-y-3">
          <div>
            <label htmlFor={`${uid}-label`} className={LABEL}>
              Name
            </label>
            <input id={`${uid}-label`} value={label} onChange={(e) => setLabel(e.target.value)} maxLength={BUDGET_LIMITS.label} className={INPUT} />
          </div>
          <div>
            <label htmlFor={`${uid}-cur`} className={LABEL}>
              Currency
            </label>
            <select id={`${uid}-cur`} value={currency} onChange={(e) => setCurrency(e.target.value)} className={INPUT} aria-describedby={`${uid}-curhelp`}>
              {/* A stored code outside the list (only possible via the API) still shows as selected. */}
              {!isKnownCurrency(plan.currency_code) && <option value={plan.currency_code}>{plan.currency_code}</option>}
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.label}
                </option>
              ))}
            </select>
            <p id={`${uid}-curhelp`} className="m-0 mt-1 text-xs text-stone-600">
              Changing this relabels the budget only — no line is converted; every amount stays the number you typed.
            </p>
          </div>
          <div>
            <label htmlFor={`${uid}-years`} className={LABEL}>
              Programme length
            </label>
            <select id={`${uid}-years`} value={years} onChange={(e) => setYears(Number(e.target.value))} className={INPUT}>
              {Array.from({ length: BUDGET_LIMITS.yearsMax }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'year' : 'years'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${uid}-intake`} className={LABEL}>
              Intake <span className="font-normal normal-case tracking-normal text-stone-500">(optional)</span>
            </label>
            <input id={`${uid}-intake`} value={intake} onChange={(e) => setIntake(e.target.value)} maxLength={BUDGET_LIMITS.intake} className={INPUT} list={`${uid}-intakes`} />
            <datalist id={`${uid}-intakes`}>
              {region.intakes.map((i) => (
                <option key={i} value={i} />
              ))}
            </datalist>
          </div>
          <div>
            <label htmlFor={`${uid}-notes`} className={LABEL}>
              Notes <span className="font-normal normal-case tracking-normal text-stone-500">(private — no bank or card details)</span>
            </label>
            <textarea id={`${uid}-notes`} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={BUDGET_LIMITS.notes} rows={4} className={`${FIELD} py-2`} />
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
                <p className="m-0 w-full text-sm text-stone-700">Remove this budget and all its lines? This cannot be undone.</p>
                <button ref={confirmBtnRef} type="button" onClick={onDelete} className={BTN_DANGER}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove budget
                </button>
                <button type="button" onClick={() => setConfirm(false)} className={BTN_GHOST}>
                  Keep it
                </button>
              </div>
            ) : (
              <button ref={removeBtnRef} type="button" onClick={() => setConfirm(true)} className={`${BTN_GHOST} text-red-700 hover:text-red-800`}>
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove this budget
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

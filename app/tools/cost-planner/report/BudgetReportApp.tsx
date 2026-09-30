'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRegion } from '@/components/RegionProvider';
import { useAudience } from '@/components/AudienceProvider';
import { defaultAudienceFor } from '@/lib/audience';
import { getRegionBySlug } from '@/lib/regions';
import ReportView from '@/components/tools/ReportView';
import { RecordPicker, ReportNotice, ReportOffline } from '@/components/tools/ReportStates';
import { LOAD_FAILED_HELP, ToolSkeleton, ToolSessionEnded } from '@/components/tools/ToolStates';
import { buildBudgetReport } from '@/lib/reports/budget-report';
import { defaultPaperFor, type Paper } from '@/lib/reports/model';
import { TIMED_OUT, checkToolSession, explainLoadFailure, withDeadline } from '@/lib/tools-shared';
import { toolHref } from '@/lib/tools';
import type { BudgetItem, BudgetPlan } from '@/lib/cost-planner';

/**
 * The Cost & Funding Planner report — one budget: `?budget=<id>` when the
 * student came from a specific budget, otherwise the most recently updated
 * budget for the destination in context. The picker offers that destination's
 * budgets; changing the header's destination re-tunes the default in place.
 * A budget deep-linked from another destination still renders, labelled with
 * its own destination (its facts are its own — never re-skinned).
 *
 * The first read runs under the tools' shared deadline (lib/tools-shared
 * withDeadline): a stalled connection ends on the offline card, never a
 * skeleton for ever. Choosing another budget keeps the address bar's fragment
 * (`#region=`, the destination a hub handed over), so a reload keeps it too.
 */

type LoadState = 'loading' | 'ready' | 'setup' | 'error' | 'offline' | 'signed-out';
const TOOL = toolHref('cost-planner');
const PATH = `${TOOL}/report`;

const newestFirst = (a: BudgetPlan, b: BudgetPlan): number => (b.updated_at || b.created_at).localeCompare(a.updated_at || a.created_at);

export default function BudgetReportApp() {
  const { effectiveRegion } = useRegion();
  const { chosenAudience } = useAudience();
  const router = useRouter();
  const params = useSearchParams();
  const wanted = params.get('budget');

  const [load, setLoad] = useState<LoadState>('loading');
  const [plans, setPlans] = useState<BudgetPlan[]>([]);
  const [allItems, setAllItems] = useState<BudgetItem[]>([]);
  const [includeNotes, setIncludeNotes] = useState(false);
  const [paperChoice, setPaperChoice] = useState<Paper | null>(null);

  useEffect(() => {
    let active = true;
    void withDeadline<LoadState | null>(async (signal, expired) => {
      const s = await checkToolSession();
      if (!active || expired()) return null;
      // The auth server could not be reached: say so (the session is untouched) rather than spin forever.
      if (s.kind === 'offline') return 'offline';
      // Signed out: the gate normally swaps in the sign-in card; never leave a spinner if it does not.
      if (s.kind !== 'ok') return 'signed-out';
      const [a, b] = await Promise.all([
        s.supabase.from('budget_plans').select('*').eq('user_id', s.user.id).order('created_at', { ascending: true }).range(0, 49).abortSignal(signal),
        s.supabase.from('budget_items').select('*').eq('user_id', s.user.id).order('created_at', { ascending: true }).range(0, 999).abortSignal(signal),
      ]);
      if (!active || expired()) return null;
      const err = a.error ?? b.error;
      // A failed read is most often the connection: ask before blaming anything else.
      if (err) return explainLoadFailure(err);
      setPlans((a.data ?? []) as BudgetPlan[]);
      setAllItems((b.data ?? []) as BudgetItem[]);
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

  // In a sentence after "for": "No budget for the United States yet" (lib/regions proseName).
  const regionProse = getRegionBySlug(effectiveRegion)?.proseName ?? effectiveRegion;
  const regionPlans = useMemo(() => plans.filter((p) => p.region === effectiveRegion).sort(newestFirst), [plans, effectiveRegion]);
  const plan = useMemo<BudgetPlan | null>(() => (wanted ? plans.find((p) => p.id === wanted) : undefined) ?? regionPlans[0] ?? null, [wanted, plans, regionPlans]);
  const items = useMemo(() => (plan ? allItems.filter((it) => it.plan_id === plan.id) : []), [allItems, plan]);
  const domestic = plan ? (chosenAudience ?? defaultAudienceFor(plan.region)) === 'domestic' : false;
  const notesAvailable = Boolean(plan && (plan.notes?.trim() || items.some((it) => Boolean(it.note?.trim()))));
  const withNotes = includeNotes && notesAvailable;
  const doc = useMemo(() => (plan ? buildBudgetReport({ plan, items, includeNotes: withNotes, domestic }) : null), [plan, items, withNotes, domestic]);

  // The picker lists the destination's budgets; a deep-linked budget from elsewhere is shown too, labelled with its destination.
  const options = useMemo(() => {
    const list = regionPlans.map((p) => ({ id: p.id, label: `${p.label} · ${p.currency_code}` }));
    if (plan && !regionPlans.some((p) => p.id === plan.id)) {
      list.unshift({ id: plan.id, label: `${plan.label} · ${plan.currency_code} (${getRegionBySlug(plan.region)?.displayName ?? plan.region})` });
    }
    return list;
  }, [regionPlans, plan]);

  if (load === 'loading') return <ToolSkeleton label="Loading your budgets…" />;
  if (load === 'setup') {
    return <ReportNotice title="The cost planner is being switched on" text="Its tables are not created yet, so there is nothing to report on. Please check back soon." href={TOOL} linkLabel="Open the cost planner" />;
  }
  if (load === 'signed-out') return <ToolSessionEnded />;
  if (load === 'offline') {
    return <ReportOffline href={TOOL} linkLabel="Open the cost planner" />;
  }
  if (load === 'error') {
    return <ReportNotice alert title="Could not load your budgets" text={LOAD_FAILED_HELP} href={TOOL} linkLabel="Open the cost planner" />;
  }
  if (!plan || !doc) {
    return (
      <ReportNotice
        title={`No budget for ${regionProse} yet`}
        text="The report covers a budget for the destination chosen in the header. Create one in the cost planner first — or change the destination above."
        href={TOOL}
        linkLabel="Open the cost planner"
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
      paper={paperChoice ?? defaultPaperFor(plan.region)}
      onPaper={setPaperChoice}
      // The fragment stays (a hub's `#region=` hand-off survives a reload); `scroll: false` also keeps Next from hash-scrolling to it.
      picker={<RecordPicker label="Budget" value={plan.id} options={options} onChange={(id) => router.replace(`${PATH}?budget=${encodeURIComponent(id)}${window.location.hash}`, { scroll: false })} />}
    />
  );
}

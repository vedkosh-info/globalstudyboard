/**
 * Cost & Funding Planner → ReportDocument. Pure: a budget and its lines in, a
 * document out.
 *
 * Money rules (§18): every amount is the student's own, in the budget's one
 * currency, exactly as entered — the report totals them (integer cents, the
 * same arithmetic as the tool), converts nothing, quotes no exchange rate and
 * never says whether the funding "is enough" for any visa rule. The
 * not-financial-advice line sits right under the totals, and a line links an
 * official page on it only where we have one (a dash otherwise — never an
 * implied link; the page need not state the figure, so no copy says it does).
 * The student-visa financial pages are listed country by country with what each
 * was found to say, and the destination's countries we do not cover are named
 * (independent review CRIT2-4). A page cited both for a line and for a
 * country's financial rule is listed once, naming both (G7-SK-1).
 */

import { getRegionBySlug, type RegionSlug } from '@/lib/regions';
import {
  DESTINATION_BUDGETS,
  PERIOD_LABEL,
  amountToCents,
  categoryFor,
  cleanYears,
  formatMoney,
  fundsCoverage,
  joinCountries,
  planTotals,
  type BudgetItem,
  type BudgetPlan,
  type FundsSource,
} from '@/lib/cost-planner';
import { DASH, cell, dedupeLinks, fileSlug, type Cell, type ReportDocument, type ReportLink, type ReportSection, type TableSection } from '@/lib/reports/model';

export interface BudgetReportInput {
  plan: BudgetPlan;
  /** Any of the student's lines — the builder keeps only those with this plan's id (defence in depth; callers need not pre-filter). */
  items: BudgetItem[];
  includeNotes: boolean;
  /** A domestic student sees no visa financial-rule pointer (§16.7), exactly as in the tool. */
  domestic?: boolean;
  now?: Date;
}

export function buildBudgetReport(input: BudgetReportInput): ReportDocument {
  const now = input.now ?? new Date();
  const { plan } = input;
  const region: RegionSlug = plan.region;
  const r = getRegionBySlug(region);
  const regionName = r?.displayName ?? region;
  const cur = plan.currency_code;
  const money = (cents: number): Cell => cell(formatMoney(cents, cur), { align: 'right' });
  const items = input.items.filter((it) => it.plan_id === plan.id);
  const costs = items.filter((it) => it.kind === 'cost');
  const funding = items.filter((it) => it.kind === 'funding');
  const t = planTotals(items, plan.years);
  const years = cleanYears(plan.years); // the same 1–8 clamp planTotals applies, so the label and the arithmetic can never disagree

  const lineTable = (heading: string, kind: 'cost' | 'funding', rows: BudgetItem[]): TableSection => ({
    kind: 'table',
    heading,
    columns: [
      { label: 'Line', weight: 2.2 },
      { label: 'Category', weight: 1.6 },
      { label: 'Period', weight: 0.8 },
      { label: `Amount (${cur})`, align: 'right', weight: 1.2 },
      { label: 'Official page', weight: 1.8 },
    ],
    rows: rows.map((it) => {
      const def = categoryFor(region, kind, it.category);
      return [
        cell(it.label, { strong: true }),
        def.key === 'other' ? cell('Your own line', { muted: true }) : def.label,
        PERIOD_LABEL[it.period],
        money(amountToCents(it.amount)),
        def.source ? cell(def.source.label, { url: def.source.url }) : cell(DASH, { muted: true }),
      ];
    }),
    empty: kind === 'cost' ? 'No cost lines yet.' : 'No funding lines yet.',
  });

  const sections: ReportSection[] = [];

  sections.push({
    kind: 'facts',
    heading: 'Budget',
    items: [
      { label: 'Destination', value: regionName },
      { label: 'Currency', value: `${cur} — every amount as entered, never converted` },
      { label: 'Programme length', value: `${years} ${years === 1 ? 'year' : 'years'} (per-year lines are multiplied by this)` },
      { label: 'Intake', value: plan.intake ?? cell('Not set', { muted: true }) },
    ],
  });

  sections.push(lineTable('Costs', 'cost', costs));
  sections.push(lineTable('Funding', 'funding', funding));

  const diffLabel = t.difference < 0 ? 'Still to arrange' : t.difference > 0 ? 'Funding exceeds costs by' : 'Costs and funding are equal';
  sections.push({
    kind: 'table',
    heading: 'Totals (whole programme)',
    intro: `One-off lines are counted once; per-year lines are multiplied by ${years} ${years === 1 ? 'year' : 'years'}.`,
    columns: [
      { label: '', weight: 3 },
      { label: `Amount (${cur})`, align: 'right', weight: 1.4 },
    ],
    rows: [
      ['Costs per year', money(t.costPerYear)],
      [`Costs per year × ${years}`, money(t.costPerYear * years)],
      ['One-off costs', money(t.costOnce)],
      [cell('Costs, whole programme', { strong: true }), cell(formatMoney(t.costTotal, cur), { align: 'right', strong: true })],
      ['Funding per year', money(t.fundingPerYear)],
      [`Funding per year × ${years}`, money(t.fundingPerYear * years)],
      ['One-off funding', money(t.fundingOnce)],
      [cell('Funding, whole programme', { strong: true }), cell(formatMoney(t.fundingTotal, cur), { align: 'right', strong: true })],
      [cell(diffLabel, { strong: true }), cell(t.difference === 0 ? DASH : formatMoney(Math.abs(t.difference), cur), { align: 'right', strong: true })],
    ],
  });

  // §16.7: a domestic student of the destination gets no visa financial-rule pointer, exactly as in the tool.
  const coverage = input.domestic ? null : fundsCoverage(DESTINATION_BUDGETS[region].fundsRule, r?.countries ?? []);
  // The list form the tool's card and the shell use: country names read as a
  // list, not after "for" (where most would need an article — "the Philippines",
  // "the United Arab Emirates"), and nothing leans on "it" (review G7-SK-5).
  const notCovered = coverage?.notCovered.length
    ? ` Not covered here: ${joinCountries(coverage.notCovered)} — confirm the financial rule with the embassy or immigration authority concerned.`
    : '';
  sections.push({
    kind: 'callout',
    text: `These totals are arithmetic on your own figures, in ${cur}, exactly as entered: no conversion, no exchange rate and no estimate by GlobalStudyBoard. They are not financial advice and say nothing about whether any visa’s financial requirement is met — check that rule on the official immigration source.${notCovered}`,
  });

  const notes: string[] = [];
  if (input.includeNotes) {
    if (plan.notes?.trim()) notes.push(plan.notes.trim());
    for (const it of items) if (it.note?.trim()) notes.push(`${it.label}: ${it.note.trim()}`);
  }
  if (notes.length) sections.push({ kind: 'text', heading: 'Your private notes', paragraphs: notes });

  // One entry per page, naming every role it is cited for ("{roles} — {page}").
  // A page can be both a line's official page and a country's student-visa
  // financial page — India's e-Visa page, Russia's admission portal, Australia's
  // subclass 500 page — and dedupeLinks keeps only the first label, which hid
  // the funds-rule finding behind the line's (independent review G7-SK-1). The
  // funds-rule label names the page, because it says what the page was found to
  // say; entries keep the order they are first cited in.
  const cited = new Map<string, { roles: string[]; page: string; url: string }>();
  const cite = (role: string, page: string, url: string, namesPage = false) => {
    const key = citedKey(url);
    const prev = cited.get(key);
    if (!prev) {
      cited.set(key, { roles: [role], page, url });
      return;
    }
    if (!prev.roles.includes(role)) prev.roles.push(role);
    if (namesPage) prev.page = page;
  };
  for (const it of items) {
    const def = categoryFor(region, it.kind, it.category);
    if (def.source) cite(def.label, def.source.label, def.source.url);
  }
  if (coverage) {
    const tag = (country: string) => ((r?.countries.length ?? 1) > 1 ? ` (${country})` : '');
    const role: Record<FundsSource['finding'], string> = {
      states: 'Student-visa financial requirement',
      asks: 'Student-visa application, asks about your financial support, states no requirement',
      none: 'Student-visa document list, no financial document named',
    };
    for (const { country, sources: pages } of [...coverage.published, ...coverage.asked, ...coverage.noneListed]) {
      for (const s of pages) cite(`${role[s.finding]}${tag(country)}`, s.label, s.url, true);
    }
  }
  const sources: ReportLink[] = [...cited.values()].map((c) => ({ label: `${c.roles.join('; ')} — ${c.page}`, url: c.url }));

  return {
    tool: 'cost-planner',
    toolName: 'Cost & Funding Planner',
    title: `Budget — ${plan.label}`,
    subtitle: `${regionName} · ${cur} · ${years} ${years === 1 ? 'year' : 'years'}${plan.intake ? ` · ${plan.intake}` : ''}`,
    region,
    regionName,
    generatedAt: now.toISOString(),
    intro: `The costs and funding you recorded for studying in ${r?.proseName ?? regionName}, in ${cur}. Where we have an official page on a line, it is linked; a dash means we have none.`,
    sections,
    sources: dedupeLinks(sources),
    includesNotes: notes.length > 0,
    fileStem: `globalstudyboard-budget-${fileSlug(plan.label, region)}`,
  };
}

/**
 * The page a cited address points at — the same normalisation dedupeLinks
 * applies (host without "www.", no trailing slash), so two spellings of one
 * page merge into one entry here instead of losing a role there.
 */
function citedKey(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname.toLowerCase().replace(/^www\./, '')}${u.port ? `:${u.port}` : ''}${u.pathname.replace(/\/+$/, '')}${u.search}${u.hash}`;
  } catch {
    return url;
  }
}

'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { BookmarkPlus, Download, ExternalLink, Plus, RotateCw, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRegion } from '@/components/RegionProvider';
import RegionFlag from '@/components/RegionFlag';
import ReportView from '@/components/tools/ReportView';
import { ToolLoadError, ToolOffline, ToolSessionEnded, ToolSetup, ToolSkeleton } from '@/components/tools/ToolStates';
import { getRegionBySlug, type RegionSlug } from '@/lib/regions';
import { activeScholarshipTasks, cleanScholarshipText, cleanScholarshipUrl, formatScholarshipDue, isScholarshipClosed, newScholarshipId, SCHOLARSHIP_LIMITS, scholarshipCsv, scholarshipTasksFor, type ScholarshipBudgetResult, type ScholarshipEntry, type ScholarshipTask } from '@/lib/scholarship-tracker';
import { SCHOLARSHIP_DISCOVERY_COPY, type ScholarshipOption } from '@/lib/scholarship-options';
import { SCHOLARSHIP_UI as UI } from '@/lib/scholarship-ui';
import { buildScholarshipReport } from '@/lib/reports/scholarship-report';
import { defaultPaperFor, type Paper } from '@/lib/reports/model';
import { saveBlob } from '@/lib/download-file';
import { todayIso } from '@/lib/planner';
import { useScholarships } from './useScholarships';
import ScholarshipCard, { type ScholarshipCardProps } from './ScholarshipCard';
import { CARD, INPUT, LABEL, LINK, PRIMARY, SECONDARY } from './styles';

const row = <T,>(value: T | T[]): T => Array.isArray(value) ? value[0] : value;
const isOption = (value: unknown): value is ScholarshipOption => {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return ['slug', 'name', 'provider', 'region', 'officialUrl', 'guideTitle', 'sourceReviewed'].every((k) => typeof v[k] === 'string') && Boolean(getRegionBySlug(v.region as RegionSlug)) && Boolean(cleanScholarshipUrl(v.officialUrl as string)) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.slug as string);
};

export default function ScholarshipApp() {
  const { effectiveRegion } = useRegion();
  const region = getRegionBySlug(effectiveRegion)!;
  const data = useScholarships();
  const { entries, tasks, setEntries, setTasks, mutate, notify } = data;
  const [options, setOptions] = useState<ScholarshipOption[]>([]);
  const [catalogueState, setCatalogueState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [catalogueRetry, setCatalogueRetry] = useState(0);
  const [names, setNames] = useState<Partial<Record<RegionSlug, string>>>({});
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [more, setMore] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [includeNotes, setIncludeNotes] = useState(false);
  const [paper, setPaper] = useState<Paper | null>(null);
  const [hint, setHint] = useState<{ award: string | null; entry: string | null }>({ award: null, entry: null });
  const quickIds = useRef(new Map<string, string>());
  const nameInput = useRef<HTMLInputElement>(null);
  const regionRef = useRef(effectiveRegion);
  regionRef.current = effectiveRegion;
  const name = names[effectiveRegion] ?? '';
  const onDirty = useCallback((id: string, value: boolean) => setDirty((old) => old[id] === value ? old : { ...old, [id]: value }), []);
  const hasDrafts = Object.values(dirty).some(Boolean) || Object.values(names).some((value) => value?.trim());
  useEffect(() => {
    if (!hasDrafts) return;
    let leaving = false;
    let reset: ReturnType<typeof setTimeout> | undefined;
    const warn = (event: BeforeUnloadEvent) => { if (!leaving) { event.preventDefault(); event.returnValue = ''; } };
    // Next's same-tab links do not unload the document. Protect those drafts
    // too, while leaving new tabs, downloads and in-page navigation alone.
    const follow = (event: MouseEvent) => {
      if (leaving || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
      if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
      const to = new URL(link.href, window.location.href);
      if (!['http:', 'https:'].includes(to.protocol) || (to.origin === window.location.origin && to.pathname === window.location.pathname && to.search === window.location.search)) return;
      if (!window.confirm(UI.leaveConfirm)) { event.preventDefault(); event.stopImmediatePropagation(); return; }
      leaving = true;
      // If the navigation fails or is cancelled elsewhere, later clicks must
      // still protect the draft. A full-page navigation uses this same consent.
      reset = setTimeout(() => { leaving = false; }, 1000);
    };
    window.addEventListener('beforeunload', warn);
    document.addEventListener('click', follow, true);
    return () => { clearTimeout(reset); window.removeEventListener('beforeunload', warn); document.removeEventListener('click', follow, true); };
  }, [hasDrafts]);
  useEffect(() => {
    const read = () => {
      const fragment = new URLSearchParams(window.location.hash.slice(1));
      const entry = fragment.get('entry');
      setHint({ award: fragment.get('award'), entry: entry && /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(entry) ? entry : null });
    };
    read(); window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);
  useEffect(() => { if (hint.entry && entries.some((e) => e.id === hint.entry && e.region === effectiveRegion)) setExpanded(hint.entry); }, [hint.entry, entries, effectiveRegion]);
  useEffect(() => { setMore(false); setError(''); setFilter('all'); setIncludeNotes(false); }, [effectiveRegion]);
  useEffect(() => {
    let live = true;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 12_000);
    setCatalogueState('loading');
    void fetch('/tools/scholarship-tracker/catalogue', { signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer' })
      .then(async (response) => { if (!response.ok) throw new Error('catalogue'); const value: unknown = await response.json(); if (!value || typeof value !== 'object' || !('awards' in value) || !Array.isArray(value.awards) || !value.awards.every(isOption)) throw new Error('catalogue'); return value.awards; })
      .then((awards) => { if (live) { setOptions(awards); setCatalogueState('ready'); } })
      .catch(() => { if (live) setCatalogueState('error'); }).finally(() => window.clearTimeout(timer));
    return () => { live = false; controller.abort(); window.clearTimeout(timer); };
  }, [catalogueRetry]);

  const scoped = useMemo(() => entries.filter((entry) => entry.region === effectiveRegion), [entries, effectiveRegion]);
  const scopeTasks = activeScholarshipTasks(entries, tasks, effectiveRegion);
  const upcoming = scopeTasks.filter((t) => !t.done && t.due_on && t.due_on >= todayIso()).length;
  const overdue = scopeTasks.filter((t) => !t.done && t.due_on && t.due_on < todayIso()).length;
  const notesAvailable = scoped.some((e) => Boolean(e.notes?.trim()));
  const doc = useMemo(() => buildScholarshipReport({ region: effectiveRegion, entries, tasks, includeNotes: includeNotes && notesAvailable }), [effectiveRegion, entries, tasks, includeNotes, notesAvailable]);
  const preset = options.find((o) => o.slug === hint.award);
  const suggested = options.filter((o) => o.region === effectiveRegion && (!name.trim() || `${o.name} ${o.provider}`.toLowerCase().includes(name.trim().toLowerCase()))).sort((a, b) => Number(b.slug === hint.award) - Number(a.slug === hint.award));
  const shown = more ? suggested : suggested.slice(0, 3);
  const visibleEntries = scoped.filter((entry) => filter === 'all' || (filter === 'closed' ? isScholarshipClosed(entry) : !isScholarshipClosed(entry)));
  const visibleIds = new Set(visibleEntries.map((e) => e.id));
  const otherDraft = entries.some((e) => e.region !== effectiveRegion && dirty[e.id]) || Object.entries(names).some(([key, value]) => key !== effectiveRegion && value?.trim());

  const focusEntry = (id: string, destination: RegionSlug, open = true) => {
    if (open) setExpanded(id);
    setFilter('all');
    if (regionRef.current === destination) window.requestAnimationFrame(() => document.getElementById(`scholarship-${id}`)?.focus());
  };
  const add = async (option?: ScholarshipOption) => {
    if (data.busy) return;
    const destination = effectiveRegion;
    const title = option?.name ?? cleanScholarshipText(name);
    if (!title) { setError(UI.nameRequired); nameInput.current?.focus(); return; }
    const existing = option && scoped.find((e) => e.guide_slug === option.slug && !e.cycle);
    if (existing) { notify(UI.alreadySaved); focusEntry(existing.id, existing.region); return; }
    setError('');
    const key = option ? `${destination}:${option.slug}` : `${destination}:manual`;
    const id = quickIds.current.get(key) ?? newScholarshipId(); quickIds.current.set(key, id);
    const pending = !option ? entries.find((e) => e.id === id) : undefined;
    const result = await mutate<ScholarshipEntry | ScholarshipEntry[]>((session, signal) => session.supabase.rpc('save_scholarship_entry', { p_id: id, p_is_new: !pending, p_name: title, p_region: destination, p_provider: pending?.provider ?? option?.provider ?? null, p_official_url: pending?.official_url ?? option?.officialUrl ?? null, p_guide_slug: pending?.guide_slug ?? option?.slug ?? null, p_cycle: pending?.cycle ?? null, p_application_id: pending?.application_id ?? null, p_status: pending?.status ?? 'researching', p_notes: pending?.notes ?? null, p_expected_updated_at: pending?.updated_at ?? null }).abortSignal(signal), UI.savedNotice);
    if (!result) return;
    const saved = row(result);
    setEntries((old) => [saved, ...old.filter((e) => e.id !== saved.id)]);
    if (!option && saved.name !== title) { notify(UI.retryDifferent, true); await data.reload(); return; }
    quickIds.current.delete(key);
    setNames((old) => ({ ...old, [destination]: '' }));
    // The default checklist is written in the same transaction. Read it after the confirmed save.
    await data.reload();
    focusEntry(saved.id, destination, false);
  };
  const saveEntry: ScholarshipCardProps['onSave'] = async (entry, fields) => {
    const result = await mutate<ScholarshipEntry | ScholarshipEntry[]>((session, signal) => session.supabase.rpc('save_scholarship_entry', { p_id: entry.id, p_is_new: false, p_name: fields.name, p_region: entry.region, p_provider: fields.provider, p_official_url: fields.official_url, p_guide_slug: entry.guide_slug, p_cycle: fields.cycle, p_application_id: fields.application_id, p_status: fields.status, p_notes: fields.notes, p_expected_updated_at: entry.updated_at }).abortSignal(signal), UI.updated);
    if (!result) return false;
    const saved = row(result); setEntries((old) => old.map((e) => e.id === saved.id ? saved : e)); return true;
  };
  const deleteEntry: ScholarshipCardProps['onDelete'] = async (entry) => {
    const result = await mutate<Array<{ id: string }>>((session, signal) => session.supabase.from('scholarship_entries').delete().eq('id', entry.id).eq('user_id', session.user.id).select('id').abortSignal(signal), UI.removed);
    if (!result) return false;
    setEntries((old) => old.filter((e) => e.id !== entry.id)); setTasks((old) => old.filter((t) => t.scholarship_id !== entry.id)); onDirty(entry.id, false); nameInput.current?.focus(); return true;
  };
  const saveTask: ScholarshipCardProps['onTaskSave'] = async (entry, id, fields, existing) => {
    const previous = existing ?? tasks.find((task) => task.id === id);
    const result = await mutate<ScholarshipTask | ScholarshipTask[]>((session, signal) => session.supabase.rpc('save_scholarship_task', { p_id: id, p_is_new: !previous, p_scholarship_id: entry.id, p_title: fields.title, p_due_on: fields.due_on, p_done: fields.done, p_expected_updated_at: previous?.updated_at ?? null }).abortSignal(signal), UI.updated);
    if (!result) return false;
    const saved = row(result); setTasks((old) => [...old.filter((t) => t.id !== saved.id), saved]);
    if (saved.title !== fields.title || saved.due_on !== fields.due_on || saved.done !== fields.done) { notify(UI.retryDifferent, true); return false; }
    return true;
  };
  const deleteTask: ScholarshipCardProps['onTaskDelete'] = async (task) => {
    const result = await mutate<Array<{ id: string }>>((session, signal) => session.supabase.from('scholarship_tasks').delete().eq('id', task.id).eq('user_id', session.user.id).select('id').abortSignal(signal), UI.taskRemoved);
    if (!result) return false;
    setTasks((old) => old.filter((t) => t.id !== task.id)); return true;
  };
  const transferBudget: ScholarshipCardProps['onBudget'] = async (entry, plan, amount, period) => {
    const result = await mutate<ScholarshipBudgetResult>((session, signal) => session.supabase.rpc('add_scholarship_to_budget', { p_scholarship_id: entry.id, p_plan_id: plan.id, p_amount: amount, p_currency_code: plan.currency_code, p_period: period }).abortSignal(signal), UI.budgetAdded);
    if (!result) return false;
    if (result.already_added) notify(UI.budgetAlready);
    setEntries((old) => old.map((e) => e.id === entry.id ? { ...e, budget_item_id: result.item_id } : e));
    await data.reload(); return true;
  };

  const retryLoad = <button type="button" className={SECONDARY} onClick={() => { void data.reload(true); }}>{UI.retry}</button>;
  if (data.load === 'loading') return <ToolSkeleton label={UI.title} />;
  if (data.load === 'setup') return <ToolSetup name={UI.title} />;
  if (data.load === 'signed-out') return <ToolSessionEnded />;
  if (data.load === 'offline') return <div className="space-y-3"><ToolOffline />{retryLoad}</div>;
  if (data.load === 'error') return <div className="space-y-3"><ToolLoadError what={UI.list.toLowerCase()} />{retryLoad}</div>;

  return <div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="m-0 flex items-center gap-2 text-sm font-semibold text-forest-800"><RegionFlag slug={effectiveRegion} className="h-4" />{UI.region} {region.proseName}</p><p className="mb-0 mt-2 text-sm text-stone-600">{scoped.length} {UI.saved.toLowerCase()} · {upcoming} {UI.upcoming} {overdue > 0 ? `· ${overdue} ${UI.pastDue}` : ''}</p>{entries.length > scoped.length && <p className="mb-0 mt-1 text-sm text-stone-600">{UI.otherDestinations(entries.length - scoped.length)}</p>}</div>
      <button type="button" className={SECONDARY} aria-disabled={data.busy} onClick={async () => { if (!data.busy && await data.reload()) notify(UI.refreshDone); }}><RotateCw className="h-4 w-4" aria-hidden="true" />{UI.refresh}</button>
    </div>
    {data.notice && <div key={data.notice.seq} role={data.notice.error ? 'alert' : 'status'} className={`rounded-xl border p-4 text-base leading-relaxed ${data.notice.error ? 'border-red-200 bg-red-50 text-red-800' : 'border-forest-200 bg-forest-50 text-forest-800'}`}>{data.notice.text}</div>}
    {hasDrafts && <p role="status" className="rounded-xl border border-stone-200 bg-cream-50 p-4 text-sm text-stone-700">{UI.unsaved}</p>}
    {otherDraft && <p role="status" className="rounded-xl border border-stone-200 bg-cream-50 p-4 text-sm text-stone-700">{UI.switchedRegion}</p>}
    <section className={CARD} aria-labelledby="scholarship-add">
      <form onSubmit={(event: FormEvent) => { event.preventDefault(); void add(); }}>
        <label id="scholarship-add" htmlFor="scholarship-name" className={LABEL}>{UI.name}</label>
        <div className="flex flex-col gap-3 sm:flex-row"><input ref={nameInput} id="scholarship-name" className={INPUT} placeholder={UI.namePlaceholder} value={name} maxLength={SCHOLARSHIP_LIMITS.name} readOnly={data.busy} aria-invalid={Boolean(error)} aria-describedby={error ? 'scholarship-name-error' : 'scholarship-name-hint'} onChange={(event) => { setNames((old) => ({ ...old, [effectiveRegion]: event.target.value })); setError(''); }} /><button type="submit" className={`${PRIMARY} shrink-0`} aria-disabled={data.busy} aria-busy={data.busy}><Plus className="h-4 w-4" aria-hidden="true" />{data.busy ? UI.saving : UI.add}</button></div>
        <p id="scholarship-name-hint" className="mb-0 mt-3 text-sm text-stone-600">{UI.quickHint}</p>{error && <p id="scholarship-name-error" role="alert" className="mb-0 mt-2 text-sm text-red-700">{error}</p>}
      </form>
      <div className="mt-6 border-t border-stone-200 pt-5">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold text-ink"><Sparkles className="h-4 w-4 text-gold-600" aria-hidden="true" />{UI.explore}</h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">{UI.exploreHint}</p>
        {catalogueState === 'error' && <div role="status"><p className="text-sm text-stone-700">{UI.catalogueFailure}</p><button type="button" className={SECONDARY} onClick={() => setCatalogueRetry((n) => n + 1)}>{UI.retry}</button></div>}
        {catalogueState === 'loading' && <p role="status" className="text-sm text-stone-600">{UI.loadingSuggestions}</p>}
        {preset && preset.region !== effectiveRegion && <p role="status" className="rounded-xl bg-cream-50 p-3 text-sm text-stone-700">{UI.prefillOther}</p>}
        {hint.award && !preset && catalogueState === 'ready' && <p role="status" className="text-sm text-stone-700">{UI.prefillMissing}</p>}
        {shown.length > 0 && <ul className="mt-4 grid list-none gap-3 p-0 lg:grid-cols-2">{shown.map((option) => { const saved = scoped.find((e) => e.guide_slug === option.slug && !e.cycle); return <li key={option.slug} className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-cream-50 p-4"><div className="min-w-0"><h3 className="m-0 text-base font-semibold text-ink">{option.name}</h3><p className="mb-0 mt-1 text-sm text-stone-600">{option.provider}</p><p className="mb-0 mt-2 text-xs text-stone-600">{UI.identityChecked} {formatScholarshipDue(option.sourceReviewed)}</p></div><div className="mt-auto flex flex-wrap items-center gap-3"><button type="button" className={saved ? SECONDARY : PRIMARY} aria-disabled={data.busy} onClick={() => void add(option)}><BookmarkPlus className="h-4 w-4" aria-hidden="true" />{saved ? UI.saved : UI.add}</button><a href={option.officialUrl} target="_blank" rel="noopener noreferrer" className={`${LINK} inline-flex min-h-11 items-center gap-1 text-sm`}>{UI.official}<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a><Link href={`/guides/${option.slug}`} className={`${LINK} inline-flex min-h-11 items-center text-sm`}>{UI.guide}</Link></div></li>; })}</ul>}
        {catalogueState === 'ready' && !shown.length && <p className="text-sm text-stone-700">{UI.noMatchingSuggestions}</p>}
        {suggested.length > 3 && <button type="button" className={SECONDARY} onClick={() => setMore((old) => !old)}>{more ? UI.showLess : UI.showMore}</button>}
        {catalogueState === 'ready' && <p className="mb-0 mt-3 text-sm leading-relaxed text-stone-600">{SCHOLARSHIP_DISCOVERY_COPY.sourceNote}</p>}
      </div>
    </section>
    <section aria-labelledby="scholarship-list">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 id="scholarship-list" className="font-display text-2xl font-bold text-ink">{UI.list}</h2>{scoped.length > 0 && <div className="flex flex-wrap gap-2" aria-label={UI.list}>{(['all', 'active', 'closed'] as const).map((value) => <button key={value} type="button" aria-pressed={filter === value} className={filter === value ? PRIMARY : SECONDARY} onClick={() => setFilter(value)}>{UI[value]}</button>)}</div>}</div>
      {!scoped.length ? <div className="rounded-2xl border border-dashed border-stone-300 bg-cream-50 p-6 text-center"><BookmarkPlus className="mx-auto h-7 w-7 text-forest-700" aria-hidden="true" /><h3 className="mt-3 font-display text-xl font-bold text-ink">{UI.empty}</h3><p className="mx-auto mt-2 max-w-xl text-base leading-relaxed text-stone-700">{UI.emptyHint}</p></div> : !visibleEntries.length && <p className="text-base text-stone-600">{UI.nothingFiltered}</p>}
      <div className="space-y-4">{entries.map((entry) => <ScholarshipCard key={entry.id} entry={entry} tasks={scholarshipTasksFor(tasks, entry.id)} applications={data.applications.filter((a) => a.region === entry.region)} budgets={data.budgets.filter((b) => b.region === entry.region)} applicationsAvailable={data.applicationsAvailable} budgetsAvailable={data.budgetsAvailable} busy={data.busy} visible={visibleIds.has(entry.id)} open={expanded === entry.id} onDirty={onDirty} onSave={saveEntry} onDelete={deleteEntry} onTaskSave={saveTask} onTaskDelete={deleteTask} onBudget={transferBudget} />)}</div>
    </section>
    {scoped.length > 0 && <details className={CARD}><summary className="min-h-11 cursor-pointer py-2.5 text-base font-semibold text-forest-800">{UI.export}</summary><div className="mt-4 space-y-4"><button type="button" className={SECONDARY} onClick={() => { try { saveBlob(new Blob([scholarshipCsv(entries, tasks, effectiveRegion, includeNotes && notesAvailable)], { type: 'text/csv;charset=utf-8' }), `globalstudyboard-scholarships-${effectiveRegion}.csv`); notify(UI.csvDone); } catch { notify(UI.csvFailed, true); } }}><Download className="h-4 w-4" aria-hidden="true" />{UI.csv}</button><ReportView compact doc={doc} includeNotes={includeNotes} onIncludeNotes={setIncludeNotes} notesAvailable={notesAvailable} paper={paper ?? defaultPaperFor(effectiveRegion)} onPaper={setPaper} /></div></details>}
  </div>;
}

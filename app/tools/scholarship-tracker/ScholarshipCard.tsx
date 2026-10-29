'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Check, ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import ToolLink from '@/components/tools/ToolLink';
import { toolHref } from '@/lib/tools';
import { cleanScholarshipNotes, cleanScholarshipText, cleanScholarshipUrl, formatScholarshipDue, isScholarshipClosed, isScholarshipDate, newScholarshipId, nextScholarshipTask, SCHOLARSHIP_LIMITS as LIMITS, SCHOLARSHIP_STATUSES, SCHOLARSHIP_STATUS_LABEL, canTransferScholarship, type ScholarshipEntry, type ScholarshipTask, type ScholarshipStatus } from '@/lib/scholarship-tracker';
import type { PlannerApplication } from '@/lib/planner';
import type { BudgetPlan } from '@/lib/cost-planner';
import { currencyDecimals } from '@/lib/cost-planner';
import { SCHOLARSHIP_UI as UI } from '@/lib/scholarship-ui';
import { BUTTON, CARD, DANGER, INPUT, LABEL, LINK, PRIMARY, SECONDARY } from './styles';

export interface EntryFields { name: string; provider: string | null; official_url: string | null; cycle: string | null; application_id: string | null; notes: string | null; status: ScholarshipStatus }
export interface TaskFields { title: string; due_on: string | null; done: boolean }
export interface ScholarshipCardProps {
  entry: ScholarshipEntry;
  tasks: ScholarshipTask[];
  applications: PlannerApplication[];
  budgets: BudgetPlan[];
  applicationsAvailable: boolean;
  budgetsAvailable: boolean;
  busy: boolean;
  visible: boolean;
  open?: boolean;
  onDirty: (id: string, dirty: boolean) => void;
  onSave: (entry: ScholarshipEntry, fields: EntryFields) => Promise<boolean>;
  onDelete: (entry: ScholarshipEntry) => Promise<boolean>;
  onTaskSave: (entry: ScholarshipEntry, id: string, fields: TaskFields, existing?: ScholarshipTask) => Promise<boolean>;
  onTaskDelete: (task: ScholarshipTask) => Promise<boolean>;
  onBudget: (entry: ScholarshipEntry, plan: BudgetPlan, amount: string, period: 'once' | 'year') => Promise<boolean>;
}

const fieldsOf = (entry: ScholarshipEntry): EntryFields => ({ name: entry.name, provider: entry.provider, official_url: entry.official_url, cycle: entry.cycle, application_id: entry.application_id, notes: entry.notes, status: entry.status });

/** Drafts remain mounted when the destination/filter changes, so a student's unsaved work survives. */
export default function ScholarshipCard({ entry, tasks, applications, budgets, applicationsAvailable, budgetsAvailable, busy, visible, open, onDirty, onSave, onDelete, onTaskSave, onTaskDelete, onBudget }: ScholarshipCardProps) {
  const uid = useId();
  const [draft, setDraft] = useState(() => fieldsOf(entry));
  const [base, setBase] = useState(entry);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState('');
  const [remove, setRemove] = useState(false);
  const details = useRef<HTMLDetailsElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const [taskDirty, setTaskDirty] = useState(false);
  const [budgetDirty, setBudgetDirty] = useState(false);
  useEffect(() => { if (!dirty) { setDraft(fieldsOf(entry)); setBase(entry); } }, [entry, dirty]);
  useEffect(() => { onDirty(entry.id, dirty || taskDirty || budgetDirty); }, [entry.id, dirty, taskDirty, budgetDirty, onDirty]);
  useEffect(() => { if (open && details.current) details.current.open = true; }, [open]);
  const change = <K extends keyof EntryFields>(key: K, value: EntryFields[K]) => { setDraft((old) => ({ ...old, [key]: value })); setDirty(true); };
  const next = isScholarshipClosed(entry) ? undefined : nextScholarshipTask(tasks, entry.id);
  const complete = tasks.filter((t) => t.done).length;
  const conflict = dirty && base.updated_at !== entry.updated_at;
  const restoreLatest = () => { setDraft(fieldsOf(entry)); setBase(entry); setDirty(false); setError(''); };

  async function save(event: FormEvent) {
    event.preventDefault(); if (busy || conflict) return;
    const name = cleanScholarshipText(draft.name);
    const url = cleanScholarshipUrl(draft.official_url ?? '');
    if (!name) { setError(UI.nameRequired); nameInput.current?.focus(); return; }
    if (draft.official_url?.trim() && !url) { setError(UI.urlInvalid); document.getElementById(`${uid}-url`)?.focus(); return; }
    setError('');
    const ok = await onSave(base, { ...draft, name, provider: cleanScholarshipText(draft.provider ?? '', LIMITS.provider) || null, official_url: url || null, cycle: cleanScholarshipText(draft.cycle ?? '', LIMITS.cycle) || null, notes: cleanScholarshipNotes(draft.notes ?? '') || null });
    if (ok) setDirty(false);
  }

  return (
    <article hidden={!visible} className={CARD} aria-labelledby={`scholarship-${entry.id}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 id={`scholarship-${entry.id}`} tabIndex={-1} className="m-0 break-words font-display text-2xl font-bold tracking-editorial text-ink focus:outline-none">{entry.name}</h3>
          {(entry.provider || entry.cycle) && <p className="m-0 mt-1 break-words text-sm text-stone-600">{[entry.provider, entry.cycle].filter(Boolean).join(' · ')}</p>}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {entry.official_url && <a href={entry.official_url} target="_blank" rel="noopener noreferrer" className={`${LINK} inline-flex min-h-11 items-center gap-1`}>{UI.official}<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>}
            {entry.guide_slug && <Link href={`/guides/${entry.guide_slug}`} className={`${LINK} inline-flex min-h-11 items-center`}>{UI.guide}</Link>}
          </div>
        </div>
        <div className="w-full sm:w-48">
          <label htmlFor={`${uid}-status`} className={LABEL}>{UI.status}</label>
          <select id={`${uid}-status`} className={INPUT} value={dirty ? draft.status : entry.status} aria-disabled={busy} onChange={(e) => { if (busy) return; const status = e.target.value as ScholarshipStatus; if (dirty) change('status', status); else void onSave(entry, { ...fieldsOf(entry), status }); }}>
            {SCHOLARSHIP_STATUSES.map((status) => <option key={status} value={status}>{SCHOLARSHIP_STATUS_LABEL[status]}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-4 rounded-xl bg-cream-50 p-4">
        {next ? <div className="flex items-start gap-3"><button type="button" aria-label={`${UI.completed}: ${next.title}`} aria-disabled={busy} className={`${SECONDARY} h-11 w-11 shrink-0 px-0`} onClick={() => { if (!busy) void onTaskSave(entry, next.id, { title: next.title, due_on: next.due_on, done: true }, next); }}><Check className="h-5 w-5" aria-hidden="true" /></button><div className="min-w-0"><p className="m-0 text-xs font-semibold uppercase tracking-wide text-forest-700">{UI.next}</p><p className="m-0 mt-1 break-words text-base font-semibold text-ink">{next.title}</p><p className="m-0 mt-1 text-sm text-stone-700">{next.due_on ? formatScholarshipDue(next.due_on) : UI.noDate}</p></div></div> : <p className="m-0 text-base text-stone-700">{isScholarshipClosed(entry) ? UI.closedNext : UI.noNext}</p>}
        {next?.due_on && <p className="mb-0 mt-3 text-sm leading-relaxed text-stone-600">{UI.dateNudge}</p>}
      </div>
      <details ref={details} className="mt-4">
        <summary className="min-h-11 cursor-pointer py-2.5 text-base font-semibold text-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500">{UI.details}<span className="ml-2 text-sm font-normal text-stone-600">{complete}/{tasks.length} {UI.completed.toLowerCase()}</span></summary>
        <div className="mt-4 space-y-7">
          <form onSubmit={(event) => void save(event)} className="space-y-4">
            {conflict && <div role="status" className="rounded-xl border border-terracotta-200 bg-terracotta-50 p-4"><p className="m-0 text-sm leading-relaxed text-ink">{UI.conflict}</p><details className="mt-2"><summary className="min-h-11 cursor-pointer py-2.5 text-sm font-semibold">{UI.latest}</summary><dl className="space-y-2 break-words text-sm">{([{ key: 'name', label: UI.name }, { key: 'provider', label: UI.provider }, { key: 'official_url', label: UI.url }, { key: 'cycle', label: UI.cycle }, { key: 'notes', label: UI.notes }] as const).map(({ key, label }) => <div key={key}><dt className="font-semibold">{label}</dt><dd className="m-0 whitespace-pre-wrap">{entry[key] || '—'}</dd></div>)}<div><dt className="font-semibold">{UI.status}</dt><dd className="m-0">{SCHOLARSHIP_STATUS_LABEL[entry.status]}</dd></div><div><dt className="font-semibold">{UI.application}</dt><dd className="m-0">{applications.find((a) => a.id === entry.application_id)?.name ?? UI.noApplication}</dd></div></dl></details><div className="mt-3 flex flex-wrap gap-2"><button type="button" className={SECONDARY} disabled={busy} onClick={restoreLatest}>{UI.useLatest}</button><button type="button" className={SECONDARY} disabled={busy} onClick={() => setBase(entry)}>{UI.keepEdits}</button></div></div>}
            <div><label htmlFor={`${uid}-name`} className={LABEL}>{UI.name}</label><input ref={nameInput} id={`${uid}-name`} className={INPUT} value={draft.name} maxLength={LIMITS.name} readOnly={busy} required onChange={(e) => change('name', e.target.value)} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label htmlFor={`${uid}-provider`} className={LABEL}>{UI.provider}</label><input id={`${uid}-provider`} className={INPUT} value={draft.provider ?? ''} maxLength={LIMITS.provider} readOnly={busy} onChange={(e) => change('provider', e.target.value)} /></div>
              <div><label htmlFor={`${uid}-cycle`} className={LABEL}>{UI.cycle}</label><input id={`${uid}-cycle`} className={INPUT} placeholder={UI.cyclePlaceholder} value={draft.cycle ?? ''} maxLength={LIMITS.cycle} readOnly={busy} onChange={(e) => change('cycle', e.target.value)} /></div>
            </div>
            <div><label htmlFor={`${uid}-url`} className={LABEL}>{UI.url}</label><input id={`${uid}-url`} type="url" inputMode="url" className={INPUT} value={draft.official_url ?? ''} maxLength={LIMITS.url} readOnly={busy} onChange={(e) => change('official_url', e.target.value)} /></div>
            {applicationsAvailable ? <div><label htmlFor={`${uid}-app`} className={LABEL}>{UI.application}</label><select id={`${uid}-app`} className={INPUT} value={draft.application_id ?? ''} onChange={(e) => { if (!busy) change('application_id', e.target.value || null); }} aria-disabled={busy}><option value="">{UI.noApplication}</option>{applications.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div> : <p className="text-sm text-stone-600">{UI.applicationsUnavailable}</p>}
            <div><label htmlFor={`${uid}-notes`} className={LABEL}>{UI.notes}</label><textarea id={`${uid}-notes`} rows={3} className={INPUT} value={draft.notes ?? ''} maxLength={LIMITS.notes} readOnly={busy} onChange={(e) => change('notes', e.target.value)} aria-describedby={`${uid}-notes-hint`} /><p id={`${uid}-notes-hint`} className="mt-2 text-sm leading-relaxed text-stone-600">{UI.notesHint}</p></div>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            {dirty && <div className="flex flex-wrap gap-2"><button className={PRIMARY} type="submit" aria-disabled={busy || conflict} aria-busy={busy} disabled={conflict}>{busy ? UI.saving : UI.saveChanges}</button><button type="button" className={SECONDARY} aria-disabled={busy} onClick={() => { if (!busy) restoreLatest(); }}>{UI.discard}</button></div>}
          </form>
          <section aria-labelledby={`${uid}-checklist`} className="border-t border-stone-200 pt-5">
            <h4 id={`${uid}-checklist`} className="font-display text-xl font-bold text-ink">{UI.checklist}</h4>
            <p className="mt-1 text-sm leading-relaxed text-stone-600">{UI.checklistHint}</p>
            <Checklist entry={entry} tasks={tasks} busy={busy} onSave={onTaskSave} onDelete={onTaskDelete} onDirty={setTaskDirty} />
          </section>
          {(canTransferScholarship(entry) || entry.budget_item_id || budgetDirty) && <BudgetHandoff entry={entry} budgets={budgets} available={budgetsAvailable} busy={busy} onSave={onBudget} onDirty={setBudgetDirty} />}
          <div className="border-t border-stone-200 pt-4">
            {remove ? <div className="rounded-xl border border-red-200 bg-red-50 p-4"><p className="m-0 text-base text-ink">{UI.removeConfirm}</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" className={DANGER} aria-disabled={busy} onClick={() => { if (!busy) void onDelete(entry); }}>{UI.confirmRemove}</button><button type="button" className={SECONDARY} aria-disabled={busy} onClick={() => { if (!busy) setRemove(false); }}>{UI.cancel}</button></div></div> : <button type="button" className={`${BUTTON} text-red-700 hover:bg-red-50`} onClick={() => setRemove(true)}><Trash2 className="h-4 w-4" aria-hidden="true" />{UI.remove}</button>}
          </div>
        </div>
      </details>
    </article>
  );
}

function Checklist({ entry, tasks, busy, onSave, onDelete, onDirty }: { entry: ScholarshipEntry; tasks: ScholarshipTask[]; busy: boolean; onSave: ScholarshipCardProps['onTaskSave']; onDelete: ScholarshipCardProps['onTaskDelete']; onDirty: (v: boolean) => void }) {
  const uid = useId();
  const [id, setId] = useState(newScholarshipId);
  const [editing, setEditing] = useState<ScholarshipTask | undefined>();
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const dirty = editing ? title !== editing.title || due !== (editing.due_on ?? '') : Boolean(title || due);
  const latest = editing ? tasks.find((task) => task.id === editing.id) : undefined;
  const conflict = Boolean(editing && latest && editing.updated_at !== latest.updated_at);
  useEffect(() => onDirty(dirty), [dirty, onDirty]);
  const reset = () => { setId(newScholarshipId()); setEditing(undefined); setTitle(''); setDue(''); setError(''); };
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy || conflict) return;
    if (!cleanScholarshipText(title)) { setError(UI.taskRequired); input.current?.focus(); return; }
    if (due && !isScholarshipDate(due)) { setError(UI.dateInvalid); return; }
    setError('');
    if (await onSave(entry, editing?.id ?? id, { title: cleanScholarshipText(title, LIMITS.taskTitle), due_on: due || null, done: editing?.done ?? false }, editing)) reset();
  }
  return <div className="mt-4 space-y-4">
    <ul className="m-0 list-none divide-y divide-stone-200 p-0">
      {tasks.map((task) => <li key={task.id} className="flex flex-wrap items-start gap-2 py-3">
        <label className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-start gap-3"><input type="checkbox" checked={task.done} className="mt-3 h-5 w-5 shrink-0 accent-forest-700" aria-disabled={busy} onChange={() => { if (!busy) void onSave(entry, task.id, { title: task.title, due_on: task.due_on, done: !task.done }, task); }} /><span className="min-w-0 py-2"><span className={`block break-words text-base ${task.done ? 'text-stone-600 line-through' : 'text-ink'}`}>{task.title}</span><span className="mt-1 block text-sm text-stone-600">{task.due_on ? formatScholarshipDue(task.due_on) : UI.noDate}</span></span></label>
        <div className="flex items-center gap-1"><button type="button" className={`${BUTTON} w-11 px-0 text-stone-700 hover:bg-stone-100`} aria-label={`${UI.editTask}: ${task.title}`} aria-disabled={busy || dirty} onClick={() => { if (busy || dirty) return; setEditing(task); setTitle(task.title); setDue(task.due_on ?? ''); setError(''); input.current?.focus(); }}><Pencil className="h-4 w-4" aria-hidden="true" /></button><button type="button" className={`${BUTTON} w-11 px-0 text-stone-700 hover:bg-red-50 hover:text-red-700`} aria-label={`${UI.removeTask}: ${task.title}`} aria-disabled={busy} onClick={() => { if (!busy) setDeleting(task.id); }}><Trash2 className="h-4 w-4" aria-hidden="true" /></button></div>
        {deleting === task.id && <div className="flex w-full flex-wrap gap-2 rounded-xl border border-red-200 p-3"><button type="button" className={DANGER} aria-disabled={busy} onClick={async () => { if (!busy && await onDelete(task)) { setDeleting(null); if (editing?.id === task.id) reset(); } }}>{UI.removeTask}</button><button type="button" className={SECONDARY} onClick={() => setDeleting(null)}>{UI.cancel}</button></div>}
      </li>)}
    </ul>
    <form onSubmit={(event) => void submit(event)} className="rounded-xl bg-cream-50 p-4">
      {conflict && latest && <div role="status" className="mb-4 rounded-xl border border-terracotta-200 p-4"><p className="m-0 text-sm">{UI.conflict}</p><p className="mt-2 break-words text-sm">{UI.latest}: {latest.title} · {formatScholarshipDue(latest.due_on)}</p><div className="flex flex-wrap gap-2"><button type="button" className={SECONDARY} disabled={busy} onClick={() => { setEditing(latest); setTitle(latest.title); setDue(latest.due_on ?? ''); }}>{UI.useLatest}</button><button type="button" className={SECONDARY} disabled={busy} onClick={() => setEditing(latest)}>{UI.keepEdits}</button></div></div>}
      <label htmlFor={`${uid}-task`} className={LABEL}>{editing ? UI.editTask : UI.task}</label><input ref={input} id={`${uid}-task`} className={INPUT} value={title} maxLength={LIMITS.taskTitle} placeholder={UI.taskPlaceholder} readOnly={busy} onChange={(e) => setTitle(e.target.value)} />
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end"><div className="min-w-0 flex-1"><label htmlFor={`${uid}-date`} className={LABEL}>{UI.due}</label><input id={`${uid}-date`} type="date" min="1990-01-01" max="2100-12-31" className={INPUT} value={due} readOnly={busy} onChange={(e) => setDue(e.target.value)} /></div><button type="submit" className={SECONDARY} aria-disabled={busy}><Plus className="h-4 w-4" aria-hidden="true" />{editing ? UI.saveTask : UI.addTask}</button>{editing && <button type="button" className={SECONDARY} aria-disabled={busy} onClick={() => { if (!busy) reset(); }}>{UI.cancel}</button>}</div>
      <p className="mb-0 mt-3 text-sm leading-relaxed text-stone-600">{UI.dateNudge}</p>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </form>
  </div>;
}

function BudgetHandoff({ entry, budgets, available, busy, onSave, onDirty }: { entry: ScholarshipEntry; budgets: BudgetPlan[]; available: boolean; busy: boolean; onSave: ScholarshipCardProps['onBudget']; onDirty: (v: boolean) => void }) {
  const uid = useId();
  const [planId, setPlanId] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<'once' | 'year'>('once');
  const [error, setError] = useState('');
  const plan = budgets.find((b) => b.id === planId) ?? (planId ? undefined : budgets[0]);
  useEffect(() => { onDirty(Boolean(amount)); return () => onDirty(false); }, [amount, onDirty]);
  const link = <ToolLink href={toolHref('cost-planner', entry.region)} className={LINK}>{UI.budgetLink}</ToolLink>;
  if (entry.budget_item_id) return <div className="rounded-xl border border-forest-200 bg-forest-50 p-4"><p className="m-0 font-semibold text-forest-800">{UI.linkedBudget}</p><p className="mb-0 mt-2 text-sm">{link}</p></div>;
  if (!canTransferScholarship(entry)) return <div className="rounded-xl border border-stone-200 bg-cream-50 p-4"><p role="status" className="m-0 text-sm leading-relaxed text-stone-700">{UI.budgetDraftKept}</p><button type="button" className={`${SECONDARY} mt-3`} disabled={busy} onClick={() => setAmount('')}>{UI.discardBudgetDraft}</button></div>;
  if (!available) return <p className="text-sm text-stone-700">{UI.budgetUnavailable}</p>;
  if (!budgets.length) return <p className="text-sm text-stone-700">{UI.budgetNoPlans} {link}</p>;
  return <details className="rounded-xl border border-forest-200 p-4"><summary className="min-h-11 cursor-pointer py-2.5 font-semibold text-forest-800">{UI.budget}</summary><p className="text-sm leading-relaxed text-stone-700">{UI.budgetHint}</p><form onSubmit={async (event) => { event.preventDefault(); if (busy || !plan) return; const places = currencyDecimals(plan.currency_code); if (!new RegExp(`^\\d+(?:\\.\\d{1,${places || 1}})?$`).test(amount) || Number(amount) <= 0 || (places === 0 && amount.includes('.'))) { setError(UI.budgetAmountInvalid); return; } setError(''); if (await onSave(entry, plan, amount, period)) setAmount(''); }} className="space-y-4">
    <div><label htmlFor={`${uid}-plan`} className={LABEL}>{UI.budgetPlan}</label><select id={`${uid}-plan`} className={INPUT} value={plan?.id ?? ''} aria-disabled={busy} onChange={(e) => { if (!busy) { setPlanId(e.target.value); setAmount(''); } }}>{budgets.map((budget) => <option key={budget.id} value={budget.id}>{budget.label} · {budget.currency_code}</option>)}</select></div>
    <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor={`${uid}-amount`} className={LABEL}>{UI.budgetAmount} {plan && `(${plan.currency_code})`}</label><input id={`${uid}-amount`} className={INPUT} inputMode="decimal" value={amount} readOnly={busy} onChange={(e) => setAmount(e.target.value)} required /></div><div><label htmlFor={`${uid}-period`} className={LABEL}>{UI.budgetPeriod}</label><select id={`${uid}-period`} className={INPUT} value={period} aria-disabled={busy} onChange={(e) => { if (!busy) setPeriod(e.target.value as 'once' | 'year'); }}><option value="once">{UI.once}</option><option value="year">{UI.year}</option></select></div></div>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}<button type="submit" className={PRIMARY} aria-disabled={busy}>{UI.budgetAdd}</button>
  </form></details>;
}

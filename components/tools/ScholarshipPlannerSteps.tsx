'use client';

import { useEffect, useState } from 'react';
import ToolLink from '@/components/tools/ToolLink';
import { useRegion } from '@/components/RegionProvider';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { withDeadline, TIMED_OUT, isSetupError } from '@/lib/tools-shared';
import { activeScholarshipTasks, formatScholarshipDue, type ScholarshipEntry, type ScholarshipTask } from '@/lib/scholarship-tracker';
import { SCHOLARSHIP_UI as UI } from '@/lib/scholarship-ui';
import { toolHref } from '@/lib/tools';

/** A read-only view of the original checklist, never a second editable deadline. SDK already lives in the planner chunk. */
export default function ScholarshipPlannerSteps() {
  const { effectiveRegion } = useRegion();
  const [result, setResult] = useState<{ entries: ScholarshipEntry[]; tasks: ScholarshipTask[] } | 'error' | null>(null);
  useEffect(() => {
    let active = true;
    const client = getSupabaseBrowserClient();
    if (!client) return;
    void withDeadline(async (signal) => {
      // RLS scopes both reads; this component is mounted only inside the verified, signed-in planner.
      const [entries, tasks] = await Promise.all([
        client.from('scholarship_entries').select('id,name,region,status,official_url').eq('region', effectiveRegion).order('created_at').range(0, 99).abortSignal(signal),
        client.from('scholarship_tasks').select('id,scholarship_id,title,due_on,done,created_at').eq('done', false).order('due_on', { ascending: true, nullsFirst: false }).range(0, 999).abortSignal(signal),
      ]);
      if (isSetupError(entries.error) || isSetupError(tasks.error)) return null;
      if (entries.error || tasks.error) return 'error' as const;
      return { entries: (entries.data ?? []) as ScholarshipEntry[], tasks: (tasks.data ?? []) as ScholarshipTask[] };
    }).then((value) => { if (active) setResult(value === TIMED_OUT ? 'error' : value); }).catch(() => { if (active) setResult('error'); });
    return () => { active = false; };
  }, [effectiveRegion]);
  if (!result) return null;
  const href = toolHref('scholarship-tracker', effectiveRegion);
  if (result === 'error') return <p role="status" className="rounded-xl border border-stone-200 p-4 text-sm text-stone-700">{UI.plannerError} <ToolLink href={href} className="text-forest-700 underline">{UI.openTracker}</ToolLink></p>;
  const entries = new Map(result.entries.map((e) => [e.id, e]));
  const tasks = activeScholarshipTasks(result.entries, result.tasks, effectiveRegion);
  if (!tasks.length) return null;
  return <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm" aria-labelledby="planner-scholarship-heading">
    <h2 id="planner-scholarship-heading" className="font-display text-xl font-bold text-ink">{UI.plannerHeading}</h2><p className="mt-2 text-sm leading-relaxed text-stone-600">{UI.plannerHint}</p>
    <ul className="mt-3 list-none divide-y divide-stone-200 p-0">{tasks.slice(0, 5).map((task) => { const entry = entries.get(task.scholarship_id)!; return <li key={task.id} className="py-3"><ToolLink href={`/tools/scholarship-tracker#entry=${entry.id}&region=${effectiveRegion}`} className="block min-h-11 text-base font-semibold text-forest-700 underline underline-offset-2">{task.title}</ToolLink><p className="m-0 break-words text-sm text-stone-700">{entry.name} · {formatScholarshipDue(task.due_on)}</p>{task.due_on && <p className="mb-0 mt-1 text-sm text-stone-600">{UI.dateNudge} {entry.official_url && <a href={entry.official_url} target="_blank" rel="noopener noreferrer" className="text-forest-700 underline">{UI.official}</a>}</p>}</li>; })}</ul>
    <ToolLink href={href} className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-forest-700 underline">{UI.moreSteps}</ToolLink>
  </section>;
}

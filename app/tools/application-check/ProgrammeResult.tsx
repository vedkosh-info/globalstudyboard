'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, ClipboardPlus } from 'lucide-react';
import ReportView from '@/components/tools/ReportView';
import ToolLink from '@/components/tools/ToolLink';
import { evaluateCheck, evidenceCurrent, nextActions, type BandInput, type CheckAnswer, type CheckProgramme } from '@/lib/application-check';
import { saveCheckActions } from '@/lib/application-check-planner';
import { defaultPaperFor, dedupeLinks, type Paper, type ReportDocument } from '@/lib/reports/model';
import { getRegionBySlug } from '@/lib/regions';
import { formatReviewed } from '@/lib/site-meta';
import { toolHref } from '@/lib/tools';
import { CARD, LINK, PRIMARY } from '../scholarship-tracker/styles';
import ReviewRule, { OfficialSource, statusLabel } from './ReviewRule';

const today = () => new Date().toISOString().slice(0, 10);

export default function ProgrammeResult({ programme, userId, onChange }: { programme: CheckProgramme; userId: string; onChange: () => void }) {
  const [answers, setAnswers] = useState<Record<string, CheckAnswer>>({});
  const [bands, setBands] = useState<BandInput>({ overall: '', lowest: '' });
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [courses, setCourses] = useState<Record<string, string[]>>({});
  const [day, setDay] = useState(today);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [saveFailed, setSaveFailed] = useState(false);
  const [paper, setPaper] = useState<Paper>(() => defaultPaperFor(programme.region));
  const heading = useRef<HTMLHeadingElement>(null);
  const busy = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    heading.current?.focus();
    const refreshDate = () => setDay(today());
    const timer = window.setInterval(refreshDate, 60000);
    window.addEventListener('focus', refreshDate);
    return () => { mounted.current = false; window.clearInterval(timer); window.removeEventListener('focus', refreshDate); };
  }, []);

  const current = evidenceCurrent(programme, day);
  const findings = useMemo(() => evaluateCheck(programme, answers, bands, day, { quantities, courses }), [programme, answers, bands, day, quantities, courses]);
  // Show a check the student can run before the supporting documents and planner controls.
  const interactive = (kind: string) => kind === 'courses' || kind === 'minimum' || kind === 'ielts';
  const orderedFindings = [...findings].sort((a, b) => Number(interactive(b.rule.kind)) - Number(interactive(a.rule.kind)));
  const next = useMemo(() => nextActions(findings), [findings]);
  const selected = next.filter(({ rule }) => !excluded.includes(rule.id) && !saved.includes(rule.id));
  const report = useMemo<ReportDocument>(() => ({
    tool: 'application-check',
    toolName: 'Application Check',
    title: programme.name,
    subtitle: programme.university,
    region: programme.region,
    regionName: getRegionBySlug(programme.region)!.displayName,
    generatedAt: new Date().toISOString(),
    preparedBy: 'Prepared in the account holder’s browser from reviewed official requirements and their own answers. The university assesses the application and confirms applicable requirements.',
    intro: programme.scope,
    sections: [
      { kind: 'callout', text: 'This check covers selected requirements. Confirm the full list, applicable intake, dates and accepted evidence with the university before applying.' },
      { kind: 'facts', heading: 'Check details', items: [
        { label: 'Source review', value: formatReviewed(programme.reviewed).display },
        { label: 'Programme', value: { text: programme.name, url: programme.officialUrl } },
      ] },
      { kind: 'table', heading: 'Reviewed requirements', columns: [{ label: 'Requirement' }, { label: 'Your check' }], rows:
        findings.map(({ rule, status, message: result }) => [
          { text: rule.title + '\n' + rule.detail, url: rule.sourceUrl },
          statusLabel[status] + '\n' + result,
        ]),
      },
      { kind: 'text', heading: 'Suggested next steps', paragraphs:
        next.length ? next.map(({ rule }) => rule.action) : ['Review the full application instructions for your intake with the university.'],
      },
    ],
    sources: dedupeLinks(programme.rules.map((rule) => ({ label: rule.title, url: rule.sourceUrl }))),
    includesNotes: false,
    fileStem: 'globalstudyboard-application-check',
  }), [programme, findings, next]);

  async function save() {
    if (busy.current || !selected.length || !evidenceCurrent(programme)) return;
    busy.current = true;
    setSaving(true);
    setMessage('');
    setSaveFailed(false);
    const rules = selected.map(({ rule }) => rule);
    try {
      await saveCheckActions(programme, rules, userId);
      if (mounted.current) {
        setSaved((previous) => [...new Set([...previous, ...rules.map((rule) => rule.id)])]);
        setMessage('Your selected steps are in the Application Planner.');
      }
    } catch (error) {
      if (mounted.current) {
        setSaveFailed(true);
        setMessage(error instanceof Error ? error.message : 'These steps could not be confirmed in the planner. Please try again.');
      }
    } finally {
      busy.current = false;
      if (mounted.current) setSaving(false);
    }
  }

  return <div className="space-y-5">
    <div className={CARD}>
      <button type="button" disabled={saving} onClick={onChange} className={LINK + ' mb-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold disabled:opacity-60'}><ArrowLeft size={16} aria-hidden="true" /> Change programme</button>
      <p className="m-0 text-sm font-semibold text-forest-700">{programme.university}</p>
      <h2 ref={heading} tabIndex={-1} className="mb-0 mt-1 font-display text-2xl font-bold tracking-editorial text-ink focus:outline-none sm:text-3xl">{programme.name}</h2>
      <p className="mb-0 mt-3 max-w-prose text-base leading-relaxed text-stone-700">{programme.scope}</p>
      <p className="mb-0 mt-3 text-sm"><OfficialSource url={programme.officialUrl} label="Programme’s official page" /><span className="mx-2 text-stone-400" aria-hidden="true">·</span><Link className={LINK} href={'/colleges/' + programme.collegeSlug}>University profile</Link></p>
    </div>
    {!current ? <div className="rounded-2xl border border-terracotta-200 bg-terracotta-50 p-5" role="status">
      <h3 className="m-0 text-lg font-semibold text-ink">This check needs a fresh review</h3>
      <p className="mb-0 mt-2 text-base leading-relaxed text-stone-700">The requirements were reviewed on {formatReviewed(programme.reviewed).display}. Use the university’s current instructions while we refresh this check.</p>
      <p className="mb-0 mt-3"><OfficialSource url={programme.officialUrl} label="Open current programme instructions" /></p>
    </div> : <>
      <section aria-labelledby="check-requirements">
        <h3 id="check-requirements" className="m-0 font-display text-2xl font-bold tracking-editorial text-ink">Check your preparation</h3>
        <p className="mb-0 mt-2 text-base leading-relaxed text-stone-700">Use the items that apply to you. Your answers update the suggested next steps.</p>
        <div className="mt-4 space-y-3">
          {orderedFindings.map((finding) => <ReviewRule key={finding.rule.id} finding={finding} reviewed={programme.reviewed} userId={userId}
            answer={answers[finding.rule.id]} setAnswer={(value) => setAnswers((previous) => {
              const updated = { ...previous };
              if (value) updated[finding.rule.id] = value;
              else delete updated[finding.rule.id];
              return updated;
            })}
            bands={bands} setBands={setBands}
            quantity={quantities[finding.rule.id] ?? ''} setQuantity={(value) => setQuantities((previous) => ({ ...previous, [finding.rule.id]: value }))}
            courses={courses[finding.rule.id] ?? []} setCourses={(value) => setCourses((previous) => ({ ...previous, [finding.rule.id]: value }))}
          />)}
        </div>
      </section>
      <section className="rounded-2xl border border-forest-200 bg-forest-50 p-5 sm:p-6" aria-labelledby="check-next">
        <h3 id="check-next" className="m-0 font-display text-2xl font-bold tracking-editorial text-ink">Your next steps</h3>
        <p className="mb-0 mt-2 text-base leading-relaxed text-stone-700">Choose the steps you want to keep in your planner.</p>
        {next.length ? <>
          <ul className="m-0 mt-4 list-none space-y-3 p-0">
            {next.map(({ rule }) => {
              const added = saved.includes(rule.id);
              return <li key={rule.id} className="rounded-xl border border-forest-200 bg-white p-3">
                <label className="flex min-h-11 cursor-pointer items-start gap-3 text-base font-medium leading-relaxed text-ink">
                  {added ? <Check size={20} aria-hidden="true" className="mt-1 shrink-0 text-forest-700" /> : <input
                    type="checkbox" disabled={saving} className="mt-1.5 h-4 w-4 shrink-0 accent-forest-700" checked={!excluded.includes(rule.id)}
                    onChange={(event) => setExcluded((previous) => event.target.checked ? previous.filter((id) => id !== rule.id) : [...previous, rule.id])}
                  />}
                  <span>{rule.action}{added && <span className="mt-0.5 block text-sm font-normal text-forest-700">In your planner</span>}</span>
                </label>
                <p className="m-0 mt-1 pl-7 text-sm"><OfficialSource url={rule.sourceUrl} label="Read the official instructions" /></p>
              </li>;
            })}
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" className={PRIMARY} disabled={saving || !selected.length} aria-busy={saving} onClick={() => void save()}>
              <ClipboardPlus size={18} aria-hidden="true" />{saving ? 'Adding steps…' : 'Add selected steps to planner'}
            </button>
            {saved.length > 0 && <ToolLink href={toolHref('application-planner', programme.region)} className={LINK + ' min-h-11 py-2.5 text-sm font-semibold'}>Open planner</ToolLink>}
          </div>
          <p className="mb-0 mt-3 text-sm text-stone-600">You can add your own dates in the planner.</p>
          {message && <p role={saveFailed ? 'alert' : 'status'} className="mb-0 mt-2 text-sm font-medium text-forest-900">{message}</p>}
        </> : <p className="mb-0 mt-4 text-base leading-relaxed text-stone-700">You have reviewed the items covered here. Check the full application instructions for your intake before applying.</p>}
      </section>
      <ReportView compact doc={report} includeNotes={false} onIncludeNotes={() => {}} notesAvailable={false} paper={paper} onPaper={setPaper} />
      <p className="m-0 text-sm leading-relaxed text-stone-600">Your answers are temporary. Download this check or save the steps you need before changing programme, destination or leaving the page.</p>
    </>}
  </div>;
}

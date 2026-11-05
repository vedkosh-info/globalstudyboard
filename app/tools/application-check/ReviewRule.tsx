'use client';

import { useId, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import type { BandInput, CheckAnswer, CheckStatus, Finding } from '@/lib/application-check';
import { loadSavedIelts, type SavedIelts } from '@/lib/application-check-scores';
import { formatReviewed } from '@/lib/site-meta';
import { INPUT, LABEL, LINK, SECONDARY } from '../scholarship-tracker/styles';

export const statusLabel: Record<CheckStatus, string> = {
  ready: 'Reviewed with your answer',
  todo: 'Needs attention',
  unknown: 'Open question',
  confirm: 'Confirm with the university',
};
const tone: Record<CheckStatus, string> = {
  ready: 'bg-forest-100 text-forest-900', todo: 'bg-terracotta-50 text-terracotta-800',
  unknown: 'bg-stone-100 text-stone-700', confirm: 'bg-cream-100 text-stone-700',
};

export function OfficialSource({ url, label }: { url: string; label: string }) {
  return <a className={LINK + ' inline-flex items-baseline gap-1'} href={url} target="_blank" rel="noopener noreferrer">
    <span>{label}</span><ExternalLink size={13} className="shrink-0 self-center" aria-hidden="true" />
  </a>;
}

function IeltsInput({ userId, bands, setBands, eachBand }: { userId: string; bands: BandInput; setBands: (value: BandInput) => void; eachBand: boolean }) {
  const fieldId = useId();
  const [saved, setSaved] = useState<SavedIelts[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const busy = useRef(false);
  async function loadAttempts() {
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    setNotice('');
    try {
      const attempts = await loadSavedIelts(userId);
      setSaved(attempts);
      if (!attempts.length) setNotice('No past IELTS attempts with a usable overall band were found. You can enter your bands below.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Your saved attempts could not load. You can enter your bands below.');
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }
  const bandOptions = Array.from({ length: 19 }, (_, index) => index / 2);
  function field(name: keyof BandInput, label: string) {
    return <div className="min-w-0"><label htmlFor={fieldId + name} className={LABEL}>{label}</label>
      <select id={fieldId + name} value={bands[name]} className={INPUT} onChange={(event) => { setBands({ ...bands, [name]: event.target.value }); setNotice(''); }}>
        <option value="">Choose a band</option>
        {bandOptions.map((band) => <option key={band} value={String(band)}>{band.toFixed(1)}</option>)}
      </select>
    </div>;
  }
  return <details className="mt-2">
    <summary className="min-h-11 cursor-pointer py-2.5 text-base font-semibold text-forest-800">Check my IELTS Academic bands</summary>
    <div className="rounded-xl bg-cream-50 p-4">
      <p className="m-0 mb-3 text-sm leading-relaxed text-stone-700">
        Use one IELTS Academic result. The university decides which result dates, formats and alternatives it accepts.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {field('overall', 'Overall band')}
        {eachBand && field('lowest', 'Lowest of the four section bands')}
      </div>
      {!saved?.length && <button type="button" className={LINK + ' mt-2 min-h-11 text-sm font-semibold'} disabled={loading} onClick={() => void loadAttempts()}>{loading ? 'Loading saved attempts…' : 'Choose a saved IELTS attempt'}</button>}
      {saved && saved.length > 0 && <div className="mt-3 space-y-2 rounded-xl border border-stone-200 bg-white p-3">
        <p className="m-0 text-sm font-semibold text-ink">Which attempt was IELTS Academic?</p>
        <p className="m-0 text-sm text-stone-700">Choose an attempt only if you took the Academic test.</p>
        {saved.map((attempt) => <button type="button" className={SECONDARY} key={attempt.id}
          onClick={() => {
            setBands({ overall: String(Number(attempt.overall)), lowest: attempt.lowest === '' ? '' : String(Number(attempt.lowest)) });
            setSaved(null);
            setNotice('Using the attempt from ' + formatReviewed(attempt.date).display + '.' + (eachBand && attempt.lowest === '' ? ' Enter the lowest section band from that report to finish the comparison.' : ''));
          }}>
          Use {formatReviewed(attempt.date).display} · overall {attempt.overall}
        </button>)}
      </div>}
      <p role="status" className="m-0 text-sm leading-relaxed text-stone-700">{notice}</p>
    </div>
  </details>;
}

interface Props {
  finding: Finding;
  reviewed: string;
  userId: string;
  answer?: CheckAnswer;
  setAnswer: (value?: CheckAnswer) => void;
  bands: BandInput;
  setBands: (value: BandInput) => void;
  quantity: string;
  setQuantity: (value: string) => void;
  courses: string[];
  setCourses: (value: string[]) => void;
}

export default function ReviewRule({ finding, reviewed, userId, answer, setAnswer, bands, setBands, quantity, setQuantity, courses, setCourses }: Props) {
  const { rule, status } = finding;
  return <article className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5" aria-labelledby={'rule-' + rule.id}>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h4 id={'rule-' + rule.id} className="m-0 text-lg font-semibold text-ink">{rule.title}</h4>
      <span className={'rounded-full px-2.5 py-1 text-xs font-semibold ' + tone[status]}>{statusLabel[status]}</span>
    </div>
    <p className="mb-0 mt-2 max-w-prose text-base leading-relaxed text-stone-800">{rule.detail}</p>
    <p className="mb-0 mt-2 text-sm leading-relaxed text-stone-700">
      <OfficialSource url={rule.sourceUrl} label={'Official source for ' + rule.title.toLowerCase()} />
      <span className="block sm:ml-2 sm:inline">Reviewed <time dateTime={reviewed}>{formatReviewed(reviewed).display}</time></span>
    </p>
    {rule.kind === 'prepare' && <div role="group" aria-label={rule.title + ' preparation status'} className="mt-3 flex flex-wrap gap-2">
      {(['ready', 'todo'] as const).map((value) => (
        <button type="button" key={value} aria-pressed={answer === value} onClick={() => setAnswer(answer === value ? undefined : value)}
          className={SECONDARY + ' aria-pressed:border-forest-700 aria-pressed:bg-forest-100'}>{value === 'ready' ? 'I have this' : 'Still to do'}</button>
      ))}
    </div>}
    {rule.kind === 'ielts' && rule.ielts && <IeltsInput userId={userId} bands={bands} setBands={setBands} eachBand={rule.ielts.eachBand !== undefined} />}
    {rule.kind === 'minimum' && rule.minimum && <label className="mt-3 block max-w-sm">
      <span className={LABEL}>{rule.minimum.question} <span className="font-normal">(optional)</span></span>
      <input type="text" autoComplete="off" inputMode="numeric" maxLength={7} value={quantity} onChange={(event) => setQuantity(event.target.value)} className={INPUT} placeholder={'Enter ' + rule.minimum.unit} />
    </label>}
    {rule.kind === 'courses' && rule.courses && <fieldset className="m-0 mt-3 min-w-0 border-0 p-0">
      <legend className={LABEL}>Which of these courses have you taken or enrolled in? <span className="font-normal">(optional)</span></legend>
      <div className="flex flex-wrap gap-2">
        {rule.courses.options.map((course) => <label key={course} className={SECONDARY + ' cursor-pointer has-[:checked]:border-forest-700 has-[:checked]:bg-forest-50'}>
          <input type="checkbox" className="h-4 w-4 shrink-0 accent-forest-700" checked={courses.includes(course)} onChange={(event) => setCourses(event.target.checked ? [...courses, course] : courses.filter((item) => item !== course))} />{course}
        </label>)}
      </div>
    </fieldset>}
    <p className="mb-0 mt-2 text-sm leading-relaxed text-stone-700" aria-live="polite">{finding.message}</p>
  </article>;
}

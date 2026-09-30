'use client';

import Link from 'next/link';
import { useId } from 'react';
import { OFFLINE_ON_LOAD, OFFLINE_TITLE } from '@/lib/auth-events';

/** Shared pieces of the report pages: a notice card and the record picker. */

const CARD = 'rounded-2xl border border-stone-200 bg-white p-5 shadow-sm';
const BTN_SECONDARY =
  'inline-flex h-10 items-center justify-center gap-2 rounded-full border border-forest-300 bg-white px-4 text-sm font-semibold text-forest-700 no-underline transition-colors hover:border-forest-400 hover:bg-forest-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2';
// The tools' field focus: a SOLID forest-500 ring (4.42:1 on white) with a 1px white offset — one look across every tool (§15.2).
const SELECT =
  'h-10 max-w-full rounded-xl border border-stone-450 bg-white px-3 text-base text-ink focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:ring-offset-1 sm:text-sm';

/**
 * A notice in place of the report. `alert` for a load failure (announced at
 * once, like the tools' own ToolOffline / ToolLoadError), a status otherwise
 * (being switched on, nothing to report yet) — the same roles as on the tools.
 */
export function ReportNotice({ title, text, href, linkLabel, alert = false }: { title: string; text: string; href: string; linkLabel: string; alert?: boolean }) {
  return (
    <div className={`${CARD} max-w-2xl`} role={alert ? 'alert' : 'status'}>
      <h2 className="font-display text-xl font-bold tracking-editorial text-ink">{title}</h2>
      <p className="m-0 mt-2 text-sm leading-relaxed text-stone-700">{text}</p>
      <Link href={href} className={`${BTN_SECONDARY} mt-4`}>
        {linkLabel}
      </Link>
    </div>
  );
}

/** The report's first read could not reach the server — the report-page twin of ToolOffline (same words, same role). */
export function ReportOffline({ href, linkLabel }: { href: string; linkLabel: string }) {
  return <ReportNotice alert title={OFFLINE_TITLE} text={OFFLINE_ON_LOAD} href={href} linkLabel={linkLabel} />;
}

export interface PickerOption {
  id: string;
  label: string;
}

/** Which record the report covers — the destination's own records, newest first. */
export function RecordPicker({ label, value, options, onChange }: { label: string; value: string; options: PickerOption[]; onChange: (id: string) => void }) {
  const uid = useId();
  if (options.length < 2) return null;
  return (
    <div className="min-w-0">
      <label htmlFor={`${uid}-pick`} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-600">
        {label}
      </label>
      <select id={`${uid}-pick`} value={value} onChange={(e) => onChange(e.target.value)} className={SELECT}>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

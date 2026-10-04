'use client';

import Link from 'next/link';
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, ArrowLeft, FileDown, Printer } from 'lucide-react';
import TableScroller from '@/components/tools/TableScroller';
import { PAPERS, PAPER_LABEL, PREPARED_BY, REPORT_FOOTER_LINES, formatGenerated, isPaper, type Cell, type Paper, type ReportDocument, type ReportSection } from '@/lib/reports/model';
import { closeDownloadHold, openDownloadHold, saveBlob, webKitNeedsTab } from '@/lib/download-file';

/**
 * The on-page report — the SAME ReportDocument the PDF is drawn from, rendered
 * as accessible HTML (real tables with captions and column headers, real
 * links) that the browser's print stylesheet turns into a clean printout.
 *
 * Actions: "Download PDF" imports the jsPDF renderer on demand (never in a
 * page chunk), builds the file in this browser and hands it to the download
 * manager — nothing leaves the device; "Print" opens the print dialog on the
 * same markup. Private notes join the report only while the checkbox is
 * ticked (never remembered). The paper size defaults to the destination's
 * everyday sheet and can be changed for this report only.
 */

const CARD = 'rounded-2xl border border-stone-200 bg-white p-5 shadow-sm';
const BTN =
  'inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';
const BTN_PRIMARY = `${BTN} bg-forest-700 text-cream-50 hover:bg-forest-800`;
const BTN_SECONDARY = `${BTN} border border-forest-300 bg-white text-forest-700 hover:border-forest-400 hover:bg-forest-50`;
// The tools' field focus: a SOLID forest-500 ring (4.42:1 on white) with a 1px white offset — one look across every tool (§15.2).
const SELECT = 'h-10 max-w-full rounded-xl border border-stone-450 bg-white px-3 text-base text-ink focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:ring-offset-1 sm:text-sm';
const LINK = 'text-forest-700 underline underline-offset-2 hover:text-forest-800';

/** Shown before Download. The PDF fonts cannot draw these scripts; Print can. */
const PDF_SCRIPT_NOTE = 'Hindi, Chinese, Arabic and other letters become □ in the PDF. Print keeps them.';

export interface ReportViewProps {
  doc: ReportDocument;
  /** Where "Back to the tool" goes. Omitted on the tool itself. */
  toolHref?: string;
  includeNotes: boolean;
  onIncludeNotes: (v: boolean) => void;
  /** Whether the record has any private note at all (the checkbox is disabled otherwise). */
  notesAvailable: boolean;
  paper: Paper;
  onPaper: (p: Paper) => void;
  /** A record picker (which budget / comparison), rendered in the toolbar. */
  picker?: ReactNode;
  /**
   * On the tool screen: the buttons sit with the work, and the report markup
   * is kept only for Print. The student does not read the same plan twice.
   */
  compact?: boolean;
}

function CellNode({ c, className = '' }: { c: Cell; className?: string }) {
  if (typeof c === 'string') return <span className={className}>{c}</span>;
  const cls = [className, c.strong ? 'font-semibold text-ink' : '', c.muted ? 'text-stone-500' : ''].filter(Boolean).join(' ');
  if (c.url) {
    return (
      <a href={c.url} target="_blank" rel="noopener noreferrer" className={`${LINK} ${cls}`}>
        {c.text}
      </a>
    );
  }
  return <span className={cls}>{c.text}</span>;
}

const alignOf = (c: Cell): 'left' | 'right' => (typeof c === 'string' ? 'left' : (c.align ?? 'left'));


function Section({ s, index }: { s: ReportSection; index: number }) {
  const id = `report-section-${index}`;
  if (s.kind === 'callout') {
    return (
      <div className="rounded-xl border border-stone-200 bg-cream-100 px-4 py-3 text-sm leading-relaxed text-ink print:break-inside-avoid">
        {s.text}
      </div>
    );
  }
  if (s.kind === 'text') {
    return (
      <section aria-labelledby={id}>
        <h3 id={id} className="font-display text-lg font-bold tracking-editorial text-ink">
          {s.heading}
        </h3>
        <div className="mt-2 space-y-2 text-sm leading-relaxed text-stone-800">
          {s.paragraphs.map((p, i) => (
            <p key={i} className="m-0 whitespace-pre-line">
              {p}
            </p>
          ))}
        </div>
      </section>
    );
  }
  if (s.kind === 'facts') {
    return (
      <section aria-labelledby={id}>
        <h3 id={id} className="font-display text-lg font-bold tracking-editorial text-ink">
          {s.heading}
        </h3>
        <dl className="mt-2 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-[max-content_1fr]">
          {s.items.map((it) => (
            <div key={it.label} className="contents">
              <dt className="font-semibold text-stone-600">{it.label}</dt>
              <dd className="m-0 text-ink">
                <CellNode c={it.value} />
              </dd>
            </div>
          ))}
        </dl>
      </section>
    );
  }
  return (
    <section aria-labelledby={id}>
      <h3 id={id} className="font-display text-lg font-bold tracking-editorial text-ink">
        {s.heading}
      </h3>
      {s.intro && <p className="m-0 mt-1 text-sm leading-relaxed text-stone-600">{s.intro}</p>}
      {s.rows.length === 0 ? (
        <p className="m-0 mt-2 text-sm text-stone-500">{s.empty ?? 'Nothing recorded yet.'}</p>
      ) : (
        <TableScroller labelledBy={id}>
          <table className={`w-full border-collapse text-sm ${s.columns.length > 2 ? 'min-w-[36rem] print:min-w-0' : ''}`}>
            <caption className="sr-only">{s.heading}</caption>
            <thead>
              <tr>
                {s.columns.map((c, i) => (
                  <th
                    key={i}
                    scope="col"
                    className={`border border-stone-200 bg-forest-50 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-forest-800 ${c.align === 'right' ? 'text-right' : ''}`}
                  >
                    {c.label || <span className="sr-only">Row</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.rows.map((row, ri) => (
                <tr key={ri} className="align-top print:break-inside-avoid">
                  {row.map((c, ci) => (
                    <td key={ci} className={`border border-stone-200 px-3 py-2 text-ink ${alignOf(c) === 'right' ? 'text-right tabular-nums' : ''}`}>
                      <CellNode c={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroller>
      )}
      {s.footnote && <p className="m-0 mt-2 text-xs leading-relaxed text-stone-600">{s.footnote}</p>}
    </section>
  );
}

export default function ReportView({ doc, toolHref, includeNotes, onIncludeNotes, notesAvailable, paper, onPaper, picker, compact = false }: ReportViewProps) {
  const uid = useId();
  const [status, setStatus] = useState<{ text: string; warn?: boolean }>({ text: '' });
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  // Tell the print stylesheet this page prints the report alone (site chrome hidden).
  useEffect(() => {
    document.documentElement.setAttribute('data-report-print', '');
    return () => document.documentElement.removeAttribute('data-report-print');
  }, []);

  const download = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setStatus({ text: 'Preparing your PDF…' });
    // Before the first await, so Safari and iOS still count this tap.
    const hold = openDownloadHold();
    try {
      const { renderReportPdf } = await import('@/lib/reports/pdf');
      const result = await renderReportPdf(doc, { paper });
      const openedTab = saveBlob(result.blob, result.filename, hold) === 'tab';
      const size = `${result.filename}, ${result.pages} ${result.pages === 1 ? 'page' : 'pages'}, ${Math.max(1, Math.round(result.bytes / 1024))} KB`;
      const blocked = webKitNeedsTab() && !hold;
      const done = openedTab
        ? `PDF opened in a new tab — ${size}. Use that tab’s share or download control to keep the file. This page stays as you left it.`
        : blocked
          ? `The browser blocked the new tab, so the PDF may not have saved — ${size}. Allow pop-ups for this site and try again, or use Print and save that as a PDF.`
          : `PDF downloaded — ${size}.`;
      // Never a silent loss: characters the PDF's fonts cannot draw were printed as □ (lib/reports/pdf.ts `fitText`).
      setStatus(
        result.missingGlyphs
          ? {
              text: `${done} Some characters — for example in your notes or in a name you typed — can’t be drawn with the PDF’s fonts and appear as □. Print uses your browser’s fonts and keeps them all; your browser can save the printout as a PDF.`,
              warn: true,
            }
          : { text: done, warn: blocked },
      );
    } catch (err) {
      closeDownloadHold(hold);
      const why = err instanceof Error && /Font/.test(err.message) ? 'the fonts could not be loaded' : 'something went wrong';
      setStatus({ text: `Could not build the PDF (${why}). Use Print instead — your browser can save the printout as a PDF.`, warn: true });
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [doc, paper]);

  return (
    <div className="space-y-5">
      <div className={`${CARD} no-print space-y-3`}>
        <div className="flex flex-wrap items-center gap-2">
          {picker}
          <button type="button" onClick={() => void download()} className={`${BTN_PRIMARY} ${busy ? 'cursor-wait opacity-70' : ''}`} aria-busy={busy || undefined} aria-disabled={busy || undefined}>
            <FileDown className="h-4 w-4" aria-hidden="true" /> {busy ? 'Preparing PDF…' : 'Download PDF'}
          </button>
          <button type="button" onClick={() => window.print()} className={BTN_SECONDARY}>
            <Printer className="h-4 w-4" aria-hidden="true" /> Print
          </button>
          <label htmlFor={`${uid}-paper`} className="sr-only">
            Paper size
          </label>
          <select id={`${uid}-paper`} value={paper} onChange={(e) => onPaper(isPaper(e.target.value) ? e.target.value : 'a4')} aria-label="Paper size" className={SELECT}>
            {PAPERS.map((p) => (
              <option key={p} value={p}>
                {PAPER_LABEL[p]}
              </option>
            ))}
          </select>
          {notesAvailable && (
            <div className="flex items-center gap-2">
              <input
                id={`${uid}-notes`}
                type="checkbox"
                className="h-4 w-4 accent-forest-700"
                checked={includeNotes}
                onChange={(e) => onIncludeNotes(e.target.checked)}
                aria-describedby={`${uid}-notes-hint`}
              />
              <label htmlFor={`${uid}-notes`} className="text-sm text-ink">
                Include notes
              </label>
            </div>
          )}
          {toolHref && (
            <Link href={toolHref} className={`${BTN_SECONDARY} no-underline`}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to the tool
            </Link>
          )}
        </div>
        <p id={`${uid}-notes-hint`} className="m-0 text-xs leading-relaxed text-stone-600">
          {notesAvailable && !includeNotes ? 'Notes stay out unless Include notes is ticked. ' : ''}
          {PDF_SCRIPT_NOTE} Built in your browser.
        </p>
        <p role="status" aria-live="polite" className={`m-0 flex items-start gap-2 text-sm leading-relaxed ${status.text ? '' : 'sr-only'} ${status.warn ? 'text-terracotta-700' : 'text-stone-700'}`}>
          {status.warn && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
          <span>{status.text}</span>
        </p>
      </div>

      <article
        id="report"
        aria-labelledby="report-title"
        aria-hidden={compact || undefined}
        className={compact ? 'report-print-only' : 'rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-10'}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-stone-200 pb-3">
          <p className="m-0 font-display text-lg font-bold text-forest-800">GlobalStudyBoard</p>
          <p className="m-0 text-xs font-semibold uppercase tracking-wide text-stone-600">Report · {doc.toolName}</p>
        </div>
        <h2 id="report-title" className="mt-6 font-display text-3xl font-bold tracking-editorial text-ink">
          {doc.title}
        </h2>
        {doc.subtitle && <p className="m-0 mt-1 text-base text-stone-600">{doc.subtitle}</p>}
        <p className="m-0 mt-4 max-w-3xl text-sm leading-relaxed text-ink">{doc.intro}</p>
        <p className="m-0 mt-3 text-xs text-stone-600">
          Generated <time dateTime={doc.generatedAt}>{formatGenerated(doc.generatedAt)}</time> · Destination: {doc.regionName}
          {doc.includesNotes ? ' · Includes your private notes' : ''}
        </p>
        <p className="m-0 mt-1 max-w-3xl text-xs leading-relaxed text-stone-600">{PREPARED_BY}</p>

        <div className="mt-8 space-y-8">
          {doc.sections.map((s, i) => (
            <Section key={i} s={s} index={i} />
          ))}

          {doc.sources.length > 0 && (
            <section aria-labelledby="report-sources">
              <h3 id="report-sources" className="font-display text-lg font-bold tracking-editorial text-ink">
                Sources cited in this report
              </h3>
              <p className="m-0 mt-1 text-sm text-stone-600">Official pages linked from the tool. Confirm every figure and rule there before relying on it.</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {doc.sources.map((src) => (
                  <li key={src.url}>
                    <span className="font-semibold text-ink">{src.label}</span>
                    {' — '}
                    {/* The link text IS the address, so the print stylesheet does not append it again (data-url-text). */}
                    <a href={src.url} target="_blank" rel="noopener noreferrer" data-url-text="" className={`${LINK} break-all`}>
                      {src.url}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="mt-10 space-y-2 border-t border-stone-200 pt-4 text-xs leading-relaxed text-stone-600">
          {REPORT_FOOTER_LINES.map((line) => (
            <p key={line} className="m-0">
              {line}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}

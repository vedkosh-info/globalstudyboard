/**
 * ReportDocument → PDF, drawn entirely in the browser with jsPDF + AutoTable.
 *
 * Why in the browser (§9, §18): the student's rows never leave the device —
 * no server renders them, no e-mail address or identifier goes into the file.
 * The three font subsets (Inter 400/600 and Fraunces 700 — the site's heading weight — OFL, under
 * /public/fonts/report) are fetched only on the first PDF and embedded so
 * every currency symbol the site formats (₹ ₩ ₫ ₱ € £ ¥ …) prints — jsPDF's
 * built-in Helvetica cannot draw them. The Inter subsets cover Latin
 * (Extended-A/B and Vietnamese), Greek, Cyrillic and common symbols; Fraunces
 * covers Latin only, so a title it cannot draw is set in Inter instead.
 *
 * A student may type in any script (a note in Hindi, a university name in
 * Chinese). jsPDF draws a character its font lacks as NOTHING — letters would
 * silently vanish from the PDF while the page still shows them. So every
 * string is fitted to the embedded fonts before it is drawn (`fitText`): a
 * character they cannot draw becomes a visible □ and the result reports it
 * (`missingGlyphs`), so the report view can say so and point to Print, which
 * uses the browser's fonts and keeps everything.
 *
 * Every page carries the site disclaimer and the non-affiliation notice
 * (`REPORT_FOOTER_LINES`) and a "Page x of y"; the first page says who
 * prepared the document and that it is not an official record.
 *
 * Loaded lazily (dynamic import from the report view) — jsPDF is ~300 KB and
 * must never sit in a page chunk, let alone the layout chunk.
 */

import type { jsPDF as JsPdf } from 'jspdf';
import type { CellHookData, UserOptions } from 'jspdf-autotable';
import { PREPARED_BY, REPORT_FOOTER_LINES, cellText, cellUrl, formatGenerated, reportFilename, type Cell, type FactsSection, type Paper, type ReportDocument, type TableSection } from '@/lib/reports/model';

export interface PdfOptions {
  paper: Paper;
}

export interface PdfResult {
  blob: Blob;
  pages: number;
  bytes: number;
  filename: string;
  /** True when some characters could not be drawn with the embedded fonts and were printed as □. */
  missingGlyphs: boolean;
}

// ── Fonts ───────────────────────────────────────────────────────────────────
//
// How the subsets were cut (September 2026), so they can be cut again: fontTools
// from the OFL variable fonts in github.com/google/fonts — ofl/inter/Inter[opsz,wght].ttf
// (4.001) instanced at opsz 14, wght 400 / 600, and ofl/fraunces/Fraunces[SOFT,WONK,opsz,wght].ttf
// (1.000) at opsz 36, wght 700, SOFT 0, WONK 0; then subset, unhinted, to Basic Latin,
// Latin-1, Latin Extended-A/B, IPA, spacing modifiers, Greek, Cyrillic (+ supplement),
// Latin Extended Additional, general punctuation and spaces, super/subscripts, currency,
// letterlike symbols, number forms, arrows, maths operators, geometric shapes (□) and
// ✓ ✗ ❤ — whatever of those each family has. GSUB/GPOS/GDEF/STAT are dropped: jsPDF reads
// only cmap/glyf/loca/hmtx/hhea/maxp/head/post/name/OS-2 and applies no layout features.
// Glyphs shared with the previous cut are unchanged, so existing reports lay out the same.

const FONT_FILES = {
  regular: '/fonts/report/inter-400.ttf',
  bold: '/fonts/report/inter-600.ttf',
  display: '/fonts/report/fraunces-700.ttf',
} as const;
type FontKey = keyof typeof FONT_FILES;

interface LoadedFont {
  /** The file, base64 — what jsPDF's virtual file system takes. */
  data: string;
  /** Every code point the file can draw (see `fontCoverage`). */
  covers: Set<number>;
}

let fontCache: Promise<Record<FontKey, LoadedFont>> | null = null;

function toBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let out = '';
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) out += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + step)));
  return btoa(out);
}

/**
 * The code points a TrueType file maps to a real glyph, read from the same
 * subtable jsPDF itself draws through — the first Unicode format-4 cmap,
 * platform 0 or (3, 1) — so "covered" means exactly "jsPDF will draw it".
 * Read from the file at run time, so it can never drift from the subsets.
 */
export function fontCoverage(buf: ArrayBuffer): Set<number> {
  const v = new DataView(buf);
  const covers = new Set<number>();
  const tag = (at: number) => String.fromCharCode(v.getUint8(at), v.getUint8(at + 1), v.getUint8(at + 2), v.getUint8(at + 3));
  let cmap = -1;
  for (let i = 0, n = v.getUint16(4); i < n; i += 1) if (tag(12 + 16 * i) === 'cmap') cmap = v.getUint32(12 + 16 * i + 8);
  if (cmap < 0) return covers;
  for (let i = 0, n = v.getUint16(cmap + 2); i < n; i += 1) {
    const rec = cmap + 4 + 8 * i;
    const platform = v.getUint16(rec);
    const encoding = v.getUint16(rec + 2);
    const sub = cmap + v.getUint32(rec + 4);
    if (v.getUint16(sub) !== 4 || !(platform === 0 || (platform === 3 && encoding === 1))) continue;
    const segments = v.getUint16(sub + 6) / 2;
    const ends = sub + 14;
    const starts = ends + 2 * segments + 2; // + reservedPad
    const deltas = starts + 2 * segments;
    const rangeOffsets = deltas + 2 * segments;
    for (let seg = 0; seg < segments; seg += 1) {
      const end = v.getUint16(ends + 2 * seg);
      const delta = v.getUint16(deltas + 2 * seg);
      const rangeAt = rangeOffsets + 2 * seg;
      const rangeOffset = v.getUint16(rangeAt);
      for (let cp = v.getUint16(starts + 2 * seg); cp <= end && cp !== 0xffff; cp += 1) {
        const raw = rangeOffset === 0 ? cp : v.getUint16(rangeAt + rangeOffset + 2 * (cp - v.getUint16(starts + 2 * seg)));
        if (rangeOffset !== 0 && raw === 0) continue;
        if (((raw + delta) & 0xffff) !== 0) covers.add(cp);
      }
    }
    return covers;
  }
  return covers;
}

async function loadFonts(): Promise<Record<FontKey, LoadedFont>> {
  if (!fontCache) {
    fontCache = (async () => {
      const entries = await Promise.all(
        (Object.keys(FONT_FILES) as FontKey[]).map(async (key) => {
          const res = await fetch(FONT_FILES[key], { cache: 'force-cache' });
          if (!res.ok) throw new Error(`Font ${FONT_FILES[key]} answered ${res.status}`);
          const buf = await res.arrayBuffer();
          return [key, { data: toBase64(buf), covers: fontCoverage(buf) }] as const;
        }),
      );
      return Object.fromEntries(entries) as Record<FontKey, LoadedFont>;
    })().catch((err: unknown) => {
      fontCache = null; // let the next click retry
      throw err;
    });
  }
  return fontCache;
}

// ── Fitting text to the fonts ───────────────────────────────────────────────

/** Drawn in place of a character the embedded fonts lack: U+25A1 WHITE SQUARE, in both Inter subsets. */
export const PDF_PLACEHOLDER = '\u25A1';

/** Invisible by definition (soft hyphen, zero-width joiners, bidi marks, variation selectors …) — dropped, never boxed. */
const INVISIBLE = /\p{Default_Ignorable_Code_Point}/gu;
/** The same class, for testing one character — a separate, non-global pattern: `.test()` on a /g regex is stateful. */
const IS_INVISIBLE = /^\p{Default_Ignorable_Code_Point}$/u;

let segmenter: Intl.Segmenter | null | undefined;

/** User-perceived characters, so a letter with its marks (नो, a flag, a family emoji) becomes ONE □, not several. */
function graphemes(s: string): string[] {
  if (segmenter === undefined) segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter('en', { granularity: 'grapheme' }) : null;
  if (segmenter) return Array.from(segmenter.segment(s), (g) => g.segment);
  // Engines without Intl.Segmenter: a combining mark or a joined character stays with the one before it.
  const out: string[] = [];
  for (const ch of s) {
    const last = out.length - 1;
    if (last >= 0 && (/^[\p{M}\u200D]$/u.test(ch) || out[last].endsWith('\u200D'))) out[last] += ch;
    else out.push(ch);
  }
  return out;
}

const drawable = (ch: string, covers: Set<number>): boolean => {
  const cp = ch.codePointAt(0) as number;
  return covers.has(cp) || cp === 0x0a || cp === 0x0d;
};

/**
 * One string, fitted to a font: composed first (NFC, so "e" + combining acute
 * is the "é" the font has), invisible format characters dropped, a space the
 * font lacks drawn as a space, a line separator as a line break, and any
 * other character it cannot draw replaced by □ — visible, never silent.
 */
export function fitText(text: string, covers: Set<number>): { text: string; missing: boolean } {
  // A tab (common in pasted notes) has no glyph: jsPDF would silently drop the
  // rest of the line at it. It is whitespace, so it becomes a space.
  const s = text.replace(/\t/g, ' ').normalize('NFC');
  let clean = true;
  for (const ch of s) {
    // An invisible character takes the slow path even when the font maps it: Fraunces
    // draws U+00AD (a soft hyphen pasted from a word processor) as a VISIBLE hyphen, so a
    // label "Uni\u00ADversität" titled "Uni-versität" in the PDF while the page showed it whole
    // (review RH-2). Stripped per grapheme below, never from the whole string up front —
    // that would split a ZWJ emoji into several □ instead of one.
    if (!drawable(ch, covers) || IS_INVISIBLE.test(ch)) {
      clean = false;
      break;
    }
  }
  if (clean) return { text: s, missing: false };
  let out = '';
  let missing = false;
  for (const g of graphemes(s)) {
    const visible = g.replace(INVISIBLE, '');
    if (!visible) continue;
    if (Array.from(visible).every((ch) => drawable(ch, covers))) out += visible;
    else if (/^\p{Zs}$/u.test(visible)) out += ' ';
    else if (/^[\u2028\u2029]$/.test(visible)) out += '\n';
    else {
      out += PDF_PLACEHOLDER;
      missing = true;
    }
  }
  return { text: out, missing };
}

// ── Palette (the site's tokens, as RGB) ─────────────────────────────────────

const INK: [number, number, number] = [10, 10, 10];
const MUTED: [number, number, number] = [87, 83, 78];
const FOREST: [number, number, number] = [20, 83, 45];
const FOREST_DARK: [number, number, number] = [15, 63, 35];
const RULE: [number, number, number] = [214, 211, 209];
const HEAD_FILL: [number, number, number] = [240, 247, 242];
const CALLOUT_FILL: [number, number, number] = [255, 248, 231];

const MARGIN = 16; // mm
const HEADER_H = 12; // running header band under the top margin
const FOOTER_H = 27; // disclaimer + notice (up to 5 wrapped lines at 6.5 pt) + page line

const pt = (n: number): number => n * 0.352778; // points → mm
const lineHeight = (size: number): number => pt(size) * 1.42;

// ── Renderer ────────────────────────────────────────────────────────────────

export async function renderReportPdf(doc: ReportDocument, opts: PdfOptions): Promise<PdfResult> {
  const [{ jsPDF }, { default: autoTable }, fonts] = await Promise.all([import('jspdf'), import('jspdf-autotable'), loadFonts()]);

  const pdf = new jsPDF({ unit: 'mm', format: opts.paper === 'letter' ? 'letter' : 'a4', compress: true });
  pdf.addFileToVFS('inter-400.ttf', fonts.regular.data);
  pdf.addFont('inter-400.ttf', 'Inter', 'normal');
  pdf.addFileToVFS('inter-600.ttf', fonts.bold.data);
  pdf.addFont('inter-600.ttf', 'Inter', 'bold');
  pdf.addFileToVFS('fraunces-700.ttf', fonts.display.data);
  pdf.addFont('fraunces-700.ttf', 'Fraunces', 'bold');
  // Metadata strings are shown by the viewer in its own fonts (jsPDF writes non-Latin text there as UTF-16), so they stay as typed.
  pdf.setProperties({
    title: doc.title,
    subject: `${doc.toolName} report — ${doc.regionName}`,
    author: 'Prepared by the account holder',
    creator: 'GlobalStudyBoard (generated in the browser)',
    keywords: `${doc.toolName}, ${doc.regionName}`,
  });

  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const contentW = W - 2 * MARGIN;
  const top = MARGIN + HEADER_H;
  const bottom = H - FOOTER_H;
  let y = top;

  // Body text may be set in either Inter weight, so it may use only what BOTH subsets draw.
  const bodyCovers = new Set([...fonts.regular.covers].filter((cp) => fonts.bold.covers.has(cp)));
  let missingGlyphs = false;
  /** Every string drawn in Inter goes through this (see `fitText`). */
  const fit = (text: string): string => {
    const r = fitText(text, bodyCovers);
    if (r.missing) missingGlyphs = true;
    return r.text;
  };

  const setFont = (style: 'normal' | 'bold' | 'display', size: number, color: [number, number, number] = INK) => {
    if (style === 'display') pdf.setFont('Fraunces', 'bold');
    else pdf.setFont('Inter', style);
    pdf.setFontSize(size);
    pdf.setTextColor(color[0], color[1], color[2]);
  };

  const ensure = (h: number) => {
    if (y + h > bottom) {
      pdf.addPage();
      y = top;
    }
  };

  const paragraph = (text: string, size = 9, color: [number, number, number] = INK, style: 'normal' | 'bold' = 'normal', gapAfter = 2) => {
    setFont(style, size, color);
    const lines: string[] = pdf.splitTextToSize(fit(text), contentW);
    const lh = lineHeight(size);
    for (const line of lines) {
      ensure(lh);
      pdf.text(line, MARGIN, y + pt(size));
      y += lh;
    }
    y += gapAfter;
  };

  /** Keep-with-next: a heading needs room for itself AND a first line/row of what follows (never orphaned at a page foot). */
  const heading = (text: string) => {
    ensure(lineHeight(11) + 8 + 22);
    y += 3;
    setFont('bold', 11, FOREST_DARK);
    pdf.text(fit(text), MARGIN, y + pt(11));
    y += lineHeight(11) + 1.5;
  };

  const callout = (text: string) => {
    setFont('normal', 8.5, INK);
    const inner = contentW - 8;
    const lines: string[] = pdf.splitTextToSize(fit(text), inner);
    const lh = lineHeight(8.5);
    const boxH = lines.length * lh + 6;
    ensure(boxH + 2);
    pdf.setFillColor(CALLOUT_FILL[0], CALLOUT_FILL[1], CALLOUT_FILL[2]);
    pdf.setDrawColor(RULE[0], RULE[1], RULE[2]);
    pdf.setLineWidth(0.25);
    pdf.roundedRect(MARGIN, y, contentW, boxH, 1.5, 1.5, 'FD');
    let ty = y + 3;
    for (const line of lines) {
      pdf.text(line, MARGIN + 4, ty + pt(8.5));
      ty += lh;
    }
    y += boxH + 3;
  };

  /** The shared AutoTable base: fonts, colours, margins that keep every page's header + footer bands clear. */
  const tableBase = (): UserOptions => ({
    startY: y,
    margin: { top, bottom: FOOTER_H + 1, left: MARGIN, right: MARGIN },
    theme: 'grid',
    styles: { font: 'Inter', fontStyle: 'normal', fontSize: 8.5, cellPadding: 1.8, textColor: INK, lineColor: RULE, lineWidth: 0.2, overflow: 'linebreak', valign: 'top' },
    headStyles: { fillColor: HEAD_FILL, textColor: FOREST_DARK, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    rowPageBreak: 'avoid',
  });

  const finalY = (): number => (pdf as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? y;

  const cellStyle = (c: Cell | undefined, data: CellHookData) => {
    if (!c || typeof c === 'string') return;
    if (c.strong) data.cell.styles.fontStyle = 'bold';
    if (c.muted) data.cell.styles.textColor = MUTED;
    if (c.align) data.cell.styles.halign = c.align;
    if (c.url) data.cell.styles.textColor = FOREST;
  };

  const linkCell = (c: Cell | undefined, data: CellHookData) => {
    const url = c ? cellUrl(c) : undefined;
    if (url) pdf.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url });
  };

  /** The height `paragraph(text, 8.5, …)` will take: its wrapped lines at that size, plus the gap after it. */
  const introHeight = (text: string): number => {
    setFont('normal', 8.5, MUTED);
    const lines: string[] = pdf.splitTextToSize(fit(text), contentW);
    return lines.length * lineHeight(8.5) + 2;
  };

  /** What `heading` adds to y: the space above, one line at 11 pt, the space below. */
  const HEADING_H = 3 + lineHeight(11) + 1.5;
  // AutoTable's own page bottom (its margin.bottom is FOOTER_H + 1), less half a millimetre so a
  // rounding difference can never make it move a table the measurement below said would fit.
  const tableLimit = bottom - 1.5;

  const table = (s: TableSection) => {
    const weights = s.columns.map((c) => c.weight ?? 1);
    const sum = weights.reduce((a, b) => a + b, 0);
    const colW = weights.map((w) => (contentW * w) / sum);
    /**
     * A row's height exactly as AutoTable will lay it out: each cell's text split on its line
     * breaks and wrapped at its column's width less the 1.8 mm padding each side (plus the 1 pt
     * AutoTable adds against rounding), at 8.5 pt in the weight it is drawn in; the tallest cell
     * × the line height, plus the vertical padding. Measured, never estimated — a readiness or
     * scores row whose validity sentence wraps to five lines is five lines tall (review LEG-12).
     */
    const rowH = (cells: Array<{ text: string; bold: boolean }>): number => {
      let lines = 1;
      cells.forEach((c, i) => {
        setFont(c.bold ? 'bold' : 'normal', 8.5);
        const width = colW[i] - 3.6 + 1 / pdf.internal.scaleFactor;
        const wrapped: string[] = pdf.splitTextToSize(c.text.replace(/\r\n?/g, '\n'), width, { fontSize: 8.5 });
        lines = Math.max(lines, wrapped.length);
      });
      return lines * pt(8.5) * pdf.getLineHeightFactor() + 3.6;
    };
    const headH = rowH(s.columns.map((c) => ({ text: fit(c.label), bold: true })));
    const bodyHs = s.rows.map((r) => rowH(r.map((c) => ({ text: fit(cellText(c)), bold: typeof c !== 'string' && Boolean(c.strong) }))));
    const tableH = headH + bodyHs.reduce((a, b) => a + b, 0);
    const introH = s.intro ? introHeight(s.intro) : 0;
    // A short table (≤ 12 rows) that fits on a fresh page, heading and intro included, moves
    // whole rather than splitting. Anything taller breaks by row with the head repeated — even
    // a 12-row one, which `pageBreak: 'avoid'` would only push to a page of its own, away from
    // its heading.
    const whole = s.rows.length > 0 && s.rows.length <= 12 && HEADING_H + introH + tableH <= tableLimit - top;
    // Keep-with-next for the block: the heading and intro travel with the whole of a short table,
    // with the header row and first row of a longer one, or with the empty-state line. If that
    // will not fit on this page, start the next one first, so a heading and intro never sit alone
    // above a page break. (At the top of a page already, a new page would only add a blank one.)
    const keepH = s.rows.length === 0 ? lineHeight(9) + 2 : whole ? tableH : headH + bodyHs[0];
    if (y > top && y + HEADING_H + introH + keepH > tableLimit) {
      pdf.addPage();
      y = top;
    }
    heading(s.heading);
    if (s.intro) paragraph(s.intro, 8.5, MUTED);
    if (s.rows.length === 0) {
      paragraph(s.empty ?? 'Nothing recorded yet.', 9, MUTED);
    } else {
      const columnStyles: NonNullable<UserOptions['columnStyles']> = {};
      s.columns.forEach((c, i) => {
        columnStyles[i] = { cellWidth: colW[i], halign: c.align ?? 'left' };
      });
      autoTable(pdf, {
        ...tableBase(),
        pageBreak: whole ? 'avoid' : 'auto',
        head: [s.columns.map((c) => fit(c.label))],
        body: s.rows.map((r) => r.map((c) => fit(cellText(c)))),
        columnStyles,
        didParseCell: (data) => {
          if (data.section === 'body') cellStyle(s.rows[data.row.index]?.[data.column.index], data);
          if (data.section === 'head') data.cell.styles.halign = s.columns[data.column.index]?.align ?? 'left';
        },
        didDrawCell: (data) => {
          if (data.section === 'body') linkCell(s.rows[data.row.index]?.[data.column.index], data);
        },
      });
      y = finalY() + 2.5;
    }
    if (s.footnote) paragraph(s.footnote, 7.5, MUTED, 'normal', 3);
  };

  const facts = (s: FactsSection) => {
    heading(s.heading);
    autoTable(pdf, {
      ...tableBase(),
      theme: 'plain',
      styles: { font: 'Inter', fontSize: 9, cellPadding: { top: 1.4, bottom: 1.4, left: 0, right: 3 }, textColor: INK, overflow: 'linebreak', valign: 'top' },
      body: s.items.map((it) => [fit(it.label), fit(cellText(it.value))]),
      columnStyles: { 0: { cellWidth: contentW * 0.28, fontStyle: 'bold', textColor: MUTED }, 1: { cellWidth: contentW * 0.72 } },
      didParseCell: (data) => {
        if (data.column.index === 1) cellStyle(s.items[data.row.index]?.value, data);
      },
      didDrawCell: (data) => {
        if (data.column.index === 1) linkCell(s.items[data.row.index]?.value, data);
      },
    });
    y = finalY() + 3;
  };

  // ── Title block (page 1) ──────────────────────────────────────────────
  // Fraunces when it can draw the whole title (it covers Latin only); otherwise the title is set in
  // Inter semibold, which also covers Greek and Cyrillic — never a Fraunces title with holes in it.
  const displayTitle = fitText(doc.title, fonts.display.covers);
  setFont(displayTitle.missing ? 'bold' : 'display', 19, INK);
  const titleLines: string[] = pdf.splitTextToSize(displayTitle.missing ? fit(doc.title) : displayTitle.text, contentW);
  for (const line of titleLines) {
    pdf.text(line, MARGIN, y + pt(19));
    y += lineHeight(19);
  }
  y += 1;
  if (doc.subtitle) paragraph(doc.subtitle, 10, MUTED, 'normal', 3);
  paragraph(doc.intro, 9.5, INK, 'normal', 2);
  paragraph(`Generated ${formatGenerated(doc.generatedAt)} · Destination: ${doc.regionName}${doc.includesNotes ? ' · Includes the account holder’s private notes' : ''}`, 8, MUTED, 'normal', 1.5);
  paragraph(PREPARED_BY, 8, MUTED, 'normal', 4);

  // ── Sections ──────────────────────────────────────────────────────────
  for (const s of doc.sections) {
    if (s.kind === 'table') table(s);
    else if (s.kind === 'facts') facts(s);
    else if (s.kind === 'text') {
      heading(s.heading);
      for (const p of s.paragraphs) paragraph(p, 9, INK, 'normal', 1.5);
      y += 1.5;
    } else callout(s.text);
  }

  // ── Sources ───────────────────────────────────────────────────────────
  if (doc.sources.length) {
    heading('Sources cited in this report');
    paragraph('Official pages linked from the tool. Confirm every figure and rule there before relying on it.', 8.5, MUTED);
    for (const src of doc.sources) {
      const lh = lineHeight(8.5);
      ensure(lh * 2 + 1);
      setFont('bold', 8.5, INK);
      const labelLines: string[] = pdf.splitTextToSize(fit(src.label), contentW);
      for (const line of labelLines) {
        ensure(lh);
        pdf.text(line, MARGIN, y + pt(8.5));
        y += lh;
      }
      setFont('normal', 8, FOREST);
      // The printed address is fitted; the link itself keeps the exact URL.
      const urlLines: string[] = pdf.splitTextToSize(fit(src.url), contentW);
      for (const line of urlLines) {
        ensure(lh);
        pdf.textWithLink(line, MARGIN, y + pt(8), { url: src.url });
        y += lh;
      }
      y += 1;
    }
  }

  // ── Running header + footer on every page (drawn last: page counts are known) ──
  const pages = pdf.getNumberOfPages();
  for (let p = 1; p <= pages; p += 1) {
    pdf.setPage(p);
    // Header band
    setFont('display', 12, FOREST_DARK);
    pdf.text('GlobalStudyBoard', MARGIN, MARGIN + pt(12));
    setFont('normal', 8, MUTED);
    pdf.text(fit(`Report · ${doc.toolName}`), W - MARGIN, MARGIN + pt(12), { align: 'right' });
    pdf.setDrawColor(RULE[0], RULE[1], RULE[2]);
    pdf.setLineWidth(0.3);
    pdf.line(MARGIN, MARGIN + HEADER_H - 3, W - MARGIN, MARGIN + HEADER_H - 3);
    // Footer band — laid out bottom-up so the notices can never run into the page line however they wrap.
    setFont('normal', 6.5, MUTED);
    const wrapped = REPORT_FOOTER_LINES.map((text) => pdf.splitTextToSize(fit(text), contentW) as string[]);
    const lh = lineHeight(6.5);
    const pageLineY = H - 6;
    const blockH = wrapped.reduce((h, lines) => h + lines.length * lh, 0) + (wrapped.length - 1) * 0.8;
    let fy = pageLineY - 4.5 - blockH;
    pdf.setDrawColor(RULE[0], RULE[1], RULE[2]);
    pdf.line(MARGIN, fy - 2, W - MARGIN, fy - 2);
    for (const lines of wrapped) {
      for (const line of lines) {
        pdf.text(line, MARGIN, fy + pt(6.5));
        fy += lh;
      }
      fy += 0.8;
    }
    setFont('normal', 7, MUTED);
    pdf.text(fit(`globalstudyboard.com · ${doc.toolName} · generated ${formatGenerated(doc.generatedAt)}`), MARGIN, pageLineY);
    pdf.text(`Page ${p} of ${pages}`, W - MARGIN, pageLineY, { align: 'right' });
  }

  const blob = pdf.output('blob');
  return { blob, pages, bytes: blob.size, filename: reportFilename(doc), missingGlyphs };
}

export type { JsPdf };

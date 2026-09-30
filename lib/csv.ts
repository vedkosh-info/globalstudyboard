/**
 * One CSV cell, safe to open in a spreadsheet — shared by every tool's
 * download (planner, cost planner, compare, test score tracker).
 *
 * A cell that starts with = + - @ (or a tab/CR) would be evaluated as a
 * FORMULA by the spreadsheet the student opens the file in, so it is prefixed
 * with an apostrophe to stay text — the same neutraliser the feedback sheet
 * uses. A plain number (including a negative total) is a value, not a
 * formula, and is written as-is. Quotes, commas and newlines are quoted.
 */
export function csvCell(v: string | number | null | undefined): string {
  const s = v === null || v === undefined ? '' : String(v);
  if (/^-?\d+(\.\d+)?$/.test(s)) return s;
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/**
 * The UTF-8 byte-order mark. Excel on Windows reads a CSV without it in the
 * local ANSI code page, so every — ’ – and accented letter the tools write
 * (validity sentences, student notes, "Écriture") would open as mojibake
 * ("â€”", "Ã‰"). Other spreadsheet apps read the mark as the encoding
 * signature and do not show it.
 */
const UTF8_BOM = '\uFEFF';

/** Rows → a BOM-prefixed, CRLF-terminated CSV document (the Blob encodes it as UTF-8). */
export function csvDocument(rows: Array<Array<string | number | null | undefined>>): string {
  return UTF8_BOM + rows.map((r) => r.map((c) => csvCell(c)).join(',')).join('\r\n') + '\r\n';
}

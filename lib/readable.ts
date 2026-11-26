// ─────────────────────────────────────────────────────────────────────────────
// Short paragraphs for every page.
//
// Readers skim, so prose renders in paragraphs of at most two sentences and
// about three lines on a desktop screen. Content files keep their own
// paragraph breaks; this splits any paragraph that runs longer at a sentence
// boundary when the page renders. It never rewrites a sentence, so no fact
// can change. A single sentence longer than the limit stays whole.
//
// Pure, dependency-free, safe on the server and in client components.
// ─────────────────────────────────────────────────────────────────────────────

/** About three lines at the guide column width on desktop. */
export const PARAGRAPH_MAX_CHARS = 240;
export const PARAGRAPH_MAX_SENTENCES = 2;

/**
 * Words that end in a full stop without ending a sentence. A word that already
 * contains a full stop ("U.S", "e.g", "Ph.D", "B.Tech") is treated the same
 * way by the rule in `endsWithAbbreviation`, so it is not listed here.
 */
const ABBREVIATIONS = new Set([
  'dr', 'mr', 'mrs', 'ms', 'prof', 'st', 'sr', 'jr', 'no', 'nos', 'vs', 'etc',
  'approx', 'incl', 'excl', 'est', 'dept', 'univ', 'govt', 'inst', 'assn', 'art',
  'sec', 'sch', 'fig', 'vol', 'ed', 'eds', 'rs', 'mt', 'ft', 'co', 'corp', 'inc',
  'ltd', 'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'sept', 'oct',
  'nov', 'dec',
]);

function endsWithAbbreviation(text: string): boolean {
  const m = /([A-Za-z][A-Za-z.]*)\.$/.exec(text);
  if (!m) return false;
  const word = m[1];
  if (word.includes('.')) return true; // U.S. e.g. Ph.D. B.Tech.
  if (word.length === 1) return true; // an initial, as in "J. Smith"
  return ABBREVIATIONS.has(word.toLowerCase());
}

/**
 * Split one paragraph into sentences. A boundary is a full stop, question mark
 * or exclamation mark (optionally followed by a closing quote or bracket),
 * then whitespace, then a capital letter, a digit or an opening quote.
 */
export function splitSentences(paragraph: string): string[] {
  const pieces = paragraph.split(/(?<=[.!?]["'”’)\]]?)\s+(?=["'“‘(]?[A-Z0-9])/);
  const out: string[] = [];
  let pending = '';
  for (const piece of pieces) {
    pending = pending ? `${pending} ${piece}` : piece;
    if (!endsWithAbbreviation(pending)) {
      out.push(pending);
      pending = '';
    }
  }
  if (pending) out.push(pending);
  return out;
}

/**
 * Turn a text block into short paragraphs. Blank lines in the source are kept
 * as paragraph breaks; a paragraph longer than the limits is packed into runs
 * of whole sentences (at most `maxSentences`, and at most `maxChars` unless a
 * single sentence is longer on its own).
 */
export function readableParagraphs(
  text: string | undefined | null,
  maxChars: number = PARAGRAPH_MAX_CHARS,
  maxSentences: number = PARAGRAPH_MAX_SENTENCES,
): string[] {
  if (!text) return [];
  const out: string[] = [];
  for (const raw of text.split(/\n\s*\n/)) {
    const paragraph = raw.replace(/\s+/g, ' ').trim();
    if (!paragraph) continue;
    const sentences = splitSentences(paragraph);
    if (paragraph.length <= maxChars && sentences.length <= maxSentences) {
      out.push(paragraph);
      continue;
    }
    let chunk: string[] = [];
    let chunkLength = 0;
    for (const sentence of sentences) {
      const fits =
        chunk.length > 0 &&
        chunk.length < maxSentences &&
        chunkLength + 1 + sentence.length <= maxChars;
      if (chunk.length === 0 || fits) {
        chunk.push(sentence);
        chunkLength += (chunk.length > 1 ? 1 : 0) + sentence.length;
      } else {
        out.push(chunk.join(' '));
        chunk = [sentence];
        chunkLength = sentence.length;
      }
    }
    if (chunk.length) out.push(chunk.join(' '));
  }
  return out;
}

/** The first short paragraph of a text block, for cards and summaries. */
export function firstParagraph(text: string | undefined | null): string {
  return readableParagraphs(text)[0] ?? '';
}

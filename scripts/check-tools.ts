// scripts/check-tools.ts — prebuild gate for the tools layer (constitution §18).
//
// The tools rest on plain string literals and hand-kept lists — guide slugs,
// source URLs, category keys, the migrations' CHECK lists — that nothing in
// `tsc` or `next build` would notice going stale, so a tool would ship a dead
// link or offer a value the database refuses. This runs before every build
// (package.json "prebuild") and fails it on:
//   1. Cost & Funding Planner: a destination with no or a thin budget
//      definition; a category key that breaks the DB CHECK, duplicates or
//      shadows 'other'; a guide slug missing from lib/guides.ts; a non-https
//      source, or a source that is a site's front page rather than the exact
//      page it is cited for; a hint that states a figure; a currency outside
//      the tool's list
//   2. Compare Universities: a default criterion that implies admission odds,
//      or more defaults than the per-set cap
//   3. Reports: a missing / wrong-weight font subset, or the disclaimer and
//      non-affiliation notice drifting from the Footer
//   4. Migrations (every file after 0001): a destination list (a CHECK on a
//      column named *region / *destination, or whose values are all
//      destinations) or an exam list (on test_scores, any CHECK on exam_slug;
//      elsewhere, a CHECK that quotes two or more values, all of them
//      catalogue exams, or a CHECK on an exam column — exam, exams, exam_slug,
//      target_exam, exam_id … — that quotes a catalogue exam) that is not a
//      named, re-applied plain "col in ('…', …)" constraint on the right
//      table, or that drifts from lib/regions.ts / the exam catalogue — a
//      cross-field rule on a destination column passes only as a reviewed
//      NOT_A_LIST entry; a kept list (0003–0005's tool tables, 0007's profiles
//      and saved_items, 0006's test_scores) whose last add/drop in migration
//      order is a drop; an inline CHECK (DO blocks included), a domain or an
//      enum holding destinations; destination or kept-list DDL inside dynamic
//      SQL or a function body (nested literals and format() arguments included
//      — conservatively, so a body that runs unrelated CHECK DDL and names a
//      destination elsewhere is refused too); and two or more destinations
//      named together anywhere else — a trigger or function, an array literal,
//      a lookup insert, a mapping. Not detected: a destination column that has
//      no list at all.
//   5. Test Score Tracker: a catalogue exam without a well-formed validity
//      rule, or a body label that would read broken mid-sentence
//   6. Bundle guard: ANY module that can reach the browser (every 'use client'
//      file and everything it imports, transitively) value-importing a content
//      catalogue or a server-only projection, or importing a computed path
//   7. Snippets: the /tools meta description, or a tool page's meta built from
//      its tagline, no longer fitting whole in its limit
//   8. a registered tool (lib/tools.ts) without a page under app/tools/<slug>
// No network — fast enough to run on every build.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import * as ts from 'typescript';
import { DESTINATION_BUDGETS, OTHER_CATEGORY, CATEGORY_KEY_RE, CURRENCIES, isKnownCurrency } from '../lib/cost-planner';
import { GUIDES } from '../lib/guides';
import { REGION_SLUGS, getRegionBySlug } from '../lib/regions';
import { TOOLS, TOOLS_INDEX_DESCRIPTION_MAX, toolsIndexDescription } from '../lib/tools';
import { DEFAULT_CRITERIA, COMPARE_LIMITS } from '../lib/compare';
import { NON_AFFILIATION_NOTICE, SITE_DISCLAIMER } from '../lib/site-meta';
import { DATED_KINDS, EXAM_VALIDITY } from '../lib/test-validity';
import { ENTRANCE_EXAMS } from '../lib/admission-guides';


/** usWeightClass from a TrueType file's OS/2 table (table directory: numTables at byte 4, 16-byte records from byte 12). */
function ttfWeightClass(buf: Buffer): number {
  const numTables = buf.readUInt16BE(4);
  for (let i = 0; i < numTables; i += 1) {
    const rec = 12 + i * 16;
    if (buf.toString('latin1', rec, rec + 4) === 'OS/2') return buf.readUInt16BE(buf.readUInt32BE(rec + 8) + 4);
  }
  return -1;
}

/**
 * The SQL with comments — and, unless `keepStrings`, the inside of quoted
 * literals and dollar-quoted function bodies — blanked to spaces, offsets
 * preserved, so a keyword search never matches inside a comment or a string
 * and a bracket count is never thrown by one. A DO block's body is the
 * exception: it is code the migration runs, so `do $$ … $$` stays visible
 * (its own comments and strings still masked) and DDL inside it is read like
 * any top-level statement. When `hidden` is given, the raw text of every
 * masked literal and function body is pushed to it, so a caller can look for
 * DDL that no keyword scan of the code can see (dynamic SQL, DDL in a function).
 */
function maskSql(sql: string, keepStrings = false, hidden?: string[]): string {
  const out = sql.split('');
  const blank = (from: number, to: number) => {
    for (let k = from; k < to; k += 1) if (out[k] !== '\n') out[k] = ' ';
  };
  let doTag: string | null = null;
  // Where the DO body's literals start in `hidden`: the whole body is pushed
  // once more when it closes, so dynamic SQL split across several literals
  // (concatenation, format() arguments) is read as one text, like a function body.
  let doFrom = -1;
  let i = 0;
  while (i < sql.length) {
    const two = sql.slice(i, i + 2);
    if (two === '--' || two === '/*') {
      const end = two === '--' ? sql.indexOf('\n', i) : sql.indexOf('*/', i + 2);
      const to = end < 0 ? sql.length : two === '--' ? end : end + 2;
      blank(i, to);
      i = to;
    } else if (sql[i] === "'") {
      // '' is an escaped quote; E'…' strings also take backslash escapes.
      const escapes = /[eE]/.test(sql[i - 1] ?? '') && !/\w/.test(sql[i - 2] ?? '');
      let j = i + 1;
      while (j < sql.length && !(sql[j] === "'" && sql[j + 1] !== "'")) j += ((escapes && sql[j] === '\\') || sql[j] === "'") ? 2 : 1;
      if (!keepStrings) blank(i + 1, j);
      hidden?.push(sql.slice(i + 1, j).replace(/''/g, "'"));
      i = j + 1;
    } else if (sql[i] === '$' && !/\w/.test(sql[i - 1] ?? '')) {
      const tag = /^\$(?:[A-Za-z_]\w*)?\$/.exec(sql.slice(i, i + 64))?.[0];
      if (!tag) {
        i += 1;
      } else if (tag === doTag) {
        // The end of the DO block's body.
        if (hidden && doFrom >= 0) hidden.push(hidden.slice(doFrom).join('\n'));
        doFrom = -1;
        blank(i, i + tag.length);
        doTag = null;
        i += tag.length;
      } else if (doTag === null && /\bdo(?:\s+language\s+\w+)?\s*$/i.test(out.slice(Math.max(0, i - 64), i).join(''))) {
        // `DO [LANGUAGE x] $tag$`: keep scanning inside, as code.
        doFrom = hidden ? hidden.length : -1;
        blank(i, i + tag.length);
        doTag = tag;
        i += tag.length;
      } else {
        const end = sql.indexOf(tag, i + tag.length);
        const to = end < 0 ? sql.length : end + tag.length;
        hidden?.push(sql.slice(i + tag.length, end < 0 ? sql.length : end));
        blank(i, to);
        i = to;
      }
    } else {
      i += 1;
    }
  }
  return out.join('');
}

/** A table name as the guard compares it: no quotes, no `public.`, lower case. */
const tableName = (raw: string): string => raw.replace(/"/g, '').replace(/^public\./i, '').toLowerCase();

/**
 * The table the code just before a `check (` belongs to — the last `create|alter
 * table` or `create policy … on` in it (undefined when that is a domain).
 */
function ownerTable(before: string): string | undefined {
  const owner = [...before.matchAll(/\b(?:(?:alter|create)\s+table\s+(?:if\s+(?:not\s+)?exists\s+)?(?:only\s+)?([\w."]+)|create\s+policy\s+(?:"[^"]*"|\w+)\s+on\s+([\w."]+)|(?:alter|create)\s+domain\b)/gi)].pop();
  const raw = owner?.[1] ?? owner?.[2];
  return raw ? tableName(raw) : undefined;
}

/**
 * Every `check ( … )` in a migration: the expression (quoted literals kept,
 * comments blanked), the same expression with literals blanked (for finding
 * column names), the code before the keyword (for finding what it belongs
 * to), and the table it belongs to (ownerTable).
 */
function sqlChecks(sql: string): { expr: string; bareExpr: string; before: string; table?: string }[] {
  const code = maskSql(sql);
  const text = maskSql(sql, true);
  const found: { expr: string; bareExpr: string; before: string; table?: string }[] = [];
  for (const m of code.matchAll(/\bcheck\s*\(/gi)) {
    const open = m.index + m[0].length - 1;
    let depth = 0;
    let close = -1;
    for (let k = open; k < code.length && close < 0; k += 1) {
      if (code[k] === '(') depth += 1;
      else if (code[k] === ')' && (depth -= 1) === 0) close = k;
    }
    if (close < 0) continue;
    const before = code.slice(0, m.index);
    found.push({ expr: text.slice(open + 1, close), bareExpr: code.slice(open + 1, close), before, table: ownerTable(before) });
  }
  return found;
}

/** The contents of every quoted literal in a CHECK expression (as kept by maskSql(…, true)). */
const sqlLiterals = (expr: string): string[] => [...expr.matchAll(/'((?:[^']|'')*)'/g)].map((m) => m[1].replace(/''/g, "'"));

const problems: string[] = [];
const guideSlugs = new Set(GUIDES.map((g) => g.slug));

const checkUrl = (where: string, url: string) => {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') problems.push(`${where}: source URL is not https — ${url}`);
  } catch {
    problems.push(`${where}: source URL does not parse — ${url}`);
  }
};

// A cost line's `source` is an official page on that line (it need not state
// the figure — copy never says it does), and each fundsRule source is the page
// a country's student-visa financial rule was read on (lib/cost-planner.ts).
// A site's front page is neither, and linking one is the defect class the
// tracker's validity sources were failed for (independent review CRIT2-4,
// 29 Sep 2026). Refused, as the WHOLE path (a query or fragment alone does not
// make it a page): an empty or "/" path; a language root, bare or as a
// document ("/en/", "/en-gb", "/es-419", "/zh-hant", "/eng/", "/english/",
// "/jp/", and "/en.html" or "/fr.html", the form canada.ca uses); a root
// document, optionally under a language root and with or without a trailing
// slash ("/index.html", "/en/main.do", "/en/home/", "/en/top.html",
// "/english/index.asp"); and an Adobe Experience Manager site root
// ("/content/travel/en.html"). A language is a listed ISO 639 code or a common
// site alias, not any two letters, so a two-letter path that is not a listed
// code ("/pr") is not mistaken for one; a path that IS a listed code ("/id",
// "/it", "/no") is refused — link the exact page instead. A code may carry one
// BCP 47 subtag of the shapes sites use — a two-letter region ("-gb"), a
// three-digit region ("-419") or a listed script ("-hant") — never any
// trailing word, so "/no-fee", "/it-jobs" or "/id-card" is a page, not a
// language root (review G9-SK2V-2, 30 Sep 2026). A section landing page
// deeper in a site ("/en/services.html") is not caught: link the exact page —
// or no source at all. (Validity rules are not checked here: an 'unstated'
// rule deliberately links the body's own site.)
const LANGUAGE_ROOT = String.raw`(?:(?:en|fr|de|es|pt|it|nl|ru|ja|ko|zh|ar|sv|da|no|nb|nn|fi|is|pl|cs|sk|hu|ro|bg|hr|sl|sr|el|tr|he|hi|bn|ta|te|mr|gu|kn|ml|pa|ur|th|vi|id|ms|tl|ka|hy|kk|ky|uz|az|mn|et|lv|lt|ga|cy|mt|mi|fa|ca)(?:[-_](?:[a-z]{2}|\d{3}|hans|hant|latn|cyrl|arab|deva))?|eng|fra|fre|deu|ger|spa|esp|por|ita|rus|jpn|kor|chi|zho|ara|jp|cn|kr|tw|english|french|francais|deutsch|german|espanol|spanish)`;
const ROOT_DOCUMENT = String.raw`(?:index|default|main|home|homepage|top|welcome)`;
const FRONT_PAGE = new RegExp(String.raw`^\/(?:${LANGUAGE_ROOT}(?:\.[a-z]{2,5})?\/?|(?:${LANGUAGE_ROOT}\/)?${ROOT_DOCUMENT}(?:\.[a-z]{2,5})?\/?|content\/[\w-]+\/${LANGUAGE_ROOT}(?:\.[a-z]{2,5})?\/?)?$`, 'i');
const checkPublishingPage = (where: string, url: string) => {
  checkUrl(where, url);
  try {
    if (FRONT_PAGE.test(new URL(url).pathname)) problems.push(`${where}: ${url} is a site's front page — link the exact official page this line or rule is cited for, or no source at all`);
  } catch {
    // Already reported by checkUrl.
  }
};

for (const region of REGION_SLUGS) {
  const def = DESTINATION_BUDGETS[region];
  if (!def) {
    problems.push(`${region}: no DESTINATION_BUDGETS entry`);
    continue;
  }
  if (def.costs.length < 5) problems.push(`${region}: fewer than 5 cost categories`);
  if (def.funding.length < 5) problems.push(`${region}: fewer than 5 funding categories`);
  if (def.fundsRule.sources.length < 1) problems.push(`${region}: fundsRule has no official source`);

  for (const [kind, list] of [
    ['cost', def.costs],
    ['funding', def.funding],
  ] as const) {
    const seen = new Set<string>();
    for (const c of list) {
      const where = `${region}/${kind}/${c.key}`;
      if (!CATEGORY_KEY_RE.test(c.key)) problems.push(`${where}: key breaks the DB CHECK`);
      if (c.key === OTHER_CATEGORY.key) problems.push(`${where}: shadows the reserved 'other' key`);
      if (seen.has(c.key)) problems.push(`${where}: duplicate key`);
      seen.add(c.key);
      if (!c.label.trim() || c.label.length > 80) problems.push(`${where}: label empty or over 80 chars (the DB limit)`);
      // A money-looking token: a currency symbol before digits, or a number with
      // thousands separators / two decimals. (A bare "subclass 500" is a visa class.)
      if (/[$€£₹¥]\s?\d|\b\d{1,3}(,\d{3})+\b|\b\d+\.\d{2}\b/.test(c.hint)) problems.push(`${where}: hint appears to state a figure — the tool asserts no amount (Rule A)`);
      if (c.source) checkPublishingPage(where, c.source.url);
      for (const gl of c.guides ?? []) if (!guideSlugs.has(gl.slug)) problems.push(`${where}: guide slug not found — ${gl.slug}`);
    }
  }
  // Each fundsRule source speaks for one country, named exactly as in the
  // destination's `countries` (lib/regions.ts): fundsCoverage() groups by that
  // name, so a misspelt country would silently drop the source and show the
  // country as "not covered".
  const countries = getRegionBySlug(region)?.countries ?? [];
  for (const s of def.fundsRule.sources) {
    checkPublishingPage(`${region}/fundsRule`, s.url);
    if (!countries.includes(s.country)) problems.push(`${region}/fundsRule: "${s.country}" is not one of the destination's countries in lib/regions.ts (${countries.join(', ')}) — the source would never be shown`);
  }
  for (const gl of def.fundsRule.guides) if (!guideSlugs.has(gl.slug)) problems.push(`${region}/fundsRule: guide slug not found — ${gl.slug}`);

  const r = getRegionBySlug(region);
  if (r && !isKnownCurrency(r.currency.code)) problems.push(`${region}: currency ${r.currency.code} is not in CURRENCIES`);
}

const codes = new Set<string>();
for (const c of CURRENCIES) {
  if (!/^[A-Z]{3}$/.test(c.code)) problems.push(`CURRENCIES: bad code ${c.code}`);
  if (codes.has(c.code)) problems.push(`CURRENCIES: duplicate ${c.code}`);
  codes.add(c.code);
}

// Compare Universities: a shipped default criterion must never carry an
// admission-odds meaning (the site never suggests a "chance"), and the seed
// must fit the per-set cap.
for (const c of DEFAULT_CRITERIA) {
  if (/\b(chance|odds|likelihood|probab|admit rate|acceptance)\b/i.test(c.label)) problems.push(`compare: default criterion "${c.label}" implies admission odds (Rule A / §4.5)`);
  if (c.label.length > 40) problems.push(`compare: default criterion "${c.label}" exceeds the 40-char DB limit`);
}
if (DEFAULT_CRITERIA.length > COMPARE_LIMITS.criteriaPerSet) problems.push('compare: more default criteria than the per-set cap');

// The report PDFs embed these OFL font subsets so every currency symbol the site
// formats (₹ ₩ ₫ ₱ € £ ¥) and every accented name prints; a missing or truncated
// file would silently ship PDFs with blank glyphs.
for (const f of ['inter-400.ttf', 'inter-600.ttf', 'fraunces-700.ttf', 'OFL-Inter.txt', 'OFL-Fraunces.txt']) {
  const path = join('public', 'fonts', 'report', f);
  if (!existsSync(path)) {
    problems.push(`reports: missing ${path}`);
    continue;
  }
  const size = statSync(path).size;
  if (!f.endsWith('.ttf')) continue;
  if (size < 20_000 || size > 150_000) problems.push(`reports: ${path} is ${size} bytes — expected a 20–150 KB subset`);
  // The weight baked into the file (OS/2 usWeightClass) must be the weight the file name promises —
  // a variable-font instance cut at the wrong axis value would print every heading at the wrong boldness.
  const want = Number(/-(\d{3})\.ttf$/.exec(f)?.[1]);
  const got = ttfWeightClass(readFileSync(path));
  if (got !== want) problems.push(`reports: ${path} has OS/2 usWeightClass ${got}, expected ${want}`);
}

// Every report prints the site disclaimer and the non-affiliation notice on
// every page from the constants in lib/site-meta.ts; the Footer renders the
// same wording from its own JSX. They must never drift apart (the footer text
// is owner-protected — CLAUDE.md).
{
  const footer = readFileSync(join('components', 'Footer.tsx'), 'utf8').replace(/\s+/g, ' ');
  const body = SITE_DISCLAIMER.replace(/^Disclaimer:\s*/, '').replace(/\s+/g, ' ');
  if (!footer.includes(body)) problems.push('reports: SITE_DISCLAIMER (lib/site-meta.ts) no longer matches the Footer disclaimer text');
  for (const sentence of NON_AFFILIATION_NOTICE.split(/(?<=\.)\s+/)) {
    if (!footer.includes(sentence.replace(/\s+/g, ' '))) problems.push(`reports: NON_AFFILIATION_NOTICE sentence not found in the Footer — "${sentence.slice(0, 60)}…"`);
  }
}

// Migrations: the value lists the database enforces (destinations, exams) must
// stay in step with the site. Every migration file is read, so a new one is
// covered the moment it exists. 0001_accounts.sql alone is exempt: it is live
// in production and never edited, and 0007 replaces its two inline region
// lists with named constraints.
const MIGRATIONS_DIR = join('supabase', 'migrations');
const MIGRATION_FILES = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql') && f !== '0001_accounts.sql').sort();
const MIGRATION_SQL = new Map(MIGRATION_FILES.map((f) => [f, readFileSync(join(MIGRATIONS_DIR, f), 'utf8')]));
const EXAM_LIST_NAME = 'test_scores_exam_slug_check';
type SqlCheck = ReturnType<typeof sqlChecks>[number];

/**
 * A kept-in-step list must be a NAMED constraint, added after a `drop
 * constraint if exists` of the same name, so a re-run makes a new list live —
 * an inline CHECK inside `create table if not exists` is skipped on a re-run
 * and silently goes stale, and an add without the drop fails with "already
 * exists" (or, wrapped in a DO block that swallows the error, keeps the old
 * list). Reports what is wrong; returns the listed values, or null when the
 * expression is not a plain "col in ('…', …)" list the guard can read.
 */
function namedListValues(file: string, c: SqlCheck, col: string, name: string): string[] | null {
  if (!new RegExp(`\\bdrop\\s+constraint\\s+if\\s+exists\\s+${name}\\b`, 'i').test(c.before)) problems.push(`${file}: ${name} is added without a "drop constraint if exists ${name}" before it — a re-run would fail with "already exists" or keep the old list`);
  const list = /^\s*(\w+)\s+in\s*\(([\s\S]*)\)\s*$/i.exec(c.expr);
  const items = list?.[2].split(',') ?? [];
  if (!list || list[1] !== col || !items.every((x) => /^\s*'[a-z0-9-]+'\s*$/.test(x))) {
    problems.push(`${file}: ${name} must be a plain "${col} in ('…', …)" list for this guard to read it`);
    return null;
  }
  return items.map((x) => x.trim().slice(1, -1));
}

function compareList(file: string, name: string, listed: readonly string[], expected: readonly string[]): void {
  for (const v of expected) if (!listed.includes(v)) problems.push(`${file}: ${name} is missing '${v}'`);
  for (const v of listed) if (!expected.includes(v)) problems.push(`${file}: ${name} lists unknown '${v}'`);
}

/**
 * Every text a migration hides from a scan of its code — each quoted literal,
 * dollar-quoted function body and joined DO-body literal — unpacked
 * recursively, so the DDL inside a function body that runs `execute $ddl$ …
 * $ddl$` is read too (nested bodies used to be blanked even with strings kept;
 * review MG-R2-3, 29 Sep 2026). Comments stay masked at every level.
 */
const unpackHidden = (h: string, depth = 0): string[] => {
  const sub: string[] = [];
  const t = maskSql(h, true, sub);
  return depth >= 4 ? [t] : [t, ...sub.flatMap((x) => unpackHidden(x, depth + 1))];
};

/**
 * A kept list must still be in place after the LAST migration: the last
 * statement, in migration order, that adds or drops it on its table (or drops
 * the table) must be an add. A later bare `drop constraint` leaves the column
 * with no list at all, and every check above would still pass on the earlier
 * add (review MG-R2-3).
 */
function finalState(name: string, table: string): void {
  let last: { file: string; op: string } | null = null;
  for (const file of MIGRATION_FILES) {
    for (const stmt of maskSql(MIGRATION_SQL.get(file)!).split(';')) {
      const owner = [...stmt.matchAll(/\b(alter|drop)\s+table\s+(?:if\s+exists\s+)?(?:only\s+)?([\w."]+)/gi)].pop();
      if (!owner || tableName(owner[2]) !== table) continue;
      if (owner[1].toLowerCase() === 'drop') last = { file, op: 'drop table' };
      for (const m of stmt.matchAll(new RegExp(`\\b(add|drop)\\s+constraint\\s+(?:if\\s+exists\\s+)?${name}\\b`, 'gi'))) last = { file, op: m[1].toLowerCase() };
    }
  }
  if (last && last.op !== 'add') problems.push(`${last.file}: ${last.op === 'drop' ? `drops ${name}` : `drops the table ${table}`} and no later migration adds ${name} back — the column is left with no list at all`);
}

// Every destination list must list exactly the site's destinations (a 10th
// destination added to lib/regions.ts would otherwise be refused by the DB), as
// a named, re-applied plain list on the right table (namedListValues above). A
// CHECK is a destination list when its column is named *region or
// *destination, or when EVERY value it quotes is a destination (or 'global') —
// a country list that also names 'uk' or 'germany' is not one (review MG-R2-4).
// A CHECK on a destination column that does not restrict the destinations (a
// cross-field rule) goes in NOT_A_LIST with its reason. DDL inside a DO block
// is read as code; a destination list in a domain or an enum (neither is
// replaced by a re-run), or inside dynamic SQL or a function body (read here
// as text, nested literals included), is refused outright — and so is any
// other statement or hidden text that names two or more destinations together
// (a trigger or function, an array literal, a lookup insert, a mapping): none
// of them is a list this guard can keep in step with lib/regions.ts.
{
  const DESTINATIONS = new Set<string>([...REGION_SLUGS, 'global']);
  // Each kept list, the table it belongs to and the values it must hold. A
  // saved page carries its content's region, and worldwide exams are 'global'
  // (lib/saved-items.ts: RegionSlug | 'global' | null); every other list is
  // the nine destinations exactly.
  const EXPECTED: Record<string, { table: string; values: readonly string[] }> = {
    planner_applications_region_check: { table: 'planner_applications', values: REGION_SLUGS },
    budget_plans_region_check: { table: 'budget_plans', values: REGION_SLUGS },
    compare_sets_region_check: { table: 'compare_sets', values: REGION_SLUGS },
    profiles_preferred_region_check: { table: 'profiles', values: REGION_SLUGS },
    saved_items_region_check: { table: 'saved_items', values: [...REGION_SLUGS, 'global'] },
  };
  // A named plain list: "col in ('…', …)" and nothing else.
  const PLAIN_LIST = /^\s*\w+\s+in\s*\(\s*'[a-z0-9-]+'(?:\s*,\s*'[a-z0-9-]+')*\s*\)\s*$/;
  // The escape hatch for a CHECK that mentions a destination column without
  // restricting which destinations are allowed — e.g. "region <> 'india' or
  // currency_code in ('INR', 'USD')". Every entry is reviewed, names the table
  // it sits on and carries its reason, and the names are printed on every run
  // so none is forgotten. It never passes a plain list, a kept list, or the
  // same name on another table: only that constraint on that table is
  // skipped. Empty: no migration has such a rule today.
  const NOT_A_LIST: Record<string, { table: string; reason: string }> = {};
  const reviewedRule = (name: string, table: string | undefined, expr: string): boolean =>
    Object.hasOwn(NOT_A_LIST, name) && NOT_A_LIST[name].table === table && !PLAIN_LIST.test(expr);
  const DESTINATION = new RegExp(`'(?:${REGION_SLUGS.join('|')})'`);
  const DESTINATION_WORD = new RegExp(`(?<![\\w-])(?:${REGION_SLUGS.join('|')})(?![\\w-])`, 'gi');
  const ONE_DESTINATION_WORD = new RegExp(DESTINATION_WORD.source, 'i');
  const KEPT_DROP = new RegExp(`\\bdrop\\s+constraint\\s+(?:if\\s+exists\\s+)?(?:${[...Object.keys(EXPECTED), EXAM_LIST_NAME].join('|')})\\b`, 'i');
  for (const name of Object.keys(NOT_A_LIST)) if (Object.hasOwn(EXPECTED, name)) problems.push(`NOT_A_LIST: ${name} is a kept destination list — it can never be reviewed as "not a list"`);
  const seen = new Set<string>();
  for (const file of MIGRATION_FILES) {
    const sql = MIGRATION_SQL.get(file)!;
    const hidden: string[] = [];
    const code = maskSql(sql, false, hidden);
    const text = maskSql(sql, true);
    const unpacked = hidden.flatMap((h) => unpackHidden(h));
    // DDL in hidden text that adds a CHECK (to a table or a domain, or through
    // "add constraint … check (" when format() splits "alter table" across
    // its arguments), or an enum or enum value — and that names a region
    // column or a destination, quoted or bare (a literal handed to format()'s
    // %L is bare once its quotes are unpacked). A message that merely
    // mentions "check (region …)" is not DDL and passes. One message per
    // file: the joined DO-body entry repeats a hit already found in a single
    // literal.
    const HIDDEN_DDL = /\b(?:alter\s+(?:table|domain)\b[\s\S]*?\badd\b|create\s+(?:table|domain)\b|add\s+constraint\b)[\s\S]*?\bcheck\s*\(|\bcreate\s+type\b[\s\S]*?\bas\s+enum\s*\(|\balter\s+type\b[\s\S]*?\badd\s+value\b/i;
    if (unpacked.some((t) => HIDDEN_DDL.test(t) && (/\w*region\b/i.test(t) || ONE_DESTINATION_WORD.test(t)))) {
      problems.push(`${file}: DDL with a destination CHECK or enum sits inside a string, DO body or function body (dynamic SQL) — this guard cannot read it there; write it as a plain top-level "alter table … drop constraint if exists …; alter table … add constraint …" pair`);
    }
    if (unpacked.some((t) => KEPT_DROP.test(t))) {
      problems.push(`${file}: a kept destination or exam list is dropped inside a string, DO body or function body (dynamic SQL) — this guard cannot tell whether it is put back; write it as a plain top-level "alter table … drop constraint if exists …; alter table … add constraint …" pair`);
    }
    for (const m of code.matchAll(/\balter\s+type\s+[\w."]+\s+add\s+value\b[^;]*/gi)) {
      if (DESTINATION.test(text.slice(m.index, m.index + m[0].length))) problems.push(`${file}: "alter type … add value" adds a destination to an enum — destinations belong in a text column with a named, re-applied CHECK`);
    }
    for (const m of code.matchAll(/\bcreate\s+type\s+[\w."]+\s+as\s+enum\s*\(/gi)) {
      const close = code.indexOf(')', m.index + m[0].length);
      if (DESTINATION.test(text.slice(m.index, close < 0 ? undefined : close))) problems.push(`${file}: an enum lists destinations — a re-run cannot replace an enum's values; use a text column with a named, re-applied CHECK`);
    }
    for (const c of sqlChecks(sql)) {
      const literals = sqlLiterals(c.expr);
      const allDestinations = literals.length > 0 && literals.every((l) => DESTINATIONS.has(l)) && literals.some((l) => l !== 'global');
      const col = /\b(\w*(?:region|destination))\b/i.exec(c.bareExpr)?.[1] ?? (allDestinations ? (/^\s*(\w+)/.exec(c.bareExpr)?.[1] ?? 'value') : undefined);
      if (!col) continue;
      if (/\b(?:create|alter)\s+domain\b[^;]*$/i.test(c.before)) {
        problems.push(`${file}: a destination list in a domain CHECK — a column typed with the domain hides the list from this guard, and a re-run of "create domain" does not replace it; put the list on the table as a named, re-applied constraint`);
        continue;
      }
      const name = /\badd\s+constraint\s+(\w+)\s+$/i.exec(c.before)?.[1];
      if (!name) {
        problems.push(`${file}: a region CHECK on "${col}" is inline — make it a named constraint, dropped and re-added after the table ("alter table … drop constraint if exists <t>_${col}_check; alter table … add constraint <t>_${col}_check check (${col} in (…))"), so a re-run updates the list`);
        continue;
      }
      if (reviewedRule(name, c.table, c.expr)) continue;
      if (Object.hasOwn(NOT_A_LIST, name) && PLAIN_LIST.test(c.expr)) problems.push(`${file}: ${name} is recorded in NOT_A_LIST, but it is a plain "${col} in (…)" list — a list is checked like any other; remove it from NOT_A_LIST`);
      const kept = Object.hasOwn(EXPECTED, name) ? EXPECTED[name] : undefined;
      if (kept && c.table !== kept.table) {
        problems.push(`${file}: ${name} is added to ${c.table ?? 'something that is not a table'} — it belongs on ${kept.table}, where it would not be enforced`);
        continue;
      }
      seen.add(name);
      if (!kept && !PLAIN_LIST.test(c.expr)) {
        problems.push(`${file}: ${name} must be a plain "${col} in ('…', …)" list for this guard to read it — or, if it is a cross-field rule that does not restrict which destinations are allowed, record it in NOT_A_LIST (scripts/check-tools.ts) with the reason`);
        continue;
      }
      const listed = namedListValues(file, c, col, name);
      if (listed) compareList(file, name, listed, kept?.values ?? REGION_SLUGS);
    }
    // Two or more destinations named together anywhere else in the file — a
    // trigger or function body, an array literal ('{india,usa}'), a lookup-table
    // insert, a CASE mapping — once the named plain lists (read above) and the
    // reviewed NOT_A_LIST rules are blanked. One destination alone (a column
    // default, a backfill) is not a list. Split on the statement ends of the
    // code, so two single-destination statements in a row are not joined.
    {
      const out = sql.split('');
      for (const m of code.matchAll(/\badd\s+constraint\s+(\w+)\s+check\s*\(/gi)) {
        let depth = 0;
        let k = m.index + m[0].length - 1;
        for (; k < code.length; k += 1) {
          if (code[k] === '(') depth += 1;
          else if (code[k] === ')' && (depth -= 1) === 0) break;
        }
        const expr = text.slice(m.index + m[0].length, k);
        if (PLAIN_LIST.test(expr) || reviewedRule(m[1], ownerTable(code.slice(0, m.index)), expr)) for (let x = m.index; x <= k; x += 1) if (out[x] !== '\n') out[x] = ' ';
      }
      const scrubbed = out.join('');
      const sub: string[] = [];
      const visible = maskSql(scrubbed, true, sub);
      const statements: string[] = [];
      let from = 0;
      for (const m of maskSql(scrubbed).matchAll(/;/g)) {
        statements.push(visible.slice(from, m.index));
        from = m.index + 1;
      }
      statements.push(visible.slice(from));
      const namedTogether = (t: string) => new Set((t.match(DESTINATION_WORD) ?? []).map((w) => w.toLowerCase())).size >= 2;
      if ([...statements, ...sub.flatMap((h) => unpackHidden(h))].some(namedTogether)) {
        problems.push(`${file}: two or more destinations are named together outside a named, re-applied destination CHECK (a trigger or function, an array literal, a lookup insert or a mapping) — this guard cannot keep such a list in step with lib/regions.ts; put the list in a text column's named "col in (…)" constraint`);
      }
    }
  }
  for (const [name, { table }] of Object.entries(EXPECTED)) {
    if (!seen.has(name)) problems.push(`migrations: no named ${name} found on ${table} — the table's destination list would not update on a re-run`);
    else finalState(name, table);
  }
  for (const [name, { table, reason }] of Object.entries(NOT_A_LIST)) console.log(`check-tools: ${name} on ${table} reviewed as not a destination list — ${reason}`);
}

// Test Score Tracker: every catalogue exam must carry an official validity rule
// (kind + source + verified date); a dated (`months` / `recommended-months`)
// rule needs a positive count and no other kind may carry one; only a `months`
// rule may name the body's term ("reportable"); notes stay short (they print
// under every score); and the 0006 `exam_slug` CHECK must list exactly the
// catalogue's exams — a new exam record without both would let the tool offer
// a test the database refuses.
{
  const examSlugs = new Set(ENTRANCE_EXAMS.map((e) => e.slug));
  for (const e of ENTRANCE_EXAMS) {
    const v = EXAM_VALIDITY[e.slug];
    const where = `scores/${e.slug}`;
    if (!v) {
      problems.push(`${where}: no EXAM_VALIDITY entry`);
      continue;
    }
    if (DATED_KINDS.has(v.kind) && !(typeof v.months === 'number' && v.months > 0)) problems.push(`${where}: a '${v.kind}' rule needs a positive month count`);
    if (!DATED_KINDS.has(v.kind) && v.months !== undefined) problems.push(`${where}: only a dated rule may carry a month count`);
    if (v.term !== undefined && v.kind !== 'months') problems.push(`${where}: only a 'months' rule may name the body's term`);
    // A rule written for one year's edition must say so: otherwise an attempt
    // from another year is shown that year's rule as if it were its own.
    if ((v.kind === 'period' || v.kind === 'cycle') && /\b20\d\d\b/.test(v.note) && v.edition === undefined) problems.push(`${where}: the note names a year but the rule has no \`edition\``);
    if (v.edition !== undefined && v.kind !== 'period' && v.kind !== 'cycle') problems.push(`${where}: only a 'period' or 'cycle' rule may carry an \`edition\``);
    if (v.edition !== undefined && !new RegExp(`\\b${v.edition}\\b`).test(v.note)) problems.push(`${where}: \`edition\` is ${v.edition} but the note never names that year`);
    // `satYear`: the calendar year an edition is sat in, when it differs from
    // the year in its name (CLAT 2027 is sat in December 2026). Attempts are
    // matched on it, so it must sit beside `edition`, differ from it by one
    // year, and be named in the note (the reader sees why a 2026 test date
    // reads as the 2027 edition).
    if (v.satYear !== undefined) {
      if (v.edition === undefined) problems.push(`${where}: \`satYear\` needs an \`edition\` beside it`);
      else if (!Number.isInteger(v.satYear) || Math.abs(v.satYear - v.edition) !== 1) problems.push(`${where}: \`satYear\` is ${v.satYear} — it must be the year before or after the edition (${v.edition}); omit it when the edition is sat in its own year`);
      if (!new RegExp(`\\b${v.satYear}\\b`).test(v.note)) problems.push(`${where}: \`satYear\` is ${v.satYear} but the note never names that year`);
      if (v.alsoCovers?.includes(v.satYear)) problems.push(`${where}: \`alsoCovers\` repeats the edition's own sitting year (${v.satYear})`);
    }
    // `alsoCovers`: other editions the note ITSELF speaks for (NATA 2026's note
    // says when an unused NATA 2025 score still counts). An attempt from a listed
    // year is shown the rule plainly, as its own — so each year must really be
    // spoken for in the note, and the list only means something beside `edition`.
    if (v.alsoCovers !== undefined) {
      if (v.edition === undefined) problems.push(`${where}: \`alsoCovers\` needs an \`edition\` beside it`);
      if (!v.alsoCovers.length) problems.push(`${where}: an empty \`alsoCovers\` — omit it`);
      for (const y of v.alsoCovers) {
        if (!Number.isInteger(y) || y < 1990 || y > 2100) problems.push(`${where}: \`alsoCovers\` holds ${y}, not a year`);
        else if (y === v.edition) problems.push(`${where}: \`alsoCovers\` repeats the rule's own edition (${y})`);
        else if (!new RegExp(`\\b${y}\\b`).test(v.note)) problems.push(`${where}: \`alsoCovers\` lists ${y} but the note never names that year — an attempt from ${y} would be shown a rule that does not speak for it`);
      }
      if (new Set(v.alsoCovers).size !== v.alsoCovers.length) problems.push(`${where}: \`alsoCovers\` lists a year twice`);
    }
    if (v.label !== undefined && !v.label.trim()) problems.push(`${where}: an empty rule label`);
    if (!v.note.trim()) problems.push(`${where}: every rule needs a note (for 'unstated', what we checked)`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v.lastVerified)) problems.push(`${where}: lastVerified is not YYYY-MM-DD`);
    if (!v.body.trim() || !v.source.label.trim()) problems.push(`${where}: body or source label empty`);
    // The body is printed mid-sentence ("…published by {body} for this result"),
    // where a place-name comma is never closed: "National Law University, Delhi
    // for this result". Qualify with brackets instead — "State CET Cell
    // (Maharashtra)" (independent review C10, 29 Sep 2026).
    if (v.body.includes(',')) problems.push(`${where}: the body label "${v.body}" contains a comma — it reads broken mid-sentence; qualify it in brackets, e.g. "State CET Cell (Maharashtra)"`);
    if (v.note.split(/\s+/).length > 32) problems.push(`${where}: note is over 32 words`);
    checkUrl(where, v.source.url);
    if (v.also) {
      if (!v.also.label.trim()) problems.push(`${where}: second source label empty`);
      if (v.kind === 'unstated') problems.push(`${where}: an 'unstated' rule cannot cite a second source`);
      checkUrl(where, v.also.url);
    }
  }
  for (const slug of Object.keys(EXAM_VALIDITY)) if (!examSlugs.has(slug)) problems.push(`scores: EXAM_VALIDITY names an unknown exam — ${slug}`);
  // The list lives in the NAMED test_scores_exam_slug_check on test_scores,
  // dropped and re-added after the table (namedListValues); an inline CHECK
  // inside `create table if not exists` would be skipped on a re-run and the
  // live list would silently go stale. Read through the same masking as the
  // destination lists, so a commented-out constraint, or one inside a string,
  // does not count. On test_scores, ANY CHECK on exam_slug is this list (a
  // cast, a regex or a function call is still a list the guard must be able to
  // read). On another table, mirroring the destination rule above, a CHECK is
  // an exam list when it quotes two or more values and EVERY one is a
  // catalogue exam (an array literal '{sat,gre}' counts as its elements; a
  // single quoted word such as "code <> 'act'" is not a list), or when it
  // constrains an exam column (exam, exams, exam_slug, target_exam, exam_id,
  // …) and a value it quotes names a catalogue exam — which also catches a
  // regex list such as '^(sat|gre)$' or a list holding a slug the catalogue
  // lacks. A slug-format rule like 0003's college_slug check is not an exam
  // list (review MG-R2-4), and neither is an ordinary list that merely holds
  // an exam's word: weekdays ('sat'), pets ('cat') or airport words ('gate')
  // (review G9-SK-1, 29 Sep 2026). Slugs are lower case, so the match is
  // case-sensitive. An exam list found there must be a named, re-applied
  // plain list of the whole catalogue under its own name.
  const expected = [...examSlugs];
  const EXAM_WORD = new RegExp(`(?<![a-z0-9-])(?:${expected.join('|')})(?![a-z0-9-])`);
  const EXAM_COLUMN = /\b(\w*exams?(?:_(?:slug|id|code|key)s?)?)\b/i;
  const examValues = (l: string): string[] => (/^\{.*\}$/s.test(l) ? l.slice(1, -1).split(',').map((x) => x.trim().replace(/^"|"$/g, '')) : [l]);
  const isExamList = (c: SqlCheck): boolean => {
    const lits = sqlLiterals(c.expr);
    const values = lits.flatMap(examValues);
    const allExams = new Set(values).size >= 2 && values.every((v) => examSlugs.has(v));
    return allExams || (EXAM_COLUMN.test(c.bareExpr) && lits.some((l) => EXAM_WORD.test(l)));
  };
  let found = false;
  for (const file of MIGRATION_FILES) {
    for (const c of sqlChecks(MIGRATION_SQL.get(file)!)) {
      const onScores = c.table === 'test_scores';
      if (onScores ? !/\bexam_slug\b/i.test(c.bareExpr) : !isExamList(c)) continue;
      if (/\b(?:create|alter)\s+domain\b[^;]*$/i.test(c.before)) {
        problems.push(`${file}: an exam list in a domain CHECK — a column typed with the domain hides the list from this guard, and a re-run of "create domain" does not replace it; put the list on the table as a named, re-applied constraint`);
        continue;
      }
      const name = /\badd\s+constraint\s+(\w+)\s+$/i.exec(c.before)?.[1];
      if (onScores) {
        if (name !== EXAM_LIST_NAME) {
          problems.push(`${file}: an exam_slug list is ${name ? `named ${name}` : 'inline'} — it must be the named ${EXAM_LIST_NAME}, dropped and re-added after the table, so a re-run updates the list`);
          continue;
        }
        found = true;
        const listed = namedListValues(file, c, 'exam_slug', EXAM_LIST_NAME);
        if (listed) compareList(file, EXAM_LIST_NAME, listed, expected);
        continue;
      }
      if (!name || name === EXAM_LIST_NAME) {
        problems.push(`${file}: an exam list on ${c.table ?? 'something that is not a table'} is ${name ? `named ${EXAM_LIST_NAME}, the Test Score Tracker's list, which belongs on test_scores` : 'inline'} — give it its own name, dropped and re-added after the table, so a re-run updates the list`);
        continue;
      }
      const listed = namedListValues(file, c, EXAM_COLUMN.exec(c.bareExpr)?.[1] ?? /^\s*(\w+)/.exec(c.bareExpr)?.[1] ?? 'exam_slug', name);
      if (listed) compareList(file, name, listed, expected);
    }
  }
  if (!found) problems.push(`migrations: no named ${EXAM_LIST_NAME} found on test_scores — the Test Score Tracker's exam list would not be enforced, or would not update on a re-run`);
  else finalState(EXAM_LIST_NAME, 'test_scores');
}

// Bundle guard: a module that can reach the browser must never value-import a
// content catalogue or a server-only projection — the whole catalogue would ship
// in the chunk (the 15.7 MB layout chunk fixed on 9 July 2026 shipped this way:
// a client breadcrumb importing lib/cmi, which imports every guide). Reach is
// computed, not listed: every file under app/, components/, lib/ and hooks/
// whose directive prologue says 'use client' is a root, and every repo module
// it imports is followed transitively (static imports, re-exports, import()
// and require() alike — a lazy chunk still downloads). A hand-kept list missed
// lib/reports/*, lib/csv.ts, lib/college-labels.ts, lib/tools.ts and the two
// Add-to buttons (independent review, 29 Sep 2026); a new client file is
// covered the moment it exists.
// Files are read with the TypeScript parser, not a pattern: an import on the
// directive's own line, an import() with a comment inside its brackets, a
// require() and a directive below a long header comment are all seen as the
// compiler sees them, and a comment or string that merely mentions an import
// is not one (follow-up to that review, 29 Sep 2026). An import() or require()
// whose path is computed at run time could pull in any module, so it fails too.
// Value imports only: `import type { … }` — and `import { type A, type B }`,
// every name type-only — is erased by the compiler and ships nothing. Server
// components are never followed on their own — only what a client module
// imports.
{
  const SRC_DIRS = ['app', 'components', 'lib', 'hooks'];
  const FORBIDDEN = /^lib\/(colleges|admission-guides|guides|cmi|topics|tracks|[a-z-]+-catalogue)\.tsx?$/;
  const CODE = /\.(tsx?|jsx?|mjs)$/;
  const walk = (dir: string): string[] =>
    !existsSync(dir)
      ? []
      : readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
          const p = join(dir, d.name);
          if (d.isDirectory()) return d.name === 'node_modules' || d.name.startsWith('.') ? [] : walk(p);
          return CODE.test(d.name) ? [p] : [];
        });
  const root = process.cwd();
  const parse = (file: string, text: string) =>
    ts.createSourceFile(file, text, ts.ScriptTarget.Latest, false, file.endsWith('.tsx') ? ts.ScriptKind.TSX : file.endsWith('.ts') ? ts.ScriptKind.TS : file.endsWith('.jsx') ? ts.ScriptKind.JSX : ts.ScriptKind.JS);
  /** True when 'use client' is one of the string-literal statements that open the file (its directive prologue). */
  const isClientRoot = (file: string): boolean => {
    const text = readFileSync(file, 'utf8');
    if (!text.includes('use client')) return false;
    for (const st of parse(file, text).statements) {
      if (!ts.isExpressionStatement(st) || !ts.isStringLiteral(st.expression)) return false;
      if (st.expression.text === 'use client') return true;
    }
    return false;
  };
  /** `import type …`; or named imports / re-exports that are ALL `type` (the compiler drops the whole statement). */
  const typeOnlyClause = (c: ts.ImportClause): boolean =>
    c.phaseModifier === ts.SyntaxKind.TypeKeyword ||
    Reflect.get(c, 'isTypeOnly') === true ||
    (!c.name && !!c.namedBindings && ts.isNamedImports(c.namedBindings) && c.namedBindings.elements.length > 0 && c.namedBindings.elements.every((e) => e.isTypeOnly));
  const typeOnlyExport = (d: ts.ExportDeclaration): boolean =>
    d.isTypeOnly || (!!d.exportClause && ts.isNamedExports(d.exportClause) && d.exportClause.elements.length > 0 && d.exportClause.elements.every((e) => e.isTypeOnly));
  /** A repo module for `@/…` or a relative specifier; null for a package (never followed). */
  const resolveImport = (from: string, spec: string): string | null => {
    const base = spec.startsWith('@/') ? join(root, spec.slice(2)) : spec.startsWith('.') ? resolve(root, dirname(from), spec) : null;
    if (!base) return null;
    for (const ext of ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '/index.ts', '/index.tsx']) {
      const p = base + ext;
      if (existsSync(p) && statSync(p).isFile()) return relative(root, p);
    }
    return null;
  };
  const importsOf = new Map<string, string[]>();
  const importsFor = (file: string): string[] => {
    let list = importsOf.get(file);
    if (list) return list;
    const specs: string[] = [];
    const sf = parse(file, readFileSync(file, 'utf8'));
    const visit = (node: ts.Node): void => {
      if (ts.isImportDeclaration(node)) {
        if (!(node.importClause && typeOnlyClause(node.importClause)) && ts.isStringLiteral(node.moduleSpecifier)) specs.push(node.moduleSpecifier.text);
        return;
      }
      if (ts.isExportDeclaration(node)) {
        if (node.moduleSpecifier && !typeOnlyExport(node) && ts.isStringLiteral(node.moduleSpecifier)) specs.push(node.moduleSpecifier.text);
        return;
      }
      if (ts.isImportEqualsDeclaration(node)) {
        const ref = node.moduleReference;
        if (!node.isTypeOnly && ts.isExternalModuleReference(ref) && ts.isStringLiteral(ref.expression)) specs.push(ref.expression.text);
        return;
      }
      if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) {
        const arg = node.arguments[0];
        if (arg && ts.isStringLiteralLike(arg)) specs.push(arg.text);
        else {
          const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
          problems.push(`bundle: ${file}:${line + 1} calls ${node.expression.getText(sf)}() with a computed path — client-reachable code must name the module it loads, or the bundler may pull in every file the pattern could match`);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
    list = specs.map((s) => resolveImport(file, s)).filter((r): r is string => r !== null);
    importsOf.set(file, list);
    return list;
  };
  const roots = SRC_DIRS.flatMap(walk).filter(isClientRoot);
  // Breadth-first from every client root; `via` remembers who first reached a
  // module, so a failure prints the whole chain.
  const via = new Map<string, string | null>(roots.map((f) => [f, null]));
  const queue = [...roots];
  while (queue.length) {
    const file = queue.shift()!;
    for (const dep of importsFor(file)) {
      if (via.has(dep)) continue;
      via.set(dep, file);
      if (FORBIDDEN.test(dep)) {
        const chain = [dep];
        for (let p: string | null | undefined = file; p; p = via.get(p)) chain.unshift(p);
        problems.push(`bundle: ${chain.join(' → ')} — client-reachable code must receive a projection, never the catalogue`);
      } else if (CODE.test(dep)) {
        queue.push(dep);
      }
    }
  }
  // A guard that silently scans nothing would pass forever.
  if (roots.length < 10 || !via.has('lib/tools.ts') || !via.has('lib/reports/model.ts')) {
    problems.push(`bundle: the client-reach scan found only ${roots.length} 'use client' roots / missed lib/tools.ts or lib/reports/model.ts — the guard itself is broken`);
  }
}

// Snippets: search engines show ~155–160 characters of a meta description, and
// pageMetadata() cuts anything longer at a word boundary. A registry-built
// description must therefore stay whole — the fourth tool once pushed the
// /tools one over and it read "…tuned to your study…" (independent review,
// 29 Sep 2026). Each tool page's meta is read from its own source, so the
// check follows the page if its suffix changes.
{
  const idx = toolsIndexDescription();
  if (idx.length > TOOLS_INDEX_DESCRIPTION_MAX) problems.push(`snippets: the /tools meta description is ${idx.length} characters — over ${TOOLS_INDEX_DESCRIPTION_MAX}, so it would be cut; shorten its wording in lib/tools.ts`);
  for (const t of TOOLS) {
    const page = join('app', 'tools', t.slug, 'page.tsx');
    if (!existsSync(page)) continue;
    const src = readFileSync(page, 'utf8');
    const suffix = /description:\s*tool\.tagline\s*\+\s*'([^']*)'/.exec(src);
    if (!suffix) continue;
    const max = Number(/descriptionMax:\s*(\d+)/.exec(src)?.[1] ?? 155);
    const meta = t.tagline + suffix[1];
    if (meta.length > max) problems.push(`snippets: ${t.slug} meta description (tagline + "${suffix[1].trim()}") is ${meta.length} characters — over ${max}, so it would be cut; shorten the tagline in lib/tools.ts`);
  }
}

for (const t of TOOLS) {
  if (!existsSync(join('app', 'tools', t.slug, 'page.tsx'))) problems.push(`tools: ${t.slug} is registered but app/tools/${t.slug}/page.tsx is missing`);
}

if (problems.length) {
  console.error(`check-tools: ${problems.length} problem(s)\n` + problems.map((p) => `  - ${p}`).join('\n'));
  process.exit(1);
}
const guideLinks = Object.values(DESTINATION_BUDGETS).reduce(
  (n, d) => n + [...d.costs, ...d.funding].reduce((m, c) => m + (c.guides?.length ?? 0), 0) + d.fundsRule.guides.length,
  0,
);
console.log(`check-tools: ${TOOLS.length} tools, ${REGION_SLUGS.length} destinations, ${guideLinks} guide links, ${CURRENCIES.length} currencies, ${Object.keys(EXAM_VALIDITY).length} validity rules — OK`);

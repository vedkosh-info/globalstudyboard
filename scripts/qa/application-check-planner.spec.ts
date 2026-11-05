/** Synthetic tests of the client handoff. These do not establish live database/RLS behavior. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';
import * as domain from '../../lib/application-check';
import type { CheckProgramme, CheckRule } from '../../lib/application-check';

interface Row { id: string; [key: string]: unknown }
interface Result { data: Row[]; status: number; error: { message: string; code?: string } | null }
const programme: CheckProgramme = {
  id: 'synthetic-programme', collegeSlug: 'synthetic-university', university: 'Synthetic University',
  name: 'Example MSc', region: 'canada', officialUrl: 'https://example.edu/msc',
  scope: 'Synthetic programme', intake: 'September 2027', reviewed: new Date().toISOString().slice(0, 10),
  rules: ['statement', 'references'].map((id) => ({ id, kind: 'prepare', title: id, detail: id,
    action: `Prepare ${id}`, sourceUrl: 'https://example.edu/msc' })),
};
const code = ts.transpileModule(readFileSync('lib/application-check-planner.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

type Save = (programme: CheckProgramme, rules: CheckRule[], expectedUserId?: string) => Promise<void>;
function harness() {
  const tables: Record<string, Row[]> = { planner_applications: [], planner_tasks: [] };
  let sessionUser = 'user-one';
  let loseNextTaskResponse = false;
  let taskCap = 1000;
  let writes = 0;
  class Query implements PromiseLike<Result> {
    private filters: ((row: Row) => boolean)[] = [];
    private inserted: Row[] | undefined;
    private signal: AbortSignal | undefined;
    constructor(private table: string) {}
    select() { return this; }
    eq(field: string, value: unknown) { this.filters.push((row) => row[field] === value); return this; }
    in(field: string, values: unknown[]) { this.filters.push((row) => values.includes(row[field])); return this; }
    abortSignal(signal: AbortSignal) { this.signal = signal; return this; }
    upsert(rows: Row[] | Row) { this.inserted = Array.isArray(rows) ? rows : [rows]; return this; }
    async execute(): Promise<Result> {
      if (this.signal?.aborted) return { data: [], status: 0, error: { message: 'aborted' } };
      if (!this.inserted) return { data: tables[this.table].filter((row) => this.filters.every((filter) => filter(row))), status: 200, error: null };
      writes += 1;
      for (const row of this.inserted) {
        if (row.user_id !== sessionUser) return { data: [], status: 403, error: { message: 'ownership' } };
        // The real BEFORE INSERT guard counts before ON CONFLICT.
        if (this.table === 'planner_tasks' && tables[this.table].length >= taskCap) return { data: [], status: 400, error: { message: 'planner_tasks_cap' } };
        if (!tables[this.table].some((old) => old.id === row.id)) {
          tables[this.table].push({ status: 'researching', intake: null, done: false, ...row });
        }
      }
      if (this.table === 'planner_tasks' && loseNextTaskResponse) {
        loseNextTaskResponse = false;
        return { data: [], status: 0, error: { message: 'response lost' } };
      }
      return { data: [], status: 201, error: null };
    }
    then<T = Result, E = never>(fulfilled?: ((value: Result) => T | PromiseLike<T>) | null, rejected?: ((reason: unknown) => E | PromiseLike<E>) | null): PromiseLike<T | E> {
      return this.execute().then(fulfilled, rejected);
    }
  }
  const exports: { saveCheckActions?: Save } = {};
  runInNewContext(code, {
    exports, crypto: webcrypto, TextEncoder,
    require: (name: string) => {
      if (name === './application-check') return domain;
      if (name === './tools-shared') return {
        checkToolSession: async () => ({ kind: 'ok', user: { id: sessionUser }, supabase: { from: (table: string) => new Query(table) } }),
        isSetupError: () => false,
        isUnansweredWrite: (status: number) => status === 0,
        sessionMessage: (_session: unknown, fallback: string) => fallback,
        TIMED_OUT: Symbol('timeout'),
        withDeadline: (run: (signal: AbortSignal, expired: () => boolean) => Promise<void>) => run(new AbortController().signal, () => false),
      };
      throw new Error('Unexpected dependency ' + name);
    },
  });
  assert.ok(exports.saveCheckActions);
  return { tables, save: exports.saveCheckActions, writes: () => writes,
    loseResponse: () => { loseNextTaskResponse = true; }, cap: (value: number) => { taskCap = value; },
    account: (id: string) => { sessionUser = id; } };
}

test('changed account and stale catalogue are rejected before writes', async () => {
  const h = harness();
  h.account('user-two');
  await assert.rejects(h.save(programme, programme.rules, 'user-one'), /account changed/);
  await assert.rejects(h.save({ ...programme, reviewed: '2000-01-01' }, programme.rules), /fresh review/);
  assert.equal(h.writes(), 0);
});

test('a lost committed response is retry-safe even after the planner reaches its cap', async () => {
  const h = harness();
  h.loseResponse();
  await assert.rejects(h.save(programme, programme.rules), /confirm the save/);
  h.cap(2);
  await h.save(programme, programme.rules);
  assert.equal(h.tables.planner_applications.length, 1);
  assert.equal(h.tables.planner_tasks.length, 2);
});

test('student edits and completed tasks survive repeat transfers', async () => {
  const h = harness();
  await h.save(programme, programme.rules);
  h.tables.planner_tasks[0].title = 'My revised task';
  h.tables.planner_tasks[0].done = true;
  await h.save(programme, programme.rules);
  assert.equal(h.tables.planner_tasks[0].title, 'My revised task');
  assert.equal(h.tables.planner_tasks[0].done, true);
});

test('only source actions can be transferred, even when caller-supplied action text differs', async () => {
  const h = harness();
  await h.save(programme, [{ ...programme.rules[0], action: 'Changed by caller' }]);
  assert.equal(h.tables.planner_tasks[0].title, programme.rules[0].action);
  await assert.rejects(h.save(programme, [{ ...programme.rules[0], id: 'unknown' }]), /Choose at least/);
});

test('an application moved to a named intake requires review before adding more source-scoped tasks', async () => {
  const h = harness();
  await h.save(programme, [programme.rules[0]]);
  h.tables.planner_applications[0].intake = 'Different intake';
  await assert.rejects(h.save(programme, [programme.rules[1]]), /review|changed/i);
  assert.equal(h.tables.planner_tasks.length, 1);
});

test('a reused application closed after the first transfer does not split later steps into a new application', async () => {
  const h = harness();
  h.tables.planner_applications.push({ id: 'student-application', user_id: 'user-one', region: programme.region,
    college_slug: programme.collegeSlug, program: programme.name, intake: programme.intake, status: 'researching' });
  await h.save(programme, [programme.rules[0]]);
  h.tables.planner_applications[0].status = 'closed';
  await assert.rejects(h.save(programme, [programme.rules[1]]), /review|changed/i);
  assert.equal(h.tables.planner_applications.length, 1);
});


test('a task moved to another application is surfaced for review without overwriting it', async () => {
  const h = harness();
  await h.save(programme, [programme.rules[0]]);
  h.tables.planner_tasks[0].application_id = 'a-different-application';
  await assert.rejects(h.save(programme, programme.rules), /review|changed/i);
  assert.equal(h.tables.planner_tasks[0].application_id, 'a-different-application');
  assert.equal(h.tables.planner_tasks.length, 1);
});

test('a new intake gets separate programme tasks while preserving an earlier completed set', async () => {
  const h = harness();
  await h.save(programme, programme.rules);
  h.tables.planner_tasks.forEach((row) => { row.done = true; });
  await h.save({ ...programme, intake: 'September 2028' }, programme.rules);
  assert.equal(h.tables.planner_applications.length, 2);
  assert.equal(h.tables.planner_tasks.length, 4);
  assert.equal(h.tables.planner_tasks.filter((row) => row.done).length, 2);
});

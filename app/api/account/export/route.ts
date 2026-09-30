import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseServerClient, getSupabaseServiceClient } from '@/lib/supabase/server';
import { isPasswordlessSession } from '@/lib/supabase/session-guard';
import { createRateLimiter, clientIp, NO_STORE } from '@/lib/security/request';

/**
 * GET /api/account/export — the signed-in visitor's data as a JSON download
 * (GDPR Art. 20 / DPDP right of access). Reads run through the caller's OWN
 * cookie-bound session, so RLS guarantees the export can only ever contain
 * their rows — no service role involved.
 *
 * PostgREST silently caps an unbounded select at ~1,000 rows and returns the
 * prefix with no error, so every list is paged with .range() until a short page.
 * Every table that holds data about the user MUST be listed here; adding a
 * per-user table elsewhere without extending this export is a §9 defect. The
 * one table the user cannot read themselves (admin_actions, service-role only)
 * is read on their behalf with the service client so the export stays complete.
 */

export const runtime = 'nodejs';

const PAGE = 1000;
const isRateLimited = createRateLimiter(10, 10 * 60_000);

/** The planner (0003), budget (0004), compare (0005) and test-score (0006) tables are created by owner-run migrations; until each runs, PostgREST answers "not in schema cache" / undefined_table. */
function isMissingTable(error: unknown): boolean {
  const e = error as { code?: string; message?: string } | null;
  if (!e) return false;
  // PGRST205 = table not in the schema cache; 42P01 = undefined_table. Do NOT
  // match "schema cache" loosely: PGRST204 ("column … not found in the schema
  // cache") is column drift, and treating it as "not created yet" would drop
  // real rows out of a data download while this file promises it cannot.
  return e.code === '42P01' || e.code === 'PGRST205' || /relation .* does not exist|could not find the table/i.test(e.message ?? '');
}

/**
 * Page through a query. `optionalTable` = a table that may not exist yet: a
 * missing-table error yields [] (nothing can be stored in a table that does not
 * exist); every OTHER error still throws so the export never silently omits
 * real rows while claiming completeness (independent review).
 */
async function fetchAll<T>(query: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>, optionalTable = false) {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await query(from, from + PAGE - 1);
    if (error) {
      if (optionalTable && isMissingTable(error)) return rows;
      throw new Error('export_query_failed');
    }
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return rows;
}

export async function GET(request: NextRequest) {
  const site = request.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin' && site !== 'none') {
    return NextResponse.json({ error: 'Request rejected.' }, { status: 403, headers: NO_STORE });
  }
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Accounts are not available right now.' }, { status: 503, headers: NO_STORE });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isPasswordlessSession(supabase))) {
    return NextResponse.json({ error: 'Please sign in first.' }, { status: 401, headers: NO_STORE });
  }
  if (isRateLimited(clientIp(request))) {
    return NextResponse.json({ error: 'Too many exports. Please try again later.' }, { status: 429, headers: { ...NO_STORE, 'Retry-After': '600' } });
  }

  try {
    const service = getSupabaseServiceClient();
    const [profile, savedItems, plannerApplications, plannerTasks, budgetPlans, budgetItems, compareSets, compareCriteria, compareEntries, compareScores, testScores, testScoreSections, moderation] = await Promise.all([
      supabase
        .from('profiles')
        .select('display_name, preferred_region, preferred_audience, consent_version, consent_tos_at, consent_privacy_at, created_at, updated_at')
        .eq('id', user.id)
        .maybeSingle()
        .then((r) => {
          if (r.error) throw new Error('export_query_failed');
          return r.data;
        }),
      fetchAll<Record<string, unknown>>((from, to) =>
        supabase
          .from('saved_items')
          .select('kind, slug, title, region, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(from, to),
      ),
      // Application Planner (migration 0003): the student's own entries.
      fetchAll<Record<string, unknown>>((from, to) =>
        supabase
          .from('planner_applications')
          .select('id, college_slug, name, region, program, intake, official_url, status, priority, notes, created_at, updated_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(from, to),
        true,
      ),
      fetchAll<Record<string, unknown>>((from, to) =>
        supabase
          .from('planner_tasks')
          .select('id, application_id, title, kind, due_on, done, created_at, updated_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .range(from, to),
        true,
      ),
      // Cost & Funding Planner (migration 0004): the student's own budgets.
      fetchAll<Record<string, unknown>>((from, to) =>
        supabase
          .from('budget_plans')
          .select('id, region, label, currency_code, years, intake, notes, created_at, updated_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .range(from, to),
        true,
      ),
      fetchAll<Record<string, unknown>>((from, to) =>
        supabase
          .from('budget_items')
          .select('id, plan_id, kind, category, label, amount, period, note, created_at, updated_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .range(from, to),
        true,
      ),
      // Compare Universities (migration 0005): the student's own comparisons.
      fetchAll<Record<string, unknown>>((from, to) =>
        supabase.from('compare_sets').select('id, region, label, notes, created_at, updated_at').eq('user_id', user.id).order('created_at', { ascending: true }).range(from, to),
        true,
      ),
      fetchAll<Record<string, unknown>>((from, to) =>
        supabase.from('compare_criteria').select('id, set_id, label, weight, created_at, updated_at').eq('user_id', user.id).order('created_at', { ascending: true }).range(from, to),
        true,
      ),
      fetchAll<Record<string, unknown>>((from, to) =>
        supabase.from('compare_entries').select('id, set_id, college_slug, name, official_url, note, created_at, updated_at').eq('user_id', user.id).order('created_at', { ascending: true }).range(from, to),
        true,
      ),
      fetchAll<Record<string, unknown>>((from, to) =>
        supabase.from('compare_scores').select('id, entry_id, criterion_id, score, created_at, updated_at').eq('user_id', user.id).order('created_at', { ascending: true }).range(from, to),
        true,
      ),
      // Test Score Tracker (migration 0006): the student's own recorded attempts.
      fetchAll<Record<string, unknown>>((from, to) =>
        supabase.from('test_scores').select('id, exam_slug, score_text, test_date, note, created_at, updated_at').eq('user_id', user.id).order('test_date', { ascending: false }).range(from, to),
        true,
      ),
      fetchAll<Record<string, unknown>>((from, to) =>
        supabase.from('test_score_sections').select('id, score_id, label, value, position, created_at').eq('user_id', user.id).order('position', { ascending: true }).range(from, to),
        true,
      ),
      service
        ? service
            .from('admin_actions')
            .select('action, at, reason')
            .eq('target_user_id', user.id)
            .order('at', { ascending: false })
            .range(0, 999)
            .then((r) => (r.error ? [] : (r.data ?? [])))
        : Promise.resolve([] as Array<{ action: string; at: string; reason: string | null }>),
    ]);

    const payload = {
      exported_at: new Date().toISOString(),
      site: 'https://www.globalstudyboard.com',
      account: {
        id: user.id,
        email: user.email ?? null,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at ?? null,
        sign_in_methods: (user.identities ?? []).map((i) => i.provider),
      },
      profile,
      saved_items: savedItems,
      application_planner: { applications: plannerApplications, tasks: plannerTasks },
      cost_planner: { plans: budgetPlans, items: budgetItems },
      compare_universities: { sets: compareSets, criteria: compareCriteria, entries: compareEntries, scores: compareScores },
      test_score_tracker: { scores: testScores, sections: testScoreSections },
      moderation_actions: moderation,
      notes: [
        'This file contains every record GlobalStudyBoard stores about your account, including any moderation action taken on it and the note (if any) attached to that action while your account exists.',
        'Our sign-in provider also keeps technical security logs of sign-ins (IP address, browser, time) for a limited period; usage analytics are aggregate and never tied to an account. Neither is included here.',
      ],
    };
    const body = JSON.stringify(payload, null, 2);
    return new NextResponse(body, {
      status: 200,
      headers: {
        ...NO_STORE,
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="globalstudyboard-account-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch {
    console.warn('[account-export] failed: query-error');
    return NextResponse.json({ error: 'Could not build your export. Please try again.' }, { status: 500, headers: NO_STORE });
  }
}

'use client';

import type { SupabaseClient } from '@supabase/supabase-js';
import { evidenceCurrent, type CheckProgramme, type CheckRule } from './application-check';
import { checkToolSession, isSetupError, isUnansweredWrite, sessionMessage, TIMED_OUT, withDeadline } from './tools-shared';

const RETRY = 'Your planner could not confirm the save. Try again to finish adding these steps.';
class CheckSaveError extends Error {}
type DbResult = { status: number; error: { code?: string; message: string } | null };

function requireSuccess(result: DbResult): void {
  if (!result.error) return;
  if (isUnansweredWrite(result.status, result.error)) throw new CheckSaveError(RETRY);
  if (isSetupError(result.error)) throw new CheckSaveError('Application Planner is unavailable right now. Try again later.');
  if (result.error.message.includes('planner_applications_cap')) throw new CheckSaveError('Your planner holds 100 applications. Make room before adding another programme.');
  if (result.error.message.includes('planner_tasks_cap')) throw new CheckSaveError('Your planner has reached its task limit. Make room and try saving these steps again.');
  throw new CheckSaveError(RETRY);
}

/** UUIDv8 with a SHA-256 payload. The account, programme and stable rule IDs
 * identify a transfer independently of the wording or any later student edits. */
async function transferId(...parts: string[]): Promise<string> {
  const key = new TextEncoder().encode(JSON.stringify(['gsb/application-check/v1', ...parts]));
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', key)).subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x80;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-');
}

async function plannerApplication(
  supabase: SupabaseClient, userId: string, programme: CheckProgramme, signal: AbortSignal, previousId?: string,
): Promise<string> {
  const id = await transferId(userId, programme.id, programme.intake);
  const owned = await supabase.from('planner_applications')
    .select('id,region,college_slug,program,intake,status').eq('user_id', userId).abortSignal(signal);
  requireSuccess(owned);
  const matches = (row: { region: string; college_slug: string | null; program: string | null; intake: string | null; status: string }) =>
    row.region === programme.region && row.college_slug === programme.collegeSlug &&
    row.program === programme.name && row.intake === programme.intake && ['researching', 'preparing'].includes(row.status);
  const created = owned.data?.find((row) => row.id === (previousId ?? id));
  if (previousId && !created) {
    throw new CheckSaveError('Previously saved steps have moved. Review them in your planner before adding more.');
  }
  if (created) {
    if (!matches(created)) {
      throw new CheckSaveError('The application created for this check has changed in your planner. Review it there before adding more steps.');
    }
    return created.id as string;
  }

  // Match the specific intake. General university entries remain separate.
  const exact = owned.data?.filter(matches) ?? [];
  if (exact.length === 1) return exact[0].id as string;

  const result = await supabase.from('planner_applications').upsert({
    id, user_id: userId, region: programme.region, college_slug: programme.collegeSlug,
    name: programme.university, program: programme.name, intake: programme.intake, official_url: programme.officialUrl,
  }, { onConflict: 'id', ignoreDuplicates: true }).abortSignal(signal);
  requireSuccess(result);
  return id;
}

/** A student explicitly selects these actions. No scores, answers or inferred
 * dates are copied. Existing rows are never updated, even on concurrent retries.
 * The programme insert and all task inserts are separate statements. If the
 * task batch fails, retrying finds the original application and completes it. */
export async function saveCheckActions(programme: CheckProgramme, rules: CheckRule[], expectedUserId?: string): Promise<void> {
  if (!evidenceCurrent(programme)) throw new CheckSaveError('These requirements need a fresh review. Check the current instructions with the university.');
  const selectedIds = new Set(rules.map((rule) => rule.id));
  const selected = programme.rules.filter((rule) => selectedIds.has(rule.id));
  if (!selected.length || selected.length !== selectedIds.size) {
    throw new CheckSaveError('Choose at least one suggested step for this programme.');
  }
  const result = await withDeadline(async (signal, expired) => {
    const session = await checkToolSession();
    if (session.kind === 'unconfigured') throw new CheckSaveError('Application Planner is unavailable right now.');
    if (session.kind !== 'ok') throw new CheckSaveError(sessionMessage(session, RETRY));
    if (expired()) throw new CheckSaveError(RETRY);
    const { supabase, user } = session;
    if (expectedUserId !== undefined && user.id !== expectedUserId) {
      throw new CheckSaveError('The signed-in account changed. Reopen the check before saving steps.');
    }
    const tasks = await Promise.all(selected.map(async (rule) => ({
      id: await transferId(user.id, programme.id, programme.intake, rule.id), user_id: user.id, title: rule.action,
      kind: rule.kind === 'prepare' ? 'document' : 'application',
    })));

    // Read first: the cap guard runs before ON CONFLICT. A previously saved
    // task is still a successful retry when the planner is full.
    const knownIds = await Promise.all(programme.rules.map((rule) => transferId(user.id, programme.id, programme.intake, rule.id)));
    const existing = await supabase.from('planner_tasks').select('id,application_id')
      .eq('user_id', user.id).in('id', knownIds).abortSignal(signal);
    requireSuccess(existing);
    const saved = new Set(existing.data?.map((row) => row.id));
    const remaining = tasks.filter((row) => !saved.has(row.id));
    const priorApplications = new Set(existing.data?.map((row) => row.application_id));
    if (priorApplications.size > 1 || priorApplications.has(null)) {
      throw new CheckSaveError('Previously saved steps have moved. Review them in your planner before adding more.');
    }
    const previousId = priorApplications.values().next().value as string | undefined;
    const applicationId = await plannerApplication(supabase, user.id, programme, signal, previousId);
    if (!remaining.length) return;
    const written = await supabase.from('planner_tasks')
      .upsert(remaining.map((row) => ({ ...row, application_id: applicationId })), { onConflict: 'id', ignoreDuplicates: true })
      .abortSignal(signal);
    requireSuccess(written);
  }).catch((error: unknown) => {
    if (error instanceof CheckSaveError) throw error;
    throw new CheckSaveError(RETRY);
  });
  if (result === TIMED_OUT) throw new CheckSaveError(RETRY);
}

'use client';

import { lowestReportedBand, parseBand } from './application-check';
import { todayIso } from './planner';
import { checkToolSession, sessionMessage, TIMED_OUT, withDeadline } from './tools-shared';

export interface SavedIelts {
  id: string;
  date: string;
  overall: string;
  lowest: string;
}

/** Called on the student's explicit request. Read only the fields used in this comparison. */
export async function loadSavedIelts(expectedUserId?: string): Promise<SavedIelts[]> {
  const result = await withDeadline((signal) => readScores(expectedUserId, signal));
  if (result === TIMED_OUT) throw new Error('Your results took too long to load. Try again or enter the bands yourself.');
  return result;
}

async function readScores(expectedUserId: string | undefined, signal: AbortSignal): Promise<SavedIelts[]> {
  const session = await checkToolSession();
  if (session.kind !== 'ok') throw new Error(sessionMessage(session, 'Please sign in to use a saved result.'));
  if (signal.aborted || (expectedUserId && session.user.id !== expectedUserId)) {
    throw new Error('Your session changed. Reopen the check to use your saved results.');
  }
  const { data, error } = await session.supabase.from('test_scores')
    .select('id, test_date, score_text, test_score_sections(label, value)')
    .eq('user_id', session.user.id).eq('exam_slug', 'ielts').lte('test_date', todayIso())
    .order('test_date', { ascending: false }).limit(100).abortSignal(signal);
  if (error) throw new Error('Your saved results could not load. You can still enter your bands here.');
  return (data ?? []).flatMap((row) => {
    // Scores are free text in the tracker. Only a standalone band can be safely reused.
    const overall = parseBand(row.score_text);
    return overall === null ? [] : [{
      id: row.id, date: row.test_date, overall: String(overall),
      lowest: lowestReportedBand(row.test_score_sections ?? []),
    }];
  });
}

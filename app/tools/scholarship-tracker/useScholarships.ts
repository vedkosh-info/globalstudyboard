'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ToolSession } from '@/lib/tools-shared';
import { checkToolSession, explainLoadFailure, isSetupError, isUnansweredWrite, TIMED_OUT, withDeadline } from '@/lib/tools-shared';
import type { ScholarshipEntry, ScholarshipTask } from '@/lib/scholarship-tracker';
import type { PlannerApplication } from '@/lib/planner';
import type { BudgetPlan } from '@/lib/cost-planner';
import { SCHOLARSHIP_UI as UI, scholarshipError } from '@/lib/scholarship-ui';
import { CONNECTION_LOST, SESSION_ENDED } from '@/lib/auth-events';

type LoadState = 'loading' | 'ready' | 'setup' | 'offline' | 'signed-out' | 'error';
type Response = { data: unknown; error: { code?: string; message: string } | null; status: number };
type Notice = { text: string; error: boolean; seq: number } | null;

/** Bounded reads/writes, verified sessions and retry-safe RPCs. No private data in logs or storage. */
export function useScholarships() {
  const [load, setLoad] = useState<LoadState>('loading');
  const [entries, setEntries] = useState<ScholarshipEntry[]>([]);
  const [tasks, setTasks] = useState<ScholarshipTask[]>([]);
  const [applications, setApplications] = useState<PlannerApplication[]>([]);
  const [budgets, setBudgets] = useState<BudgetPlan[]>([]);
  const [applicationsAvailable, setApplicationsAvailable] = useState(true);
  const [budgetsAvailable, setBudgetsAvailable] = useState(true);
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const mounted = useRef(false);
  const request = useRef(0);
  const sequence = useRef(0);
  const notify = useCallback((text: string, error = false) => { if (mounted.current) setNotice({ text, error, seq: ++sequence.current }); }, []);

  const reload = useCallback(async (initial = false): Promise<boolean> => {
    const ticket = ++request.current;
    const outcome = await withDeadline(async (signal) => {
      const session = await checkToolSession();
      if (session.kind !== 'ok') return session.kind === 'offline' ? 'offline' as const : 'signed-out' as const;
      const { supabase, user } = session;
      const [e, t, a, b] = await Promise.all([
        supabase.from('scholarship_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).range(0, 99).abortSignal(signal),
        supabase.from('scholarship_tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: true }).range(0, 999).abortSignal(signal),
        supabase.from('planner_applications').select('id,name,region').eq('user_id', user.id).range(0, 99).abortSignal(signal),
        supabase.from('budget_plans').select('id,label,region,currency_code,years').eq('user_id', user.id).range(0, 11).abortSignal(signal),
      ]);
      if (e.error || t.error) return explainLoadFailure(e.error ?? t.error);
      return { entries: (e.data ?? []) as ScholarshipEntry[], tasks: (t.data ?? []) as ScholarshipTask[], applications: (a.data ?? []) as PlannerApplication[], budgets: (b.data ?? []) as BudgetPlan[], applicationsAvailable: !a.error, budgetsAvailable: !b.error };
    }).catch(() => 'error' as const);
    if (!mounted.current || ticket !== request.current) return false;
    if (outcome === TIMED_OUT || typeof outcome === 'string') {
      if (initial) setLoad(outcome === TIMED_OUT ? 'offline' : outcome);
      else notify(UI.pendingRefresh, true);
      return false;
    }
    setEntries(outcome.entries); setTasks(outcome.tasks); setApplications(outcome.applications); setBudgets(outcome.budgets);
    setApplicationsAvailable(outcome.applicationsAvailable); setBudgetsAvailable(outcome.budgetsAvailable); setLoad('ready');
    return true;
  }, [notify]);

  useEffect(() => {
    mounted.current = true;
    void reload(true);
    return () => { mounted.current = false; request.current += 1; };
  }, [reload]);

  /** Returns null on any unconfirmed/failed write. The caller retains the same UUID and its input for a retry. */
  const mutate = useCallback(async <T,>(operation: (s: ToolSession, signal: AbortSignal) => PromiseLike<Response>, success: string): Promise<T | null> => {
    if (busyRef.current) return null;
    // A read begun before this write must never replace the confirmed newer view.
    request.current += 1;
    busyRef.current = true; setBusy(true);
    try {
      const result = await withDeadline(async (signal, expired) => {
        const session = await checkToolSession();
        if (session.kind !== 'ok') return { failure: session.kind === 'offline' ? CONNECTION_LOST : SESSION_ENDED };
        if (expired()) return { failure: UI.unconfirmed };
        const response = await operation(session, signal);
        if (isUnansweredWrite(response.status, response.error)) return { failure: UI.unconfirmed };
        if (response.error) return { failure: isSetupError(response.error) ? UI.unavailable : scholarshipError(response.error.message) };
        return { value: response.data as T };
      });
      if (!mounted.current) return null;
      if (result === TIMED_OUT) { notify(UI.unconfirmed, true); return null; }
      if ('failure' in result) { notify(result.failure ?? UI.failed, true); return null; }
      notify(success);
      return result.value;
    } catch {
      notify(UI.unconfirmed, true);
      return null;
    } finally {
      busyRef.current = false;
      if (mounted.current) setBusy(false);
    }
  }, [notify]);

  return { load, entries, setEntries, tasks, setTasks, applications, budgets, applicationsAvailable, budgetsAvailable, notice, notify, busy, reload, mutate };
}

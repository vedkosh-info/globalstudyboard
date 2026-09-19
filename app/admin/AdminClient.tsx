'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ShieldCheck, Search, UserRound } from 'lucide-react';
import SignInButton from '@/components/auth/SignInButton';
import { useAuth } from '@/components/auth/AuthProvider';
import { isAuthConfigured } from '@/lib/supabase/config';
import type { AdminUser } from '@/lib/admin/types';

/**
 * Owner console (user management). A static page shell; this client probes
 * /api/admin/users and renders whatever the server allows — the API (allowlisted
 * e-mail over the Supabase session + service role) is the only security
 * boundary, so nothing here is ever more than a view.
 *
 * Console rules: search-first (the recent list is a bounded 50, the only
 * listing); the identifier the owner types never enters the URL; no export or
 * download control; nothing written to console/analytics.
 */

type Gate = 'checking' | 'signed-out' | 'forbidden' | 'unconfigured' | 'ok';

const CARD = 'rounded-2xl border border-stone-200 bg-white p-5 shadow-sm';
const INPUT =
  'w-full rounded-xl border border-stone-450 bg-white px-3 py-2.5 font-sans text-sm text-stone-800 placeholder:text-stone-500 focus:border-forest-600 focus:outline-none';
const BTN = 'rounded-xl bg-forest-700 px-4 py-2.5 text-sm font-medium text-cream-50 hover:bg-forest-800 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500';
const SMALL = 'rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60';
const DANGER = 'rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60';

function when(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function UserCard({ u, onChanged }: { u: AdminUser; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [reason, setReason] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const confirmMatches = confirmEmail.trim().toLowerCase() === (u.email ?? '').toLowerCase();

  const act = async (action: 'ban' | 'unban' | 'delete') => {
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch('/api/admin/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: u.id, action, reason, ...(action === 'delete' ? { confirmEmail } : {}) }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setMsg(
          res.status === 401
            ? 'Not authorised. Changes need a sign-in from the last 24 hours — sign out, sign back in and retry.'
            : data?.error || 'The action failed.',
        );
        return;
      }
      setMsg(
        action === 'delete'
          ? 'Account deleted.'
          : action === 'ban'
            ? 'Sign-in banned — takes full effect within 15 minutes (an already-issued token runs out by then).'
            : 'Ban lifted.',
      );
      setConfirmDelete(false);
      onChanged();
    } catch {
      setMsg('The action failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className={`${CARD} space-y-3`}>
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
          <UserRound className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-stone-900" translate="no">
            {u.email ?? '(no e-mail)'}
            {u.bannedUntil && <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">BANNED</span>}
          </p>
          <p className="mt-0.5 break-all font-mono text-[11px] text-stone-500" translate="no">
            {u.id}
          </p>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-stone-700 sm:grid-cols-3">
            <div><dt className="font-semibold text-stone-600">Joined</dt><dd>{when(u.createdAt)}</dd></div>
            <div><dt className="font-semibold text-stone-600">Last sign-in</dt><dd>{when(u.lastSignInAt)}</dd></div>
            <div><dt className="font-semibold text-stone-600">Sign-in via</dt><dd>{u.providers.join(', ') || '—'}</dd></div>
            <div><dt className="font-semibold text-stone-600">Display name</dt><dd translate="no">{u.profile?.displayName || '—'}</dd></div>
            <div><dt className="font-semibold text-stone-600">Destination</dt><dd>{u.profile?.preferredRegion ?? '—'}{u.profile?.preferredAudience ? ` · ${u.profile.preferredAudience}` : ''}</dd></div>
            <div><dt className="font-semibold text-stone-600">Saved pages</dt><dd>{u.savedCount}</dd></div>
          </dl>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-stone-200 pt-3">
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={300}
          placeholder="Note for the audit trail — no personal details"
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault();
          }}
          aria-label="Note for the audit trail (no personal details; kept while the account exists, visible in the person's data export; discarded when the account is deleted)"
          title="Kept while the account exists and included in the person's own data export; discarded when the account is deleted"
          className={`${INPUT} sm:max-w-xs`}
        />
        {u.bannedUntil ? (
          <button type="button" disabled={busy} onClick={() => void act('unban')} className={SMALL}>Lift ban</button>
        ) : (
          <button type="button" disabled={busy} onClick={() => void act('ban')} className={SMALL}>Ban sign-in</button>
        )}
        {!confirmDelete && (
          <button type="button" disabled={busy} onClick={() => setConfirmDelete(true)} className={DANGER}>Delete account…</button>
        )}
      </div>
      {confirmDelete && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3" role="group" aria-labelledby={`confirm-${u.id}`}>
          <p id={`confirm-${u.id}`} className="text-xs text-stone-800">Type the account e-mail to confirm permanent deletion (cascades profile + saved pages).</p>
          <input
            type="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (!busy && confirmMatches) void act('delete');
              }
            }}
            placeholder={u.email ?? ''}
            aria-label="Type the account e-mail to confirm"
            className={`${INPUT} mt-2`}
          />
          <div className="mt-2 flex gap-2">
            <button type="button" disabled={busy || !confirmMatches} onClick={() => void act('delete')} className={DANGER}>
              {busy ? 'Deleting…' : 'Delete permanently'}
            </button>
            <button type="button" onClick={() => setConfirmDelete(false)} className={SMALL}>Cancel</button>
          </div>
        </div>
      )}
      <p role="status" aria-live="polite" className="min-h-[1rem] text-xs font-medium text-stone-700">{msg}</p>
    </li>
  );
}

export default function AdminClient() {
  const { hasSession, ready } = useAuth();
  const [gate, setGate] = useState<Gate>('checking');
  const [total, setTotal] = useState<number | null>(null);
  const [stepUpFresh, setStepUpFresh] = useState(true);
  const [recent, setRecent] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<AdminUser | null | undefined>(undefined);
  const [lookupMsg, setLookupMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const loadRecent = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users', { cache: 'no-store' });
      if (res.status === 401) return setGate(hasSession ? 'forbidden' : 'signed-out');
      if (res.status === 503) return setGate('unconfigured');
      if (!res.ok) return setGate('forbidden');
      const data = (await res.json()) as { total: number | null; recent: AdminUser[]; stepUpFresh?: boolean };
      setTotal(data.total);
      setRecent(data.recent);
      setStepUpFresh(data.stepUpFresh !== false);
      setGate('ok');
    } catch {
      setGate('forbidden');
    }
  }, [hasSession]);

  useEffect(() => {
    if (!ready) return;
    if (!isAuthConfigured()) return setGate('unconfigured');
    if (!hasSession) return setGate('signed-out');
    void loadRecent();
  }, [ready, hasSession, loadRecent]);

  const lookup = async (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setBusy(true);
    setLookupMsg('');
    setResult(undefined);
    try {
      // POST body: the identifier never enters a URL (page history OR server request logs).
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q }),
        cache: 'no-store',
      });
      const data = (await res.json().catch(() => null)) as { user?: AdminUser | null; error?: string } | null;
      if (!res.ok) {
        setLookupMsg(data?.error || 'Lookup failed.');
        return;
      }
      setResult(data?.user ?? null);
      if (!data?.user) setLookupMsg('No account with that e-mail or id.');
    } catch {
      setLookupMsg('Lookup failed.');
    } finally {
      setBusy(false);
    }
  };

  const refresh = () => {
    void loadRecent();
    if (result) {
      // Re-run the same lookup silently so the card reflects the new state.
      setQuery((q) => q);
      void (async () => {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: result.id }),
          cache: 'no-store',
        });
        const data = (await res.json().catch(() => null)) as { user?: AdminUser | null } | null;
        setResult(data?.user ?? null);
      })();
    }
  };

  if (gate === 'checking')
    return (
      <div role="status" aria-busy="true">
        <span className="sr-only">Checking your access…</span>
        <div className="h-32 animate-pulse rounded-2xl bg-stone-200" aria-hidden="true" />
      </div>
    );
  if (gate === 'unconfigured')
    return <div className={CARD}><p className="text-sm text-stone-700">The admin console is not configured on this deployment.</p></div>;
  if (gate === 'signed-out')
    return (
      <div className={CARD}>
        <p className="text-sm text-stone-700">Sign in with the owner account to open the console.</p>
        <div className="mt-3"><SignInButton intent="admin" className={BTN}>Sign in</SignInButton></div>
      </div>
    );
  if (gate === 'forbidden')
    return (
      <div className={CARD}>
        <p className="text-sm text-stone-700">This account is not an administrator.</p>
      </div>
    );

  return (
    <div className="space-y-6">
      <p className="inline-flex items-center gap-2 rounded-full bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-800">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Owner console ·{' '}
        {total === null ? '— accounts' : `${total.toLocaleString('en-GB')} ${total === 1 ? 'account' : 'accounts'}`}
      </p>

      {!stepUpFresh && (
        <p role="status" className="rounded-xl border border-terracotta-200 bg-terracotta-50 px-3 py-2 text-xs text-stone-800 leading-relaxed">
          Your sign-in is older than 24 hours. You can look accounts up, but ban, unban and delete will be refused until
          you sign out and sign back in.
        </p>
      )}

      <form onSubmit={lookup} className={`${CARD} space-y-2`} aria-labelledby="admin-lookup">
        <h2 id="admin-lookup" className="font-display text-lg font-bold text-forest-800">Look up an account</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="E-mail address or user id"
            aria-label="E-mail address or user id"
            autoComplete="off"
            className={INPUT}
          />
          <button type="submit" disabled={busy || !query.trim()} className={`${BTN} inline-flex shrink-0 items-center gap-2 whitespace-nowrap`}>
            <Search className="h-4 w-4" aria-hidden="true" /> {busy ? 'Looking…' : 'Find'}
          </button>
        </div>
        <p role="status" aria-live="polite" className="min-h-[1rem] text-xs text-stone-700">{lookupMsg}</p>
      </form>
      {/* The result card lives OUTSIDE the lookup <form>: a <form> cannot nest
          inside another, so when the card (with its delete-confirmation form)
          rendered inside it the browser dropped the inner tag and "Delete
          permanently" re-ran the search instead of deleting — found by the
          independent review. */}
      {result && (
        <ul className="list-none p-0 m-0" aria-label="Lookup result">
          <UserCard u={result} onChanged={refresh} />
        </ul>
      )}

      <section aria-labelledby="admin-recent" className="space-y-3">
        <h2 id="admin-recent" className="font-display text-lg font-bold text-forest-800">Recent sign-ups <span className="text-sm font-normal text-stone-600">(latest {recent.length})</span></h2>
        {recent.length === 0 ? (
          <p className="text-sm text-stone-700">No accounts yet.</p>
        ) : (
          <ul className="list-none space-y-3 p-0 m-0">
            {recent.map((u) => <UserCard key={u.id} u={u} onChanged={refresh} />)}
          </ul>
        )}
      </section>
    </div>
  );
}

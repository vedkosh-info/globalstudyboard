'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { useRegion } from '@/components/RegionProvider';
import { ReloadPageButton, ToolLoadError, ToolOffline, ToolSessionEnded, ToolSkeleton, ToolUnavailable } from '@/components/tools/ToolStates';
import { matchingProgrammes, type CheckProgramme } from '@/lib/application-check';
import { AUTH_CHANGED_EVENT } from '@/lib/auth-events';
import { getRegionBySlug, type RegionSlug } from '@/lib/regions';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { applicationCheckHref, applicationCheckProgrammeId } from '@/lib/tools';
import { checkToolSession } from '@/lib/tools-shared';
import { CARD, INPUT, LABEL, LINK, SECONDARY } from '../scholarship-tracker/styles';
import ProgrammeResult from './ProgrammeResult';

type Account =
  | { state: 'loading' | 'offline' | 'signed-out' | 'unconfigured' }
  | { state: 'ready'; userId: string };

function useVerifiedAccount(): Account {
  const [account, setAccount] = useState<Account>({ state: 'loading' });
  useEffect(() => {
    let active = true;
    let attempt = 0;
    let verifiedId: string | undefined;
    const verify = async (clear = false) => {
      const sequence = ++attempt;
      if (clear) {
        verifiedId = undefined;
        setAccount({ state: 'loading' });
      }
      try {
        const session = await checkToolSession();
        if (!active || sequence !== attempt) return;
        verifiedId = session.kind === 'ok' ? session.user.id : undefined;
        setAccount(session.kind === 'ok' ? { state: 'ready', userId: session.user.id } : { state: session.kind });
      } catch {
        if (active && sequence === attempt) setAccount({ state: 'offline' });
      }
    };
    const onFocus = () => { void verify(); };
    const onChanged = () => { void verify(true); };
    void verify();
    window.addEventListener('focus', onFocus);
    window.addEventListener(AUTH_CHANGED_EVENT, onChanged);
    // Never await an SDK operation from inside the SDK's auth callback.
    const subscription = getSupabaseBrowserClient()?.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || (event === 'SIGNED_IN' && verifiedId && verifiedId !== session?.user.id)) {
        queueMicrotask(() => { if (active) onChanged(); });
      }
    }).data.subscription;
    return () => {
      active = false;
      subscription?.unsubscribe();
      window.removeEventListener('focus', onFocus);
      window.removeEventListener(AUTH_CHANGED_EVENT, onChanged);
    };
  }, []);
  return account;
}

export default function ApplicationCheckApp() {
  const account = useVerifiedAccount();
  const { effectiveRegion } = useRegion();
  const [catalogue, setCatalogue] = useState<CheckProgramme[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [load, setLoad] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    void (async () => {
      try {
        const response = await fetch('/tools/application-check/catalogue', { signal: controller.signal });
        if (!response.ok) throw new Error();
        const data: unknown = await response.json();
        if (!Array.isArray(data) || !data.length) throw new Error();
        if (active) setCatalogue(data as CheckProgramme[]);
      } catch {
        if (active) setFailed(true);
      } finally {
        window.clearTimeout(timeout);
      }
    })();
    return () => { active = false; controller.abort(); window.clearTimeout(timeout); };
  }, [load]);

  if (account.state === 'unconfigured') return <ToolUnavailable />;
  if (account.state === 'signed-out') return <ToolSessionEnded />;
  if (account.state === 'offline') return <div className="space-y-3"><ToolOffline /><ReloadPageButton /></div>;
  if (failed) return <div className="space-y-3"><ToolLoadError what="programme list" /><button className={SECONDARY} onClick={() => { setFailed(false); setLoad(load + 1); }}>Try again</button></div>;
  if (account.state !== 'ready' || !catalogue) return <ToolSkeleton label="Application Check" />;
  return <ProgrammePicker key={account.userId + effectiveRegion} programmes={catalogue} region={effectiveRegion} userId={account.userId} />;
}

function subscribeToFragment(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  window.addEventListener('popstate', onChange);
  return () => {
    window.removeEventListener('hashchange', onChange);
    window.removeEventListener('popstate', onChange);
  };
}

const currentFragment = () => window.location.hash;

function ProgrammePicker({ programmes, region, userId }: { programmes: CheckProgramme[]; region: RegionSlug; userId: string }) {
  const [query, setQuery] = useState('');
  const hash = useSyncExternalStore(subscribeToFragment, currentFragment, () => '');
  const programmeId = applicationCheckProgrammeId(hash, region);
  const chosen = programmes.find((entry) => entry.region === region && entry.id === programmeId);
  const search = useRef<HTMLInputElement>(null);
  const restoreFocus = useRef(false);
  useEffect(() => {
    if (!chosen && restoreFocus.current) {
      search.current?.focus();
      restoreFocus.current = false;
    }
  }, [chosen]);
  const selectProgramme = (id: string | null) => {
    const href = applicationCheckHref(id, region);
    window.history.pushState(window.history.state, '', href);
    // pushState avoids an anchor scroll. Notify the picker and destination gate explicitly.
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };
  const matches = matchingProgrammes(programmes, region, query);
  if (chosen) return <ProgrammeResult key={chosen.id} programme={chosen} userId={userId} onChange={() => { restoreFocus.current = true; selectProgramme(null); }} />;
  return (
    <div className={CARD}>
      <p className="m-0 text-sm font-semibold text-forest-700">{getRegionBySlug(region)?.displayName}</p>
      <h2 className="mb-0 mt-1 font-display text-2xl font-bold tracking-editorial text-ink">Choose a programme</h2>
      <p className="mb-0 mt-2 max-w-prose text-base leading-relaxed text-stone-700">Start with a programme we have reviewed for this destination.</p>
      <div className="mt-4 space-y-2">
        {matches.map((entry) => (
          <button key={entry.id} type="button" onClick={() => selectProgramme(entry.id)} className="flex min-h-16 w-full items-center justify-between gap-4 rounded-xl border border-forest-300 bg-forest-50 px-4 py-3 text-left text-forest-900 hover:bg-forest-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2">
            <span className="min-w-0"><span className="block text-base font-semibold">{entry.name}</span><span className="mt-0.5 block text-sm text-stone-700">{entry.university}</span></span>
            <ArrowRight size={20} className="shrink-0" aria-hidden="true" />
          </button>
        ))}
      </div>
      <label htmlFor="check-search" className={LABEL + ' mt-5'}>Find a reviewed programme</label>
      <div className="relative">
        <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 text-stone-500" />
        <input ref={search} id="check-search" className={INPUT + ' pl-10'} type="search" autoComplete="off" maxLength={2000} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Programme, university or official programme link" />
      </div>
      {!matches.length && <div role="status" className="mt-4 rounded-xl bg-cream-50 p-4 text-base leading-relaxed text-stone-700">
        <p className="m-0">We don’t have a reviewed match for this destination yet. Try the programme name or check the university’s own admissions page.</p>
        {query && <button type="button" className={LINK + ' mt-2 min-h-11 text-sm font-semibold'} onClick={() => { setQuery(''); search.current?.focus(); }}>Show reviewed programmes</button>}
      </div>}
    </div>
  );
}

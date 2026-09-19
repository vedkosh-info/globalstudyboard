'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { AUTH_CHANGED_EVENT, announceAuthChanged, requireAuth, takeResumeIntent } from '@/lib/auth-events';
import { isAuthConfigured } from '@/lib/supabase/config';
import type { SaveTarget } from '@/lib/saved-items';

/**
 * "Save" on a guide / university / exam page — adds the page to the signed-in
 * visitor's shortlist (/account#saved).
 *
 * Bundle guard: this component is on ~3,000 static pages, so it imports NO
 * Supabase code. The SDK chunk is `import()`ed only when it is actually needed:
 * to read the saved state for a signed-in visitor, and on click.
 *
 * Signed out → `requireAuth()` opens the sign-in sheet; a code sign-in resolves
 * 'ok' in place and the save completes without leaving the page. A Google
 * sign-in is a full-page redirect, so the intent is stashed (path-scoped, 10
 * min) and the page finishes the save when it lands back here.
 *
 * Renders nothing while accounts are unconfigured.
 */

type SavedState = 'unknown' | 'saved' | 'unsaved';

/**
 * Per-session memory of saved state so route changes do not re-query. It is
 * per PAGE, not per user, so it is emptied whenever the session changes — an
 * in-page sign-out followed by a different account's sign-in must not inherit
 * the previous account's "saved" (independent review).
 */
const cache = new Map<string, boolean>();
let cacheListenerInstalled = false;
function installCacheListener() {
  if (cacheListenerInstalled || typeof window === 'undefined') return;
  cacheListenerInstalled = true;
  window.addEventListener(AUTH_CHANGED_EVENT, () => cache.clear());
}

export default function SaveButton({ kind, slug, title, region = null, className = '' }: SaveTarget & { className?: string }) {
  const { hasSession, ready } = useAuth();
  const key = `${kind}:${slug}`;
  const [state, setState] = useState<SavedState>(() => (cache.has(key) ? (cache.get(key) ? 'saved' : 'unsaved') : 'unknown'));
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const resumed = useRef(false);

  const write = useCallback(
    async (nextSaved: boolean) => {
      setBusy(true);
      setNote('');
      try {
        const { getSupabaseBrowserClient } = await import('@/lib/supabase/client');
        const supabase = getSupabaseBrowserClient();
        if (!supabase) return;
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          // The cookie was stale (session revoked or expired elsewhere): clear
          // it, tell the chrome, and offer a fresh sign-in.
          await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
          announceAuthChanged();
          setNote('Your session ended — sign in again to save.');
          return;
        }
        if (nextSaved) {
          const { error } = await supabase
            .from('saved_items')
            .upsert({ user_id: user.id, kind, slug, title: title.slice(0, 200), region }, { onConflict: 'user_id,kind,slug', ignoreDuplicates: true });
          if (error) {
            setNote(/saved_items_cap/.test(error.message) ? 'You have reached the 500-page limit.' : 'Could not save. Please try again.');
            return;
          }
        } else {
          const { error } = await supabase.from('saved_items').delete().eq('user_id', user.id).eq('kind', kind).eq('slug', slug);
          if (error) {
            setNote('Could not remove. Please try again.');
            return;
          }
        }
        cache.set(key, nextSaved);
        setState(nextSaved ? 'saved' : 'unsaved');
        setNote(nextSaved ? 'Saved to your account.' : 'Removed from your saved pages.');
      } catch {
        setNote('Could not save. Please try again.');
      } finally {
        setBusy(false);
      }
    },
    [key, kind, slug, title, region],
  );

  useEffect(installCacheListener, []);

  // Signed in: learn whether this page is already saved (once per page/session),
  // and finish a save that a redirect sign-in (Google or e-mail link) interrupted.
  useEffect(() => {
    if (!ready || !hasSession) {
      if (ready && !hasSession) setState('unsaved');
      return;
    }
    if (!resumed.current && takeResumeIntent('save')) {
      resumed.current = true;
      void write(true);
      return;
    }
    if (cache.has(key)) return;
    let active = true;
    void import('@/lib/supabase/client').then(async ({ getSupabaseBrowserClient }) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !active) return;
      const { data } = await supabase.from('saved_items').select('slug').eq('user_id', user.id).eq('kind', kind).eq('slug', slug).maybeSingle();
      // A write that completed while this read was in flight (the in-page
      // sign-in-then-save path) has already filled the cache: its answer wins.
      if (!active || cache.has(key)) return;
      cache.set(key, Boolean(data));
      setState(data ? 'saved' : 'unsaved');
    });
    return () => {
      active = false;
    };
  }, [ready, hasSession, key, kind, slug, write]);

  if (!isAuthConfigured()) return null;

  const saved = state === 'saved';

  const onClick = async () => {
    if (busy) return;
    if (!hasSession) {
      const verdict = await requireAuth({ intent: 'save' });
      if (verdict !== 'ok') return;
    }
    await write(!saved);
  };

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => void onClick()}
        aria-busy={busy || undefined}
        aria-pressed={saved}
        aria-label={saved ? `Saved — remove ${title} from your saved pages` : `Save ${title} to your account`}
        className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-1 ${busy ? 'cursor-wait' : ''} ${
          saved
            ? 'border-forest-600 bg-forest-700 text-cream-50 hover:bg-forest-800'
            : 'border-forest-300 bg-white text-forest-700 hover:border-forest-400 hover:bg-forest-50'
        }`}
      >
        {saved ? <BookmarkCheck className="h-3.5 w-3.5" aria-hidden="true" /> : <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />}
        {saved ? 'Saved' : 'Save'}
      </button>
      <span role="status" aria-live="polite" className="text-xs text-stone-600">
        {note}
      </span>
    </span>
  );
}

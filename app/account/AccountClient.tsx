'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { Bookmark, CheckCircle2, Download, LogOut, Settings2, Trash2, UserRound, X } from 'lucide-react';
import SignInButton from '@/components/auth/SignInButton';
import AccountTabs, { tabButtonId, tabPanelId, type AccountTab } from '@/app/account/AccountTabs';
import { useRegion } from '@/components/RegionProvider';
import { useAudience } from '@/components/AudienceProvider';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  acceptConsent,
  cleanDisplayName,
  ensureProfile,
  fetchOwnProfile,
  updateOwnProfile,
  DISPLAY_NAME_MAX,
  type ProfileRow,
} from '@/lib/supabase/profile';
import { CONSENT_VERSION, consentNeedsRefresh } from '@/lib/consent';
import { announceAuthChanged } from '@/lib/auth-events';
import { getRegionBySlug } from '@/lib/regions';
import { SAVED_KIND_LABEL, savedItemHref, type SavedItemRow } from '@/lib/saved-items';
import LastUpdated from '@/components/LastUpdated';
import { SITE_REVIEWED } from '@/lib/site-meta';

/**
 * The account page body — modelled on VedKosh's /account: an identity row
 * (address + Verified pill + sign-in method), a tab strip, always-mounted
 * panels. Everything resolves in the browser (the page shell is static):
 * getUser() on mount, then the profile and saved pages under the caller's own
 * RLS. Three early returns — unconfigured / loading / signed-out — mirror the
 * region engine's "never block, never flash" rules.
 *
 * Tabs: Personal details · Saved pages · Data & account. `?tab=` deep-links a
 * tab (written with replaceState so it never creates history entries).
 *
 * Consent: a row whose consent_version is missing or older than the current
 * documents (a dashboard-created account, or a policy revision) gets a consent
 * step in front of the tabs; the trigger stamps the server time on acceptance.
 *
 * Loading discipline (independent review, 18 Sep 2026): supabase-js emits
 * SIGNED_IN again every time the tab regains focus (its visibilitychange
 * recovery), so `load` is keyed to the user id and never re-runs for the same
 * account — otherwise every refocus overwrote an unsaved display-name draft
 * and refetched the saved list. The device's destination/audience are read
 * through refs at call time (the values captured at first render are the
 * pre-hydration nulls, and using them would have let the profile overwrite a
 * choice the device already held).
 *
 * Deliberately NO destination or audience picker here: the site has exactly one
 * control for each (the header pill and the context-bar toggle, content-policy
 * §16.3). A signed-in visitor's choices are mirrored into the profile as they
 * use those controls (AuthProvider write-through), so this page only REPORTS
 * what the account remembers.
 */

type Status = 'loading' | 'signed-out' | 'ready' | 'deleted';
type TabId = 'personal' | 'saved' | 'data';

const TABS: AccountTab[] = [
  { id: 'personal', label: 'Personal details', icon: UserRound },
  { id: 'saved', label: 'Saved pages', icon: Bookmark },
  { id: 'data', label: 'Data & account', icon: Settings2 },
];
const isTabId = (v: string | null): v is TabId => v === 'personal' || v === 'saved' || v === 'data';

const CARD = 'rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6';
const H2 = 'font-display text-xl font-bold tracking-editorial text-forest-800';
const INPUT =
  'mt-1.5 w-full rounded-xl border border-stone-450 bg-white px-3 py-2.5 font-sans text-sm text-stone-800 placeholder:text-stone-500 focus:border-forest-600 focus:outline-none';
const PRIMARY =
  'rounded-xl bg-forest-700 px-4 py-2.5 text-sm font-medium text-cream-50 hover:bg-forest-800 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500';
const SECONDARY =
  'inline-flex items-center gap-2 rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 no-underline hover:bg-stone-100';
const DANGER =
  'inline-flex items-center gap-2 rounded-xl border border-red-300 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60';

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return '—';
  }
}

export default function AccountClient() {
  const supabase = getSupabaseBrowserClient();
  const { region, setRegion, ready: regionReady } = useRegion();
  const { chosenAudience, setAudience, ready: audienceReady } = useAudience();

  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [profileFailed, setProfileFailed] = useState(false);
  const [tab, setTab] = useState<TabId>('personal');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [consentTick, setConsentTick] = useState(false);
  const [consentBusy, setConsentBusy] = useState(false);
  const [consentMsg, setConsentMsg] = useState('');
  const [saved, setSaved] = useState<SavedItemRow[] | null>(null);
  const [savedFailed, setSavedFailed] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteWord, setDeleteWord] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState('');
  const [signingOutAll, setSigningOutAll] = useState(false);
  const deleteInputRef = useRef<HTMLInputElement>(null);
  const savedHeadingRef = useRef<HTMLHeadingElement>(null);
  const dataHeadingRef = useRef<HTMLHeadingElement>(null);
  const deletedHeadingRef = useRef<HTMLHeadingElement>(null);
  const [removeMsg, setRemoveMsg] = useState('');
  const appliedPrefs = useRef(false);
  /** The user id the page has loaded for — SIGNED_IN for the same id is a no-op. */
  const loadedFor = useRef<string | null>(null);
  /** Current device preferences, readable at call time inside `load`. */
  const prefs = useRef({ region, chosenAudience, regionReady, audienceReady });
  prefs.current = { region, chosenAudience, regionReady, audienceReady };

  // ?tab= deep link. useSearchParams (not a one-off read on mount) so that the
  // account popover's "Saved pages" link also works when the visitor is
  // already on /account — that is a soft navigation, the page never remounts.
  const searchParams = useSearchParams();
  useEffect(() => {
    const t = searchParams.get('tab');
    if (isTabId(t)) setTab(t);
  }, [searchParams]);
  const changeTab = (id: string) => {
    if (!isTabId(id)) return;
    setTab(id);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', id);
    url.hash = '';
    // `null` state, exactly as the Next docs show: the router patches
    // replaceState and syncs useSearchParams only for calls that do NOT carry
    // its own internal state object. Passing `window.history.state` here made
    // the router skip the sync, after which the popover's "Saved pages" link
    // changed the URL without changing the tab (verified in-browser, 19 Sep).
    window.history.replaceState(null, '', url);
  };

  const load = useCallback(
    async (client: SupabaseClient) => {
      const {
        data: { user: u },
      } = await client.auth.getUser();
      if (!u) {
        loadedFor.current = null;
        setStatus('signed-out');
        return;
      }
      if (loadedFor.current === u.id) return;
      loadedFor.current = u.id;
      setUser(u);
      setStatus('ready');
      try {
        // Retries the bootstrap for accounts created through a redirect door.
        // No consent version is sent from here: this path is not consent-gated,
        // so a missing record surfaces as the consent step below instead.
        const { region: deviceRegion, chosenAudience: deviceAudience } = prefs.current;
        const row =
          (await ensureProfile(client, u, { preferredRegion: deviceRegion, preferredAudience: deviceAudience })) ??
          (await fetchOwnProfile(client, u.id));
        setProfile(row);
        setName(row?.display_name ?? '');
        setProfileFailed(false);
        // A device without a choice adopts the account's remembered one (once).
        // Only once the providers have read their cookies: before that both
        // values are null and the profile would overwrite a real choice.
        const now = prefs.current;
        if (row && !appliedPrefs.current && now.regionReady && now.audienceReady) {
          appliedPrefs.current = true;
          if (!now.region && row.preferred_region) setRegion(row.preferred_region);
          if (!now.chosenAudience && row.preferred_audience) setAudience(row.preferred_audience);
        }
      } catch {
        // Never render an empty editable form over a real profile.
        setProfileFailed(true);
      }
      const { data, error } = await client
        .from('saved_items')
        .select('kind, slug, title, region, created_at')
        .eq('user_id', u.id)
        .order('created_at', { ascending: false })
        .range(0, 499);
      if (error) setSavedFailed(true);
      else setSaved((data ?? []) as SavedItemRow[]);
    },
    // Device preferences are read through `prefs` (a ref) at call time; the
    // setters are stable. Later preference changes flow through the
    // AuthProvider write-through, not this loader.
    [setRegion, setAudience],
  );

  useEffect(() => {
    if (!supabase) return;
    void load(supabase);
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      // The sign-in sheet (modal variant) never navigates, so a sign-in that
      // starts from this page's own card is picked up here.
      if (event === 'SIGNED_IN') void load(supabase);
      if (event === 'SIGNED_OUT') {
        loadedFor.current = null;
        setUser(null);
        setProfile(null);
        setSaved(null);
        // A self-deletion already switched to the confirmation view — keep it.
        setStatus((st) => (st === 'deleted' ? st : 'signed-out'));
        announceAuthChanged();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase, load]);

  useEffect(() => {
    if (deleteOpen) deleteInputRef.current?.focus();
  }, [deleteOpen]);

  useEffect(() => {
    if (status === 'deleted') deletedHeadingRef.current?.focus();
  }, [status]);

  if (!supabase) {
    return (
      <div className={CARD}>
        <p className="text-sm text-stone-700 leading-relaxed">
          Accounts aren&rsquo;t available on this site yet. Everything else works without one.
        </p>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="space-y-4" role="status" aria-busy="true">
        <span className="sr-only">Loading your account…</span>
        <div className="h-28 animate-pulse rounded-2xl bg-stone-200" aria-hidden="true" />
        <div className="h-40 animate-pulse rounded-2xl bg-stone-200" aria-hidden="true" />
      </div>
    );
  }

  if (status === 'deleted') {
    return (
      <div className={CARD} role="status">
        <h2 ref={deletedHeadingRef} tabIndex={-1} className={`${H2} outline-none`}>
          Your account has been deleted
        </h2>
        <p className="mt-2 text-sm text-stone-700 leading-relaxed">
          Your sign-in, display name, remembered preferences and saved pages are gone, and you are signed out on
          this device. Every guide stays free to read without an account — and you are welcome to create a new one
          any time.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/" className={PRIMARY + ' no-underline'}>
            Back to home
          </Link>
          <Link href="/delete-account" className={SECONDARY}>
            What deletion removes
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'signed-out' || !user) {
    return (
      <div className={CARD}>
        <h2 className={H2}>You&rsquo;re not signed in</h2>
        <p className="mt-2 text-sm text-stone-700 leading-relaxed">
          Sign in to see your saved pages and account settings. An account is optional — every guide is free
          to read without one.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <SignInButton className={PRIMARY}>Sign in or create an account</SignInButton>
          <Link href="/" className={SECONDARY}>
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const onSaveName = async (e: FormEvent) => {
    e.preventDefault();
    if (profileFailed || saving) return;
    const next = cleanDisplayName(name);
    setSaving(true);
    setSaveMsg('');
    try {
      await updateOwnProfile(supabase, user.id, { display_name: next });
      setProfile((p) => (p ? { ...p, display_name: next } : p));
      setName(next);
      setSaveMsg('Saved.');
    } catch {
      setSaveMsg('Could not save your name. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const onAcceptConsent = async (e: FormEvent) => {
    e.preventDefault();
    if (consentBusy) return;
    if (!consentTick) {
      setConsentMsg('Please tick the box to continue.');
      return;
    }
    setConsentBusy(true);
    setConsentMsg('');
    try {
      await acceptConsent(supabase, user.id, CONSENT_VERSION);
      const row = await fetchOwnProfile(supabase, user.id);
      setProfile(row);
    } catch {
      setConsentMsg('Could not record your acceptance. Please try again.');
    } finally {
      setConsentBusy(false);
    }
  };

  const removeSaved = async (item: SavedItemRow) => {
    const prev = saved;
    setSaved((list) => (list ?? []).filter((s) => !(s.kind === item.kind && s.slug === item.slug)));
    // The button that had focus is unmounting with its row: park focus on the
    // panel heading so keyboard users are not dropped to <body>, and announce.
    savedHeadingRef.current?.focus();
    setRemoveMsg(`Removed “${item.title}” from your saved pages.`);
    const { error } = await supabase
      .from('saved_items')
      .delete()
      .eq('user_id', user.id)
      .eq('kind', item.kind)
      .eq('slug', item.slug);
    if (error) {
      setSaved(prev);
      setRemoveMsg(`Could not remove “${item.title}”. Please try again.`);
    }
  };

  // "Sign out" = this device only (scope 'local'), matching the page copy; the
  // separate "everywhere" control revokes every session on every device (the
  // SDK default), which is the right tool after a lost phone — the review found
  // the single button doing the global one while the copy promised the local.
  const signOut = async (scope: 'local' | 'global' = 'local') => {
    if (scope === 'global') setSigningOutAll(true);
    else setSigningOut(true);
    try {
      await supabase.auth.signOut({ scope });
    } catch {
      /* cookies are cleared client-side regardless */
    }
    announceAuthChanged();
    window.location.href = '/';
  };

  // Fetch first, then hand the browser a blob: a plain download link would
  // save the JSON error body of a 401/429/500 as a file, with nothing on-page.
  const exportData = async () => {
    setExporting(true);
    setExportMsg('');
    try {
      const res = await fetch('/api/account/export', { cache: 'no-store' });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setExportMsg(
          res.status === 429
            ? 'You can download your data up to 10 times in 10 minutes — please try again shortly.'
            : data?.error || 'Could not prepare your download. Please try again.',
        );
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `globalstudyboard-account-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setExportMsg('Your download has started.');
    } catch {
      setExportMsg('Could not prepare your download. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const deleteAccount = async (e: FormEvent) => {
    e.preventDefault();
    setDeleteMsg('');
    setDeleting(true);
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: deleteWord }),
      });
      if (res.ok) {
        // The server already revoked every session; the local sign-out only
        // clears this device's cookies. Confirm HERE (an irreversible action
        // deserves a confirmation, and a home-page query parameter nothing
        // read minted a stray URL variant).
        setStatus('deleted');
        loadedFor.current = null;
        try {
          await supabase.auth.signOut({ scope: 'local' });
        } catch {
          /* ignore */
        }
        announceAuthChanged();
        return;
      }
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setDeleteMsg(data?.error || 'Could not delete your account. Please try again or email us.');
    } catch {
      setDeleteMsg('Could not delete your account. Please try again or email us.');
    } finally {
      setDeleting(false);
    }
  };

  const providers = Array.from(
    new Set((user.identities ?? []).map((i) => (i.provider === 'email' ? 'e-mail' : i.provider === 'google' ? 'Google' : i.provider))),
  );
  const verified = Boolean(user.email_confirmed_at || user.confirmed_at);
  const rememberedRegion = profile?.preferred_region ? getRegionBySlug(profile.preferred_region)?.displayName : null;
  const rememberedAudience = profile?.preferred_audience
    ? profile.preferred_audience === 'domestic'
      ? 'Domestic student'
      : 'International student'
    : null;
  // Only once the profile row is known: while it is still loading `profile`
  // is null and consentNeedsRefresh(undefined) is true, which flashed the
  // consent card on every load (independent review).
  const needsConsent = !profileFailed && profile !== null && consentNeedsRefresh(profile.consent_version);

  return (
    <div className="space-y-5">
      {/* Identity row */}
      <section className={CARD} aria-labelledby="acct-identity">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-700 text-cream-50">
            <UserRound className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id="acct-identity" className={H2}>
              {profile?.display_name ? profile.display_name : 'My account'}
            </h2>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-stone-700 m-0">
              <span className="truncate" translate="no">
                {user.email}
              </span>
              {verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-forest-50 px-2 py-0.5 text-xs font-semibold text-forest-800">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Verified
                </span>
              )}
            </p>
            <p className="mt-1 text-xs text-stone-600 m-0">
              Signed in with {providers.join(' and ') || 'e-mail'} · Member since {formatDate(user.created_at)}
            </p>
          </div>
        </div>
      </section>

      {needsConsent ? (
        <form onSubmit={onAcceptConsent} className={`${CARD} border-terracotta-200`} aria-labelledby="acct-consent">
          <h2 id="acct-consent" className={H2}>
            {profile?.consent_version ? 'Our terms have been updated' : 'One thing before you continue'}
          </h2>
          <p className="mt-2 text-sm text-stone-700 leading-relaxed">
            {profile?.consent_version
              ? 'The Terms of Use and Privacy Policy were revised since you last accepted them. Please read and accept the current versions to keep using your account.'
              : 'We have no record of you accepting our terms for this account — it may have been created without the usual sign-in step. Please confirm before continuing.'}
          </p>
          <label className="mt-4 flex items-start gap-2 text-sm text-stone-800 leading-relaxed">
            <input
              type="checkbox"
              checked={consentTick}
              onChange={(e) => {
                setConsentTick(e.target.checked);
                if (e.target.checked) setConsentMsg('');
              }}
              className="mt-0.5 h-4 w-4 shrink-0 accent-forest-700"
            />
            <span>
              I am 18 or older, I agree to the{' '}
              <Link href="/terms" className="font-semibold text-forest-700 underline underline-offset-2" prefetch={false}>
                Terms of Use
              </Link>{' '}
              and I have read the{' '}
              <Link href="/privacy" className="font-semibold text-forest-700 underline underline-offset-2" prefetch={false}>
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          <p role="status" aria-live="polite" className="mt-2 min-h-[1rem] text-xs font-medium text-red-600">
            {consentMsg}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="submit" aria-busy={consentBusy || undefined} className={PRIMARY}>
              {consentBusy ? 'Saving…' : 'Accept and continue'}
            </button>
            <button type="button" onClick={() => void signOut('local')} className={SECONDARY}>
              Sign out instead
            </button>
          </div>
        </form>
      ) : (
        <>
          <AccountTabs tabs={TABS} activeId={tab} onChange={changeTab} />

          {/* Personal details */}
          <section
            id={tabPanelId('personal')}
            role="tabpanel"
            aria-labelledby={tabButtonId('personal')}
            hidden={tab !== 'personal'}
            className={CARD}
          >
            <h2 className={H2}>Personal details</h2>
            <form onSubmit={onSaveName} className="mt-4">
              <label htmlFor="acct-name" className="block text-xs font-semibold uppercase tracking-wide text-stone-700">
                Display name <span className="font-normal normal-case text-stone-500">(optional)</span>
              </label>
              <input
                id="acct-name"
                type="text"
                autoComplete="name"
                maxLength={DISPLAY_NAME_MAX}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={profileFailed}
                placeholder="How should we address you?"
                aria-describedby="acct-name-status"
                className={INPUT}
              />
              <p id="acct-name-status" role="status" aria-live="polite" className="mt-1.5 min-h-[1rem] text-xs leading-relaxed">
                {profileFailed ? (
                  <span className="font-medium text-red-600">
                    We couldn&rsquo;t load your profile just now, so editing is paused. Reload to try again.
                  </span>
                ) : saveMsg ? (
                  <span className={saveMsg === 'Saved.' ? 'font-medium text-forest-700' : 'font-medium text-red-600'}>{saveMsg}</span>
                ) : (
                  <span className="text-stone-600">
                    Seen only by you and, for support, by us — never shown to other visitors. Up to {DISPLAY_NAME_MAX}{' '}
                    characters.
                  </span>
                )}
              </p>
              {/* Not `disabled` while saving: Chrome moves focus to <body> the
                  moment a focused button is disabled, so the busy state is
                  aria-busy + a guard in the handler instead. */}
              <button
                type="submit"
                disabled={profileFailed || (!saving && cleanDisplayName(name) === (profile?.display_name ?? ''))}
                aria-busy={saving || undefined}
                className={`${PRIMARY} mt-2`}
              >
                {saving ? 'Saving…' : 'Save name'}
              </button>
            </form>

            <dl className="mt-5 grid gap-3 border-t border-stone-200 pt-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-stone-600">Remembered destination</dt>
                <dd className="mt-0.5 text-sm text-stone-800">{rememberedRegion ?? 'Not set — showing India by default'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-stone-600">Studying as</dt>
                <dd className="mt-0.5 text-sm text-stone-800">{rememberedAudience ?? 'Not set — using each page’s default'}</dd>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed sm:col-span-2 m-0">
                Change these with the destination control in the header and the toggle under it. Your account saves
                the choice whenever you change it while signed in, and a device with no choice adopts the saved one
                when you sign in there.
              </p>
            </dl>

            <dl className="mt-4 grid gap-3 border-t border-stone-200 pt-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-stone-600">Terms accepted</dt>
                <dd className="mt-0.5 text-sm text-stone-800">
                  {profile?.consent_tos_at ? `${formatDate(profile.consent_tos_at)} (version ${profile.consent_version})` : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-stone-600">Account e-mail</dt>
                <dd className="mt-0.5 truncate text-sm text-stone-800" translate="no">
                  {user.email}
                </dd>
              </div>
            </dl>
          </section>

          {/* Saved pages */}
          <section
            id={tabPanelId('saved')}
            role="tabpanel"
            aria-labelledby={tabButtonId('saved')}
            hidden={tab !== 'saved'}
            className={CARD}
          >
            <h2 ref={savedHeadingRef} tabIndex={-1} className={`${H2} outline-none`}>
              Saved pages
            </h2>
            <p role="status" aria-live="polite" className="min-h-[1rem] text-xs text-stone-700 m-0">
              {removeMsg}
            </p>
            {savedFailed ? (
              <p className="mt-3 text-sm text-red-700">We couldn&rsquo;t load your saved pages. Reload to try again.</p>
            ) : saved === null ? (
              <div className="mt-3 h-16 animate-pulse rounded-xl bg-stone-200" />
            ) : saved.length === 0 ? (
              <p className="mt-3 text-sm text-stone-700 leading-relaxed">
                Nothing saved yet. Use <strong>Save</strong> on any guide, university or exam page to build your
                shortlist here.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-stone-200 list-none p-0 m-0">
                {saved.map((item) => (
                  <li key={`${item.kind}:${item.slug}`} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <Link
                        href={savedItemHref(item.kind, item.slug)}
                        className="block truncate text-sm font-semibold text-forest-800 no-underline hover:underline"
                      >
                        {item.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-stone-600 m-0">
                        {SAVED_KIND_LABEL[item.kind]}
                        {item.region && item.region !== 'global' ? ` · ${getRegionBySlug(item.region)?.displayName ?? ''}` : ''}
                        {' · saved '}
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void removeSaved(item)}
                      aria-label={`Remove ${item.title} from saved pages`}
                      className="shrink-0 rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-red-700"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Data & account */}
          <section
            id={tabPanelId('data')}
            role="tabpanel"
            aria-labelledby={tabButtonId('data')}
            hidden={tab !== 'data'}
            className={CARD}
          >
            <h2 ref={dataHeadingRef} tabIndex={-1} className={`${H2} outline-none`}>
              Data &amp; account
            </h2>
            <p className="mt-2 text-sm text-stone-700 leading-relaxed">
              Download everything we store about your account as a JSON file, sign out of this device (or of every
              device at once), or delete the account permanently.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => void exportData()} disabled={exporting} className={SECONDARY}>
                <Download className="h-4 w-4" aria-hidden="true" /> {exporting ? 'Preparing…' : 'Download my data'}
              </button>
              <button type="button" onClick={() => void signOut('local')} disabled={signingOut || signingOutAll} className={SECONDARY}>
                <LogOut className="h-4 w-4" aria-hidden="true" /> {signingOut ? 'Signing out…' : 'Sign out'}
              </button>
              <button
                type="button"
                onClick={() => void signOut('global')}
                disabled={signingOut || signingOutAll}
                className={SECONDARY}
                title="Ends your session on every device and browser you are signed in on"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" /> {signingOutAll ? 'Signing out…' : 'Sign out everywhere'}
              </button>
              {!deleteOpen && (
                <button type="button" onClick={() => setDeleteOpen(true)} className={DANGER}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete account
                </button>
              )}
            </div>
            <p role="status" aria-live="polite" className="mt-2 min-h-[1rem] text-xs text-stone-700 m-0">
              {exportMsg}
            </p>

            {deleteOpen && (
              <form onSubmit={deleteAccount} className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                <h3 className="text-sm font-bold text-red-800">Delete your account permanently?</h3>
                <p className="mt-1 text-xs text-stone-700 leading-relaxed">
                  This removes your sign-in, display name, remembered preferences and saved pages immediately. It
                  cannot be undone. Type <strong>DELETE</strong> to confirm.
                </p>
                <label htmlFor="acct-delete-word" className="sr-only">
                  Type DELETE to confirm
                </label>
                <input
                  id="acct-delete-word"
                  ref={deleteInputRef}
                  type="text"
                  autoComplete="off"
                  value={deleteWord}
                  onChange={(e) => setDeleteWord(e.target.value)}
                  placeholder="DELETE"
                  aria-describedby="acct-delete-status"
                  className={INPUT}
                />
                <p id="acct-delete-status" role="status" aria-live="polite" className="mt-1.5 min-h-[1rem] text-xs">
                  {deleteMsg && <span className="font-medium text-red-700">{deleteMsg}</span>}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={deleting || deleteWord.trim().toUpperCase() !== 'DELETE'}
                    className="rounded-xl bg-red-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500"
                  >
                    {deleting ? 'Deleting…' : 'Delete my account'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteOpen(false);
                      setDeleteWord('');
                      setDeleteMsg('');
                      // The form (and this button) unmounts: park focus on the panel heading.
                      dataHeadingRef.current?.focus();
                    }}
                    className={SECONDARY}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            <p className="mt-4 text-xs text-stone-600 leading-relaxed">
              Prefer to ask by e-mail, or can&rsquo;t sign in? See{' '}
              <Link href="/delete-account" className="underline underline-offset-2 hover:text-forest-700">
                Delete your account
              </Link>
              .
            </p>
          </section>
        </>
      )}

      <LastUpdated date={SITE_REVIEWED} />
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { LogIn, RotateCw } from 'lucide-react';
import SignInButton from '@/components/auth/SignInButton';
import { OFFLINE_ON_LOAD, OFFLINE_TITLE, consumeToolSessionEnded } from '@/lib/auth-events';

/**
 * The states every tool gate shares (constitution §18): the skeleton while the
 * chunk, the sign-in check or the first read is pending, the sign-in card for
 * a signed-out visitor, the notice shown when accounts are not configured, and
 * the ones shown when the tool's first read could not reach the server, failed
 * for another reason, or found the tool's tables not yet created — and the card
 * a gate falls back to when the tool's own chunk could not be downloaded.
 * Kept SDK-free — this chunk is part of the public page; the Supabase SDK
 * arrives only inside a tool's own lazily loaded chunk.
 */

export function ToolSkeleton({ label }: { label: string }) {
  // motion-safe: the pulse is opacity only (not a WCAG 2.3.3 motion), but the
  // house rule (§15.2) honours prefers-reduced-motion for every animation.
  return (
    <div className="space-y-3" role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      <div className="h-20 rounded-2xl bg-stone-200 motion-safe:animate-pulse" aria-hidden="true" />
      <div className="h-40 rounded-2xl bg-stone-200 motion-safe:animate-pulse" aria-hidden="true" />
    </div>
  );
}

/**
 * What to do when a first read keeps failing — the same sentence in every tool
 * and report. It names the site's feedback control by its visible label
 * ("Share feedback" is in the footer of every page, the mobile menu and the
 * quick-actions dock), never a generic "the feedback button".
 */
export const LOAD_FAILED_HELP = 'Reload the page. If it keeps happening, try again later or tell us with “Share feedback” at the foot of the page.';

// A load failure is announced as an alert (it replaces the loading skeleton and
// the student cannot go on), an informational state as a status — the same
// roles on the tool pages and on their report pages (ReportStates).

/** The tool's first read could not reach the server. Nothing was signed out (the session check said so). */
export function ToolOffline() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 text-sm leading-relaxed text-stone-700 shadow-sm" role="alert">
      <h2 className="m-0 font-display text-xl font-bold tracking-editorial text-ink">{OFFLINE_TITLE}</h2>
      <p className="m-0 mt-2">{OFFLINE_ON_LOAD}</p>
    </div>
  );
}

/** The tool's first read failed for a reason that is neither the connection nor the session. */
export function ToolLoadError({ what }: { what: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 text-sm leading-relaxed text-stone-700 shadow-sm" role="alert">
      <h2 className="m-0 font-display text-xl font-bold tracking-editorial text-ink">We couldn&rsquo;t load your {what}</h2>
      <p className="m-0 mt-2">{LOAD_FAILED_HELP}</p>
    </div>
  );
}

/** Reloads the page — the one retry that works once a chunk failed (the lazy import keeps its first answer for the life of the page). */
export function ReloadPageButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="inline-flex h-11 items-center gap-2 rounded-full bg-forest-700 px-5 text-sm font-semibold text-cream-50 transition-colors hover:bg-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2"
    >
      <RotateCw className="h-4 w-4" aria-hidden="true" /> Reload page
    </button>
  );
}

/** Why a tool's chunk could not be downloaded (ToolChunkFailed), and what to do if a reload does not help — the latter shared with app/tools/error.tsx. */
export const CHUNK_FAILED_TEXT =
  'Your browser could not download it — usually because the connection dropped, or because the site was updated while this page was open. Nothing you saved has changed.';
export const CHUNK_FAILED_HELP = 'If reloading does not help, try again later or tell us with “Share feedback” at the foot of the page.';

/**
 * What a gate renders in place of its tool (or report) when the tool's chunk
 * could not be downloaded — a dropped connection, or a chunk a redeploy has
 * replaced. `next/dynamic` is `React.lazy`, so without this fallback the
 * rejected import was thrown during render and, with no error boundary, Next
 * replaced the WHOLE document — header, heading, footer and the site disclaimer
 * — with its bare "Application error" (independent review, CRIT2-1).
 *
 * Every gate imports it STATICALLY and returns it from the loader's `.catch`:
 * a second dynamic import would fail the same way offline. It ignores the
 * props the tool would have received.
 */
export function ToolChunkFailed() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 text-sm leading-relaxed text-stone-700 shadow-sm" role="alert">
      <h2 className="m-0 font-display text-xl font-bold tracking-editorial text-ink">This part of the page did not load</h2>
      <p className="m-0 mt-2">{CHUNK_FAILED_TEXT}</p>
      <p className="m-0 mt-2">{CHUNK_FAILED_HELP}</p>
      <div className="mt-4">
        <ReloadPageButton />
      </div>
    </div>
  );
}

/** The tool's tables are not created yet (its migration has not run). */
export function ToolSetup({ name }: { name: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 text-sm leading-relaxed text-stone-700 shadow-sm" role="status">
      {name} is being switched on for your account right now — please check back in a little while. Nothing you have entered elsewhere on the site is
      affected.
    </div>
  );
}

/**
 * A tool's first read found the session gone. The check has already signed the
 * device out and told the chrome, so the gate normally swaps in the sign-in card
 * at once; this is the fallback so the page never sits on a spinner if it does not.
 */
export function ToolSessionEnded() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 text-sm leading-relaxed text-stone-700 shadow-sm" role="alert">
      <h2 className="m-0 font-display text-xl font-bold tracking-editorial text-ink">Your session ended</h2>
      <p className="m-0 mt-2">You were signed out on this device. Sign in again to see your saved work — nothing you saved has changed.</p>
      <div className="mt-4">
        <SignInButton
          intent="tools"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-forest-700 px-5 text-sm font-semibold text-cream-50 transition-colors hover:bg-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2"
        >
          <LogIn className="h-4 w-4" aria-hidden="true" /> Sign in again
        </SignInButton>
      </div>
    </div>
  );
}

export function ToolUnavailable() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-cream-50 p-6 text-sm leading-relaxed text-stone-700">
      Tools need a GlobalStudyBoard account, and accounts are not available right now. Please check back soon.
    </div>
  );
}

export function ToolSignInCard({ title, intro }: { title: string; intro: string }) {
  // Read once on mount: true only when a tool on THIS page just found its session gone.
  const [ended] = useState(consumeToolSessionEnded);
  const noticeRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (ended) noticeRef.current?.focus();
  }, [ended]);
  return (
    <div className="rounded-2xl border border-forest-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mx-auto max-w-xl text-center">
        {ended && (
          <p ref={noticeRef} tabIndex={-1} className="mb-4 rounded-xl border border-terracotta-200 bg-terracotta-50 px-4 py-3 text-sm text-terracotta-800 focus:outline-none">
            Your session ended, so you were signed out on this device. Anything you had not saved was not kept — sign in again to continue.
          </p>
        )}
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-forest-50 text-forest-700">
          <LogIn className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-display text-2xl font-bold tracking-editorial text-ink">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-700">{intro}</p>
        <div className="mt-5">
          <SignInButton
            intent="tools"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-forest-700 px-5 text-sm font-semibold text-cream-50 transition-colors hover:bg-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" /> Sign in or create a free account
          </SignInButton>
        </div>
        <p className="mt-3 text-xs text-stone-600">Accounts are for people aged 18 or over.</p>
      </div>
    </div>
  );
}

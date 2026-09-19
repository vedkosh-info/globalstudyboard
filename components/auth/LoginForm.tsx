'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { KeyRound, Mail } from 'lucide-react';
import { useRegion } from '@/components/RegionProvider';
import { useAudience } from '@/components/AudienceProvider';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { emailDeliversCode, isGoogleAuthEnabled } from '@/lib/supabase/config';
import { ensureProfile, type ProfileRow } from '@/lib/supabase/profile';
import {
  announceAuthChanged,
  clearResumeIntent,
  clearSignInPending,
  markSignInPending,
  stashResumeIntent,
  type SignInIntent,
} from '@/lib/auth-events';
import { CONSENT_VERSION, clearConsentMarker, markConsentGiven } from '@/lib/consent';
import { safeNextPath } from '@/lib/security/safe-next';

/**
 * LoginForm — the ONE sign-in / sign-up implementation, shared by the /login page
 * (variant 'page') and the contextual sheet (variant 'modal').
 *
 * Passwordless: an e-mail one-time code (or the sign-in link in the same e-mail)
 * and, once the owner enables the provider, Google. Sign-up IS sign-in: the same
 * signInWithOtp call creates the account on first use (shouldCreateUser).
 *
 * Load-bearing behaviours (learned in VedKosh production — do not "simplify"):
 *  - The code check is /^\d{6,10}$/. The length is a Supabase PROJECT setting; a
 *    form hard-pinned to 6 silently blocked every sign-up when the project said 8.
 *  - A 429 on send means a code is ALREADY in the inbox: surface the real reason,
 *    start the 60 s cooldown and still advance to the code step.
 *  - Every new code invalidates the previous one, so the cooldown must be ≥ the
 *    60 s Supabase floor and the code field is cleared on resend.
 *  - The consent checkbox gates BOTH doors, and only these doors send the
 *    consent version the database stamps (migration 0001): the code door passes
 *    it to ensureProfile(); the Google door leaves a short-lived cookie that the
 *    /auth/callback route reads, because the redirect discards in-memory state.
 *  - Modal variant never navigates on success (cookies are already written
 *    client-side, so the caller's next fetch carries them); the page variant does
 *    a full navigation so the destination page starts from the fresh cookies.
 */

// Same validator as the tester-invite form (one rule for the whole site).
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@.]+(\.[^\s@.]+)+$/;

const INPUT =
  'mt-1.5 w-full rounded-xl border bg-white px-3 py-2.5 font-sans text-base sm:text-sm text-stone-800 placeholder:text-stone-500 focus:outline-none';
const INPUT_OK = 'border-stone-450 focus:border-forest-600';
const INPUT_ERR = 'border-red-500 focus:border-red-600';
const LABEL = 'block text-xs font-semibold text-stone-700 uppercase tracking-wide';
const PRIMARY =
  'mt-4 w-full rounded-xl bg-forest-700 text-cream-50 text-sm font-medium py-2.5 hover:bg-forest-800 disabled:bg-stone-200 disabled:text-stone-500 disabled:cursor-not-allowed';
const GHOST =
  'inline-flex min-h-11 items-center px-1 text-xs font-semibold text-stone-600 underline-offset-2 hover:text-forest-800 hover:underline disabled:cursor-not-allowed disabled:text-stone-400 disabled:no-underline';

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.2C12.4 13.4 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.6-4.9 7.3l7.6 5.9c4.5-4.2 7.1-10.3 7.1-17.7z" />
      <path fill="#FBBC05" d="M10.5 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.9-6.2C.9 16.5 0 20.1 0 24s.9 7.5 2.6 10.8l7.9-6.2z" />
      <path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.3-5.6l-7.6-5.9c-2.1 1.4-4.8 2.3-7.7 2.3-6.3 0-11.6-3.9-13.5-9.4l-7.9 6.2C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

/**
 * Policy links. Inside the sheet they open in a new tab: a same-tab navigation
 * would close the sheet as 'dismissed' and discard the typed e-mail and any
 * pending action (WCAG G201: the new-tab behaviour is announced).
 */
function PolicyLink({ href, modal, children }: { href: string; modal: boolean; children: React.ReactNode }) {
  const cls = 'font-semibold text-forest-700 underline underline-offset-2';
  if (modal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={href} className={cls} prefetch={false}>
      {children}
    </Link>
  );
}

export interface LoginFormProps {
  variant: 'page' | 'modal';
  /** Same-origin path to return to after sign-in (re-validated by /auth/callback). */
  next?: string;
  /** modal only: fires after a successful code sign-in (no navigation). */
  onSuccess?: () => void;
  /** modal only: intent stashed across the Google redirect so the page can resume. */
  resumeIntent?: SignInIntent;
  /** id for the heading (aria-labelledby wiring when hosted in a dialog). */
  headingId?: string;
  /** A notice from the URL (e.g. a failed link), shown above the form. */
  notice?: string;
}

export default function LoginForm({ variant, next, onSuccess, resumeIntent, headingId, notice }: LoginFormProps) {
  const supabase = getSupabaseBrowserClient();
  const googleEnabled = isGoogleAuthEnabled();
  const codeMode = emailDeliversCode();
  const { region, setRegion } = useRegion();
  const { chosenAudience, setAudience } = useAudience();

  const [step, setStep] = useState<'email' | 'sent'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusyState] = useState(false);
  // Synchronous latch behind the `busy` state: two Enter presses inside one
  // event loop turn both read the stale closure's `busy === false` (React has
  // not re-rendered yet), which sent two OTP e-mails in testing. The ref flips
  // the instant a handler starts, so the second call returns before any I/O.
  const busyRef = useRef(false);
  const setBusy = (v: boolean) => {
    busyRef.current = v;
    setBusyState(v);
  };
  const [error, setError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  /** Seconds left before "Resend" re-enables (0 = enabled). */
  const [resendIn, setResendIn] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const sentHeadingRef = useRef<HTMLHeadingElement>(null);
  const noticeRef = useRef<HTMLParagraphElement>(null);

  const cleanEmail = email.trim().toLowerCase();
  // Per-instance ids: the sheet can open on top of /login's own form, and two
  // identical literal ids would leave the sheet's field unlabelled (WCAG 1.3.1).
  const uid = useId();
  const emailId = `${uid}-email`;
  const codeId = `${uid}-code`;
  const statusId = `${uid}-status`;
  const emailValid = EMAIL_RE.test(cleanEmail) && cleanEmail.length <= 254;
  const showEmailError = emailTouched && email.trim().length > 0 && !emailValid;

  // In the sheet the form arrives after the dialog frame, so move focus from the
  // panel to the e-mail field once mounted (the page variant lands there too).
  // Exception: a failure notice (/login?error=…) takes focus first — a live
  // region present at page load is not announced, and focusing straight past
  // it would hide the explanation from screen-reader users.
  useEffect(() => {
    if (noticeRef.current) noticeRef.current.focus();
    else emailRef.current?.focus();
  }, []);

  // Move focus the moment the "sent" step appears (WCAG 2.4.3): without this,
  // focus dies on the now-unmounted send button. In CODE mode the code field is
  // the right target; in LINK mode that field sits inside a closed <details>
  // and cannot take focus, so the step heading ("Check your e-mail") takes it
  // instead and is announced — an independent review caught focus landing on
  // <body> with nothing spoken in the link-mode (launch default) path.
  useEffect(() => {
    if (step !== 'sent') return;
    if (codeMode) codeRef.current?.focus();
    else sentHeadingRef.current?.focus();
  }, [step, codeMode]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  if (!supabase) {
    return (
      <p role="status" className="mt-3 text-sm text-stone-700 leading-relaxed">
        Accounts aren&rsquo;t available on this site yet. Everything else works without one.
      </p>
    );
  }

  // The page shell owns the <h1> ("Sign in"), so on /login the step heading is
  // an h2. In the sheet the frame already provides an sr-only h2 as the dialog's
  // accessible name; a second h2 with the same text read as a duplicate heading
  // to screen readers (live IQA, 19 Sep), so there the step heading is a
  // paragraph that still takes focus on the "sent" step.
  const Heading = (variant === 'modal' ? 'p' : 'h2') as 'p' | 'h2';
  const callbackUrl = () =>
    `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}`;

  const guardConsent = (): boolean => {
    if (!consent) {
      setError('Please confirm you are 18 or older and agree to the terms to continue.');
      return false;
    }
    return true;
  };

  const sendCode = async () => {
    if (busyRef.current) return; // Enter in the field reaches here even while the button is disabled
    setError('');
    setEmailTouched(true);
    if (!emailValid) {
      setError('Please enter a valid e-mail address.');
      emailRef.current?.focus();
      return;
    }
    if (!guardConsent()) return;
    // The e-mail may be used as a LINK (a redirect through /auth/callback that
    // discards in-memory state) even in code mode, so treat this door like
    // Google: stash the pending action for the landing page and mark the
    // sign-in as pending. finishSignIn() clears both when the CODE path
    // completes in place, so neither fires spuriously later.
    setBusy(true);
    if (variant === 'modal' && resumeIntent) stashResumeIntent(resumeIntent, next ?? window.location.pathname);
    markSignInPending();
    markConsentGiven();
    const { error: err } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: { shouldCreateUser: true, emailRedirectTo: callbackUrl() },
    });
    setBusy(false);
    if (err) {
      const status = (err as { status?: number }).status;
      const errCode = (err as { code?: string }).code ?? '';
      if (status === 429 || /rate|frequency|too many/i.test(`${errCode} ${err.message}`)) {
        // A code is already on its way — do not make them think login is broken.
        setResendIn(60);
        setError('Please wait a moment before asking for another e-mail — the last one is still on its way.');
        if (step === 'email') setStep('sent');
        return;
      }
      setError('We could not send the e-mail. Please check the address and try again.');
      return;
    }
    setCode('');
    setResendIn(60);
    setStep('sent');
  };

  const finishSignIn = async (userId: string, profile: ProfileRow | null) => {
    // Preference sync at sign-in: a device with no choice adopts the account's
    // remembered one; a device with a choice keeps it (ensureProfile already
    // seeded a brand-new account from this device's cookies).
    if (profile) {
      if (!region && profile.preferred_region) setRegion(profile.preferred_region);
      if (!chosenAudience && profile.preferred_audience) setAudience(profile.preferred_audience);
    }
    void userId;
    clearConsentMarker(); // the code door recorded consent directly; the cookie was for the redirect doors
    clearSignInPending(); // completed in place — the landing-page marker must not fire later
    clearResumeIntent(); // the caller resumes through the sheet's verdict, not the stash
    announceAuthChanged();
    if (variant === 'modal') {
      onSuccess?.();
      return;
    }
    // Origin-compared, never a prefix check (see lib/security/safe-next.ts).
    window.location.href = safeNextPath(next, window.location.origin);
  };

  const verifyCode = async () => {
    if (busyRef.current) return;
    setError('');
    const token = code.trim();
    if (!/^\d{6,10}$/.test(token)) {
      setError('Enter the code from the e-mail — digits only.');
      codeRef.current?.focus();
      return;
    }
    setBusy(true);
    const { data, error: err } = await supabase.auth.verifyOtp({ email: cleanEmail, token, type: 'email' });
    if (err || !data.user) {
      setBusy(false);
      setError('That code is invalid or has expired. Request a new one and try again.');
      codeRef.current?.focus();
      return;
    }
    let profile: ProfileRow | null = null;
    try {
      profile = await ensureProfile(supabase, data.user, {
        preferredRegion: region,
        preferredAudience: chosenAudience,
        consentVersion: CONSENT_VERSION, // this door is consent-gated (guardConsent above)
      });
    } catch {
      // Not fatal — /account retries profile creation on load. Sign-in succeeded.
    }
    await finishSignIn(data.user.id, profile);
  };

  const loginWithGoogle = async () => {
    if (busyRef.current) return;
    setError('');
    if (!guardConsent()) return;
    if (variant === 'modal' && resumeIntent) stashResumeIntent(resumeIntent, next ?? window.location.pathname);
    // The redirect discards in-memory state: leave the consent signal for the
    // callback (cookie) and a "fresh sign-in" marker for the landing page.
    markConsentGiven();
    markSignInPending();
    setBusy(true);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl() },
    });
    if (err) {
      setBusy(false);
      setError('Google sign-in could not start. Please try again or use your e-mail.');
    }
    // On success the browser navigates away to Google.
  };

  return (
    <>
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest-700 text-cream-50">
          {step === 'sent' ? <KeyRound className="h-4 w-4" aria-hidden="true" /> : <Mail className="h-4 w-4" aria-hidden="true" />}
        </span>
        <div>
          <Heading
            id={headingId}
            ref={sentHeadingRef}
            tabIndex={-1}
            className="font-display text-lg leading-tight text-forest-800 outline-none"
          >
            {step === 'sent' ? 'Check your e-mail' : 'Sign in or create your account'}
          </Heading>
          <p className="mt-1 text-sm text-stone-700 leading-relaxed">
            {step === 'sent'
              ? codeMode
                ? 'We sent a one-time code to'
                : 'We sent a sign-in link to'
              : 'No password — we e-mail you a one-time sign-in. Save guides and universities, and keep your study destination across devices.'}
            {step === 'sent' && <span className="font-semibold text-stone-800"> {cleanEmail}</span>}
          </p>
        </div>
      </div>

      {notice && step === 'email' && (
        <p
          ref={noticeRef}
          tabIndex={-1}
          role="status"
          className="mt-3 rounded-xl border border-terracotta-200 bg-terracotta-50 px-3 py-2 text-xs text-stone-800 leading-relaxed outline-none"
        >
          {notice}
        </p>
      )}

      {step === 'email' ? (
        <div className="mt-4">
          <label htmlFor={emailId} className={LABEL}>
            E-mail address
          </label>
          <input
            id={emailId}
            ref={emailRef}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void sendCode();
            }}
            placeholder="you@example.com"
            aria-invalid={showEmailError || undefined}
            aria-describedby={statusId}
            className={`${INPUT} ${showEmailError ? INPUT_ERR : INPUT_OK}`}
          />

          <label className="mt-4 flex items-start gap-2 text-xs text-stone-700 leading-relaxed">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                if (e.target.checked) setError('');
              }}
              className="mt-0.5 h-4 w-4 shrink-0 accent-forest-700"
            />
            <span>
              I am 18 or older, I agree to the{' '}
              <PolicyLink href="/terms" modal={variant === 'modal'}>
                Terms of Use
              </PolicyLink>{' '}
              and I have read the{' '}
              <PolicyLink href="/privacy" modal={variant === 'modal'}>
                Privacy Policy
              </PolicyLink>
              .
            </span>
          </label>

          <p id={statusId} role="status" aria-live="polite" className="mt-2 min-h-[1rem] text-xs leading-relaxed">
            {error ? (
              <span className="font-medium text-red-600">{error}</span>
            ) : showEmailError ? (
              <span className="font-medium text-red-600">Please enter a valid e-mail address.</span>
            ) : (
              <span className="text-stone-600">We only use your address to sign you in and to run your account.</span>
            )}
          </p>

          <button type="button" onClick={() => void sendCode()} aria-busy={busy || undefined} className={PRIMARY}>
            {busy ? 'Sending…' : codeMode ? 'E-mail me a sign-in code' : 'E-mail me a sign-in link'}
          </button>

          {/* Rendered ONLY once the provider is enabled in Supabase — see isGoogleAuthEnabled(). */}
          {googleEnabled && (
            <>
              <div className="my-4 flex items-center gap-3" aria-hidden="true">
                <span className="h-px flex-1 bg-stone-200" />
                <span className="text-xs text-stone-600">or</span>
                <span className="h-px flex-1 bg-stone-200" />
              </div>
              <button
                type="button"
                onClick={() => void loginWithGoogle()}
                aria-busy={busy || undefined}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm font-medium text-stone-800 hover:bg-stone-100 disabled:cursor-not-allowed disabled:text-stone-500"
              >
                <GoogleGlyph /> Continue with Google
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="mt-4">
          {codeMode ? (
            <>
              <label htmlFor={codeId} className={LABEL}>
                One-time code
              </label>
              <input
                id={codeId}
                ref={codeRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={10}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void verifyCode();
                }}
                placeholder="••••••"
                aria-describedby={statusId}
                className={`${INPUT} ${INPUT_OK} text-center text-lg tracking-[0.4em]`}
              />
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                Can&rsquo;t see it? Check your spam or promotions folder. Only the newest code works.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-stone-800 leading-relaxed">
                Open the e-mail <strong>in this same browser</strong> and tap its link — <strong>Sign in</strong>, or{' '}
                <strong>Confirm email address</strong> the very first time — and it brings you straight back here,
                signed in. The link works once, expires in 15 minutes, and only works in the browser that asked
                for it (a different app or phone will not sign you in).
              </p>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                Can&rsquo;t see it? Check your spam or promotions folder. Only the newest e-mail works.
              </p>
              <details className="mt-3 rounded-xl border border-stone-200 bg-white px-3 py-2">
                <summary className="cursor-pointer text-xs font-semibold text-stone-700">
                  The e-mail shows a code instead?
                </summary>
                <label htmlFor={codeId} className={`${LABEL} mt-2`}>
                  One-time code
                </label>
                <input
                  id={codeId}
                  ref={codeRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={10}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void verifyCode();
                  }}
                  placeholder="••••••"
                  aria-describedby={statusId}
                  className={`${INPUT} ${INPUT_OK} text-center text-lg tracking-[0.4em]`}
                />
                <button type="button" onClick={() => void verifyCode()} disabled={!code} aria-busy={busy || undefined} className={`${PRIMARY} mt-3`}>
                  {busy ? 'Checking…' : 'Verify code'}
                </button>
              </details>
            </>
          )}

          <p id={statusId} role="status" aria-live="polite" className="mt-2 min-h-[1rem] text-xs leading-relaxed">
            {error && <span className="font-medium text-red-600">{error}</span>}
          </p>

          {codeMode && (
            <button type="button" onClick={() => void verifyCode()} aria-busy={busy || undefined} className={PRIMARY}>
              {busy ? 'Checking…' : 'Verify & sign in'}
            </button>
          )}

          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setCode('');
                setError('');
                // This button unmounts with the step: land on the e-mail field
                // (the thing "Change e-mail" is about) once it has rendered.
                window.requestAnimationFrame(() => emailRef.current?.focus());
              }}
              className={GHOST}
            >
              Change e-mail
            </button>
            <button type="button" onClick={() => void sendCode()} disabled={resendIn > 0} aria-busy={busy || undefined} className={GHOST}>
              {resendIn > 0 ? `Resend (${resendIn}s)` : 'Resend e-mail'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

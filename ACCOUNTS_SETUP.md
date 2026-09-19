# GlobalStudyBoard — Accounts (login + user management): owner runbook

**Status (19 Sep 2026, later):** code complete, independently reviewed (63-agent adversarial
QA, 57 fixes), verified end-to-end locally and on the live site; Supabase project provisioned
and configured; **accounts are LIVE in production (owner decision) in e-mail-LINK mode on the
built-in mailer** — Gate A (custom SMTP) is the one gate that now affects real visitors. Release
gates are listed in order — each one is a policy or reliability requirement, not a nicety.

**Where each gate stands (19 Sep 2026) and why the rest is yours:** every remaining step is
either an *account you must own* (Resend, Google Cloud, Supabase ownership — GSB services must
live under contact@globalstudyboard.com, and only you can create or sign into that identity), a
*credential paste* (the Resend API key into Supabase SMTP, the Google client secret into
Supabase) or a *terms acceptance* (Play Console) — all three are things the assistant will not
do on your behalf, by design.

| Gate | State | What is left, exactly |
|---|---|---|
| A — SMTP + code template | **owner** | Resend account under contact@globalstudyboard.com (none exists — resend.com showed no session), add domain, publish the DNS records at GoDaddy (the domain's nameservers are `ns01/ns02.domaincontrol.com`; the existing Google Workspace SPF on the root stays — Resend uses its own `send.` subdomain), create API key, paste into Supabase SMTP, edit the template, then raise "emails per hour" (the field is disabled until SMTP exists). |
| B — Play Console | **owner** | The console is blocked behind a *new Play Console Terms of Service* screen for the developer account — accept it, then do the Data-safety / deletion-URL / app-access steps below. |
| C — AdSense exclusions | **blocked by AdSense** | globalstudyboard.com is still "Needs attention — Low value content" (10 Jul 2026), so it is absent from Ads → By site and page exclusions cannot be set yet. The code already skips the four routes, so nothing is exposed; add the exclusions once the site is approved. |
| D — Vercel env | **done — accounts are ON (owner decision, 19 Sep 2026, ahead of Gate A)** | All six variables are set in Production + Development (Preview deliberately unset). The owner chose to switch the feature on before custom SMTP exists so it can be validated on the live site. **Until Gate A is done, sign-in e-mails come from Supabase's built-in mailer, capped at about 2 per hour project-wide** — the third visitor in an hour sees "Please wait a moment before asking for another e-mail" and must retry later. Complete Gate A soon; then flip `NEXT_PUBLIC_EMAIL_OTP_CODE=true` and redeploy. |
| E — Google Sign-In | **owner** | Google Cloud is signed in as vedkosh.info@gmail.com (bcode8 labs); the consent screen's support e-mail can only be an address that account owns, so the screen must be created while signed in as contact@globalstudyboard.com. |

Everything account-related for GSB uses **contact@globalstudyboard.com** (admin identity,
SMTP sender, OAuth consent screen, Play Console). Never the VedKosh addresses.

---

## 0. What exists

| Layer | Where |
|---|---|
| Supabase project | `globalstudyboard`, ref `xrfcxocqqshfilseojau`, AWS ap-south-1 (Mumbai), org `vedkosh-info` (Free) — a **separate** project from VedKosh's |
| Dashboard config (done) | Site URL `https://www.globalstudyboard.com`; redirect URLs `…/auth/callback` (+ `**` wildcards) for www, `localhost:5000`, `localhost:5050`; e-mail OTP length **6**, expiry **900 s**; access-token (JWT) expiry **900 s**; Custom Access Token hook → `public.custom_access_token_hook` (refuses password sessions) **enabled** |
| Schema (applied 18 Sep) | `supabase/migrations/0001_accounts.sql` — `profiles`, `saved_items`, `admin_actions`, RLS + guards; verified with `to_regclass`/`to_regprocedure`. `0002_retention_cron.sql` — daily `pg_cron` purge of moderation records older than 12 months (`gsb-purge-admin-actions`, verified active in `cron.job`) + a CHECK that `consent_version` is never a future date |
| Env (local, gitignored) | `.env.local` in root + worktree: URL, publishable key, secret key, `ADMIN_EMAILS=contact@globalstudyboard.com`, `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=false`, `NEXT_PUBLIC_EMAIL_OTP_CODE=false` — see `.env.example` |
| Inbox-free QA | `node scripts/auth-qa.mjs create|otp|show|delete <a REAL mailbox you own, plus-tagged — e.g. contact+qa1@globalstudyboard.com>`. **Never an invented address**: the form's send step e-mails it, a non-existent mailbox bounces, and Supabase warned on 19 Sep 2026 that bounce-backs put the project's sending privileges at risk (the script now refuses such addresses). |

## 1. Release gates — do these BEFORE setting the Vercel env vars

### Gate A — custom SMTP + one-time-code template (required for real users — NOW URGENT)
**19 Sep 2026: Supabase e-mailed twice ("Email Sending Privileges … at risk due to Bounce
Backs")** — the bounces were the QA throwaway addresses, which are now banned (see the QA row
above), but the warning means the built-in mailer can be restricted at any time, and accounts
are already live. Custom SMTP takes the project off the shared mailer entirely: do this gate
first.
Supabase's built-in mailer sends **~2 e-mails per hour** and its template can only be
edited once custom SMTP exists. Until then the e-mail carries a **link** that only works on
the same device/browser that asked for it (PKCE) — fine for testing, not for the public.
1. Resend (or another SMTP provider) → add domain `globalstudyboard.com` → publish the SPF
   + DKIM DNS records it shows → create an API key.
2. Supabase → Authentication → Emails → **SMTP Settings**: host `smtp.resend.com`, port
   `465`, user `resend`, password = the API key, sender **contact@globalstudyboard.com**,
   sender name `GlobalStudyBoard`.
3. Authentication → Emails → Templates → **Magic link or OTP**: subject
   `Your GlobalStudyBoard sign-in code`; body must print `{{ .Token }}` (the 6-digit code)
   and may keep `{{ .ConfirmationURL }}` as a secondary link. Save.
4. Authentication → Rate Limits: set "emails per hour" deliberately (e.g. 60) — this is the
   only brake on a script walking an e-mail list.
5. Set `NEXT_PUBLIC_EMAIL_OTP_CODE=true` in Vercel (Production) with the other vars in Gate D.
   Never before step 3 — the form's copy would promise a code the e-mail does not contain.
6. DMARC on `globalstudyboard.com`: start `v=DMARC1; p=none; rua=mailto:contact@globalstudyboard.com`.
7. **`/privacy` currently says sign-in e-mail is sent by Supabase's own service and that we are
   moving it to Resend** (section "Your account → Where and who processes it" + "International
   transfers"). The moment custom SMTP goes live, change those two sentences to name Resend as
   the sender, in the SAME deploy (constitution §9.4) — and if you choose a different provider,
   name that one instead. A legal page that names the wrong processor is a false statement.

### Gate B — Google Play (the Android app renders the live site)
The moment accounts are live on the web, the Play app "allows account creation". In Play
Console → App content, BEFORE the web env flips:
1. **Data safety** — re-declare: Personal info → E-mail address, Name (display name), User IDs;
   App activity → other user-generated content (saved pages). Purposes: App functionality,
   Account management. Collected, encrypted in transit, not shared, user can request deletion.
2. **Data deletion** → account-deletion URL `https://www.globalstudyboard.com/delete-account`
   (public, logged-out, in the sitemap and footer).
3. **App access** → if any functionality is restricted to signed-in users, provide reviewer
   sign-in instructions (a throwaway address you control on the site's domain + the
   inbox-free code from `scripts/auth-qa.mjs otp`).
4. Sequence this against resubmission #3 (in review since 12 Sep) — file the changes after it
   resolves, or note them in the resubmission; do not change declarations mid-review.
5. Android developer verification is due **30 Sep 2026** regardless.

### Gate C — AdSense page exclusions
The loader already skips `/login`, `/account`, `/admin`, `/auth/` in code (`components/AdsLoader.tsx`).
Mirror it: AdSense → Ads → By site → www.globalstudyboard.com → Page exclusions → add the same four.

### Gate D — Vercel environment (Production + Development only, NEVER Preview)
Preview builds would otherwise reach production data with a working delete endpoint.
```
NEXT_PUBLIC_SUPABASE_URL=https://xrfcxocqqshfilseojau.supabase.co      # set 19 Sep 2026 (accounts ON)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_zlsn99QaKkrwGJ2X_EwMDA_4QLZwsSQ   # set 19 Sep 2026
SUPABASE_SECRET_KEY=<set 19 Sep 2026, Production + Development>
ADMIN_EMAILS=contact@globalstudyboard.com                                # set 19 Sep 2026
NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=false                                    # set 19 Sep 2026; 'true' only after Gate E
NEXT_PUBLIC_EMAIL_OTP_CODE=false                                         # set 19 Sep 2026; 'true' only after Gate A step 3
```
To switch accounts OFF again in an emergency: `npx vercel env rm NEXT_PUBLIC_SUPABASE_URL production` (and `development`) + redeploy — every account surface returns to its dormant state (no sign-in control, routes answer 503) and the CSP drops the Supabase origin. After Gate A: `npx vercel env rm NEXT_PUBLIC_EMAIL_OTP_CODE production && printf '%s' 'true' | npx vercel env add NEXT_PUBLIC_EMAIL_OTP_CODE production` (and `development`), then redeploy.
`NEXT_PUBLIC_*` values are inlined at build time — **redeploy** after setting them. The CSP
gains `https://xrfcxocqqshfilseojau.supabase.co` in `connect-src` automatically at build.

Optional but recommended: Vercel → Project → Settings → Functions → **Function Region → Mumbai
(bom1)**, so the sign-in / export / delete handlers run next to the Mumbai database (lower
latency; the default is Washington, D.C.). `/privacy` already discloses Vercel as the host and
the United States as a possible processing location, so this is a performance choice, not a
compliance one.

Auth audit rows are NOT written to `auth.audit_log_entries` on this project (verified 0 rows on
19 Sep 2026 after a full day of sign-ins and deletions — the provider keeps them in its own log
store under the plan's retention). If a future dashboard setting turns database audit logging
on, add a purge for that table to migration 0002 first, or `/privacy`'s "days, not months" stops
being true.

### Gate E — Google Sign-In (optional, recommended: VedKosh lost ~39 % of sign-ups to e-mail friction)
1. Google Cloud Console (the bcode8 labs project or a GSB project) → APIs & Services → OAuth
   consent screen: External; app name `GlobalStudyBoard`; support e-mail
   **contact@globalstudyboard.com**; authorised domain `globalstudyboard.com`; developer contact
   contact@globalstudyboard.com → Publish.
2. Credentials → Create OAuth client ID → Web application: JavaScript origin
   `https://www.globalstudyboard.com`; **authorised redirect URI**
   `https://xrfcxocqqshfilseojau.supabase.co/auth/v1/callback` (Supabase's, not ours).
3. Supabase → Authentication → Sign In / Providers → Google → enable → paste Client ID + Secret.
4. Only then set `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true` and redeploy. (Before that the button is
   hidden on purpose: an enabled button with a disabled provider shows visitors raw JSON.)
5. Test: sign in with Google, confirm Auth → Users shows provider `google`, confirm a Google
   account with the SAME e-mail as an existing e-mail account links instead of duplicating.

## 2. Bootstrap the owner account (once, after Gate D)
1. Sign in on the live site with **contact@globalstudyboard.com** (e-mail code).
2. Supabase → Authentication → Users: exactly ONE row for that address; note its UUID.
3. Open `https://www.globalstudyboard.com/admin` — the console loads for any allowlisted,
   passwordless session. **Ban, unban and delete additionally need a sign-in from the last
   24 hours**; with an older session the console opens read-only and shows a banner saying so —
   sign out and back in before acting.

## 3. Keep-alive and monitoring
- Free-tier projects **pause after ~7 days with zero API activity**. Any signed-in visitor keeps
  it alive; with zero users, open the dashboard weekly or sign in yourself.
- Supabase → Authentication → Audit Logs after enabling Google: a spike of failed callbacks
  means the OAuth client is misconfigured (the site logs only a fixed reason per failure).
- Retention: a `pg_cron` job (`gsb-purge-admin-actions`, 03:17 UTC daily, migration 0002) purges
  `admin_actions` rows older than 12 months; opening the console also triggers the same purge.
  Check it is still scheduled after any Supabase plan/region change:
  `select jobname, active from cron.job where jobname like 'gsb-%';`
- Provider security logs (Auth → Logs) are retained by Supabase under the plan's log retention
  (1 day on Free) — `/privacy` describes them as provider-held, "days, not months".

## 4. Project ownership — contact@globalstudyboard.com (owner decision)
The project was created in the only Supabase account signed in during setup (`vedkosh-info`,
vedkosh.info@gmail.com). To keep GSB's infrastructure under its own identity:
1. Sign up to Supabase with contact@globalstudyboard.com (GitHub SSO or e-mail — an account
   creation only you can do).
2. In the `vedkosh-info` org → Organization settings → Members: invite contact@globalstudyboard.com
   as **Owner**; or create a new org from the new account and use Project → Settings → General →
   **Transfer project** (the ref, URL and keys are unchanged, so no env change is needed).
3. Optionally remove vedkosh.info@gmail.com from the GSB org afterwards.

## 5. Phase 2 (not built — decide from usage)
- GSB-AI per-user daily allowance (counts only; §9.4 forbids storing prompts) and chat history
  (requires amending §9.4 + /privacy first).
- Cloudflare Turnstile on the sign-in form (needs `challenges.cloudflare.com` in `script-src`
  + `frame-src` — a security-header change; ship the site key first, enable in Supabase second).
- Application-deadline reminders (needs verified deadline data + an e-mail provider).
- Turning the "Report an issue" chips on content pages into a real, optionally signed-in report.

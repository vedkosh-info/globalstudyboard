-- 0002 — retention enforcement for moderation records (pg_cron) + consent-date guard
--
-- Why: /privacy and /delete-account promise that a moderation record is kept
-- "for up to 12 months". Before this file the only purge ran when the owner
-- happened to open /admin (an opportunistic call from the admin API) — an
-- independent review (18 Sep 2026) rated that "no enforcing mechanism" (P2).
-- A scheduled job makes the statement true whether or not anyone opens the
-- console.
--
-- pg_cron is available on every Supabase plan. Jobs run as the role that
-- scheduled them (`postgres` in the SQL editor), daily at 03:17 UTC — a quiet
-- hour for an India/US audience. Re-runnable: cron.schedule() with a fixed job
-- name replaces the existing job of that name.
--
-- Not in scope: the sign-in provider's own security log. Verified 18 Sep 2026
-- that `auth.audit_log_entries` holds 0 rows after a full day of sign-ins and
-- deletions — this project's Auth writes its audit trail to the platform log
-- store (retention set by the plan, 1 day on Free), so there is nothing in the
-- database for us to purge and /privacy describes it as provider-held.

create extension if not exists pg_cron;

-- Moderation records: 12 months (purge_admin_actions floors the window at 30 days).
select cron.schedule(
  'gsb-purge-admin-actions',
  '17 3 * * *',
  $$select public.purge_admin_actions(365)$$
);

-- Verify (one row, active = true):
--   select jobname, schedule, active from cron.job where jobname = 'gsb-purge-admin-actions';
-- Dry-run the purge (returns the number of rows removed — 0 on a young table):
--   select public.purge_admin_actions(365);

-- ── profiles.consent_version cannot be a future date ────────────────────────
-- The consent stamp is written browser → PostgREST under RLS, so a client could
-- insert a far-future version (e.g. 2999-01-01) and silence every future
-- re-consent prompt (guard_profile_consent only lets the version move forward).
-- Independent review, 18 Sep 2026 (P2). The version IS the Terms revision date,
-- so it can never legitimately be later than today; +1 day absorbs a deploy
-- that lands before UTC midnight on the revision date.
alter table public.profiles drop constraint if exists profiles_consent_version_not_future;
alter table public.profiles add constraint profiles_consent_version_not_future
  check (consent_version is null or consent_version::date <= current_date + 1);
-- Verify: select conname from pg_constraint where conname = 'profiles_consent_version_not_future';

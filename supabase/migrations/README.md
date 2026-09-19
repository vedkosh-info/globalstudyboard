# Supabase migrations — GlobalStudyBoard

Project: **globalstudyboard** (ref `xrfcxocqqshfilseojau`, AWS ap-south-1 Mumbai,
org `vedkosh-info`). This is a **separate** project from VedKosh's — never run a
VedKosh migration here or vice versa.

There is no migration runner: each `.sql` file is pasted **by hand** into
Supabase → SQL Editor and run once, in numeric order. Every file is written to be
re-runnable (`if not exists` / `create or replace` / `drop … if exists`).

## How to apply

1. Open the SQL Editor for the project and paste the whole file.
2. Check the **role dropdown** next to Run says `postgres`. If it is any other
   role, `create table` fails with `permission denied for schema public`, the
   editor wraps the script in one transaction, and the whole file silently rolls
   back while looking like it ran.
3. Select **nothing** before Run (a selection runs only the highlighted text).
4. Verify rather than trusting "Success":

   ```sql
   select to_regclass('public.profiles')      as profiles,
          to_regclass('public.saved_items')   as saved_items,
          to_regclass('public.admin_actions') as admin_actions,
          to_regprocedure('public.guard_profile_consent()') as consent_fn;
   ```

   `null` = did not commit. If PostgREST still 404s a table: `notify pgrst, 'reload schema';`
5. Apply the migration **before** deploying code that reads the new columns.

## Files

| # | File | What it does |
|---|------|--------------|
| 0001 | `0001_accounts.sql` | `profiles` (1:1 with `auth.users`, RLS own-row, server-stamped write-once consent), `saved_items` (shortlist with title snapshot, 500-row cap), `admin_actions` (service-role-only audit trail), function lockdown + grants. Applied 2026-09-18. |
| 0002 | `0002_retention_cron.sql` | `pg_cron` job `gsb-purge-admin-actions` — daily purge of `admin_actions` rows older than 12 months, so the retention promised on `/privacy` holds without anyone opening the console; CHECK that `profiles.consent_version` is never a future date (a client could otherwise pre-stamp consent to Terms that do not exist yet). Applied 2026-09-18. |

## Rules every migration follows

- RLS on every table; own-row policies only; **no DELETE policy on profiles**
  (deletion is the `auth.admin.deleteUser` cascade).
- No trigger on `auth.users` — the app creates the profile row (`ensureProfile`).
- Every `security definer` function is revoked from `public, anon, authenticated`
  and the schema's default function privileges stay revoked.
- Explicit `service_role` grants on every table (PostgREST drops relations no API
  role can see from its schema cache).
- Content bounded by CHECKs: rows are written browser → PostgREST under RLS, so
  the app is not a chokepoint.

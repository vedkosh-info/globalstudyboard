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
| 0003 | `0003_planner.sql` | `planner_applications` + `planner_tasks` for the Application Planner; its cap guards refuse another account's row, a password session or a signed-out request before counting and serialise the count with a transaction-scoped advisory lock, and the signed-out `anon` role has no INSERT/UPDATE on either table. Its header explains how every cap count is serialised ("Caps under concurrent requests"). **Not yet applied** — see `ACCOUNTS_SETUP.md`. |
| 0004 | `0004_cost_planner.sql` | `budget_plans` + `budget_items` for the Cost & Funding Planner (line cap holds on a move between budgets); its cap guards refuse another account's row, a password session or a signed-out request before counting and serialise the count with a transaction-scoped advisory lock, and the signed-out `anon` role has no INSERT/UPDATE on either table. **Not yet applied.** |
| 0005 | `0005_compare_universities.sql` | `compare_sets` + `compare_criteria` + `compare_entries` + `compare_scores` for Compare Universities (8 scores per university — a re-score through the tool's upsert is never counted); its cap guards refuse another account's row, a password session or a signed-out request before counting and serialise the count with a transaction-scoped advisory lock, and the signed-out `anon` role has no INSERT/UPDATE on any of the four tables. **Not yet applied.** |
| 0006 | `0006_test_scores.sql` | `test_scores` + `test_score_sections` + the `save_test_score()` RPC for the Test Score Tracker; `exam_slug` list is a named constraint checked against the catalogue at build time; its cap guards refuse another account's row, a password session or a signed-out request before counting and serialise the count with a transaction-scoped advisory lock, and the signed-out `anon` role has no INSERT/UPDATE on either table. **Not yet applied.** |
| 0007 | `0007_accounts_hardening.sql` | Brings 0001's live tables up to the 0003–0006 posture without editing 0001: `guard_saved_items_cap()` refuses another account's row, a password session or a signed-out request before counting and serialises the count with a transaction-scoped advisory lock; the signed-out role loses INSERT/UPDATE on `saved_items` and `profiles`; the destination lists on `profiles.preferred_region` and `saved_items.region` become named, re-applied constraints. **Not yet applied. Re-run it after any re-run of 0001.** |

Every destination list (the tool tables, `profiles.preferred_region`, `saved_items.region`) and the `exam_slug` list are parsed by `scripts/check-tools.ts` (prebuild). It fails the build if a list drifts from `lib/regions.ts` or the exam catalogue; if it is not a named `col in ('…', …)` constraint, dropped and re-added, on its own table; if a later migration drops it and nothing adds it back; if destination DDL sits in dynamic SQL or a function body (nested quotes and `format()` arguments included), or in a domain or an enum; or if two or more destinations are named together anywhere else (a trigger or function, an array literal, a lookup insert, a mapping). DDL written directly in a DO block is read like any other statement. A CHECK on a destination column that does not restrict the destinations (a cross-field rule) passes only as a reviewed `NOT_A_LIST` entry for its table. The guard cannot see a destination column that has no list at all.

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
- Every cap is a `security definer` BEFORE trigger that refuses another account's
  row, a password session and a signed-out request **before** counting (a BEFORE
  trigger runs ahead of RLS, so the cap error must never answer for someone else's
  data), then takes a transaction-scoped advisory lock keyed to exactly what it
  counts, so concurrent requests cannot overshoot it. The lock relies on READ
  COMMITTED, Supabase's default isolation.
- The signed-out (`anon`) role gets no INSERT/UPDATE on any table a signed-in
  visitor writes (the tool tables, `saved_items`, `profiles`) — `revoke insert,
  update … from anon`, re-applied on every run. SELECT and DELETE stay: under RLS
  they match no row for a signed-out caller.
- Each file ends with verify queries; run them after the file rather than trusting
  "Success". The local PGlite harness runs the footer queries of 0003–0007 as
  written; its full run over 0001–0007 passed 261 of 261 checks (re-run on
  30 Sep 2026 against the current files — details in the 0007 row of
  `ACCOUNTS_SETUP.md`).

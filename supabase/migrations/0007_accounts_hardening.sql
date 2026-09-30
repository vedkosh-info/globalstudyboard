-- ============================================================================
-- GlobalStudyBoard — Accounts hardening (migration 0007). Run ONCE in the
-- Supabase SQL editor of project `globalstudyboard` (ref xrfcxocqqshfilseojau)
-- with the role dropdown on `postgres`, AFTER 0001 (and 0002–0006). Safe to
-- re-run. Run it as one script in the SQL editor (the editor wraps it in a
-- single transaction): a region list is dropped and re-added, and a failed
-- re-add must roll the drop back, not leave the column unconstrained.
--
-- 0001_accounts.sql is live in production (applied 18 Sep 2026) and is never
-- edited in place. This file brings its live tables up to the posture
-- migrations 0003–0006 were given on 29 Sep 2026 (independent review, SEC-1 /
-- SEC-2 / SEC-3 follow-ups; items 1–2 extended by the MG-R2-1 / MG-R2-2
-- follow-up the same day):
--
--   1. guard_saved_items_cap() — the 500-row cap on saved pages. 0001's
--      version COUNTED before anything checked whose row it was. A BEFORE
--      trigger runs ahead of the RLS WITH CHECK, so any caller — signed in,
--      with a password-authenticated session, or signed out with only the
--      public key — could insert a row for another user_id and read "does
--      that account hold 500 saved pages?" off the error (the cap error at
--      500, the RLS error below it). It now refuses another account's row, a
--      password session and a signed-out request FIRST, exactly like the
--      0003–0006 guards, so the cap error only ever speaks about the caller's
--      own list; only a service-role or SQL-editor write (no signed-in user)
--      passes through to RLS, as before. It also serialises the count, like
--      those guards: a transaction-scoped advisory lock per account, so two
--      requests in flight at once cannot both count 499 and both insert (see
--      "Caps under concurrent requests" in 0003's header — it relies on READ
--      COMMITTED, the Supabase/PostgREST default).
--   2. No INSERT/UPDATE for the signed-out (anon) role on saved_items and
--      profiles. Supabase's default privileges gave anon ALL on both tables
--      when 0001 created them; RLS refuses an anon write, but only AFTER the
--      BEFORE triggers have run, and the cap guard is one of them. Revoking
--      the two privileges stops a signed-out write before any trigger — the
--      guard's own refusal (item 1) is the second line if a later grant ever
--      restores them. SELECT and DELETE stay (under RLS a signed-out read or
--      delete matches no row, and no trigger runs on either), so a signed-out
--      read still answers with an empty list.
--   3. The destination lists on profiles.preferred_region and
--      saved_items.region. 0001 declared them as inline CHECKs inside
--      `create table if not exists`, which a re-run skips, so a 10th
--      destination added to lib/regions.ts would be refused for a signed-in
--      visitor's remembered destination and for saved pages. They are now
--      NAMED constraints, dropped and re-added on every run, so a re-run
--      after the list grows makes it live. The names are the ones Postgres
--      gave 0001's inline CHECKs (<table>_<column>_check), so the first run
--      replaces them rather than adding a second constraint beside them.
--      Nullability is unchanged: both columns stay nullable, and a CHECK
--      passes NULL (profiles: no preference recorded yet; saved_items: a row
--      saved without a destination). `scripts/check-tools.ts` parses both
--      lists and fails the build if either drifts from lib/regions.ts.
--
-- Ordering: 0001 re-creates its own, weaker guard_saved_items_cap() if it is
-- ever run again. Re-run this file after any re-run of 0001.
--
-- No new table, column or data: nothing here changes what /privacy,
-- /delete-account or /api/account/export describe. The revoke changes no
-- behaviour a signed-in visitor can see.
-- ============================================================================

-- ── saved_items: the cap guard, ownership first ────────────────────────────
-- RLS bounds WHO may write, not HOW MANY: cap the shortlist so one account
-- cannot fill the free-tier database — and refuse any row that is not the
-- caller's own BEFORE counting, so the cap error never answers for another
-- account.
create or replace function public.guard_saved_items_cap()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  n integer;
begin
  -- A signed-out (anon) request has no auth.uid() either — like a
  -- service-role or SQL-editor write, which passes through to RLS — so it is
  -- refused here by its API role, before anything is counted: the request's
  -- role (PostgREST sets it; a request with no JWT at all runs as anon) or
  -- the JWT's role claim. A second line behind the anon INSERT/UPDATE revoke
  -- at the foot of this file.
  if auth.uid() is null and (current_setting('role', true) = 'anon' or auth.jwt() ->> 'role' = 'anon') then
    raise exception 'saved_items: sign in first' using errcode = 'insufficient_privilege';
  end if;
  -- Another account's row, or a password-authenticated session, is refused
  -- BEFORE counting (a planted password must not learn even "does this
  -- account hold 500 saved pages?" from the cap error).
  if auth.uid() is not null and (new.user_id is distinct from auth.uid() or not public.session_is_passwordless()) then
    raise exception 'saved_items: user_id must be the caller' using errcode = 'insufficient_privilege';
  end if;
  -- Serialise the count for this account (see "Caps under concurrent
  -- requests" in 0003's header): a second request waits here until the first
  -- commits, then counts its row.
  perform pg_advisory_xact_lock(hashtextextended('saved_items:' || new.user_id::text, 0));
  select count(*) into n from public.saved_items where user_id = new.user_id;
  if n >= 500 then
    raise exception 'saved_items_cap' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

-- Same trigger as 0001 (insert only — saved_items has no UPDATE policy, so a
-- row is never moved to another account), re-created so this file alone
-- leaves it bound to the function above.
drop trigger if exists saved_items_cap on public.saved_items;
create trigger saved_items_cap
  before insert on public.saved_items
  for each row execute function public.guard_saved_items_cap();

-- ── Destination lists as NAMED, re-applied constraints ─────────────────────
-- The nine study destinations of lib/regions.ts. A re-run fails loudly, by
-- design, if a row uses a destination being removed.
alter table public.profiles drop constraint if exists profiles_preferred_region_check;
alter table public.profiles add constraint profiles_preferred_region_check check (preferred_region in (
    'india', 'usa', 'uk-ireland', 'canada', 'europe', 'australia-nz',
    'middle-east', 'russia', 'east-southeast-asia'
  ));

-- The same nine plus 'global': a saved exam page carries its exam's region,
-- and worldwide tests (IELTS, TOEFL, GRE …) are region 'global'
-- (lib/saved-items.ts: RegionSlug | 'global' | null).
alter table public.saved_items drop constraint if exists saved_items_region_check;
alter table public.saved_items add constraint saved_items_region_check check (region in (
    'india', 'usa', 'uk-ireland', 'canada', 'europe', 'australia-nz',
    'middle-east', 'russia', 'east-southeast-asia', 'global'
  ));

-- ── Function lockdown (identical to 0001) ──────────────────────────────────
revoke all on function public.guard_saved_items_cap() from public, anon, authenticated;

-- ── No writes for the signed-out role (item 2) ─────────────────────────────
revoke insert, update on public.saved_items, public.profiles from anon;

notify pgrst, 'reload schema';

-- ── Verify (run separately) ─────────────────────────────────────────────────
-- Exactly one CHECK per column, and it is the named one (two rows, one per
-- column, each count = 1):
-- select c.conrelid::regclass as tbl, a.attname as col, count(*) as n,
--        string_agg(c.conname, ', ') as names
--   from pg_constraint c
--   join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
--  where c.contype = 'c'
--    and (c.conrelid, a.attname) in (('public.profiles'::regclass, 'preferred_region'),
--                                    ('public.saved_items'::regclass, 'region'))
--  group by 1, 2;
-- The guard now checks ownership first and serialises the count (true):
-- select pg_get_functiondef('public.guard_saved_items_cap()'::regprocedure) like '%must be the caller%'
--    and pg_get_functiondef('public.guard_saved_items_cap()'::regprocedure) like '%pg_advisory_xact_lock%' as hardened;
-- The signed-out role can no longer write either table (both false):
-- select has_table_privilege('anon', 'public.saved_items', 'insert') as anon_saves,
--        has_table_privilege('anon', 'public.profiles', 'update')    as anon_profiles;

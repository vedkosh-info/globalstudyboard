-- ============================================================================
-- GlobalStudyBoard — Cost & Funding Planner schema (migration 0004). Run ONCE in
-- the Supabase SQL editor of project `globalstudyboard` (ref xrfcxocqqshfilseojau)
-- with the role dropdown on `postgres`, AFTER 0001 (and 0003). Safe to re-run.
--
-- The second account-only tool (/tools/cost-planner). Two tables, both 100%
-- student-authored — the site asserts NO fee, cost, threshold or exchange rate:
--   budget_plans   one budget per destination the student is planning for (a
--                  student may keep several per destination, e.g. one per
--                  university option): its destination, a label, the ONE
--                  currency every line is entered in (we never convert),
--                  the programme length the per-year lines are multiplied by,
--                  an optional intake label and private notes.
--   budget_items   the lines: a cost or a funding source, its category (one of
--                  the destination's suggested categories or the student's own
--                  label), the amount the student typed, whether it recurs
--                  every year or is a one-off, and a short note.
--
-- Security posture = migrations 0001/0003: RLS own-row + session_is_passwordless()
-- on every policy, an item may only reference the caller's OWN plan,
-- CHECK-bounded columns (no control characters, bounded amounts — a numeric,
-- not a float, so totals are exact to the cent), per-user / per-budget caps
-- via SECURITY DEFINER triggers that refuse another account's row, a password
-- session and a signed-out request before counting, and serialise the count
-- (see 0003's header, "Caps under concurrent requests": each guard takes a
-- transaction-scoped advisory lock keyed to what it counts — here the
-- account, or the budget — relying on READ COMMITTED, the Supabase/PostgREST
-- default), function lockdown, explicit service_role grants, no INSERT/UPDATE
-- for the signed-out (anon) role.
--
-- Privacy (§9): rows are deleted with the account (ON DELETE CASCADE from
-- auth.users) and are included in the /api/account/export download. The
-- amounts are the student's private figures; /privacy asks them not to record
-- bank or card details in notes.
-- ============================================================================

-- ── budget_plans ────────────────────────────────────────────────────────────
create table if not exists public.budget_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  region text not null,
  label text not null check (char_length(label) between 1 and 120 and label !~ '[\x01-\x1F\x7F]'),
  -- ISO 4217 code. Every line in the plan is in this currency; the site never
  -- converts between currencies (constitution §3 — no invented exchange rates).
  currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  -- Programme length the per-year lines are multiplied by (1–8 years).
  years integer not null default 1 check (years between 1 and 8),
  intake text check (char_length(intake) <= 40 and intake !~ '[\x01-\x1F\x7F]'),
  notes text check (char_length(notes) <= 4000 and notes !~ '[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The destination list is a NAMED constraint, dropped and re-added, so a re-run
-- of this file always leaves the CURRENT list live (an inline CHECK inside
-- `create table if not exists` is skipped on a re-run, so a new destination
-- would be offered by the tool and refused on every save). A re-run fails
-- loudly, by design, if a row uses a destination being removed.
alter table public.budget_plans drop constraint if exists budget_plans_region_check;
alter table public.budget_plans add constraint budget_plans_region_check check (region in (
    'india', 'usa', 'uk-ireland', 'canada', 'europe', 'australia-nz',
    'middle-east', 'russia', 'east-southeast-asia'
  ));

create index if not exists budget_plans_user_region_idx
  on public.budget_plans (user_id, region, created_at desc);

alter table public.budget_plans enable row level security;

drop policy if exists budget_plans_select_own on public.budget_plans;
create policy budget_plans_select_own on public.budget_plans
  for select using (auth.uid() = user_id and public.session_is_passwordless());

drop policy if exists budget_plans_insert_own on public.budget_plans;
create policy budget_plans_insert_own on public.budget_plans
  for insert with check (auth.uid() = user_id and public.session_is_passwordless());

drop policy if exists budget_plans_update_own on public.budget_plans;
create policy budget_plans_update_own on public.budget_plans
  for update using (auth.uid() = user_id and public.session_is_passwordless())
  with check (auth.uid() = user_id and public.session_is_passwordless());

drop policy if exists budget_plans_delete_own on public.budget_plans;
create policy budget_plans_delete_own on public.budget_plans
  for delete using (auth.uid() = user_id and public.session_is_passwordless());

drop trigger if exists budget_plans_set_updated_at on public.budget_plans;
create trigger budget_plans_set_updated_at
  before update on public.budget_plans
  for each row execute function public.set_updated_at();

-- Cap: 12 plans per account (a student compares a handful of options).
create or replace function public.guard_budget_plans_cap()
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
    raise exception 'budget_plans: sign in first' using errcode = 'insufficient_privilege';
  end if;
  -- This BEFORE trigger runs ahead of the RLS WITH CHECK: refuse another
  -- account's row (and a password session) BEFORE counting, so the cap error
  -- can never answer a question about someone else's data (review, 29 Sep 2026).
  if auth.uid() is not null and (new.user_id is distinct from auth.uid() or not public.session_is_passwordless()) then
    raise exception 'budget_plans: user_id must be the caller' using errcode = 'insufficient_privilege';
  end if;
  -- Serialise the count for this account (see "Caps under concurrent
  -- requests" in 0003's header): a second request waits here until the first
  -- commits, then counts its row.
  perform pg_advisory_xact_lock(hashtextextended('budget_plans:' || new.user_id::text, 0));
  select count(*) into n from public.budget_plans where user_id = new.user_id;
  if n >= 12 then
    raise exception 'budget_plans_cap' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists budget_plans_cap on public.budget_plans;
create trigger budget_plans_cap
  before insert on public.budget_plans
  for each row execute function public.guard_budget_plans_cap();

-- ── budget_items ────────────────────────────────────────────────────────────
create table if not exists public.budget_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id uuid not null references public.budget_plans (id) on delete cascade,
  kind text not null check (kind in ('cost', 'funding')),
  -- A suggested-category key (e.g. 'tuition', 'health', 'scholarship') or
  -- 'other' for the student's own line; the label is always what is shown.
  category text not null check (category ~ '^[a-z][a-z0-9-]{0,39}$'),
  label text not null check (char_length(label) between 1 and 80 and label !~ '[\x01-\x1F\x7F]'),
  -- Exact to the cent, never negative, below one hundred million.
  amount numeric(12, 2) not null check (amount >= 0 and amount < 100000000),
  period text not null default 'year' check (period in ('once', 'year')),
  note text check (char_length(note) <= 300 and note !~ '[\x01-\x1F\x7F]'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists budget_items_plan_idx
  on public.budget_items (plan_id, created_at);
create index if not exists budget_items_user_idx
  on public.budget_items (user_id);

alter table public.budget_items enable row level security;

-- An item may only hang off the caller's OWN plan (RLS scopes the read anyway,
-- but the write must not be able to reference someone else's row).
create or replace function public.budget_plan_is_own(p_plan_id uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1 from public.budget_plans p
    where p.id = p_plan_id and p.user_id = auth.uid()
  );
$$;

drop policy if exists budget_items_select_own on public.budget_items;
create policy budget_items_select_own on public.budget_items
  for select using (auth.uid() = user_id and public.session_is_passwordless());

drop policy if exists budget_items_insert_own on public.budget_items;
create policy budget_items_insert_own on public.budget_items
  for insert with check (
    auth.uid() = user_id and public.session_is_passwordless()
    and public.budget_plan_is_own(plan_id)
  );

drop policy if exists budget_items_update_own on public.budget_items;
create policy budget_items_update_own on public.budget_items
  for update using (auth.uid() = user_id and public.session_is_passwordless())
  with check (
    auth.uid() = user_id and public.session_is_passwordless()
    and public.budget_plan_is_own(plan_id)
  );

drop policy if exists budget_items_delete_own on public.budget_items;
create policy budget_items_delete_own on public.budget_items
  for delete using (auth.uid() = user_id and public.session_is_passwordless());

drop trigger if exists budget_items_set_updated_at on public.budget_items;
create trigger budget_items_set_updated_at
  before update on public.budget_items
  for each row execute function public.set_updated_at();

-- Cap: 60 lines per plan (a real budget has 8–20).
create or replace function public.guard_budget_items_cap()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  n integer;
begin
  -- Moving a line to another of the student's budgets is counted like an
  -- insert, so the 60-line cap holds per budget (as in 0005/0006); an update
  -- that leaves plan_id where it was is not a move.
  if tg_op = 'UPDATE' and new.plan_id is not distinct from old.plan_id then
    return new;
  end if;
  -- A signed-out (anon) request has no auth.uid() either — like a
  -- service-role or SQL-editor write, which passes through to RLS — so it is
  -- refused here by its API role, before anything is counted: the request's
  -- role (PostgREST sets it; a request with no JWT at all runs as anon) or
  -- the JWT's role claim. A second line behind the anon INSERT/UPDATE revoke
  -- at the foot of this file.
  if auth.uid() is null and (current_setting('role', true) = 'anon' or auth.jwt() ->> 'role' = 'anon') then
    raise exception 'budget_items: sign in first' using errcode = 'insufficient_privilege';
  end if;
  -- This BEFORE trigger runs ahead of the RLS WITH CHECK: refuse another
  -- account's row (and a password session) BEFORE counting, so the cap error
  -- can never answer a question about someone else's data (review, 29 Sep 2026).
  if auth.uid() is not null and (not public.budget_plan_is_own(new.plan_id) or not public.session_is_passwordless()) then
    raise exception 'budget_items: the budget must be your own' using errcode = 'insufficient_privilege';
  end if;
  -- Serialise the count for this budget (see "Caps under concurrent
  -- requests" in 0003's header): a second request waits here until the first
  -- commits, then counts its row.
  perform pg_advisory_xact_lock(hashtextextended('budget_items:' || new.plan_id::text, 0));
  select count(*) into n from public.budget_items where plan_id = new.plan_id;
  if n >= 60 then
    raise exception 'budget_items_cap' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists budget_items_cap on public.budget_items;
create trigger budget_items_cap
  before insert or update of plan_id on public.budget_items
  for each row execute function public.guard_budget_items_cap();

-- ── Function lockdown + PostgREST grants ────────────────────────────────────
revoke all on function public.guard_budget_plans_cap() from public, anon, authenticated;
revoke all on function public.guard_budget_items_cap() from public, anon, authenticated;
-- Evaluated inside a policy as the caller → must stay executable by the API roles.
grant execute on function public.budget_plan_is_own(uuid) to anon, authenticated, service_role;

grant select, insert, update, delete on public.budget_plans to service_role;
grant select, insert, update, delete on public.budget_items to service_role;

-- Signed-out (anon) callers never write these tables. Supabase's default
-- privileges give every API role ALL on a new public table; RLS refuses an
-- anon write anyway, but a BEFORE trigger runs ahead of RLS, so without this
-- revoke a signed-out request would reach the cap guards (review, 29 Sep
-- 2026). SELECT and DELETE stay: under RLS a signed-out read or delete
-- matches no row, and no trigger runs on either. Re-applied on every run.
revoke insert, update on public.budget_plans, public.budget_items from anon;

notify pgrst, 'reload schema';

-- ── Verify (run separately; every value must be non-null) ───────────────────
-- select to_regclass('public.budget_plans') as plans,
--        to_regclass('public.budget_items') as items,
--        to_regprocedure('public.budget_plan_is_own(uuid)') as own_fn,
--        to_regprocedure('public.guard_budget_items_cap()') as cap_fn;
--
-- The signed-out role cannot write any of these tables (every value false):
-- select has_table_privilege('anon', 'public.budget_plans', 'insert, update') as anon_plans,
--        has_table_privilege('anon', 'public.budget_items', 'insert, update') as anon_items;

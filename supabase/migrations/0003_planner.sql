-- ============================================================================
-- GlobalStudyBoard — Application Planner schema (migration 0003). Run ONCE in
-- the Supabase SQL editor of project `globalstudyboard` (ref xrfcxocqqshfilseojau)
-- with the role dropdown on `postgres`, AFTER 0001. Safe to re-run.
--
-- The first account-only tool (/tools/application-planner). Two tables, both
-- 100% user-authored — the site asserts NO deadline, fee or outcome here:
--   planner_applications  a university / programme the student is applying to
--                         (optionally linked to one of our college profiles by
--                         slug; the NAME is a snapshot so /tools renders from
--                         these rows alone — the client never imports the
--                         catalogue), its destination, status, the student's
--                         OWN safe/target/reach estimate, and private notes.
--   planner_tasks         dated or undated to-dos: application deadlines,
--                         documents, test dates, scholarship / visa / interview
--                         steps. Either attached to an application or standalone
--                         (e.g. an IELTS test date). Dates are the student's
--                         own entries — the UI pairs every date with the
--                         "verify on the official site" nudge (constitution §5).
--
-- Security posture = migration 0001: RLS own-row + session_is_passwordless()
-- on every policy, a task may only reference the caller's OWN application,
-- CHECK-bounded columns (no control characters; https-only links so a stored
-- URL can never be a javascript: href), per-user caps via SECURITY DEFINER
-- triggers that refuse another account's row, a password session and a
-- signed-out request before counting, and serialise the count (below),
-- function lockdown, explicit service_role grants, no INSERT/UPDATE for the
-- signed-out (anon) role.
--
-- Caps under concurrent requests (review, 29 Sep 2026). A cap is a count
-- followed by an insert, and a count cannot see a row another request has
-- inserted but not yet committed: two requests in flight at once would both
-- count 99 and both insert. Each guard therefore takes a transaction-scoped
-- advisory lock keyed to exactly what it counts (here, the account) before
-- counting. A second request for the same account waits until the first
-- commits or rolls back; its count is a new statement, so under READ
-- COMMITTED (the Supabase/PostgREST default) it takes a new snapshot and sees
-- the first request's row. Under REPEATABLE READ the snapshot is taken once
-- per transaction and the lock would not help. The lock is re-entrant, so one
-- statement inserting many rows still works and is still stopped at the cap.
-- Two statements that each insert under several parents (budgets,
-- comparisons, attempts) in opposite orders could deadlock; PostgreSQL then
-- aborts one of them (40P01), the other completes, and no cap is exceeded.
-- The tools write under one parent per request, so it does not arise.
-- The local PGlite run proves the guards compile, lock the right key and keep
-- their single-transaction behaviour; PGlite has one backend and cannot run
-- two transactions at once, so the concurrency guarantee rests on
-- PostgreSQL's locking and snapshot rules, not on a test.
--
-- Privacy (§9): rows are deleted with the account (ON DELETE CASCADE from
-- auth.users) and are included in the /api/account/export download. Free-text
-- notes are the student's private space; /privacy asks them not to record
-- sensitive personal information there.
-- ============================================================================

-- ── planner_applications ────────────────────────────────────────────────────
create table if not exists public.planner_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Set when the entry was picked from our catalogue (links to /colleges/<slug>).
  college_slug text check (college_slug ~ '^[a-z0-9][a-z0-9-]{0,119}$'),
  name text not null check (char_length(name) between 1 and 160 and name !~ '[\x01-\x1F\x7F]'),
  region text not null,
  program text check (char_length(program) <= 160 and program !~ '[\x01-\x1F\x7F]'),
  intake text check (char_length(intake) <= 40 and intake !~ '[\x01-\x1F\x7F]'),
  -- Student-entered link to the university's own site. https only, no
  -- whitespace: rendered as an <a href> back to the student who typed it.
  official_url text check (char_length(official_url) <= 500 and official_url ~ '^https://[^[:space:]]+$'),
  status text not null default 'researching' check (status in (
    'researching', 'preparing', 'applied', 'offer', 'accepted', 'closed'
  )),
  -- The student's OWN estimate. The site never predicts admission odds.
  priority text check (priority in ('safe', 'target', 'reach')),
  notes text check (char_length(notes) <= 4000 and notes !~ '[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The destination list is a NAMED constraint, dropped and re-added, so a re-run
-- of this file always leaves the CURRENT list live (an inline CHECK inside
-- `create table if not exists` is skipped on a re-run, so a new destination
-- would be offered by the tool and refused on every save). A re-run fails
-- loudly, by design, if a row uses a destination being removed.
alter table public.planner_applications drop constraint if exists planner_applications_region_check;
alter table public.planner_applications add constraint planner_applications_region_check check (region in (
    'india', 'usa', 'uk-ireland', 'canada', 'europe', 'australia-nz',
    'middle-east', 'russia', 'east-southeast-asia'
  ));

create index if not exists planner_applications_user_created_idx
  on public.planner_applications (user_id, created_at desc);

alter table public.planner_applications enable row level security;

drop policy if exists planner_applications_select_own on public.planner_applications;
create policy planner_applications_select_own on public.planner_applications
  for select using (auth.uid() = user_id and public.session_is_passwordless());

drop policy if exists planner_applications_insert_own on public.planner_applications;
create policy planner_applications_insert_own on public.planner_applications
  for insert with check (auth.uid() = user_id and public.session_is_passwordless());

drop policy if exists planner_applications_update_own on public.planner_applications;
create policy planner_applications_update_own on public.planner_applications
  for update using (auth.uid() = user_id and public.session_is_passwordless())
  with check (auth.uid() = user_id and public.session_is_passwordless());

drop policy if exists planner_applications_delete_own on public.planner_applications;
create policy planner_applications_delete_own on public.planner_applications
  for delete using (auth.uid() = user_id and public.session_is_passwordless());

drop trigger if exists planner_applications_set_updated_at on public.planner_applications;
create trigger planner_applications_set_updated_at
  before update on public.planner_applications
  for each row execute function public.set_updated_at();

-- Cap: 100 applications per account (one student's real shortlist is 5–20).
create or replace function public.guard_planner_applications_cap()
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
    raise exception 'planner_applications: sign in first' using errcode = 'insufficient_privilege';
  end if;
  -- This BEFORE trigger runs ahead of the RLS WITH CHECK: refuse another
  -- account's row (and a password session) BEFORE counting, so the cap error
  -- can never answer a question about someone else's data (review, 29 Sep 2026).
  if auth.uid() is not null and (new.user_id is distinct from auth.uid() or not public.session_is_passwordless()) then
    raise exception 'planner_applications: user_id must be the caller' using errcode = 'insufficient_privilege';
  end if;
  -- Serialise the count for this account (see "Caps under concurrent
  -- requests" in the header): a second request waits here until the first
  -- commits, then counts its row.
  perform pg_advisory_xact_lock(hashtextextended('planner_applications:' || new.user_id::text, 0));
  select count(*) into n from public.planner_applications where user_id = new.user_id;
  if n >= 100 then
    raise exception 'planner_applications_cap' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists planner_applications_cap on public.planner_applications;
create trigger planner_applications_cap
  before insert on public.planner_applications
  for each row execute function public.guard_planner_applications_cap();

-- ── planner_tasks ───────────────────────────────────────────────────────────
create table if not exists public.planner_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- NULL = a standalone item (e.g. a test date) not tied to one application.
  application_id uuid references public.planner_applications (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160 and title !~ '[\x01-\x1F\x7F]'),
  kind text not null default 'other' check (kind in (
    'application', 'document', 'test', 'scholarship', 'visa', 'interview', 'other'
  )),
  due_on date,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists planner_tasks_user_due_idx
  on public.planner_tasks (user_id, due_on);
create index if not exists planner_tasks_application_idx
  on public.planner_tasks (application_id);

alter table public.planner_tasks enable row level security;

-- A task may only hang off the caller's OWN application (RLS scopes the read
-- anyway, but the write must not be able to reference someone else's row).
create or replace function public.planner_application_is_own(p_application_id uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select p_application_id is null or exists (
    select 1 from public.planner_applications a
    where a.id = p_application_id and a.user_id = auth.uid()
  );
$$;

drop policy if exists planner_tasks_select_own on public.planner_tasks;
create policy planner_tasks_select_own on public.planner_tasks
  for select using (auth.uid() = user_id and public.session_is_passwordless());

drop policy if exists planner_tasks_insert_own on public.planner_tasks;
create policy planner_tasks_insert_own on public.planner_tasks
  for insert with check (
    auth.uid() = user_id and public.session_is_passwordless()
    and public.planner_application_is_own(application_id)
  );

drop policy if exists planner_tasks_update_own on public.planner_tasks;
create policy planner_tasks_update_own on public.planner_tasks
  for update using (auth.uid() = user_id and public.session_is_passwordless())
  with check (
    auth.uid() = user_id and public.session_is_passwordless()
    and public.planner_application_is_own(application_id)
  );

drop policy if exists planner_tasks_delete_own on public.planner_tasks;
create policy planner_tasks_delete_own on public.planner_tasks
  for delete using (auth.uid() = user_id and public.session_is_passwordless());

drop trigger if exists planner_tasks_set_updated_at on public.planner_tasks;
create trigger planner_tasks_set_updated_at
  before update on public.planner_tasks
  for each row execute function public.set_updated_at();

-- Cap: 1,000 tasks per account.
create or replace function public.guard_planner_tasks_cap()
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
    raise exception 'planner_tasks: sign in first' using errcode = 'insufficient_privilege';
  end if;
  -- This BEFORE trigger runs ahead of the RLS WITH CHECK: refuse another
  -- account's row (and a password session) BEFORE counting, so the cap error
  -- can never answer a question about someone else's data (review, 29 Sep 2026).
  if auth.uid() is not null and (new.user_id is distinct from auth.uid() or not public.session_is_passwordless()) then
    raise exception 'planner_tasks: user_id must be the caller' using errcode = 'insufficient_privilege';
  end if;
  -- Serialise the count for this account (see "Caps under concurrent
  -- requests" in the header): a second request waits here until the first
  -- commits, then counts its row.
  perform pg_advisory_xact_lock(hashtextextended('planner_tasks:' || new.user_id::text, 0));
  select count(*) into n from public.planner_tasks where user_id = new.user_id;
  if n >= 1000 then
    raise exception 'planner_tasks_cap' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists planner_tasks_cap on public.planner_tasks;
create trigger planner_tasks_cap
  before insert on public.planner_tasks
  for each row execute function public.guard_planner_tasks_cap();

-- ── Function lockdown + PostgREST grants ────────────────────────────────────
revoke all on function public.guard_planner_applications_cap() from public, anon, authenticated;
revoke all on function public.guard_planner_tasks_cap() from public, anon, authenticated;
-- Evaluated inside a policy as the caller → must stay executable by the API roles.
grant execute on function public.planner_application_is_own(uuid) to anon, authenticated, service_role;

grant select, insert, update, delete on public.planner_applications to service_role;
grant select, insert, update, delete on public.planner_tasks to service_role;

-- Signed-out (anon) callers never write these tables. Supabase's default
-- privileges give every API role ALL on a new public table; RLS refuses an
-- anon write anyway, but a BEFORE trigger runs ahead of RLS, so without this
-- revoke a signed-out request would reach the cap guards (review, 29 Sep
-- 2026). SELECT and DELETE stay: under RLS a signed-out read or delete
-- matches no row, and no trigger runs on either. Re-applied on every run.
revoke insert, update on public.planner_applications, public.planner_tasks from anon;

notify pgrst, 'reload schema';

-- ── Verify (run separately; every value must be non-null) ───────────────────
-- select to_regclass('public.planner_applications') as applications,
--        to_regclass('public.planner_tasks')        as tasks,
--        to_regprocedure('public.planner_application_is_own(uuid)') as own_fn,
--        to_regprocedure('public.guard_planner_tasks_cap()') as cap_fn;
--
-- The signed-out role cannot write any of these tables (every value false):
-- select has_table_privilege('anon', 'public.planner_applications', 'insert, update') as anon_applications,
--        has_table_privilege('anon', 'public.planner_tasks', 'insert, update')        as anon_tasks;

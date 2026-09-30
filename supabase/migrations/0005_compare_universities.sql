-- ============================================================================
-- GlobalStudyBoard — Compare Universities schema (migration 0005). Run ONCE in
-- the Supabase SQL editor of project `globalstudyboard` (ref xrfcxocqqshfilseojau)
-- with the role dropdown on `postgres`, AFTER 0001 (and 0003, 0004). Safe to re-run.
--
-- The third account-only tool (/tools/compare-universities). Four flat tables —
-- every bound is an ordinary column CHECK, no JSON to validate by hand:
--   compare_sets      one comparison board per destination (a student may keep
--                     several): its destination, a label, private notes.
--   compare_criteria  up to 8 criteria the STUDENT names and weights (1–5).
--   compare_entries   up to 4 universities: one of our profiles (by slug, name
--                     snapshot) or the student's own name + https link.
--   compare_scores    the matrix cell — the student's own 1–5 for one
--                     university on one criterion. A row EXISTS = scored; no
--                     row = "not scored yet" (never a false zero).
--
-- Everything numeric here is student-authored. The site's only facts in the
-- tool come from the catalogue at render time (attributed rankings, location,
-- tests …), never from these tables (constitution Rule A, Rule E, §4.5).
--
-- Security posture = migrations 0001/0003/0004: RLS own-row +
-- session_is_passwordless() on every policy; a criterion / entry may only
-- reference the caller's OWN set; a score may only join an entry and a
-- criterion of the SAME set (a client bug could otherwise write a phantom
-- cross-set cell); CHECK-bounded columns; per-account / per-set /
-- per-university caps via SECURITY DEFINER triggers that refuse another
-- account's row, a password session and a signed-out request before
-- counting, and serialise the count (see 0003's header, "Caps under
-- concurrent requests": each guard takes a transaction-scoped advisory lock
-- keyed to what it counts, relying on READ COMMITTED, the Supabase/PostgREST
-- default); function lockdown; explicit service_role grants; no INSERT/UPDATE
-- for the signed-out (anon) role.
--
-- Bounds: 20 comparisons per account × 4 universities × 8 criteria = at most
-- 640 scores per account, which the tool reads in ONE request of up to 1,000
-- rows. The per-university score cap below keeps that true even for a
-- university moved between comparisons through the API (its old scores stay
-- with it), and the serialised counts keep it true under concurrent requests.
--
-- Privacy (§9): rows cascade from auth.users and are included in
-- /api/account/export. Notes are the student's private space; /privacy asks
-- them not to record sensitive personal details there.
-- ============================================================================

-- ── compare_sets ────────────────────────────────────────────────────────────
create table if not exists public.compare_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  region text not null,
  label text not null check (char_length(label) between 1 and 120 and label !~ '[\x01-\x1F\x7F]'),
  notes text check (char_length(notes) <= 4000 and notes !~ '[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The destination list is a NAMED constraint, dropped and re-added, so a re-run
-- of this file always leaves the CURRENT list live (an inline CHECK inside
-- `create table if not exists` is skipped on a re-run, so a new destination
-- would be offered by the tool and refused on every save). A re-run fails
-- loudly, by design, if a row uses a destination being removed.
alter table public.compare_sets drop constraint if exists compare_sets_region_check;
alter table public.compare_sets add constraint compare_sets_region_check check (region in (
    'india', 'usa', 'uk-ireland', 'canada', 'europe', 'australia-nz',
    'middle-east', 'russia', 'east-southeast-asia'
  ));

create index if not exists compare_sets_user_region_idx
  on public.compare_sets (user_id, region, updated_at desc);

alter table public.compare_sets enable row level security;

drop policy if exists compare_sets_select_own on public.compare_sets;
create policy compare_sets_select_own on public.compare_sets
  for select using (auth.uid() = user_id and public.session_is_passwordless());
drop policy if exists compare_sets_insert_own on public.compare_sets;
create policy compare_sets_insert_own on public.compare_sets
  for insert with check (auth.uid() = user_id and public.session_is_passwordless());
drop policy if exists compare_sets_update_own on public.compare_sets;
create policy compare_sets_update_own on public.compare_sets
  for update using (auth.uid() = user_id and public.session_is_passwordless())
  with check (auth.uid() = user_id and public.session_is_passwordless());
drop policy if exists compare_sets_delete_own on public.compare_sets;
create policy compare_sets_delete_own on public.compare_sets
  for delete using (auth.uid() = user_id and public.session_is_passwordless());

drop trigger if exists compare_sets_set_updated_at on public.compare_sets;
create trigger compare_sets_set_updated_at
  before update on public.compare_sets
  for each row execute function public.set_updated_at();

-- Cap: 20 comparisons per account.
create or replace function public.guard_compare_sets_cap()
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
    raise exception 'compare_sets: sign in first' using errcode = 'insufficient_privilege';
  end if;
  -- This BEFORE trigger runs ahead of the RLS WITH CHECK: refuse another
  -- account's row (and a password session) BEFORE counting, so the cap error
  -- can never answer a question about someone else's data (review, 29 Sep 2026).
  if auth.uid() is not null and (new.user_id is distinct from auth.uid() or not public.session_is_passwordless()) then
    raise exception 'compare_sets: user_id must be the caller' using errcode = 'insufficient_privilege';
  end if;
  -- Serialise the count for this account (see "Caps under concurrent
  -- requests" in 0003's header): a second request waits here until the first
  -- commits, then counts its row.
  perform pg_advisory_xact_lock(hashtextextended('compare_sets:' || new.user_id::text, 0));
  select count(*) into n from public.compare_sets where user_id = new.user_id;
  if n >= 20 then
    raise exception 'compare_sets_cap' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists compare_sets_cap on public.compare_sets;
create trigger compare_sets_cap
  before insert on public.compare_sets
  for each row execute function public.guard_compare_sets_cap();

-- A criterion / entry may only hang off the caller's OWN set.
create or replace function public.compare_set_is_own(p_set_id uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1 from public.compare_sets s
    where s.id = p_set_id and s.user_id = auth.uid()
  );
$$;

-- ── compare_criteria ────────────────────────────────────────────────────────
create table if not exists public.compare_criteria (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  set_id uuid not null references public.compare_sets (id) on delete cascade,
  label text not null check (char_length(label) between 1 and 40 and label !~ '[\x01-\x1F\x7F]'),
  -- How much this criterion matters to the student (1–5).
  weight integer not null default 3 check (weight between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists compare_criteria_set_idx on public.compare_criteria (set_id, created_at);
create index if not exists compare_criteria_user_idx on public.compare_criteria (user_id);

alter table public.compare_criteria enable row level security;

drop policy if exists compare_criteria_select_own on public.compare_criteria;
create policy compare_criteria_select_own on public.compare_criteria
  for select using (auth.uid() = user_id and public.session_is_passwordless());
drop policy if exists compare_criteria_insert_own on public.compare_criteria;
create policy compare_criteria_insert_own on public.compare_criteria
  for insert with check (auth.uid() = user_id and public.session_is_passwordless() and public.compare_set_is_own(set_id));
drop policy if exists compare_criteria_update_own on public.compare_criteria;
create policy compare_criteria_update_own on public.compare_criteria
  for update using (auth.uid() = user_id and public.session_is_passwordless())
  with check (auth.uid() = user_id and public.session_is_passwordless() and public.compare_set_is_own(set_id));
drop policy if exists compare_criteria_delete_own on public.compare_criteria;
create policy compare_criteria_delete_own on public.compare_criteria
  for delete using (auth.uid() = user_id and public.session_is_passwordless());

drop trigger if exists compare_criteria_set_updated_at on public.compare_criteria;
create trigger compare_criteria_set_updated_at
  before update on public.compare_criteria
  for each row execute function public.set_updated_at();

-- Cap: 8 criteria per comparison — on insert AND when a row is moved to
-- another comparison (an UPDATE of set_id would otherwise bypass the cap).
create or replace function public.guard_compare_criteria_cap()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  n integer;
begin
  if tg_op = 'UPDATE' and new.set_id is not distinct from old.set_id then
    return new;
  end if;
  -- A signed-out (anon) request has no auth.uid() either — like a
  -- service-role or SQL-editor write, which passes through to RLS — so it is
  -- refused here by its API role, before anything is counted: the request's
  -- role (PostgREST sets it; a request with no JWT at all runs as anon) or
  -- the JWT's role claim. A second line behind the anon INSERT/UPDATE revoke
  -- at the foot of this file.
  if auth.uid() is null and (current_setting('role', true) = 'anon' or auth.jwt() ->> 'role' = 'anon') then
    raise exception 'compare_criteria: sign in first' using errcode = 'insufficient_privilege';
  end if;
  -- This BEFORE trigger runs ahead of the RLS WITH CHECK: refuse another
  -- account's row (and a password session) BEFORE counting, so the cap error
  -- can never answer a question about someone else's data (review, 29 Sep 2026).
  if auth.uid() is not null and (not public.compare_set_is_own(new.set_id) or not public.session_is_passwordless()) then
    raise exception 'compare_criteria: the comparison must be your own' using errcode = 'insufficient_privilege';
  end if;
  -- Serialise the count for this comparison (see "Caps under concurrent
  -- requests" in 0003's header): a second request waits here until the first
  -- commits, then counts its row.
  perform pg_advisory_xact_lock(hashtextextended('compare_criteria:' || new.set_id::text, 0));
  select count(*) into n from public.compare_criteria where set_id = new.set_id;
  if n >= 8 then
    raise exception 'compare_criteria_cap' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists compare_criteria_cap on public.compare_criteria;
create trigger compare_criteria_cap
  before insert or update of set_id on public.compare_criteria
  for each row execute function public.guard_compare_criteria_cap();

-- ── compare_entries ─────────────────────────────────────────────────────────
create table if not exists public.compare_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  set_id uuid not null references public.compare_sets (id) on delete cascade,
  -- Set when the entry was picked from our catalogue (links to /colleges/<slug>).
  college_slug text check (college_slug ~ '^[a-z0-9][a-z0-9-]{0,119}$'),
  name text not null check (char_length(name) between 1 and 160 and name !~ '[\x01-\x1F\x7F]'),
  -- https only, no whitespace: rendered as an <a href> back to the student who typed it.
  official_url text check (char_length(official_url) <= 500 and official_url ~ '^https://[^[:space:]]+$'),
  note text check (char_length(note) <= 300 and note !~ '[\x01-\x1F\x7F]'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists compare_entries_set_idx on public.compare_entries (set_id, created_at);
create index if not exists compare_entries_user_idx on public.compare_entries (user_id);

alter table public.compare_entries enable row level security;

drop policy if exists compare_entries_select_own on public.compare_entries;
create policy compare_entries_select_own on public.compare_entries
  for select using (auth.uid() = user_id and public.session_is_passwordless());
drop policy if exists compare_entries_insert_own on public.compare_entries;
create policy compare_entries_insert_own on public.compare_entries
  for insert with check (auth.uid() = user_id and public.session_is_passwordless() and public.compare_set_is_own(set_id));
drop policy if exists compare_entries_update_own on public.compare_entries;
create policy compare_entries_update_own on public.compare_entries
  for update using (auth.uid() = user_id and public.session_is_passwordless())
  with check (auth.uid() = user_id and public.session_is_passwordless() and public.compare_set_is_own(set_id));
drop policy if exists compare_entries_delete_own on public.compare_entries;
create policy compare_entries_delete_own on public.compare_entries
  for delete using (auth.uid() = user_id and public.session_is_passwordless());

drop trigger if exists compare_entries_set_updated_at on public.compare_entries;
create trigger compare_entries_set_updated_at
  before update on public.compare_entries
  for each row execute function public.set_updated_at();

-- Cap: 4 universities per comparison (the most a side-by-side stays
-- readable) — on insert AND when a row is moved to another comparison.
create or replace function public.guard_compare_entries_cap()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  n integer;
begin
  if tg_op = 'UPDATE' and new.set_id is not distinct from old.set_id then
    return new;
  end if;
  -- A signed-out (anon) request has no auth.uid() either — like a
  -- service-role or SQL-editor write, which passes through to RLS — so it is
  -- refused here by its API role, before anything is counted: the request's
  -- role (PostgREST sets it; a request with no JWT at all runs as anon) or
  -- the JWT's role claim. A second line behind the anon INSERT/UPDATE revoke
  -- at the foot of this file.
  if auth.uid() is null and (current_setting('role', true) = 'anon' or auth.jwt() ->> 'role' = 'anon') then
    raise exception 'compare_entries: sign in first' using errcode = 'insufficient_privilege';
  end if;
  -- This BEFORE trigger runs ahead of the RLS WITH CHECK: refuse another
  -- account's row (and a password session) BEFORE counting, so the cap error
  -- can never answer a question about someone else's data (review, 29 Sep 2026).
  if auth.uid() is not null and (not public.compare_set_is_own(new.set_id) or not public.session_is_passwordless()) then
    raise exception 'compare_entries: the comparison must be your own' using errcode = 'insufficient_privilege';
  end if;
  -- Serialise the count for this comparison (see "Caps under concurrent
  -- requests" in 0003's header): a second request waits here until the first
  -- commits, then counts its row.
  perform pg_advisory_xact_lock(hashtextextended('compare_entries:' || new.set_id::text, 0));
  select count(*) into n from public.compare_entries where set_id = new.set_id;
  if n >= 4 then
    raise exception 'compare_entries_cap' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists compare_entries_cap on public.compare_entries;
create trigger compare_entries_cap
  before insert or update of set_id on public.compare_entries
  for each row execute function public.guard_compare_entries_cap();

-- ── compare_scores ──────────────────────────────────────────────────────────
create table if not exists public.compare_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_id uuid not null references public.compare_entries (id) on delete cascade,
  criterion_id uuid not null references public.compare_criteria (id) on delete cascade,
  -- The student's own rating, 1–5.
  score integer not null check (score between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- The client upserts on this pair.
  unique (entry_id, criterion_id)
);

create index if not exists compare_scores_user_idx on public.compare_scores (user_id);
create index if not exists compare_scores_entry_idx on public.compare_scores (entry_id);

alter table public.compare_scores enable row level security;

-- A score may only join the caller's OWN entry and criterion, and both must
-- belong to the SAME comparison — never a cross-set cell.
create or replace function public.compare_score_is_own(p_entry_id uuid, p_criterion_id uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.compare_entries e
    join public.compare_criteria c on c.set_id = e.set_id
    where e.id = p_entry_id and c.id = p_criterion_id
      and e.user_id = auth.uid() and c.user_id = auth.uid()
  );
$$;

drop policy if exists compare_scores_select_own on public.compare_scores;
create policy compare_scores_select_own on public.compare_scores
  for select using (auth.uid() = user_id and public.session_is_passwordless());
drop policy if exists compare_scores_insert_own on public.compare_scores;
create policy compare_scores_insert_own on public.compare_scores
  for insert with check (auth.uid() = user_id and public.session_is_passwordless() and public.compare_score_is_own(entry_id, criterion_id));
drop policy if exists compare_scores_update_own on public.compare_scores;
create policy compare_scores_update_own on public.compare_scores
  for update using (auth.uid() = user_id and public.session_is_passwordless())
  with check (auth.uid() = user_id and public.session_is_passwordless() and public.compare_score_is_own(entry_id, criterion_id));
drop policy if exists compare_scores_delete_own on public.compare_scores;
create policy compare_scores_delete_own on public.compare_scores
  for delete using (auth.uid() = user_id and public.session_is_passwordless());

drop trigger if exists compare_scores_set_updated_at on public.compare_scores;
create trigger compare_scores_set_updated_at
  before update on public.compare_scores
  for each row execute function public.set_updated_at();

-- Cap: 8 scores per university — one per criterion of its comparison, which
-- the same-set rule above already implies for anything the tool writes. It
-- exists for the API: a university moved to another comparison keeps its old
-- scores, so without it one university could collect a score for every
-- criterion in the account. The tool saves a score with ONE upsert on the
-- (entry, criterion) pair, and ON CONFLICT DO UPDATE fires this BEFORE INSERT
-- trigger before it finds the conflict — so a cell that is already scored is
-- never counted: re-scoring a university with all 8 criteria scored must
-- still work (review, 29 Sep 2026). Also fires when a score is moved to
-- another university (an UPDATE of entry_id).
create or replace function public.guard_compare_scores_cap()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  n integer;
begin
  if tg_op = 'UPDATE' and new.entry_id is not distinct from old.entry_id then
    return new;
  end if;
  -- A signed-out (anon) request has no auth.uid() either — like a
  -- service-role or SQL-editor write, which passes through to RLS — so it is
  -- refused here by its API role, before anything is counted: the request's
  -- role (PostgREST sets it; a request with no JWT at all runs as anon) or
  -- the JWT's role claim. A second line behind the anon INSERT/UPDATE revoke
  -- at the foot of this file.
  if auth.uid() is null and (current_setting('role', true) = 'anon' or auth.jwt() ->> 'role' = 'anon') then
    raise exception 'compare_scores: sign in first' using errcode = 'insufficient_privilege';
  end if;
  -- This BEFORE trigger runs ahead of the RLS WITH CHECK: refuse a cell that
  -- is not the caller's own (or joins two comparisons), and a password
  -- session, BEFORE looking at anything — neither the "already scored" check
  -- nor the count may answer a question about someone else's data.
  if auth.uid() is not null and (not public.compare_score_is_own(new.entry_id, new.criterion_id) or not public.session_is_passwordless()) then
    raise exception 'compare_scores: the university and the criterion must be your own, in one comparison' using errcode = 'insufficient_privilege';
  end if;
  -- Serialise the count for this university (see "Caps under concurrent
  -- requests" in 0003's header): a second request waits here until the first
  -- commits, then counts its row.
  perform pg_advisory_xact_lock(hashtextextended('compare_scores:' || new.entry_id::text, 0));
  -- A cell that is already scored is about to become an UPDATE of that row:
  -- not a new row, never counted. Checked AFTER the lock, so the first score
  -- of this cell committed by a concurrent request is seen here and not
  -- counted as a ninth.
  if tg_op = 'INSERT' and exists (
    select 1 from public.compare_scores where entry_id = new.entry_id and criterion_id = new.criterion_id
  ) then
    return new;
  end if;
  select count(*) into n from public.compare_scores where entry_id = new.entry_id;
  if n >= 8 then
    raise exception 'compare_scores_cap' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists compare_scores_cap on public.compare_scores;
create trigger compare_scores_cap
  before insert or update of entry_id on public.compare_scores
  for each row execute function public.guard_compare_scores_cap();

-- ── Function lockdown + PostgREST grants ────────────────────────────────────
revoke all on function public.guard_compare_sets_cap() from public, anon, authenticated;
revoke all on function public.guard_compare_criteria_cap() from public, anon, authenticated;
revoke all on function public.guard_compare_entries_cap() from public, anon, authenticated;
revoke all on function public.guard_compare_scores_cap() from public, anon, authenticated;
-- Evaluated inside policies as the caller → must stay executable by the API roles.
grant execute on function public.compare_set_is_own(uuid) to anon, authenticated, service_role;
grant execute on function public.compare_score_is_own(uuid, uuid) to anon, authenticated, service_role;

grant select, insert, update, delete on public.compare_sets to service_role;
grant select, insert, update, delete on public.compare_criteria to service_role;
grant select, insert, update, delete on public.compare_entries to service_role;
grant select, insert, update, delete on public.compare_scores to service_role;

-- Signed-out (anon) callers never write these tables. Supabase's default
-- privileges give every API role ALL on a new public table; RLS refuses an
-- anon write anyway, but a BEFORE trigger runs ahead of RLS, so without this
-- revoke a signed-out request would reach the cap guards (review, 29 Sep
-- 2026). SELECT and DELETE stay: under RLS a signed-out read or delete
-- matches no row, and no trigger runs on either. Re-applied on every run.
revoke insert, update on public.compare_sets, public.compare_criteria, public.compare_entries, public.compare_scores from anon;

notify pgrst, 'reload schema';

-- ── Verify (run separately; every value must be non-null) ───────────────────
-- select to_regclass('public.compare_sets')     as sets,
--        to_regclass('public.compare_criteria') as criteria,
--        to_regclass('public.compare_entries')  as entries,
--        to_regclass('public.compare_scores')   as scores,
--        to_regprocedure('public.compare_set_is_own(uuid)')          as own_fn,
--        to_regprocedure('public.compare_score_is_own(uuid, uuid)')  as score_fn,
--        to_regprocedure('public.guard_compare_scores_cap()')         as score_cap_fn;
--
-- The signed-out role cannot write any of these tables (every value false):
-- select has_table_privilege('anon', 'public.compare_sets', 'insert, update')     as anon_sets,
--        has_table_privilege('anon', 'public.compare_criteria', 'insert, update') as anon_criteria,
--        has_table_privilege('anon', 'public.compare_entries', 'insert, update')  as anon_entries,
--        has_table_privilege('anon', 'public.compare_scores', 'insert, update')   as anon_scores;

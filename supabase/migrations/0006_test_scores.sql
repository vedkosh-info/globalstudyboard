-- ============================================================================
-- GlobalStudyBoard — Test Score Tracker schema (migration 0006). Run ONCE in
-- the Supabase SQL editor of project `globalstudyboard` (ref xrfcxocqqshfilseojau)
-- with the role dropdown on `postgres`, AFTER 0001 (and 0003–0005). Safe to re-run.
--
-- The fourth account-only tool (/tools/test-score-tracker). Two flat tables —
-- every bound is an ordinary column CHECK, no JSON to validate by hand:
--   test_scores          one attempt at one exam: the exam (one of the site's
--                        catalogue slugs), the score exactly as the student
--                        received it (text — an SAT composite, an IELTS band,
--                        a JEE percentile and an A-level grade string do not
--                        share a numeric shape), the test date (a sitting that
--                        has happened — booked sittings belong in the planner),
--                        a private note.
--   test_score_sections  up to 6 label/value pairs per attempt (Reading 730,
--                        Math 720; Listening 8.0 …) — the section vocabulary
--                        differs per exam, so pairs, not fixed columns.
--
-- What is deliberately NOT here (§9 minimisation, panel decision 23 Sep 2026):
-- no registration/candidate number, no date of birth, no identity document —
-- none of them serves the tool's purpose. A numeric copy of the score was
-- dropped on 29 Sep 2026: nothing read it (independent review, LEG-4). Every attempt is kept as its own
-- row; the site never computes a "best" or a superscore, never says whether
-- a score meets any requirement (Rule A, §4.5). Score VALIDITY rules are not
-- stored per student: they are official facts held in code
-- (lib/test-validity.ts) with their Tier-1 sources.
--
-- Writes go through public.save_test_score() (one transaction: the attempt and
-- its sections together, or nothing; retry-safe for a new attempt); reads and
-- deletes are plain table calls.
--
-- Security posture = migrations 0001/0003/0004/0005: RLS own-row +
-- session_is_passwordless() on every policy; a section may only reference
-- the caller's OWN attempt; CHECK-bounded columns; per-user / per-attempt
-- caps via SECURITY DEFINER triggers (insert AND re-parent) that refuse
-- another account's row, a password session and a signed-out request before
-- counting, and serialise the count (below); function lockdown; explicit
-- service_role grants; no INSERT/UPDATE for the signed-out (anon) role.
--
-- Caps under concurrent requests (review, 29 Sep 2026). A cap is a count
-- followed by an insert, and a count cannot see a row another request has
-- inserted but not yet committed: two requests in flight at once would both
-- count 99 and both insert. Each guard therefore takes a transaction-scoped
-- advisory lock keyed to exactly what it counts (the account, or the
-- attempt) before counting. A second request for the same scope waits until
-- the first commits or rolls back; its count is a new statement, so under
-- READ COMMITTED (the Supabase/PostgREST default) it takes a new snapshot and
-- sees the first request's row. Under REPEATABLE READ the snapshot is taken
-- once per transaction and the lock would not help. The lock is re-entrant, so
-- one statement inserting many rows still works and is still stopped at the
-- cap. save_test_score() takes at most two of these locks, always in the same
-- order — the account's (only when it inserts a new attempt), then that
-- attempt's — so two saves never wait on each other in a cycle. The local
-- PGlite run proves the guards compile, lock the right key and keep their
-- single-transaction behaviour; PGlite has one backend and cannot run two
-- transactions at once, so the concurrency guarantee rests on PostgreSQL's
-- locking and snapshot rules, not on a test.
--
-- Privacy (§9): rows cascade from auth.users and are included in
-- /api/account/export. The note is the student's private space; /privacy
-- asks them not to record sensitive personal details there.
-- ============================================================================

-- ── test_scores ─────────────────────────────────────────────────────────────
create table if not exists public.test_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- One of the site's exam catalogue slugs (lib/admission-guides.ts). A literal
  -- list, like the region CHECKs: a renamed or new exam is a migration edit,
  -- which scripts/check-tools.ts enforces against the catalogue at build time.
  exam_slug text not null,
  -- The score as received, verbatim ("1450", "7.5", "99.2 percentile", "A*AA").
  score_text text not null check (char_length(score_text) between 1 and 200 and score_text !~ '[\x01-\x1F\x7F]'),
  -- The sitting date (a calendar date; validity is date arithmetic from it).
  -- Bounded by the named test_scores_test_date_check below.
  test_date date not null,
  note text check (note is null or (char_length(note) <= 2000 and note !~ '[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists test_scores_user_exam_idx on public.test_scores (user_id, exam_slug, test_date desc);

-- Re-run safety for databases that ran an earlier draft of this file.
alter table public.test_scores drop column if exists score_numeric;

-- A score exists only once the test has been sat, so the date may not be in
-- the future. One day of slack: a student east of UTC can be on "tomorrow"
-- while current_date (UTC) is still today. Named and re-applied, like the exam
-- list below, so a re-run always leaves the current rule live.
alter table public.test_scores drop constraint if exists test_scores_test_date_check;
alter table public.test_scores add constraint test_scores_test_date_check
  check (test_date >= date '1990-01-01' and test_date <= current_date + 1);

-- The allowed exam list, applied as a NAMED constraint AFTER the table exists.
-- It is deliberately not an inline CHECK inside `create table if not exists`:
-- that form is skipped on a re-run, so adding a 54th exam to
-- lib/admission-guides.ts and re-running this file (the header promises it is
-- safe to re-run) would leave the OLD list live — the picker would offer the
-- exam and every save would be refused. Dropping and re-adding makes a re-run
-- genuinely current. `scripts/check-tools.ts` parses this same literal and
-- fails the build if it drifts from the catalogue.
alter table public.test_scores drop constraint if exists test_scores_exam_slug_check;
alter table public.test_scores add constraint test_scores_exam_slug_check check (exam_slug in (
    'sat', 'act', 'ap-exams', 'gre', 'gmat', 'mcat', 'lsat', 'a-levels',
    'international-baccalaureate', 'ucat', 'testas', 'testdaf', 'ielts', 'toefl',
    'duolingo-english-test', 'pte-academic', 'jee-main', 'jee-advanced', 'neet-ug',
    'cat', 'clat', 'ailet', 'gate', 'cuet-ug', 'mht-cet', 'kcet', 'wbjee',
    'ap-eapcet', 'ts-eamcet', 'keam', 'gujcet', 'bitsat', 'viteee', 'comedk-uget',
    'ssc-chsl', 'ssc-mts', 'ibps-po', 'ibps-clerk', 'sbi-po', 'rbi-grade-b',
    'ssc-cgl', 'cds', 'afcat', 'capf-ac', 'ctet', 'ugc-net', 'csir-net', 'cuet-pg',
    'neet-pg', 'nata', 'iit-jam', 'nchm-jee', 'ipmat'
  ));

alter table public.test_scores enable row level security;

drop policy if exists test_scores_select_own on public.test_scores;
create policy test_scores_select_own on public.test_scores
  for select using (auth.uid() = user_id and public.session_is_passwordless());
drop policy if exists test_scores_insert_own on public.test_scores;
create policy test_scores_insert_own on public.test_scores
  for insert with check (auth.uid() = user_id and public.session_is_passwordless());
drop policy if exists test_scores_update_own on public.test_scores;
create policy test_scores_update_own on public.test_scores
  for update using (auth.uid() = user_id and public.session_is_passwordless())
  with check (auth.uid() = user_id and public.session_is_passwordless());
drop policy if exists test_scores_delete_own on public.test_scores;
create policy test_scores_delete_own on public.test_scores
  for delete using (auth.uid() = user_id and public.session_is_passwordless());

drop trigger if exists test_scores_set_updated_at on public.test_scores;
create trigger test_scores_set_updated_at
  before update on public.test_scores
  for each row execute function public.set_updated_at();

-- Cap: 100 recorded attempts per account. A BEFORE trigger runs ahead of the
-- RLS WITH CHECK, so it refuses a row for another account itself (otherwise a
-- caller could learn from the cap error whether some other user_id already
-- holds 100 rows). Only a service-role or SQL-editor write (no signed-in user)
-- passes through to RLS; a signed-out (anon) request is refused.
create or replace function public.guard_test_scores_cap()
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
    raise exception 'test_scores: sign in first' using errcode = 'insufficient_privilege';
  end if;
  -- Another account's row, or a password-authenticated session, is refused
  -- BEFORE counting (a planted password must not learn even "does this
  -- account hold 100 attempts?" from the cap error).
  if auth.uid() is not null and (new.user_id is distinct from auth.uid() or not public.session_is_passwordless()) then
    raise exception 'test_scores: user_id must be the caller' using errcode = 'insufficient_privilege';
  end if;
  -- Serialise the count for this account (see "Caps under concurrent
  -- requests" in the header): a second request waits here until the first
  -- commits, then counts its row.
  perform pg_advisory_xact_lock(hashtextextended('test_scores:' || new.user_id::text, 0));
  select count(*) into n from public.test_scores where user_id = new.user_id;
  if n >= 100 then
    raise exception 'test_scores_cap' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists test_scores_cap on public.test_scores;
create trigger test_scores_cap
  before insert on public.test_scores
  for each row execute function public.guard_test_scores_cap();

-- A section may only hang off the caller's OWN attempt.
create or replace function public.test_score_is_own(p_score_id uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1 from public.test_scores s
    where s.id = p_score_id and s.user_id = auth.uid()
  );
$$;

-- ── test_score_sections ─────────────────────────────────────────────────────
create table if not exists public.test_score_sections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  score_id uuid not null references public.test_scores (id) on delete cascade,
  label text not null check (char_length(label) between 1 and 40 and label !~ '[\x01-\x1F\x7F]'),
  value text not null check (char_length(value) between 1 and 40 and value !~ '[\x01-\x1F\x7F]'),
  position smallint not null default 0 check (position between 0 and 5),
  created_at timestamptz not null default now()
);

create index if not exists test_score_sections_score_idx on public.test_score_sections (score_id, position);
create index if not exists test_score_sections_user_idx on public.test_score_sections (user_id);

create unique index if not exists test_score_sections_score_position_idx
  on public.test_score_sections (score_id, position);

alter table public.test_score_sections enable row level security;

drop policy if exists test_score_sections_select_own on public.test_score_sections;
create policy test_score_sections_select_own on public.test_score_sections
  for select using (auth.uid() = user_id and public.session_is_passwordless());
drop policy if exists test_score_sections_insert_own on public.test_score_sections;
create policy test_score_sections_insert_own on public.test_score_sections
  for insert with check (auth.uid() = user_id and public.session_is_passwordless() and public.test_score_is_own(score_id));
drop policy if exists test_score_sections_update_own on public.test_score_sections;
create policy test_score_sections_update_own on public.test_score_sections
  for update using (auth.uid() = user_id and public.session_is_passwordless())
  with check (auth.uid() = user_id and public.session_is_passwordless() and public.test_score_is_own(score_id));
drop policy if exists test_score_sections_delete_own on public.test_score_sections;
create policy test_score_sections_delete_own on public.test_score_sections
  for delete using (auth.uid() = user_id and public.session_is_passwordless());

-- Cap: 6 sections per attempt — on insert AND when a row is moved to another attempt.
create or replace function public.guard_test_score_sections_cap()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  n integer;
begin
  if tg_op = 'UPDATE' and new.score_id is not distinct from old.score_id then
    return new;
  end if;
  -- A signed-out (anon) request has no auth.uid() either — like a
  -- service-role or SQL-editor write, which passes through to RLS — so it is
  -- refused here by its API role, before anything is counted: the request's
  -- role (PostgREST sets it; a request with no JWT at all runs as anon) or
  -- the JWT's role claim. A second line behind the anon INSERT/UPDATE revoke
  -- at the foot of this file.
  if auth.uid() is null and (current_setting('role', true) = 'anon' or auth.jwt() ->> 'role' = 'anon') then
    raise exception 'test_score_sections: sign in first' using errcode = 'insufficient_privilege';
  end if;
  -- This BEFORE trigger runs ahead of the RLS WITH CHECK, so it must refuse a
  -- row aimed at someone else's attempt itself: otherwise the cap error would
  -- answer "does that attempt already have 6 sections?" for any score id.
  if auth.uid() is not null and (not public.test_score_is_own(new.score_id) or not public.session_is_passwordless()) then
    raise exception 'test_score_sections: the attempt must be your own' using errcode = 'insufficient_privilege';
  end if;
  -- Serialise the count for this attempt (see "Caps under concurrent
  -- requests" in the header): a second request waits here until the first
  -- commits, then counts its row.
  perform pg_advisory_xact_lock(hashtextextended('test_score_sections:' || new.score_id::text, 0));
  select count(*) into n from public.test_score_sections where score_id = new.score_id;
  if n >= 6 then
    raise exception 'test_score_sections_cap' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists test_score_sections_cap on public.test_score_sections;
create trigger test_score_sections_cap
  before insert or update of score_id on public.test_score_sections
  for each row execute function public.guard_test_score_sections_cap();

-- ── Atomic save: an attempt and its sections in ONE transaction ────────────
-- The tool writes through this function, never through separate table calls.
-- Before it existed, an edit was three requests (update the attempt, delete its
-- sections, insert the new ones); a failure after the delete left the attempt
-- with NO sections on the server while the form closed and the student's typed
-- values were gone (independent review, 24 Sep 2026). Here any failure — a
-- CHECK, the per-account cap, the six-sections cap, an attempt that no longer
-- exists — raises, and PostgREST rolls the whole call back.
--
-- SECURITY INVOKER: every statement runs as the caller, so the RLS policies
-- (own row + passwordless session) and the cap triggers above apply exactly as
-- they do to direct table writes. An id that is not the caller's own simply
-- matches no row and is reported as not found.
--
-- p_id is ALWAYS the attempt's id. For a new attempt (p_is_new) the client
-- generates it when the form opens, so a retry after a lost response finds the
-- row it already created and updates it instead of adding a duplicate
-- (independent review, 29 Sep 2026). For an edit (not p_is_new) it is the
-- existing attempt, and an attempt deleted meanwhile is reported as not found
-- rather than silently re-created. Sections are replaced whole on every call;
-- p_sections is a JSON array of {label, value} in display order, positions
-- 0..n-1 assigned here. Returns the saved attempt and its sections as JSON.
--
-- The earlier draft's signature (with a numeric score) is dropped first, so a
-- re-run never leaves two overloads behind.
drop function if exists public.save_test_score(uuid, text, text, numeric, date, text, jsonb);

create or replace function public.save_test_score(
  p_id uuid,
  p_is_new boolean,
  p_exam_slug text,
  p_score_text text,
  p_test_date date,
  p_note text,
  p_sections jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  r public.test_scores;
  item jsonb;
  i integer := 0;
begin
  if auth.uid() is null or not public.session_is_passwordless() then
    raise exception 'test_scores: sign in first' using errcode = 'insufficient_privilege';
  end if;
  if p_id is null or p_is_new is null then
    raise exception 'test_scores: an attempt id is required' using errcode = 'invalid_parameter_value';
  end if;
  if p_sections is null then
    p_sections := '[]'::jsonb;
  end if;
  if jsonb_typeof(p_sections) <> 'array' then
    raise exception 'test_scores: sections must be a list' using errcode = 'invalid_parameter_value';
  end if;
  if jsonb_array_length(p_sections) > 6 then
    raise exception 'test_score_sections_cap' using errcode = 'check_violation';
  end if;

  -- RLS makes only the caller's own rows visible or updatable here.
  update public.test_scores
     set exam_slug = p_exam_slug,
         score_text = p_score_text,
         test_date = p_test_date,
         note = p_note
   where id = p_id
  returning * into r;

  if not found then
    if not p_is_new then
      raise exception 'test_score_not_found' using errcode = 'no_data_found';
    end if;
    -- An id held by another account collides on the primary key and raises;
    -- the caller learns nothing about that row.
    insert into public.test_scores (id, user_id, exam_slug, score_text, test_date, note)
    values (p_id, auth.uid(), p_exam_slug, p_score_text, p_test_date, p_note)
    returning * into r;
  end if;

  delete from public.test_score_sections where score_id = r.id;
  for item in select value from jsonb_array_elements(p_sections) loop
    insert into public.test_score_sections (user_id, score_id, label, value, position)
    values (auth.uid(), r.id, item->>'label', item->>'value', i);
    i := i + 1;
  end loop;

  return jsonb_build_object(
    'score', to_jsonb(r),
    'sections', coalesce(
      (select jsonb_agg(to_jsonb(x) order by x.position) from public.test_score_sections x where x.score_id = r.id),
      '[]'::jsonb
    )
  );
end;
$$;

-- ── Function lockdown + PostgREST grants ────────────────────────────────────
revoke all on function public.guard_test_scores_cap() from public, anon, authenticated;
revoke all on function public.guard_test_score_sections_cap() from public, anon, authenticated;
-- Evaluated inside policies as the caller → must stay executable by the API roles.
grant execute on function public.test_score_is_own(uuid) to anon, authenticated, service_role;
-- The tool's only write path. Signed-in callers only; RLS still applies inside it.
revoke all on function public.save_test_score(uuid, boolean, text, text, date, text, jsonb) from public, anon;
grant execute on function public.save_test_score(uuid, boolean, text, text, date, text, jsonb) to authenticated, service_role;

grant select, insert, update, delete on public.test_scores to service_role;
grant select, insert, update, delete on public.test_score_sections to service_role;

-- Signed-out (anon) callers never write these tables. Supabase's default
-- privileges give every API role ALL on a new public table; RLS refuses an
-- anon write anyway, but a BEFORE trigger runs ahead of RLS, so without this
-- revoke a signed-out request would reach the cap guards (review, 29 Sep
-- 2026). SELECT and DELETE stay: under RLS a signed-out read or delete
-- matches no row, and no trigger runs on either. Re-applied on every run.
revoke insert, update on public.test_scores, public.test_score_sections from anon;

notify pgrst, 'reload schema';

-- ── Verify (run separately; every value must be non-null) ───────────────────
-- select to_regclass('public.test_scores')          as scores,
--        to_regclass('public.test_score_sections')  as sections,
--        to_regprocedure('public.test_score_is_own(uuid)')      as own_fn,
--        to_regprocedure('public.guard_test_scores_cap()')      as cap_fn,
--        to_regprocedure('public.save_test_score(uuid, boolean, text, text, date, text, jsonb)') as save_fn;
--
-- The signed-out role cannot write any of these tables (every value false):
-- select has_table_privilege('anon', 'public.test_scores', 'insert, update')         as anon_scores,
--        has_table_privilege('anon', 'public.test_score_sections', 'insert, update') as anon_sections;

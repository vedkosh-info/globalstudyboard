-- ============================================================================
-- GlobalStudyBoard — Accounts schema (migration 0001). Run ONCE in the Supabase
-- SQL editor of project `globalstudyboard` (ref xrfcxocqqshfilseojau) with the
-- role dropdown on `postgres`. Safe to re-run: everything is IF NOT EXISTS /
-- CREATE OR REPLACE / DROP … IF EXISTS.
--
-- Design (mirrors what VedKosh proved in production; see supabase/migrations/README.md):
--   profiles       1:1 with auth.users. The MINIMUM an account needs (privacy
--                  constitution §9.1): a display name, the remembered study
--                  destination + audience view, and consent timestamps. No email
--                  column — the address lives only in auth.users. No date of
--                  birth, gender, nationality or phone: the site has no use for
--                  them and its audience includes school-age visitors.
--   saved_items    A student's shortlist (guides / universities / exams / hubs).
--                  Stores a TITLE SNAPSHOT so /account can render the list from
--                  these rows alone — the client bundle must never import the
--                  content catalogue. The href is derived from (kind, slug) in
--                  code, never stored.
--   admin_actions  Append-only trail of owner-console mutations. RLS on with ZERO
--                  policies: only the service role reads or writes it.
--
-- Row bootstrap: the app creates a user's profiles row on first sign-in
-- (ensureProfile() under the insert-own policy — after OTP verify, and in the
-- OAuth callback). There is deliberately NO trigger on auth.users: CREATE TRIGGER
-- there takes an ACCESS EXCLUSIVE lock on the auth table, a failure inside it can
-- roll back GoTrue's own INSERT (a registration outage with no kill switch), and
-- the dashboard role cannot DROP it afterwards.
--
-- Security posture applied from day one:
--   * RLS scopes ROWS, not columns → a BEFORE trigger owns the consent stamps
--     (server clock, only when the consent-gated sign-in doors send a
--     consent_version; frozen on UPDATE, re-stamped only when the version moves
--     forward) so a user cannot backdate, fabricate or null their consent record.
--   * Every policy also requires a PASSWORDLESS session (session_is_passwordless)
--     — see the guard below for the pre-registration attack this closes.
--   * SECURITY DEFINER functions are EXECUTE-able by PUBLIC (= anon) by default and
--     every public function is exposed as POST /rest/v1/rpc/<name> → revoke from
--     public/anon/authenticated and change the schema default privileges.
--   * Explicit service_role grants so PostgREST never drops a relation from its
--     schema cache after the PUBLIC revoke.
-- ============================================================================

-- ── Session guard: this site never offers password sign-in ──────────────────
-- Supabase's e-mail provider still accepts POST /auth/v1/signup with a password
-- from anyone holding the public key, which enables a pre-registration attack:
-- plant a password on a victim's address before their first passwordless sign-in,
-- wait for that sign-in to confirm the address, then sign in with the password.
-- The JWT's `amr` claim records HOW a session was authenticated, so every policy
-- below additionally requires a session with no `password` method — a planted
-- password can never read or write account data. (The API routes apply the same
-- check server-side via getClaims().) Executable by the API roles because RLS
-- evaluates it as the caller.
create or replace function public.session_is_passwordless()
returns boolean
language sql
stable
set search_path = public
as $$
  select not exists (
    select 1
    from jsonb_array_elements(coalesce(auth.jwt() -> 'amr', '[]'::jsonb)) as e
    where (case when jsonb_typeof(e) = 'string' then e #>> '{}' else e ->> 'method' end) = 'password'
  );
$$;

-- Belt and braces: an Auth "Customize Access Token" hook that REFUSES to mint a
-- token for any password-authenticated sign-in (the dedicated "password
-- verification attempt" hook is Team-plan only; this one is available on Free
-- and receives `authentication_method`). A planted password therefore never
-- yields a session at all — the RLS/API `amr` checks above are the second line.
-- After running this file, enable it: Authentication → Auth Hooks → "Customize
-- Access Token (JWT) Claims hook" → Postgres → schema public →
-- custom_access_token_hook. (Only supabase_auth_admin may execute it.)
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer set search_path = public
as $$
declare
  method text := event ->> 'authentication_method';
  amr jsonb := coalesce(event -> 'claims' -> 'amr', '[]'::jsonb);
  used_password boolean;
begin
  select exists (
    select 1 from jsonb_array_elements(amr) as e
    where (case when jsonb_typeof(e) = 'string' then e #>> '{}' else e ->> 'method' end) = 'password'
  ) into used_password;
  if method = 'password' or used_password then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'Password sign-in is not available on GlobalStudyBoard. Use the e-mailed code or link, or Google.'
      )
    );
  end if;
  return jsonb_build_object('claims', event -> 'claims');
end;
$$;
revoke all on function public.custom_access_token_hook(jsonb) from public, anon, authenticated;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;

-- ── profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  -- Mirrors the gsb_region / gsb_audience preference cookies so a signed-in
  -- student's choice follows them across devices. Bounded to the real slugs in
  -- lib/regions.ts and lib/audience.ts; NULL = no preference recorded yet.
  preferred_region text check (preferred_region in (
    'india', 'usa', 'uk-ireland', 'canada', 'europe', 'australia-nz',
    'middle-east', 'russia', 'east-southeast-asia'
  )),
  preferred_audience text check (preferred_audience in ('domestic', 'international')),
  -- The revision date of the Terms/Privacy the visitor accepted (the client
  -- sends it ONLY from the consent-gated sign-in doors); NULL = no consent
  -- recorded yet, which the account page turns into a consent step.
  consent_version text check (consent_version ~ '^\d{4}-\d{2}-\d{2}$'),
  consent_tos_at timestamptz,
  consent_privacy_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id and public.session_is_passwordless());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id and public.session_is_passwordless());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id and public.session_is_passwordless())
  with check (auth.uid() = id and public.session_is_passwordless());

-- No DELETE policy: a profile only disappears through the account-deletion
-- cascade (auth.admin.deleteUser → auth.users delete → profiles cascade).

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Consent record. The sign-in UI refuses to start EITHER door (e-mail or Google)
-- until the visitor ticks "I am 18 or older, I agree to the Terms of Use and I
-- have read the Privacy Policy", and ONLY those doors send `consent_version`
-- (the revision date the form showed). The trigger then stamps both timestamps
-- with the SERVER clock — a client-sent timestamp is ignored — so a row created
-- by any other path (a dashboard invite, a raw API sign-up) carries NO consent
-- record and the account page asks for it. On UPDATE the stamps are frozen; the
-- only way to change them is to move `consent_version` FORWARD (a re-acceptance
-- after a policy revision), which re-stamps with the new server time. Nothing
-- can backdate, null or edit an existing record.
create or replace function public.guard_profile_consent()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.consent_version is not null then
      new.consent_tos_at := now();
      new.consent_privacy_at := now();
    else
      new.consent_tos_at := null;
      new.consent_privacy_at := null;
    end if;
    return new;
  end if;
  if new.consent_version is not null
     and (old.consent_version is null or new.consent_version > old.consent_version) then
    new.consent_tos_at := now();
    new.consent_privacy_at := now();
    return new;
  end if;
  new.consent_version := old.consent_version;
  new.consent_tos_at := old.consent_tos_at;
  new.consent_privacy_at := old.consent_privacy_at;
  return new;
end;
$$;

drop trigger if exists profiles_guard_consent on public.profiles;
create trigger profiles_guard_consent
  before insert or update on public.profiles
  for each row execute function public.guard_profile_consent();

-- ── saved_items ─────────────────────────────────────────────────────────────
create table if not exists public.saved_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('guide', 'college', 'exam', 'topic')),
  slug text not null check (slug ~ '^[a-z0-9][a-z0-9-]{0,119}$'),
  -- Title snapshot: what the page was called when it was saved. Bounded and
  -- printable; rendered as a React text node (never HTML) on /account.
  title text not null check (char_length(title) between 1 and 200 and title !~ '[\x01-\x1F\x7F]'),
  region text check (region in (
    'india', 'usa', 'uk-ireland', 'canada', 'europe', 'australia-nz',
    'middle-east', 'russia', 'east-southeast-asia', 'global'
  )),
  created_at timestamptz not null default now(),
  primary key (user_id, kind, slug)
);

create index if not exists saved_items_user_created_idx
  on public.saved_items (user_id, created_at desc);

alter table public.saved_items enable row level security;

drop policy if exists saved_items_select_own on public.saved_items;
create policy saved_items_select_own on public.saved_items
  for select using (auth.uid() = user_id and public.session_is_passwordless());

drop policy if exists saved_items_insert_own on public.saved_items;
create policy saved_items_insert_own on public.saved_items
  for insert with check (auth.uid() = user_id and public.session_is_passwordless());

drop policy if exists saved_items_delete_own on public.saved_items;
create policy saved_items_delete_own on public.saved_items
  for delete using (auth.uid() = user_id and public.session_is_passwordless());

-- No UPDATE policy: a saved item is added or removed, never edited.

-- RLS bounds WHO may write, not HOW MANY: cap the shortlist so one account
-- cannot fill the free-tier database.
create or replace function public.guard_saved_items_cap()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  n integer;
begin
  select count(*) into n from public.saved_items where user_id = new.user_id;
  if n >= 500 then
    raise exception 'saved_items_cap' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists saved_items_cap on public.saved_items;
create trigger saved_items_cap
  before insert on public.saved_items
  for each row execute function public.guard_saved_items_cap();

-- ── admin_actions ───────────────────────────────────────────────────────────
-- Owner-console audit trail. Stores the target's user id (not their e-mail —
-- that would keep PII of a deleted account) plus a bounded, e-mail-scrubbed
-- note. Rows are kept for 12 months (purge_admin_actions, called from the admin
-- API) and the note is cleared the moment the target account is deleted, so
-- what outlives an account is only "action + when".
create table if not exists public.admin_actions (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  admin_email text not null check (char_length(admin_email) <= 254),
  action text not null check (action in ('ban', 'unban', 'delete')),
  target_user_id uuid not null,
  reason text check (char_length(reason) <= 300)
);

create index if not exists admin_actions_target_idx on public.admin_actions (target_user_id, at desc);

alter table public.admin_actions enable row level security;
-- Zero policies on purpose: anon/authenticated see an empty set and cannot
-- write; only the service role (the admin API routes) reads or appends. A
-- user's own rows are surfaced in their data export by the export route.

create or replace function public.purge_admin_actions(p_keep_days integer default 365)
returns integer
language plpgsql
security definer set search_path = public
as $$
declare
  n integer;
begin
  -- Floor on the keep window so a careless caller cannot shorten retention.
  delete from public.admin_actions where at < now() - make_interval(days => greatest(p_keep_days, 30));
  get diagnostics n = row_count;
  return n;
end;
$$;

-- ── Function lockdown + PostgREST grants ────────────────────────────────────
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.guard_profile_consent() from public, anon, authenticated;
revoke all on function public.guard_saved_items_cap() from public, anon, authenticated;
revoke all on function public.purge_admin_actions(integer) from public, anon, authenticated;
grant execute on function public.purge_admin_actions(integer) to service_role;
-- The session guard MUST stay executable by the API roles: RLS evaluates it as
-- the caller, and a policy whose function the role cannot execute denies all.
grant execute on function public.session_is_passwordless() to anon, authenticated, service_role;

alter default privileges in schema public revoke execute on functions from public;
alter default privileges in schema public revoke execute on functions from anon;
alter default privileges in schema public revoke execute on functions from authenticated;

grant select, insert, update, delete on public.profiles to service_role;
grant select, insert, update, delete on public.saved_items to service_role;
grant select, insert, update, delete on public.admin_actions to service_role;

-- Ask PostgREST to pick up the new relations immediately.
notify pgrst, 'reload schema';

-- ── Verify (run separately; every value must be non-null) ───────────────────
-- select to_regclass('public.profiles')      as profiles,
--        to_regclass('public.saved_items')   as saved_items,
--        to_regclass('public.admin_actions') as admin_actions,
--        to_regprocedure('public.guard_profile_consent()') as consent_fn,
--        to_regprocedure('public.session_is_passwordless()') as guard_fn,
--        to_regprocedure('public.custom_access_token_hook(jsonb)') as hook_fn;

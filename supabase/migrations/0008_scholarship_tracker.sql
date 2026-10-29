-- GlobalStudyBoard — Scholarship Application Tracker. Apply AFTER 0001–0007
-- to project xrfcxocqqshfilseojau as postgres. Re-runnable. No file storage.
-- Every detail/date/status is entered by the student; nothing here establishes
-- eligibility or confirms an award. Entries/checklist cascade on account delete.
--
-- All RPCs are SECURITY INVOKER: RLS remains enforcement. BEFORE guards refuse
-- signed-out/password/cross-account requests before relation checks and counts.
-- Caps serialize with transaction advisory locks under READ COMMITTED, in order:
-- account -> entry -> child. Budget transfer locks account -> entry -> budget.
-- At REPEATABLE READ a transaction snapshot can predate a lock wait; use the
-- standard Supabase/PostgREST READ COMMITTED isolation (see migration 0003).
-- Same guide+destination+cycle is unique. Retried quick-add returns the existing
-- record unchanged. A new manual record retries with the same client-minted UUID.

create table if not exists public.scholarship_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 160 and name !~ '[\x01-\x1F\x7F]'),
  provider text check (provider is null or (char_length(provider) <= 160 and provider !~ '[\x01-\x1F\x7F]')),
  official_url text check (official_url is null or (char_length(official_url) <= 500 and official_url ~ '^https://[^/?#[:space:]@]+([/?#][^[:space:]]*)?$')),
  guide_slug text check (guide_slug is null or (char_length(guide_slug) <= 160 and guide_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')),
  cycle text check (cycle is null or (char_length(cycle) <= 40 and cycle !~ '[\x01-\x1F\x7F]')),
  region text not null,
  application_id uuid references public.planner_applications(id) on delete set null,
  status text not null default 'researching' check (status in ('researching','preparing','submitted','shortlisted','offered','accepted','received','unsuccessful','withdrawn')),
  notes text check (notes is null or (char_length(notes) <= 2000 and notes !~ '[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]')),
  budget_item_id uuid references public.budget_items(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.scholarship_entries drop constraint if exists scholarship_entries_region_check;
alter table public.scholarship_entries add constraint scholarship_entries_region_check check (region in (
  'india','usa','uk-ireland','canada','europe','australia-nz','middle-east','russia','east-southeast-asia'
));
create index if not exists scholarship_entries_user_region_idx on public.scholarship_entries(user_id,region,created_at desc);
create unique index if not exists scholarship_entries_guide_cycle_idx on public.scholarship_entries(user_id,guide_slug,region,lower(btrim(coalesce(cycle,'')))) where guide_slug is not null;
create unique index if not exists scholarship_entries_budget_item_idx on public.scholarship_entries(budget_item_id) where budget_item_id is not null;

create table if not exists public.scholarship_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scholarship_id uuid not null references public.scholarship_entries(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 160 and title !~ '[\x01-\x1F\x7F]'),
  due_on date check (due_on is null or (due_on >= date '1990-01-01' and due_on <= date '2100-12-31')),
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists scholarship_tasks_user_idx on public.scholarship_tasks(user_id);
create index if not exists scholarship_tasks_entry_idx on public.scholarship_tasks(scholarship_id,due_on);

alter table public.scholarship_entries enable row level security;
alter table public.scholarship_tasks enable row level security;
drop policy if exists scholarship_entries_select_own on public.scholarship_entries;
create policy scholarship_entries_select_own on public.scholarship_entries for select using (auth.uid()=user_id and public.session_is_passwordless());
drop policy if exists scholarship_entries_insert_own on public.scholarship_entries;
create policy scholarship_entries_insert_own on public.scholarship_entries for insert with check (auth.uid()=user_id and public.session_is_passwordless());
drop policy if exists scholarship_entries_update_own on public.scholarship_entries;
create policy scholarship_entries_update_own on public.scholarship_entries for update using (auth.uid()=user_id and public.session_is_passwordless()) with check (auth.uid()=user_id and public.session_is_passwordless());
drop policy if exists scholarship_entries_delete_own on public.scholarship_entries;
create policy scholarship_entries_delete_own on public.scholarship_entries for delete using (auth.uid()=user_id and public.session_is_passwordless());
drop policy if exists scholarship_tasks_select_own on public.scholarship_tasks;
create policy scholarship_tasks_select_own on public.scholarship_tasks for select using (auth.uid()=user_id and public.session_is_passwordless());
drop policy if exists scholarship_tasks_insert_own on public.scholarship_tasks;
create policy scholarship_tasks_insert_own on public.scholarship_tasks for insert with check (auth.uid()=user_id and public.session_is_passwordless());
drop policy if exists scholarship_tasks_update_own on public.scholarship_tasks;
create policy scholarship_tasks_update_own on public.scholarship_tasks for update using (auth.uid()=user_id and public.session_is_passwordless()) with check (auth.uid()=user_id and public.session_is_passwordless());
drop policy if exists scholarship_tasks_delete_own on public.scholarship_tasks;
create policy scholarship_tasks_delete_own on public.scholarship_tasks for delete using (auth.uid()=user_id and public.session_is_passwordless());

create or replace function public.guard_scholarship_entry()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null and (current_setting('role',true) in ('anon','authenticated') or auth.jwt()->>'role' in ('anon','authenticated')) then
    raise exception 'scholarship_sign_in' using errcode='insufficient_privilege';
  end if;
  if auth.uid() is not null and (new.user_id is distinct from auth.uid() or not public.session_is_passwordless()) then
    raise exception 'scholarship_owner' using errcode='insufficient_privilege';
  end if;
  if tg_op='UPDATE' and (new.user_id is distinct from old.user_id or new.id is distinct from old.id) then
    raise exception 'scholarship_owner' using errcode='insufficient_privilege';
  end if;
  if new.application_id is not null and not exists(select 1 from public.planner_applications a where a.id=new.application_id and a.user_id=new.user_id and a.region=new.region) then
    raise exception 'scholarship_application_invalid' using errcode='check_violation';
  end if;
  if new.budget_item_id is not null and not exists(select 1 from public.budget_items i join public.budget_plans p on p.id=i.plan_id where i.id=new.budget_item_id and i.user_id=new.user_id and p.user_id=new.user_id and p.region=new.region and i.kind='funding' and i.category='scholarship') then
    raise exception 'scholarship_budget_invalid' using errcode='check_violation';
  end if;
  if tg_op='INSERT' then
    perform pg_advisory_xact_lock(hashtextextended('scholarship_account:'||new.user_id::text,0));
    if (select count(*) from public.scholarship_entries where user_id=new.user_id)>=100 then
      raise exception 'scholarship_entries_cap' using errcode='check_violation';
    end if;
  end if;
  return new;
end; $$;
drop trigger if exists scholarship_entries_guard on public.scholarship_entries;
create trigger scholarship_entries_guard before insert or update on public.scholarship_entries for each row execute function public.guard_scholarship_entry();
drop trigger if exists scholarship_entries_set_updated_at on public.scholarship_entries;
create trigger scholarship_entries_set_updated_at before update on public.scholarship_entries for each row execute function public.set_updated_at();

create or replace function public.guard_scholarship_task()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null and (current_setting('role',true) in ('anon','authenticated') or auth.jwt()->>'role' in ('anon','authenticated')) then
    raise exception 'scholarship_sign_in' using errcode='insufficient_privilege';
  end if;
  if auth.uid() is not null and (new.user_id is distinct from auth.uid() or not public.session_is_passwordless()) then
    raise exception 'scholarship_owner' using errcode='insufficient_privilege';
  end if;
  if tg_op='UPDATE' and (new.user_id is distinct from old.user_id or new.id is distinct from old.id) then
    raise exception 'scholarship_owner' using errcode='insufficient_privilege';
  end if;
  if not exists(select 1 from public.scholarship_entries e where e.id=new.scholarship_id and e.user_id=new.user_id) then
    raise exception 'scholarship_entry_not_found' using errcode='check_violation';
  end if;
  -- Account before entry is the same ordering as the save RPCs and caps.
  perform pg_advisory_xact_lock(hashtextextended('scholarship_account:'||new.user_id::text,0));
  perform pg_advisory_xact_lock(hashtextextended('scholarship_tasks:'||new.scholarship_id::text,0));
  if (select count(*) from public.scholarship_tasks where user_id=new.user_id and id<>new.id)>=1000 then
    raise exception 'scholarship_task_total_cap' using errcode='check_violation';
  end if;
  if (select count(*) from public.scholarship_tasks where scholarship_id=new.scholarship_id and id<>new.id)>=20 then
    raise exception 'scholarship_tasks_cap' using errcode='check_violation';
  end if;
  return new;
end; $$;
drop trigger if exists scholarship_tasks_guard on public.scholarship_tasks;
create trigger scholarship_tasks_guard before insert or update on public.scholarship_tasks for each row execute function public.guard_scholarship_task();
drop trigger if exists scholarship_tasks_set_updated_at on public.scholarship_tasks;
create trigger scholarship_tasks_set_updated_at before update on public.scholarship_tasks for each row execute function public.set_updated_at();

create or replace function public.save_scholarship_entry(
  p_id uuid,p_is_new boolean,p_name text,p_region text,p_provider text default null,
  p_official_url text default null,p_guide_slug text default null,p_cycle text default null,
  p_application_id uuid default null,p_status text default 'researching',p_notes text default null,
  p_expected_updated_at timestamptz default null
) returns public.scholarship_entries language plpgsql security invoker set search_path=public as $$
declare r public.scholarship_entries;
begin
  if auth.uid() is null or not public.session_is_passwordless() then
    raise exception 'scholarship_sign_in' using errcode='insufficient_privilege';
  end if;
  if p_id is null or p_is_new is null then raise exception 'scholarship_invalid_id' using errcode='invalid_parameter_value'; end if;
  perform pg_advisory_xact_lock(hashtextextended('scholarship_account:'||auth.uid()::text,0));
  select * into r from public.scholarship_entries where id=p_id for update;
  if found then
    -- A retried creation cannot overwrite an edit made elsewhere afterwards.
    if p_is_new then return r; end if;
    if p_expected_updated_at is not null and r.updated_at is distinct from p_expected_updated_at then
      raise exception 'scholarship_entry_stale' using errcode='serialization_failure';
    end if;
    update public.scholarship_entries set name=btrim(p_name),region=p_region,provider=nullif(btrim(p_provider),''),official_url=nullif(btrim(p_official_url),''),guide_slug=nullif(p_guide_slug,''),cycle=nullif(btrim(p_cycle),''),application_id=p_application_id,status=p_status,notes=nullif(btrim(p_notes),'') where id=p_id returning * into r;
    return r;
  end if;
  if not p_is_new then raise exception 'scholarship_entry_not_found' using errcode='no_data_found'; end if;
  if nullif(p_guide_slug,'') is not null then
    select * into r from public.scholarship_entries where user_id=auth.uid() and guide_slug=p_guide_slug and region=p_region and lower(btrim(coalesce(cycle,'')))=lower(btrim(coalesce(p_cycle,''))) for update;
    if found then return r; end if;
  end if;
  insert into public.scholarship_entries(id,user_id,name,region,provider,official_url,guide_slug,cycle,application_id,status,notes)
  values(p_id,auth.uid(),btrim(p_name),p_region,nullif(btrim(p_provider),''),nullif(btrim(p_official_url),''),nullif(p_guide_slug,''),nullif(btrim(p_cycle),''),p_application_id,p_status,nullif(btrim(p_notes),'')) returning * into r;
  insert into public.scholarship_tasks(user_id,scholarship_id,title)
    values(auth.uid(),r.id,'Check the current requirements on the official site');
  return r;
end; $$;

create or replace function public.save_scholarship_task(
  p_id uuid,p_is_new boolean,p_scholarship_id uuid,p_title text,p_due_on date default null,
  p_done boolean default false,p_expected_updated_at timestamptz default null
) returns public.scholarship_tasks language plpgsql security invoker set search_path=public as $$
declare r public.scholarship_tasks;
begin
  if auth.uid() is null or not public.session_is_passwordless() then raise exception 'scholarship_sign_in' using errcode='insufficient_privilege'; end if;
  if p_id is null or p_is_new is null then raise exception 'scholarship_invalid_id' using errcode='invalid_parameter_value'; end if;
  perform pg_advisory_xact_lock(hashtextextended('scholarship_account:'||auth.uid()::text,0));
  select * into r from public.scholarship_tasks where id=p_id for update;
  if found then
    if p_is_new then return r; end if;
    if p_expected_updated_at is not null and r.updated_at is distinct from p_expected_updated_at then raise exception 'scholarship_task_stale' using errcode='serialization_failure'; end if;
    update public.scholarship_tasks set scholarship_id=p_scholarship_id,title=btrim(p_title),due_on=p_due_on,done=p_done where id=p_id returning * into r;
    return r;
  end if;
  if not p_is_new then raise exception 'scholarship_task_not_found' using errcode='no_data_found'; end if;
  insert into public.scholarship_tasks(id,user_id,scholarship_id,title,due_on,done)
    values(p_id,auth.uid(),p_scholarship_id,btrim(p_title),p_due_on,p_done) returning * into r;
  return r;
end; $$;

create or replace function public.add_scholarship_to_budget(
  p_scholarship_id uuid,p_plan_id uuid,p_amount numeric,p_currency_code text,p_period text
) returns jsonb language plpgsql security invoker set search_path=public as $$
declare e public.scholarship_entries; p public.budget_plans; i public.budget_items; units integer;
begin
  if auth.uid() is null or not public.session_is_passwordless() then raise exception 'scholarship_sign_in' using errcode='insufficient_privilege'; end if;
  perform pg_advisory_xact_lock(hashtextextended('scholarship_account:'||auth.uid()::text,0));
  select * into e from public.scholarship_entries where id=p_scholarship_id for update;
  if not found then raise exception 'scholarship_entry_not_found' using errcode='no_data_found'; end if;
  if e.status not in ('accepted','received') then raise exception 'scholarship_budget_status' using errcode='check_violation'; end if;
  select * into p from public.budget_plans where id=p_plan_id for update;
  if not found then raise exception 'scholarship_budget_not_found' using errcode='no_data_found'; end if;
  if p.region<>e.region then raise exception 'scholarship_budget_region' using errcode='check_violation'; end if;
  if p_currency_code is null or p.currency_code<>p_currency_code or p_currency_code not in ('AUD','CAD','EUR','INR','GBP','RUB','USD','AED','BHD','CHF','CNY','CZK','DKK','HKD','HUF','IDR','JPY','KRW','KWD','KZT','MYR','NOK','NZD','OMR','PHP','PLN','QAR','SAR','SEK','SGD','THB','TWD','VND') then
    raise exception 'scholarship_budget_currency' using errcode='check_violation';
  end if;
  -- Match the existing cost planner's two-decimal storage; zero-decimal
  -- currencies must not silently acquire fractional minor units.
  units:=case when p_currency_code in ('JPY','KRW','VND') then 0 else 2 end;
  if p_amount is null or p_amount<=0 or p_amount>=100000000 or p_amount<>trunc(p_amount,units) then
    raise exception 'scholarship_budget_amount' using errcode='check_violation';
  end if;
  if p_period is null or p_period not in ('once','year') then raise exception 'scholarship_budget_period' using errcode='check_violation'; end if;
  if e.budget_item_id is not null then
    select * into i from public.budget_items where id=e.budget_item_id;
    if found and i.plan_id=p_plan_id and i.amount=p_amount and i.period=p_period then
      return jsonb_build_object('item_id',i.id,'already_added',true);
    end if;
    raise exception 'scholarship_budget_already_added' using errcode='check_violation';
  end if;
  insert into public.budget_items(user_id,plan_id,kind,category,label,amount,period,note)
    values(auth.uid(),p.id,'funding','scholarship',left(e.name,80),p_amount,p_period,'Added from your scholarship tracker after you confirmed this funding. Check any conditions with the provider.') returning * into i;
  update public.scholarship_entries set budget_item_id=i.id where id=e.id;
  return jsonb_build_object('item_id',i.id,'already_added',false);
end; $$;

revoke all on function public.guard_scholarship_entry() from public,anon,authenticated;
revoke all on function public.guard_scholarship_task() from public,anon,authenticated;
revoke all on function public.save_scholarship_entry(uuid,boolean,text,text,text,text,text,text,uuid,text,text,timestamptz) from public,anon;
revoke all on function public.save_scholarship_task(uuid,boolean,uuid,text,date,boolean,timestamptz) from public,anon;
revoke all on function public.add_scholarship_to_budget(uuid,uuid,numeric,text,text) from public,anon;
grant execute on function public.save_scholarship_entry(uuid,boolean,text,text,text,text,text,text,uuid,text,text,timestamptz) to authenticated,service_role;
grant execute on function public.save_scholarship_task(uuid,boolean,uuid,text,date,boolean,timestamptz) to authenticated,service_role;
grant execute on function public.add_scholarship_to_budget(uuid,uuid,numeric,text,text) to authenticated,service_role;
grant select,insert,update,delete on public.scholarship_entries,public.scholarship_tasks to authenticated,service_role;
grant select,delete on public.scholarship_entries,public.scholarship_tasks to anon;
revoke insert,update on public.scholarship_entries,public.scholarship_tasks from anon;
notify pgrst,'reload schema';

-- Verify after applying (non-null, then false):
-- select to_regclass('public.scholarship_entries'),to_regclass('public.scholarship_tasks'),
--   to_regprocedure('public.save_scholarship_entry(uuid,boolean,text,text,text,text,text,text,uuid,text,text,timestamptz)'),
--   to_regprocedure('public.save_scholarship_task(uuid,boolean,uuid,text,date,boolean,timestamptz)'),
--   to_regprocedure('public.add_scholarship_to_budget(uuid,uuid,numeric,text,text)');
-- select has_table_privilege('anon','public.scholarship_entries','insert,update'),
--   has_table_privilege('anon','public.scholarship_tasks','insert,update');

/** Local-only PostgreSQL behavior tests. No network, credentials or real accounts.
 * Install the test runtime without changing project dependencies:
 * npm install --prefix image-pipeline/raw/scholarship-qa-runtime --package-lock=false @electric-sql/pglite
 * node scripts/qa/scholarship-database.mjs
 * PGlite has one backend: this tests lock presence/behavior, not concurrent sessions.
 */
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const runtime = process.env.PGLITE_MODULE ?? resolve('image-pipeline/raw/scholarship-qa-runtime/node_modules/@electric-sql/pglite/dist/index.js');
const { PGlite } = await import(pathToFileURL(runtime).href);
const db = new PGlite();
let checks = 0;
const ok = (condition, label) => { assert.ok(condition, label); checks++; };
const q = async (sql, params = []) => (await db.query(sql, params)).rows;
const scalar = async (sql, params = []) => Object.values((await q(sql, params))[0])[0];
const uid = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const A=uid(1), B=uid(2), C=uid(3), D=uid(4), E=uid(5);
async function session(user=A, method='otp', role='authenticated') {
  await db.exec('reset role');
  await q("select set_config('request.jwt.claim.sub',$1,false)",[user ?? '']);
  await q("select set_config('request.jwt.claims',$1,false)",[JSON.stringify({role,amr:[{method}]})]);
  if (role !== 'postgres') await db.exec(`set role ${role}`);
}
async function rejects(sql, params, pattern, label) {
  try { await q(sql,params); assert.fail(`${label}: unexpectedly allowed`); }
  catch (error) { if (error instanceof assert.AssertionError) throw error; assert.match(error.message,pattern,label); checks++; }
}
async function entry(n, opts={}) {
  const {name='Award',region='usa',guide=null,cycle=null,status='researching',application=null}=opts;
  return (await q('select * from public.save_scholarship_entry($1,true,$2,$3,null,null,$4,$5,$6,$7)',[uid(n),name,region,guide,cycle,application,status]))[0];
}
async function task(n, award, title='Action', done=false, due=null) {
  return (await q('select * from public.save_scholarship_task($1,true,$2,$3,$4,$5)',[uid(n),award,title,due,done]))[0];
}
async function budget(n, region='usa',currency='USD') {
  return (await q('insert into public.budget_plans(id,user_id,region,label,currency_code) values($1,auth.uid(),$2,$3,$4) returning *',[uid(n),region,'Test budget',currency]))[0];
}
try {
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls; create role supabase_auth_admin;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
    grant usage on schema public,auth to anon,authenticated,service_role,supabase_auth_admin;
    grant execute on all functions in schema auth to anon,authenticated,service_role,supabase_auth_admin;
    alter default privileges in schema public grant all on tables to anon,authenticated,service_role;
    create schema cron;
    create function cron.schedule(text,text,text) returns bigint language sql as $$ select 1::bigint $$;
  `);
  const files=(await readdir('supabase/migrations')).filter((f)=>/^000[1-8]_.*\.sql$/.test(f)).sort();
  for (const file of files) {
    const sql=(await readFile(`supabase/migrations/${file}`,'utf8')).replace('create extension if not exists pg_cron;','-- Test stub: PGlite has no scheduler; cron.schedule is a no-op above.');
    await db.exec(sql);
  }
  ok(files.length===8,'all eight migration files applied (cron scheduler stubbed)');
  await q('insert into auth.users(id) select unnest($1::uuid[])',[[A,B,C,D,E]]);
  await session();
  const first=await entry(101,{guide:'test-award',cycle:'2027'});
  ok(first.name==='Award' && first.status==='researching','name-only creation defaults');
  ok(await scalar('select count(*)::int from scholarship_tasks where scholarship_id=$1',[first.id])===1,'creation adds exactly one undated checklist item');
  ok(await scalar('select due_on is null from scholarship_tasks where scholarship_id=$1',[first.id]),'default task fabricates no date');
  const again=await entry(101,{name:'Changed while retrying'});
  ok(again.name==='Award','retry same UUID preserves existing row');
  const duplicate=await entry(102,{guide:'test-award',cycle:' 2027 ',name:'Do not overwrite'});
  ok(duplicate.id===first.id && duplicate.name==='Award','quick-add normalized cycle dedupe');
  const nextCycle=await entry(103,{guide:'test-award',cycle:'2028'});
  ok(nextCycle.id!==first.id,'new cycle is a separate record');
  const otherDestination=await entry(104,{guide:'test-award',cycle:'2027',region:'india'});
  ok(otherDestination.id!==first.id,'destination stays separate');
  const current=(await q("select * from save_scholarship_entry($1,false,'Edited','usa',null,null,'test-award','2027',null,'preparing',null,$2)",[first.id,first.updated_at]))[0];
  ok(current.name==='Edited' && current.status==='preparing','edit with current revision');
  await rejects("select * from save_scholarship_entry($1,false,'Lost update','usa',null,null,null,null,null,'researching',null,$2)",[first.id,'2000-01-01T00:00:00Z'],/scholarship_entry_stale/,'stale entry refused');
  await rejects("select * from save_scholarship_entry($1,false,'Missing','usa')",[uid(999)],/scholarship_entry_not_found/,'edit cannot recreate deleted record');
  await rejects("select * from save_scholarship_entry($1,true,' ','usa')",[uid(110)],/check constraint/,'blank name refused');
  await rejects("select * from save_scholarship_entry($1,true,'A','unknown')",[uid(110)],/region_check/,'unknown destination refused');
  await rejects("select * from save_scholarship_entry($1,true,'A','usa',null,'javascript:alert(1)')",[uid(110)],/check constraint/,'unsafe URL refused');
  await rejects("select * from save_scholarship_entry($1,true,'A','usa',null,'https://name:password@example.edu')",[uid(110)],/check constraint/,'URL credentials refused');
  await rejects("select * from save_scholarship_entry($1,true,'A','usa',null,null,null,null,null,'guaranteed')",[uid(110)],/check constraint/,'unknown status refused');
  const appA=uid(201),appB=uid(202),appIndia=uid(203);
  await q("insert into planner_applications(id,user_id,name,region) values($1,auth.uid(),'College','usa'),($2,auth.uid(),'College India','india')",[appA,appIndia]);
  await entry(111,{application:appA}); checks++;
  await rejects("select * from save_scholarship_entry($1,true,'A','usa',null,null,null,null,$2)",[uid(112),appIndia],/scholarship_application_invalid/,'cross-destination application refused');
  const item=await task(301,first.id,'Send application',false,'2027-01-31');
  ok(new Date(item.due_on).toISOString().slice(0,10)==='2027-01-31' && !item.done,'student date and open state saved');
  await q('select * from save_scholarship_task($1,false,$2,$3,null,true,$4)',[item.id,first.id,'Sent',item.updated_at]); checks++;
  await rejects('select * from save_scholarship_task($1,false,$2,$3,null,true,$4)',[item.id,first.id,'Stale','2000-01-01T00:00:00Z'],/scholarship_task_stale/,'stale task refused');
  await rejects('select * from save_scholarship_task($1,false,$2,$3)',[uid(399),first.id,'Missing'],/scholarship_task_not_found/,'task edit cannot recreate deleted row');
  await rejects('select * from save_scholarship_task($1,true,$2,$3,$4)',[uid(302),first.id,'Date','2027-02-30'],/date\/time field value out of range/,'impossible calendar date refused');
  await rejects('select * from save_scholarship_task($1,true,$2,$3,$4)',[uid(302),first.id,'Date','2200-01-01'],/check constraint/,'unbounded date refused');
  const budgetA=await budget(401), budgetIndia=await budget(402,'india','INR'),budgetJPY=await budget(403,'usa','JPY');
  await rejects('select add_scholarship_to_budget($1,$2,100,$3,$4)',[first.id,budgetA.id,'USD','once'],/scholarship_budget_status/,'unconfirmed funding refused');
  await q("update scholarship_entries set status='accepted' where id=$1",[first.id]);
  await rejects('select add_scholarship_to_budget($1,$2,100,$3,$4)',[first.id,budgetIndia.id,'INR','once'],/scholarship_budget_region/,'cross-destination budget refused');
  await rejects('select add_scholarship_to_budget($1,$2,100,$3,$4)',[first.id,budgetA.id,'EUR','once'],/scholarship_budget_currency/,'wrong currency refused');
  await rejects('select add_scholarship_to_budget($1,$2,100,$3,$4)',[first.id,budgetA.id,'USD','month'],/scholarship_budget_period/,'unsupported recurrence refused');
  for(const amount of ['0','-1','100000000','0.001','NaN','Infinity']) await rejects('select add_scholarship_to_budget($1,$2,$3::numeric,$4,$5)',[first.id,budgetA.id,amount,'USD','once'],/scholarship_budget_amount/,`invalid amount ${amount} refused`);
  await rejects('select add_scholarship_to_budget($1,$2,100.5,$3,$4)',[first.id,budgetJPY.id,'JPY','once'],/scholarship_budget_amount/,'fractional yen refused');
  const transfer=await scalar('select add_scholarship_to_budget($1,$2,123.45,$3,$4)',[first.id,budgetA.id,'USD','once']);
  ok(!transfer.already_added,'first transfer creates budget line');
  const retry=await scalar('select add_scholarship_to_budget($1,$2,123.45,$3,$4)',[first.id,budgetA.id,'USD','once']);
  ok(retry.already_added && transfer.item_id===retry.item_id,'transfer is retry safe');
  ok(await scalar('select count(*)::int from budget_items where plan_id=$1',[budgetA.id])===1,'only one funding line');
  await rejects('select add_scholarship_to_budget($1,$2,150,$3,$4)',[first.id,budgetA.id,'USD','once'],/scholarship_budget_already_added/,'different retry never overwrites funding');
  await q('delete from budget_items where id=$1',[transfer.item_id]);
  ok(await scalar('select budget_item_id is null from scholarship_entries where id=$1',[first.id]),'budget deletion clears source link');
  await scalar('select add_scholarship_to_budget($1,$2,123.45,$3,$4)',[first.id,budgetA.id,'USD','once']); checks++;
  await session(B);
  await q("insert into planner_applications(id,user_id,name,region) values($1,auth.uid(),'Other college','usa')",[appB]);
  const foreign=await entry(501); const foreignTask=await task(502,foreign.id); const foreignBudget=await budget(503);
  ok(await scalar('select count(*)::int from scholarship_entries where id=$1',[first.id])===0,'other account cannot read entries');
  ok(await scalar('select count(*)::int from scholarship_tasks where scholarship_id=$1',[first.id])===0,'other account cannot read tasks');
  await rejects('insert into scholarship_entries(user_id,name,region) values($1,$2,$3)',[A,'Forged','usa'],/scholarship_owner/,'cross-account owner refused before cap');
  await rejects('insert into scholarship_tasks(user_id,scholarship_id,title) values($1,$2,$3)',[A,first.id,'Forged'],/scholarship_owner/,'cross-account task owner refused');
  await rejects('insert into scholarship_tasks(user_id,scholarship_id,title) values(auth.uid(),$1,$2)',[first.id,'Other parent'],/scholarship_entry_not_found/,'cannot attach own task to other account');
  await rejects("select * from save_scholarship_entry($1,false,'Hijack','usa')",[first.id],/scholarship_entry_not_found/,'other account cannot edit');
  await rejects("select * from save_scholarship_entry($1,true,'Hijack','usa')",[first.id],/duplicate key/,'new UUID collision cannot take another account row');
  ok((await q('delete from scholarship_entries where id=$1 returning id',[first.id])).length===0,'other account cannot delete');
  await session(A);
  await rejects("select * from save_scholarship_entry($1,true,'Other application','usa',null,null,null,null,$2)",[uid(113),appB],/scholarship_application_invalid/,'other account application refused');
  await rejects('select add_scholarship_to_budget($1,$2,100,$3,$4)',[first.id,foreignBudget.id,'USD','once'],/scholarship_budget_not_found/,'other account budget refused');
  await session(A,'password');
  ok(await scalar('select count(*)::int from scholarship_entries')===0,'password session reads nothing');
  await rejects("select * from save_scholarship_entry($1,true,'A','usa')",[uid(114)],/scholarship_sign_in/,'password RPC refused');
  await rejects("insert into scholarship_entries(user_id,name,region) values($1,'A','usa')",[A],/scholarship_owner/,'password direct write refused');
  await session(null,'otp','authenticated');
  await rejects("insert into scholarship_entries(user_id,name,region) values($1,'A','usa')",[A],/scholarship_sign_in/,'authenticated role without subject refused before counts');
  await rejects("insert into scholarship_tasks(user_id,scholarship_id,title) values($1,$2,'A')",[A,first.id],/scholarship_sign_in/,'subjectless task refused before counts');
  await session(null,'otp','anon');
  ok(await scalar('select count(*)::int from scholarship_entries')===0,'signed-out reads empty');
  await rejects("insert into scholarship_entries(user_id,name,region) values($1,'A','usa')",[A],/permission denied/,'anon write privilege revoked');
  await rejects("select * from save_scholarship_entry($1,true,'A','usa')",[uid(114)],/permission denied/,'anon RPC privilege revoked');
  await session(C);
  const cap=await entry(601);
  for(let i=0;i<19;i++) await task(610+i,cap.id);
  await rejects('select * from save_scholarship_task($1,true,$2,$3)',[uid(630),cap.id,'Too many'],/scholarship_tasks_cap/,'20 tasks cap');
  const movable=await entry(602); const moveTask=await task(631,movable.id);
  await rejects('update scholarship_tasks set scholarship_id=$1 where id=$2',[cap.id,moveTask.id],/scholarship_tasks_cap/,'task cap holds on move');
  await q('update scholarship_tasks set done=true where scholarship_id=$1',[cap.id]); checks++;
  for(let i=0;i<98;i++) await entry(700+i);
  await rejects("select * from save_scholarship_entry($1,true,'A','usa')",[uid(899)],/scholarship_entries_cap/,'100 entries cap');
  await session(D);
  for(let i=0;i<50;i++) {
    const e=await entry(1000+i);
    for(let j=0;j<19;j++) await task(2000+i*20+j,e.id);
  }
  ok(await scalar('select count(*)::int from scholarship_tasks')===1000,'1000 total tasks reachable');
  await rejects("select * from save_scholarship_entry($1,true,'Would exceed total','usa')",[uid(1099)],/scholarship_task_total_cap/,'total cap prevents default task');
  ok(await scalar('select count(*)::int from scholarship_entries where id=$1',[uid(1099)])===0,'entry and initial task roll back together');
  await session(E);
  const fullBudget=await budget(3001);
  await q("insert into budget_items(user_id,plan_id,kind,category,label,amount) select auth.uid(),$1,'funding','other','Existing',1 from generate_series(1,60)",[fullBudget.id]);
  const fullAward=await entry(3002,{status:'accepted'});
  await rejects('select add_scholarship_to_budget($1,$2,10,$3,$4)',[fullAward.id,fullBudget.id,'USD','once'],/budget_items_cap/,'budget cap respected');
  ok(await scalar('select budget_item_id is null from scholarship_entries where id=$1',[fullAward.id]),'failed transfer leaves no link');
  await session(null,'otp','postgres');
  await q('delete from auth.users where id=$1',[B]);
  ok(await scalar('select count(*)::int from scholarship_entries where id=$1',[foreign.id])===0,'account deletion cascades entries');
  ok(await scalar('select count(*)::int from scholarship_tasks where id=$1',[foreignTask.id])===0,'account deletion cascades tasks');
  await db.exec(await readFile('supabase/migrations/0008_scholarship_tracker.sql','utf8'));
  checks++;
  ok(!await scalar("select has_table_privilege('anon','scholarship_entries','insert,update')"),'re-run keeps anonymous entry writes revoked');
  ok(!await scalar("select has_table_privilege('anon','scholarship_tasks','insert,update')"),'re-run keeps anonymous task writes revoked');
  const guards=await q("select pg_get_functiondef(p.oid) as body from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('guard_scholarship_entry','guard_scholarship_task')");
  ok(guards.length===2 && guards.every((g)=>g.body.includes('pg_advisory_xact_lock')),'both cap guards contain serialized locks');
  console.log(`PASS: ${checks} scholarship database checks; all eight migrations compiled, cron stubbed, migration 0008 re-run. Local PGlite only; no production or concurrent-session claim.`);
} finally { await db.close(); }

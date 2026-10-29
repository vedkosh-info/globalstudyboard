/** Browser-to-local-PostgreSQL integration. Fake auth; all external requests blocked.
 * Actual scholarship RPCs/RLS run in PGlite. No production data or credentials.
 * Requires the isolated PGlite runtime used by scholarship-database.mjs and Playwright.
 */
import assert from 'node:assert/strict';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? '/Users/pratap88bhanu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const { PGlite } = await import(pathToFileURL(resolve('image-pipeline/raw/scholarship-qa-runtime/node_modules/@electric-sql/pglite/dist/index.js')).href);
const db = new PGlite();
const userId = '00000000-0000-4000-8000-000000000001';
const appId = '00000000-0000-4000-8000-000000000101';
const budgetId = '00000000-0000-4000-8000-000000000201';
const out = 'image-pipeline/raw/scholarship-browser-2026-10-28';
const base = process.env.QA_BASE_URL ?? 'http://localhost:5000';
const checks = [];
const check = (label, condition=true) => { assert.ok(condition,label); checks.push(label); };
// PGlite returns SQL date as a JS Date; PostgREST returns YYYY-MM-DD. Match the
// production wire format instead of sending an ISO timestamp for due_on.
const wireJson = value => JSON.stringify(value, (key, field) => key === 'due_on' && typeof field === 'string' ? field.slice(0, 10) : field);
await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create role supabase_auth_admin; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$; create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$; grant usage on schema public,auth to anon,authenticated,service_role,supabase_auth_admin; grant execute on all functions in schema auth to anon,authenticated,service_role,supabase_auth_admin; alter default privileges in schema public grant all on tables to anon,authenticated,service_role; create schema cron; create function cron.schedule(text,text,text) returns bigint language sql as $$select 1::bigint$$;`);
for (const file of (await readdir('supabase/migrations')).filter(f=>/^000[1-8]_.*\.sql$/.test(f)).sort()) await db.exec((await readFile(`supabase/migrations/${file}`,'utf8')).replace('create extension if not exists pg_cron;','-- local scheduler stub'));
await db.query('insert into auth.users(id) values($1)',[userId]);
await db.query("select set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claims',$2,false)",[userId,JSON.stringify({role:'authenticated',amr:[{method:'otp'}]})]);
await db.exec('set role authenticated');
await db.query("insert into planner_applications(id,user_id,name,region) values($1,$2,'Test University','usa')",[appId,userId]);
await db.query("insert into budget_plans(id,user_id,region,label,currency_code) values($1,$2,'usa','Study budget','USD')",[budgetId,userId]);
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
const user={id:userId,aud:'authenticated',role:'authenticated',email:'local-qa@example.invalid',app_metadata:{provider:'email',providers:['email']},user_metadata:{},identities:[],created_at:'2026-10-28T00:00:00Z'};
const enc=v=>Buffer.from(JSON.stringify(v)).toString('base64url');
const now=Math.floor(Date.now()/1000);
const token=`${enc({alg:'HS256',typ:'JWT'})}.${enc({sub:userId,aud:'authenticated',role:'authenticated',iat:now,exp:now+3600,amr:[{method:'otp',timestamp:now}],email:user.email})}.localmock`;
await context.addCookies([{name:'sb-xrfcxocqqshfilseojau-auth-token',value:'base64-'+enc({access_token:token,refresh_token:'local-qa-dummy-refresh',token_type:'bearer',expires_in:3600,expires_at:now+3600,user}),domain:'localhost',path:'/'}]);
const requests=[];let loseNextCreate=false;
const tables=new Set(['scholarship_entries','scholarship_tasks','planner_applications','budget_plans','budget_items']);
const functions=new Set(['save_scholarship_entry','save_scholarship_task','add_scholarship_to_budget']);
await context.route('**/*',async route=>{
 const req=route.request(),url=new URL(req.url());
 if(url.origin===base)return route.continue();
 if(url.hostname!=='xrfcxocqqshfilseojau.supabase.co')return route.abort();
 if(url.pathname==='/auth/v1/user')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(user)});
 if(!url.pathname.startsWith('/rest/v1/'))return route.abort();
 requests.push({path:url.pathname,method:req.method()});
 try{
  if(url.pathname.includes('/rpc/')){
   const fn=url.pathname.split('/').at(-1);if(!functions.has(fn))return route.abort();
   const input=req.postDataJSON();const keys=Object.keys(input);assert(keys.every(k=>/^p_[a-z_]+$/.test(k)));
   const result=await db.query(`select * from public.${fn}(${keys.map((k,i)=>`${k}=>$${i+1}`).join(',')})`,keys.map(k=>input[k]));
   if(loseNextCreate&&fn==='save_scholarship_entry'&&input.p_is_new){loseNextCreate=false;return route.abort('failed');}
   const data=fn==='add_scholarship_to_budget'?result.rows[0][fn]:result.rows[0];
   return route.fulfill({status:200,contentType:'application/json',body:wireJson(data)});
  }
  const table=url.pathname.split('/').at(-1);
  if(!tables.has(table))return route.fulfill({status:200,contentType:'application/json',body:'[]'});
  const params=[],where=[];
  for(const [key,value]of url.searchParams){if(!/^[a-z_]+$/.test(key)||!value.startsWith('eq.'))continue;params.push(value.slice(3));where.push(`${key}=$${params.length}`);}
  const filter=where.length?' where '+where.join(' and '):'';
  let sql;
  if(req.method()==='DELETE'){assert(where.some(w=>w.startsWith('id=')));sql=`delete from ${table}${filter} returning id`;}
  else if(req.method()==='GET'){
   const select=url.searchParams.get('select')??'*';assert(select==='*'||/^[a-z_,]+$/.test(select));
   const orders=(url.searchParams.get('order')??'').split(',').filter(Boolean).map(order=>{const [key,dir,nulls]=order.split('.');assert(/^[a-z_]+$/.test(key));return `${key} ${dir==='desc'?'desc':'asc'} ${nulls==='nullslast'?'nulls last':''}`;});
   sql=`select ${select} from ${table}${filter}${orders.length?' order by '+orders.join(','):''} limit ${Math.min(1000,Number(url.searchParams.get('limit')??1000))}`;
  }else return route.abort();
  const result=await db.query(sql,params);return route.fulfill({status:200,contentType:'application/json',body:wireJson(result.rows)});
 }catch(error){return route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({code:error.code??'P0001',message:error.message,details:null,hint:null})});}
});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(`${base}/tools/scholarship-tracker#region=usa`,{waitUntil:'networkidle'});
 await page.locator('#scholarship-name').waitFor();
 await page.locator('#scholarship-name').fill('My scholarship');
 await page.getByRole('button',{name:'Save scholarship',exact:true}).first().click();
 const card=page.locator('article').filter({has:page.getByRole('heading',{name:'My scholarship',exact:true})});
 await card.waitFor();await page.getByRole('status').filter({hasText:'Scholarship saved'}).waitFor();
 check('Name-only save reaches actual SQL RPC and creates one checklist item',(await db.query('select count(*)::int as n from scholarship_tasks')).rows[0].n===1);
 check('Optional details stay collapsed after save',!await card.locator('details').first().evaluate(e=>e.open));
 await card.locator('summary').first().click();
 await card.getByLabel('Provider (optional)',{exact:true}).fill('Example provider');
 await card.getByLabel('Private notes (optional)',{exact:true}).fill('Private test note');
 await card.getByRole('button',{name:'Save details',exact:true}).click();
 await page.getByRole('status').filter({hasText:'Changes saved'}).waitFor();
 check('Details saved to SQL',(await db.query('select provider,notes from scholarship_entries')).rows[0].notes==='Private test note');
 await card.getByLabel('Next step',{exact:true}).fill('Submit form');await card.getByLabel('Due date (optional)').fill('2027-01-10');
 await card.getByRole('button',{name:'Add step',exact:true}).click();
 await card.getByText('Submit form',{exact:true}).first().waitFor();
 await card.getByText('10 Jan 2027',{exact:true}).first().waitFor();
 check('Student date renders from the PostgREST date wire format');
 check('Student date written to actual checklist',(await db.query("select count(*)::int as n from scholarship_tasks where title='Submit form'")).rows[0].n===1);
 await card.getByLabel('Application stage',{exact:true}).selectOption('accepted');
 await card.getByText('Add confirmed funding to a budget',{exact:true}).click();
 await card.getByLabel('Confirmed amount (USD)',{exact:true}).fill('1250.50');
 await card.getByRole('button',{name:'Add funding',exact:true}).click();
 await card.getByText('Added to your budget',{exact:true}).waitFor();
 check('Confirmed funding crosses tool boundary once',(await db.query('select amount from budget_items')).rows[0].amount==='1250.50');
 // Real stale revision in SQL while the browser holds an unsaved draft.
 await card.getByLabel('Provider (optional)',{exact:true}).fill('My newer edit');
 await db.query("update scholarship_entries set provider='Other device' where name='My scholarship'");
 await card.getByRole('button',{name:'Save details',exact:true}).click();
 await page.getByRole('alert').filter({hasText:'changed on another'}).waitFor();
 await page.getByRole('button',{name:'Refresh saved records',exact:true}).click();
 await card.getByRole('button',{name:'Keep my edits for the next save',exact:true}).click();
 await card.getByRole('button',{name:'Save details',exact:true}).click();
 await page.getByRole('status').filter({hasText:'Changes saved'}).waitFor();
 check('Explicit conflict recovery saves retained draft',(await db.query('select provider from scholarship_entries')).rows[0].provider==='My newer edit');
 // Lost create reply: input changes before retry. Earlier record must not be duplicated or silently overwrite edits.
 loseNextCreate=true;
 await page.locator('#scholarship-name').fill('First attempt');await page.getByRole('button',{name:'Save scholarship',exact:true}).first().click();
 await page.getByRole('alert').filter({hasText:'could not confirm'}).waitFor();
 await page.locator('#scholarship-name').fill('Revised attempt');await page.getByRole('button',{name:'Save scholarship',exact:true}).first().click();
 await page.getByRole('alert').filter({hasText:'earlier save was found'}).waitFor();
 check('Unconfirmed save keeps revised name visible',await page.locator('#scholarship-name').inputValue()==='Revised attempt');
 await page.getByRole('button',{name:'Save scholarship',exact:true}).first().click();
 await page.getByRole('heading',{name:'Revised attempt',exact:true}).waitFor();
 check('Retry applies edit to same UUID without duplicate',(await db.query('select count(*)::int as n from scholarship_entries')).rows[0].n===2);
 await page.getByText('Download your tracker',{exact:true}).click();
 const csvDownload=page.waitForEvent('download');await page.getByRole('button',{name:'Download CSV',exact:true}).click();const csv=await csvDownload;await csv.saveAs(`${out}/tracker.csv`);
 const csvText=await readFile(`${out}/tracker.csv`,'utf8');check('CSV omits notes by default',!csvText.includes('Private test note'));check('CSV contains recorded scholarship',csvText.includes('My scholarship'));
 const pdfDownload=page.waitForEvent('download');await page.getByRole('button',{name:'Download PDF',exact:true}).click();const pdf=await pdfDownload;await pdf.saveAs(`${out}/tracker.pdf`);check('Browser PDF generated',(await readFile(`${out}/tracker.pdf`)).length>1000);
 for(const width of[320,768,1440]){await page.setViewportSize({width,height:1000});await page.screenshot({path:`${out}/tracker-${width}.png`,fullPage:true});check(`Populated tracker has no overflow at ${width}`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 await page.goto(`${base}/tools/application-planner#region=usa`,{waitUntil:'networkidle'});await page.getByRole('heading',{name:'Scholarship next steps',exact:true}).waitFor();check('Planner projects original scholarship checklist',await page.getByRole('link',{name:'Submit form',exact:true}).count()===1);
 await page.getByRole('link',{name:'Submit form',exact:true}).click();await page.getByRole('heading',{name:'My scholarship',exact:true}).waitFor();await page.locator('article').filter({has:page.getByRole('heading',{name:'My scholarship',exact:true})}).locator('details[open]').first().waitFor();check('Planner deep link opens original record');
 check('No browser errors',errors.length===0);
 await writeFile(`${out}/result.json`,JSON.stringify({method:'Browser SDK requests intercepted into real local PGlite RPC/RLS; fake auth; all external network blocked. Not a live Supabase/GoTrue test.',checks,requests,errors},null,2));
 console.log(`PASS: ${checks.length} browser/local-database integration checks.`);
}finally{await browser.close();await db.close();}

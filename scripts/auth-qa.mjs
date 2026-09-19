#!/usr/bin/env node
/**
 * Inbox-free QA helper for the accounts feature (LOCAL ONLY).
 *
 * Uses the SERVER secret key from .env.local to drive the GoTrue admin API, so a
 * throwaway account can be created and signed in without reading any mailbox:
 *
 *   node scripts/auth-qa.mjs create   <email>   # confirmed throwaway user (no profile row)
 *   node scripts/auth-qa.mjs otp      <email>   # a fresh one-time code + link for that user
 *   node scripts/auth-qa.mjs show     <email>   # id / confirmed / last sign-in / banned_until / profile
 *   node scripts/auth-qa.mjs delete   <email>   # remove the throwaway (cascades profile + saved pages)
 *
 * THE ADDRESS MUST BE A REAL MAILBOX (BINDING, 19 Sep 2026). The sign-in form's
 * "send" step e-mails the address through Supabase's mailer; a made-up
 * throwaway such as gsb-qa-1@globalstudyboard.com does not exist in Google
 * Workspace, so every test send hard-bounced, and Supabase warned twice in one
 * day that the project's sending privileges were "at risk due to bounce backs".
 * Use a mailbox you own with a plus-tag instead — e.g.
 * vedkosh.info+gsbqa1@gmail.com or contact+qa1@globalstudyboard.com — which
 * delivers (or is quietly dropped) without bouncing. The `create` command
 * refuses invented addresses on the site's own domain for that reason.
 * Never commit output; it prints a credential (the code) by design.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.join(process.cwd(), '.env.local');
const env = Object.fromEntries(
  fs
    .readFileSync(envPath, 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const secret = env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !secret) {
  console.error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY missing in .env.local');
  process.exit(1);
}
const admin = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

const [cmd, email] = process.argv.slice(2);

// Bounce guard: only a real mailbox may be used (see the header). On the
// site's own domain, only contact@ (optionally plus-tagged) exists.
if (cmd === 'create' && email && /@globalstudyboard\.com$/i.test(email) && !/^contact(\+[^@]+)?@globalstudyboard\.com$/i.test(email)) {
  console.error(
    `refusing ${email}: that mailbox does not exist, so the sign-in e-mail would bounce and Supabase counts it against the project.\n` +
      'Use a real mailbox with a plus-tag, e.g. contact+qa1@globalstudyboard.com or vedkosh.info+gsbqa1@gmail.com.',
  );
  process.exit(2);
}
if (!cmd || !email || !/^[^\s@]+@globalstudyboard\.com$/i.test(email)) {
  console.error('usage: node scripts/auth-qa.mjs <create|otp|show|delete> <throwaway@globalstudyboard.com>');
  process.exit(1);
}

async function findUser(addr) {
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => (u.email ?? '').toLowerCase() === addr.toLowerCase());
    if (hit) return hit;
    if (data.users.length < 200) return null;
  }
  return null;
}

const main = async () => {
  if (cmd === 'create') {
    const { data, error } = await admin.auth.admin.createUser({ email, email_confirm: true });
    if (error) throw error;
    console.log('created', data.user.id);
  } else if (cmd === 'otp') {
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: 'http://localhost:5050/auth/callback' },
    });
    if (error) throw error;
    console.log('email_otp:', data.properties.email_otp, '  ← type this into the sign-in form');
    // generateLink()'s action_link uses the implicit flow (a #access_token
    // fragment) and cannot complete a sign-in through this site's PKCE
    // /auth/callback — printing it invited a wasted attempt. Only the code works.
    console.log('(the generated magic link is not usable with this app — use the code)');
  } else if (cmd === 'show') {
    const u = await findUser(email);
    if (!u) return console.log('no such user');
    const { data: profile } = await admin.from('profiles').select('*').eq('id', u.id).maybeSingle();
    const { count } = await admin.from('saved_items').select('slug', { count: 'exact', head: true }).eq('user_id', u.id);
    console.log(JSON.stringify({ id: u.id, email: u.email, confirmed: u.email_confirmed_at, last_sign_in: u.last_sign_in_at, banned_until: u.banned_until ?? null, identities: (u.identities ?? []).map((i) => i.provider), profile, saved: count }, null, 2));
  } else if (cmd === 'delete') {
    const u = await findUser(email);
    if (!u) return console.log('no such user');
    const { error } = await admin.auth.admin.deleteUser(u.id);
    if (error) throw error;
    console.log('deleted', u.id);
  } else {
    console.error('unknown command');
    process.exit(1);
  }
};
main().catch((e) => {
  console.error('failed:', e.message ?? e);
  process.exit(1);
});

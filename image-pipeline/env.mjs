// image-pipeline/env.mjs
// Loads image-pipeline/.env (gitignored) so keys live in ONE local file instead of your
// shell profile or your shell history. Deliberately NOT the repo-root .env — Next.js
// auto-loads that one, and a build-time-only image key has no business near the app.
// Existing real environment variables always win, so `export FOO=... node script` still works.
import { readFileSync, existsSync } from 'node:fs';

const FILE = 'image-pipeline/.env';
if (existsSync(FILE)) {
  for (const raw of readFileSync(FILE, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

/** Presence + shape only — NEVER logs or returns the secret itself. */
export function keyStatus(name) {
  const v = process.env[name];
  if (!v) return { set: false, hint: 'not set' };
  if (/paste|your_key|xxx|<|>/i.test(v)) return { set: false, hint: 'still the placeholder text' };
  return { set: true, hint: `set (${v.length} chars, ends …${v.slice(-4)})` };
}

---
description: Workflow rules for GlobalStudyBoard development
globs: "**/*.{ts,tsx,js,jsx}"
---

# Workflow Rules

## Code Quality
- Run `npm run lint && npm run typecheck` after making code changes
- Run `npm test` if test files exist for modified components
- Never modify `middleware.ts` security headers without explicit approval

## Where to Apply Code Changes (BINDING)
- **ALWAYS edit files in the root repo** at `/Users/pratap88bhanu/Documents/gitprojects/globalstudyboard/` — this is what the dev server (port 5000) serves and what gets committed.
- Claude worktrees are temporary scratch space — edits there do NOT appear in the local dev server or in production unless explicitly applied to root repo.
- If a change is made in a worktree, it MUST also be applied to the root repo immediately in the same session.

## Git & Deployment Guardrail (BINDING — highest priority)
- **Single branch workflow:** Root repo is always on `main`. Work directly on `main`.
- **NEVER** run `git commit`, `git push`, `git merge`, or any production deploy unless the user **explicitly** requests it in the current conversation turn.
- A deployment request from a previous session does NOT carry forward — ask again if unsure.
- Default behavior for all normal coding tasks: **make local code changes and run lint/build validations only**. No Git side effects.
- The words that trigger a deployment: "commit", "push", "deploy", "publish", "release" — explicitly said by the user in the current turn.
- Deployment sequence (only on explicit request): `git commit` → `git push origin main` → Vercel auto-deploys.
- Dev server runs on **port 5000** (`npm run dev`).

## Content Policy (BINDING)
- All college/exam information must be accurate and verifiable
- No fabricated rankings, cutoffs, fees, or statistics
- Footer disclaimer required: "Information provided is for guidance only."
- No content facilitating academic dishonesty

## AI & Model
- Use `Claude Sonnet 4.6 (copilot)` for all agents and subagents
- Never switch to a different model without confirming with the user

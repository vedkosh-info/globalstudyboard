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
- **The Content Constitution `.claude/rules/content-policy.md` is the authority for ALL content** — read it before writing/editing any content. Audit every unit with `.claude/rules/content-qa-checklist.md` and log it in `.claude/rules/content-audit-log.md`. No content ships without an independent (separate-pass) QA sign-off.
- All college/exam information must be accurate and verifiable — Tier-1 official sources only

## Content Architecture & CMI (BINDING — constitution §11)
- **NO duplicate content.** Before adding ANY new content unit (college, exam, scholarship, region, guide), search the existing data (`lib/colleges.ts`, `lib/admission-guides.ts`, `lib/regions.ts`) for the same entity by normalized name + region + type. If it exists, **update it — never create a second record**.
- **Anti-duplication pre-flight is MANDATORY (constitution §11.1a).** Run **`npm run dup:check`** and a manual semantic search BEFORE authoring. Never ship a page that is another page with a country/exam name or a few words swapped (minor-tweak copy). **Club overlapping topics into one canonical unit.** A destination-specific parallel is allowed only when its body carries genuinely different facts (target < ~0.35 full-body token overlap with any sibling); a destination-neutral topic that is identical everywhere must be ONE global/multi-region unit, not one copy per region. Log the result in the audit log; block on any unresolved duplicate.
- **One canonical unit, one stable slug.** Slugs are unique within their type and never silently changed (a slug change needs a redirect plan).
- **Manage content through the Content Master Index (CMI).** The CMI is the single source of truth that indexes + validates all content and emits a registry used by search, breadcrumbs, related-content blocks, and the sitemap.
  - When CMI tooling exists, run `npm run cmi:validate` (0 errors) before adding content and before shipping; run `npm run cmi:build` after catalog changes.
  - Until the tooling lands, perform the same checks manually (unique/stable slugs, no duplicates, referential integrity, required fields) and log the pass in the audit log.
- **Maintain relationships for continuity.** Every unit declares + renders its links (college ↔ region ↔ exams ↔ scholarships ↔ guides). Every referenced relationship must resolve to a real existing unit (no broken links). Relationships should be bidirectional, and every content page ends with a "Related / Next steps" block.

## Navigation, Search & UX (BINDING — constitution §12)
- **Breadcrumbs on every page**, rendered globally via the root layout (like the footer) so new routes inherit them: `Home > {group} > {sub-group} > {current page}`; current page is not a link; emit `BreadcrumbList` JSON-LD. Labels come from the content registry, not hard-coded.
- **A search box at the top of every page**, mounted globally in the layout, searching the CMI index with fast client-side matching and handing complex queries to GSB AI. Keyboard-accessible; identical on desktop + mobile.
- **Modern, content-first, fully responsive UI.** Test BOTH desktop and mobile (and tablet) before shipping any UI change. Accessible by default (semantic HTML, contrast, focus states, alt text, reduced-motion). Keep the consistent design language (Fraunces + Inter, forest/cream/stone, rounded cards) — no one-off styles.

## Premium UI, Readability & Always-Review (BINDING — constitution §15, §7.5–§7.6)
- **Premium UI + readable content = supreme priority.** Every page must look modern/premium AND render English content for effortless reading — readable measure (~60–75ch), generous line-height, clear Fraunces+Inter hierarchy, ≥16px body, WCAG AA+ contrast, no walls of text, consistent tokens (no one-offs). Content is the hero; chrome/ads never crowd or outrank it.
- **Acceptance criteria for every UI/content change** — verify on desktop, tablet AND mobile before finishing.
- **Always review existing pages too.** A change to a shared layout, component, design token or data shape is a change to every page that uses it — re-review those existing/affected pages, not just the new unit.
- **Review continuously, not just at the end.** Keep checking rendering, readability and responsiveness as you go and again before finishing. A change isn't done until it verifies correct AND looks/reads premium on all viewports.
- **English-only stands** — readability is for the single English language; never add i18n/`[lang]`/hreflang/non-English content to "improve readability."

## SEO & Monetization (BINDING — constitution §13)
- Every page: `generateMetadata()` (title, description, self-referential canonical — **no hreflang; single-language English site**), `generateStaticParams()` for `[slug]` routes, appropriate structured data, sitemap entry, and internal links (no orphans).
- **Google Ads/AdSense-ready but off until approved**: keep `public/ads.txt` and reserved ad slots; do not render ads or add trackers until the account is approved and `/privacy` is updated. Ads never degrade content quality, speed, accessibility, or obscure content — content always outranks monetization.

## Multi-Jurisdiction Legal Compliance (BINDING — constitution §14 — EVERY country, EVERY new unit)
- **Legal compliance is NOT USA-only.** The laws of **each destination** we cover (USA, UK & Ireland, Canada, Europe, Australia & New Zealand, India, and any new region) apply to the content we publish about it, plus the laws protecting our audience there. Enforce this for ALL existing content and EVERY new content unit, in every language, on every page.
- **Before adding/changing ANY unit** (college, exam, scholarship, region, guide, page, AI answer), the independent QA pass must: (1) identify the jurisdiction(s) it touches — destination country + audience country; (2) check it against those jurisdictions' applicable laws — privacy/data-protection, consumer/advertising, copyright/IP, visa/immigration, education-record, accessibility, defamation — applying the **strictest** standard on overlap; (3) confirm facts-and-guidance-only framing (no legal/immigration/medical/financial advice), Tier-1 sourcing, and the visa/policy verify-nudge; (4) log the jurisdiction(s) reviewed in the audit log. **Block on any fail.**
- **New destination:** confirm all §14.2 law areas are covered before publishing; if a rule cannot be met for some content, withhold that content and flag it to the user.
- **Law changes:** correct/remove affected content immediately and log it; keep `/privacy`, `/terms`, `/disclaimer` current. **We are not lawyers** — if a genuine legal question exceeds these rules, STOP and flag it; never guess or work around it.

- No fabricated rankings, cutoffs, fees, or statistics
- Zero religious content (beyond a neutral official faith-affiliation fact); no politics / government criticism / geopolitics; no hate or stereotypes
- **Site-wide disclaimer required on EVERY page — current and future (BINDING):** The exact text below must be visible on all pages. It is rendered globally via the `Footer` in the root layout (`app/layout.tsx`), so every page (including any new route added later) inherits it automatically. NEVER remove `Footer` from the root layout, and NEVER alter this disclaimer wording without explicit user approval:
  > Disclaimer: Information provided on GlobalStudyBoard is for guidance only. Tuition fees, application deadlines, rankings, and eligibility requirements change every academic year. Always verify all details with the official university or examination website before applying.
- Every new page must be added under the shared layout so it inherits the footer disclaimer; if a page ever renders outside the root layout, the disclaimer must be added to it explicitly.
- A standalone `/disclaimer` page must also exist and be linked from the footer.
- No content facilitating academic dishonesty


## AI & Model
- Use `Claude Sonnet 4.6 (copilot)` for all agents and subagents
- Never switch to a different model without confirming with the user

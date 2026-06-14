# GlobalStudyBoard — Project Context for Claude Code

## What is GlobalStudyBoard?
A comprehensive, English-language college admission guide and query platform covering universities and entrance exams worldwide, with a strong India focus. Provides college profiles, step-by-step admission guides, entrance exam breakdowns, and study-abroad resources for students from school to postgraduate level.

**Primary audiences:** Indian students targeting IITs/NITs/IIMs/AIIMS/NLUs, and students seeking study-abroad guidance for USA, UK, Canada, Australia, Germany.

## Content Policy (BINDING)
- **Read `.claude/rules/content-policy.md` (Content Constitution) BEFORE writing or editing ANY content.** It is the highest-priority content authority. Also: `.claude/rules/content-qa-checklist.md` (independent QA) and `.claude/rules/content-audit-log.md` (sign-off log).
- **No content ships without an independent QA pass** (separate from authoring) logged in the audit log.
- All information must be accurate and verifiable — cite official **Tier-1** sources only (official university site, official exam board, official `.gov`)
- No fabricated rankings, cutoffs, fees, or admission statistics
- **Zero religious content** (no Islam, Christianity, Sikhism, Hinduism, etc.) beyond a neutral official faith-affiliation fact; **no politics, no government criticism, no geopolitics** — visa/policy stated as neutral fact only with a verify-on-official-source nudge; **no hate/stereotypes** by religion, race, ethnicity, caste, gender, etc.
- **Site-wide disclaimer required on EVERY page — current AND future.** The exact wording below must be visible on all pages. It is rendered globally via the `Footer` component in the root layout (`app/layout.tsx`), so every existing and future route inherits it automatically. NEVER remove `Footer` from the root layout, and NEVER change this wording without explicit user approval:
  > Disclaimer: Information provided on GlobalStudyBoard is for guidance only. Tuition fees, application deadlines, rankings, and eligibility requirements change every academic year. Always verify all details with the official university or examination website before applying.
- Any new page MUST live under the shared root layout so it inherits the footer disclaimer. If a page is ever rendered outside that layout, add the disclaimer to it explicitly.
- A dedicated `/disclaimer` page must exist and be linked in the footer.
- No content that facilitates academic dishonesty or plagiarism
- Respectful of all religions, castes, regions — no discriminatory content
- Content should be inclusive of all genders and backgrounds

## Tech Stack
- **Framework:** Next.js 15 (App Router) with TypeScript (strict)
- **Styling:** Tailwind CSS (preflight disabled — `styles/globals.css` provides base styles)
- **Deployment:** Vercel (auto-deploy from `main` branch)
- **Language:** **English only** — single-language site, no i18n/locale routing. All URLs are bare (e.g. `/guides/...`); there are no `/hi` or `/en` prefixes, no `[lang]` segment, and no hreflang. This is permanent — do not add language-specific architecture.

## Build & Run Commands
- `npm run dev` — Start dev server on **port 5000**
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript check (`tsc --noEmit`)

## Project Structure
```
app/              → Next.js App Router pages (flat — bare English URLs, no [lang] segment)
components/       → Reusable React components (Header, Footer, etc.)
lib/              → Data files and utilities
  colleges.ts     → College data (types + data array + helpers)
  admission-guides.ts → Entrance exam data
styles/           → globals.css (base styles, no preflight)
middleware.ts     → CSP + security headers (+ legacy /hi,/en → bare 301 redirects)
public/           → Static assets
```

## URL Architecture (English only — BINDING)
- **Single language: English.** Every page lives at a bare URL (`/`, `/colleges/...`, `/exams/...`, `/guides/...`) rendered directly from `app/...`. There is NO locale segment, NO `/hi`, NO `/en`, NO hreflang, NO language switcher, and NO locale cookie.
- Legacy locale URLs are retired: `middleware.ts` 301-redirects any `/hi/*` or `/en/*` to the bare path.
- **Do NOT reintroduce any language-specific architecture (i18n, `[lang]`, hreflang, locale cookies) — now or in future.** If page-level translation is ever wanted, do it per-page or rely on the browser's built-in translation; never add a locale routing layer.

## Content Data Pattern
- College profiles in `lib/colleges.ts` — `College` interface, `COLLEGES` array, helper functions
- Entrance exam guides in `lib/admission-guides.ts` — `EntranceExam` interface, `ENTRANCE_EXAMS` array
- Content is **English only**. Data fields keep an `*En` suffix for now (e.g. `titleEn`, `descriptionEn`) — only the English fields are authored and rendered. Legacy `*Hi` fields in older records are unused (safe to remove); do NOT add new non-English fields.
- Always run `npm run lint && npm run typecheck` after any data change

## Content Architecture, CMI & UX (BINDING — constitution §11–§13)
- **No duplicate content.** Before adding any unit (college/exam/scholarship/region/guide), search existing data by normalized name + region + type; if it exists, UPDATE it — never create a second record. One canonical unit, one stable slug.
- **Region-personalised, one canonical unit (constitution §11.4).** Every unit carries a primary `region` + optional `regions: RegionSlug[]` = all destinations it should display under. Listing pages show the selected region **only** (default `DEFAULT_REGION` = India) with a "Show all regions" escape; common content surfaces inside each relevant region (no separate "worldwide" bucket), never duplicated. Match regions via `resolveDisplayRegions()`/`matchesRegion()` in `lib/regions.ts`. Region pickers use `REGIONS_ALPHABETICAL`. New/edited units must have their region set reviewed (Tier-1-supportable) in the QA pass.
- **CMI (Content Master Index)** is the single source of truth that indexes + validates all content and feeds search, breadcrumbs, related-content blocks, and the sitemap. Run `npm run cmi:validate` (0 errors) before adding/shipping content once tooling exists; until then do the same checks manually and log them.
- **Relationships for continuity:** every unit links to its related units (college ↔ region ↔ exams ↔ scholarships ↔ guides); links must resolve to real units; every page ends with a "Related / Next steps" block.
- **Breadcrumbs + search on every page**, mounted globally in the root layout (like the footer) so new routes inherit them. Breadcrumb emits `BreadcrumbList` JSON-LD; search hands complex queries to GSB AI.
- **Premium UI + content readability = supreme priority (constitution §15).** A beautiful, modern, premium UI and highly readable English content rendering are first-class — co-equal with accuracy, above decoration/monetization; content is the hero. Readable measure (~60–75ch), generous line-height, clear Fraunces+Inter hierarchy, ≥16px body, WCAG AA+ contrast, no walls of text; consistent design tokens (no one-offs); fully responsive + accessible. Verify **desktop, tablet AND mobile** every change. (Readability is for the single English language — NOT a multi-language mandate; English-only stands.)
- **Always review existing pages too + review continuously (constitution §7.5–§7.6, §15.4).** Whenever you make ANY change (content, component, layout, style, data), re-review the existing/affected pages it touches — not just the new unit — and keep reviewing as you go, not only as a final gate. A shared layout/component/token/data change is a change to every page that uses it.
- **SEO + ads-ready:** self-referential canonical + structured data + sitemap + internal links on every page (**no hreflang — single language**); AdSense-ready but no ads until approved and `/privacy` updated; content always outranks monetization.

## Multi-Jurisdiction Legal Compliance (BINDING — constitution §14)
- **Legal compliance is NOT USA-only.** The laws of **each destination** we cover (USA, UK & Ireland, Canada, Europe, Australia & New Zealand, India, and any new region) apply to the content about it, plus the laws protecting our audience there. Enforce for ALL existing content and EVERY new unit, in every language, on every page.
- Before adding/changing ANY unit, the independent QA pass must: (1) identify the jurisdiction(s) it touches (destination + audience country); (2) check it against those jurisdictions' applicable laws — privacy, consumer/advertising, copyright/IP, visa/immigration, education-record, accessibility, defamation — applying the **strictest** standard on overlap; (3) confirm facts-and-guidance-only framing (no legal/immigration/medical/financial advice), Tier-1 sourcing, and the visa/policy verify-nudge; (4) log the jurisdiction(s) reviewed in the audit log. **Block on any fail.**
- New destination: confirm all law areas are covered before publishing; if a rule can't be met for some content, withhold it and flag it. Law changes → correct/remove immediately and log; keep `/privacy`, `/terms`, `/disclaimer` current. **We are not lawyers** — if a legal question exceeds these rules, STOP and flag it.

## SEO & URL Conventions
- Use slugs (e.g. `/colleges/iit-bombay`, `/exams/jee-main`) — no numeric IDs
- Every page must have `generateMetadata()` with title, description, and a self-referential canonical (no hreflang — single-language English site)
- `generateStaticParams()` required for all `[slug]` routes
- Content disclaimer required in footer on every content page
- **Freshness, not founding year (BINDING — see `content-policy.md` §5).** Every page shows a "Last updated" date via `components/LastUpdated.tsx` — content pages pass the unit's own `lastVerified`; listings/region/college/static pages pass `SITE_REVIEWED` from `lib/site-meta.ts`. The footer shows `ADMISSIONS_CYCLE`. Never display a site "established/founded" year on utility/listing/content pages or the global header/footer (origin story lives only on `/about`); a *university's* real founding year is fine. Never fake/back-date a "last updated" date.

## Git Workflow (BINDING)
- **Root repo always on `main`** — single-branch workflow
- **ALWAYS edit files in root repo** at `/Users/pratap88bhanu/Documents/gitprojects/globalstudyboard/`
- **No auto-commit/push** — commit/push only when user explicitly says "commit", "push", "deploy", or "release"
- Vercel auto-deploys from `main` on push
- Dev server is on **port 5000** — does not conflict with VedKosh (3000) or TasteYatra (4000)

## Code Style Rules
- TypeScript strict mode, no `any`
- Tailwind CSS only — no inline styles, no CSS modules
- Functional components + hooks only
- Never hardcode English strings as page content — use data from `lib/` files
- Never modify `middleware.ts` security headers without explicit approval

## Color Palette (Tailwind)
- `brand-600` (#1B3A6B) — primary navy, headers, CTAs
- `gold-500` (#C9A227) — accent, highlights, logo
- `slate-*` — neutral text and backgrounds

## Important Files
- `app/layout.tsx` — Root layout, fonts, metadata, Analytics
- `app/page.tsx` — Home page (college categories, featured exams, top colleges)
- `middleware.ts` — CSP nonce + security headers (+ legacy /hi,/en → bare 301 redirects)
- `lib/colleges.ts` — College data and types
- `lib/admission-guides.ts` — Entrance exam data and types
- `components/Header.tsx` — Site navigation
- `components/Footer.tsx` — Site footer with disclaimer

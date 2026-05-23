# GlobalStudyBoard — Project Context for Claude Code

## What is GlobalStudyBoard?
A multilingual college admission guide and query platform covering universities and entrance exams worldwide, with a strong India focus. Provides college profiles, step-by-step admission guides, entrance exam breakdowns, and study-abroad resources for students from school to postgraduate level.

**Primary audiences:** Indian students targeting IITs/NITs/IIMs/AIIMS/NLUs, and students seeking study-abroad guidance for USA, UK, Canada, Australia, Germany.

## Content Policy (BINDING)
- All information must be accurate and verifiable — cite official sources
- No fabricated rankings, cutoffs, fees, or admission statistics
- Footer disclaimer required on every page: "Information provided is for guidance only. Always verify with official college/exam websites before applying."
- No content that facilitates academic dishonesty or plagiarism
- Respectful of all religions, castes, regions — no discriminatory content
- Content should be inclusive of all genders and backgrounds

## Tech Stack
- **Framework:** Next.js 15 (App Router) with TypeScript (strict)
- **Styling:** Tailwind CSS (preflight disabled — `styles/globals.css` provides base styles)
- **Deployment:** Vercel (auto-deploy from `main` branch)
- **i18n:** `en` (English, primary/global) + `hi` (Hindi); bare URLs serve English via middleware rewrite

## Build & Run Commands
- `npm run dev` — Start dev server on **port 5000**
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript check (`tsc --noEmit`)

## Project Structure
```
app/              → Next.js App Router pages
app/[lang]/       → Locale-aware pages (en = bare URL via rewrite, hi = /hi/...)
components/       → Reusable React components (Header, Footer, etc.)
lib/              → Data files and utilities
  colleges.ts     → College data (types + data array + helpers)
  admission-guides.ts → Entrance exam data
  i18n.ts         → Locale constants (single source of truth)
styles/           → globals.css (base styles, no preflight)
middleware.ts     → Locale routing + CSP + security headers
public/           → Static assets
```

## Locale & URL Architecture
- **English (en):** bare URLs (`/`, `/colleges/...`, `/exams/...`) — rendered by `app/[lang]/page.tsx` via middleware rewrite to `/en/`
- **Hindi (hi):** `/hi/colleges/...`, `/hi/exams/...`
- `/en/*` → 308 permanent redirect to bare URL
- Cookie: `gsb_lang` stores user preference

## Content Data Pattern
- College profiles in `lib/colleges.ts` — `College` interface, `COLLEGES` array, helper functions
- Entrance exam guides in `lib/admission-guides.ts` — `EntranceExam` interface, `ENTRANCE_EXAMS` array
- All content fields use `*En` / `*Hi` suffix convention for bilingual fields
- Always run `npm run lint && npm run typecheck` after any data change

## SEO & URL Conventions
- Use slugs (e.g. `/colleges/iit-bombay`, `/exams/jee-main`) — no numeric IDs
- Every page must have `generateMetadata()` with title, description, canonical
- `generateStaticParams()` required for all `[slug]` routes
- Content disclaimer required in footer on every content page

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
- `app/[lang]/page.tsx` — Home page (college categories, featured exams, top colleges)
- `middleware.ts` — Locale routing + CSP nonce + security headers
- `lib/colleges.ts` — College data and types
- `lib/admission-guides.ts` — Entrance exam data and types
- `lib/i18n.ts` — Locale constants (SUPPORTED_LOCALES, DEFAULT_LOCALE)
- `components/Header.tsx` — Site navigation
- `components/Footer.tsx` — Site footer with disclaimer

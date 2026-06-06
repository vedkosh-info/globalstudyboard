---
description: Independent Content QA / Editorial Audit Checklist for GlobalStudyBoard (BINDING)
globs: "**/*"
---

# Independent Content QA Checklist (BINDING)

Run this checklist as a **separate, independent pass** from authoring, for every
new or changed content unit (a college, an exam, a scholarship, a page, an AI
answer). See `.claude/rules/content-policy.md` §7. Log the result in
`.claude/rules/content-audit-log.md`.

A unit **passes only if every applicable item is checked**. Any single failure
blocks the unit until fixed and re-audited.

## A. Accuracy & Sourcing (Tier-1 required)
- [ ] Every hard fact (fee, deadline, ranking, cutoff, eligibility, exam pattern,
      visa rule) is verified against a **Tier-1 official source** (university
      official site, official exam board, or official `.gov`).
- [ ] Source link is present and visible on the page next to the fact.
- [ ] The academic **year** the figure applies to is stated.
- [ ] Rankings are **attributed** to the body that issued them (QS/THE/etc.).
- [ ] Fees shown as a **range** with currency + year; no false precision, no
      invented exchange rates.
- [ ] `lastVerified` date is set and recent.
- [ ] No fabricated, estimated-as-fact, or unverifiable claims anywhere.

## B. Relevance & Clarity
- [ ] Every item is decision-relevant for a student. No filler / keyword stuffing.
- [ ] Language is plain and clear; jargon is defined.
- [ ] No misleading or clickbait phrasing.

## C. Religion (Rule C — zero tolerance)
- [ ] **No religious content** (no faith, festival, symbol, ruling, or promotion).
- [ ] Any faith-affiliation mention is a **neutral official administrative fact
      only**, taken from the institution's own official profile — not expanded,
      promoted, interpreted, or compared.

## D. Politics, Government & Geopolitics (Rule D)
- [ ] Visa/immigration/policy facts are **neutral and factual only**, quoting the
      official rule + linking the official `.gov` source.
- [ ] **No** criticism, praise, prediction, or opinion on any government/policy.
- [ ] **No** geopolitical commentary (war, sanctions, elections, borders).
- [ ] A **"verify on the official source"** nudge accompanies visa/policy/fee facts.

## E. Respect, Inclusion & Safety (Rule E)
- [ ] No disrespectful, fake, abusive, controversial, or defamatory content.
- [ ] No hate or stereotypes by religion, race, ethnicity, nationality, caste,
      gender, sexuality, disability, or socioeconomic status.
- [ ] Gender-neutral, inclusive language; no group generalizations.
- [ ] No institution or country is disparaged or judged — only described.

## F. Prohibited Claims (Rule §4)
- [ ] No guarantees ("guaranteed admission/visa", "we'll get you in").
- [ ] No legal/immigration/medical/financial **advice** framing — guidance only.
- [ ] No content facilitating academic dishonesty/plagiarism.
- [ ] Prose is **original** (not copied from sources); sources are cited.
- [ ] No scraped PII / personal data.

## G. Privacy & Data Protection (Rule §9 — BINDING)
- [ ] **No PHI / individual health data** (HIPAA posture). Disability info only as
      a university's official, non-personal policy.
- [ ] **No PII** about students/applicants/staff published, scraped, or stored.
- [ ] No individual **education records** exposed (FERPA).
- [ ] Data minimization respected — feature collects only what it strictly needs
      (GDPR/CCPA/COPPA/India DPDP); strictest applicable standard applied.
- [ ] No PII in analytics/logs; no new tracker without updating `/privacy`.
- [ ] GSB-AI: no PII requested, stored, or echoed; no personal/health data persisted.
- [ ] No secrets/API keys/personal data committed to the repo.

## H. Technical / Site Integrity
- [ ] Content is in **English** (single-language site); the English (`*En`) fields are populated. No `/hi` or other-language content.
- [ ] Page lives under the root layout (inherits the footer disclaimer).
- [ ] `generateMetadata()` present (title, description, canonical, languages).
- [ ] `generateStaticParams()` present for any `[slug]` route.
- [ ] Source caption + `lastVerified` rendered where required.
- [ ] `npm run lint` and `npm run typecheck` pass with 0 errors.

## I. Content Architecture, De-duplication & Continuity (Rule §11 — BINDING)
- [ ] **No duplicate unit** — checked the CMI/data by normalized name + region +
      type; this entity has exactly one canonical record (updated, not duplicated).
- [ ] Slug is **unique within its type** and **stable** (no silent slug change;
      any change has a redirect plan).
- [ ] No near-duplicate prose republished under a different slug.
- [ ] `npm run cmi:validate` passes with 0 errors (or the equivalent manual
      check is performed and logged until tooling exists).
- [ ] **Relationships declared + rendered** (college ↔ region ↔ exams ↔
      scholarships ↔ guides); every referenced link resolves to a real existing
      unit (no broken/dead links).
- [ ] Page ends with a **"Related / Next steps"** block; no orphan page.

## J. Navigation, Search & UX (Rule §12 — BINDING)
- [ ] **Breadcrumb** present at top (`Home > group > sub-group > page`); current
      page not a link; `BreadcrumbList` JSON-LD emitted.
- [ ] **Search box** present at top (global via layout); keyboard-accessible.
- [ ] **Fully responsive** — verified on desktop AND mobile (and tablet).
- [ ] Accessible: semantic HTML, contrast, focus states, alt text, reduced-motion.
- [ ] Consistent design language (Fraunces + Inter, forest/cream/stone) — no one-offs.
- [ ] **Premium & readable** — content is the hero with clear hierarchy, readable
      measure (~60–75ch), generous line-height, ≥16px body, no walls of text;
      looks modern/premium, not merely functional (full checks in §M).

## K. SEO & Monetization (Rule §13 — BINDING)
- [ ] Self-referential canonical set — **NO hreflang / language alternates** (single-language English); appropriate structured data present.
- [ ] Unit is in `sitemap.ts` and reachable by internal links (no orphans).
- [ ] No ads render unless the account is approved; `public/ads.txt` intact; no
      new tracker without updating `/privacy`; ads never obscure/crowd content.

## L. Multi-Jurisdiction Legal Compliance (Rule §14 — BINDING — per country, every unit)
- [ ] **Jurisdiction(s) identified** — the destination country AND the audience
      country/countries this unit touches are listed.
- [ ] Content checked against **those jurisdictions'** applicable laws (privacy,
      consumer/advertising, copyright/IP, visa/immigration, education-record,
      accessibility, defamation), applying the **strictest** standard on overlap.
- [ ] **Facts-and-guidance-only** framing — no legal/immigration/medical/financial
      advice for any country; visa/policy facts neutral + Tier-1 `.gov` link +
      verify-on-official-source nudge.
- [ ] No claim/content that would breach a covered destination's law (misleading
      claims, unlawful scraping, defamation, exposed records, etc.).
- [ ] New destination: confirmed all §14.2 law areas are accounted for before
      publishing; if a rule cannot be met, the content is withheld and flagged.
- [ ] **Jurisdiction(s) reviewed are logged** in the audit log alongside sign-off.

## M. Premium UI, Readability & Always-Review (Rule §15, §7.5–§7.6 — BINDING)
- [ ] **Readable English content** — comfortable measure, line-height and spacing;
      clear Fraunces + Inter hierarchy; ≥16px body; WCAG AA+ contrast; long content
      broken into sections/lists/tables/cards (no slabs of text).
- [ ] **Premium, modern, consistent** — beautiful, polished, content-first design
      using the established tokens/components; no one-off colors/fonts/spacing.
- [ ] **All three viewports verified** — desktop, tablet AND mobile each look and
      read well (not merely "work").
- [ ] **Existing/affected pages re-reviewed** — any shared layout/component/token/
      data change was checked on every page it affects, not only the new unit.
- [ ] **Reviewed continuously** — rendering/readability/responsiveness checked
      while changing and again before finishing, not only as a final gate.
- [ ] **English-only upheld** — readability achieved within the single English
      language; no i18n/`[lang]`/hreflang/non-English content introduced.

## Sign-off
- Auditor (separate from author): ____________________
- Date: ____________________
- Result: ☐ PASS ☐ FAIL (list failing items) — re-audit after fixes.

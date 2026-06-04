---
description: Content Constitution & Editorial Guardrails for GlobalStudyBoard (BINDING)
globs: "**/*"
---

# GlobalStudyBoard — Content Constitution (BINDING, HIGHEST PRIORITY)

This file governs **every piece of content** on GlobalStudyBoard — existing and
future, in every language, on every page, in every data file (`lib/colleges.ts`,
`lib/admission-guides.ts`, `lib/regions.ts`, page copy, metadata, AI answers).

If any task conflicts with a rule here, **STOP and flag it** — never work around it
silently. These rules outrank convenience, speed, or design preferences.

---

## 1. Purpose & Scope (what GlobalStudyBoard IS)
GlobalStudyBoard is an **educational guidance resource** for students choosing
universities, entrance exams, scholarships, and study destinations worldwide.

The site is **English only** — a single-language resource with NO multilingual or
locale-specific architecture (no `/hi`, no `[lang]` segment, no hreflang, no i18n),
now or in future. Content is written in clear English for an international audience.

It is **only** about: universities, courses, entrance/standardized exams,
admissions processes, scholarships, student costs, application timelines, and
official student-visa *facts*.

It is **not**: a news site, an opinion blog, an immigration/legal advisor, a
financial advisor, a political commentator, or a religious/cultural publication.

---

## 2. The Five Core Rules (non-negotiable)

### Rule A — Authentic, Verified, Official Only
- Every fact (fee, ranking, cutoff, deadline, eligibility, exam pattern, visa
  rule) **MUST** be traceable to a **Tier-1 official source** (see §3).
- **No fabrication, no estimation presented as fact, no "approximately" guesses.**
  If it cannot be verified against an official source, it does **not** ship.
- Every content unit carries a **`lastVerified` date** and a **source link**.

### Rule B — Relevant, Clear, Useful Only
- Add only information a student actually needs to make a decision or apply.
- No filler, no padding, no SEO keyword-stuffing, no clickbait.
- Plain, clear language. Define jargon. One idea per sentence where possible.

### Rule C — Zero Religious Content
- **Strictly NO religious content of any kind** — no Islam, Christianity,
  Hinduism, Sikhism, Buddhism, Judaism, or any faith, practice, festival,
  symbol, ruling, or commentary.
- Exception (factual, neutral, non-promotional only): a university's *official*
  name or *official* faith-affiliation may be stated as a plain administrative
  fact **if and only if** it appears in the institution's official profile
  (e.g. "a Catholic-affiliated private university" as the school describes
  itself). Never expand, interpret, promote, or compare faiths.
- No religious holidays as advice, no faith-based scholarships framed in
  religious terms — state only the official, secular eligibility criteria.

### Rule D — No Politics, No Government Criticism, No Geopolitics
- Present visa, immigration, and government **policy as neutral fact only**,
  quoting the official rule and linking the official source.
- **Never** criticize, praise, editorialize, predict, or take sides on any
  government, policy, election, war, sanction, or border dispute.
- For sensitive destinations (e.g. Russia & CIS, Middle East): state only
  practical, official, student-facing facts (visa process, fees, language).
  No political framing whatsoever.
- Always pair any visa/policy fact with: *"Rules change frequently — verify on
  the official government source before acting."*

### Rule E — Respect & Inclusion (zero tolerance)
- **Absolutely no** content that is disrespectful, fake, abusive, controversial,
  defamatory, discriminatory, or hateful.
- **No** content that promotes hate or stereotypes by religion, race, ethnicity,
  nationality, caste, gender, sexuality, disability, or socioeconomic status.
- Gender-neutral, inclusive language. No stereotypes ("students from X are…").
- Never disparage a university, country, or group. Describe, don't judge.

---

## 3. Source Hierarchy (what counts as "official")
Use sources strictly in this priority order. **Tier 1 is required for any hard
number or rule.** Lower tiers may only add neutral colour, never override Tier 1.

| Tier | Source | Use for |
|------|--------|---------|
| **1 (required)** | Official university `.edu`/domain; official exam board (College Board, ETS, NTA, UCAS, etc.); official government `.gov` immigration/education site | Fees, deadlines, eligibility, exam pattern, visa rules, official rankings |
| 2 (corroborate) | Recognized ranking bodies (QS, THE) for *their own* rankings; official statistical agencies | Rankings explicitly attributed to that body |
| 3 (context only) | Established education-reference outlets | Background only, never for hard numbers |
| ❌ Never | Forums, blogs, social media, agent/consultancy sites, AI-generated claims, Wikipedia as primary | — |

- **Cite the source visibly** (link + "Source: …") next to the fact on the page.
- **Date-stamp**: include the academic year the figure applies to.
- Currency/fee figures: show a **range** with year + currency, never false
  precision; never invent exchange rates.

---

## 4. Hard Prohibitions (content that must NEVER ship)
1. Fabricated or unverifiable rankings, cutoffs, fees, salaries, or statistics.
2. Any religious content beyond the narrow Rule C factual exception.
3. Political opinion, government criticism, or geopolitical commentary.
4. Hateful, discriminatory, abusive, or defamatory content about any group or
   institution.
5. Guarantees or misleading claims ("guaranteed admission", "100% visa
   success", "we'll get you into Harvard").
6. Legal, immigration, medical, or financial **advice** — we provide *guidance
   and official facts only*, never personalized professional advice.
7. Content facilitating academic dishonesty (cheating, plagiarism, fake docs,
   proxy exams, essay-writing-for-hire).
8. Plagiarized copy — all prose must be original; sources are cited, not copied.
9. Scraped personal data or any PII about students/staff.
10. Defamation — never state or imply a college/exam/country is "bad",
    "corrupt", "dangerous", etc.

---

## 5. Required Safeguards on Every Page
- **Site-wide disclaimer** (already global via `Footer` in `app/layout.tsx`) —
  never remove; never alter wording without explicit user approval.
- **Source caption** next to every hard fact (fees, deadlines, visa rules).
- **`lastVerified` date** shown for time-sensitive data.
- **"Verify on the official site"** nudge on visa/policy/fee blocks.
- A standalone `/disclaimer` page, linked in the footer.

---

## 6. USA Content — First Destination (apply all rules above)
When building USA content, the **only** topics in scope:
- Universities (official name, location, official QS/THE rank *attributed*,
  programs, official tuition range + year, official admissions requirements).
- Exams (SAT, ACT, GRE, GMAT, TOEFL, etc.) — official pattern, official fees,
  official registration links.
- Scholarships — official eligibility, official links (state secular criteria only).
- Application process — Common App / Coalition, official deadlines.
- Student visa (F-1) — **factual official USCIS/State Dept rules only**, neutral
  tone, paired with "verify on official .gov" nudge. No commentary on policy.
- Costs — official tuition + official cost-of-attendance ranges, year-stamped.

Out of scope for USA (and all destinations): politics, religion, immigration
opinion, comparisons that disparage, anything not student-decision-relevant.

---

## 7. Independent QA / Editorial Audit (BINDING for ALL content)
**No content ships without passing an independent audit.** "Independent" means
the audit is a **separate pass from the authoring pass** against the checklist in
`.claude/rules/content-qa-checklist.md`, with the result logged.

Process for every new or changed content unit (a college, an exam, a page):
1. **Author pass** — write/update content following this constitution.
2. **Independent QA pass** — a *fresh* review (ideally a separate agent/subagent
   run or a different person) that re-checks **every fact against its Tier-1
   source** and runs the full QA checklist. The auditor must not assume the
   author was right.
3. **Log the result** in `.claude/rules/content-audit-log.md` (date, content
   unit, auditor, pass/fail, sources verified, notes).
4. **Block on fail** — any failed item is fixed and re-audited before shipping.
5. **Existing content** is audited on the same checklist on a rolling basis and
   whenever it is touched.

Audit is **independent of** the author: never self-certify in the same pass.

---

## 8. Corrections & Takedown
- If any fact is found wrong or any prohibited content slips through, **correct
  or remove it immediately**, then log the correction in the audit log.
- Provide the contact email (`bcode8.labs@gmail.com`) for correction requests.

---

## 9. Privacy, PII & PHI — Data-Protection Law Compliance (BINDING)
GlobalStudyBoard must **respect and follow all applicable privacy and data-
protection laws at all times**. This applies to content, code, data files,
analytics, the GSB-AI feature, and any future form or integration.

### 9.1 Core principle — data minimization
- Collect the **least** data possible. If a feature does not strictly need
  personal data, it must not request, store, or transmit it.
- **Never publish, scrape, or store PII** about students, applicants, or staff
  (names, emails, phone numbers, addresses, IDs, photos, application details).

### 9.2 No PHI / health data (HIPAA posture)
- We are an education resource, **not** a healthcare entity, and must **never**
  collect, store, infer, or display **Protected Health Information (PHI)** or any
  individual health data.
- Even where HIPAA does not technically apply to us, we **adopt its protective
  posture**: no health records, no medical histories, no disability/medical
  details about any individual. Disability *accommodation facts* may only be
  stated as a university's **official, public, non-personal policy** (e.g. "the
  university offers an official disability services office") — never tied to a
  person.

### 9.3 Laws we align with (non-exhaustive)
- **HIPAA** — no PHI/individual health data (see §9.2).
- **FERPA** — never expose individual student **education records**.
- **GDPR / UK-GDPR** — lawful basis, minimization, purpose limitation, user
  rights; treat any EU/UK visitor data accordingly.
- **CCPA/CPRA** — California consumer privacy rights.
- **COPPA / age-appropriate design** — our audience includes minors (school
  students); collect **no** personal data from children and keep content safe.
- **India DPDP Act** — applies to our India audience; same minimization rules.
- When in doubt, apply the **strictest** applicable standard.

### 9.4 Practical rules for this codebase
- **No PII in analytics or logs.** Keep analytics anonymous/aggregate; never log
  IPs, emails, or identifiers with personal content.
- **GSB-AI** (`app/api/gsb-ai/route.ts`): do not store user prompts tied to an
  identity; do not request PII; never echo back or persist personal/health data.
- **No third-party trackers** beyond what privacy policy + `middleware.ts` CSP
  already permit; never add a tracker without updating the privacy policy.
- **Contact form / email** collects only what is needed to reply
  (`bcode8.labs@gmail.com`); state purpose and retention in the privacy policy.
- Keep `/privacy` page accurate and current; if data practices change, update it
  **before** shipping the change.
- Never commit secrets, API keys, or personal data to the repo.

### 9.5 Breach / exposure response
- If any PII/PHI is found exposed in content, code, logs, or data, **remove it
  immediately**, then log the incident in `content-audit-log.md` and notify the
  user.

---

## 10. Suggested Additional Guardrails (adopted)
These were added on top of the user's requirements to further reduce risk:
- **No professional-advice framing** (legal/immigration/medical/financial) — §4.6.
- **Source-tier system + visible citations + date stamps** — §3, §5.
- **Anti-plagiarism / original-prose rule** — §4.8.
- **Anti-defamation rule** for institutions and countries — §4.10.
- **No guarantees / no misleading marketing** — §4.5.
- **Neutral-fact-only treatment of visa & geopolitics** with verify-nudge — §4.D.
- **Privacy & data-protection compliance** (HIPAA posture/no PHI, FERPA, GDPR,
  CCPA, COPPA, India DPDP; data minimization; no PII) — §4.9 + §9.
- **Independent (separate-pass) audit + logged sign-off** — §7.
- **Corrections/takedown policy** — §8.

If the user wants more, candidates to consider later: an editorial style guide,
a banned-words list, automated link-rot checks, and periodic re-verification SLAs.

---

## 11. Content Architecture, De-duplication & Continuity — CMI (BINDING)
All content is managed through a single **Content Master Index (CMI)** — the
authoritative registry of every content unit (college, exam, scholarship,
region, guide, page). **The CMI must be consulted and pass validation BEFORE any
new content is added, and BEFORE anything ships.**

### 11.1 One canonical unit — NO duplicates (zero tolerance)
- Each real-world entity (a university, an exam, a scholarship, a region) has
  **exactly one** canonical content unit and **one** stable slug. Never create a
  second record for the same entity.
- **Before adding anything**, check the CMI for an existing unit by normalized
  name + region + type. If it exists, **update it — do not duplicate**.
- Slugs are **unique within their type** and **stable** (never silently changed;
  a slug change requires a 301/redirect plan). No two units share a slug.
- No near-duplicate prose: do not republish the same description/section under a
  different slug to chase keywords. One source of truth, cross-linked.

### 11.2 CMI is the single source of truth
- The content data files (`lib/colleges.ts`, `lib/admission-guides.ts`,
  `lib/regions.ts`, future `lib/scholarships.ts`, guides) are the inputs; the CMI
  **indexes and validates** them and emits a generated registry used by search,
  breadcrumbs, related-content blocks, and the sitemap.
- A validation step (`npm run cmi:validate`) MUST pass with **0 errors** before
  content ships. It enforces: unique/stable slugs, no duplicate entities,
  referential integrity (see §11.3), and required fields.
- If CMI tooling is not yet implemented, the **same checks are performed manually
  and logged** in the audit log until the tooling exists. (Tooling is the
  preferred approach; a manual checklist pass is the interim fallback.)

### 11.3 Relationships & continuity (linked content)
Content is a graph, not islands. Every unit **must declare and render its
relationships** so users can move between related items without dead ends:
- College ↔ Region ↔ Exams it accepts ↔ Scholarships ↔ relevant Guides.
- Every referenced relationship must resolve to a **real, existing unit** in the
  CMI (e.g. a college's `admissionExams` link to real exam pages where we cover
  them; a region's `keyExamSlugs` resolve to real exams). Broken links fail
  validation.
- Relationships should feel **bidirectional**: if A links to B and B is relevant
  to A, B should surface A too (e.g. an exam page lists the universities that
  accept it; a college page links those exams).
- Each content page should end with a **"Related / Next steps"** block drawn from
  these relationships to preserve continuity and a coherent journey.

---

## 12. Navigation, Search & UX Standards (BINDING)
These apply to **every page — current and future** (like the footer disclaimer,
enforce globally via the root layout so new routes inherit them automatically).

### 12.1 Breadcrumb navigation on every page (top)
- Every page shows a breadcrumb trail at the top reflecting its true position:
  `Home > {category group, if any} > {sub-group, if any} > {current page}`
  (e.g. `Home > Universities > United States > MIT`;
  `Home > Exams > SAT`).
- The current page is the last crumb (not a link); all ancestors are links.
- Emit **`BreadcrumbList` JSON-LD** on every page for SEO.
- Labels come from the CMI/content registry, never hard-coded per page.

### 12.2 Persistent search at the top of every page
- A search box is present at the top of every page (global, via the layout),
  searching the CMI index (universities, exams, scholarships, regions, guides)
  with fast client-side matching, and gracefully handing complex/natural-language
  queries to GSB AI.
- Search is keyboard-accessible and works identically on desktop and mobile.

### 12.3 Modern, content-first, fully responsive UI
- UI must be **modern, clean, and content-first** — content is the hero;
  chrome/ads never crowd it out.
- **Fully responsive**: must look and work well on both desktop and mobile
  (and tablet); test both viewports before shipping any UI change.
- Accessible by default: semantic HTML, sufficient contrast (works with the
  forest/cream/stone palette), focus states, alt text, `aria` where needed,
  respects reduced-motion.
- Consistent design language (Fraunces display + Inter body, forest/cream/stone
  palette, rounded cards) — no one-off styles that break consistency.

---

## 13. SEO & Monetization Readiness (BINDING)
### 13.1 SEO baseline on every page
- `generateMetadata()` with title, description, and a **self-referential canonical**
  (the site is single-language English, so **NO hreflang / language alternates**);
  `generateStaticParams()` for every `[slug]` route.
- Appropriate **structured data** (e.g. `CollegeOrUniversity`, `Course`,
  `BreadcrumbList`, `FAQPage` where relevant).
- Every unit is in `sitemap.ts`, has clean slug URLs, and is reachable by
  **internal links** (no orphan pages) — relationships from §11.3 satisfy this.
- Original, useful copy (no keyword-stuffing/duplication — §11.1, Rule B).

### 13.2 Google Ads / AdSense readiness (privacy-first)
- The site is **built ads-ready** (slots reserved, `public/ads.txt` present) but
  **no ads render until the account is approved**; ad config details are filled
  in only after approval.
- Ads must **never** degrade content quality, page speed, or accessibility, and
  must never be placed to cause accidental clicks or to obscure content.
- Ads must comply with privacy law (§9): no PII in ad targeting beyond what the
  privacy policy discloses; update `/privacy` before enabling any ad/tracker.
- Keep ad density tasteful and content-first; content and official-source
  integrity always outrank monetization.

---

## 14. Multi-Jurisdiction Legal Compliance (BINDING — applies to EVERY country & EVERY new content unit)
Legal and regulatory compliance is **not a USA-only concern**. GlobalStudyBoard
covers many destinations (USA, UK & Ireland, Canada, Europe, Australia & New
Zealand, India, and more), and **the laws of each destination apply to the
content we publish about it**. This rule is enforced for **all existing content
and every new content unit, in every language, on every page** — the same way
the footer disclaimer applies site-wide.

### 14.1 Core principle — comply with the law of every jurisdiction we touch
- For **each country/region** we cover, the content about it must comply with
  **that jurisdiction's** applicable laws and the laws that protect our
  audience there — **not** only US law.
- When more than one jurisdiction could apply (e.g. an Indian student reading
  about a UK university), apply the **strictest** applicable standard.
- We provide **official facts and guidance only** — never legal, immigration,
  medical, or financial **advice** for any country (see §4.6). Always pair
  visa/policy/fee facts with the "verify on the official source" nudge (§4.D, §5).

### 14.2 Areas of law to respect per destination (non-exhaustive)
- **Privacy & data protection** — the strictest of: GDPR/UK-GDPR (UK/EU/Ireland),
  PIPEDA (Canada), Privacy Act/APPs (Australia), NZ Privacy Act, India DPDP,
  US HIPAA-posture/FERPA/CCPA/COPPA (§9). Same data-minimization everywhere.
- **Consumer-protection & advertising law** — no misleading/unfair claims, no
  guarantees (§4.5); comply with each market's advertising/disclosure rules
  (e.g. ASA/CAP in the UK, ACCC in Australia, FTC in the US, ASCI in India) for
  any promotional or ad content.
- **Copyright & IP** — original prose only; cite, never copy (§4.8). Respect each
  source's terms of use; no scraping that violates a site's terms or local law.
- **Visa / immigration facts** — neutral official `.gov` facts only, never advice
  or commentary (§4.D); link the official government source for that country.
- **Education-record / student-data law** — never expose individual student
  records anywhere (FERPA-equivalents exist in many countries) (§9).
- **Accessibility law** — meet recognized accessibility standards (WCAG-aligned),
  consistent with §12.3, to respect ADA/EAA/AODA-type obligations across markets.
- **Defamation** — never state/imply a college, exam, or country is "bad",
  "corrupt", "dangerous", etc. (§4.10), in any jurisdiction.

### 14.3 Required workflow for EVERY new or changed content unit
Before any unit (college, exam, scholarship, region, guide, page, AI answer)
ships, the **independent QA pass** (§7) must confirm:
1. **Identify the jurisdiction(s)** the unit touches (destination country +
   audience country).
2. **Check it against those jurisdictions' applicable laws** in §14.2, applying
   the strictest standard where they overlap.
3. **Confirm facts-and-guidance-only framing** (no advice), Tier-1 sourcing
   (§3), the visa/policy verify-nudge, and no prohibited content (§4).
4. **Log the jurisdiction(s) reviewed** in `.claude/rules/content-audit-log.md`
   alongside the normal sign-off; **block on any fail** until fixed.

### 14.4 Standing obligations
- **New destinations**: before adding a new country/region, confirm the above
  areas of law are accounted for; if a destination has rules we cannot meet for
  certain content, **do not publish that content** — flag it to the user.
- **Law changes**: laws change frequently; whenever a rule we rely on is known to
  have changed, correct or remove the affected content immediately and log it
  (§8). Keep `/privacy`, `/terms`, and `/disclaimer` accurate and current.
- **We are not lawyers**: this constitution encodes a protective compliance
  posture, not legal advice. If a genuine legal question exceeds these rules,
  **STOP and flag it to the user** — never guess or work around it.


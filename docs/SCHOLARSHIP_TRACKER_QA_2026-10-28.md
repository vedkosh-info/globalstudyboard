# Scholarship tracker — independent QA, 28–29 October 2026

**Result: PASS for the reviewed local implementation, 29 October 2026.** No
blocking local finding remains after the final production-build reruns. This
does not authorise deployment or certify the production database, real sign-in
delivery or student adoption.

## Scope and separation

The independent QA agent did not author the application, database migration, catalogue or privacy integration. Work is confined to the selected GlobalStudyBoard root. No production account, personal records or database was accessed, and no commit, push or deployment was performed.

## Existing tools baseline

Tested the pre-existing local production build before the fifth tool was added. Tests ran in Chromium using the installed Google Chrome executable. External requests were blocked; the private presentation run used an isolated fake session and intercepted Supabase read responses containing empty arrays.

| Check | Result | Scope |
| --- | --- | --- |
| Tool integrity guard | PASS | Four tools, nine destinations, 75 guide links, 33 currencies, 53 validity rules. |
| Public tool shells | 12/12 PASS | Four tools at 320, 768 and 1440px. HTTP 200, one h1/main, self-canonical, footer disclaimer, gate before feature prose, feature text at least 16px, no horizontal overflow or JavaScript errors, no axe violations after hydration settled. |
| Signed-in empty presentation | 12/12 PASS | Four tools at 375, 768 and 1440px. Fake session and intercepted reads; no external database operations. All tool interfaces rendered without overflow or browser errors. |
| Merge-first check | PASS | `find-home "Scholarship Application Tracker"` found no existing equivalent guide; highest reported similarity 0.11. The new unit is an interactive tool rather than another scholarship advice guide. |

The first public run caught one audience-toggle contrast snapshot during its colour transition. Repeating with a 500ms post-hydration settling interval produced no violation. The harness was corrected; no product workaround was introduced.

Evidence is under ignored `image-pipeline/raw/scholarship-qa-2026-10-27/`: `baseline-public.json`, `baseline-private.json`, their reproducible scripts and screenshots. The directory reflects the task start date; the resumed baseline completed on 28 October.

These checks establish local public and empty private presentation. They do not certify real OTP/OAuth delivery, deployed migrations, real database CRUD or current production reliability.

## Fifth-tool review

The final independent reviewer read the new interface, domain/report model,
catalogue, migration, account integration, shared handoff fix and implementation
runbook. Findings were returned to the author; the independent reviewer changed
test scripts and this report, not the product implementation.

### Completed local checks

| Check | Result | Evidence and limitation |
| --- | --- | --- |
| Pure domain/report tests | 19/19 PASS | Calendar bounds, URL safety, closed-record workload, CSV formula escaping, note opt-in, all nine destination boundaries, shared disclaimer and non-affiliation text. |
| Shared tool handoff regressions | 13/13 PASS | Explicit record/preset/exam keys survive old-gate cleanup; explicit destination wins; absent destination inherits; expired/unrelated/abandoned intent is discarded. |
| Integration assertions | 90/90 PASS | Catalogue links and regions, auth fragment allow-list, registry, sitemap, account export/privacy/deletion integration. |
| Independent local database rerun | 74/74 PASS | All eight migrations compiled; 0008 rerun. Own-row/passwordless controls, caller rejection, caps, retries, stale versions, budget rollback/duplicates and deletion cascades. PGlite has one backend; no live Supabase or simultaneous-session claim. |
| Responsive public shell | 3/3 PASS | 320, 768 and 1440px: canonical, h1/main, footer, no overflow/page errors or axe violations. |
| Responsive private presentation | 27/27 PASS | Nine destinations at 375, 768 and 1440px; one destination visible, no overflow/page errors or axe violations. Isolated fake auth and REST fixtures. |
| Interactive fixture flows | 13/13 PASS on final production build | Name-only save, collapsed optional form, one-action preset/repeat without duplicate, catalogue failure, remembered destination priority, details/tasks/funding, CSV privacy, actual Planner-to-record navigation and reload, stale-edit recovery, lost-create response recovery, funding-draft retention/discard, unsaved-link cancel/accept, saved-link no prompt, drafts across destinations. |

The fixture browser suite lives in `scripts/qa/scholarship-browser.mjs`; results
and screenshots are under ignored `image-pipeline/raw/scholarship-qa-2026-10-28/`.
The pure and handoff tests run through `npm run scholarships:check`. The local
database harness and browser-to-database script are reviewed separately below;
fake fixture tests do not prove database enforcement.

### Corrected issues

- New saves initially expanded the optional details form. They now leave it
  collapsed, while a link to an existing record opens the intended card.
- Stale details and task edits now preserve the draft and offer an explicit
  latest-value review, discard or rebase choice; a refresh cannot silently
  overwrite an active draft.
- A retried creation after a lost response keeps its UUID. If the student has
  changed the input meanwhile, the recovered record is shown and the new input
  remains available for an explicit subsequent save to that same record.
- Received, unsuccessful and withdrawn records retain history but no longer
  contribute active workload or Planner next steps.
- A real Planner-to-tracker click exposed an old gate's destination carry
  replacing the clicked `entry` fragment. The shared handoff now preserves
  explicit keys and fills only a missing destination; actual navigation plus
  reload passes, in addition to the 13 regression tests.
- The new static shell now follows the existing tools' `SITE_REVIEWED` display
  convention. Identity source-review dates remain separate; neither this QA
  nor the new UI pretends the entire content catalogue was reverified.
- The final review requested protection for unsaved details on same-tab links,
  since `beforeunload` alone does not cover Next.js client navigation. The author
  added a discard confirmation and a visible unsaved notice. An independent
  12-flow development rerun passed cancel, accept and no prompt after saving.
- Changing a stage away from accepted/received could drop an unsaved funding
  amount and leave a stale unsaved warning. The final author patch retains that
  draft, allows explicit discard and resumes it when the stage allows funding;
  a focused regression passed on the final production server.

### Content, sources and privacy

The reviewer independently reopened the nine official programme sources on
29 October. Identity, provider attribution and destination mapping agree with
the compact catalogue. Seven programme pages were retrievable directly;
[Campus France's official indexed page](https://www.campusfrance.org/en/france-excellence-eiffel-scholarship-program)
corroborated Eiffel after direct retrieval returned 403, and the
[official INSPIRE FAQ index](https://www.online-inspire.gov.in/Account/FAQ)
corroborated SHE after the direct request timed out. Additional official
[Chevening](https://www.chevening.org/about/) and
[Fulbright](https://fulbrightprogram.org/about/) programme descriptions confirmed
provider attribution. The full programme links are recorded in the
[catalogue source review](SCHOLARSHIP_CATALOGUE_REVIEW_2026-10-28.md).

The presets do not state an amount, deadline, availability, eligibility match
or successful outcome. The source-review label covers the identity mapping
only. The broad Qatar/Open Doors guides save a specifically named programme,
not an invented umbrella award. All nine destinations also support manual entry.
No existing guide body was reverified as part of the preset review.

The new data is private account functionality under the existing 18+ account
model. No upload, AI request, new analytics event, outbound reminder, public
record or browser-persisted draft was introduced. Free text discourages sensitive
details. Notes require explicit export opt-in. The migration has account
cascades, own-row passwordless RLS, anonymous-write revocation and cap guards
that reject inappropriate callers before counting and take transaction locks.
The account export and deletion disclosures include both tables. The funding
handoff is an explicit accepted/received-award action with same-destination and
same-currency checks; it is not payment confirmation or a financial verdict.

Jurisdiction scope: worldwide audiences across India, United States, UK and
Ireland, Canada, Europe, Australia and New Zealand, Middle East, Russia and CIS,
and East and Southeast Asia. Preset identities concern Australia, Canada,
South Korea, France, India, Qatar, Russia, UK and USA. Review applied the
constitution's strict shared minimisation, private-record protection, neutral
guidance, original-prose, accessibility and no-guarantees requirements. It found
no new jurisdiction-specific legal, visa, medical or financial advice, no
religious/political content, discriminatory assertion or copied source body.
This is an engineering/content review of the changed feature, not a legal
certification of every law or a new audit of the existing account service.

### Final build and rerun

The author completed the final production build after the last funding-draft
fix. The independent reviewer inspected its successful log: 3,461 static pages,
five-tool/nine-destination integrity guard passed, no build failure. Lint,
typecheck, CMI (zero errors) and the strict duplicate gate were also reported
passing by the author on the final source. Earlier merge-first evidence remains
recorded above; this change adds a tool, not duplicate scholarship guide bodies.

The independent reviewer then reran against `next start` on port 5000:

- **43/43 Scholarship Tracker checks passed:** three public shell widths,
  27 private destination/width combinations and 13 interactive flows.
- **12/12 existing-tool public checks passed:** each of the original four tools
  at mobile, tablet and desktop widths, preserving canonical/heading/footer,
  feature readability, no overflow/page errors or axe violations.
- **12/12 existing-tool private presentation checks passed:** expected tool
  controls and authenticated fixture reads, no overflow/page errors, one main
  heading and retained footer. These are empty fixture views, not real accounts.
- Mobile, tablet and desktop screenshots were visually reviewed. The name
  field/save button, one-action preset and next-step cards remain readable;
  optional forms are collapsed; the shared navigation and disclaimer remain.

Independent evidence: `image-pipeline/raw/scholarship-qa-2026-10-28/browser-results.json`
(43 checks, zero failures), `image-pipeline/raw/scholarship-independent-production-browser.log`,
and the preserved existing-tool reruns under
`image-pipeline/raw/scholarship-final-qa-2026-10-29/`. The original baseline under
the earlier directory was not overwritten.

The author separately reported **18/18 browser-to-local-PostgreSQL checks**;
the independent reviewer read the resulting `result.json` and test scope. That
harness routes SDK requests through actual PGlite RPC/RLS with fake auth and
external network blocked. It covers creation, default checklist, edits, date
wire format, funding, stale/lost-response recovery, CSV, browser PDF, populated
widths and Planner record navigation. The author also rendered and visually
reviewed the final PDF. Its early date-format adapter issue was corrected in
the harness to match PostgREST's `YYYY-MM-DD` wire format; no product workaround
was introduced. Evidence is under
`image-pipeline/raw/scholarship-browser-2026-10-28/` and
`image-pipeline/raw/scholarship-browser-db-final.log`.

The reviewed documentation now describes the actual workflow, database
prerequisites, correct GSB project/account, explicit rollout checks and student
validation plan. The audit log records this scoped local pass. No production
migration, server document upload, commit, push or deployment was performed.

## Remaining external validation

Real student task studies, production account flows, live database rollout,
assistive-technology testing and field performance remain separate acceptance
work. The unsaved-draft guard covers document unloads and ordinary same-tab
links; browser history/programmatic route changes are not certified as guarded,
so drafts must be saved before those actions. No universal 10/10 or complete
legal-compliance certification is claimed by automated engineering checks.

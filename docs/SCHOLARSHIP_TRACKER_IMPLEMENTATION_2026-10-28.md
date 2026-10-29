# Scholarship Tracker — implementation and handoff

Implementation started 28 October 2026; final local checks completed
29 October 2026. **Release update, 29 October 2026:** implementation and independent local checks
passed. Migration 0008 is now applied to the correct production database, with
SQL/REST schema verification and live rollback-only access/save/funding checks.
Real OTP/OAuth delivery and real student use are not established by those checks. The independent QA report is the authority for final verification
results: [Scholarship Tracker QA](SCHOLARSHIP_TRACKER_QA_2026-10-28.md).

## Student experience

The fifth tool is `/tools/scholarship-tracker`. After signing in, a student can
type a scholarship name and press **Save scholarship**, or save a reviewed
programme suggestion in one action. No questionnaire, eligibility profile,
amount, deadline or document is required. A new record gets one undated next
step: check the current requirements on the official site.

Saved cards show the application stage and next open step. **Details & checklist**
stays collapsed after creation. Students open it only when they want to add a
provider, official URL, cycle, university link, private note, checklist item or
date. Changing a stage or completing the next step does not require opening a
long form. Filters separate active and closed records.

The header's destination is the only destination control. All nine destinations
support the same manual workflow: Australia & New Zealand, Canada, East &
Southeast Asia, Europe, India, the Middle East, Russia & CIS, UK & Ireland and
the United States. Other-destination records are counted separately; they do
not enter the current list, workload or report. A remembered destination choice
takes priority over a link hint.

## Useful connections to the existing tools

- The Application Planner reads the scholarship's original checklist and links
  back to that record. There is no copied deadline to maintain in two places.
  Received, unsuccessful and withdrawn applications retain their history but
  stop contributing active next steps and overdue/upcoming counts.
- A scholarship can optionally link to the student's existing university
  application in the same destination.
- After the student marks an award **accepted** or **received**, an explicit
  action can add its confirmed amount to an existing same-destination budget.
  The student chooses the budget, amount and one-off/per-year basis. The server
  validates the budget currency and permitted amount precision; it never
  converts currencies. The operation is atomic and duplicate-safe. Applications
  awaiting a decision never become expected funding automatically.
- A transferred funding line is subsequently managed in Cost & Funding Planner.
  Removing the scholarship keeps that budget line; removing the budget line
  clears the tracker link. The interface explains this behavior.
- CSV and browser-generated PDF downloads cover the selected destination.
  Private notes are excluded unless the student opts in. The PDF uses the
  existing report model, fonts and exact disclaimer; neither export contains
  the account email or internal record identifiers. The legacy `/report` route
  redirects to the inline download controls.

## Programme suggestions and accuracy

The compact, server-only catalogue contains nine individually reviewed named
programme identities linked to existing canonical guides. It does not turn
every scholarship guide into an award. Each preset contains only the name,
provider, destination and official source needed to save typing.

`sourceReviewed` covers that identity mapping only. It does not certify a current
application cycle, eligibility, open applications, amount, deadline or a full
re-verification of the linked guide. The source note is visible, and students
must check current rules with the provider. The set is a small starting point,
not a comprehensive directory, ranking or personalised match. Manual entry
continues to work if suggestions cannot load.

See [the catalogue source review](SCHOLARSHIP_CATALOGUE_REVIEW_2026-10-28.md)
for official sources and retrieval limitations. No guide bodies or their
verification dates were changed by the identity projection. The tool makes no
eligibility or award prediction, submits no application and gives no financial
or immigration verdict. Dates are the student's calendar reminders; the
provider's closing time and time zone still govern the application.

## Data, reliability and privacy

Migration `0008_scholarship_tracker.sql` adds `scholarship_entries` and
`scholarship_tasks`, with passwordless own-row row-level security, anonymous
insert/update revocation, account-deletion cascades and serialized caps:
100 scholarships per account, 20 checklist items per scholarship and 1,000
checklist items per account. Guards refuse invalid subjects and another
account's row before counting. Account export, privacy and account-deletion
disclosures include the new records.

Saves use client-generated UUIDs so a retry after a lost response finds the
original creation. Existing edits compare `updated_at`; the UI retains an
unsaved draft and requires explicit review, discard or rebase when the saved
record changed elsewhere. An uncertain response is described as uncertain,
not as a failed or successful save. Optional application and budget reads can
fail without blocking the core tracker. Missing tracker tables produce a setup
state. Drafts are not written to browser storage and private content is not
logged.

Unsaved details, checklist input and funding input stay in memory when changing
the destination or filtering the current view. The UI warns on same-tab link
navigation and requests the browser's standard warning on refresh or tab close.
Browser Back/Forward and programmatic route changes are not intercepted, and
browsers may suppress unload prompts. This is a draft guard, not autosave or
persistent draft recovery: students must save before leaving to retain edits.

The public route remains a static, indexable shell under the shared layout,
footer and disclaimer. Client session presence controls lazy loading only;
database policies enforce access. The catalogue is not imported into client
bundles. Strict fragments carry programme presets (`#award=`), existing records
(`#entry=`) and destination hints through sign-in without adding indexed query
URLs. Tool links preserve the shared header and destination behavior.

No additional Gemini call is necessary: a reliable name save, checklist and
official link solve this workflow directly. AI extraction would need a separate
accuracy and privacy evaluation before it could supply useful assistance. No
file uploads, storage bucket, document processing, new tracking service or
notification provider has been introduced. Documents remain with the official
provider; free-text fields discourage sensitive identity, banking and medical
details. Accounts remain restricted to people aged 18 or over.

## Implementation map

| Area | Files |
| --- | --- |
| Public shell, gate and interactive UI | `app/tools/scholarship-tracker/` |
| Domain rules, limits and CSV | `lib/scholarship-tracker.ts` |
| Interface copy and safe error messages | `lib/scholarship-ui.ts` |
| Identity projection and public types | `lib/scholarship-catalogue.ts`, `lib/scholarship-options.ts` |
| Shared report model | `lib/reports/scholarship-report.ts`, `lib/reports/model.ts` |
| Planner view of original checklist | `components/tools/ScholarshipPlannerSteps.tsx` |
| Guide entry points | `components/TrackScholarshipLink.tsx` |
| Database schema and atomic writes | `supabase/migrations/0008_scholarship_tracker.sql` |
| Account integration | `app/api/account/export/route.ts`, `app/privacy/page.tsx`, `app/delete-account/page.tsx` |
| Discovery and canonical URLs | `lib/tools.ts`, `lib/sitemap-entries.ts`, tool index, region hubs and account menu |
| Sign-in and in-app link handoff | `lib/auth-events.ts`, `components/tools/hand-off.ts` |

## Verification evidence and its limits

The following completed local checks were reported during implementation. The
independent QA report records reruns and any later additions; do not interpret
these as production results.

| Check | Recorded result | Scope |
| --- | --- | --- |
| Four existing tools, public shells | 12/12 passed | Final production build: four tools at mobile, tablet and desktop widths. |
| Four existing tools, signed-in empty presentation | 12/12 passed | Final production build: isolated fake session with intercepted reads. |
| Scholarship pure domain/report checks | 19 passed | Dates, safe URLs, active workload, nine-destination isolation, CSV/PDF model and note opt-in. |
| Shared tool handoff regression checks | 13 passed | Explicit record/preset/test fragments, destination precedence, expiry and unrelated navigation. |
| Scholarship integration assertions | 90 passed | Catalogue, canonical links, fragment allow-list, metadata, sitemap and account integration. |
| Local database harness | 74 passed | Migrations 0001–0008 in PGlite, ownership/RLS, caps, retries, stale edits, funding and cascades. |
| Independent scholarship production-browser suite | 43/43 passed | 27 private destination/viewport checks + 3 public shell checks + 13 flows, including actual Planner record click/reload, stale/retry recovery, draft navigation and funding-draft preservation. |
| Production browser to local database | 18 passed | Real local PGlite RPC/RLS behind intercepted requests: saves, dates, conflicts, retries, funding, actual Planner record link, CSV/PDF and three viewport widths. |
| Production build and repository gates | Passed | Build generated 3,461 static pages; lint, typecheck, tools, CMI and strict duplicate checks passed. |

Review found that an old tool's destination carry could replace an explicit
record fragment. The shared handoff now preserves the selected record/preset
and destination; the actual Planner-to-tracker navigation passed in the final
production-build browser/local-database run. The generated PDF was also rendered
and visually checked, with private notes excluded by default. The independent
production-browser suite and all four existing-tool reruns passed. The
[independent QA report](SCHOLARSHIP_TRACKER_QA_2026-10-28.md) records the full
scope, fixes, evidence and remaining external validation.

Useful commands, from the GSB root:

```sh
npm run scholarships:check
node scripts/qa/scholarship-database.mjs
node scripts/qa/scholarship-browser-db.mjs
node scripts/qa/scholarship-browser.mjs
npm run tools:check
npm run lint
npm run typecheck
npm run cmi:validate
npm run dup:check:strict
npm run build
```

The browser scripts need a local server on port 5000 and their documented test
runtime. They block external requests and use controlled fixtures/local data.
The database harness is not a live Supabase/GoTrue test and has one backend;
concurrent live-session behavior is not established by that harness. No real
student data was used for these checks.

## Production handoff

The owner authorised publication of all GSB local changes on 29 October 2026.
Migration 0008 has been applied and verified in the correct production project.
`SITE_LASTMOD` is 2026-10-29 for this release. GitHub/Vercel deployment status must
be confirmed from the release revision and production deployment records. Follow the dated [account setup checklist](../ACCOUNTS_SETUP.md#scholarship-tracker--0008-rollout-checklist)
for the correct GSB project, dependency migrations, verification queries and
real account checks. No new service credential or document upload is needed.
The current owner request authorises commit, main push, production deployment and safe cleanup after successful verification.

## Next phase: validate with students

After rollout and account checks, run a small moderated pilot with consenting
adult students across several destinations, including domestic and international
applicants and mobile users. Use fictitious scholarships and amounts, or let
participants choose non-sensitive examples; do not collect application documents
or copy their private notes. Record anonymous observations only with consent.

Give participants these tasks without demonstrating the controls:

1. Save a scholarship they want to investigate, with no known deadline.
2. Add a next step and a date, then locate that same step in Application Planner.
3. Return to the scholarship from the Planner and update its stage.
4. Record a fictional accepted award in a matching test budget, then verify
   that repeating the action did not create duplicate funding.
5. Download a tracker without private notes and explain what the file contains.

Measure independent task completion, interventions, elapsed time, taps/fields,
misunderstandings and recovery from errors. Separate first-use sign-in time from
time spent saving the first record. Pay particular attention to whether students
understand that dates are their reminders, programme suggestions are not
eligibility matches, and accepted funding is not a payment guarantee.

Use at least five participants for the first formative round, then iterate on
observed problems and retest; that is a practical study plan, not statistical
proof. Any wrong-record edit, duplicate funding, privacy leak or inability to
recover a save blocks expansion. The name-only and preset paths should be
completed without assistance. Do not claim a 10/10 rating from automated tests,
author preference or a small pilot; report the actual observations and ratings
with their sample and limitations.

Expand programme discovery only if students repeatedly fail to find a useful
official starting point, and only with maintained Tier-1 identity sourcing.
Evaluate AI only for a demonstrated task where it reduces effort without
inventing facts. Add outbound reminders only after students request them and a
consented delivery/time-zone/unsubscribe design, privacy disclosures and reliable
provider are ready. No email or push reminder is currently sent by this tracker.

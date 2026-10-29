# Independent source release review — 29 October 2026

**Result: GO for the reviewed GlobalStudyBoard root source**, conditional on the
release owner's final production build and verification of the deployed release.
Any new implementation imported from another worktree needs review before it is
included. This source review does not claim that a production migration or real
account flow has run.

The reviewer did not author the pending application changes, consolidate
worktrees, commit, deploy, apply migrations or remove files. Review covered the
root diff, untracked implementation files, project constitution and checklist,
the existing independent UI/media review and Scholarship Tracker QA report.

## Scope and findings

- The shared home, media, directory, search, dialog and tool-page changes match
  the scope reviewed in [the UI review](UI_UX_INDEPENDENT_QA_2026-10-26.md).
  Public search is a static destination projection requested without credentials
  or referrer. Question and destination context are preserved into Ask GSB.
  The exact global disclaimer remains in the root Footer. The security-header
  and CSP configuration is unchanged.
- Content corrections withhold the two units listed in that review and retain
  redirects to existing guides. Seven retained guides carry partial-edit dates
  without changing their original verification dates. Three university course
  arrays and two topic reference/keyword arrays have the documented removals.
  No new admissions, monetary, visa or ranking claim was introduced by those
  corrections. The prior independent source comparison and audit remain valid
  for that unchanged content scope.
- The fifth tool matches [the tracker QA](SCHOLARSHIP_TRACKER_QA_2026-10-28.md):
  name-only saving, optional collapsed fields, student-authored dates and
  checklist, explicit confirmed-funding handoff, private data controls and
  export/deletion disclosures. The public programme projection is identity
  data with a narrow review label; it supplies no eligibility or award verdict.
  The same-tab navigation and funding-draft fixes are present. The shared
  handoff preserves explicit record/preset/test fragments during destination
  cleanup.
- `SITE_LASTMOD` is set to the planned release date, 29 October 2026;
  `SITE_REVIEWED` remains unchanged, avoiding a false catalogue re-verification.

No release-blocking source issue was found. The review independently reran
`npm run scholarships:check` (19 domain/report, 13 handoff and 90 integration
checks), `npm run tools:check` (five tools, nine destinations) and
`git diff --check`; all passed. Existing responsive, accessibility, image,
browser/local-database and pure database evidence is recorded in the linked
independent reports. Those checks were not needlessly repeated here.

## Production evidence required at close-out

The release owner must record the final build, GitHub main revision and Vercel
production deployment state. Scholarship database migration state, real
passwordless sign-in and private production flows must be reported from actual
evidence; the source build alone cannot establish them. Preserve any data or
worktree content not confirmed consolidated before cleanup. Real student
feedback, assistive-technology testing and field performance remain distinct
from this engineering release review.

Jurisdiction and audience scope follows the existing reviews: all nine
destination groups and worldwide audiences, with programme identity sources
for Australia, Canada, South Korea, France, India, Qatar, Russia, the UK and the
USA. Shared minimisation, private-record, accessibility, original-prose,
neutral-guidance and no-guarantees requirements were checked for this change.
No new jurisdiction, legal advice, public student record, tracking provider or
document-upload service was introduced. This is not a certification of every
law or of untouched catalogue facts.

## Release-owner evidence added after independent source review

The final production build passed (3,461 static pages), together with lint,
TypeScript, CMI zero errors and the strict duplicate gate. All three registered
legacy worktrees share the GSB common Git directory and remote, have no commits
ahead of main, and contain only root-equivalent or superseded historical work.
No novel implementation was imported. Before cleanup, tracked patches and
untracked source snapshots were retained under the ignored release evidence
folder; credentials were excluded.

The owner opened Chrome for the database rollout. The active tab initially
showed another project; no change was made there. A separate tab was opened on
GSB ref `xrfcxocqqshfilseojau`. Migration 0008 was applied in one transaction.
A subsequent live transaction tested own-row/passwordless policies, anonymous
write revocation, save/default checklist, retry preservation, stale rejection,
funding deduplication and account isolation, then rolled all synthetic data back.
Independent REST metadata probes confirmed both new tables and all three RPCs.
Real OTP/OAuth delivery and student studies are still not claimed.

# GlobalStudyBoard route and interaction audit — 26 October 2026

This lane reviews the entire route architecture and shared interactions. It is
an author-pass implementation record, not a claim that every admission fact or
private-account workflow was freshly verified. Root owns imagery, the home
hero, the shared layout and final integrated browser/performance checks; the
performance lane owns search. No commit, push or deployment is authorized.

## Scope and coverage matrix

There are 37 `page.tsx` source templates plus the custom not-found boundary.
The baseline prerender manifest and source route inventory were both inspected;
using only the prerender manifest would miss two query-preserving report redirects.

| Surface | Catalogue/route scope | Review performed and integration checks required |
|---|---:|---|
| Home | One shared page, nine destination states | Root owns hero and home cards. Shared header/search/destination/audience/footer/dock reviewed here in source. |
| Global directories | Universities, exams, guides, destinations, topics, scholarships and tools | Common card hierarchy and descriptions; destination filters; native details; directory structure; all-region crawlable links. |
| University profiles | 130 | Shared navigation/actions and article structure reviewed. Exact-photo binding/image relevance belong to image lane. |
| Exam pages | 53 | Shared profile/record-score actions and index heading hierarchy; source link/date patterns. |
| Guides | 2,701 baseline; 2,700 after withholding the prohibited unit | Template, ToC, relationships, audience context and sources reviewed in source. Whole-generated-route checks belong to root. No fresh verification of 2,700 bodies is claimed. |
| Destination hubs | All nine | Shared destination engine, navigation and equal treatment; root renders all nine. |
| Regional categories | 36 (nine × four) | Source review of all four branches; guide branch now a readable title directory, keeping all links in static HTML. |
| Regional track landings | 78 baseline prerendered landings | Track/sibling navigation, labelled headings, hub cards and next-step path; compiled route enumeration covers each landing. |
| Topic hubs | 368 | Shared hub outline, groups/related guides and index cards; listing descriptions raised to 16px. |
| Search | One public utility, selected destination | Identified unnamed mobile submit and capped/misleading totals; performance lane fixes these with lazy per-destination JSON, honest counts and progressive results. |
| Ask GSB | One conversation utility | Empty-mount viewport jump, streaming scroll, input width/name, live log, error announcements, network cleanup and response-report modal. Mock network only in QA. |
| Account utilities | `/login`, `/account`, `/admin` | Static/noindex shells, configured/unconfigured and signed-out states, labels, consent/auth failure/status patterns inspected. Real OTP/OAuth, private data CRUD/export/deletion and owner moderation are not exercised. |
| Interactive tools | All four public tool shells and gates | Destination hints, signed-out/configuration/loading/offline/session/chunk/error states; no SDK/catalogue in public gate. Private CRUD/PDF integration requires authenticated QA. |
| Old report URLs | All four `/tools/<slug>/report` routes | Now redirect to their tool; cost preserves `?budget=`, compare preserves `?set=`. Planner and score routes are static redirects; two query readers are dynamic. No separate report-page visual UI should be claimed. |
| Trust/legal/help | About, contact, cookies, delete-account, disclaimer, editorial policy, privacy, sources and terms | Shared readable measure and persistent protected footer; contact availability and claims corrected. Legal/factual copy otherwise preserved. |
| Not found | Global not-found boundary and invalid dynamic slugs | Useful destination/section paths, own heading/noindex; root should test an actual missing path. |
| Shared modal/chrome | Notification, sign-in, tester invitation, feedback, feedback-load failure, response report, quick actions, destination/topics/mobile menus | Critical inert/scroll/focus corrections below. No real messages, signup or tester invitations submitted. |
| Non-visual routes | APIs, auth callback, feeds, sitemaps, manifest, robots, catalogues, icons and social cards | Classified as infrastructure, not given a fabricated visual score. Existing auth/security/data behavior preserved. |

## Implemented fixes

### Readability and directory cost

- `CollegesView`, `ExamsView`, `GuidesView` and `TopicsIndex` now render substantive
  card descriptions at 16px with generous leading. Main card titles are 20px;
  compact labels remain secondary. Exam titles now use native heading elements.
- All regional guide listings retain their complete crawlable set, grouped by
  the existing primary-track assignment. Jump links and native track headings
  make the long directory skimmable. A title link replaces a full description,
  reading-time icon and duplicated CTA on every row. This avoids hundreds of
  repeated cards and decorative SVGs while preserving the route's purpose.
- Regional university/exam/scholarship card body copy also uses 16px. No content
  body was rewritten to achieve a visual change. Root measures final HTML/DOM
  savings after the combined production build.

### Conversation behavior and accessibility

- Removed page-level `scrollIntoView` on the initial empty chat and every streamed
  chunk. Scroll now stays inside the conversation and follows only while the
  reader remains near the bottom; sending a new question deliberately resumes
  follow mode. No smooth animation is queued per chunk.
- The conversation is a named live `log`, marked busy while an answer streams;
  errors are alerts. The input has an explicit accessible name, send keyboard
  hint, `min-w-0` for narrow screens and 16px text. Answer text is 16px.
- Aborts the client request on route unmount. Existing API payload, prompts,
  example questions and reporting endpoint are unchanged.
- Removed inline animation-delay styles, retaining reduced-motion-aware text
  progress rather than three bouncing dot animations.
- Search-to-Ask links retain the question and destination together. Ask reads
  those two fragment values independently, applies a validated destination as
  provisional page context and waits for that context before enabling send.
  The remembered header choice wins; a link hint never writes its cookie.
  Hash changes, reload and Back/Forward keep the paired context.

### Shared modal correctness

- `lockBackground` uses the existing reference-counted fixed-body scroll lock;
  it never writes a non-visible body overflow. It preserves every pre-existing
  inert attribute value, reference-counts overlapping owners, and releases
  idempotently. The new root skip link is included in the inert background.
- The active panel, its descendants and its outer wrapper are excluded from the
  inert sweep. Notification's semantic header formerly matched the `header`
  selector and disabled its own close/read controls; it stays operable now.
- Notification focus returns only after the background unlocks, and only on the
  same path. CSS now handles its responsive viewport-safe geometry, removing
  inline coordinates, resize listeners and a first-frame positioning update.
- Sign-in and tester-invite dialogs use the same lock rather than independent
  unconditional inert cleanup. Their existing consent/auth/input/focus flows
  remain intact.
- Response reporting now portals outside `main`, traps focus, locks the page,
  announces failures, restores the opener only after an actual close, and blocks
  dismissal or duplicate submission while the request is pending. It no longer
  steals focus each time an answer's report button mounts. Pending panels with
  no enabled control retain focus on the panel.

### Honest contact availability

The local feedback backend is unconfigured (checked as a boolean only; its value
was never printed). `/contact` no longer claims that its form reaches the team
when that backend is absent. Build-time server availability chooses clear email
instructions instead; in-page form entry points appear only when configured.
The configured branch still promises confirmation only after a send succeeds.
No secret backend URL is passed to a client component and the global feedback
fallback remains available.

### Content-constitution correction discovered during relevance review

`find-home "Finance and accounting degrees in the Gulf"` was run first. It
identified the existing general Gulf finance/accounting guide as the canonical
home (0.77 same-concept match). The dedicated religious-finance unit is outside
Rule C's narrow official institution-affiliation exception and was withheld:

- Removed exactly one guide and its four reciprocal related-guide references;
  removed one finance-hub reference. No replacement factual body was authored.
- Preserved the four affected guides' `lastVerified: 2026-06-24` and added
  `contentUpdated: 2026-10-26` for the partial relationship correction.
- Added one permanent legacy-URL redirect to
  `/guides/finance-and-accounting-degrees-in-the-gulf`.
- CMI validates 2,892 units / 2,700 guides with zero errors afterward. There is
  no new unit or duplicate. Root performs the final strict duplicate gate.
- `next.config.js` before `redirects()` (including all CSP construction) and
  the entire `headers()` block were compared byte-for-byte with HEAD: unchanged.

Jurisdictional scope of this corrective removal: Middle East destination
coverage (UAE, Saudi Arabia, Qatar, Oman, Bahrain, Kuwait) and the global audience.
It removes prohibited content and changes links only; it does not assert or
re-verify any admission, financial, legal, visa or professional fact.

## Local verification from this lane

- Targeted ESLint on every owned runtime file: zero errors and zero warnings.
- `git diff --check`: clean.
- CMI: zero errors after the withholding correction.
- A real Chromium fixture executes the actual transpiled shared lock/helper and
  checks 12 behaviors: fixed-body/no-overflow lock, background inert, skip-link
  inert, active notification header operable, sticky header pinned, forward and
  reverse Tab wrapping, pending zero-control panel focus, nested/idempotent
  releases, newly added inert cleanup, previous inert value retention and scroll
  restoration. **12 passed, zero failed.** Evidence:
  `image-pipeline/raw/review-2026-10-26/dialog-lock-fixture.json` (ignored).
- The production-build Search-to-Ask handoff suite passed **12 checks, zero
  failed**: paired question/USA link, exact prefill, USA request context without
  a remembered preference or cookie write, reload, hash change, Back/Forward,
  clearing provisional context on leaving Ask, and remembered Canada taking
  precedence without rewriting its cookie. Chat responses were locally mocked;
  actual API traffic was blocked. Evidence:
  `image-pipeline/raw/review-2026-10-26/ask-destination-handoff-qa.json` (ignored).
- On the final combined production server, the actual interaction suite passed
  **90 checks, zero failed**. Notification close-button and Escape paths,
  sign-in, Android tester invitation and feedback were exercised at
  375×844, 768×1024 and 1440×1000. Each panel stayed within its viewport,
  trapped forward/reverse Tab, made the background and skip link inert, kept
  body overflow unchanged, and restored scroll/background/opener on close.
  No actual API requests occurred.
- The same suite checked mobile Ask with locally mocked streaming and reporting:
  no empty-mount jump, named busy live log, contained stream scrolling, paused
  follow after user scroll-up, no focus steal when report controls mount,
  report portal/focus trap, pending-dismissal protection, zero-control focus,
  announced simulated 503 failure, and restored opener. The streaming baseline
  was taken **after** Playwright scrolled to and clicked Send, before the first
  response chunk: document scroll stayed at 737px before/after streaming. The
  pre-click value of 382px is automation's action scroll, not a stream jump.
  Evidence: `image-pipeline/raw/review-2026-10-26/route-interaction-qa.json`
  and its viewport screenshots (ignored).
- The interaction harness waits for the lazy sign-in form and each panel's
  intended initial focus before testing Tab. Earlier intermittent failures
  raced tester/feedback's 50ms initial-focus timers or the sign-in chunk mount;
  the corrected latest run is the 90/90 result above. No runtime focus behavior
  was changed to accommodate the test. Representative mobile notification,
  tablet tester and mobile chat-after-report screenshots were visually inspected.
- An earlier full typecheck hit another lane's ignored scratch `.ts` file, not a
  runtime source failure; root was notified to remove/fix it before final checks.
  Final combined typecheck/build/browser results belong to root's audit.

## Integrated checks for root / independent reviewer

1. At mobile/tablet/desktop, open notifications from a scrolled page; verify
   close/read controls are not inert, Tab cycles, Escape restores focus/scroll,
   body overflow remains untouched, and the header remains sticky afterward.
2. Open sign-in, tester invitation and feedback from available controls without
   sending anything; verify focus trap, opener restoration, background skip link
   inert and no horizontal overflow. Preserve a pre-existing inert attribute in
   a controlled check.
3. Mock Ask GSB and `/api/report-ai`: no initial page jump; streaming stays inside
   the log; scrolling up pauses follow mode; reporting opens a portaled dialog,
   traps Tab, keeps pending submission open and returns focus after dismissal.
4. Verify the withheld URL redirects permanently to the existing canonical guide,
   the removed unit is absent from generated HTML/CMI/search/sitemap, and all four
   partial-edit dates are truthful. Check the destination finance hub has no
   missing link.
5. Inspect the largest regional guide directory at all three widths. Compare
   before/after HTML bytes and DOM nodes; every guide title/link must remain
   present in static HTML, with no rendering of hundreds of descriptive cards.
6. Confirm `/contact` uses the unavailable branch in the current local build and
   source-check the configured branch; no actual feedback is submitted.

## Rating discipline and remaining limits

A whole-project 10/10 is an acceptance target, not a number to assign in advance.
Use root's evidence per category (visual hierarchy/readability; image relevance
and composition; navigation/findability; responsive/accessibility; performance;
trust/failure-state honesty). A strong public-template result does not prove
private-account CRUD/PDF flows, real OTP/OAuth delivery, production CWV/INP,
Safari/iOS VoiceOver, all content facts or a user study. These scopes must stay
explicit in the final scorecard. No claim of an automatic perfect score is made.

All work is local-only. No commit, push, deployment, external message, account
creation, feedback report or tester invitation was performed by this lane.

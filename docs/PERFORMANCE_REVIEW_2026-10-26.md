# Performance and technical accessibility review — 26 October 2026

## Scope and method

This review belongs only to the selected GlobalStudyBoard root repository. No
commit, push, deployment, account mutation or external message was performed.

The baseline artifact inventory covers **3,404 generated HTML documents** and
all route families present in that build: home, universities, exams, guides,
destination hubs, destination categories, tracks, topics, scholarships,
sources, search, public tools/report shells, account/admin/login shells and
legal/contact/reference pages. This is an artifact/architecture inventory,
not a claim that a person visually inspected every document or authenticated
state. Complementary route and image reviews cover the wider design scope.

Browser diagnostics use production `next start` on localhost, headless Chrome,
a fresh browser context for every case, DPR 1, and widths **1440, 1024, 768,
375 and 320 pixels** at a 1000px viewport height. Ten routes were measured at
each width, giving **50 before and 50 intermediate-after cases**. Font and
image loading settled before a further 500ms observation period. External
ads/analytics requests were blocked, so these are **first-party local
engineering diagnostics**, not mobile network simulations, Lighthouse scores,
production percentiles or field Core Web Vitals. HTTP bodies and DOM sizes are
measurements; gzip values explicitly marked as estimates are calculated rather
than claimed as the origin's transfer encoding.

Google's current [Web Vitals guidance](https://web.dev/articles/vitals) assesses
LCP, INP and CLS at the 75th percentile for real page loads, separately for
mobile and desktop. A short localhost run cannot certify that result. The
available GSC Wizard CrUX reads were refused because the connected account has
no active subscription; no field data was obtained or account setting changed.
No Lighthouse/axe package was installed by this lane. Parent integration QA
records its own automated accessibility coverage separately.

## Baseline findings

- The home image occupied **416×235px** at 1440px, beginning at **y=691px**. At
  1024px it began at y=883px; at 320px it was only **238×135px**, at y=1054px.
  The source's fixed 26rem side column and vertical centering explained the
  screenshot better than low source resolution did.
- College, exam and destination hero containers rendered at **896px**, while
  their responsive `sizes` hint advertised 768px. This understated the slot;
  actual source files remained correctly encoded but browser selection was
  working from the wrong layout description.
- Every image stayed a static AVIF/WebP asset with a fallback, real dimensions,
  source credits or illustration disclosure and one eager priority hero. The
  source library did not need wholesale regeneration or larger originals to
  improve layout prominence.
- `/search` serialized the complete CMI as a client prop: **5,603,746 bytes of
  HTML**, about **1,292,789 bytes as a gzip estimate**. Its `router.replace` on
  each pause in typing also made query-only edits request a new server payload.
- Search's small Suspense placeholder was replaced by a much taller utility
  and results. Its observed local CLS was **0.556–0.592**, unlike the other
  sampled content templates, which were mostly 0–0.00175.
- Long destination guide listings produced excessive documents: East/Southeast
  Asia was **2,082,119 bytes** with **6,385 live DOM elements** at 1440px; India
  was 1,799,810 bytes. The global sources directory was 1,093,024 bytes and
  4,664 live elements. These need deliberate directory design rather than
  adding decorative images to every card.
- Repeated navigation had no skip-to-main bypass in the baseline. The parent
  implementation now provides the landmark and skip link. The mobile search
  submit control also lacked an accessible name when its text was hidden.

## Search changes implemented in this lane

The public `/search` remains a static, noindex shell with its canonical URL.
The full index is no longer a serialized page prop or client import. Nine
static `/search/catalogue/<destination>` JSON responses provide only the
selected destination's compact data after the preference provider is ready.
Guide and exam scope comes from `resolveDisplayRegions`, including declared
`regions[]`, instead of silently accepting only a unit's primary home.

The original page/section matching and resolved section anchors are retained.
The client has bounded initial results, counts all matches before applying
that bound, and offers **Show more results**. It handles network failure and
malformed data through a retry card; stale requests abort, remembered data is
reused per destination and an old destination cannot flash as the new result.
The public JSON request omits credentials and its referrer. It contains no
search query, and HTTP responses revalidate rather than cache unchanged paths
immutably.

Typing updates browser history through Next's supported native-history
integration, avoiding a server query request for every edit. Back/Forward
restores the draft. Explicit submission still resolves short acronyms such as
SAT. The search button has an accessible name at mobile sizes, result metadata
is more readable and discretionary bulk result-link prefetching is disabled.

Header searches carry a validated provisional destination in the existing
noindex query flow. A visitor searching from an abroad page therefore keeps
that page's destination instead of reverting silently to India. A remembered
choice still wins. This creates no cookie and no second preference control.
The subsequent Ask GSB link carries both the question and destination in its
fragment; the shared helper retains question-only, destination-only and bare
forms. The chat's corresponding provisional context is implemented by the UX
lane, with mocked API tests described below.

Both the search shell and real-query result area reserve viewport-relative
space. A specific follow-up LayoutShift trace identified the remaining
intermediate CLS as the Ask GSB fallback card moving away when results loaded;
the result-area reservation addresses that source rather than hiding content.

## Measured intermediate result

These production measurements include the main image/layout and directory
changes but precede the final small search CLS/Ask-handoff follow-up build.

| Route / measure at 1440px | Before | Intermediate after |
|---|---:|---:|
| Home image rendered dimensions | 416×235px | 567×425px |
| Home image starts at | y=691px | y=319px |
| College hero width | 896px | 1088px |
| Guide hero width | 768px | 960px |
| Destination / topic hero width | 896 / 768px | 1152 / 1152px |
| Search HTML body | 5,603,746 B | 82,861 B (**98.5% smaller**) |
| Search live DOM | 2,741 elements | 552 elements |
| East/Southeast Asia guide directory HTML | 2,082,119 B | 708,797 B |
| That directory's live DOM | 6,385 elements | 1,673 elements |
| Sources directory HTML | 1,093,024 B | 1,093,915 B |
| Search local CLS | 0.5790 | 0.0508 |

Across all widths the intermediate search CLS fell to **0.0508–0.1125**; the
320px case motivated the focused final fix above. Other sampled template CLS
values stayed near their small baseline values. Larger hero rendering reuses
the optimized library. A browser may choose a larger existing rendition where
the enlarged slot needs it; this is an intentional per-view quality tradeoff,
not a claim that every visitor downloads identical image bytes as before.

The selected-destination JSON bodies are **404,056–1,068,350 bytes raw**, with
**91,332–253,397 byte gzip estimates**. All nine returned HTTP 200 and the
expected revalidation header. Raw data is larger than a tiny search service,
but it is static, requested only by the search utility, scoped to one
destination and reused while queries change. It does not enter the global
layout bundle or repeat in the page HTML on every query.

## Integration evidence and remaining limits

Initial isolated browser exercise passed **8/8 cases**: destination hint,
remembered choice precedence without an India fetch, short explicit query,
network-free typing, mounted Back/Forward draft restoration, truthful 37-match
count with 30 initially visible and Show more, HTTP/malformed-response recovery,
a real resolved guide-section DOM anchor, and header-to-search context. The
count combines the short-query and network assertion in one case. These use
local isolated contexts and response mocks; no external service or private
account was written.

Final follow-up evidence is appended below after the combined build. Runtime
recordings under `image-pipeline/raw/review-2026-10-26-performance/` are ignored
working artifacts; this report is the reviewable hand-off.

A universal **10/10 production performance claim is not established**. Real-user
LCP/INP/CLS, actual ad-chain behavior on production networks, low-end hardware
and authenticated tool/report interactions require their own measurements.
The sources directory also remains intentionally large; its rare reference
use does not make its DOM cost disappear. Larger source image files, global
catalogue imports or extra third-party scripts would make these tradeoffs
worse and were not introduced for this change.


## Final combined-build follow-up

The latest root production build passed and was restarted on port5000 before
this final exercise. The artifact snapshot now contains **3402 HTML files**;
two policy-withheld guide units explain the lower total than the baseline.
The final search HTML is **82,861 bytes**
(16,439 bytes as a gzip estimate).

All **10/10 final search/Ask interaction cases passed**, with zero
failures. The two additional cases click the real question+destination handoff
and intercept only the local Ask API: the unremembered USA path sends region
`usa`; a paired USA hint with a remembered Canada choice sends `canada`.
Both preserve the intended preference behavior without an unrequested cookie
write or real external model call. The earlier eight search cases passed again
on this final source build.

The focused result-area reservation resolved the traced fallback-card shift.
Final local query-load CLS is **0.000000–0.001747** across all five widths,
compared with 0.556–0.592 before. Empty-search CLS is
**0.002879–0.006656**. All ten final search views have no horizontal overflow.
These remain bounded, first-party localhost observations; they do not establish
a production percentile or INP result.

Evidence: `search-interactions.json`, `search-cls-final.json`,
`baseline-browser.json`, `after-browser.json`, `baseline-static.json`
and `after-catalogues.json` in the ignored review working directory.
Targeted search/Ask-helper lint and the full TypeScript check passed after the
last owned edits; the parent owns the final whole-repository release gates and
separate independent sign-off. **Completed and verified local-only.**

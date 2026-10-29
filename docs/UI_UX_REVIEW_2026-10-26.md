# GlobalStudyBoard image, UI and performance review — 26 October 2026

Status: local implementation verified; separate independent QA passed for the reviewed scope. No commit, push or deployment is included. The final evidence and independent decision are recorded below and in the linked lane reports.

## Request and acceptance plan

The owner requested prominent, relevant, focused images; a preference for reusable photographs with generated illustrations as fallback; very small image downloads; a whole-project UI/UX review; and an honest rating. The plan and implementation cover the shared design system and every public route family, rather than a handful of selected pages.

| Workstream | Acceptance criterion | Result |
| --- | --- | --- |
| Image inventory and rights | Inspect every active asset; preserve individual verified rights and exact-institution safeguards | All 89 assets reviewed; eight credited CC0 photographs and 81 disclosed computer-generated illustrations. No new image bytes or licenses introduced in this pass. |
| Relevance | Academic media for university/destination pages; subject or practical-step imagery for guides/topics/tests | All 3,260 current image placements enumerated; 36 targeted semantic cases, 130 profile safeguards, nine destination checks and 53 exam checks pass. |
| Composition | Larger media without widening reading columns or indiscriminate cropping | Wider detail images; home image aligned with the headline; focused 4:3 desktop home crop. Other images retain reviewed 16:9 framing. |
| Disclosure | Accurate mixed-source wording, visible photo credits, understandable illustration labels | Policy says “Some images are computer-generated illustrations”; neutral `/disclaimer#images` link and old anchor remain available. |
| Findability and readability | All destinations remain peers; useful headings, readable cards, navigable long directories | Larger listing descriptions, compact track-grouped guide directories, real featured-profile links, clearer home actions. |
| Performance | Avoid library growth; address measured large payloads and layout movement | Search stops serializing the whole content index; regional guide directories lose repeated bulky cards; existing responsive AVIF/WebP images reused. |
| Accessibility and interactions | Keyboard bypass, named controls/landmarks, functional dialogs, contained chat scrolling, mobile width safety | Shared fixes implemented; automated and interaction results recorded below. |
| Content/trust | No invented facts or verification dates; preserve mandatory disclaimer and security headers | Unsupported home ranking/fee/work-right snippets removed. Two policy-incompatible existing guides withheld; targeted prohibited text removed. Original factual verification dates retained. |
| Whole-project coverage | Inspect route families, all nine destinations and responsive generated output; state private/live gaps | Full generated-page/static and responsive sweeps, representative hydrated checks, independent review. No claim that every sentence or private backend has been certified. |

## Implemented experience

The home feature now gives text and image equal desktop columns, places the image at the start of the feature, and uses a focused 4:3 frame at large widths. On phones the order is introduction, image, actions. A shorter global headline and useful destination links replace dense above-image fact cards. The university mentioned as featured links to its actual profile.

Guide media grows from 768px to 960px on large screens; university and exam media from 896px to 1088px; destination and topic media reaches 1152px. The image appears near the page title, before long explanatory copy. Prose stays in the narrower reading column. Responsive `sizes` hints describe those real slots; intrinsic dimensions and source-width descriptors remain accurate.

The home avenue image is intentionally cropped to retain its path and academic setting. A universal ultrawide crop was rejected after reviewing the library: it would cut microscope subjects, equipment, caps and institutional facades. Cropping is used where it improves the subject, not merely to force every asset into the same shape.

Listing card descriptions use 16px text and semantic titles. Large regional guide directories group their complete crawlable link set by the existing tracks, with jump navigation. On phones the quick tool links occupy a single horizontally scrollable row. Every tool remains reachable; the page itself does not scroll sideways.

Search loads a compact public catalogue only for the effective destination, with the remembered preference taking precedence over a provisional URL hint. It preserves section anchors, counts every match before limiting rendered rows, offers more results, retries failed/malformed responses, and updates query history without fetching a server page on each typing pause. Search → Ask GSB carries both question and destination without creating a preference cookie.

A skip link reaches the main landmark. Shared dialogs preserve prior inert state, keep their own controls operable, contain keyboard focus, use the existing reference-counted fixed-body scroll lock, and restore focus/scroll after closing. Reporting a response portals outside inert content and cannot be dismissed during an outstanding submission. Chat follows new messages only when the reader is near the bottom; streaming does not pull the document to the conversation. The contact page honestly offers email when the feedback backend is unconfigured. All four tools now present their gate or working interface immediately after a short existing tagline; their complete descriptions and larger feature-card text follow below, so students reach the tool before a long introduction.

## Measured changes

These are production-build localhost engineering comparisons with external services blocked, not field Core Web Vitals or a low-end-device benchmark.

| Measure | Before | After |
| --- | ---: | ---: |
| Home image at 1440px | 416 × 235px, starts y=691px | 567 × 425px, starts y=319px |
| Home image at 375px | 293 × 166px, starts about y=911px | 341 × 192px, starts about y=586px |
| Search HTML | 5,603,746 bytes | About 83,000 bytes, 98.5% smaller |
| Largest regional guide directory HTML | 2,082,119 bytes | About 709,000 bytes, 66% smaller |
| That directory's hydrated DOM | 6,385 elements | About 1,673 elements, 74% fewer |
| Image asset library | 11,497,422 bytes | Unchanged |
| Shared first-load JavaScript | About 103KB | About 103KB |

A larger displayed slot can select a larger existing image rendition. This is the intended quality/per-view-download tradeoff; unchanged repository bytes do not mean identical image transfer for every visitor. Only one hero gets eager/high priority, and secondary images remain lazy. No new runtime dependency was added.

Search still downloads a destination JSON file (roughly 404KB–1.07MB raw before compression), and the sources/topics directories remain relatively large. The final focused query-load CLS is 0–0.001747 across five widths (empty search: 0.002879–0.006656); the diagnostic details are in the performance report. Production user timing remains unmeasured.

## Verification evidence

Final broad route outcomes and the additional four-tool hierarchy checks are recorded below. Evidence is stored under ignored `image-pipeline/raw/ui-review-2026-10-26/`, `image-pipeline/raw/review-2026-10-26/` and `image-pipeline/raw/review-2026-10-26-performance/`.

- Production build: passed after the final source fixes, including the image/tool prebuild guards.
- Lint, TypeScript, CMI and strict duplication gates: passed; CMI contains 2,891 units / 2,699 guides. The final lint rerun contains no warnings.
- Image placement/institution/semantic integrity: 3,488 assertions passed, including both independent-review counterexamples.
- Whole-output static scan: 3,402 generated HTML documents, zero missing required page elements/images and zero unresolved internal links. Two report redirect shells are treated as redirects, rather than ordinary documents.
- Whole-route responsive SSR/CSS scan: 3,400 UI routes × 1440, 768 and 375px = 10,200 checks, zero failures. The expected generated 404 is handled explicitly; the manifest is not counted as a UI page. Separate representative tests include 1024 and 320px. The subsequent four-tool markup change independently passes 12 additional cases at 320, 768 and 1440px, including axe.
- Automated accessibility: 68 route/viewport cases passed with zero automated violations; the four updated tool pages also pass eight additional desktop/phone axe cases. [axe-core](https://github.com/dequelabs/axe-core) covers only automated checks and does not certify complete WCAG conformance.
- Search/Ask: ten interaction cases passed; the separate paired-destination suite passes 12 cases. Independent review passes 28 route/region/interaction cases across all nine destinations. Dialog/chat keyboard and mocked streaming/report interactions pass 90 cases; the shared helper fixture passes 12 cases.
- Private tool UI: all four empty-data interfaces at desktop/phone pass hydration and width checks using an isolated fake session + intercepted read responses; no real account or database operations. The updated hierarchy passes the same eight-case rerun. This inspects presentation, not authentication, RLS or CRUD.

## Honest rating and remaining acceptance gaps

**Reviewed UI/UX: provisional independent rating 8.5/10. Whole-project 10/10 is not established.** This is an editorial assessment of the tested scope, not an external award or benchmark. The route-family coverage is broad, but it is not evidence that every guide sentence, every private state and every real device has been manually validated.

| Dimension | Score out of ten | Evidence and limit |
| --- | ---: | --- |
| Navigation and findability | 9 | Search, section links and regional context verified. |
| Readability and hierarchy | 9 | Larger cards, balanced imagery, focused tool entry; no student usability study. |
| Image quality and focus | 9 | All assets inspected; larger display uses the optimized derivatives. |
| Semantic relevance | 9 | Improved matching, institution guards and targeted counterexamples; allocation checks are not manual factual review of each page. |
| Responsive behavior | 9 | Every public UI route checked at three widths, representative narrow/large checks. |
| Accessibility | 8 | Automated and keyboard coverage; real assistive technology and Safari/iOS remain untested. |
| Performance | 8 | Major measured payload/CLS improvements; field p75/INP and low-end networks remain unmeasured. |
| Regional parity | 9 | All nine destinations checked as peers. |
| Trust and disclosure | 9 | Accurate image credits, illustration labels, disclaimer, availability and update dates. |
| End-to-end workflow evidence | 6 | Public interactions and mocked private presentation checked; actual authentication/CRUD/report workflows remain unverified. |

These ten reviewer judgments average 8.5/10. The independent report contains its own evidence and scope; this is not a field-performance, legal or private-backend certification.

To substantiate a whole-project 10/10 claim, the remaining acceptance work is real OTP/OAuth delivery; signed-in saving/planning/comparison/score CRUD; account export/deletion and real PDFs; actual assistive-technology/mobile-browser sessions; production field performance; and student task-based usability testing. The site's complete admissions/fees/visa/ranking catalogue also needs its own ongoing factual verification; this visual review never resets those verification dates.

The feedback service is locally unconfigured and the UI reflects that. Field-performance retrieval through the connected tool was unavailable. These are explicit limits, not silent passes. Deployment has not been requested in this turn; all changes stay local-only. When a deployment is authorized, `SITE_LASTMOD` must be set to the actual deployment date in that release; no deployment date is fabricated here.

## Supporting reviews

- [Every-asset relevance review](IMAGE_RELEVANCE_2026-10-26.md)
- [Route, readability, interaction and policy review](UI_UX_REVIEW_2026-10-26-route-audit.md)
- [Search and performance measurements](PERFORMANCE_REVIEW_2026-10-26.md)
- [Separate independent QA decision](UI_UX_INDEPENDENT_QA_2026-10-26.md)

# Independent UI, image and performance review — 26 October 2026

Status: **PASS for the reviewed local UI, image-routing, disclosure and performance-delivery scope**. This document is not a deployment approval or a claim of a perfect whole-product rating.

## Scope and method

The reviewer is separate from the authors of the shared image, home page, search and route/dialog changes. Review is confined to the root GlobalStudyBoard repository on `main`; no commit, push, deployment, account creation or external message is part of this pass.

The owner asks for larger, focused and relevant images throughout the product, high visual quality with small downloads, an improved overall interface, and an honest assessment of the whole project. The review therefore covers shared chrome and media, every public route family, all nine destination contexts, legal/editorial pages, search and Ask GSB, the signed-out account and tool surfaces, and the report redirect shells. It is broader than a home-page screenshot review.

The reviewer read `AGENTS.md`, the content constitution and independent QA checklist, reviewed the working diff, inspected all six current image contact sheets, checked the shared policy and provenance records, and examined the authors' raw static, responsive, accessibility, performance and interaction evidence. A separate browser recheck is recorded below when the final build is available.

## Image and public-copy assessment

- The existing 89-asset library contains eight credited CC0 photographs and 81 disclosed computer-generated illustrations. The change introduces no image assets or new source/license records. Encoded image and provenance files remain byte-for-byte unchanged from the reviewed baseline.
- All nine destinations use the same media treatment. Real photographs on university profiles remain restricted to the exact verified institution; generic illustrations explicitly say they do not depict the institution.
- Wider guide/profile/topic/region media does not widen the prose reading measure. Only the home feature changes its desktop frame to 4:3; its focal crop retains the subject. Other media keeps its existing 16:9 framing. AVIF/WebP sources, actual pixel width descriptors, priority for a single hero, explicit intrinsic dimensions and lazy loading for secondary media are retained.
- The policy already accurately describes photographs and computer-generated illustrations. It avoids the false claim that all images are generated, and does not claim that the whole site or unrelated third-party rights are copyright-free. The source, creator and CC0 credit remain visible under photographs.
- Home interface copy now directs readers to profiles, guides and official sources without adding unsupported universal fee, work-rights or ranking promises. Listing descriptions are larger and more readable. The protected global disclaimer wording is unchanged.

## Independent findings and disposition

| Finding | Required disposition |
| --- | --- |
| Search to Ask GSB dropped a provisional destination whenever a question was present. | **Corrected and independently browser-tested:** the fragment preserves both `q` and `region`; the chat receives the question and USA context; only the USA catalogue is fetched and no destination cookie is written. |
| The game-development guide matched generic media before its computing subject; the mental-health support guide matched generic wellbeing/dormitory before its support subject. | **Source corrected and independently executed:** the exact game-development guide resolves to the computer laboratory; the exact mental-health/wellbeing support guide resolves to the psychology study room. A first attempted mental-health exception sat after the practical-step return; the final narrow exception now runs inside `stepFor()` before generic wellbeing matching. |
| Existing religious-finance unit and remaining religious-subject promotional text exceeded the constitution's narrow official-name/affiliation exception. | **Source corrected:** finance unit withheld; three profile course-list entries and the retained Gulf-law/UK-humanities subject text removed; references and topic keyword removed. No new factual claim was added. |
| A faith-specific food guide explains dietary practice and certification outside that same narrow exception. | **Source corrected:** unit withheld; hub/related references and keywords removed. Its old path redirects to the existing Southeast Asia student-life guide; that destination's own title continues to state its narrower geographic scope. |
| Automated accessibility checks found unnamed context landmarks, visible-label/accessibility-name mismatches on profile actions, an admin heading-order problem and Ask subtitle contrast. | **Corrected:** the 68-case rerun reports zero violations. The final tool-only markup change also passes the author's eight axe cases and the reviewer's 12 responsive/axe cases. |
| Responsive crawl found real horizontal overflow in the score tracker at 375px. | **Corrected:** the final 3,400-route, three-width CSS sweep reports zero failures; independent phone tool checks also have no overflow. Infrastructure manifest responses and the special generated not-found path are excluded from ordinary UI route totals. |
| Long tool descriptions and stacked small feature cards pushed the actual tool far down phone screens. | **Corrected and independently tested:** all four gates now follow a short existing tagline. Full descriptions remain below the gate; feature headings and descriptions render at 16px. Twelve final-build cases at 320, 768 and 1,440px verify the order, preserved description, footer, canonical, accessibility and lack of overflow. |

The notification-to-sign-in/tester transitions close the first panel before opening the next. The potential nested keyboard-listener concern is therefore not a confirmed issue in those flows. The ref-counted inert/scroll helper preserves pre-existing inert state, excludes the active dialog and its semantic header, and restores focus/scroll after close.

## Evidence and limits

The final static audit covers **3,402 generated HTML documents**, with zero reported static failures and zero unresolved internal links. The broad responsive run covers **3,400 UI routes × three widths = 10,200 CSS checks**, with zero failures. That crawl disables JavaScript to cover every generated route's HTML/CSS; it does not represent 10,200 independent interactive user journeys. The last four tool-page hierarchy changes receive the targeted final-build checks below.

The 68-case axe run covers 34 representative route families at desktop and phone widths and reports zero violations. It is an automated accessibility check, not a certification of all WCAG criteria or a substitute for assistive-technology testing. The reviewer inspected its contrast-incomplete nodes: decorative separator dots account for the short-text warnings; Princeton's photo credit is visibly unobscured on the solid cream background, with a calculated 7.21:1 text contrast. The final 12 independent tool cases also run axe and report zero violations. The dialog fixture separately exercises focus wrapping, inert backgrounds, scroll locking, nested reference counts and restoration. Local Chromium performance evidence blocks external services and is useful for comparing layout/image timing and transfer sizes; it is not a production field Core Web Vitals result.

The authors additionally exercise eight mocked signed-in empty-tool cases and the UI interaction suite. These are useful interface checks, and do not exercise real private CRUD, OTP/OAuth delivery, Supabase/RLS behavior, deletion/export or generated private reports/PDFs. Production third-party backends, production field performance, real screen-reader testing and student usability studies have not been independently exercised in this UI pass. Existing admissions, visa, fee, ranking and deadline facts across the catalogue have not been fully reverified. An honest rating cannot certify the whole project as 10/10 from the available evidence.

## Provisional rating

**8.5/10**, using ten equally weighted dimensions below. These numbers are the independent reviewer's engineering judgments on the available evidence, not a statistical measurement, legal certification or production/backend score. The scope considers every route family and all destinations; the evidence limits above prevent a whole-product perfect score.

| Dimension | Score / 10 | Basis and remaining limit |
| --- | --- | --- |
| Navigation and information architecture | 9 | Shared search/tools access and compact destination directories; no student usability study. |
| Readability and hierarchy | 9 | Larger body/card text, wider media with restrained prose measure, earlier tool gates. |
| Image quality and focal presentation | 9 | All 89 assets visually reviewed; focused larger frames and existing optimized encodings. |
| Image relevance and identity | 9 | Semantic routing corrected, exact-institution photograph restriction retained; heuristic routing cannot replace editorial review of every future unit. |
| Responsive layout | 9 | Complete generated-route CSS sweep plus hydrated checks at phone, tablet and desktop widths; Chromium coverage only. |
| Accessibility | 8 | Automated, focus, inert, keyboard and manual contrast checks pass; real assistive-technology testing remains. |
| Performance delivery | 8 | No image-byte growth, deferred destination search, improved local layout stability; production field data remains. |
| Destination parity | 9 | All nine home contexts and region hubs checked; shared controls use the same treatment. |
| Trust, disclosure and continuity | 9 | Honest mixed-source policy, retained credits/disclaimer, truthful dates and removed prohibited units; catalogue facts not fully reverified. |
| End-to-end workflow evidence | 6 | Signed-out flows and mocked empty-tool states covered; real private data/auth/report workflows remain unverified. |

## Jurisdictions and data handling

Shared UI and disclosure changes apply equally to India, the United States, the UK and Ireland, Canada, Europe, Australia and New Zealand, East and Southeast Asia, the Middle East, and Russia and the CIS, with worldwide audiences. No new destination, image rights grant, tracker, personal or education record, financial/immigration advice or university endorsement is introduced. The existing eight-photo source review is carried forward unchanged; this pass does not purport to repeat legal review of each country's laws or every catalogue fact.

The search projection is destination-specific public content. Its browser fetch omits credentials and referrer information; no private user data or session is read by the static route. The shared server-rendered media component keeps the registry off the client bundle. The `next.config.js` security-header/CSP block is unchanged.

## Final verification

`git diff --check` passes. The image asset/provenance files and the security-header/CSP block are unchanged. Source inspection and rebuilt-browser checks confirm the Search → Ask GSB destination, accessibility, score-table containing-block and tool-hierarchy corrections.

An independent object-level comparison of the baseline and current TypeScript exports is saved as `image-pipeline/raw/ui-review-2026-10-26/independent-source.json`. It confirms exactly two removed guides (2,701 → 2,699), no added guide, seven retained guides with only the intended body/FAQ or related-link changes plus `contentUpdated: '2026-10-26'`, and unchanged original `lastVerified` values on every retained guide. Exactly three college course arrays and two topic guide/keyword arrays changed. This verifies the scope of the removals rather than certifying the untouched catalogue facts.

The independent rebuilt-browser pass reports **28/28 checks passed** in `image-pipeline/raw/ui-review-2026-10-26/independent-browser.json`: nine home contexts at desktop width (with the selected destination link asserted), nine region hubs at phone width, four detail templates at tablet width, four tool/search/Ask shells at 320px, a locally mocked Search → Ask GSB flow and notification focus/inert restoration. It confirms a single H1/main, working skip target, decoded images, the protected footer, no horizontal overflow/hreflang and no page errors. Home media measures 567 × 425.25px at 1,440px, with the intended 40% horizontal focus.

After the final four tool-page changes, the additional independent pass reports **12/12 checks passed** in `image-pipeline/raw/ui-review-2026-10-26/independent-tools.json`. All four tools at 320, 768 and 1,440px retain their full descriptions and correct canonical URLs, render readable 16px features, put the gate before the feature section, and have no axe violation, horizontal overflow or page error. The score-tracker gate begins at 577px at 320px width, rather than following the long description and feature stack. The screenshot was independently inspected. Initial test-harness issues (ambiguous submit selector and an incorrect non-www canonical expectation) were corrected; no product change was needed for those test issues.

The source findings above are resolved. Final lint (zero warnings), typecheck, image/tool integrity checks, CMI validation (zero errors), strict duplicate gate and production build pass. The duplicate check retains its documented nonblocking similarity backlog; this pass does not claim that backlog is resolved. Independent PASS is recorded in the content audit log for this reviewed scope. Local-only throughout; no commit, push or deployment.

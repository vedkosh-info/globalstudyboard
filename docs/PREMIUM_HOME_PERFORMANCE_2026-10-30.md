# Premium home performance and responsive review — 30 October 2026

Status: matched baseline captured; final redesign measurements pending. This report is local-only and is not deployment approval.

## Scope

This review is confined to the GlobalStudyBoard repository. TasteYatra is a supplied screenshot reference; no TasteYatra source, asset or production target is accessed. The parent task redesigns the home page and its affected shared composition. This lane owns measurement scripts and this report, with no runtime implementation changes.

The intended acceptance criteria are a more prominent home image, clear first-screen hierarchy at desktop/tablet/phone widths, one top search input, destination continuity for all nine peers, stable layout, and no avoidable image-library or JavaScript growth. Content facts, real account workflows, third-party services, live field performance and a whole-site 10/10 certification are outside these local engineering measurements.

## Method

The paired harness uses production `next start` at port 5000, Chromium, fresh browser contexts, DPR 1, 1000px viewport height and widths 1440, 1024, 768, 390, 375 and 320px. Each destination is selected in its existing first-party preference cookie. There are 54 region/width combinations per build. The harness waits for the real header destination, fonts and the hero to settle, then observes for another 600ms. External services are blocked; there are no real sign-ins or messages.

The metrics include rendered image and heading geometry; actual selected image bytes; image preload/sizes agreement; initial HTML bytes and a separate gzip estimate; resource timing; DOM size; one H1 and main; the protected disclaimer; skip target; one search form; decoded image; page errors and horizontal overflow. LCP and non-input layout-shift sums are bounded localhost diagnostics, not production percentiles, INP, Lighthouse scores or low-end/network simulations. A single sample is insufficient to establish a speed ranking.

## Asset baseline

The pre-change image library is **11,497,422 bytes**. The existing home image already has a 1400×788 primary and 560×315 thumbnail:

| Format | Hero bytes | Thumbnail bytes |
| --- | ---: | ---: |
| AVIF | 77,157 | 18,705 |
| WebP | 138,310 | 30,722 |

A full-width home frame can therefore reuse the 77KB primary AVIF rather than introducing another image. Correct responsive `sizes` and matching preload are essential: the old feature hint describes a 567px desktop side column and must change with the slot. A wider displayed slot can intentionally select the larger existing rendition; unchanged repository bytes do not imply identical transfer for every viewport.

Hash/size inventory and the browser harness are saved under ignored `image-pipeline/raw/premium-home-2026-10-30/`. Source/creator/license records and illustration disclosure must remain attached to the existing server-rendered media component. Nothing in this lane changes those records or makes a new copyright claim.

## Matched baseline

Production build `I6H1XpNmzlWr4LIZ22fxk` was created from unchanged `af82c71` before implementation. **54/54 cases passed** the structural/responsive assertions, across all nine destinations and six widths. The response is 262,140 bytes (42,315-byte gzip estimate) in every destination context, confirming this presentation keeps one static home document.

| Width | Hero displayed size | Hero starts at | Selected AVIF |
| --- | --- | ---: | ---: |
| 1440px | 567 × 425px | y=319px | 77,157 B |
| 1024px | 439 × 329px | y=319px | 18,705 B |
| 768px | 670 × 377px | y=673px | 77,157 B |
| 390px | 356 × 200px | y=586px | 18,705 B |
| 375px | 341 × 192px | y=586px | 18,705 B |
| 320px | 286 × 161px | y=693px | 18,705 B |

The baseline has one H1/main/search form and the protected footer/skip link, with no page errors or horizontal overflow in all cases. DOM size varies from 1,099 to 1,158 elements as destination content changes. The maximum observed non-input layout-shift sum is 0.03997; most cases are zero. LCP was not observed in every case (raw zero means no observer entry, not a zero-millisecond paint), so this report will not use those missing samples to award a speed score.

The baseline home route manifest references 406,312 raw bytes of chunks; that excludes layout-manifest references and is **not** a First Load JavaScript figure. The representative 1440px browser case actually loads 524,059 encoded JavaScript bytes locally, including layout/shared chunks. These two measures must not be interchanged. Actual production compression and third-party loading can differ.

## Final comparison

Pending redesign production capture. No historical release metric is represented as a current matched measurement.

## Limits and handoff

The first check found no server on port 5000 and no `.next/BUILD_ID`; the parent created the unchanged-source baseline before editing. That matched baseline was fully captured before the server was released for the redesign build. This lane does not start or rebuild competing servers. Runtime code, content facts, security headers, dependencies and deployment remain owned by the parent implementation/review workflow.

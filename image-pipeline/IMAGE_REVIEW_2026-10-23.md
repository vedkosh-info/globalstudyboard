# Image review and implementation plan — 23 October 2026

## Scope and baseline

Selected repository: GlobalStudyBoard root only. No commit, push or deployment is
authorized in this turn. Legacy worktrees are untouched.

The manifest contains 100 original concepts: 93 active images (372 optimized
files, **11,599,140 bytes / 11.06 MiB**) and seven retired concepts with no
published files. The library illustrates 3,262 hero slots through shared
resolvers: home, nine destination hubs, 130 university profiles, 53 exams, 368
topics and 2,701 guides. Brand/app icons and code-rendered social cards have a
different purpose and retain the project identity.

## Selection rules

The owner's current instruction supersedes the September AI-only decision.
Prefer excellent, relevant **CC0/public-domain photography**, checked at the
individual source file. A search result saying “free” is insufficient. Exclude
uncertain rights, attribution/share-alike licenses for this batch, identifiable
people, personal records, prominent marks, religious/political content and poor
subject matches. A real campus must not masquerade as another institution.
Retain the existing reviewed AI image when no better eligible photo is found.
No new AI generation is necessary merely because an open photo is unavailable.

CC0 permits commercial reuse and modifications, but does not waive privacy,
trademark or other third-party rights. See the
[CC0 deed](https://creativecommons.org/publicdomain/zero/1.0/) and
[Commons reuse guidance](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia).
Keep source, author, license, evidence, review date, subject and crop records.

## Execution and acceptance

1. **Inventory and visual review:** inspect all 93 active compositions, their
   existing captions, subject mapping and byte sizes; record the seven retired
   concepts and unused assets. Review sources for all nine peer destinations
   and shared fields, exams and student-journey concepts.
2. **Candidate selection:** compare photographed subject, composition and safe
   crop with the existing illustration. Reject unclear licenses and weak matches.
   Keep accurate AI fallbacks and the named-university honesty guard.
3. **Preparation:** crop to purposeful 16:9 without distortion; preserve useful
   subject detail, avoid upscaling, strip metadata. Encode AVIF + WebP, hero +
   thumbnail. Aim for 45/85 KiB heroes and 14/24 KiB thumbnails; enforce ceilings
   of 100/180 KiB and 30/45 KiB. Originals stay ignored locally.
4. **Delivery and provenance:** replacement filenames include a content revision
   hash, because `/images/*` is cached immutable for one year. Extend the
   manifest/registry and validation for mixed sources. Photographs receive
   accessible source/author/license credits; illustrations keep their existing
   disclosure. Update the image-policy section of `/disclaimer` without changing
   the mandatory global disclaimer. No third-party image requests or trackers.
5. **Independent review:** a separate reviewer checks the selected photos,
   crops, licensing evidence, honest use on affected pages, AI fallback,
   privacy/IP/disclosure/accessibility posture across the nine destinations.
   Record sign-off in the content audit log; rejected candidates stay unshipped.
6. **Verification:** image gate, lint, typecheck, CMI, strict duplicate gate and
   full production build. Inspect existing home, region, college, exam, guide,
   topic and disclaimer templates on desktop, tablet and mobile. Measure final
   bytes and list actual replacements, retained images and any outstanding work.

## Initial visual observations

All 93 active assets were inspected in six numbered overview sheets. Most
existing AI still lifes remain calm, compact and relevant; specialist equipment
and architecture benefit most from verified real photographs. Some internal
keys are historical concepts rather than literal subject descriptions (e.g.
`aviation-simulator` now shows an aircraft, `choosing-destination-globe` a window
desk). Captions must describe the actual pixels, never infer from filenames.
Abstract decorative work can remain AI. Four unused decorative assets total
266,590 bytes; retain or retire explicitly rather than add more unused variants.

Detailed source decisions, final per-image dispositions, measurements and
verification results are recorded below as work completes.


## Completed result — local only

- Reviewed all **93 originally active images** and the seven earlier retirement
  records; the full 100-concept disposition is in
  [the per-image inventory](./review-2026-10-23-inventory.json).
- Replaced **eight concepts with individually verified CC0 photographs**. Their
  shared usage improves **92 existing pages**. Five are destination images; three
  are shared microscope, computer-lab and lecture-hall subjects.
- Verified exact campus matches for **Princeton, Manchester and University of
  Amsterdam**; those three profiles use their own real photo. The other 127
  profiles use labelled academic AI scenes. Landscapes, villages, skylines and
  coastlines no longer appear as university-profile fallbacks.
- Retained **81 AI images** where the selected open alternatives did not improve
  the combined relevance, quality, rights and size requirements. No new AI
  generation was needed. Corrected ten pre-existing captions, including missing
  objects and unsupported geographic descriptors.
- Retired four unreachable decorative assets (16 files / 266,590 bytes). The
  final library has **89 active concepts, 356 files, 11,497,422 bytes / 10.96 MiB**,
  compared with 11,599,140 bytes / 11.06 MiB before: **101,718 bytes smaller**.
  Source JPEGs, old derivative backups and QA screenshots stay ignored locally.
  The India dawn atmosphere remains available in the destination pool although
  no current page selects it after the profile relevance correction.
- Kept project/app icons and code-built social cards. Added no dependencies,
  trackers, remote image requests, security-header or CSP changes.

### Accepted photographs

All eight use the [CC0 1.0 dedication](https://creativecommons.org/publicdomain/zero/1.0/).
Every public image has four optimized variants; AVIF heroes are **20.2–99.3 KiB**,
AVIF thumbnails **6.9–18.4 KiB**. Seven heroes are 1400px wide; Ohio is 1280px
because its inspected source is 1280px. No sources are upscaled; personal/EXIF
metadata is stripped. Each precise crop and source SHA-256 is in the manifest.

| Real subject / source | Creator | Hero AVIF | Exact institution binding / use |
|---|---|---:|---|
| [IIT Hyderabad campus, Sangareddy district, Telangana, India.](https://commons.wikimedia.org/wiki/File:IIT_Hyderabad_Campus,_Sanga_Reddy_District,_Telangana.jpg) | Rohitjahnavi | 99.3 KiB | Destination / subject context |
| [Architecture of Holder and Madison Halls at Princeton University, Princeton, New Jersey, United States.](https://commons.wikimedia.org/wiki/File:Architecture_of_Holder_and_Madison_Halls,_Princeton_University,_2007.jpg) | DimiTalen | 80.3 KiB | princeton-university |
| [Boulevard René-Lévesque facade of the Desjardins pavilion at Université Laval, Quebec City, Quebec, Canada.](https://commons.wikimedia.org/wiki/File:University_building_at_Universite_Laval.jpg) | Wilfredor | 53.0 KiB | Destination / subject context |
| [University of Manchester buildings on Oxford Road, Manchester, England, United Kingdom.](https://commons.wikimedia.org/wiki/File:The_University_Of_Manchester_Oxford_Road.jpg) | MichaelDavidBeckwith | 55.9 KiB | university-of-manchester |
| [University buildings at the Roeterseiland campus, Amsterdam, the Netherlands.](https://commons.wikimedia.org/wiki/File:Modern_architecture_of_university_buildings_at_the_campus_Roeterseiland;_free_photo_Amsterdam,_Fons_Heijnsbroek_10-2021.jpg) | Fons Heijnsbroek | 52.8 KiB | university-of-amsterdam |
| [Laboratory microscope](https://commons.wikimedia.org/wiki/File:Biology_microscope.jpg) | J.Doniyorovich | 34.6 KiB | Destination / subject context |
| [ICTC computer laboratory, De La Salle University–Dasmariñas, Philippines](https://commons.wikimedia.org/wiki/File:De_La_Salle_University_%E2%80%93_Dasmari%C3%B1as_(DLSU%E2%80%93D)_Information_and_Communications_Technology_Center_(ICTC)_laboratory_room_203_(ICT203)_%E2%80%94_normal_view.jpg) | UndueMarmot | 20.2 KiB | Destination / subject context |
| [Morton Hall lecture hall, Ohio University, USA](https://commons.wikimedia.org/wiki/File:Ohio_University_Lecture_Hall.jpg) | Garden Sprite | 58.0 KiB | Destination / subject context |

### Destinations where the AI alternative remains preferable

All nine destinations received the same review. Australia/New Zealand retains
AI after official source verification identified a prohibited architectural
motif in the Melbourne candidate. East/Southeast Asia retains AI because the
branch-heavy Tokai photograph exceeded the size budget and offered a weaker
composition. Russia/CIS candidates contained people, flags, political motifs or
poor detail. Middle East candidates had unresolved separate architecture rights
or weaker subjects. The greenhouse and several desk/experiment/lecture photos
were also withheld for size, branding, resolution or uncertain license history.
These are completed selection decisions; no doubtful candidate is in the site.
Full research/rejection records: [regions](./review-2026-10-23-region-candidates.json),
[common subjects](./review-2026-10-23-common-candidates.json).

### Verification and independent review

- Image gate passes **89 assets / eight photos**: exact manifest/registry/disk
  parity, QA status, source/license fields, immutable URLs, binary dimensions,
  16:9 crops and byte ceilings. A stale or oversized asset blocks builds.
- Lint, TypeScript, CMI (zero errors), strict duplicate gate and the **full final
  production build** pass. No new content units or admission facts were authored;
  existing verification dates were not bumped. No merge-home operation is needed
  for replacing a media asset on existing canonical pages.
- Audited **all 3,262 generated image-bearing pages** for their expected image,
  photo/AI disclosure and the exact protected global footer disclaimer: zero
  failures. All 130 college mappings have the correct photo binding or an
  academic AI fallback.
- **63 browser checks** cover 21 existing routes at desktop 1440×1000, tablet
  768×1024 and mobile 375×844: all nine destination hubs, every accepted image,
  real/AI college profiles, home, guides, exam, topic, disclaimer and editorial
  policy. Images load, captions/alt text remain readable, no horizontal overflow
  occurs, and AI badge click/Escape still work. Screenshots were inspected.
- Direct AVIF/WebP requests return 200, correct media types and the existing
  one-year immutable cache header. New photo URLs carry a revision hash;
  preparation refuses to overwrite different bytes at an existing URL.
- Separate source/crop/rights/accessibility/implementation review and sign-off:
  [independent QA report](./review-2026-10-23-independent-qa.md) and
  [content audit log](../.claude/rules/content-audit-log.md). This is an image and
  rendering review, not a fresh verification of every admission fact.

### Pending hand-off

**No implementation work remains after final independent sign-off.** Changes
are local only: no commit, push or production deploy was authorized or performed.
When a later turn explicitly authorizes deployment, inspect/consolidate this
project's active worktrees under the owner's deploy rules, bump SITE_LASTMOD to
that actual deploy date, and run the release build. The three legacy worktrees
listed under a VedKosh-named path were left entirely untouched in this session;
this report makes no claim about their pending changes.

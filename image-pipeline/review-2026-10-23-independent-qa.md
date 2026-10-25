# Independent image QA — 23 October 2026

Auditor: independent Codex review agent, separate from image research, selection,
implementation and encoding. Scope: GlobalStudyBoard root repository only.
Reviewed the Content Constitution and independent QA checklist before reviewing.
This records editorial/technical checks, not a guarantee that every possible
third-party right has been waived. No commit, push or deployment was performed.

## Current result

**PASS for the final image-only change set.** Eight of
the nine initially prepared photographs pass source/crop/artifact review. Melbourne's
source licensing and institution identity pass, but an official university
description identifies cherubs in relief friezes visible in the crop. This new
evidence supersedes the initial visual-only pass under the project's zero
religious-symbol rule. The Melbourne photograph was removed and the original
approved AI restored. Final rendered-page/build evidence is recorded below.

Scope is image subjects, sources, captions, delivery, disclosures, routing and
affected rendering. No admissions facts, fees, rankings, deadlines or visa rules
were authored or fully re-verified in this change set. Existing factual
verification dates were not advanced by this image audit.

## Method and coverage

- Independently opened each selected photograph's individual Commons File page,
  checking its own licensing section, author and subject. This did not use the
  Commons site-wide structured-data CC0 notice as a photograph license.
- For Princeton and Tokai, the web reader could not open the File pages; a
  separate direct HTTPS request succeeded and confirmed own-work CC0 metadata.
- Independently fetched the Melbourne photo's archived original Unsplash page.
  The 5 May 2017 archive shows the same named creator/photo and its 5 August
  2016 publication. Its Commons page retains a pending Unsplash-review category;
  the independent archived publication is the additional timing evidence.
- Inspected all six overview sheets covering the original 93 active images.
  Checked the ten recorded AI-alt corrections against the visible objects;
  removed invented geographical descriptors and corrected budgeting/desk items
  are accurate. A concept later replaced by a photo receives the photo's alt.
- Inspected every final proposed crop, then all nine actual encoded AVIF heroes
  and nine 560px thumbnails. Independently decoded all 36 AVIF/WebP photo files;
  dimensions agree and EXIF, XMP, IPTC and embedded ICC metadata are absent.
- Reviewed `ContentImage`, shared policy text, `/disclaimer`, `/editorial-policy`,
  image resolver, registry generator, preparation script and prebuild validator.
  No blocking implementation issue was found in this pass; final exact-college
  routing was additionally checked across all 130 profiles after the last changes.
  Rendered-page results are recorded below.

## Selected-source findings

| Logical image concept | Actual subject and source | Source/crop result |
|---|---|---|
| `regions/india/campus-quad-golden-hour` | [IIT Hyderabad campus](https://commons.wikimedia.org/wiki/File:IIT_Hyderabad_Campus,_Sanga_Reddy_District,_Telangana.jpg), Rohitjahnavi | PASS — individual own-work CC0; actual aerial campus, daylight and tree cover; no golden-hour claim in alt. |
| `regions/usa/collegiate-brick-autumn` | [Holder and Madison Hall architecture, Princeton](https://commons.wikimedia.org/wiki/File:Architecture_of_Holder_and_Madison_Halls,_Princeton_University,_2007.jpg), DimiTalen | PASS — individual own-work CC0; empty exterior, accurate institution; historical photograph does not claim current conditions. |
| `regions/canada/maple-campus-autumn` | [Desjardins pavilion, Université Laval](https://commons.wikimedia.org/wiki/File:University_building_at_Universite_Laval.jpg), Wilfredor | PASS — individual own-work CC0; snow and building are accurately captioned; traffic/parking signs are incidental. |
| `regions/uk-ireland/honey-stone-quad` | [University of Manchester on Oxford Road](https://commons.wikimedia.org/wiki/File:The_University_Of_Manchester_Oxford_Road.jpg), MichaelDavidBeckwith | PASS — individual own-work CC0; true university name/campus, no identifiable people. University signage is incidental and truthful. |
| `regions/europe/continental-courtyard` | [Roeterseiland university buildings, Amsterdam](https://commons.wikimedia.org/wiki/File:Modern_architecture_of_university_buildings_at_the_campus_Roeterseiland;_free_photo_Amsterdam,_Fons_Heijnsbroek_10-2021.jpg), Fons Heijnsbroek | PASS — individual own-work CC0; explicit crop excludes the occupied bridge, preserving real architecture. |
| `regions/australia-nz/sunny-modern-campus` | [University of Melbourne](https://commons.wikimedia.org/wiki/File:University_of_Melbourne_autumn_(Unsplash).jpg), Fabian Mardi | REJECTED, original AI restored — CC0 timing supported by [archived publication](https://web.archive.org/web/20170505161309/https://unsplash.com/photos/tQuEvmj83U4); official university identification of visible cherub friezes conflicts with Rule C. |
| `common/fields/biotechnology-lab` | [Laboratory microscope](https://commons.wikimedia.org/wiki/File:Biology_microscope.jpg), J.Doniyorovich | PASS — individual own-work CC0; accurate optical microscope close-up, no claim of an advanced biotechnology procedure. |
| `common/fields/computer-science-lab` | [ICTC laboratory, De La Salle University–Dasmariñas](https://commons.wikimedia.org/wiki/File:De_La_Salle_University_%E2%80%93_Dasmari%C3%B1as_(DLSU%E2%80%93D)_Information_and_Communications_Technology_Center_(ICTC)_laboratory_room_203_(ICT203)_%E2%80%94_normal_view.jpg), UndueMarmot | PASS after correction — final crop `left=1080, top=600, width=2800, height=1575` removes both the Windows wallpaper and far-right AOC mark. Empty screens/room; source credit retains real institution. |
| `site/hero/lecture-hall-empty` | [Morton Hall lecture hall, Ohio University](https://commons.wikimedia.org/wiki/File:Ohio_University_Lecture_Hall.jpg), Garden Sprite | PASS — individual own-work CC0; accurate empty lecture room and two screens, incidental emergency-exit signs. |

The [CC0 deed](https://creativecommons.org/publicdomain/zero/1.0/) permits
modification and commercial reuse while preserving separate privacy, trademark
and other rights. The visible policy correctly avoids claiming universal legal
clearance or institutional endorsement. Source pages are photograph provenance;
they are not substituted for official admissions sources.

## Exact institution bindings

- Princeton photograph → `princeton-university`: PASS. The official
  [Holder Hall page](https://hres.princeton.edu/undergraduate-housing/explore/holder-hall)
  and [facilities history](https://facilities.princeton.edu/campus-building-history)
  corroborate the named campus buildings.
- Manchester photograph → `university-of-manchester`: PASS. Its official
  [historic campus page](https://www.manchester.ac.uk/study/virtual/360-tours/historic-campus/index.htm)
  and the inscription in the photographed entrance agree with the subject.
- Roeterseiland photograph → `university-of-amsterdam`: PASS. The official
  [campus description](https://pple.uva.nl/who-we-are/campus/campus.html) identifies
  this campus as part of UvA, concordant with the photographer's location.
- Melbourne photograph → `university-of-melbourne`: identity PASS, image REJECTED.
  The university's [Western Side documentation](https://msd.unimelb.edu.au/about-us/glyn-davis-building/explore/exterior/western-side)
  identifies the exact facade and its cherub relief friezes.

An independent assertion checked every one of the 130 college profiles. Exactly
Princeton, Manchester and Amsterdam select photographs, each with its own exact
`institutionSlug` and matching destination. The other 127 select AI. No profile
selects another institution's photograph. A deliberately mismatched Princeton
slug with the India destination also correctly falls back to AI.

After the final relevance correction, a further independent check of all 130
profiles confirms that no countryside, village, landscape, forest, skyline or
coast scene is selected. Profiles use a reviewed academic campus/library/study
scene within their destination, or a neutral academic AI campus scene when that
destination has no eligible AI scene. This avoids showing the remaining Canadian
lake or the Indian village as the illustration for a named university.

## Nine-destination and jurisdiction checks

All nine destination pools were considered as peers. India, USA, Canada, UK &
Ireland, Europe and Australia & New Zealand produced prepared candidates.
Russia & CIS and the Middle East retain reviewed AI after unsuitable candidates;
East & Southeast Asia retains AI because the Tokai crop exceeded the image
budget even at 1024px. The Talcott greenhouse also exceeded the AVIF budget and
was not imported. Keeping AI for these cases follows the owner's fallback rule.
Melbourne is additionally rejected under Rule C, restoring the original AI.

Photograph locations reviewed: India, United States, Canada, United Kingdom,
Netherlands and Philippines (computer lab). Australian and Japanese candidates
were also reviewed and ultimately not imported. Audience safeguards apply across all nine GSB destinations: no
identifiable people, personal/education/health records, student data, political
subjects, legal/visa/financial advice or new third-party trackers are introduced.
Captions are neutral descriptions, distinguish illustration from photograph,
and do not claim admissions facilities, current availability or endorsement.

Architecture was considered separately from the photographer's license. Relevant
primary statutory references independently checked were:

- India [Copyright Act §52(1)(s)](https://copyright.gov.in/Copyright_Act_1957/chapter_xi.html).
- United States [17 USC §120(a)](https://www.copyright.gov/title17/92chap1.html#120).
- Canada [Copyright Act §32.2(1)(b)](https://laws-lois.justice.gc.ca/eng/acts/C-42/section-32.2.html).
- UK [CDPA §62](https://www.legislation.gov.uk/ukpga/1988/48/part/I/chapter/III).
- Netherlands [Auteurswet, Article 18](https://wetten.overheid.nl/BWBR0001886/2026-01-01#HoofdstukI_Paragraaf6_Artikel18),
  read through the official-domain search excerpt because direct access was
  blocked; [WIPO's current-law record](https://www.wipo.int/wipolex/en/legislation/details/23781)
  confirms the January 2026 version.

The non-imported Australia and Japan candidates were also researched, but are
not part of the accepted batch or the final source sign-off.

No new sensitive law/visa assertions are made on the site. The Qatar candidate
was withheld because its photograph dedication did not resolve the separate
modern-architecture question. This report does not attempt to supply that missing
clearance.

## Findings corrected during independent review

1. The computer-lab crop originally included a lit Windows wallpaper; a second
   crop removed it. A further narrow crop removed a visible AOC monitor mark.
2. `/editorial-policy` still claimed all pictures were generated; it now uses
   mixed-source text from `lib/image-policy.ts`, matching `/disclaimer`.
3. Melbourne's frieze concern emerged during additional official institution
   verification, superseding the initial visual-only pass. The photo was removed
   and its original approved AI illustration restored.

## Encoded artifacts and implementation

The original nine-photo batch comprised 36 variants. All decoded successfully,
with purposeful 16:9 crops (normal half-pixel rounding for 1400×788), thumbnails
560×315, no source upscaling, and no retained source metadata. Hero widths were
1400px except Ohio 1280px and the subsequently rejected Melbourne 1024px. The
final passing batch comprises eight photos / 32 variants, with Ohio at 1280px
and the other seven at 1400px.

Independent final disk measurement: 356 optimized assets, 11,497,422 bytes,
compared with the initial 372 assets / 11,599,140 bytes. The editorial library is
101,718 bytes smaller overall despite the real-photo replacements. The eight
photo concepts account for 1,577,455 bytes across all 32 variants. AVIF hero
files range from 20,646 to 101,690 bytes; AVIF thumbnails from 7,042 to 18,808
bytes. Originals and review previews remain outside `public` in ignored storage.

The prebuild guard independently passed for the final 89 records / 8 photos.
Registry/manifest/disk consistency, true dimensions and variant byte
ceilings passed. Immutable physical photo URLs differ from the old AI URLs;
stable logical resolver keys preserve page mappings. Static local assets avoid
new remote requests. Photo captions expose source/creator/license text; retained
AI keeps the existing information badge. The protected footer disclaimer and
root layout remain intact.

## Final integration and verification

- Independent `npm run images:check`: PASS, 89 assets / 8 photographs; 81
  reviewed AI assets retained. The separate all-130-profile assertions pass
  exact-institution and academic-scene constraints. `git diff --check` passes.
- Final static HTML audit: all 3,262 image-bearing generated pages checked,
  including 92 photo placements, zero failures. The audit compares the protected
  footer after stripping markup and normalizing whitespace; an earlier raw-HTML
  string check had false negatives and is superseded by this corrected result.
- Final browser evidence: 63 checks across 21 routes at desktop 1440×1000,
  tablet 768×1024 and mobile 375×844, zero failures. These cover all nine
  destination hubs, all eight photo concepts, all three exact photo profiles,
  IIT Bombay's academic AI fallback, home, exam, guide and topic templates,
  disclaimer and editorial policy. Images decode, alt/captions/canonicals/footer
  are present, and there is no horizontal overflow. AI-badge click and Escape
  behavior pass.
- The independent reviewer inspected final desktop/tablet/mobile profile
  composites and representative regional/shared-photo screenshots. Photos and
  wrapped credits remain legible; AI captions retain the information badge.
- Final production build, lint and post-build TypeScript check pass, as reported
  by the main agent and supported by the final build log. CMI validation has zero
  errors and the strict duplicate gate passes; only image/code changes followed
  those checks. No new content unit or duplicate catalogue record was created.
- Main agent directly checked AVIF/WebP HTTP responses: status 200, correct MIME
  and the existing one-year immutable cache header. No dependency or security
  header/CSP change was introduced.

Evidence files are ignored working records under
`image-pipeline/raw/review-2026-10-23/` (`build-final.log`,
`static-html-audit.json`, `browser-results.json`, final profile composites).
Independent decode/profile evidence is under
`image-pipeline/raw/independent-qa-2026-10-23/`. The committed source/crop/QA
records remain in the manifest and this report. The separate sign-off is appended
to `.claude/rules/content-audit-log.md`.

Completed and verified **local-only**. No commit, push or deployment is
authorized or performed. No blocking finding remains in the accepted batch;
rejected photographs remain excluded, with reviewed AI fallbacks.

## Follow-up — 24 October 2026: policy wording and neutral links

**PASS for the copy/link/rendering-only follow-up.** The policy now opens by
explicitly describing both photographs and computer-generated illustrations.
“Some images” is accurate for the unchanged 89 assets (8 photographs and 81
illustrations); the copy does not describe illustrations as “a few.” The shared
editorial summary is consistent. The image-policy and badge-facing text avoids
the term “AI” while preserving truthful illustration disclosures.

New badge links use `/disclaimer#images`; the existing
`#ai-generated-images` fragment remains a unique alias at the same policy
heading. The badge's accessible suffix describes photographs and illustrations,
passed as a required plain string from the server. No registry or policy module
was imported into the client badge. Photo credits and exact-college routing are
unchanged, as are the protected footer and canonical page URL.

Independent source review of these changed files and count verification pass.
The final static audit checks the new neutral link and accessible text on all
3,170 illustration-bearing pages and confirms 92 photo-bearing pages remain
unchanged, with zero failures. Final browser evidence passes 18 checks across
desktop, tablet and mobile: both fragments, disclaimer/editorial wording, badge
open/Escape/link/Back behavior, photo-label separation, footer and overflow.
After smooth scrolling settles, fragment targets are 99–113px below the viewport
top against 96px scroll padding; the independently inspected mobile anchor
screenshot shows the full heading below the sticky header. An initial test read
the scrolling animation too early; the corrected check waits for the target and
Back URL to settle, without changing product code to suppress a failure.

Main-agent lint, TypeScript and full production-build results pass; the final
build log and browser/static JSON evidence were inspected. `git diff --check`
passes. No new image, content unit, admissions fact, source license or legal
claim was introduced or re-verified by this follow-up. All nine destinations
continue sharing the same image policy. Completed **local-only**; no commit,
push or deployment was authorized or performed.

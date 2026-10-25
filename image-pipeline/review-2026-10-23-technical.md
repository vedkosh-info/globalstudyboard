# Image technical audit — 23 October 2026

Scope: the selected GlobalStudyBoard root repository only. Baseline measured before this session replaced or removed any image. The table below records the existing library, not a new license or visual sign-off.

## Baseline and reach

- 100 manifest records: 93 independently QA-passed AI assets and 7 retired records. The retired assets are absent from the shipped library.
- 93 registered assets, each with AVIF/WebP hero and thumbnail: 372 optimized files, 11,599,140 bytes (11.06 MiB). AVIF variants total 4,042,134 bytes; WebP variants total 7,557,006 bytes. Fifteen zero-byte `.gitkeep` files are additional folder markers.
- Current data resolves 3,262 hero placements: 2,701 guides, 130 college profiles, 53 exams, 368 topic hubs, 9 destination hubs, and the home page. These are placements in the active data/templates, rather than an HTTP crawl count.
- Four registered decorative assets have no current resolver/template use. Together their sixteen variants cost 266,590 bytes (260.34 KiB): `site/decor/bookshelf-spine-texture`, `knowledge-network-abstract`, `soft-gradient-forest-cream`, and `warm-wood-desk-texture`. Retirement and removal recover this space without changing any current page.
- The five application/brand PNGs and favicon ICO are separate from the editorial library. Root and regional OG/Twitter cards are drawn by code, reusing the brand mark; they should retain the project identity.

## Current architecture

`lib/images.ts` remains a small server-side resolver importing only the generated registry and erased types. Stable subject matching selects shared field/journey/exam scenes; deterministic seeded pools select destination and site atmosphere. The home image has an explicit key. A college currently receives a destination scene by seeded rotation, rather than a picture claiming to depict that university.

Only `components/ContentImage.tsx` renders the editorial images. It uses static `<picture>` sources, AVIF first and WebP fallback, accurate dimensions, 560px thumbnails, and 1400px heroes. All six template families currently request a priority hero; the thumbnail is still a responsive source for narrow displays. No image registry/catalogue needs to enter a client bundle.

The AI disclosure is a small client component receiving strings only. The existing owner preference keeps its information icon collapsed until activated. Existing `/disclaimer` text incorrectly describes every image as AI once real photography is introduced; it must change with the first real photo, while preserving the exact protected global footer disclaimer.

`/images/:path*` is served with one year of immutable caching. A changed photo, crop, or encoder setting must receive a new URL. Keep the resolver key stable and put the revision hash on physical filenames. Replacing bytes at the old URL would leave repeat visitors seeing the previous image for up to a year. No security-header/CSP change is necessary.

## Minimal mixed-source implementation

1. Keep stable logical manifest keys and the current global fallback system. Add optional `optimizedBase` for a new immutable photo filename such as `/images/common/fields/engineering-makerspace-photo-<8 hex>`.
2. Give every registry entry `provenance: { kind: 'ai' }` or a typed photo record. A photo records its exact Commons File page, original upload URL, creator, license/deed URL, verification date, observed subject, supporting license evidence, and optional real institution slug. Missing provenance on an existing legacy record means AI.
3. Begin with verified CC0 photos only. Other permissive stock terms retain copyright and should not silently be described as copyright-free. A public-domain record needs explicit provenance/evidence and separate review. Commons is the file-license record, not a source for admissions claims.
4. Display photo credit and license/source links as server-rendered text outside the information-icon button. A photo must never say “not a photo.” A representative photo on a named university profile must state that it is not that institution unless the record is explicitly bound to that same institution.
5. Keep all source downloads and full-resolution crops under ignored `image-pipeline/raw/`. Commit only the optimized four variants. Remove superseded AI variants from the shipped tree after replacement approval; Git history preserves recovery without duplicate shipped files.
6. Review each crop at its delivered sizes. Use one clean 16:9 source crop for hero/thumbnail, selected per image with the relevant subject intact. Avoid automatic centre crop when it chops equipment, buildings, or essential context. There is no need to add a third responsive variant unless measurements justify its repository cost.

## Guard findings and implementation in this session

The baseline prebuild guard did not reject a registered image whose manifest QA status was later downgraded. It checked neither source licenses/provenance nor byte caps and true dimensions. The original `qa-stamp.mjs` also passes every pending manifest record absent from its reroll list without checking which records were actually reviewed; do not use that mechanism to approve new photography unchanged.

The updated generator and prebuild guard now:

- Generate only QA-passed manifest records, retain stable keys, and preserve the previous generated registry if generation fails.
- Reject duplicate keys/paths, missing or unregistered files, stale alt/provenance/path metadata, and registered records whose QA no longer passes.
- Require immutable hashed photo paths and complete, verified photo provenance. Current allowed source is an exact HTTPS Wikimedia Commons File page, with the original on Wikimedia upload infrastructure; CC0 uses its exact deed URL. Institutional slugs must resolve to a real GSB college record.
- Read AVIF `ispe` and WebP `VP8`/`VP8L`/`VP8X` dimensions without image decompression. All four variants must agree with the registry and retain the expected 16:9 crop (including normal pixel rounding).
- Enforce the existing hard ceilings: hero AVIF 100 KiB, hero WebP 180 KiB, thumbnail AVIF 30 KiB, thumbnail WebP 45 KiB, with maximum widths 1400px/560px. Original PNG/JPEG/TIFF files in the public image tree block the build.
- Apply the named-institution archetype prohibition to AI only. Real-photo subject and contextual honesty still require independent visual/content QA.

Validation of this implementation: baseline `images:check` passed for all 93 assets, targeted ESLint passed, full TypeScript check passed. Six isolated in-memory guard scenarios passed: clean baseline plus rejection of QA downgrade, stale alt, unknown provenance, wrong dimensions, and stale path. The mutation checks never edited the shared manifest. Independent final review remains a separate pass.

## Baseline per-asset inventory

Each key expands to four paths under `/images/`: `<key>.avif`, `<key>.webp`, `<key>-sm.avif`, and `<key>-sm.webp`. Byte values below are exact. Usage columns count hero placements from current data, in order `guide / college / exam / topic / region / home`; `0` means currently unused.

| Logical key | Placements | Hero AVIF B | Hero WebP B | Thumb AVIF B | Thumb WebP B |
|---|---:|---:|---:|---:|---:|
| regions/india/campus-quad-golden-hour | 0 / 5 / 0 / 0 / 1 / 0 | 50007 | 99648 | 16436 | 28032 |
| regions/india/city-dawn-atmosphere | 0 / 1 / 0 / 0 / 0 / 0 | 44984 | 73806 | 12155 | 18298 |
| regions/india/library-reading-room | 0 / 4 / 0 / 0 / 0 / 0 | 36968 | 63850 | 13002 | 19338 |
| regions/usa/collegiate-brick-autumn | 0 / 4 / 0 / 4 / 1 / 0 | 100823 | 178374 | 29455 | 43172 |
| regions/usa/campus-green-clocktower | 0 / 9 / 0 / 1 / 0 / 0 | 89137 | 164968 | 22350 | 38058 |
| regions/usa/study-commons-interior | 0 / 7 / 0 / 4 / 0 / 0 | 25450 | 45012 | 9691 | 13696 |
| regions/canada/maple-campus-autumn | 0 / 4 / 0 / 3 / 0 / 0 | 62043 | 112142 | 20379 | 31540 |
| regions/canada/mountain-lake-landscape | 0 / 4 / 0 / 2 / 1 / 0 | 52168 | 105526 | 11628 | 21802 |
| regions/uk-ireland/honey-stone-quad | 0 / 6 / 0 / 1 / 1 / 0 | 40505 | 86302 | 13511 | 20716 |
| regions/uk-ireland/green-countryside | 0 / 10 / 0 / 1 / 0 / 0 | 36317 | 78426 | 13097 | 20330 |
| regions/uk-ireland/wood-panelled-library | 0 / 5 / 0 / 3 / 0 / 0 | 41777 | 73368 | 11570 | 20666 |
| regions/europe/continental-courtyard | 0 / 8 / 0 / 2 / 0 / 0 | 51397 | 100264 | 15457 | 26196 |
| regions/europe/oldtown-alpine-atmosphere | 0 / 6 / 0 / 4 / 1 / 0 | 52823 | 108190 | 13617 | 23484 |
| regions/europe/modern-study-hall | 0 / 11 / 0 / 1 / 0 / 0 | 26563 | 46964 | 10492 | 15514 |
| regions/australia-nz/sunny-modern-campus | 0 / 4 / 0 / 2 / 0 / 0 | 79566 | 166388 | 22359 | 36712 |
| regions/australia-nz/coastal-landscape | 0 / 0 / 0 / 1 / 0 / 0 | 76686 | 136816 | 15362 | 25738 |
| regions/australia-nz/glass-learning-centre | 0 / 2 / 0 / 2 / 1 / 0 | 37174 | 62280 | 12416 | 17602 |
| regions/russia/classical-building-winter | 0 / 5 / 0 / 0 / 0 / 0 | 39165 | 78608 | 13152 | 21930 |
| regions/russia/snowy-forest-atmosphere | 0 / 3 / 0 / 2 / 0 / 0 | 28372 | 54266 | 9994 | 15422 |
| regions/russia/ornate-lecture-hall | 0 / 3 / 0 / 1 / 1 / 0 | 30811 | 62116 | 11361 | 18876 |
| regions/middle-east/desert-campus-architecture | 0 / 5 / 0 / 0 / 1 / 0 | 66615 | 122112 | 15552 | 27836 |
| regions/middle-east/skyline-dusk | 0 / 2 / 0 / 1 / 0 / 0 | 12343 | 22916 | 3863 | 6220 |
| regions/middle-east/bright-library-interior | 0 / 6 / 0 / 3 / 0 / 0 | 36976 | 69844 | 12916 | 21570 |
| regions/east-southeast-asia/hightech-campus-blossom | 0 / 4 / 0 / 1 / 1 / 0 | 95697 | 164140 | 26582 | 40720 |
| regions/east-southeast-asia/city-blue-hour | 0 / 5 / 0 / 3 / 0 / 0 | 38945 | 64296 | 11418 | 17132 |
| regions/east-southeast-asia/futuristic-study-commons | 0 / 7 / 0 / 6 / 0 / 0 | 36584 | 71232 | 13249 | 19158 |
| common/fields/engineering-makerspace | 60 / 0 / 0 / 8 / 0 / 0 | 42172 | 76978 | 12819 | 20692 |
| common/fields/computer-science-lab | 25 / 0 / 0 / 0 / 0 / 0 | 23429 | 45924 | 9810 | 15220 |
| common/fields/civil-engineering-models | 3 / 0 / 0 / 1 / 0 / 0 | 21254 | 44282 | 8665 | 13902 |
| common/fields/electronics-lab | 10 / 0 / 0 / 0 / 0 / 0 | 30104 | 53342 | 10314 | 15188 |
| common/fields/data-science-dashboards | 24 / 0 / 0 / 1 / 0 / 0 | 13027 | 26820 | 5554 | 8482 |
| common/fields/biotechnology-lab | 12 / 0 / 0 / 1 / 0 / 0 | 22032 | 40538 | 8782 | 13310 |
| common/fields/medical-simulation-lab | 124 / 0 / 0 / 14 / 0 / 0 | 11557 | 23938 | 4650 | 7258 |
| common/fields/dental-training-lab | 12 / 0 / 0 / 3 / 0 / 0 | 22398 | 46310 | 8974 | 14718 |
| common/fields/nursing-skills-lab | 26 / 0 / 0 / 2 / 0 / 0 | 19760 | 35514 | 7242 | 10922 |
| common/fields/pharmacy-dispensary | 16 / 0 / 0 / 0 / 0 / 0 | 36607 | 61676 | 13724 | 18978 |
| common/fields/veterinary-science | 8 / 0 / 0 / 0 / 0 / 0 | 26172 | 45710 | 8963 | 12988 |
| common/fields/law-library | 37 / 0 / 0 / 5 / 0 / 0 | 29748 | 56368 | 10426 | 17510 |
| common/fields/business-case-room | 42 / 0 / 0 / 5 / 0 / 0 | 30210 | 62970 | 8327 | 13918 |
| common/fields/finance-analytics-desk | 53 / 0 / 0 / 8 / 0 / 0 | 20132 | 41874 | 7128 | 12214 |
| common/fields/architecture-studio | 16 / 0 / 0 / 3 / 0 / 0 | 25375 | 48684 | 9341 | 15236 |
| common/fields/art-humanities-studio | 66 / 0 / 0 / 11 / 0 / 0 | 49373 | 98354 | 11632 | 20536 |
| common/fields/media-journalism-studio | 16 / 0 / 0 / 3 / 0 / 0 | 19725 | 38858 | 7519 | 12004 |
| common/fields/research-laboratory | 64 / 0 / 0 / 11 / 0 / 0 | 27727 | 47896 | 9703 | 14394 |
| common/fields/culinary-teaching-kitchen | 17 / 0 / 0 / 2 / 0 / 0 | 47699 | 90020 | 16279 | 25642 |
| common/fields/aviation-simulator | 14 / 0 / 0 / 2 / 0 / 0 | 19256 | 39584 | 5503 | 9732 |
| common/fields/agriculture-greenhouse | 7 / 0 / 0 / 0 / 0 / 0 | 50797 | 91540 | 16467 | 26302 |
| common/fields/psychology-study-room | 16 / 0 / 0 / 1 / 0 / 0 | 38504 | 73476 | 10662 | 16972 |
| common/fields/maritime-training | 13 / 0 / 0 / 2 / 0 / 0 | 33425 | 60140 | 9433 | 14592 |
| common/fields/physics-optics-lab | 8 / 0 / 0 / 0 / 0 / 0 | 21567 | 43004 | 8164 | 13330 |
| common/exams/exam-hall-empty-desks | 37 / 0 / 6 / 1 / 0 / 0 | 27181 | 48618 | 10592 | 16124 |
| common/exams/answer-sheet-pencil | 16 / 0 / 7 / 2 / 0 / 0 | 21031 | 45404 | 7130 | 12710 |
| common/exams/computer-based-test | 26 / 0 / 5 / 2 / 0 / 0 | 35136 | 78038 | 6799 | 12792 |
| common/exams/english-listening-test | 0 / 0 / 5 / 0 / 0 / 0 | 19663 | 40868 | 7277 | 12380 |
| common/exams/writing-essay-booklet | 23 / 0 / 7 / 1 / 0 / 0 | 20582 | 44504 | 6970 | 12278 |
| common/exams/prep-books-stack | 24 / 0 / 6 / 1 / 0 / 0 | 25938 | 59118 | 6936 | 12638 |
| common/exams/score-report-abstract | 26 / 0 / 8 / 1 / 0 / 0 | 15402 | 35332 | 5296 | 10312 |
| common/exams/registration-laptop | 28 / 0 / 9 / 2 / 0 / 0 | 14444 | 32534 | 4556 | 8848 |
| common/journey/application-checklist | 99 / 0 / 0 / 2 / 0 / 0 | 19834 | 44634 | 6270 | 11528 |
| common/journey/statement-of-purpose | 16 / 0 / 0 / 0 / 0 / 0 | 13654 | 30376 | 5060 | 9078 |
| common/journey/letter-of-recommendation | 9 / 0 / 0 / 0 / 0 / 0 | 14362 | 30524 | 5914 | 9862 |
| common/journey/study-abroad-passport | 46 / 0 / 0 / 0 / 0 / 0 | 39031 | 74672 | 9973 | 17054 |
| common/journey/student-visa-documents | 174 / 0 / 0 / 25 / 0 / 0 | 15614 | 35246 | 5847 | 10698 |
| common/journey/scholarship-funding | 150 / 0 / 0 / 23 / 0 / 0 | 22307 | 43376 | 6057 | 10126 |
| common/journey/education-loan | 29 / 0 / 0 / 2 / 0 / 0 | 20310 | 45048 | 6047 | 10886 |
| common/journey/admission-letter | 80 / 0 / 0 / 0 / 0 / 0 | 15271 | 34572 | 5132 | 9440 |
| common/journey/graduation-still-life | 90 / 0 / 0 / 0 / 0 / 0 | 20643 | 41056 | 5747 | 10242 |
| common/journey/decision-day-calendar | 108 / 0 / 0 / 1 / 0 / 0 | 14100 | 32720 | 5625 | 10220 |
| common/journey/student-dorm-room | 60 / 0 / 0 / 0 / 0 / 0 | 27634 | 55052 | 7868 | 13008 |
| common/journey/night-study-setup | 86 / 0 / 0 / 0 / 0 / 0 | 13089 | 28510 | 5099 | 8538 |
| common/journey/packing-suitcase | 52 / 0 / 0 / 0 / 0 / 0 | 35612 | 70594 | 10469 | 17768 |
| common/journey/choosing-destination-globe | 44 / 0 / 0 / 0 / 0 / 0 | 18599 | 35188 | 6673 | 10100 |
| common/journey/airport-departure | 59 / 0 / 0 / 0 / 0 / 0 | 28042 | 54944 | 8301 | 13322 |
| common/journey/budgeting-abroad | 140 / 0 / 0 / 6 / 0 / 0 | 16568 | 38684 | 4235 | 8054 |
| common/journey/research-thesis-desk | 74 / 0 / 0 / 0 / 0 / 0 | 18881 | 41912 | 7041 | 11554 |
| common/journey/internship-workspace | 85 / 0 / 0 / 0 / 0 / 0 | 33938 | 63700 | 9808 | 15840 |
| common/journey/language-learning | 84 / 0 / 0 / 0 / 0 / 0 | 23927 | 47760 | 7631 | 12872 |
| common/journey/orientation-auditorium | 123 / 0 / 0 / 0 / 0 / 0 | 25400 | 46754 | 8871 | 13568 |
| site/hero/homepage-campus-avenue-dawn | 24 / 0 / 0 / 14 / 0 / 1 | 77157 | 138310 | 18705 | 30722 |
| site/hero/destination-globe-abstract | 21 / 0 / 0 / 16 / 0 / 0 | 6804 | 12946 | 2723 | 3924 |
| site/hero/topic-hub-desk-flatlay | 22 / 0 / 0 / 14 / 0 / 0 | 32219 | 68554 | 8004 | 15214 |
| site/decor/bookshelf-spine-texture | 0 / 0 / 0 / 0 / 0 / 0 | 20098 | 39940 | 5189 | 8104 |
| site/hero/golden-hour-quad | 18 / 0 / 0 / 12 / 0 / 0 | 48900 | 102562 | 11827 | 23612 |
| site/decor/knowledge-network-abstract | 0 / 0 / 0 / 0 / 0 / 0 | 15376 | 30950 | 6127 | 9752 |
| site/hero/study-flatlay-coffee | 18 / 0 / 0 / 26 / 0 / 0 | 17046 | 45176 | 4928 | 8758 |
| site/hero/campus-bicycle-ivy | 26 / 0 / 0 / 12 / 0 / 0 | 83779 | 148990 | 26556 | 42344 |
| site/hero/graduation-caps-stilllife | 20 / 0 / 0 / 14 / 0 / 0 | 28137 | 60580 | 6327 | 11364 |
| site/decor/warm-wood-desk-texture | 0 / 0 / 0 / 0 / 0 / 0 | 33000 | 65146 | 7545 | 14020 |
| site/hero/lecture-hall-empty | 20 / 0 / 0 / 18 / 0 / 0 | 26938 | 55522 | 9207 | 15472 |
| site/hero/globe-books-still-life | 19 / 0 / 0 / 12 / 0 / 0 | 15721 | 33666 | 5040 | 8280 |
| site/decor/soft-gradient-forest-cream | 0 / 0 / 0 / 0 / 0 / 0 | 1936 | 6796 | 839 | 1772 |
| site/hero/window-desk-morning | 18 / 0 / 0 / 14 / 0 / 0 | 18045 | 43316 | 5362 | 9884 |
| site/hero/campus-gateway-arch | 18 / 0 / 0 / 16 / 0 / 0 | 87744 | 177244 | 18347 | 33056 |

# Image relevance and crop review — 26 October 2026

Status: implemented locally; independent final integration review belongs to the parent task. No commit, push or deployment performed by this lane.

## Coverage and method

The baseline was all **89 registered images** and **3,262 hero placements**: home, nine destination hubs, 130 university profiles, 53 examinations, 368 topic hubs and 2,701 guides. Every asset was visually reviewed in six fresh labelled overview sheets; every placement was resolved against its actual current slug/category and the registry. Current content has **3,260** placements because independent review withheld two policy-incompatible content units; this is not a missing-image failure.

The complete computed before/after placement inventories and changed mappings are in ignored review records under `image-pipeline/raw/review-2026-10-26/`. All current placements resolve a registered image. This is full allocation and asset coverage, not a claim that every admissions fact or every individual page was manually re-verified. The parent task supplies the whole-project route/UI/performance verification and independent sign-off.

The library remains **eight previously verified CC0 photographs plus 81 reviewed computer-generated illustrations**. No new source, image generation, asset encoding, package or image byte was introduced. The file-level rights and source records in the manifest remain intact. A suitable existing photograph is preferable to adding another asset solely for variety; where no precise photograph is available, honest illustrative context remains appropriate.

## Findings and fixes

The original resolver did more than select images by subject: it also hashed unrecognised pages across broad folders. This produced decorative variation at the expense of relevance. Whole-word matching avoided substring accidents, but some whole words were still ambiguous: “communication”, “civil”, “web”, “industrial”, “logistics”, and general “data”.

| Page subject | Previous image/context | Current image/context |
|---|---|---|
| Electronics & Communication Engineering | Broadcast studio | Electronics workbench |
| Civil Services & Government Careers | Bridge/structural models | Exam preparation books |
| EAPCET web counselling | Computer-science lab | Application checklist |
| Student health insurance | Anatomical training model | Application/document checklist |
| Generic PhD and research pathways | Scientific wet lab | Research and thesis desk |
| Humanities and social sciences | Painting/easel studio | Books and research desk |
| Teaching and education | Painting/easel studio | Real university lecture hall |
| Data/analytics and digital production | Decorative screen bokeh or broadcast studio | Real teaching computer lab |
| Climate and what to pack | Random dorm/airport choice | Packed suitcase |
| Public-transport guide | Random regional or dorm scene | Campus bicycle/commuting context |
| Language, deadlines and funding topic hubs | Random skyline, bike, globe or graduation scene | Relevant language, calendar or funding scene |
| Canada/Europe region hubs | Mountain lake / old-town scenery | Actual university exteriors with source credits |

Practical purpose now outranks incidental degree words: documents, insurance, credential/recognition or registration processes show paperwork; funding and loans retain distinct money contexts; deadlines show a calendar. Explicit examination preparation uses examination imagery ahead of a field laboratory. Generic examinations use mode-neutral preparation stationery by default, while computer stations, score reports or registration scenes require a matching subject. Thus an image does not silently imply a current test delivery mode or a published result.

Topic hubs now use the same practical-step and journey resolution as guides. Generic destination study content falls back to an academic setting rather than arbitrary luggage, dorm rooms, travel, ceremony or scenery. Field-specific topics still select the closest available field scene. A generic research pathway no longer implies that all doctoral subjects use laboratory equipment. Named-university application guides select application scenes rather than matching an academic noun inside the institution's name (for example, “Sciences” or “Management”).

All nine destination hubs have a deliberate academic exterior. Existing stock sources are retained where they match that destination; all destinations follow the same rule. University profiles retain their stricter guard: a real photograph may appear only for its exact reviewed institution and destination, with academic illustrations for the other profiles. All 130 profile selections are unchanged by this pass.

Across existing pages, **1687 allocations change**: 1401 guides, 239 topics, 43 exams and 4 destination hubs. These are semantic improvements to existing canonical pages, not duplicate pages or new factual content. Source URLs, provenance and factual verification dates were not changed.

The independent follow-up also prioritises game-development computing over generic media, and mental-health support over a generic dormitory/wellbeing scene. Both exact guide routes are included in the 36 semantic regression cases. The final baseline-to-current allocation change is 1,686 mappings: 1,400 guides, 239 topics, 43 exams and four destination hubs; two withheld units are excluded.

## Crop and image-size decisions

The apparent smallness in the user's screenshot is a **layout allocation problem**: the existing hero source is already 1400px wide. Upscaling a file or adding high-resolution duplicates would not solve its small side-column display and would add weight.

- The home avenue scene safely supports a **4:3 cover crop at approximately 40% horizontal focus**: the path and academic setting remain central while some peripheral railing/side foliage is trimmed. The parent task owns this display treatment.
- Preserve **16:9** for the enlarged content heroes. It keeps document props, microscope eyepiece/stage, aircraft/boat silhouettes, graduation objects and building facades intact.
- A universal **21:9** crop was rejected. It trims roughly 24% of the vertical scene and can amputate meaningful equipment, object or facade details. A wide crop must be proved on its individual image rather than imposed globally.
- All existing hero derivatives are 1400×788 except the Ohio lecture hall at 1280×720; thumbnails are 560×315. Do not upscale beyond the inspected source. Parent layout sizing and responsive hints should match actual display width.
- Existing AVIF/WebP derivatives, immutable hashed photo URLs, captions, on-image illustration disclosures and byte ceilings remain in force. Raw sources and contact sheets remain ignored outside shipped public assets.

## Verification

- Targeted ESLint on `lib/images.ts`: pass.
- Image registry / manifest / disk / byte / license gate: pass, 89 assets / eight photographs.
- Semantic regression checks: **36 reviewed concrete cases**, plus every current allocation, all 130 college identity guards, all nine destination academic contexts and all 53 exam records: **3,488 checked cases**, pass.
- Full project TypeScript check: pass after coordinated UI edits. This lane’s scratch scripts were also corrected so they introduce no type errors (ignored `.ts` files are still included by the project compiler).
- No catalogue imports were added to the resolver; it remains a leaf with only the generated registry and erased types. No image catalogue enters a new client bundle.
- Parent final desktop/tablet/mobile rendering, build, performance comparisons and separate QA remain the release gate. This lane does not independently award the whole project 10/10.

## Per-image review ledger

Every row below was inspected in the current overview sheets. The existing natural crop is retained, except the optional focused home display treatment described above. “Uses” means computed hero placements, not network downloads. Zero-use assets stay in the reusable library in this pass; they are not falsely reported as visible on a current page. The parent can separately choose to retire genuinely unreachable assets after considering resolver stability.

| Image key | Provenance | Uses before | Uses now | Four derivatives |
|---|---|---:|---:|---:|
| `regions/india/campus-quad-golden-hour` | CC0 photo | 1 | 1 | 303.9 KiB |
| `regions/india/city-dawn-atmosphere` | Computer illustration | 0 | 0 | 145.7 KiB |
| `regions/india/library-reading-room` | Computer illustration | 10 | 13 | 130.0 KiB |
| `regions/usa/collegiate-brick-autumn` | CC0 photo | 6 | 2 | 261.2 KiB |
| `regions/usa/campus-green-clocktower` | Computer illustration | 12 | 22 | 307.1 KiB |
| `regions/usa/study-commons-interior` | Computer illustration | 12 | 19 | 91.6 KiB |
| `regions/canada/maple-campus-autumn` | CC0 photo | 3 | 1 | 186.2 KiB |
| `regions/canada/mountain-lake-landscape` | Computer illustration | 3 | 0 | 186.6 KiB |
| `regions/uk-ireland/honey-stone-quad` | CC0 photo | 3 | 2 | 187.2 KiB |
| `regions/uk-ireland/green-countryside` | Computer illustration | 1 | 0 | 144.7 KiB |
| `regions/uk-ireland/wood-panelled-library` | Computer illustration | 23 | 52 | 143.9 KiB |
| `regions/europe/continental-courtyard` | CC0 photo | 3 | 2 | 193.3 KiB |
| `regions/europe/oldtown-alpine-atmosphere` | Computer illustration | 5 | 0 | 193.5 KiB |
| `regions/europe/modern-study-hall` | Computer illustration | 25 | 58 | 97.2 KiB |
| `regions/australia-nz/sunny-modern-campus` | Computer illustration | 4 | 21 | 297.9 KiB |
| `regions/australia-nz/coastal-landscape` | Computer illustration | 1 | 0 | 248.6 KiB |
| `regions/australia-nz/glass-learning-centre` | Computer illustration | 7 | 25 | 126.4 KiB |
| `regions/russia/classical-building-winter` | Computer illustration | 4 | 19 | 149.3 KiB |
| `regions/russia/snowy-forest-atmosphere` | Computer illustration | 2 | 0 | 105.5 KiB |
| `regions/russia/ornate-lecture-hall` | Computer illustration | 9 | 21 | 120.3 KiB |
| `regions/middle-east/desert-campus-architecture` | Computer illustration | 5 | 21 | 226.7 KiB |
| `regions/middle-east/skyline-dusk` | Computer illustration | 1 | 0 | 44.3 KiB |
| `regions/middle-east/bright-library-interior` | Computer illustration | 12 | 21 | 138.0 KiB |
| `regions/east-southeast-asia/hightech-campus-blossom` | Computer illustration | 8 | 41 | 319.5 KiB |
| `regions/east-southeast-asia/city-blue-hour` | Computer illustration | 3 | 0 | 128.7 KiB |
| `regions/east-southeast-asia/futuristic-study-commons` | Computer illustration | 16 | 48 | 136.9 KiB |
| `common/fields/engineering-makerspace` | Computer illustration | 68 | 52 | 149.1 KiB |
| `common/fields/computer-science-lab` | CC0 photo | 25 | 53 | 75.8 KiB |
| `common/fields/civil-engineering-models` | Computer illustration | 4 | 3 | 86.0 KiB |
| `common/fields/electronics-lab` | Computer illustration | 10 | 11 | 106.4 KiB |
| `common/fields/data-science-dashboards` | Computer illustration | 25 | 0 | 52.6 KiB |
| `common/fields/biotechnology-lab` | CC0 photo | 13 | 15 | 120.0 KiB |
| `common/fields/medical-simulation-lab` | Computer illustration | 138 | 108 | 46.3 KiB |
| `common/fields/dental-training-lab` | Computer illustration | 15 | 13 | 90.2 KiB |
| `common/fields/nursing-skills-lab` | Computer illustration | 28 | 20 | 71.7 KiB |
| `common/fields/pharmacy-dispensary` | Computer illustration | 16 | 10 | 127.9 KiB |
| `common/fields/veterinary-science` | Computer illustration | 8 | 7 | 91.6 KiB |
| `common/fields/law-library` | Computer illustration | 42 | 31 | 111.4 KiB |
| `common/fields/business-case-room` | Computer illustration | 47 | 34 | 112.7 KiB |
| `common/fields/finance-analytics-desk` | Computer illustration | 61 | 54 | 79.4 KiB |
| `common/fields/architecture-studio` | Computer illustration | 19 | 17 | 96.3 KiB |
| `common/fields/art-humanities-studio` | Computer illustration | 77 | 35 | 175.7 KiB |
| `common/fields/media-journalism-studio` | Computer illustration | 19 | 14 | 76.3 KiB |
| `common/fields/research-laboratory` | Computer illustration | 75 | 33 | 97.4 KiB |
| `common/fields/culinary-teaching-kitchen` | Computer illustration | 19 | 18 | 175.4 KiB |
| `common/fields/aviation-simulator` | Computer illustration | 16 | 17 | 72.3 KiB |
| `common/fields/agriculture-greenhouse` | Computer illustration | 7 | 7 | 180.8 KiB |
| `common/fields/psychology-study-room` | Computer illustration | 17 | 16 | 136.3 KiB |
| `common/fields/maritime-training` | Computer illustration | 15 | 14 | 114.8 KiB |
| `common/fields/physics-optics-lab` | Computer illustration | 8 | 6 | 84.0 KiB |
| `common/exams/exam-hall-empty-desks` | Computer illustration | 44 | 80 | 100.1 KiB |
| `common/exams/answer-sheet-pencil` | Computer illustration | 25 | 73 | 84.3 KiB |
| `common/exams/computer-based-test` | Computer illustration | 33 | 0 | 129.7 KiB |
| `common/exams/english-listening-test` | Computer illustration | 5 | 30 | 78.3 KiB |
| `common/exams/writing-essay-booklet` | Computer illustration | 31 | 1 | 82.4 KiB |
| `common/exams/prep-books-stack` | Computer illustration | 31 | 92 | 102.2 KiB |
| `common/exams/score-report-abstract` | Computer illustration | 35 | 15 | 64.8 KiB |
| `common/exams/registration-laptop` | Computer illustration | 39 | 3 | 59.0 KiB |
| `common/journey/application-checklist` | Computer illustration | 101 | 389 | 80.3 KiB |
| `common/journey/statement-of-purpose` | Computer illustration | 16 | 17 | 56.8 KiB |
| `common/journey/letter-of-recommendation` | Computer illustration | 9 | 9 | 59.2 KiB |
| `common/journey/study-abroad-passport` | Computer illustration | 46 | 0 | 137.4 KiB |
| `common/journey/student-visa-documents` | Computer illustration | 199 | 249 | 65.8 KiB |
| `common/journey/scholarship-funding` | Computer illustration | 173 | 204 | 79.9 KiB |
| `common/journey/education-loan` | Computer illustration | 31 | 27 | 80.4 KiB |
| `common/journey/admission-letter` | Computer illustration | 80 | 200 | 62.9 KiB |
| `common/journey/graduation-still-life` | Computer illustration | 90 | 0 | 75.9 KiB |
| `common/journey/decision-day-calendar` | Computer illustration | 109 | 211 | 61.2 KiB |
| `common/journey/student-dorm-room` | Computer illustration | 60 | 62 | 101.1 KiB |
| `common/journey/night-study-setup` | Computer illustration | 86 | 0 | 53.9 KiB |
| `common/journey/packing-suitcase` | Computer illustration | 52 | 3 | 131.3 KiB |
| `common/journey/choosing-destination-globe` | Computer illustration | 44 | 0 | 68.9 KiB |
| `common/journey/airport-departure` | Computer illustration | 59 | 4 | 102.2 KiB |
| `common/journey/budgeting-abroad` | Computer illustration | 146 | 153 | 66.0 KiB |
| `common/journey/research-thesis-desk` | Computer illustration | 74 | 103 | 77.5 KiB |
| `common/journey/internship-workspace` | Computer illustration | 85 | 83 | 120.4 KiB |
| `common/journey/language-learning` | Computer illustration | 84 | 52 | 90.0 KiB |
| `common/journey/orientation-auditorium` | Computer illustration | 123 | 2 | 92.4 KiB |
| `site/hero/homepage-campus-avenue-dawn` | Computer illustration | 41 | 15 | 258.7 KiB |
| `site/hero/destination-globe-abstract` | Computer illustration | 37 | 0 | 25.8 KiB |
| `site/hero/topic-hub-desk-flatlay` | Computer illustration | 36 | 43 | 121.1 KiB |
| `site/hero/golden-hour-quad` | Computer illustration | 32 | 15 | 182.5 KiB |
| `site/hero/study-flatlay-coffee` | Computer illustration | 44 | 54 | 74.1 KiB |
| `site/hero/campus-bicycle-ivy` | Computer illustration | 38 | 3 | 294.6 KiB |
| `site/hero/graduation-caps-stilllife` | Computer illustration | 34 | 0 | 103.9 KiB |
| `site/hero/lecture-hall-empty` | CC0 photo | 38 | 23 | 213.0 KiB |
| `site/hero/globe-books-still-life` | Computer illustration | 31 | 0 | 61.2 KiB |
| `site/hero/window-desk-morning` | Computer illustration | 32 | 52 | 74.8 KiB |
| `site/hero/campus-gateway-arch` | Computer illustration | 38 | 16 | 309.0 KiB |

## Honest limits

Relevance of a broad multi-field hub is contextual, not an assertion that one image depicts every course. Illustrations remain labelled, real campus pictures retain exact subject credits, and no photograph of another institution is substituted on a university profile. This pass adds no identifiable people, records, trackers, religious/political imagery, professional-advice claim or admission statistic. The prior source/rights review is not represented as a fresh legal opinion.

A genuine 10/10 whole-project result also requires verified signed-in/account/report states, real-device and assistive-technology review, representative student usability evidence and production field performance. Passing allocation/asset checks alone does not establish those outcomes. This report therefore records objective pass/fail coverage and limitations rather than inventing a perfect rating.

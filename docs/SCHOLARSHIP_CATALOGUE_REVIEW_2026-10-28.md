# Scholarship Tracker: catalogue and integration source review

Date: 28 October 2026. Author review; independent sign-off belongs in the separate QA report and audit log. Local implementation only.

The nine presets are public programme identities linked to existing canonical guides. They save typing a programme name and official source. They do not assert that applications are open, that the visitor is eligible, that an award will be made, or that GSB's guide has been fully reverified. No deadline, amount, award cycle, ranking or applicant attribute is included in the compact catalogue. Source review dates are labelled as identity/destination checks, separate from the guides' existing verification dates.

## Sources and destination mapping

| Preset | Study destination | Official source and observed identity evidence |
| --- | --- | --- |
| Australia Awards Scholarships | Australia & New Zealand (Australia) | [DFAT programme page](https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships), opened: Australian government scholarship programme for study in Australia. |
| Lester B. Pearson International Scholarship | Canada | [University of Toronto programme page](https://future.utoronto.ca/pearson-scholarships), opened: named scholarship at the University of Toronto, Canada. |
| Global Korea Scholarship (GKS) | East & Southeast Asia (South Korea) | [Study in Korea programme page](https://www.studyinkorea.go.kr/en/plan/scholarship.do?tab=gks-tab1), opened: GKS programme for study in Korea; NIIED is named in the programme's selection process. |
| France Excellence Eiffel Scholarship | Europe (France) | [Campus France programme page](https://www.campusfrance.org/en/france-excellence-eiffel-scholarship-program), official indexed page returned: programme established by the French Ministry for Europe and Foreign Affairs and administered for French higher education institutions. Direct retrieval returned 403, so this review uses the official indexed text and does not claim a successful full-page fetch. |
| INSPIRE Scholarship for Higher Education (SHE) | India | [Official INSPIRE FAQ](https://www.online-inspire.gov.in/Account/FAQ), official indexed page returned: SHE is a component of INSPIRE under India's Department of Science and Technology. The [official 2024 SHE FAQ](https://www.online-inspire.gov.in/Content/SHEFAQs2024.pdf) corroborates identity and Indian study context. Direct HTML retrieval timed out; no current award-cycle or monetary fact was adopted. |
| Qatar University International Students Scholarship | Middle East (Qatar) | [Qatar University scholarship types](https://www.qu.edu.qa/en-us/students/admission/scholarships/types), opened: specifically names International Students Scholarship for study at Qatar University. The linked GSB guide covers additional scholarships; the tracker link explicitly names this selected programme. |
| Open Doors: Russian Scholarship Project | Russia & CIS (Russia) | [Official Open Doors site](https://od.globaluni.ru/), opened: named Russian scholarship project of Global Universities Association, for study/research at Russian universities. This whole domain is the named programme's site. The linked GSB guide also covers a different government scholarship; the tracker link explicitly names Open Doors. |
| Chevening Scholarships | UK & Ireland (United Kingdom) | [Official Chevening scholarships page](https://www.chevening.org/scholarships/), opened: named UK government scholarship programme for study in the UK. |
| Fulbright Foreign Student Program | United States | [Official programme page](https://foreign.fulbrightonline.org/about/foreign-student-program), opened: programme for study/research in the United States, administered through Fulbright Commissions/Foundations or U.S. Embassies. Country-specific eligibility remains on the provider's site. |

No source text was copied into guide bodies. The presets contain programme names, provider attribution and destination facts only, with original neutral interface copy. The account remains 18+, regardless of whether a programme itself admits younger applicants. The list is a starting set, not a representative ranking, a comprehensive global directory, or personalised matching. Every destination also supports manual entry. Destination grouping does not establish eligibility or identify the student's nationality.

The projection deliberately excludes legacy origin-tagged Fulbright/DAAD India guides as presets. It uses the existing destination-specific Fulbright guide. It does not mass-convert the 208 scholarship-category guides into award records. Broad overview guides link to an empty tracker without a fabricated award prefill.

## Integration behavior

- `#award=<canonical-guide-slug>&region=<destination>` carries only a public key through the existing sign-in handoff. Existing record links use `#entry=<uuid>&region=<destination>`. A strict bounded allow-list rejects duplicates, mixed item keys, arbitrary text and encoded parameters. The tracker still validates preset membership and account ownership.
- The public static catalogue contains no private tracking rows and no student inputs. Its server projection is blocked from client imports by the existing transitive bundle guard.
- The fifth tool appears in the index, quick links, account menu, region hubs and registry-derived sitemap. Index metadata includes each tool's compact subject within the existing length guard. The account popover scrolls within a viewport height cap.
- Account data export includes both `scholarship_entries` and `scholarship_tasks`; missing tables are tolerated only before migration, consistent with existing tools. Privacy and account-deletion disclosures describe the tracking details and linked funding records; file uploads are not introduced.
- Existing guide bodies, verification dates, security headers and CSP are unchanged by this integration. `SITE_LASTMOD` must be set to the real deployment date when a future release is authorised.

## Validation

Run `npx tsx scripts/scholarship-integration-qa.ts` for catalogue shape, canonical links, all nine destination entry points, auth fragment acceptance/rejection, metadata, sitemap and account export assertions. `npm run tools:check` adds prebuild source/identity validation and the named scholarship destination constraint. Full lint, TypeScript, build, independent content/privacy review and responsive interactive checks are coordinated by the main implementation lane.

Jurisdictions considered for the public identity projection: Australia, Canada, South Korea, France, India, Qatar, Russia, United Kingdom and United States, with shared worldwide audience safeguards. No legal, immigration, financial or health advice is introduced. This author review is not a certification of every applicable law or of the private production backend.

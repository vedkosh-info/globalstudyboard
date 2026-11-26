# Global college directory: places, scale and the review behind them

| | |
|---|---|
| Date | 22 November 2026 |
| Status | Place hierarchy built (local, not committed). Scale plan proposed. |
| Builds on | [COLLEGE_PROFILE_ARCHITECTURE.md](COLLEGE_PROFILE_ARCHITECTURE.md) (taxonomy, key-point profile, scannable rows) |
| Read-only reference | `/Users/pratap88bhanu/Documents/gitprojects/bharatboard` (nothing there was changed) |

The owner asked for a directory that can hold the world's high-value universities, browsed by destination, country, state and city, with pages that stay readable and rank well. This document records an independent review of the earlier analysis, a review of BharatBoard, what was built, and what is still a decision.

## 1. Review of the earlier analysis

The earlier review (pasted in the request) was right on these points:

- Keep GSB's architecture. Do not bring BharatBoard's school model across.
- The India-only JoSAA/DASA paragraph was false on IIM, AIIMS and NLU pages. The two-slot Domestic / International "How to apply" block that replaced it is the right template for all nine destinations.
- Ship colleges in verified batches with sources, not bulk generation.

It missed or overstated these:

1. **"100% ready" was not true.** The directory had no place level below the destination. `country` was a code, `state` was free text, and 18 UK and Australian records had no state at all. "Universities in Karnataka" or "Universities in London" could not be a page.
2. **A big destination would become one long list.** `/regions/india/universities` printed every Indian college in one block. At 300 to 500 colleges that is a wall, however good each row is.
3. **One file will not hold thousands of records.** `lib/colleges.ts` is 3,670 lines for 142 profiles. Thousands of records need one file per country, each typed `College[]`, so type-checking stays linear.
4. **"Most famous" is not a rule we can publish.** The site may not call a university famous (Rule A, §4.5). Which universities get a profile has to follow a list someone else publishes (see §5.1).
5. **The India batch did not pass its own gate.** `npm run colleges:check` failed on `iisc-bangalore`: one source was the site root `https://oir.iisc.ac.in/`. Fixing it turned up a real error: the profile said B.Tech admission runs through the IISc portal, and IISc's own B.Tech page says it is JoSAA only. Both are fixed (22 November). The 12 new and 10 upgraded India records still need an independent pass before they ship.
6. **Verification, not code, sets the pace.** About 12 profiles per batch is the honest rate. 2,000 profiles is roughly 170 batches. The architecture should make each batch cheap to add and safe to check; it cannot make reading official pages faster.

## 2. Review of BharatBoard (read-only)

**Worth copying, from its government-jobs section:**

- A canonical place registry with one slug per state (`JOB_STATES` in `lib/jobs/taxonomy.ts`).
- Real path routes (`/jobs/state/[state]/[wing]/[exam]`) with `dynamicParams = false`.
- Records can exist without a page. A planned exam gets no page, link or sitemap entry until it has content.
- Data split by home (`guides/state/<state>.ts`) and a README that says how to add a record.

**Not worth copying, from its school section:**

- Location is free text ("Pan-India (HQ: New Delhi)", "All States & UTs") and is turned back into states and cities by regular expressions in `getSchoolLocationMeta()`. A typo becomes a new place, silently.
- State and city filters are query strings (`?state=…&city=…`). That gives many crawlable URLs for one page, and the listing page reads `searchParams`, so it renders on every request.
- One 2.8 MB catalogue file, plus a 57 KB client accordion on every school page.
- Admission stages and documents written from shared templates rather than each school's own page.

GSB now uses the jobs pattern for places (§3). BharatBoard's school filter links are a BharatBoard issue; they should be changed from a BharatBoard session.

## 3. What was built

### URLs

The place pages hang off the destination spine, so the URL reads like the breadcrumb:

| Page | URL |
|---|---|
| Destination | `/regions/india/universities` (existing) |
| State (one-country destination) | `/regions/india/universities/karnataka` |
| City | `/regions/india/universities/karnataka/bengaluru` |
| Country (multi-country destination) | `/regions/uk-ireland/universities/uk` |
| Nation, then city | `/regions/uk-ireland/universities/uk/england/london` |
| City straight under a country | `/regions/europe/universities/germany/munich` |

India, the USA and Canada are one-country destinations, so their paths start at the state. There are no query strings, and the profile URL stays `/colleges/{slug}`.

### Data

- `lib/place-registry.ts`: pure data. Full and in-sentence names for all 47 countries, subdivision lists for India (states and union territories), the USA, Canada (provinces and territories), the UK (nations) and Australia (states and territories), and a city alias table (Bangalore → Bengaluru, St Petersburg → Saint Petersburg). Names are administrative names with no claim about status (§4.D).
- `lib/college-places.ts`: builds the tree from `COLLEGES` at build time. It is server-only and imports no client code.
- The 18 UK and Australian records got a `state`. Each comes from the city already on the record: Glasgow → Scotland, Canberra → Australian Capital Territory, and so on. No other field changed.

### When a place gets a page

A place gets its own page only when all three are true:

1. It has at least 3 profiles (`MIN_PLACE_PROFILES`).
2. It narrows its parent. Delhi has 3 colleges, all in New Delhi, so Delhi gets a page and New Delhi does not.
3. Its parent has a page too, so a published URL never has a missing page above it.

Today that is 21 pages: California, New York, Ontario, Karnataka, Delhi, Uttar Pradesh, the United Kingdom, England, London, Scotland, Ireland, Dublin, Germany, Australia, Russia, Moscow, Saudi Arabia, the UAE, Abu Dhabi, Japan and Singapore. New pages appear on their own as profiles are added. Nothing has to be configured per place.

A place below the threshold still appears as a heading on its parent's page. The directory is grouped by place from the first profile.

### Pages

- Place page: one H1 ("Universities in London, England"), a factual count, "listed alphabetically; the order is not a ranking", the last-updated date, links to child places that have pages, rows grouped by child place, the existing category and field filter, links to sibling places, a link up, and `CollectionPage` + `ItemList` JSON-LD. The title is capped at 70 characters; the "Profiles & How to Apply" tail is dropped before the place name is.
- Destination universities page: now grouped by country or state, with "Browse by state or union territory" (or country) links above the list.
- Breadcrumbs: a profile now reads Home › India › Colleges › Karnataka › IISc. The trail includes only places that have a page, and the `BreadcrumbList` JSON-LD changes with it.
- Sitemap: every published place page, dated by the newest college on it.

### Build gate

`npm run places:check`, now part of `prebuild`, fails the build when:

- A college in India, the USA, Canada, the UK or Australia has no state, or a state the registry does not know.
- A one-country destination holds a college from another country.
- One country's colleges sit in two destinations.
- Two spellings of one city would make two city pages.
- Two places resolve to one URL.

A note in brackets in `city` ("Dolgoprudny (near Moscow)") is a warning only.

### One rule to keep

Adding a subdivision level to a country changes that country's city URLs. Decide it before the country's first city page exists, never after. Germany, Japan and China have no subdivision level today, so their cities sit directly under the country.

## 4. Readability and SEO choices

- **Grouping replaces scrolling.** Rows under place headings are easier to scan than one alphabetical list. Empty groups hide with the existing filter.
- **No thin pages.** The three-profile threshold and the narrows-its-parent rule mean no page lists one name or repeats its parent.
- **One canonical URL per place.** Filters stay in the fragment (`#cat=`, `#field=`), as before.
- **Titles match search phrasing.** "Universities in Germany", "Colleges in Karnataka", "Universities in London, England".
- **No invented copy.** Place pages carry a count and the rows. There is no paragraph about the city, nothing to verify, and nothing that can go stale.

## 5. What scale needs next (proposed, not built)

### 5.1 An inclusion rule instead of "famous"

Profile a university when it appears on a list someone else publishes and we can cite:

- The current QS World University Rankings or THE World University Rankings, up to an agreed rank, per destination.
- National official lists. For India: Institutes of National Importance, and the NIRF overall and category lists. Other destinations: the government's own register of recognised universities, as the pool to choose from.
- The universities our guides already name, which is how the USA batch was chosen.

The page never says why a university was chosen. It lists facts.

### 5.2 Data files by country

Move records to `lib/colleges/<country>.ts`, one typed `College[]` per country, about 300 records at most per file. The aggregator in `lib/colleges.ts` spreads them. Do the move in a quiet window, not while a batch is open in the same file.

### 5.3 Listing limits

- When a destination passes about 300 profiles, its universities page should show place groups with counts and the first rows of each, linking to the place pages, instead of every row.
- The filter's data payload has an 80 KB budget. Past it, the filter reads `data-` attributes from the rendered rows (already specified in the earlier architecture document).
- `/colleges` worldwide switches to destination sections with counts at 800 profiles or 300 KB of HTML (already specified).

### 5.4 Useful links on place pages

A state page can link the state's own entrance exams already on the site, for example Karnataka → KCET and COMEDK, or Maharashtra → MHT CET. This needs a reviewed state-to-exam map in the registry. Nothing is inferred.

### 5.5 The profile's place line

The place line under a profile's H1 ("Bengaluru, Karnataka, India") should link to the place pages. `app/colleges/[slug]/page.tsx` is part of the open India batch, so this is left for after that batch lands. The breadcrumb already carries the links.

## 6. Decisions for the owner

1. **Directory entries without a page.** Should a place page also list universities that have no full profile yet, with name, city and official site, each read from that university's own site? This gives complete place pages early. It also adds a second record type and more pages to check. Recommendation: not yet. Grow profiles first.
2. **The inclusion rule in §5.1**, including the rank cut-off per destination.
3. **Subdivision levels for more countries** (Germany's states, China's provinces, Japan's prefectures), decided before their first city pages are published.
4. **Technion on the Middle East pages.** This is still open from September. The Covers line lists six Gulf states, and the university list includes Israel (§4.D).

## 7. Status

- Place hierarchy: built locally and not committed. The verification results are in the audit log row for 22 November 2026.
- India batch (12 new, 10 upgraded records): open work from another session. Its gate failures (the IISc site-root source and two titles over 70 characters) were fixed on 22 November. Its independent QA and its own audit row are still owed.
- BharatBoard: reviewed only, no changes.

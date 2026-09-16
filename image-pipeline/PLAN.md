# GlobalStudyBoard — Image Programme: Phased Plan

**Status (15 Sep 2026 — PHASE 1 CLOSED):** **93 QA-passed images registered and wired into every
template; 7 retired; 0 pending. Production build green (3,483 pages).** Four QA rounds, 169 API
images, ≈₹2,300 all-in, 55% yield. Local-only — not committed. See **§7**.
**Supersedes** the phase table in [`README.md`](./README.md) §8. The README's
*doctrine* (hyper-realism, generic-not-specific, safety guardrails, naming) still stands
and is the authority for **what** we generate. This file governs **how much, how small,
in what order, and how it gets wired**.

Verified 22 Aug 2026.

---

## 0. Findings from the review

| # | Finding | Action |
|---|---|---|
| 1 | **Zero images render today.** No `next/image`, no `<img>` anywhere in `app/` or `components/`. `public/` is 4 KB. | Whole programme is greenfield — no migration debt. |
| 2 | `next.config.js` `images` is already correct (AVIF+WebP, 1-yr `minimumCacheTTL`, sane `deviceSizes`). CSP `img-src 'self' data: https: blob:` already permits self-hosted images. | No config change needed. |
| 3 | **`generate.mjs` targeted a legacy model.** Default was `gemini-2.5-flash-image`; Google now explicitly recommends migrating off it. **Imagen 4 was retired 17 Aug 2026** — 5 days before this review. | **Fixed** → default is now `gemini-3-pro-image` (Nano Banana Pro). |
| 4 | **Aspect ratio + resolution were prompt-text-only**, so the API defaulted to 1K and framing was a coin-flip. | **Fixed** → `config.imageConfig.{aspectRatio,imageSize}` now sent explicitly (`16:9`, `2K`). |
| 5 | `optimize.mjs` emitted one width only — a 400 px card would have downloaded a full 1600 px hero. | **Fixed** → emits a `-sm` 560 w card variant, and **fails the run** on any over-budget file. |
| 6 | Nothing stopped multi-MB source PNGs entering git. | **Fixed** → `.gitignore` now excludes `public/images/**/*.png` + `image-pipeline/raw/`. |
| 7 | **VedKosh is not the model to copy for weight.** It ships 167 images at **38 MB — 227 KB average**, all JPG/PNG, no WebP/AVIF; the ten largest are 545–1362 KB. | GSB targets **~35 KB heroes / ~10 KB cards** — roughly **7× lighter per image**, at higher resolution. |

> **Honest note on the brief:** you asked for "what we did for VedKosh." The data says
> VedKosh's images are *heavy*, not optimised. Copying that approach would work against
> the "very very very less size" requirement. The plan below deliberately beats it.

---

## 1. The size strategy (the core requirement)

Two different budgets. Only the first one affects your users.

### 1a. Per-page payload — the number that matters
A visitor on a guide page downloads **one hero**, plus card thumbs only if they scroll.

| Element | Format | Width | Budget | Loading |
|---|---|---|---|---|
| Page hero (LCP) | AVIF | 1400 | **≤ 45 KB** | `priority`, preloaded |
| Card / grid thumb | AVIF | 560 | **≤ 14 KB** | `loading="lazy"` |
| Fallback (no-AVIF, ~4% of traffic) | WebP | 1400 / 560 | ≤ 85 / ≤ 24 KB | via `<picture>` |

→ **Above the fold: ~35–45 KB. Fully-scrolled page: ~95 KB.**
For comparison, one VedKosh festival JPG is 570 KB.

### 1b. Repository weight
Four variants per image ≈ **128 KB on disk**. Source PNGs never enter git.

| Milestone | Images | Repo add |
|---|---|---|
| Phase 1 | 100 | ~13 MB |
| Phase 2 | 180 | ~23 MB |
| Phase 3 | 280 | ~36 MB |
| Phase 4 (final) | **360** | **~46 MB** |

*Lever if this ever feels heavy:* drop the `-sm.webp` variant (−8 MB at full library);
no-AVIF browsers fall back to the hero WebP for cards.

### 1c. Why 360 images — not 1000
The README's Phase-4 target of "1000+" is wrong for this site, and dropping it is a
deliberate decision. GSB has **3,480 pages but only ~15 page archetypes** across 9
regions and ~40 fields. Coverage comes from a **fallback resolver**, not from a
1:1 page↔image mapping. Past ~360, extra images buy *variety*, not *coverage* — while
costing repo weight linearly. 360 gives every page a relevant image plus enough
rotation that large clusters don't visibly repeat.

**Coverage is a resolver, not a count:**
```
imageFor(unit) =  explicit override
               →  field / topic-group image
               →  journey-concept image
               →  region image
               →  site default          // never a broken or missing image
```

---

## 2. Phase plan

### Phase 0 — Foundation ✅ DONE 12 Sep 2026 (no images; ship-safe on its own)
1. ✅ `lib/images.ts` — resolver with the fallback chain + slug-seeded rotation. **Proven a
   true leaf at compiler level** (Next's own SWC: one surviving import; 0 client chunks
   reference image code; layout chunk unchanged). `Object.hasOwn` guard on lookups.
2. ✅ `lib/images.generated.ts` + `image-pipeline/build-registry.mjs` — the image map is
   **derived from disk**, never hand-edited; a broken path is impossible.
3. ✅ `components/ContentImage.tsx` — `<picture>` AVIF→WebP, registry-driven `srcSet`
   widths, explicit dims (CLS 0), lazy/`priority` (+ `<head>` preload for the LCP hero),
   and the **mandatory visible label** linking to `/disclaimer#ai-generated-images`.
   A grid may suppress per-image captions only by naming its shared caption's DOM id.
4. ✅ **Owner decision 12 Sep: AI archetypes everywhere — no real photographs.** The
   `kind:'photo'` path was removed entirely (it would have needed licence allowlists,
   CC BY-SA attribution, JPEG ingestion and subject-privacy review that did not exist).
   College pages use `collegeImage()` — region + slug rotation only, **no code path can
   select an image that "matches" a real campus** — rendered with `representative`, whose
   label reads *"AI-generated image — not a photograph of this institution"*.
5. ✅ `scripts/check-images.ts` runs as **`prebuild`** on every build: registry ⇄ disk ⇄
   manifest consistency, and a **Rule A guard** that fails the build if any alt or filename
   names a real institution (0 false positives across the 100 prompts; blocks Bombay/
   Harvard/Tokyo/Cambridge/Stanford).
6. ✅ `optimize.mjs` now forces a centred **16:9 cover-crop** on every variant — the API's
   `aspectRatio` is silently ignored in known bugs, and a 4:3 source must not become a
   full-height hero.
7. ✅ `next.config.js` — `Cache-Control: public, max-age=31536000, immutable` for
   `/images/*` (separate block; security headers/CSP untouched).
8. ✅ **CWV baseline captured** → `image-pipeline/baseline/cwv-before-images.json`:
   CLS **0.000** on home/guide/college/region — the line images must hold. (Home LCP is
   already 3.0 s / perf 76 vs ~1.1 s / 97–98 elsewhere — pre-existing, out of scope.)
9. Wired: **guide** + **college** templates (render nothing until images exist —
   verified 0 `<figure>` across 3,483 prerendered pages). Region hub / topic hub / exam
   surfaces wire in Phase 1 once the library exists.

### Phase 1 — Core 100 · *prompts already written* · NEXT
Gate first: `preflight.mjs` → `preflight.mjs --image` → `bakeoff.mjs` (Gemini-only, 5 hardest
prompts, ≈₹60 — a **prompt smoke test**, judged full-screen). Then `generate.mjs --group A…E`
→ `optimize.mjs` → `build-registry.mjs` → build (prebuild guard) → CWV re-measure → QA → log.
Groups A–E in `manifest.json`: regions 27 · fields 25 · exams 10 · journey 20 · site 18.
**Every page archetype gets a real image on day one.** Cost ≈ **$13.40 / ₹1,180**.

### Phase 2 — +80 → 180 · depth for the resolver's middle tiers
36 region×category heroes · 20 topic-group headers · 12 college archetypes
(region × tech/medical/law/business) · 12 more journey concepts. ≈ **$11**.

### Phase 3 — +100 → 280 · variety for the largest clusters
Region-specific field variants for the four biggest catalogues
(ESEA 483 · India 427 · USA 350 · UK-Ireland 250) · sub-fields · track headers. ≈ **$13**.

### Phase 4 — +80 → 360 · polish and gap-fill
Rotation pool for the highest-traffic clusters · 1:1 crops where grids need them ·
gap-fill driven by Search Console + analytics. ≈ **$11**.

**Total programme cost ≈ $48** at Nano Banana Pro 2K list price (≈ $24 via Batch API).

### Per-phase gate (every phase, no exceptions)
```
generate → optimize (budget check must exit 0) → independent QA → wire → CWV re-measure → log
```
- **Independent QA** is required by `content-policy.md` §7 — a *separate pass* from the
  one that generated. Checklist: no people/faces (§9, COPPA — our audience includes
  minors) · no logos/signage/trademarks · no religious content (Rule C) · no
  flags-as-hero/political/military content (Rule D, extra care for Middle East, Russia &
  CIS, China/HK/Taiwan) · no stereotype or "poverty vs prestige" framing (Rule E) ·
  no fake replica of a named real campus (Rule A) · no baked-in text.
- **Alt text is honest and descriptive** — "Modern university engineering laboratory",
  never "IIT Bombay's lab". Pre-written for all 100 in `manifest.json`.
- **Log the batch** in `.claude/rules/content-audit-log.md`.

---

## 3. Gemini setup (paid API — no visible watermark)

### Watermark position — confirmed 22 Aug 2026
- The **visible ✦ sparkle is a consumer-app branding element. The API does not add it.**
  Paid API access gives clean images — exactly what you asked for, legitimately.
- Every image still carries **invisible SynthID + C2PA provenance metadata**. This is
  imperceptible and does not affect the look. **We will not strip it** — that would mean
  defeating a provenance signal, and it is unnecessary for your goal.

### Steps
1. **aistudio.google.com → "Get API key"**, then **enable billing** on the linked Google
   Cloud project. Billing is what unlocks the **paid tier**, and it matters:
   Google **does not** use paid-tier prompts or outputs to train models, and there is
   **no human review** of them. Free tier does both.
2. `npm i @google/genai` and `npm i -D sharp`
3. `export GEMINI_API_KEY="…"` — put it in your shell profile.
   **Never** commit it, never prefix it `NEXT_PUBLIC_`, never add it to Vercel. This is a
   local build-time tool; the key must not reach the browser or the repo.
4. **Smoke-test one image before spending anything meaningful:**
   ```
   node image-pipeline/generate.mjs --only 1 --force
   ```
   Inspect it full-screen. Does it read as a real photograph? If not, re-roll or adjust
   the prompt *before* generating 100.
5. Full run, then optimise:
   ```
   node image-pipeline/generate.mjs --group A
   node image-pipeline/optimize.mjs
   ```

### Model choice (prices per image, verified 22 Aug 2026)
| Model ID | Name | 1K | 2K | Use |
|---|---|---|---|---|
| **`gemini-3-pro-image`** | Nano Banana Pro | $0.134 | $0.134 | **Default.** Best realism; honours `imageSize`. |
| `gemini-3.1-flash-image` | Nano Banana 2 | $0.067 | $0.101 | Cheaper. ⚠️ Reported to silently ignore `imageSize` (returns ~1K). |
| `gemini-3.1-flash-lite-image` | NB2 Lite | $0.0336 | — | Drafts / composition tests only. |
| ~~`gemini-2.5-flash-image`~~ | legacy | — | — | Google recommends migrating off. |
| ~~Imagen 4~~ | — | — | — | **Retired 17 Aug 2026.** |

Batch API = **50% off** if a later phase runs large.

**Ownership:** Google does not claim ownership of generated content, and commercial use
is permitted under the API terms — so shipping these on GSB is fine.

---

## 4. Alternatives worth considering

**DECIDED 12 Sep 2026: Gemini Nano Banana Pro, single provider.** Not because "Google has
more real-world data" (neither model looks up real buildings, and we generate archetypes
anyway) but because: our 45 KB AVIF delivery erases the arena-level micro-texture gap; our
scenes contain no people (where the gap is smallest); it is mature (GPT Image 2.5 is days
old); zero onboarding friction; Batch API 50% off; pipeline ready. Account: the owner's
paid AI Studio project (Tier 1 Prepay — see the private memory notes for its id), reusable
for other projects' one-time image runs — never the free-tier production account. Key lives
only in gitignored `image-pipeline/.env`. But the README's own warning is that
*"a previous project's AI images looked obviously AI; that must not happen here."*
Pick the winner by evidence, not by default:

> **Run a bake-off before Phase 1.** The five prompts were chosen, then **adversarially
> reviewed — both reviewers returned `sound=false`** and both swaps were applied:
> **#13** continental courtyard (exterior; repeating colonnade + fountain) · **#29** CS lab
> (key-grid melt, screen-text hallucination) · **#54** blank bubble sheet (glyph
> hallucination, the brutal one) · **#66** passport flat-lay (Group D journey tier, which
> had zero coverage) · **#83** misty dawn avenue (homepage LCP hero — highest blast radius).
> One reviewer caught a **load-bearing factual error**: the claim that no med-risk region
> *exterior* existed was false (#13 is one), so the exterior slot had been filled with a
> weaker low-risk pick. ~15 images, **≈ $2**.

**Two run-wide confounds the reviewers flagged, worth knowing when you read the sheet:**
1. **The shared style tail is moderation bait.** All 100 prompts end with the same negative
   list — *"no weapons, alcohol… no religious symbols… no flags, political, government,
   military…"*. Some classifiers score those tokens as topic *mentions*. A refusal may be
   the tail's fault, not the scene's. It also applies equally to all five, so it cannot be
   isolated from the results.
2. **n=1 per model, no seed control.** A single frame cannot separate "this model
   systematically leaks X" from one unlucky roll. Treat a lone oddity as a signal to
   re-roll, not as a verdict.

| Option | Exact id / call | Cost at 16:9 2K | Verified gotchas |
|---|---|---|---|
| **Nano Banana Pro** *(baseline)* | `gemini-3-pro-image` (GA; `-preview` was shut down 25 Jun 2026) | **$0.134** | `imageSize`/`aspectRatio` are **silently ignored** in open SDK bugs — measure what came back. `2K` must be uppercase. |
| **FLUX 2 Pro** | `fal-ai/flux-2-pro` — **not** `flux-2/pro` | **~$0.06** (metered per MP) | No `aspect_ratio` param. The `landscape_16_9` preset is only ~1 MP — pass `image_size:{width:2048,height:1152}`. Sides must be /16, area ≤ 4,194,304. `safety_tolerance` is a **string**. Returns a URL, not bytes. |
| **GPT Image 2** | `gpt-image-2` via `images.generate` | ~$0.19 (token-billed) | **`1536x1024` is 3:2, not 16:9** — using it silently skews the comparison. Never send `response_format`. Org verification is the #1 first-run 403. |
| Seedream 4.5 | — | — | Strong photoreal competitor; not wired. |
| Ideogram / Recraft | — | — | Text-in-image and SVG tools. **Not our need** — we bake *no* text into images. |

> FLUX 3 exists (Early Access, 23 Jul 2026) but every FLUX 3 endpoint on fal is **video**.
> FLUX.2 [pro] is still the current top photoreal FLUX still-image model.

A mixed library is fine as long as the **style tail stays identical** across models, so
the set still reads as one photographer's work.

---

## 5. Risks & open items

1. **LCP regression.** Adding a hero to 2,701 guide pages makes it the LCP element. This
   is why Phase 0 measures a baseline first and the budget is enforced in code. Hero must
   be `priority` + preloaded; everything else lazy.
2. **AdSense Auto ads** may place a unit adjacent to a hero. Content-first rule (§13.2):
   verify ads never crowd or displace the image after Phase 1 ships.
3. **AI disclosure — SHIPPED to `/disclaimer` 22 Aug 2026 (approved).** Independent QA
   returned **FAIL** on my first draft and was right twice over:
   - **Never call these "illustrations."** The word tells a reader the image is visibly
     non-photographic; our entire doctrine is the opposite. The live text now leads
     *"Every image on this site is generated by AI and made to look like a real
     photograph. None of them is one."*
   - **"Contains no real identifiable people" is an unkeepable absolute** over a library
     that will grow to ~360 generated images. Replaced with the verifiable process claim:
     *"We design and review these images to avoid portraying real people."*
   - Scope broadened from institutions to **places** (Phase 1 ships city/skyline/landscape
     images), the source claim de-absolutised to match the `Accuracy & sources` hedge two
     sections above, and `LAST_UPDATED` bumped — shipping a new section under a stale date
     is the same honesty failure §5 forbids in the other direction.
4. **OPEN OBLIGATION — a disclaimer line alone is not sufficient.** Consumer/advertising
   law across our audience regimes turns on the impression created *on the page where it
   is created*, not on a link in the footer. Before any image ships, `ContentImage` must
   render a small persistent **"AI-generated image"** label on image-bearing surfaces.
   This is a Phase 0 acceptance criterion, not a nice-to-have.
   *Deliberate scope decision, logged:* cite no statute (EU AI Act Art. 50, MeitY
   synthetic-media rules). Our images contain no real people or places, so they are not
   deepfakes in that sense, and naming laws we have not had reviewed would overclaim.
   Revisit only if the site ever depicts real people or real named places.
5. **All three decisions approved 22 Aug 2026** — ~360 cap, bake-off, disclosure.
   Remaining blocker: `GEMINI_API_KEY` is not set, so no image has been generated yet.

---

## 7. Phase 1 — what actually happened (15 Sep 2026)

### Generation
- Gemini `gemini-3-pro-image`, 2K, 16:9 — **100/100 generated, 0 API failures, 0 retries**, ~33 s
  each. Every frame came back at the requested 2752×1536 (the harness measures it; the
  silently-ignored-`imageSize` bug never triggered on this model).
- Optimisation needed a **two-tier budget** (then a third rounding tier): 73% of scenes hit the
  ≤45 KB AVIF target at q46; the rest are high-entropy exteriors (foliage on brick, cobbles,
  autumn leaves) that no quality setting brings under 45 KB without wrecking the texture that
  makes them read as real. Those step to q40 (ceiling 100 KB); a rare rounding case steps to
  q34. **Shipped: 400 files, 12.6 MB, avg 126 KB per image across 4 variants.**
- Source PNGs (~3 MB each) live in `image-pipeline/raw/` (gitignored). Never regenerate to
  re-optimise — re-encode from raw.

### Independent QA round 1 — 100 images, 10 reviewers + 48 adversarial verifiers
| Verdict | Count |
|---|---|
| PASS | 14 |
| PASS_WITH_NOTE | 38 |
| Rescued on second look | 3 |
| **Confirmed RE_ROLL** | **45** |

**A 45% rejection rate, and the verifiers agreed with the reviewers 41-to-2** — real, not
over-flagging. Every rejection was a genuine constitutional hit, found forensically: a blurred
back-lit figure on a far walkway (§9), an ISO emergency-exit pictogram above a door (signage),
reading-room tables overlapping two-deep, a highlighter printing a real brand name, shelf-end
cards with pseudo-text, a training manikin under a blanket, an invented lab instrument over an
open flame.

**Two causes dominate** — and both are about the model, not the prompts:
1. **Brand marks and pseudo-text on products** (29 of 45): pens, highlighters, book spines,
   instrument labels, screen UI, bezels. The model *wants* to letter manufactured objects.
2. **Realism failures on technical equipment** (34 of 45): melted control yokes, invented
   instruments, fused furniture, archviz-render sheen on interiors.

Scenes that are empty architecture and landscape passed at a far higher rate than scenes
that are close-ups of equipment or products. **Lesson for Phases 2–4: prefer wide, calm,
object-light compositions; treat any close-up of manufactured objects as high-risk.**

### What changed as a result
- `image-pipeline/reroll.mjs` — regenerates a QA-rejected set with each verifier's specific
  fix **plus a class-level guard** appended to the prompt ("every manufactured object
  unbranded and unlabelled … screens off … no figures, mannequins, silhouettes, anatomical
  illustrations or posters depicting people"), stamps `manifest.json` (`rerolled[]`) for the
  audit trail, then re-optimises and re-registers only those images.
- **12 alt texts corrected** on *passing* images where the caption over-claimed (Rule A
  applies to captions too) — stamped `altCorrected[]` in the manifest.
- `optimize.mjs` gained the two-tier + rounding-tier budget described above and exits
  non-zero over the hard ceiling; `reroll.mjs` archives sources before stopping on that.

### Cost
Round 1: 100 × $0.134 = $13.40. Round 2: 45 × $0.134 = $6.03. **≈ $19.50 ≈ ₹1,640** of the
₹2,500 prepay — above the $13.40 first quoted because a 45% re-roll rate was not priced in.
Any round-3 residue is priced at ~$0.13 each.

### Core Web Vitals — no regression
Median of 3 Lighthouse desktop runs, `next start`, after one warm-up: home 98 / guide 98 /
college 98 / region 97; LCP ≤ 1.23 s everywhere; CLS 0.000. Identical to the zero-image
baseline. (A single cold first capture showed guide LCP 3.98 s — an artefact; superseded.)

### Rounds 2–4 (same day)
- **Round 2** — 45 re-rolls with verifier fixes + class guard → 28 pass, 17 fail (verifiers
  17-to-0). Round-1 defect gone in 39/45; the same *object classes* failed on fresh draws.
- **Round 3** — 16 re-rolls, 12 with the **scene rewritten** to remove the failing object
  (closed laptop lids, no keyboard in frame, wide lab instead of glassware close-up, sealed
  booklets instead of a bubble grid, a window and contrail instead of a globe). 7 pass, 10 fail.
  A new class appeared — **baked-in film-scan borders** — traced to the style tail's "subtle
  lens vignette"; tail amended for all prompts. #1 salvaged by cropping a card frame (₹0).
- **Retired (3):** #9, #85, #92 — dense-bookshelf interiors, three independent failures each.
  Model ceiling. Revisit in Phase 2 with an exterior or single-shelf composition.
- **Round 4 — blocked.** 6 rewritten (#27 #30 #59 #61 #74 #88) + #76 pixel-salvaged and
  pending re-check. `node image-pipeline/reroll-resume.mjs 27,30,59,61,74,88` after a top-up,
  then a QA workflow on those 7, then `qa-stamp.mjs`.

### The structural guard that came out of this
`build-registry.mjs` includes **only `qa.status === 'pass'`** images; regenerated images are
`pending` by default; `qa-stamp.mjs` promotes them. The registry — and therefore the site —
is the QA-passed set *by construction*. Generation can leave anything it likes on disk.

### Honest cost accounting
| | |
|---|---|
| Prepay | ₹2,500 |
| Usable after 18% GST | ~₹2,119 |
| Images billed | 163 (1 preflight + 5 smoke + 96 + 45 + 16) |
| **Effective per image** | **₹13.72** (~22% above the $0.134 list — reasoning tokens) |
| Yield | 90 shippable from 163 generated = **55%** first-pass-through-QA |
| To finish the last 7 | ~₹110 incl. GST → a **₹500 top-up** covers it with a round-5 residue |

**Lesson for Phase 2 budgeting:** price at **₹14/image × 1.8** (the observed generate-to-pass
ratio), not the list price. And prefer wide, calm, object-light scenes — every close-up of a
manufactured object is a coin flip.

### The honest library-size answer (15 Sep 2026, measured)
Every page already gets an image. The only question is repetition, and the metric that matters is
*a visitor seeing the same hero twice in one visit* (typically 3–5 guides in one category):

| Folder | Images | Pages served | Repeat chance in a 5-page visit |
|---|---|---|---|
| common/journey | 18 | 1,737 | ~45% → 36 images ≈ 25% |
| common/exams | 8 | 332 | high → 16 |
| common/fields | 24 | 730 | fine |
| regions (each) | 2–3 | 42–85 | topic hubs now blend `site/hero` → 12–14 candidates |

- **97 — enough to ship.** Most visitors read one guide from search and leave.
- **~140 — the balanced ceiling** (+45 shippable ≈ 80 generations ≈ ₹1,500 incl. GST). Beyond it,
  images buy variety nobody encounters.
- **~360 / "1000+" — withdrawn.** Over-estimated before there was data.
- **Decide Phase 2 from analytics** (pages-per-session on guide pages), not from this model.

### Round 4 + close (same day)
6 re-rolls after the owner's ₹2,000 top-up → #27 and #74 pass; #76 passes after cropping a
baked-in edge strip (its sky retouch was independently verified); **4 retired** (#30 #59 #61 #88 —
four rolls each, a different defect every time). **Final: 93 / 100, 7 retired.**

Two lessons written in blood:
- **Pixel salvage only on flat, unstructured regions** (open sky worked; a curved bezel, a mixed
  wall, and a blurred screen all failed visibly). On anything else, regenerate or retire.
- **Some compositions are simply in the model's failure zone** — dense bookshelves, webcams
  (always a real branded product), desk still-lifes with instruments. Four different defects in
  four rolls is the signal. Retire, don't keep buying coin flips.

# GlobalStudyBoard — Image Programme: Phased Plan

**Status:** planning complete, nothing generated yet (`public/images/` is empty).
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

### Phase 0 — Foundation (no images; ship-safe on its own)
1. `lib/images.ts` — the resolver + a **plain string map**.
   ⚠️ Must **not** import `GUIDES`/`cmi`/`tracks`. (See the client-bundle guard: a
   `Breadcrumbs → cmi → GUIDES` import once shipped a 15.7 MB layout chunk.)
2. `components/ContentImage.tsx` — `<picture>` (AVIF → WebP), **required** `alt`,
   explicit `width`/`height` (zero CLS), `lazy` by default, `priority` opt-in for the hero.
   Static `public/` files + `<picture>` = **no Vercel image-transformation billing**.
3. **Record a Core Web Vitals baseline** (LCP/CLS on home, a guide, a region hub)
   *before* any image ships, so Phase 1's impact is measurable.
4. Decide hero-bearing surfaces: home, region hub, region-category, topic hub, guide,
   exam, college. **No hero** on legal/static pages; listings get card thumbs only.

### Phase 1 — Core 100 · *prompts already written*
Groups A–E in `manifest.json`: regions 27 · fields 25 · exams 10 · journey 20 · site 18.
**Every page archetype gets a real image on day one.** Cost ≈ **$13.40**.

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

Recommended primary is **Nano Banana Pro** — cheap, no visible watermark, strong prompt
adherence, and the pipeline is already built for it. But the README's own warning is that
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

# GlobalStudyBoard — Image Pipeline & Strategy

A scalable, compliance-safe system for adding photography to the site.
Phase 1 = **100 images**, then 500, then 1000+ as content grows.

> This is a **planning/ops doc**, not build code. Nothing here ships until images
> are generated, optimised, placed in `public/images/…`, and wired via `next/image`.
> The 100 Phase-1 prompts live in [`phase-1-prompts.md`](./phase-1-prompts.md).

---

## ★ Hyper-Realism Doctrine (the #1 requirement)

The images must look like **genuine professional photographs — indistinguishable from
real** — to give the site a fresh, premium, real feel. A previous project's AI images
looked obviously "AI"; that must **not** happen here. Every prompt is engineered for it:
- **Real-photography language, not AI-art language** — a real camera + prime lens, natural
  physically-plausible light, true materials and micro-texture, one authentic imperfection
  (grain, a soft vignette, real optical bokeh, accurate shadows/reflections).
- **Explicit anti-AI negatives baked into every prompt** — *not an illustration, not a 3D
  render, not CGI, no plastic/waxy surfaces, no over-smoothing, no HDR halos, no fake
  bokeh, no warped geometry, no watermark, no text artifacts.*
- **One consistent "style tail"** appended to all 100 so the whole library reads as one
  photographer's body of work.
- **Every prompt is adversarially reviewed** for "will this look AI?" and rewritten before
  it reaches you (that's what the prompt-authoring workflow does).

---

## 0. The one decision that keeps us safe: **generic, not specific**

We are an accuracy-first, Tier-1-sourced site (`content-policy.md` Rule A).
So the images follow a hard rule:

> **We illustrate the _feeling and context_ of a place / field / step — never a
> fake replica of a specific, named real university, campus, or landmark.**

An AI-generated "IIT Bombay" or "Harvard Yard" that isn't the real building would:
- **misrepresent** a hard fact (breaks Rule A — authenticity),
- risk **trademark / trade-dress / "passing off"** on a real institution's identity,
- and look wrong to any student who's seen the real place.

A leafy modern-campus quad at golden hour, a gleaming engineering lab, an exam hall
of empty desks — those convey "this is about studying engineering in the USA" just
as well, are **reusable across hundreds of pages**, and carry **zero** legal or
accuracy risk. This is strictly better for the goal ("help the user feel the
content") *and* for GSB's safety.

### 100% AI-generated — no stock, no Wikimedia (owner decision)
Every image on the site is **AI-generated in Google Gemini**. We do **not** use
Wikimedia Commons or any real/stock photography (the `upload.wikimedia.org` whitelist in
`next.config.js` is legacy — leave it, but we don't use it).

### Real named colleges — still archetypal, never a fake replica
For the 118 real college pages we also use an **AI, hyper-real, region/type-appropriate**
image — a gleaming modern lab, an ivy-brick quad — that **feels** real but is **not a
depiction of that specific named campus**. This keeps the college layer:
- **hyper-real** (the whole point — see the Hyper-Realism Doctrine below),
- **safe** (no trademark/trade-dress on a real institution's identity),
- **honest** (an archetypal campus never falsely claims to *be* the real building).

So the college page shows a beautiful, believable, on-brand campus photo-style image; the
alt text and caption describe it honestly (e.g. "a modern university engineering lab"),
never "IIT Bombay's lab".

---

## 1. Folder architecture (scales to 1000+)

```
public/images/
├── regions/                     # region-specific atmosphere & campus feel
│   ├── india/
│   ├── usa/
│   ├── canada/
│   ├── uk-ireland/
│   ├── europe/
│   ├── australia-nz/
│   ├── russia/
│   ├── middle-east/
│   └── east-southeast-asia/
│       ├── hero/                # region hub + region-category page headers
│       ├── campus/              # archetypal campus exteriors for that region
│       ├── interior/            # libraries, lecture halls, study commons
│       └── city/                # generic skyline / landscape atmosphere
│
├── common/                      # the shared, region-agnostic layer
│   ├── fields/                  # engineering, medicine, law, business, CS, arts…
│   ├── exams/                   # global test concepts (IELTS/TOEFL/GRE… — no branding)
│   └── journey/                 # application, SOP, LOR, visa, scholarships, dorm, packing…
│
└── site/                        # site chrome / decorative
    ├── hero/                    # homepage + topic-hub headers
    ├── decor/                   # dividers, textures, backgrounds
    └── placeholder/             # blur/fallback
```

- The `common/` folder is exactly the "one common folder for common content" you asked
  for — global exams, fields, and the application journey that are identical for every
  destination. A single `common/fields/engineering-lab.webp` decorates **dozens** of
  engineering guides across every region → that's how 100 images cover thousands of pages.
- Phase 1 can keep each region folder shallow (a few files); the `hero/campus/interior/city`
  sub-split is the growth pattern for Phase 2+.

---

## 2. Naming convention

`{descriptive-subject}.webp` — all **lowercase, hyphenated**, no spaces, **no dates**
(evergreen, mirrors our SEO slug rule — a URL/filename must never need to change yearly).

Examples:
- `regions/india/campus-quad-golden-hour.webp`
- `regions/middle-east/hero/desert-campus-dusk.webp`
- `common/fields/engineering-makerspace.webp`
- `common/journey/student-visa-documents.webp`
- `common/exams/exam-hall-empty-desks.webp`
- `site/hero/homepage-campus-avenue-dawn.webp`

No width suffix is needed — `next/image` generates responsive variants automatically.

---

## 3. Safety & compliance guardrails (baked into every prompt)

Mapped to the Content Constitution so images never create the problems the text avoids:

| Rule | Guardrail in every image |
|------|--------------------------|
| **A — Authentic** | No replica of a specific real building/campus/landmark presented as a named institution. Archetypes only. |
| **C — Zero religion** | No religious symbols, places of worship, religious dress, or religious text — anywhere, any region. |
| **D — No politics/geopolitics** | No flags-as-hero, political/government/military content, maps, or borders. Extra care for §4.D regions (Middle East, Russia/CIS, China/HK/Taiwan): campus/library/landscape only. |
| **E — Respect & inclusion** | Every region shown as modern, clean, dignified, aspirational. No stereotype, caricature, or "poverty vs prestige" contrast. |
| **§9 — Privacy / COPPA (minors)** | **No people / no faces / no identifiable persons.** Wholesome, safe-for-all-ages; no alcohol, weapons, or anything unsafe. |
| **Trademark / IP** | No logos, crests, brand marks, jerseys, or readable signage. |
| **Quality** | No baked-in text/titles (AI text garbles + it's added in the UI, keeping images reusable). |

**People:** default is **zero humans.** If a sense of scale is truly unavoidable, at most
one or two **small, distant, out-of-focus, back-turned** silhouettes — never a
recognizable face, never a foreground subject. Prefer empty spaces (early-morning /
after-hours campus).

Your exact ask — *"must not go against any country, region, people, culture or religion,
and must not cause any issue to GlobalStudyBoard"* — is enforced by rows C, D, E and the
Trademark row above.

---

## 4. Technical specs & optimisation

**Generate** at max quality (PNG or high-q JPG), **16:9**, high-res (≥1600×900).

**Then optimise** to WebP (source of truth) before placing in `public/`. `next/image`
will further emit AVIF/WebP responsive sizes at request time, but a pre-optimised WebP
keeps the static asset small.

```bash
# Single file (needs: brew install webp)
cwebp -q 80 -resize 1600 0 input.png -o output.webp

# Batch a folder → WebP at ~1600px wide, q80
for f in raw/*.png; do
  cwebp -q 80 -resize 1600 0 "$f" -o "public/images/…/$(basename "${f%.*}").webp"
done
```

Targets: hero WebP **< 200–250 KB**, card thumbs **< 80 KB**. AVIF is even smaller if
you also pre-generate it. Prefer 16:9 for heroes; a few 1:1 crops help card grids.

**Performance rules (non-negotiable — see the client-bundle memory):**
- Images live in `public/` and are served **statically** (Vercel CDN + our 1-yr cache).
- Render **only** via `next/image` with `loading="lazy"` (except the LCP hero, which
  gets `priority`). Set `width`/`height` (or `fill` + aspect box) to prevent layout shift.
- **Never** `import` an image into a JS module or a global client component — that's how
  bundles balloon. Reference by string path (`/images/common/fields/engineering.webp`).

---

## 5. Alt text (required, honest)

Every image needs **descriptive, honest** alt text — describe what's *shown*, not a
claim we can't back. Accessibility (§12.3 / WCAG) **and** Rule A require it.

- ✅ `"Modern university engineering laboratory with robotics workbenches."`
- ❌ `"IIT Bombay engineering lab"` (it isn't — that would misrepresent).

Alt text for all 100 is pre-written in `phase-1-prompts.md`.

---

## 6. Wiring plan (Phase 1.5 — after images exist; not this task)

So 100 images decorate thousands of pages with a **fallback chain**, add later:

1. Optional `heroImage?: string` on `Guide` / `College` / `Topic` (a path, or a small
   enum key resolved to a path).
2. A resolver `imageFor(unit)` that picks the best available image with graceful
   fallback: **explicit `heroImage` → field image → region image → site default.**
   A guide with no image still shows a relevant one (its field's, or its region's).
3. A small `<ContentImage>` wrapper over `next/image` (lazy, aspect-boxed, alt required).

This means Phase 1's 100 images give **every page type** a sensible picture on day one,
long before any per-page curation.

---

## 7. Manifest & audit (fits our review culture)

Keep a manifest (JSON or the tables in `phase-1-prompts.md`) mapping
`filename → alt text → prompt used → source(AI/Wikimedia) → license`. Run a quick
independent review pass on a sample before shipping (same spirit as content QA):
no people/faces, no logos/text, no religious/political/military content, respectful,
on-palette. Log it in `content-audit-log.md` when the batch ships.

---

## 8. Phase plan

| Phase | Count | Coverage |
|-------|-------|----------|
| **1 (now)** | **100** | Every region (×3), all major fields (25), core exams (10), the application journey (20), site heroes (18). Covers every page *type*. → `phase-1-prompts.md` |
| 2 | +150 (→250) | Region sub-hub headers, more fields/sub-fields, more journey/decision concepts, card-thumb crops. |
| 3 | +250 (→500) | Per-track / per-topic-hub headers; region-specific field & city variants. |
| 4+ | →1000+ | Per-guide-cluster variety; seasonal/rotation variants; per-college archetypal AI images. |

Design the folders once (Section 1); every later phase just drops more files into the
same tree and reuses the master style prompt so the whole library stays visually coherent.

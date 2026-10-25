# GlobalStudyBoard image library

## Current policy — owner instruction, 23 October 2026

Prefer highly relevant, high quality **CC0/public-domain photographs**, verified
at the individual source file. Keep a reviewed AI illustration where a suitable
open photograph is unavailable. This replaces the previous AI-only decision;
Phase-1 prompts and old generation plans remain historical production records.
See [the current audit and plan](./IMAGE_REVIEW_2026-10-23.md).

“Free stock” is not evidence of public-domain status. This batch accepts CC0
files on Wikimedia Commons with checked source records. It excludes unclear
rights, unresolved license reviews, identifiable people, personal records,
prominent branding, religious/political content and weak subject matches.
Source licensing does not replace checking privacy, trademarks or other rights.

## One logical image, small responsive files

- `image-pipeline/manifest.json` holds image concepts, honest alt text, QA status,
  photo source/creator/license/evidence/review date and preparation/crop records.
- `lib/images.generated.ts` is a generated, committed, **server-only** registry.
  It contains only `qa.status: pass` assets. Never edit it manually.
- `lib/images.ts` resolves subjects, destinations and fallbacks for existing
  pages. University profiles use AI images until an exact-institution photo is
  explicitly verified; a real campus never substitutes for another university.
- `ContentImage` renders local static `<picture>` assets, true dimensions,
  responsive `srcset`, AVIF with WebP fallback, lazy loading and a priority LCP
  hero. There is no remote-image request or transformation charge.
- Photo captions identify the subject, creator, source, license and crop. AI
  images retain their on-image disclosure. The image policy is in
  `/disclaimer#images` (the old fragment remains an alias); the global footer
  disclaimer stays intact.

Published variants are a 16:9 hero (up to 1400px wide) and thumbnail (up to
560px), each AVIF + WebP. Do not upscale sources. The hero browser hint selects
only the needed variant. Byte targets and hard ceilings:

| Variant | Target | Hard ceiling |
|---|---:|---:|
| Hero AVIF | 45 KiB | 100 KiB |
| Hero WebP | 85 KiB | 180 KiB |
| Thumbnail AVIF | 14 KiB | 30 KiB |
| Thumbnail WebP | 24 KiB | 45 KiB |

Originals, review screenshots and download caches belong in ignored
`image-pipeline/raw/`. Never place source PNG/JPEG files in `public/images/` or
commit them. Keep brand/app icons and code-generated social cards intact.

## Importing a photograph

1. Review the exact file and its license, source history, visual subject,
   location, privacy/IP concerns and crop. Record an original download URL,
   source-page URL, public creator credit, license/deed, evidence, review date
   and precise subject. Download a sharp source to ignored `raw/`.
2. Add a selection to `photo-selections.json` using an **existing logical key**.
   Supply `localSource`, accurate `alt`, photo `provenance`, and optional integer
   `crop: {left, top, width, height}` in auto-oriented source pixels. The
   documented `photoPreparation` in the manifest records the exact transform.
3. Run `node image-pipeline/prepare-photos.mjs`. It strips source metadata,
   applies the crop, encodes both sizes/formats and independently controls each
   format's byte budget. The recipe/source/crop hash creates a new
   `optimizedBase` URL. **Never overwrite an old published filename**: images
   are cached immutable for a year. The logical registry key remains stable.
4. New or changed photos stay **QA-pending**. A separate reviewer must inspect
   source evidence, original/prepared hero and thumbnail, subject fit, captions
   and affected page templates. Log the review in the content audit log.
   Do not run the historical `qa-stamp.mjs` to approve photos automatically.
5. After explicit independent approval, mark only reviewed records as passed,
   remove superseded optimized variants (Git retains them; local backups may
   stay under ignored `raw/`), then run:

   ```sh
   node image-pipeline/build-registry.mjs
   npm run images:check
   npm run lint
   npm run typecheck
   npm run cmi:validate
   npm run dup:check:strict
   npm run build
   ```

6. Review existing home, region, university, guide, exam, topic and image-policy
   templates at desktop, tablet and mobile widths, including retained AI
   disclosures. Report byte changes and every retained/rejected decision.
   Commit/push/deploy only on the owner's explicit instruction in that turn.

`prepare-photos.mjs` reproduces the checked-in batch from local source files;
these raw inputs are intentionally not distributed with the project. Source
URLs and SHA-256 digests remain in the manifest for provenance/recovery.

## Build guard

`scripts/check-images.ts` runs in `prebuild` without network or sharp. It blocks
stale/missing assets, unknown files, QA downgrades, stale alt/provenance,
unverified/unsupported photo metadata, unversioned photo paths, oversized
variants, wrong dimensions/ratios and AI captions claiming named institutions.
File bytes, manifest and generated registry must agree. The build guard
validates records and artifacts; independent source and visual review remains
necessary.

The older `generate.mjs`, `reroll*.mjs`, `optimize.mjs`, `qa-phase1-*` and
`phase-1-prompts.md` support the existing AI fallback library. Do not use them to
overwrite photo replacements. Any future AI illustration must remain a generic,
honestly labelled scene, never an invented depiction of a named real campus.

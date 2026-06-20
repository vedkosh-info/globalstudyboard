// ─────────────────────────────────────────────────────────────────────────────
// Content Master Index (CMI)
//
// The single source of truth that indexes + validates every content unit
// (college, exam, region) and feeds search, breadcrumbs, related-content blocks
// and the sitemap. See `.claude/rules/content-policy.md` §11.
//
// Inputs:  lib/colleges.ts, lib/admission-guides.ts, lib/regions.ts
// Outputs: CONTENT_INDEX (flat registry), validateContent(), breadcrumbsFor()
// ─────────────────────────────────────────────────────────────────────────────

import { COLLEGES } from './colleges';
import { ENTRANCE_EXAMS } from './admission-guides';
import { GUIDES } from './guides';
import { REGIONS, type RegionSlug } from './regions';
import { TOPICS, TOPIC_SLUGS, getTopicBySlug } from './topics';
import { guidesForTopic } from './topic-guides';
import { isRegionCategory, categoryLabel, regionCategoryPath } from './region-nav';

export type ContentType = 'college' | 'exam' | 'region' | 'guide';

/** A single indexed content unit — the atom search/breadcrumbs/sitemap consume. */
export interface ContentUnit {
  type: ContentType;
  /** Stable slug, unique within its type. */
  slug: string;
  /** Display title (college name / exam short name / region name). */
  title: string;
  /** Short disambiguating line (place, full exam name, etc.). */
  subtitle: string;
  /** Canonical bare-URL path (English). */
  url: string;
  /** Owning region, or 'global' for worldwide exams. */
  region: RegionSlug | 'global' | null;
  /** Lowercased searchable text blob. */
  keywords: string;
}

const REGION_SLUGS = new Set<string>(REGIONS.map((r) => r.slug));
const EXAM_SLUGS = new Set<string>(ENTRANCE_EXAMS.map((e) => e.slug));
const COLLEGE_IDS = new Set<string>(COLLEGES.map((c) => c.id));
const COLLEGE_SLUGS = new Set<string>(COLLEGES.map((c) => c.slug));

const regionName = (slug: string): string =>
  REGIONS.find((r) => r.slug === slug)?.displayName ?? slug;

// ─────────────────────────── Build the flat registry ────────────────────────

export function buildContentIndex(): ContentUnit[] {
  const colleges: ContentUnit[] = COLLEGES.map((c) => ({
    type: 'college',
    slug: c.slug,
    title: c.nameEn,
    subtitle: `${c.city}${c.state ? `, ${c.state}` : ''} · ${regionName(c.region)}`,
    url: `/colleges/${c.slug}`,
    region: c.region,
    keywords: [
      c.nameEn,
      c.city,
      c.state ?? '',
      regionName(c.region),
      c.country,
      ...c.courses,
      ...c.admissionExams,
    ]
      .join(' ')
      .toLowerCase(),
  }));

  const exams: ContentUnit[] = ENTRANCE_EXAMS.map((e) => ({
    type: 'exam',
    slug: e.slug,
    title: e.shortName,
    subtitle: e.fullName,
    url: `/exams/${e.slug}`,
    region: e.region,
    keywords: [e.shortName, e.fullName, e.conductingBody, e.domain, e.descriptionEn]
      .join(' ')
      .toLowerCase(),
  }));

  const regions: ContentUnit[] = REGIONS.map((r) => ({
    type: 'region',
    slug: r.slug,
    title: r.displayName,
    subtitle: `Study in ${r.displayName}`,
    url: `/regions/${r.slug}`,
    region: r.slug,
    keywords: [r.displayName, ...r.countries, r.primaryApplicationPlatform, ...r.popularQueries]
      .join(' ')
      .toLowerCase(),
  }));

  const guides: ContentUnit[] = GUIDES.map((g) => ({
    type: 'guide',
    slug: g.slug,
    title: g.titleEn,
    subtitle: g.descriptionEn,
    url: `/guides/${g.slug}`,
    region: g.region,
    keywords: [g.titleEn, g.descriptionEn, regionName(g.region), ...g.keywords]
      .join(' ')
      .toLowerCase(),
  }));

  return [...regions, ...exams, ...guides, ...colleges];
}

/** Precomputed registry — content is static, so this is built once per process. */
export const CONTENT_INDEX: ContentUnit[] = buildContentIndex();

// ─────────────────────────────── Validation ─────────────────────────────────

export interface CmiReport {
  errors: string[];
  warnings: string[];
  counts: { colleges: number; exams: number; regions: number; guides: number; topics: number; total: number };
}

const norm = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Validate the whole catalogue. Errors block shipping; warnings are advisory.
 * Enforces: unique slugs/ids, no duplicate entities, referential integrity,
 * required fields, and bilingual-fallback presence.
 */
export function validateContent(): CmiReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  // — Colleges: unique id + slug, no duplicate entity, required fields, region —
  const collegeSlugs = new Map<string, number>();
  const collegeIds = new Map<string, number>();
  const collegeEntities = new Map<string, string>();
  for (const c of COLLEGES) {
    collegeSlugs.set(c.slug, (collegeSlugs.get(c.slug) ?? 0) + 1);
    collegeIds.set(c.id, (collegeIds.get(c.id) ?? 0) + 1);

    const entityKey = `${norm(c.nameEn)}|${c.region}|${c.type}`;
    if (collegeEntities.has(entityKey)) {
      errors.push(
        `Duplicate college entity: "${c.nameEn}" (${c.region}/${c.type}) — slugs "${collegeEntities.get(
          entityKey,
        )}" and "${c.slug}". One canonical unit only.`,
      );
    } else {
      collegeEntities.set(entityKey, c.slug);
    }

    if (!c.slug) errors.push(`College "${c.nameEn}" is missing a slug.`);
    if (!c.nameEn) errors.push(`College id "${c.id}" is missing nameEn.`);
    if (!c.descriptionEn) errors.push(`College "${c.nameEn}" is missing descriptionEn.`);
    if (!REGION_SLUGS.has(c.region)) {
      errors.push(`College "${c.nameEn}" has unknown region "${c.region}".`);
    }
    for (const rs of c.regions ?? []) {
      if (!REGION_SLUGS.has(rs)) {
        errors.push(`College "${c.nameEn}" lists unknown region "${rs}" in regions[].`);
      }
    }
    if (c.admissionExams.length === 0) {
      warnings.push(`College "${c.nameEn}" lists no admissionExams.`);
    }
  }
  for (const [slug, n] of collegeSlugs) {
    if (n > 1) errors.push(`College slug "${slug}" is used ${n} times — slugs must be unique.`);
  }
  for (const [id, n] of collegeIds) {
    if (n > 1) errors.push(`College id "${id}" is used ${n} times — ids must be unique.`);
  }

  // — Exams: unique id + slug, no duplicate entity, region, college references —
  const examSlugs = new Map<string, number>();
  const examIds = new Map<string, number>();
  const examEntities = new Map<string, string>();
  for (const e of ENTRANCE_EXAMS) {
    examSlugs.set(e.slug, (examSlugs.get(e.slug) ?? 0) + 1);
    examIds.set(e.id, (examIds.get(e.id) ?? 0) + 1);

    const entityKey = `${norm(e.shortName)}|${e.region}`;
    if (examEntities.has(entityKey)) {
      errors.push(
        `Duplicate exam entity: "${e.shortName}" (${e.region}) — slugs "${examEntities.get(
          entityKey,
        )}" and "${e.slug}". One canonical unit only.`,
      );
    } else {
      examEntities.set(entityKey, e.slug);
    }

    if (!e.slug) errors.push(`Exam "${e.shortName}" is missing a slug.`);
    if (!e.descriptionEn) errors.push(`Exam "${e.shortName}" is missing descriptionEn.`);
    if (e.region !== 'global' && !REGION_SLUGS.has(e.region)) {
      errors.push(`Exam "${e.shortName}" has unknown region "${e.region}".`);
    }
    for (const rs of e.regions ?? []) {
      if (!REGION_SLUGS.has(rs)) {
        errors.push(`Exam "${e.shortName}" lists unknown region "${rs}" in regions[].`);
      }
    }
    for (const cid of e.collegesAccepting) {
      if (!COLLEGE_IDS.has(cid)) {
        errors.push(
          `Exam "${e.shortName}" references college id "${cid}" in collegesAccepting, which does not exist.`,
        );
      }
    }
  }
  for (const [slug, n] of examSlugs) {
    if (n > 1) errors.push(`Exam slug "${slug}" is used ${n} times — slugs must be unique.`);
  }
  for (const [id, n] of examIds) {
    if (n > 1) errors.push(`Exam id "${id}" is used ${n} times — ids must be unique.`);
  }

  // — Regions: unique slug, keyExamSlugs resolve to real exams —
  const regionSlugs = new Map<string, number>();
  for (const r of REGIONS) {
    regionSlugs.set(r.slug, (regionSlugs.get(r.slug) ?? 0) + 1);
    for (const exSlug of r.keyExamSlugs) {
      if (!EXAM_SLUGS.has(exSlug)) {
        errors.push(
          `Region "${r.displayName}" lists keyExamSlug "${exSlug}", which is not a real exam slug.`,
        );
      }
    }
  }
  for (const [slug, n] of regionSlugs) {
    if (n > 1) errors.push(`Region slug "${slug}" is used ${n} times — slugs must be unique.`);
  }

  // — Guides: unique slug, region, related references resolve to real units —
  const guideSlugs = new Map<string, number>();
  for (const g of GUIDES) {
    guideSlugs.set(g.slug, (guideSlugs.get(g.slug) ?? 0) + 1);

    if (!g.slug) errors.push(`Guide "${g.titleEn}" is missing a slug.`);
    if (!g.titleEn) errors.push(`Guide "${g.slug}" is missing titleEn.`);
    if (!g.descriptionEn) errors.push(`Guide "${g.titleEn}" is missing descriptionEn.`);
    if (g.sections.length === 0) errors.push(`Guide "${g.titleEn}" has no sections.`);
    if (!REGION_SLUGS.has(g.region)) {
      errors.push(`Guide "${g.titleEn}" has unknown region "${g.region}".`);
    }
    for (const rs of g.regions ?? []) {
      if (!REGION_SLUGS.has(rs)) {
        errors.push(`Guide "${g.titleEn}" lists unknown region "${rs}" in regions[].`);
      }
    }
    if (g.sources.length === 0) {
      warnings.push(`Guide "${g.titleEn}" lists no Tier-1 sources.`);
    }
    for (const exSlug of g.relatedExamSlugs) {
      if (!EXAM_SLUGS.has(exSlug)) {
        errors.push(`Guide "${g.titleEn}" references exam slug "${exSlug}", which does not exist.`);
      }
    }
    for (const cSlug of g.relatedCollegeSlugs) {
      if (!COLLEGE_SLUGS.has(cSlug)) {
        errors.push(`Guide "${g.titleEn}" references college slug "${cSlug}", which does not exist.`);
      }
    }
    for (const tag of g.tags ?? []) {
      if (!TOPIC_SLUGS.has(tag)) {
        errors.push(`Guide "${g.titleEn}" lists unknown topic tag "${tag}" — add it to lib/topics.ts or fix the slug.`);
      }
    }
  }
  for (const [slug, n] of guideSlugs) {
    if (n > 1) errors.push(`Guide slug "${slug}" is used ${n} times — slugs must be unique.`);
  }
  // Cross-guide references are validated after the slug set is known.
  for (const g of GUIDES) {
    for (const rel of g.relatedGuideSlugs) {
      if (!guideSlugs.has(rel)) {
        errors.push(`Guide "${g.titleEn}" references guide slug "${rel}", which does not exist.`);
      }
    }
  }

  // — Topics (hub pages): unique slug, curated refs resolve, hub not empty —
  const topicSlugs = new Map<string, number>();
  for (const t of TOPICS) {
    topicSlugs.set(t.slug, (topicSlugs.get(t.slug) ?? 0) + 1);
    if (!t.title) errors.push(`Topic "${t.slug}" is missing a title.`);
    if (!t.description) errors.push(`Topic "${t.slug}" is missing a description.`);
    if (t.region && !REGION_SLUGS.has(t.region)) {
      errors.push(`Topic "${t.slug}" has unknown region "${t.region}".`);
    }
    for (const gs of t.guideSlugs) {
      if (!guideSlugs.has(gs)) {
        errors.push(`Topic "${t.slug}" curates guide slug "${gs}", which does not exist.`);
      }
    }
    for (const es of t.examSlugs ?? []) {
      if (!EXAM_SLUGS.has(es)) {
        errors.push(`Topic "${t.slug}" lists exam slug "${es}", which does not exist.`);
      }
    }
    if (guidesForTopic(t.slug).length === 0) {
      warnings.push(`Topic "${t.slug}" has no guides — its hub page would be empty.`);
    }
  }
  for (const [slug, n] of topicSlugs) {
    if (n > 1) errors.push(`Topic slug "${slug}" is used ${n} times — slugs must be unique.`);
  }

  return {
    errors,
    warnings,
    counts: {
      colleges: COLLEGES.length,
      exams: ENTRANCE_EXAMS.length,
      regions: REGIONS.length,
      guides: GUIDES.length,
      topics: TOPICS.length,
      total: CONTENT_INDEX.length,
    },
  };
}

// ─────────────────────────────── Breadcrumbs ────────────────────────────────

export interface Crumb {
  label: string;
  /** Bare (English) path; the component prefixes the locale. Omitted on the current page. */
  href?: string;
}

const GROUP_LABELS: Record<string, string> = {
  colleges: 'Universities',
  exams: 'Exams',
  regions: 'Destinations',
  guides: 'Guides',
  topics: 'Topics',
  scholarships: 'Scholarships',
  'gsb-ai': 'Ask GSB AI',
  about: 'About',
  contact: 'Contact',
  privacy: 'Privacy',
  terms: 'Terms',
  disclaimer: 'Disclaimer',
};

const titleCase = (seg: string): string =>
  seg.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

/**
 * Build the breadcrumb trail for a bare (locale-stripped) pathname.
 * Returns [] for the home page (no breadcrumb shown there).
 */
export function breadcrumbsFor(barePath: string): Crumb[] {
  const segments = barePath.split('/').filter(Boolean);
  if (segments.length === 0) return [];

  const home: Crumb = { label: 'Home', href: '/' };
  const [group, child] = segments;

  // The destination crumb — region-first IA: Home › {Destination} › {Category} › {Item}.
  // The region is the unit's OWN region (from the slug lookup), so the trail is
  // correct in the server-rendered HTML and never depends on the visitor's cookie.
  const regionCrumb = (slug: RegionSlug): Crumb => ({
    label: regionName(slug),
    href: `/regions/${slug}`,
  });

  // College detail → Home > {Region} > Universities > {College}
  if (group === 'colleges' && child) {
    const college = COLLEGES.find((c) => c.slug === child);
    if (college) {
      return [
        home,
        regionCrumb(college.region),
        {
          label: categoryLabel('universities', college.region),
          href: regionCategoryPath(college.region, 'universities'),
        },
        { label: college.nameEn },
      ];
    }
  }

  // Exam detail → Home > [{Region} >] Exams > {Exam}  (region omitted for worldwide exams)
  if (group === 'exams' && child) {
    const exam = ENTRANCE_EXAMS.find((e) => e.slug === child);
    if (exam) {
      const trail: Crumb[] = [home];
      if (exam.region !== 'global') {
        trail.push(regionCrumb(exam.region));
        trail.push({
          label: categoryLabel('exams', exam.region),
          href: regionCategoryPath(exam.region, 'exams'),
        });
      } else {
        trail.push({ label: 'Exams', href: '/exams' });
      }
      trail.push({ label: exam.shortName });
      return trail;
    }
  }

  // Guide detail → Home > {Region} > Guides > {Guide}
  if (group === 'guides' && child) {
    const guide = GUIDES.find((g) => g.slug === child);
    if (guide) {
      return [
        home,
        regionCrumb(guide.region),
        { label: 'Guides', href: regionCategoryPath(guide.region, 'guides') },
        { label: guide.titleEn },
      ];
    }
  }

  // Topic hub → Home > [{Region} >] Topics > {Topic}  (region only for destination-gated hubs)
  if (group === 'topics' && child) {
    const topic = getTopicBySlug(child);
    if (topic) {
      const trail: Crumb[] = [home];
      if (topic.region) trail.push(regionCrumb(topic.region));
      trail.push({ label: 'Topics', href: '/topics' }, { label: topic.title });
      return trail;
    }
  }

  // Region category → Home > {Region} > {Category}  (region-first, like detail pages)
  // Region hub      → Home > Destinations > {Region}
  if (group === 'regions' && child) {
    const region = REGIONS.find((r) => r.slug === child);
    if (region) {
      const sub = segments[2];
      if (sub && isRegionCategory(sub)) {
        return [
          home,
          { label: region.displayName, href: `/regions/${region.slug}` },
          { label: categoryLabel(sub, region.slug) },
        ];
      }
      return [
        home,
        { label: 'Destinations', href: '/regions' },
        { label: region.displayName },
      ];
    }
  }

  // Single known group page → Home > {Group}
  if (segments.length === 1 && GROUP_LABELS[group]) {
    return [home, { label: GROUP_LABELS[group] }];
  }

  // Generic fallback — build crumbs from the raw segments.
  const crumbs: Crumb[] = [home];
  let acc = '';
  segments.forEach((seg, i) => {
    acc += `/${seg}`;
    const label = GROUP_LABELS[seg] ?? titleCase(seg);
    crumbs.push(i === segments.length - 1 ? { label } : { label, href: acc });
  });
  return crumbs;
}

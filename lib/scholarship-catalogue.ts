import { getGuideBySlug } from '@/lib/guides';
import type { ScholarshipCatalogue, ScholarshipOption } from '@/lib/scholarship-options';

/**
 * Server-only projection, checked by scripts/check-tools.ts's transitive bundle
 * guard. These are reviewed programme identities linked to EXISTING guides,
 * not a second content catalogue and not every scholarship-category guide.
 * Source review covers identity, provider and study destination only. No
 * eligibility, money, deadline, application cycle or current availability is
 * inferred. The student's own record supplies those tracking details.
 * See docs/SCHOLARSHIP_CATALOGUE_REVIEW_2026-10-28.md for the source evidence.
 */
const REVIEWED_AWARDS: ReadonlyArray<Omit<ScholarshipOption, 'guideTitle'>> = [
  {
    slug: 'australia-awards-scholarships-guide',
    name: 'Australia Awards Scholarships',
    provider: 'Australian Government — Department of Foreign Affairs and Trade',
    region: 'australia-nz',
    officialUrl: 'https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships',
    sourceReviewed: '2026-10-28',
  },
  {
    slug: 'lester-b-pearson-international-scholarship-explained',
    name: 'Lester B. Pearson International Scholarship',
    provider: 'University of Toronto',
    region: 'canada',
    officialUrl: 'https://future.utoronto.ca/pearson-scholarships',
    sourceReviewed: '2026-10-28',
  },
  {
    slug: 'gks-korean-government-scholarship-guide',
    name: 'Global Korea Scholarship (GKS)',
    provider: 'National Institute for International Education (NIIED)',
    region: 'east-southeast-asia',
    officialUrl: 'https://www.studyinkorea.go.kr/en/plan/scholarship.do?tab=gks-tab1',
    sourceReviewed: '2026-10-28',
  },
  {
    slug: 'eiffel-scholarship-france-guide',
    name: 'France Excellence Eiffel Scholarship',
    provider: 'French Ministry for Europe and Foreign Affairs — Campus France',
    region: 'europe',
    officialUrl: 'https://www.campusfrance.org/en/france-excellence-eiffel-scholarship-program',
    sourceReviewed: '2026-10-28',
  },
  {
    slug: 'inspire-scholarship-guide',
    name: 'INSPIRE Scholarship for Higher Education (SHE)',
    provider: 'Department of Science and Technology, Government of India',
    region: 'india',
    officialUrl: 'https://www.online-inspire.gov.in/Account/FAQ',
    sourceReviewed: '2026-10-28',
  },
  {
    slug: 'qatar-university-and-education-city-scholarships',
    name: 'Qatar University International Students Scholarship',
    provider: 'Qatar University',
    region: 'middle-east',
    officialUrl: 'https://www.qu.edu.qa/en-us/students/admission/scholarships/types',
    sourceReviewed: '2026-10-28',
  },
  {
    slug: 'russian-government-scholarship-and-open-doors',
    name: 'Open Doors: Russian Scholarship Project',
    provider: 'Global Universities Association',
    region: 'russia',
    // The entire official site is this named programme, not an organisation homepage.
    officialUrl: 'https://od.globaluni.ru/',
    sourceReviewed: '2026-10-28',
  },
  {
    slug: 'chevening-scholarship-guide',
    name: 'Chevening Scholarships',
    provider: 'UK Government — Chevening',
    region: 'uk-ireland',
    officialUrl: 'https://www.chevening.org/scholarships/',
    sourceReviewed: '2026-10-28',
  },
  {
    slug: 'fulbright-foreign-student-program-for-international-students',
    name: 'Fulbright Foreign Student Program',
    provider: 'Fulbright — U.S. Department of State',
    region: 'usa',
    officialUrl: 'https://foreign.fulbrightonline.org/about/foreign-student-program',
    sourceReviewed: '2026-10-28',
  },
];

export function scholarshipCatalogue(): ScholarshipCatalogue {
  return {
    awards: REVIEWED_AWARDS.map((award) => {
      const guide = getGuideBySlug(award.slug);
      if (!guide || guide.category !== 'scholarships') throw new Error(`Missing scholarship guide: ${award.slug}`);
      return { ...award, guideTitle: guide.titleEn };
    }),
  };
}

export function scholarshipForGuide(slug: string): ScholarshipOption | undefined {
  return scholarshipCatalogue().awards.find((award) => award.slug === slug);
}

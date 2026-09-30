/**
 * Cost & Funding Planner — shared vocabulary between the tool UI, the static
 * shell page and the account export. No Supabase import, no catalogue import:
 * safe for any client component (bundle guard).
 *
 * Every AMOUNT is STUDENT-AUTHORED. The site supplies only the destination's
 * cost categories — with an official page on the line, or our own guide on
 * it, where we have one (an official page is not always the one that states
 * the figure: for tuition that is each university's own fee page) — it never
 * asserts a fee, a living cost, a visa threshold or an exchange rate
 * (constitution Rule A, §3, §4.5, §4.6). One currency per plan; nothing is
 * ever converted.
 *
 * The student-visa financial rule (`fundsRule`) is modelled COUNTRY BY COUNTRY:
 * each source names the country it speaks for and what the page was found to
 * say, and a country of the destination with no source is shown as "not
 * covered here" — never implied by a homepage (independent review CRIT2-4).
 *
 * Every destination-specific category below (SEVIS I-901 fee, the UK's
 * Immigration Health Surcharge, Canada's proof of financial support, Australia's
 * OSHC, Germany's blocked account, …) is backed by a Tier-1 official source or
 * by our guide on it; the guide slugs are checked against lib/guides.ts, and
 * every source URL against a front-page rule, by scripts/check-tools.ts at
 * build time, so a renamed guide can never leave a dangling link on the tool
 * and a homepage can never stand in for the page that says something.
 */

import type { RegionSlug } from '@/lib/regions';
import { cleanText } from '@/lib/planner';
import { csvDocument } from '@/lib/csv';

// ── Rows (mirror migration 0004) ────────────────────────────────────────────

export type BudgetKind = 'cost' | 'funding';
export type BudgetPeriod = 'once' | 'year';

export interface BudgetPlan {
  id: string;
  region: RegionSlug;
  label: string;
  /** ISO 4217. Every line in the plan is entered in this currency. */
  currency_code: string;
  /** Programme length the per-year lines are multiplied by (1–8). */
  years: number;
  intake: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BudgetItem {
  id: string;
  plan_id: string;
  kind: BudgetKind;
  /** A suggested-category key or 'other'. */
  category: string;
  label: string;
  /** PostgREST returns a numeric as a string; parse with `amountToCents`. */
  amount: number | string;
  period: BudgetPeriod;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export const PERIOD_LABEL: Record<BudgetPeriod, string> = { once: 'one-off', year: 'per year' };

// ── Limits (mirror the database CHECKs) ─────────────────────────────────────

export const BUDGET_LIMITS = {
  label: 120,
  intake: 40,
  notes: 4000,
  itemLabel: 80,
  note: 300,
  plans: 12,
  itemsPerPlan: 60,
  yearsMin: 1,
  yearsMax: 8,
  /** Below one hundred million, to the cent (numeric(12,2)). */
  amountMaxCents: 100_000_000 * 100 - 1,
} as const;

// ── Currencies (ISO 4217; the plan's currency is the student's choice) ──────

export interface CurrencyOption {
  code: string;
  label: string;
}

/** The nine destinations' currencies first (in destination-menu order), then the rest alphabetically. */
export const CURRENCIES: CurrencyOption[] = [
  { code: 'AUD', label: 'Australian dollar' },
  { code: 'CAD', label: 'Canadian dollar' },
  { code: 'EUR', label: 'Euro' },
  { code: 'INR', label: 'Indian rupee' },
  { code: 'GBP', label: 'Pound sterling' },
  { code: 'RUB', label: 'Russian rouble' },
  { code: 'USD', label: 'US dollar' },
  { code: 'AED', label: 'UAE dirham' },
  { code: 'BHD', label: 'Bahraini dinar' },
  { code: 'CHF', label: 'Swiss franc' },
  { code: 'CNY', label: 'Chinese yuan' },
  { code: 'CZK', label: 'Czech koruna' },
  { code: 'DKK', label: 'Danish krone' },
  { code: 'HKD', label: 'Hong Kong dollar' },
  { code: 'HUF', label: 'Hungarian forint' },
  { code: 'IDR', label: 'Indonesian rupiah' },
  { code: 'JPY', label: 'Japanese yen' },
  { code: 'KRW', label: 'South Korean won' },
  { code: 'KWD', label: 'Kuwaiti dinar' },
  { code: 'KZT', label: 'Kazakhstani tenge' },
  { code: 'MYR', label: 'Malaysian ringgit' },
  { code: 'NOK', label: 'Norwegian krone' },
  { code: 'NZD', label: 'New Zealand dollar' },
  { code: 'OMR', label: 'Omani rial' },
  { code: 'PHP', label: 'Philippine peso' },
  { code: 'PLN', label: 'Polish złoty' },
  { code: 'QAR', label: 'Qatari riyal' },
  { code: 'SAR', label: 'Saudi riyal' },
  { code: 'SEK', label: 'Swedish krona' },
  { code: 'SGD', label: 'Singapore dollar' },
  { code: 'THB', label: 'Thai baht' },
  { code: 'TWD', label: 'New Taiwan dollar' },
  { code: 'VND', label: 'Vietnamese đồng' },
];

export const CURRENCY_CODE_RE = /^[A-Z]{3}$/;
export const isKnownCurrency = (code: string): boolean => CURRENCIES.some((c) => c.code === code);

/** ISO 4217 minor units: yen, won and đồng have none; everything else here uses two (three-decimal dinars are kept to cents by the DB). */
export function currencyDecimals(code: string): 0 | 2 {
  return code === 'JPY' || code === 'KRW' || code === 'VND' ? 0 : 2;
}

// ── Destination categories ──────────────────────────────────────────────────

export interface OfficialSource {
  label: string;
  url: string;
}

export interface GuideLink {
  slug: string;
  title: string;
}

export interface CategoryDef {
  /** Stable key stored on the row (matches the DB CHECK `^[a-z][a-z0-9-]*$`). */
  key: string;
  /** The destination-specific label shown to the student (also the row's default label). */
  label: string;
  /** The label as it reads mid-sentence, only when the plain rule in `labelInProse` would get it wrong (a label opening with a proper name). */
  prose?: string;
  /** One line under the label: what this line usually covers. Never a number. */
  hint: string;
  defaultPeriod: BudgetPeriod;
  /** An official page on this line (it may or may not state the figure — copy must never say it does). */
  source?: OfficialSource;
  /** Our own guides on this line item. */
  guides?: GuideLink[];
}

/**
 * One official page on a country's student-visa financial rule, and what it
 * was found to say on the official page itself (never a homepage that states
 * nothing — scripts/check-tools.ts refuses a URL whose path is empty or "/"):
 *   'states' — the page states the financial (means) requirement, or names a
 *              proof of funds (a bank statement, a sponsor's letter, a
 *              statement of who pays your expenses) among the visa's required
 *              documents;
 *   'asks'   — the page asks for details of your financial support in the
 *              application, but states no requirement and names no proof
 *              (Singapore's ICA page; independent review G7-SK-3);
 *   'none'   — the page is the official student-visa document list and it
 *              lists no financial document ("no published requirement found").
 * Every surface renders each finding in its own words, so no page is ever
 * presented as stating more than it does.
 */
export interface FundsSource extends OfficialSource {
  /** Exactly as the country is named in the destination's `countries` (lib/regions.ts). */
  country: string;
  finding: 'states' | 'asks' | 'none';
}

export interface FundsRule {
  /**
   * Where each country of the destination publishes the financial rule for its
   * student visa — one country per source. A country of the destination with
   * no source here is "not covered": the copy says so and points to the
   * embassy, never implying a link we do not have. Facts only — the tool never
   * states the figure.
   */
  sources: FundsSource[];
  guides: GuideLink[];
}

/** The day every `fundsRule` source was last read on the official page itself. */
export const FUNDS_RULE_CHECKED = '2026-09-29';

export interface FundsCoverage {
  /** Countries whose official page states the rule (or names the proof), with those pages. */
  published: Array<{ country: string; sources: FundsSource[] }>;
  /** Countries whose official application asks about your financial support but states no requirement. */
  asked: Array<{ country: string; sources: FundsSource[] }>;
  /** Countries whose official student-visa document list names no financial document. */
  noneListed: Array<{ country: string; sources: FundsSource[] }>;
  /** Countries of the destination we link no official page for. */
  notCovered: string[];
}

/**
 * A destination's funds-rule sources grouped by country, in the destination's
 * own country order (`countries` from lib/regions.ts — passed in so this
 * module keeps no value import of the region data).
 */
export function fundsCoverage(rule: FundsRule, countries: readonly string[]): FundsCoverage {
  const byCountry = (finding: FundsSource['finding']) =>
    countries.map((country) => ({ country, sources: rule.sources.filter((s) => s.country === country && s.finding === finding) })).filter((g) => g.sources.length > 0);
  const covered = new Set(rule.sources.map((s) => s.country));
  return { published: byCountry('states'), asked: byCountry('asks'), noneListed: byCountry('none'), notCovered: countries.filter((c) => !covered.has(c)) };
}

/** "A, B and C" — for the sentence that names the countries we do not cover. */
export function joinCountries(names: readonly string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/**
 * A line's label inside running prose ("…housing, food & transport; SEVIS
 * I-901 fee…"). A label that opens with a proper name carries its own `prose`
 * form; otherwise only an ordinary capitalised first word is lower-cased
 * ("Housing" → "housing"), so an acronym (SEVIS) keeps its capitals and
 * nothing after the first letter — "(UK)", "(NZ)", "ID" — is ever touched.
 * Never run a whole label through toLowerCase().
 */
export function labelInProse(c: Pick<CategoryDef, 'label' | 'prose'>): string {
  if (c.prose) return c.prose;
  return /^[A-Z][a-z]/.test(c.label) ? c.label[0].toLowerCase() + c.label.slice(1) : c.label;
}

export interface DestinationBudget {
  costs: CategoryDef[];
  funding: CategoryDef[];
  fundsRule: FundsRule;
}

/** The universal shape every destination starts from; per-destination entries override label/hint/links. */
const BASE_COSTS: CategoryDef[] = [
  { key: 'tuition', label: 'Tuition & university fees', hint: 'Per year, from the university’s own fee page.', defaultPeriod: 'year' },
  { key: 'living', label: 'Housing, food & transport', hint: 'Per year: rent, meals, local travel, phone.', defaultPeriod: 'year' },
  { key: 'health', label: 'Health insurance or cover', hint: 'Whatever your university or visa requires.', defaultPeriod: 'year' },
  { key: 'visa', label: 'Visa & immigration fees', hint: 'Application fees and any related charges.', defaultPeriod: 'once' },
  { key: 'travel', label: 'Flights & arrival costs', hint: 'Travel, first-month deposits, settling in.', defaultPeriod: 'once' },
  { key: 'tests', label: 'Tests & application fees', hint: 'Entrance or English tests, application fees, document costs.', defaultPeriod: 'once' },
  { key: 'books', label: 'Books, laptop & supplies', hint: 'Per year.', defaultPeriod: 'year' },
];

const BASE_FUNDING: CategoryDef[] = [
  { key: 'savings', label: 'Savings', hint: 'Money already set aside for your studies.', defaultPeriod: 'once' },
  { key: 'family', label: 'Family contribution', hint: 'What family will contribute, per year or as a lump sum.', defaultPeriod: 'year' },
  { key: 'scholarship', label: 'Scholarship, grant or fee waiver', hint: 'Only what is confirmed, or mark it as applied-for in the note.', defaultPeriod: 'year' },
  { key: 'loan', label: 'Education loan', hint: 'The amount sanctioned or planned.', defaultPeriod: 'once' },
  { key: 'work', label: 'Part-time work (your estimate)', hint: 'Work rights are limited and vary by destination — check the official rules before counting on this.', defaultPeriod: 'year' },
  { key: 'sponsor', label: 'Employer or sponsor', hint: 'A sponsor’s confirmed contribution.', defaultPeriod: 'year' },
];

/** The free line the student names themselves. Available in both columns. */
export const OTHER_CATEGORY: CategoryDef = { key: 'other', label: 'Something else', hint: 'Name the line yourself.', defaultPeriod: 'once' };

function withOverrides(base: CategoryDef[], overrides: Partial<Record<string, Partial<CategoryDef>>>): CategoryDef[] {
  return base.map((c) => ({ ...c, ...(overrides[c.key] ?? {}) }));
}

const g = (slug: string, title: string): GuideLink => ({ slug, title });

export const DESTINATION_BUDGETS: Record<RegionSlug, DestinationBudget> = {
  usa: {
    costs: withOverrides(BASE_COSTS, {
      tuition: {
        hint: 'Per year, from the university’s official cost-of-attendance page.',
        guides: [g('cost-of-attendance-explained', 'Cost of Attendance, Explained')],
      },
      living: { guides: [g('cost-of-living-for-students-by-us-city', 'Cost of Living for Students by US City')] },
      health: {
        label: 'Health insurance',
        hint: 'Most universities require a plan; check the one yours accepts.',
        guides: [g('student-health-insurance-usa', 'Student Health Insurance in the USA')],
      },
      visa: {
        label: 'SEVIS I-901 fee & visa application fee',
        hint: 'The SEVIS fee is paid before the visa interview; the visa fee at application.',
        source: { label: 'ICE (DHS) — I-901 SEVIS fee amounts', url: 'https://www.ice.gov/sevis/i901' },
        guides: [g('i-20-and-sevis-explained', 'The I-20 and SEVIS, Explained')],
      },
    }),
    funding: withOverrides(BASE_FUNDING, {
      scholarship: { guides: [g('types-of-financial-aid-grants-loans-work-study', 'Types of Financial Aid: Grants, Loans & Work-Study')] },
    }),
    fundsRule: {
      sources: [
        { country: 'United States', finding: 'states', label: 'Study in the States (DHS) — financial ability', url: 'https://studyinthestates.dhs.gov/students/prepare/financial-ability' },
        { country: 'United States', finding: 'states', label: 'U.S. Department of State — student visa: evidence of how you will pay your costs', url: 'https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html' },
      ],
      guides: [g('proof-of-funds-for-f1-visa', 'Proof of Funds for the F-1 Visa')],
    },
  },

  'uk-ireland': {
    costs: withOverrides(BASE_COSTS, {
      tuition: { guides: [g('tuition-fees-at-uk-universities-explained', 'Tuition Fees at UK Universities Explained'), g('cost-of-studying-in-ireland-for-international-students', 'Cost of Studying in Ireland for International Students')] },
      living: { guides: [g('cost-of-living-for-students-in-the-uk', 'Cost of Living for Students in the UK'), g('budgeting-and-living-costs-for-uk-students', 'Budgeting and Living Costs for UK Students')] },
      health: {
        label: 'Immigration Health Surcharge (UK) or health insurance (Ireland)',
        prose: 'the Immigration Health Surcharge (UK) or health insurance (Ireland)',
        hint: 'UK: paid with the visa application for the length of the visa. Ireland: private insurance is required.',
        defaultPeriod: 'once',
        source: { label: 'GOV.UK — pay for UK healthcare as part of your immigration application', url: 'https://www.gov.uk/healthcare-immigration-application' },
        guides: [g('healthcare-and-insurance-for-international-students-in-ireland', 'Healthcare and Insurance for International Students in Ireland')],
      },
      visa: {
        label: 'Visa application fee',
        hint: 'UK Student visa, or Ireland’s study visa and residence registration.',
        source: { label: 'GOV.UK — Student visa', url: 'https://www.gov.uk/student-visa' },
      },
    }),
    funding: BASE_FUNDING,
    fundsRule: {
      sources: [
        { country: 'United Kingdom', finding: 'states', label: 'GOV.UK — Student visa: money you need', url: 'https://www.gov.uk/student-visa/money' },
        {
          country: 'Ireland',
          finding: 'states',
          label: 'Irish Immigration Service — information on student finances',
          url: 'https://www.irishimmigration.ie/coming-to-study-in-ireland/what-are-my-study-options/a-fee-paying-private-primary-or-secondary-school/information-on-student-finances/',
        },
      ],
      guides: [g('uk-student-visa-financial-requirements', 'UK Student Visa Financial Requirements'), g('ireland-student-visa-financial-requirements', 'Ireland Student Visa Financial Requirements')],
    },
  },

  canada: {
    costs: withOverrides(BASE_COSTS, {
      tuition: {
        source: { label: 'EduCanada — study costs for international students', url: 'https://www.educanada.ca/programs-programmes/education_cost-cout_education.aspx?lang=eng' },
        guides: [g('tuition-fees-at-canadian-universities', 'Tuition Fees at Canadian Universities Explained')],
      },
      living: { guides: [g('cost-of-living-in-canada-for-students', 'Cost of Living in Canada for Students'), g('how-to-budget-as-a-student-in-canada', 'How to Budget as a Student in Canada')] },
      health: {
        hint: 'Provincial cover for international students varies; many universities enrol you in a plan.',
        guides: [g('health-insurance-for-international-students-canada', 'Health Insurance for International Students in Canada')],
      },
      visa: {
        label: 'Study permit fee & biometrics',
        source: { label: 'IRCC — study permit: get the right documents', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents.html' },
        guides: [g('application-fees-and-documents-canada', 'Application Fees and Documents for Canadian Universities')],
      },
    }),
    funding: withOverrides(BASE_FUNDING, {
      work: { guides: [g('part-time-jobs-and-budgeting-canada', 'Part-Time Jobs and Budgeting in Canada')] },
    }),
    fundsRule: {
      sources: [
        { country: 'Canada', finding: 'states', label: 'IRCC — study permit: proof of financial support', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents/financial-support.html' },
      ],
      guides: [g('proof-of-funds-and-gic-for-canada', 'Proof of Funds and GIC for Canada')],
    },
  },

  'australia-nz': {
    costs: withOverrides(BASE_COSTS, {
      tuition: {
        source: { label: 'Study Australia (Australian Government) — living and education costs', url: 'https://www.studyaustralia.gov.au/en/life-in-australia/living-and-education-costs' },
        guides: [g('cost-of-studying-in-australia-for-international-students', 'Cost of Studying in Australia for International Students'), g('cost-of-studying-in-new-zealand', 'Cost of Studying in New Zealand')],
      },
      living: { guides: [g('cost-of-living-in-australia-for-students', 'Cost of Living in Australia for Students')] },
      health: {
        label: 'Overseas Student Health Cover (Australia) or insurance (NZ)',
        prose: 'Overseas Student Health Cover (Australia) or insurance (NZ)',
        hint: 'Australia requires OSHC for the length of the student visa; New Zealand providers require insurance too.',
        defaultPeriod: 'once',
        source: { label: 'Department of Home Affairs — Student visa (subclass 500)', url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500' },
        guides: [g('overseas-student-health-cover-oshc-guide', 'Overseas Student Health Cover (OSHC) Guide')],
      },
      visa: {
        label: 'Student visa application fee',
        hint: 'Australia’s subclass 500 or New Zealand’s fee-paying student visa.',
        source: { label: 'Immigration New Zealand — fee paying student visa', url: 'https://www.immigration.govt.nz/visas/fee-paying-student-visa/' },
      },
    }),
    funding: BASE_FUNDING,
    fundsRule: {
      sources: [
        { country: 'Australia', finding: 'states', label: 'Department of Home Affairs — Student visa (subclass 500): have enough money for your stay', url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500' },
        {
          country: 'New Zealand',
          finding: 'states',
          label: 'Immigration New Zealand — student fund requirements',
          url: 'https://www.immigration.govt.nz/process-to-apply/applying-for-a-visa/providing-evidence-and-documents-to-support-your-visa-application/student-fund-requirements/',
        },
      ],
      guides: [g('australia-student-visa-financial-requirements', 'Australia Student Visa Financial Requirements'), g('new-zealand-student-visa-financial-requirements', 'New Zealand Student Visa Financial Requirements')],
    },
  },

  europe: {
    costs: withOverrides(BASE_COSTS, {
      tuition: {
        hint: 'Per year — varies from no tuition to full fees by country and university.',
        guides: [g('tuition-fees-for-international-students-in-europe', 'Tuition Fees for International Students in Europe'), g('cost-of-studying-in-europe-by-country', 'Cost of Studying in Europe by Country')],
      },
      living: { guides: [g('cost-of-living-for-students-in-europe', 'Cost of Living for Students in Europe')] },
      health: { guides: [g('health-insurance-for-students-in-europe', 'Health Insurance for Students in Europe')] },
      visa: {
        label: 'National student visa & residence permit fees',
        source: { label: 'EU Immigration Portal (European Commission)', url: 'https://home-affairs.ec.europa.eu/policies/migration-and-asylum/eu-immigration-portal_en' },
      },
    }),
    funding: withOverrides(BASE_FUNDING, {
      work: { guides: [g('part-time-work-and-budgeting-for-students-in-europe', 'Part-Time Work and Budgeting for Students in Europe')] },
    }),
    fundsRule: {
      // Each read on the country's own official page on FUNDS_RULE_CHECKED.
      // Not covered: Norway, Finland, Italy and Poland (their official pages
      // refused an automated read that day), and Switzerland, Romania,
      // Bulgaria and Georgia (no page located yet) — the copy names every
      // country not covered and points to the embassy.
      sources: [
        { country: 'Germany', finding: 'states', label: 'Federal Foreign Office — how to prove your financing for a student visa', url: 'https://www.auswaertiges-amt.de/en/visa-service/buergerservice/faq/08-finanzierung/606696' },
        { country: 'France', finding: 'states', label: 'Service-Public.fr — student long-stay visa: resources you must justify', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F2231?lang=en' },
        { country: 'Netherlands', finding: 'states', label: 'IND — income requirements for study', url: 'https://ind.nl/en/income-requirements-study' },
        { country: 'Sweden', finding: 'states', label: 'Swedish Migration Agency — residence permit for higher education studies', url: 'https://www.migrationsverket.se/en/you-want-to-apply/study/higher-education.html' },
        { country: 'Denmark', finding: 'states', label: 'SIRI (New to Denmark) — higher educational programmes', url: 'https://www.nyidanmark.dk/en-GB/You-want-to-apply/Study/Higher-Education' },
        { country: 'Spain', finding: 'states', label: 'Spanish Ministry of Foreign Affairs — study visa: proof of financial means (Embassy in New Delhi page)', url: 'https://www.exteriores.gob.es/Embajadas/nuevadelhi/en/ServiciosConsulares/Paginas/Consular/Visado-de-estudios.aspx' },
        { country: 'Belgium', finding: 'states', label: 'Belgian Immigration Office — sufficient means of subsistence (studies)', url: 'https://dofi.ibz.be/en/themes/ressortissants-dun-pays-tiers/etudes/favoris/sufficient-means-subsistence' },
        { country: 'Austria', finding: 'states', label: 'OeAD (Austria’s agency for education) — residence permit for students', url: 'https://oead.at/en/to-austria/entry-and-residence/residence-permit-student-no-mobility-programme' },
        { country: 'Czechia', finding: 'states', label: 'Czech Ministry of the Interior — long-term visa for studies', url: 'https://ipc.gov.cz/en/visa-and-residence-permit-types/third-country-nationals/long-term-visa/long-term-visa-for-the-purpose-of-studies/' },
        { country: 'Hungary', finding: 'states', label: 'Hungarian Immigration Office — residence of students (in Hungarian)', url: 'https://oif.gov.hu/tajekoztatok/a-hallgato-tanulo-tartozkodasa' },
        { country: 'Portugal', finding: 'states', label: 'Portuguese Ministry of Foreign Affairs — residency visa documents (higher education students)', url: 'https://vistos.mne.gov.pt/en/national-visas/necessary-documentation/residency' },
      ],
      guides: [g('blocked-account-germany', 'Blocked Account for Germany, Explained'), g('germany-student-visa-financial-requirements', 'Germany Student Visa Financial Requirements')],
    },
  },

  india: {
    costs: withOverrides(BASE_COSTS, {
      tuition: {
        label: 'Tuition & college fees',
        hint: 'Per year, from the college’s official fee notice.',
        guides: [g('how-to-judge-if-a-college-is-worth-the-fees', 'How to Judge if a College Is Worth the Fees'), g('fees-for-international-students-in-india', 'Fees for International Students in India')],
      },
      living: {
        label: 'Hostel, food & transport',
        guides: [g('living-in-india-as-an-international-student', 'Living in India as an International Student')],
      },
      visa: {
        label: 'Student visa (international applicants)',
        hint: 'Not needed by Indian citizens.',
        source: { label: 'Indian Visa Online — e-Visa, including the e-Student Visa', url: 'https://indianvisaonline.gov.in/evisa/tvoa.html' },
        guides: [g('student-visa-for-studying-in-india', 'Student Visa for Studying in India')],
      },
    }),
    funding: withOverrides(BASE_FUNDING, {
      scholarship: { guides: [g('national-scholarship-portal-guide', 'National Scholarship Portal (NSP): A Guide')] },
      loan: { guides: [g('education-loan-for-studies-in-india', 'Education Loan for Studies in India'), g('how-to-apply-for-an-education-loan', 'How to Apply for an Education Loan in India')] },
    }),
    fundsRule: {
      sources: [{ country: 'India', finding: 'states', label: 'Indian Visa Online — e-Visa: e-Student Visa documents (financial support)', url: 'https://indianvisaonline.gov.in/evisa/tvoa.html' }],
      guides: [g('student-visa-for-studying-in-india', 'Student Visa for Studying in India')],
    },
  },

  'middle-east': {
    costs: withOverrides(BASE_COSTS, {
      tuition: { guides: [g('cost-of-studying-in-the-gulf-for-international-students', 'Cost of Studying in the Gulf for International Students'), g('how-to-pay-tuition-in-the-gulf-installments-and-refunds', 'How to Pay University Tuition in the Gulf')] },
      living: { guides: [g('cost-of-living-for-students-in-the-uae', 'Cost of Living for Students in the UAE'), g('cost-of-living-for-students-in-qatar-and-saudi-arabia', 'Cost of Living for Students in Qatar and Saudi Arabia')] },
      health: { guides: [g('health-insurance-for-students-in-the-gulf', 'Health Insurance for Students in the Gulf')] },
      visa: {
        label: 'Student residence visa, medical test & ID',
        hint: 'Usually sponsored by the university; fees vary by country.',
        source: { label: 'UAE Government — residence visa for studying', url: 'https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/residence-visa-for-studying-in-the-uae' },
        guides: [g('gulf-student-visa-guide-overview', 'Gulf Student Visa Guide: Overview'), g('uae-student-visa-guide', 'UAE Student Visa Guide')],
      },
    }),
    funding: BASE_FUNDING,
    fundsRule: {
      // The UAE's MOHESR homepage used to stand here: it is the higher-education
      // ministry, not the visa authority, and states no rule. Not covered: the
      // UAE (u.ae could not be read on FUNDS_RULE_CHECKED), Qatar, Oman, Bahrain
      // and Kuwait (not yet checked) — the copy names them and points to the embassy.
      sources: [{ country: 'Saudi Arabia', finding: 'states', label: 'Study in Saudi (Ministry of Education) — study visa: proof of financial ability', url: 'https://studyinsaudi.sa/en/VisaOptions' }],
      guides: [g('student-visa-requirements-for-the-gulf', 'Student Visa Requirements for the Gulf'), g('budgeting-as-a-student-in-the-gulf', 'Budgeting as a Student in the Gulf')],
    },
  },

  russia: {
    costs: withOverrides(BASE_COSTS, {
      tuition: { guides: [g('tuition-fees-at-russian-and-cis-universities', 'Tuition Fees at Russian and CIS Universities'), g('cost-of-studying-in-russia-for-international-students', 'Cost of Studying in Russia for International Students')] },
      living: { guides: [g('cost-of-living-for-students-in-russia', 'Cost of Living for Students in Russia'), g('budgeting-and-living-costs-in-russia-cis', 'Budgeting and Living Costs in Russia and CIS')] },
      health: {
        label: 'Medical insurance',
        hint: 'Required for the student visa and for enrolment.',
        guides: [g('medical-certificate-and-insurance-for-russia-cis-visa', 'Medical Certificate and Insurance for a Russia/CIS Student Visa'), g('healthcare-and-insurance-for-students-in-russia-cis', 'Healthcare and Insurance for Students in Russia and CIS')],
      },
      visa: {
        label: 'Student visa & invitation fees',
        source: { label: 'Official Russian Government admission portal — study visa and registration (in Russian)', url: 'https://education-in-russia.com/life-in-russia/visa' },
        guides: [g('russia-student-visa-guide', 'Russia Student Visa Guide'), g('student-visa-overview-for-cis-countries', 'Student Visa Overview for CIS Countries')],
      },
      travel: { guides: [g('what-to-budget-for-before-arriving-russia-cis', 'One-Time Costs to Budget Before You Arrive in Russia or the CIS')] },
    }),
    funding: withOverrides(BASE_FUNDING, {
      scholarship: { guides: [g('university-scholarships-and-fee-waivers-russia-cis', 'University Scholarships and Fee Waivers in Russia and CIS')] },
    }),
    fundsRule: {
      // The portal's study-visa page lists the documents (passport, form,
      // university invitation, photo, insurance, HIV certificate) and no
      // financial one — shown as "no financial requirement listed", not as
      // where a rule is published. Kazakhstan, Uzbekistan, Armenia and
      // Kyrgyzstan: not covered.
      sources: [{ country: 'Russia', finding: 'none', label: 'Official Russian Government admission portal — study visa and registration (in Russian)', url: 'https://education-in-russia.com/life-in-russia/visa' }],
      guides: [g('student-visa-requirements-for-russia', 'Student Visa Requirements for Russia'), g('how-to-estimate-total-cost-of-a-degree-russia-cis', 'How to Estimate the Total Cost of a Full Degree in Russia or the CIS')],
    },
  },

  'east-southeast-asia': {
    costs: withOverrides(BASE_COSTS, {
      tuition: { guides: [g('cost-of-studying-in-east-and-southeast-asia-overview', 'Cost of Studying in East & Southeast Asia: An Overview'), g('how-to-calculate-the-total-cost-of-a-degree-in-asia', 'How to Calculate the Total Cost of a Degree in Asia')] },
      living: { guides: [g('cost-of-living-compared-across-major-asian-student-cities', 'Cost of Living Compared Across Major Asian Student Cities'), g('cutting-living-costs-and-student-discounts-across-asia', 'Cutting Living Costs and Student Discounts Across Asia')] },
      health: {
        hint: 'National schemes in Japan and Korea; insurance requirements elsewhere vary by country.',
        guides: [g('student-health-insurance-and-healthcare-systems-across-asia', 'Student Health Insurance and Healthcare Systems Across Asia')],
      },
      visa: {
        label: 'Student visa or pass fees (varies by country)',
        guides: [g('japan-student-visa-guide', 'Japan Student Visa Guide'), g('student-pass-for-singapore-guide', 'Student Pass for Singapore: A Guide'), g('south-korea-d2-student-visa-guide', 'South Korea D-2 Student Visa Guide')],
      },
    }),
    funding: withOverrides(BASE_FUNDING, {
      scholarship: { guides: [g('what-scholarships-actually-cover-tuition-stipend-and-fine-print', 'What Asian Scholarships Actually Cover')] },
      loan: { guides: [g('education-loans-for-studying-in-asia', 'Education Loans for Studying in Asia')] },
      work: { guides: [g('can-part-time-work-cover-your-living-costs-while-studying-in-asia', 'Can Part-Time Work Cover Your Living Costs While Studying in Asia?')] },
    }),
    fundsRule: {
      // Not covered: Malaysia (its official document list names a personal bond
      // lodged through the institution — neither a published means test nor
      // its absence, so it is left unclassified); the Philippines and Thailand
      // (the official pages read on FUNDS_RULE_CHECKED point to a checklist or
      // e-Visa site not yet read); China (not yet checked).
      sources: [
        { country: 'Japan', finding: 'states', label: 'Immigration Services Agency — status of residence “Student” (in Japanese; lists the statement of who pays your expenses)', url: 'https://www.moj.go.jp/isa/applications/status/student.html' },
        // ICA lists "financial support" among the details the online application
        // asks for; it states no requirement and names no proof — 'asks'.
        { country: 'Singapore', finding: 'asks', label: 'ICA — Student’s Pass, Institutes of Higher Learning: what the application asks for', url: 'https://www.ica.gov.sg/reside/STP/apply/ihl' },
        { country: 'South Korea', finding: 'states', label: 'Study in Korea (Government of Korea) — visa and stay: proof of financial ability', url: 'https://www.studyinkorea.go.kr/en/plan/visaAndStay.do' },
        { country: 'Hong Kong', finding: 'states', label: 'Hong Kong Immigration Department — students: fees and living expenses', url: 'https://www.immd.gov.hk/eng/services/visas/study.html' },
        { country: 'Taiwan', finding: 'states', label: 'Bureau of Consular Affairs (Taiwan) — resident visa for foreign students: proof of financial support', url: 'https://www.boca.gov.tw/cp-166-283-c4da3-2.html' },
      ],
      guides: [g('proof-of-funds-and-financial-requirements-for-asian-student-visas', 'Proof of Funds and Financial Requirements for Asian Student Visas'), g('budgeting-and-managing-money-as-a-student-in-asia', 'Budgeting and Managing Money as a Student in Asia')],
    },
  },
};

/** The category definition a stored row was created from (or the free "other" line). */
export function categoryFor(region: RegionSlug, kind: BudgetKind, key: string): CategoryDef {
  const list = kind === 'cost' ? DESTINATION_BUDGETS[region].costs : DESTINATION_BUDGETS[region].funding;
  return list.find((c) => c.key === key) ?? OTHER_CATEGORY;
}

export const CATEGORY_KEY_RE = /^[a-z][a-z0-9-]{0,39}$/;

// ── Money (integers in minor units; no floats in totals) ────────────────────

export const AMOUNT_RE = /^\d{1,9}(\.\d{1,2})?$/;

/**
 * Parse what the student typed into an amount, or null when it is not a plain
 * number. Students type money the way their locale does, so the separators
 * are read locale-agnostically rather than assumed English:
 *   "12,500" · "1,20,000" · "1,234,567" · "12 500" · "12'500"  → grouping
 *   "12,50" · "1.234,56"                                        → decimal comma
 *   "12500.50" · "1,234.56"                                     → decimal point
 * Rule: when both separators appear, the LAST one is the decimal point; a lone
 * comma is a decimal comma only when 1–2 digits follow it (12,50), otherwise
 * grouping (12,500). A lone dot is always a decimal point, so "12.500" is
 * refused (three decimals) rather than guessed at. Letters, a sign, or more
 * decimals than the currency has → null, and the form says why.
 */
export function parseAmount(raw: string, decimals: 0 | 2 = 2): number | null {
  const trimmed = raw.trim();
  if (!trimmed || /[A-Za-z+\-]/.test(trimmed)) return null;
  const s = trimmed.replace(/[^\d.,]/g, '');
  if (!s) return null;
  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');
  let sep: ',' | '.' | null = null;
  if (lastComma >= 0 && lastDot >= 0) sep = lastComma > lastDot ? ',' : '.';
  else if (lastComma >= 0) {
    const after = s.length - lastComma - 1;
    sep = s.indexOf(',') === lastComma && after >= 1 && after <= 2 ? ',' : null;
  } else if (lastDot >= 0) sep = s.indexOf('.') === lastDot ? '.' : null;
  let wholeRaw = s;
  let frac = '';
  if (sep) {
    const i = s.lastIndexOf(sep);
    wholeRaw = s.slice(0, i);
    frac = s.slice(i + 1);
    if (!frac || /[.,]/.test(frac)) return null;
  }
  // Grouping separators must delimit real groups: 1–3 digits first, then 2–3
  // (lakh/crore grouping: 1,20,000), the last exactly 3 — so "1.2.3" is refused.
  if (/[.,]/.test(wholeRaw) && !/^\d{1,3}(?:[.,]\d{2,3})*[.,]\d{3}$/.test(wholeRaw)) return null;
  const whole = wholeRaw.replace(/[.,]/g, '');
  if (!/^\d{1,9}$/.test(whole) || (frac && !/^\d{1,2}$/.test(frac)) || frac.length > decimals) return null;
  const cents = amountToCents(frac ? `${whole}.${frac}` : whole);
  return cents > BUDGET_LIMITS.amountMaxCents ? null : cents / 100;
}

/**
 * A row's numeric (string from PostgREST, or a number) as integer cents —
 * parsed as a DECIMAL, never via float multiplication (1.005 × 100 is
 * 100.49999… in binary). A third decimal rounds half up, as the database does.
 */
export function amountToCents(amount: number | string): number {
  const s = typeof amount === 'number' ? (Number.isFinite(amount) ? amount.toString() : '') : amount.trim();
  const m = /^(\d+)(?:\.(\d+))?$/.exec(s);
  if (!m) return 0;
  const frac = ((m[2] ?? '') + '000').slice(0, 3);
  return Number(m[1]) * 100 + Number(frac.slice(0, 2)) + (Number(frac[2]) >= 5 ? 1 : 0);
}

export function formatMoney(cents: number, currency: string): string {
  const value = cents / 100;
  // Whole amounts without decimals; anything else with exactly two (never
  // "$12,500.5"); a zero-decimal currency never shows a fraction.
  const digits = currencyDecimals(currency) === 0 || cents % 100 === 0 ? 0 : 2;
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
      // 'symbol', not 'narrowSymbol': seven of the site's currencies are dollars,
      // and a bare "$" on a Canadian budget reads as US dollars. 'symbol' gives
      // CA$, A$, NZ$, S$, HK$, NT$ and keeps $ for USD only.
      currencyDisplay: 'symbol',
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString('en', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
  }
}

export interface PlanTotals {
  /** Per-year lines, before multiplying by the programme length. */
  costPerYear: number;
  fundingPerYear: number;
  /** One-off lines. */
  costOnce: number;
  fundingOnce: number;
  /** Whole programme: one-off + per-year × years. */
  costTotal: number;
  fundingTotal: number;
  /** fundingTotal − costTotal (negative = still to arrange). */
  difference: number;
}

export function planTotals(items: BudgetItem[], years: number): PlanTotals {
  const y = Math.min(BUDGET_LIMITS.yearsMax, Math.max(BUDGET_LIMITS.yearsMin, Math.trunc(years) || 1));
  let costPerYear = 0;
  let fundingPerYear = 0;
  let costOnce = 0;
  let fundingOnce = 0;
  for (const it of items) {
    const c = amountToCents(it.amount);
    if (it.kind === 'cost') {
      if (it.period === 'year') costPerYear += c;
      else costOnce += c;
    } else if (it.period === 'year') fundingPerYear += c;
    else fundingOnce += c;
  }
  const costTotal = costOnce + costPerYear * y;
  const fundingTotal = fundingOnce + fundingPerYear * y;
  return { costPerYear, fundingPerYear, costOnce, fundingOnce, costTotal, fundingTotal, difference: fundingTotal - costTotal };
}

// ── Cleaners ────────────────────────────────────────────────────────────────

export const cleanLabel = (raw: string, max: number = BUDGET_LIMITS.itemLabel): string => cleanText(raw, max);

export function cleanYears(raw: number | string): number {
  const n = Math.trunc(Number(raw));
  if (!Number.isFinite(n)) return 1;
  return Math.min(BUDGET_LIMITS.yearsMax, Math.max(BUDGET_LIMITS.yearsMin, n));
}

// ── CSV download ─────────────────────────────────────────────────────────────

export function budgetCsv(plan: BudgetPlan, items: BudgetItem[]): string {
  const t = planTotals(items, plan.years);
  const header = ['Budget', 'Destination', 'Currency', 'Years', 'Type', 'Line', 'Amount', 'Period', 'Note'];
  const rows: Array<Array<string | number | null>> = items.map((it) => [
    plan.label,
    plan.region,
    plan.currency_code,
    plan.years,
    it.kind === 'cost' ? 'Cost' : 'Funding',
    it.label,
    amountToCents(it.amount) / 100,
    PERIOD_LABEL[it.period],
    it.note,
  ]);
  rows.push([plan.label, plan.region, plan.currency_code, plan.years, 'Total', 'Costs (whole programme)', t.costTotal / 100, '', '']);
  rows.push([plan.label, plan.region, plan.currency_code, plan.years, 'Total', 'Funding (whole programme)', t.fundingTotal / 100, '', '']);
  rows.push([plan.label, plan.region, plan.currency_code, plan.years, 'Total', 'Funding minus costs', t.difference / 100, '', 'Your own figures — not verified by GlobalStudyBoard']);
  return csvDocument([header, ...rows]);
}

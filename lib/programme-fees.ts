/**
 * A published fee for one named programme and one year.
 * A range, a semester price, or one programme’s fee stored as the university’s
 * fee does not belong here. The cost planner offers a line only when the
 * budget currency matches, and it never converts.
 */
export interface ProgrammeFee {
  /** Exactly as the country is named in lib/regions.ts. */
  country: string;
  university: string;
  programme: string;
  /** The intake the figure is for, as the programme page states it. */
  year: string;
  /** Who the page says the figure applies to. */
  appliesTo: string;
  /** Major units, the same unit a budget line stores. */
  amount: number;
  currency: string;
  /** Only a yearly figure can be added in one tap. A semester price stays out. */
  period: 'year';
  /** Shown on the line. Not the category name, and not the university’s fee. */
  lineLabel: string;
  /** Saved on the line. Names the programme and says it is not every programme. */
  note: string;
  sourceUrl: string;
  sourceLabel: string;
}

export const PROGRAMME_FEES: ProgrammeFee[] = [
  {
    country: 'Finland',
    university: 'University of Helsinki',
    programme: 'Master’s Programme in English Studies',
    year: 'autumn 2027',
    appliesTo: 'non-EU/EEA citizens',
    amount: 13000,
    currency: 'EUR',
    period: 'year',
    lineLabel: 'English Studies master’s, autumn 2027',
    note: 'Master’s Programme in English Studies at the University of Helsinki, for studies starting in autumn 2027. The admissions page states 13,000 EUR per year for non-EU/EEA citizens. This is that programme’s fee, not the fee for every programme at the university.',
    sourceUrl: 'https://www.helsinki.fi/en/degree-programmes/english-studies-masters-programme/admissions',
    sourceLabel: 'University of Helsinki — Master’s Programme in English Studies, admissions',
  },
];

/** Yearly programme fees whose currency matches the budget. No conversion. */
export function programmeFeesFor(country: string | null, currency: string): ProgrammeFee[] {
  if (!country) return [];
  return PROGRAMME_FEES.filter((fee) => fee.country === country && fee.currency === currency && fee.period === 'year');
}

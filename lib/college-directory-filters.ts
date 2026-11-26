import { COLLEGE_CATEGORIES, SPECIALIZATIONS, type CollegeCategory, type Specialization } from '@/lib/college-taxonomy';

export interface CollegeFilters {
  category: CollegeCategory | 'all';
  field: Specialization | 'all';
}

const categories = new Set<string>(COLLEGE_CATEGORIES);
const fields = new Set<string>(SPECIALIZATIONS);

export function parseCollegeFilters(hash: string): CollegeFilters {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const category = params.get('cat');
  const field = params.get('field');
  return {
    category: category && categories.has(category) ? (category as CollegeCategory) : 'all',
    field: field && fields.has(field) ? (field as Specialization) : 'all',
  };
}

export function collegeFiltersHash({ category, field }: CollegeFilters): string {
  const params = new URLSearchParams();
  if (category !== 'all') params.set('cat', category);
  if (field !== 'all') params.set('field', field);
  const value = params.toString();
  return value ? `#${value}` : '';
}

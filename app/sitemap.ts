import type { MetadataRoute } from 'next';
import { REGIONS } from '@/lib/regions';
import { ENTRANCE_EXAMS } from '@/lib/admission-guides';
import { COLLEGES } from '@/lib/colleges';
import { GUIDES } from '@/lib/guides';

const BASE = 'https://www.globalstudyboard.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  return [
    { url: BASE,                  lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/regions`,     lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/colleges`,    lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/exams`,       lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/guides`,      lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/gsb-ai`,      lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/about`,       lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/contact`,     lastModified: now, changeFrequency: 'yearly',  priority: 0.4 },
    { url: `${BASE}/privacy`,     lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/terms`,       lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/disclaimer`,  lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    ...REGIONS.map((r) => ({
      url: `${BASE}/regions/${r.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
    ...ENTRANCE_EXAMS.map((e) => ({
      url: `${BASE}/exams/${e.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...COLLEGES.map((c) => ({
      url: `${BASE}/colleges/${c.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...GUIDES.map((g) => ({
      url: `${BASE}/guides/${g.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    })),
  ];
}

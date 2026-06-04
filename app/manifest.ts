import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GlobalStudyBoard — Universities, Exams & Scholarships',
    short_name: 'GlobalStudyBoard',
    description:
      'Free guide to universities, entrance exams, and scholarships worldwide — USA, UK, Europe, Canada, Australia, India and more.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFF8E7',
    theme_color: '#14532D',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}

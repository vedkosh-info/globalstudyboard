import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import AdminClient from '@/app/admin/AdminClient';

/**
 * Owner console — user management. A static shell like every other page (no
 * server cookie reads); AdminClient probes the admin API, which is the only
 * security boundary. Noindex + disallowed in robots.txt; never in the sitemap.
 */
export const metadata: Metadata = pageMetadata({
  title: 'Admin',
  description: 'Owner console for GlobalStudyBoard accounts.',
  path: '/admin',
  robots: { index: false, follow: false, nocache: true },
});

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-editorial text-ink mb-5">Accounts</h1>
      <AdminClient />
    </div>
  );
}

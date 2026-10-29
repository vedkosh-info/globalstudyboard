import { redirect } from 'next/navigation';
import { pageMetadata } from '@/lib/seo';
import { SCHOLARSHIP_UI } from '@/lib/scholarship-ui';

export const metadata = pageMetadata({ title: SCHOLARSHIP_UI.title, description: SCHOLARSHIP_UI.intro, path: '/tools/scholarship-tracker/report', robots: { index: false, follow: false } });
export default function ScholarshipReportPage() { redirect('/tools/scholarship-tracker'); }

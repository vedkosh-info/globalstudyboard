import { redirect } from 'next/navigation';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({ title: 'Application Check report', description: 'Download a copy of your programme check in the tool.', path: '/tools/application-check/report', robots: { index: false, follow: false } });

export default function ApplicationCheckReportPage() {
  redirect('/tools/application-check');
}

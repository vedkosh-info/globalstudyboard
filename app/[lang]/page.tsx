import type { Metadata } from 'next';
import Link from 'next/link';
import { GraduationCap, Globe, BookOpen, FileText } from 'lucide-react';

import { COLLEGES } from '@/lib/colleges';
import { ENTRANCE_EXAMS } from '@/lib/admission-guides';
import GoogleAd from '@/components/GoogleAd';

export const revalidate = false;

export const metadata: Metadata = {
  title: 'GlobalStudyBoard — College Admission Guide',
  description:
    'Explore IITs, NITs, IIMs, and top global universities. Complete entrance exam guides for JEE, NEET, CAT, GRE, GMAT, and more.',
};

const CATEGORIES = [
  {
    icon: GraduationCap,
    title: 'Indian Colleges',
    desc: 'IITs, NITs, IIMs, AIIMS, NLUs and top universities',
    href: '/colleges/india',
    count: '1,000+ colleges',
    bg: 'bg-brand-50',
    border: 'border-brand-200',
    iconColor: 'text-brand-600',
  },
  {
    icon: Globe,
    title: 'Study Abroad',
    desc: 'USA, UK, Canada, Australia, Germany and beyond',
    href: '/colleges/abroad',
    count: '500+ universities',
    bg: 'bg-gold-50',
    border: 'border-gold-200',
    iconColor: 'text-gold-600',
  },
  {
    icon: FileText,
    title: 'Entrance Exams',
    desc: 'JEE, NEET, CAT, CLAT, GRE, GMAT, SAT, IELTS',
    href: '/exams',
    count: '50+ exams covered',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    iconColor: 'text-slate-600',
  },
  {
    icon: BookOpen,
    title: 'Admission Guides',
    desc: 'Step-by-step guides for every exam and college',
    href: '/guides',
    count: '200+ guides',
    bg: 'bg-brand-50',
    border: 'border-brand-100',
    iconColor: 'text-brand-500',
  },
];

const QUICK_ACCESS = [
  { label: 'JEE Main', href: '/exams/jee-main' },
  { label: 'JEE Advanced', href: '/exams/jee-advanced' },
  { label: 'NEET UG', href: '/exams/neet-ug' },
  { label: 'CAT', href: '/exams/cat' },
  { label: 'CLAT', href: '/exams/clat' },
  { label: 'IELTS', href: '/exams/ielts' },
  { label: 'GMAT', href: '/exams/gmat' },
  { label: 'GRE', href: '/exams/gre' },
  { label: 'IIT Bombay', href: '/colleges/iit-bombay' },
  { label: 'IIT Delhi', href: '/colleges/iit-delhi' },
  { label: 'IIM Ahmedabad', href: '/colleges/iim-ahmedabad' },
  { label: 'AIIMS Delhi', href: '/colleges/aiims-delhi' },
  { label: 'Study in USA', href: '/colleges/abroad/usa' },
  { label: 'Study in UK', href: '/colleges/abroad/uk' },
  { label: 'Study in Canada', href: '/colleges/abroad/canada' },
];

const INDIAN_COLLEGES = COLLEGES.filter((c) => c.country === 'india').slice(0, 6);
const GLOBAL_COLLEGES = COLLEGES.filter((c) => c.country !== 'india').slice(0, 3);
const FEATURED_EXAMS = ENTRANCE_EXAMS.filter((e) =>
  ['jee-main', 'jee-advanced', 'neet-ug', 'cat', 'gre', 'ielts'].includes(e.id)
);

export default function HomePage() {
  return (
    <div className="space-y-14">

      {/* Hero */}
      <section className="text-center py-12 px-4 bg-brand-600 rounded-2xl text-white -mx-4 md:mx-0">
        <h1 className="text-3xl md:text-5xl font-bold font-display text-white mb-4">
          Your Complete College Admission Guide
        </h1>
        <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
          Explore colleges, understand entrance exams, and find the right path —
          for Indian universities and institutions worldwide.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/colleges/india"
            className="bg-gold-500 hover:bg-gold-400 text-brand-900 font-semibold px-6 py-3 rounded-lg no-underline transition-colors"
          >
            Explore Indian Colleges
          </Link>
          <Link
            href="/colleges/abroad"
            className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg no-underline transition-colors border border-white/20"
          >
            Study Abroad Guide
          </Link>
        </div>
      </section>

      {/* Quick Access */}
      <section>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Quick Access
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK_ACCESS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white border border-slate-200 hover:border-brand-400 hover:bg-brand-50 text-slate-600 hover:text-brand-700 text-sm px-4 py-1.5 rounded-full no-underline transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Browse Categories */}
      <section>
        <h2 className="text-2xl font-bold text-brand-700 mb-6">Browse by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className={`${cat.bg} ${cat.border} border rounded-xl p-5 no-underline hover:shadow-md transition-shadow group block`}
            >
              <cat.icon className={`${cat.iconColor} w-8 h-8 mb-3`} />
              <h3 className="font-bold text-slate-800 group-hover:text-brand-600 transition-colors mb-1">
                {cat.title}
              </h3>
              <p className="text-slate-500 text-sm mb-2">{cat.desc}</p>
              <span className="text-xs font-medium text-brand-500">{cat.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Ad slot — after categories */}
      <GoogleAd slot="REPLACE_WITH_SLOT_ID" className="rounded-xl overflow-hidden" />

      {/* Top Indian Colleges */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-brand-700">Top Indian Colleges</h2>
          <Link href="/colleges/india" className="text-sm text-brand-500 hover:text-brand-700">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INDIAN_COLLEGES.map((college) => (
            <Link
              key={college.id}
              href={`/colleges/${college.slug}`}
              className="bg-white border border-slate-200 rounded-xl p-5 no-underline hover:border-brand-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-500 bg-brand-50 px-2 py-0.5 rounded">
                  {college.type.toUpperCase()}
                </span>
                {college.ranking?.nirf && (
                  <span className="text-xs text-slate-400">NIRF #{college.ranking.nirf}</span>
                )}
              </div>
              <h3 className="font-bold text-slate-800 group-hover:text-brand-600 transition-colors text-sm leading-snug mb-1">
                {college.nameEn}
              </h3>
              <p className="text-slate-400 text-xs">
                {college.city}, {college.state}
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {college.admissionExams.map((exam) => (
                  <span key={exam} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {exam}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Ad slot — after Indian colleges */}
      <GoogleAd slot="REPLACE_WITH_SLOT_ID_2" className="rounded-xl overflow-hidden" />

      {/* Featured Entrance Exams */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-brand-700">Entrance Exam Guides</h2>
          <Link href="/exams" className="text-sm text-brand-500 hover:text-brand-700">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURED_EXAMS.map((exam) => (
            <Link
              key={exam.id}
              href={`/exams/${exam.slug}`}
              className="bg-white border border-slate-200 rounded-xl p-5 no-underline hover:border-gold-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-brand-700 text-lg group-hover:text-brand-500 transition-colors">
                  {exam.shortName}
                </span>
                <span className="text-xs text-slate-400 capitalize">{exam.region}</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed mb-3 line-clamp-2">
                {exam.descriptionEn.slice(0, 100)}…
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{exam.frequency}</span>
                <span>·</span>
                <span className="capitalize">{exam.domain}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Global Universities */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-brand-700">Top Global Universities</h2>
          <Link href="/colleges/abroad" className="text-sm text-brand-500 hover:text-brand-700">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {GLOBAL_COLLEGES.map((college) => (
            <Link
              key={college.id}
              href={`/colleges/${college.slug}`}
              className="bg-gradient-to-br from-brand-600 to-brand-800 text-white rounded-xl p-5 no-underline hover:from-brand-500 hover:to-brand-700 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gold-300">
                  {college.country.toUpperCase()}
                </span>
                {college.ranking?.qs && (
                  <span className="text-xs text-white/60">QS #{college.ranking.qs}</span>
                )}
              </div>
              <h3 className="font-bold text-white text-sm leading-snug mb-1">{college.nameEn}</h3>
              <p className="text-white/60 text-xs">{college.city} · Est. {college.established}</p>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}

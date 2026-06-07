import Link from 'next/link';
import { TOPICS } from '@/lib/topics';

const FEATURED_TOPIC_SLUGS = [
  'jee', 'neet', 'mba', 'government-exams', 'study-abroad',
  'engineering', 'law', 'courses-after-12th', 'commerce-and-finance',
];

const POPULAR_GUIDES = [
  { href: '/guides/how-to-get-into-iit', label: 'How to get into IIT', emoji: '🎓' },
  { href: '/guides/how-to-become-a-doctor-in-india', label: 'Become a doctor', emoji: '🏥' },
  { href: '/guides/how-to-study-in-usa-from-india', label: 'Study in USA', emoji: '✈️' },
  { href: '/guides/how-to-prepare-for-upsc', label: 'UPSC preparation', emoji: '🏛️' },
  { href: '/guides/cat-exam-eligibility-and-pattern', label: 'CAT exam guide', emoji: '📊' },
  { href: '/guides/how-to-write-statement-of-purpose', label: 'Write an SOP', emoji: '✍️' },
  { href: '/guides/career-options-after-12th-science', label: 'After 12th Science', emoji: '🔬' },
  { href: '/guides/scholarships-for-indian-students-abroad', label: 'Scholarships abroad', emoji: '🎁' },
];

interface PageQuickLinksProps {
  /** Current page path — used to filter itself out of the popular guides list. */
  currentPath?: string;
}

export default function PageQuickLinks({ currentPath }: PageQuickLinksProps) {
  const featuredTopics = FEATURED_TOPIC_SLUGS
    .map((slug) => TOPICS.find((t) => t.slug === slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const guides = POPULAR_GUIDES.filter((g) => g.href !== currentPath);

  return (
    <div style={{ marginTop: '40px' }} className="no-print">

      {/* Popular topics */}
      <div style={{
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '16px',
        padding: '16px 20px',
        marginBottom: '12px',
      }}>
        <p style={{
          fontSize: '0.6875rem', fontWeight: 700, color: '#14532D',
          margin: '0 0 12px',
          textTransform: 'uppercase', letterSpacing: '0.12em',
          fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
        }}>
          🔗 Quick links — popular topics
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {featuredTopics.map((t) => (
            <Link
              key={t.slug}
              href={`/topics/${t.slug}`}
              style={{
                background: '#fff',
                border: '1px solid #bbf7d0',
                color: '#14532D',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
              }}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Popular guides */}
      <div style={{
        background: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: '16px',
        padding: '16px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <p style={{
            fontSize: '0.6875rem', fontWeight: 700, color: '#92400e',
            margin: 0,
            textTransform: 'uppercase', letterSpacing: '0.12em',
            fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
          }}>
            📖 Popular guides
          </p>
          <Link
            href="/guides"
            style={{
              fontSize: '0.6875rem', fontWeight: 700, color: '#14532D',
              textDecoration: 'none', whiteSpace: 'nowrap',
              fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
            }}
          >
            View all →
          </Link>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {guides.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              style={{
                background: '#fff',
                border: '1px solid #fde68a',
                color: '#92400e',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
              }}
            >
              {g.emoji} {g.label}
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}

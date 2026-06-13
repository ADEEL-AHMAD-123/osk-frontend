import type { Metadata } from 'next';
import Link from 'next/link';
import type { SiteSettings } from '@contracts';
import { Button } from '@/components/ui';
import { FETCH_TAGS, serverFetch } from '@/lib/serverApi';
import styles from '../_marketing.module.scss';

export const metadata: Metadata = {
  title: 'About',
  description: 'The story, values, and people behind the platform.',
};

const VALUES = [
  {
    title: 'Curated, not crowded',
    copy: 'Every listing is reviewed by a person before it goes live. We keep the catalog tight so what you find is worth your time.',
  },
  {
    title: 'Direct lines',
    copy: 'No spam middlemen. You talk to owners and verified agents by chat, call, WhatsApp or email — your call.',
  },
  {
    title: 'Privacy first',
    copy: 'Your details stay with the listing owner. Numbers are masked, emails are relayed, consent is logged.',
  },
];

/* Generic fallback stats, used only when the admin hasn't filled in
 * the four homeStats slots under /admin/settings. */
const FALLBACK_STATS = [
  { value: '—', label: 'Curated listings' },
  { value: '—', label: 'Verified agents' },
  { value: '—', label: 'Active markets' },
  { value: '—', label: 'Closed last year' },
];

export default async function AboutPage() {
  const settings = await serverFetch<SiteSettings>('/settings', 60, [
    FETCH_TAGS.siteSettings,
  ]);
  const companyName = settings?.companyName?.trim() || 'us';
  const stats =
    settings?.homeStats && settings.homeStats.length === 4
      ? settings.homeStats
      : FALLBACK_STATS;

  return (
    <section className={styles.page}>
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.bloomA} />
        <div className={styles.bloomB} />
      </div>

      <header className={styles.header}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden="true" />
          About {companyName}
        </p>
        <h1 className={styles.title}>
          A better way to <em>find a home.</em>
        </h1>
        <p className={styles.lede}>
          {companyName} is a curated real-estate platform. We bring together owners,
          verified agents and serious buyers — and we keep the experience quiet, honest,
          and direct.
        </p>
      </header>

      <div className={styles.body}>
        <dl className={styles.stats}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <dt className={styles.statValue}>{stat.value}</dt>
              <dd className={styles.statLabel}>{stat.label}</dd>
            </div>
          ))}
        </dl>

        <section className={styles.section}>
          <span className={styles.sectionEyebrow}>What we believe</span>
          <h2 className={styles.sectionTitle}>Three things shape every page</h2>
          <div className={styles.cards}>
            {VALUES.map((value) => (
              <div key={value.title} className={styles.card}>
                <span className={styles.cardIcon} aria-hidden="true">
                  <svg viewBox="0 0 16 16" width="18" height="18">
                    <path
                      d="M3 8.5l3 3 7-7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <h3 className={styles.cardTitle}>{value.title}</h3>
                <p className={styles.cardCopy}>{value.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <div className={styles.cta}>
          <div className={styles.ctaCopy}>
            <h2 className={styles.ctaTitle}>List a property with {companyName}</h2>
            <p className={styles.ctaSub}>
              Reach serious buyers — and stay in control of how people contact you.
            </p>
          </div>
          <div className={styles.ctaActions}>
            <Link href="/sell">
              <Button size="lg">Start a listing</Button>
            </Link>
            <Link href="/contact" className={styles.ctaGhost}>
              Talk to us →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

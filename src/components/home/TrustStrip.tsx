import styles from './TrustStrip.module.scss';

const STATS = [
  { value: '12,400+', label: 'Curated listings' },
  { value: '850+', label: 'Verified agents' },
  { value: '40+', label: 'U.S. markets' },
  { value: '$4.2B', label: 'Closed last year' },
];

/** Slim trust bar that sits right below the hero. Server component. */
export function TrustStrip() {
  return (
    <section className={styles.section} aria-label="OSK at a glance">
      <dl className={styles.grid}>
        {STATS.map((stat) => (
          <div key={stat.label} className={styles.cell}>
            <dt className={styles.value}>{stat.value}</dt>
            <dd className={styles.label}>{stat.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

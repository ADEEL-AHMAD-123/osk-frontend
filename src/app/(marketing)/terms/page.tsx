import type { Metadata } from 'next';
import styles from '../_marketing.module.scss';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms under which OSK provides the platform.',
};

export default function TermsPage() {
  return (
    <section className={styles.page}>
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.bloomA} />
      </div>

      <header className={styles.header}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden="true" />
          Terms
        </p>
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.lede}>
          These terms govern your use of the OSK platform. Please read them
          carefully. Effective date:{' '}
          {new Date('2026-01-01').toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
          .
        </p>
      </header>

      <article className={styles.prose}>
        <h2>1. Acceptance</h2>
        <p>
          By accessing or using OSK, you agree to be bound by these Terms. If
          you don’t agree, please don’t use the service.
        </p>

        <h2>2. Eligibility</h2>
        <p>
          You must be at least 18 years old and able to enter into a binding
          contract to create an account. By signing up, you confirm that the
          information you provide is accurate and complete.
        </p>

        <h2>3. Listings</h2>
        <p>
          You may only list properties you own or are authorized to represent.
          All listings must be accurate and comply with applicable law. We
          reserve the right to review, edit, or remove listings that don’t
          meet our standards.
        </p>

        <h2>4. User conduct</h2>
        <p>
          You agree not to misuse the platform — including spamming other
          users, scraping content, impersonating others, or interfering with
          the security or operation of the service.
        </p>

        <h2>5. Content & intellectual property</h2>
        <p>
          You retain ownership of the content you upload. By uploading, you
          grant OSK a non-exclusive, worldwide license to display and
          distribute that content on the platform.
        </p>

        <h2>6. Disclaimers</h2>
        <p>
          OSK provides the platform “as is” and makes no warranties about
          listing accuracy. We are not a party to any transaction between
          buyers and sellers and do not provide legal, financial, or tax
          advice.
        </p>

        <h2>7. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, OSK and its affiliates are
          not liable for any indirect, incidental, or consequential damages
          arising out of your use of the service.
        </p>

        <h2>8. Termination</h2>
        <p>
          We may suspend or terminate your account if you violate these Terms
          or applicable law. You may delete your account at any time.
        </p>

        <h2>9. Changes</h2>
        <p>
          We may update these Terms from time to time. Material changes will
          be communicated via email or in-app notice.
        </p>

        <h2>10. Contact</h2>
        <p>
          Questions? Reach our team through{' '}
          <a href="/contact">the contact form</a> or at{' '}
          <a href="mailto:legal@osk.dev">legal@osk.dev</a>.
        </p>
      </article>
    </section>
  );
}

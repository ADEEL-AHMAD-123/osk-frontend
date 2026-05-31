import type { Metadata } from 'next';
import styles from '../_marketing.module.scss';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How OSK collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <section className={styles.page}>
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.bloomA} />
      </div>

      <header className={styles.header}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden="true" />
          Privacy
        </p>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.lede}>
          This summary explains how OSK collects, uses, and protects your
          information. Effective date:{' '}
          {new Date('2026-01-01').toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
          .
        </p>
      </header>

      <article className={styles.prose}>
        <h2>1. What we collect</h2>
        <p>
          We collect the information you give us directly — your name, email
          address, phone number (if you share it), the listings you save, and
          the inquiries you send. We also collect usage data (pages viewed,
          actions taken) and basic device information for security and
          analytics.
        </p>

        <h2>2. How we use it</h2>
        <p>
          Your information is used to operate the platform: to surface
          relevant listings, deliver your inquiries to the right owner or
          agent, prevent fraud and abuse, and improve our product over time.
          We do not sell your personal information.
        </p>

        <h2>3. Communication preferences</h2>
        <p>
          When you submit an inquiry, we share your contact details with the
          listing owner so they can respond. You can unsubscribe from
          marketing emails at any time using the link in any message we send.
        </p>

        <h2>4. Cookies & analytics</h2>
        <p>
          We use a small set of first-party cookies for sign-in, theme
          preference, and aggregate analytics. You can manage cookie
          preferences from your browser settings.
        </p>

        <h2>5. Data retention</h2>
        <p>
          We retain account information while your account is active and for a
          reasonable period afterwards as required by law. You can request
          deletion of your account and associated personal data at any time.
        </p>

        <h2>6. Your rights</h2>
        <p>
          Depending on where you live, you may have the right to access,
          correct, delete or export your personal information. To exercise
          these rights, email <a href="mailto:privacy@osk.dev">privacy@osk.dev</a>.
        </p>

        <h2>7. Contact</h2>
        <p>
          Questions about this policy? Reach our team at{' '}
          <a href="mailto:privacy@osk.dev">privacy@osk.dev</a> or through{' '}
          <a href="/contact">our contact form</a>.
        </p>
      </article>
    </section>
  );
}

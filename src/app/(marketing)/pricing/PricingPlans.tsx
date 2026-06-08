'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PROVIDER_KEYS,
  PROVIDER_LABELS,
  type PlanFeature,
  type PlanPrice,
  type SubscriptionPlan,
} from '@contracts';
import {
  useListSubscriptionPlansQuery,
  useSubscribeMutation,
} from '@/features/subscriptions';
import { selectActiveCountry } from '@/features/geo';
import { selectCurrentUser } from '@/features/auth';
import { toastPushed } from '@/features/ui';
import { useAppSelector } from '@/store/hooks';
import { useAppDispatch } from '@/store/hooks';
import { useGetPaymentSettingsQuery } from '@/features/pricing';
import { currencyForCountry, currencySymbolForCountry } from '@/lib/geoData';
import { Button } from '@/components/ui';
import { cn } from '@/lib/cn';
import styles from './PricingPlans.module.scss';

const PAYSTACK_SUPPORTED_CURRENCIES = new Set(['NGN', 'GHS', 'ZAR', 'USD', 'KES']);

/* ─────────────────────────────────────────────────────────────────────────
 * Public pricing grid. Reads plans from the catalog, picks the price for
 * the active country's currency (falls back to the plan's first price),
 * and routes the seller into checkout. Free plans skip payment entirely.
 * ──────────────────────────────────────────────────────────────────────── */

export function PricingPlans() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const activeCountry = useAppSelector(selectActiveCountry);
  const currency = useMemo(() => currencyForCountry(activeCountry), [activeCountry]);
  const symbol = useMemo(() => currencySymbolForCountry(activeCountry), [activeCountry]);

  const { data: plans, isLoading } = useListSubscriptionPlansQuery();
  const { data: paymentSettings } = useGetPaymentSettingsQuery();
  const [subscribe, { isLoading: submitting }] = useSubscribeMutation();
  const [busyPlan, setBusyPlan] = useState<string | null>(null);

  const onPick = async (plan: SubscriptionPlan) => {
    if (!user) {
      router.push(`/sign-in?returnTo=/pricing`);
      return;
    }

    const price = pickPrice(plan.prices, currency);
    const effectivePrice = price ?? plan.prices[0];
    const checkoutCurrency = effectivePrice?.currency ?? currency;
    const isFree = !effectivePrice || effectivePrice.amount === 0;

    /* Free plans: subscribe and route to dashboard. */
    if (isFree) {
      setBusyPlan(plan.id);
      try {
        await subscribe({ planId: plan.id, currency: checkoutCurrency }).unwrap();
        router.push('/dashboard/subscription?status=success');
      } catch {
        /* handled by global toast */
      } finally {
        setBusyPlan(null);
      }
      return;
    }

    /* Paid plans: prefer an online provider when available (e.g. Paystack)
     * and only fall back to bank-transfer when it is the sole option. */
    const enabledProviders = paymentSettings?.enabledProviders?.length
      ? paymentSettings.enabledProviders
      : PROVIDER_KEYS;
    let provider =
      enabledProviders.find((p) => p !== 'bank-transfer') ??
      enabledProviders[0] ??
      PROVIDER_KEYS[0];

    /* Strict guard: never attempt Paystack for unsupported currencies. */
    if (
      provider === 'paystack' &&
      !PAYSTACK_SUPPORTED_CURRENCIES.has(checkoutCurrency.toUpperCase())
    ) {
      if (enabledProviders.includes('bank-transfer')) {
        provider = 'bank-transfer';
        dispatch(
          toastPushed(
            'info',
            `Paystack does not support ${checkoutCurrency.toUpperCase()} for this account. Continuing with bank transfer instead.`,
          ),
        );
      } else {
        dispatch(
          toastPushed(
            'error',
            `Paystack cannot process ${checkoutCurrency.toUpperCase()} for this plan. Choose another plan/currency or enable bank transfer.`,
          ),
        );
        return;
      }
    }

    setBusyPlan(plan.id);
    try {
      const result = await subscribe({
        planId: plan.id,
        currency: checkoutCurrency,
        provider,
      }).unwrap();
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        router.push('/dashboard/subscription');
      }
    } catch (err) {
      const message = String(
        (err as { data?: { error?: { message?: string } } })?.data?.error?.message ?? '',
      );
      const canFallbackToBank =
        provider !== 'bank-transfer' &&
        enabledProviders.includes('bank-transfer') &&
        /subscription currency/i.test(message);

      if (canFallbackToBank) {
        try {
          const bankResult = await subscribe({
            planId: plan.id,
            currency: checkoutCurrency,
            provider: 'bank-transfer',
          }).unwrap();
          if (bankResult.redirectUrl) {
            window.location.href = bankResult.redirectUrl;
            return;
          }
        } catch {
          /* handled by global toast */
        }
      }
      /* handled by global toast */
    } finally {
      setBusyPlan(null);
    }
  };

  if (isLoading) {
    return <p className={styles.loading}>Loading plans…</p>;
  }

  if (!plans || plans.length === 0) {
    return (
      <p className={styles.empty}>No plans have been configured yet. Check back soon.</p>
    );
  }

  return (
    <div className={styles.grid}>
      {plans.map((plan) => {
        const price = pickPrice(plan.prices, currency);
        const displayAmount = price?.amount ?? plan.prices[0]?.amount ?? 0;
        const displayCurrency = price?.currency ?? plan.prices[0]?.currency ?? 'USD';
        const displaySymbol = displayCurrency === currency ? symbol : displayCurrency;
        const isFree = displayAmount === 0;
        return (
          <article
            key={plan.id}
            className={cn(styles.card, plan.highlight && styles.cardHighlight)}
          >
            {plan.highlight ? <span className={styles.popular}>Most popular</span> : null}
            <header className={styles.cardHead}>
              <h2 className={styles.name}>{plan.name}</h2>
              {plan.tagline ? <p className={styles.tagline}>{plan.tagline}</p> : null}
              <div className={styles.priceBlock}>
                {isFree ? (
                  <span className={styles.priceFree}>Free</span>
                ) : (
                  <>
                    <span className={styles.priceAmount}>
                      {displaySymbol}
                      {displayAmount.toLocaleString('en-US')}
                    </span>
                    <span className={styles.priceCadence}>
                      /
                      {plan.interval === 'year'
                        ? 'yr'
                        : plan.interval === 'month'
                          ? 'mo'
                          : 'once'}
                    </span>
                  </>
                )}
              </div>
            </header>

            <ul className={styles.features}>
              {plan.features.map((feature, i) => (
                <FeatureRow key={i} feature={feature} />
              ))}
            </ul>

            <Button
              type="button"
              size="lg"
              disabled={submitting || busyPlan === plan.id}
              onClick={() => onPick(plan)}
              className={styles.cta}
            >
              {busyPlan === plan.id
                ? 'Starting…'
                : isFree
                  ? 'Get started'
                  : `Choose ${plan.name}`}
            </Button>
          </article>
        );
      })}
    </div>
  );
}

function FeatureRow({ feature }: { feature: PlanFeature }) {
  return (
    <li
      className={cn(
        styles.feature,
        feature.included ? styles.featureOn : styles.featureOff,
      )}
    >
      <span className={styles.featureIcon} aria-hidden="true">
        {feature.included ? '✓' : '✕'}
      </span>
      <span className={styles.featureLabel}>{feature.label}</span>
    </li>
  );
}

function pickPrice(prices: PlanPrice[], currency: string): PlanPrice | undefined {
  return prices.find((p) => p.currency === currency);
}

/* Re-export labels for dashboard fallbacks. */
export { PROVIDER_LABELS };

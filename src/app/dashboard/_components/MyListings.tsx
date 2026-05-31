'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { PropertyStatus } from '@contracts';
import {
  useListMyPropertiesQuery,
  useSubmitPropertyForReviewMutation,
} from '@/features/properties';
import { toastPushed } from '@/features/ui';
import { useAppDispatch } from '@/store/hooks';
import { Badge, Button } from '@/components/ui';
import { formatPrice, formatArea } from '@/lib/format';
import { cn } from '@/lib/cn';
import styles from './MyListings.module.scss';

const STATUS_LABEL: Record<PropertyStatus, string> = {
  draft: 'Draft',
  'pending-review': 'In review',
  approved: 'Approved',
  rejected: 'Rejected',
  published: 'Published',
  sold: 'Sold',
  archived: 'Archived',
};

const STATUS_TONE: Record<
  PropertyStatus,
  'new' | 'resale' | 'featured' | 'sold'
> = {
  draft: 'resale',
  'pending-review': 'featured',
  approved: 'new',
  rejected: 'sold',
  published: 'new',
  sold: 'sold',
  archived: 'sold',
};

const PAGE_SIZE = 12;

export function MyListings() {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, isFetching } = useListMyPropertiesQuery({
    page,
    limit: PAGE_SIZE,
  });
  const [submitForReview, submitState] = useSubmitPropertyForReviewMutation();

  const onSubmit = async (id: string) => {
    try {
      await submitForReview(id).unwrap();
      dispatch(toastPushed('success', 'Listing submitted for review.'));
    } catch {
      /* global error toast handles this */
    }
  };

  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <section className={styles.shell}>
      <header className={styles.head}>
        <div className={styles.headCopy}>
          <span className={styles.eyebrow}>Inventory</span>
          <h1 className={styles.title}>My listings</h1>
          <p className={styles.sub}>
            Edit drafts, submit for review and watch listings go live.
          </p>
        </div>
        <Link href="/dashboard/listings/new">
          <Button size="lg">+ New listing</Button>
        </Link>
      </header>

      {isLoading ? (
        <p className={styles.state}>Loading…</p>
      ) : isError ? (
        <p className={styles.state}>Couldn&rsquo;t load your listings.</p>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No listings yet</p>
          <p className={styles.emptyMsg}>
            Start a listing and your draft will appear here.
          </p>
          <Link href="/dashboard/listings/new">
            <Button size="lg">Start a listing</Button>
          </Link>
        </div>
      ) : (
        <div className={cn(styles.table, isFetching && styles.busy)}>
          <div className={styles.tableHead}>
            <span>Listing</span>
            <span>Price</span>
            <span>Size</span>
            <span>Status</span>
            <span aria-hidden="true" />
          </div>

          <ul className={styles.rows}>
            {items.map((p) => {
              const status = p.status as PropertyStatus;
              const canSubmit = status === 'draft' || status === 'rejected';
              return (
                <li key={p.id} className={styles.row}>
                  <div className={styles.cellListing}>
                    <p className={styles.listingTitle}>
                      <Link
                        href={`/property/${p.slug}`}
                        className={styles.listingLink}
                      >
                        {p.title}
                      </Link>
                    </p>
                    <p className={styles.listingMeta}>
                      {p.locality}, {p.city}
                    </p>
                  </div>
                  <div className={styles.cell}>
                    <span className={styles.cellLabel}>Price</span>
                    <span className={styles.price}>
                      {formatPrice(p.price, p.currency)}
                    </span>
                  </div>
                  <div className={styles.cell}>
                    <span className={styles.cellLabel}>Size</span>
                    <span>{formatArea(p.areaSqft) ?? '—'}</span>
                  </div>
                  <div className={styles.cell}>
                    <span className={styles.cellLabel}>Status</span>
                    <Badge tone={STATUS_TONE[status]}>
                      {STATUS_LABEL[status]}
                    </Badge>
                  </div>
                  <div className={styles.cellAction}>
                    <Link
                      href={`/dashboard/listings/${p.slug}/edit`}
                      className={styles.viewLink}
                    >
                      Edit
                    </Link>
                    {canSubmit ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={submitState.isLoading}
                        onClick={() => onSubmit(p.id)}
                      >
                        Submit
                      </Button>
                    ) : (
                      <Link
                        href={`/property/${p.slug}`}
                        className={styles.viewLink}
                      >
                        View →
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {meta && meta.pages > 1 ? (
        <nav className={styles.pager} aria-label="Pagination">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className={styles.pageInfo}>
            Page {meta.page} of {meta.pages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= meta.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </nav>
      ) : null}
    </section>
  );
}

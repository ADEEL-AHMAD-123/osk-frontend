'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import {
  createPropertySchema,
  LISTING_KINDS,
  PROPERTY_TYPES,
  type CreatePropertyDto,
  type ListingKind,
  type Property,
  type PropertyType,
} from '@contracts';
import {
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
} from '@/features/properties';
import { US_CITIES } from '@/components/home/heroSearch.data';
import { toastPushed } from '@/features/ui';
import { useAppDispatch } from '@/store/hooks';
import { Button, MediaUploader, TextField } from '@/components/ui';
import type { UploadedMedia } from '@/components/ui';
import { resolveMediaUrl } from '@/lib/mediaUrl';
import { cn } from '@/lib/cn';
import styles from './NewListingForm.module.scss';

interface MediaItem {
  url: string;
  kind: 'image' | 'video';
}

interface NewListingFormProps {
  /** When provided the form opens in edit mode and pre-fills with this property. */
  initialProperty?: Property;
}

const TYPE_LABEL: Record<PropertyType, string> = {
  home: 'Homes',
  plot: 'Plots & Land',
  commercial: 'Commercial',
  rental: 'Rentals',
};

const KIND_LABEL: Record<ListingKind, string> = {
  'new-project': 'New Project',
  resale: 'Resale',
};

/** Fallback coordinates (NYC) when the typed city isn't in US_CITIES. */
const FALLBACK_LOCATION: [number, number] = [-74.0086, 40.7163];

function resolveCoords(city: string): [number, number] {
  const match = US_CITIES.find(
    (c) => c.name.toLowerCase() === city.trim().toLowerCase(),
  );
  if (match) {
    // Stub: US_CITIES doesn't yet carry coordinates; use representative lat/lng
    // from a small lookup. Update when the city dataset gets geo.
    return CITY_COORDS[match.id] ?? FALLBACK_LOCATION;
  }
  return FALLBACK_LOCATION;
}

/** Representative coordinates for the showcase cities. Other entries fall back. */
const CITY_COORDS: Record<string, [number, number]> = {
  'new-york-ny': [-74.0086, 40.7163],
  'los-angeles-ca': [-118.3854, 34.1106],
  'miami-fl': [-80.1349, 25.7825],
  'chicago-il': [-87.6573, 41.8866],
  'austin-tx': [-97.7195, 30.2672],
  'san-francisco-ca': [-122.4365, 37.7918],
  'boston-ma': [-71.0703, 42.3585],
  'seattle-wa': [-122.3175, 47.6253],
  'denver-co': [-105.2705, 40.015],
};

interface FormValues {
  title: string;
  description: string;
  type: PropertyType;
  listingKind: ListingKind;
  price: string;
  bedrooms: string;
  bathrooms: string;
  areaSqft: string;
  locality: string;
  city: string;
  amenitiesRaw: string;
}

export function NewListingForm({ initialProperty }: NewListingFormProps = {}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [createProperty, createState] = useCreatePropertyMutation();
  const [updateProperty, updateState] = useUpdatePropertyMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEditMode = !!initialProperty;
  const isLoading = isEditMode ? updateState.isLoading : createState.isLoading;

  /* Media is managed outside react-hook-form so the uploader can push
   * updates without going through register/setValue plumbing. */
  const [media, setMedia] = useState<MediaItem[]>(() =>
    (initialProperty?.media ?? [])
      .filter((m) => m.kind === 'image' || m.kind === 'video')
      .map((m) => ({ url: m.url, kind: m.kind as 'image' | 'video' })),
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: initialProperty?.title ?? '',
      description: initialProperty?.description ?? '',
      type: initialProperty?.type ?? 'home',
      listingKind: initialProperty?.listingKind ?? 'resale',
      price: initialProperty ? String(initialProperty.price) : '',
      bedrooms:
        initialProperty?.bedrooms != null
          ? String(initialProperty.bedrooms)
          : '',
      bathrooms:
        initialProperty?.bathrooms != null
          ? String(initialProperty.bathrooms)
          : '',
      areaSqft:
        initialProperty?.areaSqft != null
          ? String(initialProperty.areaSqft)
          : '',
      locality: initialProperty?.locality ?? '',
      city: initialProperty?.city ?? '',
      amenitiesRaw: initialProperty?.amenities?.join(', ') ?? '',
    },
  });

  /* When `initialProperty` arrives after a refetch, sync the form. */
  useEffect(() => {
    if (!initialProperty) return;
    reset({
      title: initialProperty.title,
      description: initialProperty.description,
      type: initialProperty.type,
      listingKind: initialProperty.listingKind,
      price: String(initialProperty.price),
      bedrooms:
        initialProperty.bedrooms != null
          ? String(initialProperty.bedrooms)
          : '',
      bathrooms:
        initialProperty.bathrooms != null
          ? String(initialProperty.bathrooms)
          : '',
      areaSqft:
        initialProperty.areaSqft != null
          ? String(initialProperty.areaSqft)
          : '',
      locality: initialProperty.locality,
      city: initialProperty.city,
      amenitiesRaw: initialProperty.amenities.join(', '),
    });
    setMedia(
      initialProperty.media
        .filter((m) => m.kind === 'image' || m.kind === 'video')
        .map((m) => ({ url: m.url, kind: m.kind as 'image' | 'video' })),
    );
  }, [initialProperty, reset]);

  const watchType = watch('type');

  /* Per-type form behaviour. Single source of truth — change here only. */
  const isResidential = watchType === 'home' || watchType === 'rental';
  const isPlot = watchType === 'plot';
  const isCommercial = watchType === 'commercial';
  const isRental = watchType === 'rental';

  const detailsHeading = isPlot
    ? 'Land details'
    : isCommercial
      ? 'Building details'
      : 'Home details';

  const areaLabel = isPlot
    ? 'Lot size (sq ft)'
    : isCommercial
      ? 'Floor area (sq ft)'
      : 'Living area (sq ft)';

  const areaHint = isPlot
    ? 'Tip: 1 acre = 43,560 sq ft.'
    : isCommercial
      ? 'Rentable area, including common-area allocation.'
      : 'Conditioned interior square footage.';

  const amenitiesPlaceholder = isPlot
    ? 'e.g. Corner lot, Mature oaks, Utilities at road, No HOA'
    : isCommercial
      ? 'e.g. Loading dock, Elevator, Raised flooring, 24/7 access'
      : 'e.g. Doorman, Gym, Roof terrace, Bike storage';

  const priceLabel = isRental ? 'Monthly rent (USD)' : 'Price (USD)';
  const pricePlaceholder = isRental
    ? 'e.g. 4500'
    : isPlot
      ? 'e.g. 489000'
      : isCommercial
        ? 'e.g. 3450000'
        : 'e.g. 875000';

  const titlePlaceholder = isPlot
    ? '12-Acre Hill Country Parcel — Dripping Springs'
    : isCommercial
      ? 'Grade-A Office Floor — Fulton Market'
      : isRental
        ? '2-Bed Apartment with Bay Views — Pacific Heights'
        : 'Loft Residence at 17 Reade — Tribeca';

  const descriptionPlaceholder = isPlot
    ? 'Acreage, frontage, utilities, zoning, water rights, build-ready status — at least 30 characters.'
    : isCommercial
      ? 'Square footage, build class, ceiling height, parking, loading, prior use — at least 30 characters.'
      : 'Layout, neighborhood, standout features, recent renovations — at least 30 characters.';

  const descriptionHint = isPlot
    ? 'Include acreage, frontage, utilities and zoning.'
    : isCommercial
      ? 'Include floor plate, ceiling height, parking and accessibility.'
      : 'Include neighborhood, layout and standout features.';

  const localityPlaceholder = isPlot
    ? 'Sector or area name'
    : isCommercial
      ? 'Submarket — e.g. Fulton Market'
      : 'Tribeca';

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);

    /* Coerce string-form fields to the API payload shape. */
    const payload: Partial<CreatePropertyDto> = {
      title: values.title.trim(),
      description: values.description.trim(),
      type: values.type,
      listingKind: values.listingKind,
      price: Number(values.price),
      currency: 'USD',
      locality: values.locality.trim(),
      city: values.city.trim(),
      amenities: values.amenitiesRaw
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
      location: {
        type: 'Point',
        coordinates: resolveCoords(values.city),
      },
    };
    /* Only residential listings carry beds/baths — drop stale values if the
     * user filled them in then switched to a Plot or Commercial. */
    if (isResidential && values.bedrooms) {
      payload.bedrooms = Number(values.bedrooms);
    }
    if (isResidential && values.bathrooms) {
      payload.bathrooms = Number(values.bathrooms);
    }
    if (values.areaSqft) payload.areaSqft = Number(values.areaSqft);
    if (media.length > 0) payload.media = media;

    const parsed = createPropertySchema.safeParse(payload);
    if (!parsed.success) {
      setSubmitError(
        parsed.error.issues[0]?.message ?? 'Please review the form.',
      );
      return;
    }

    try {
      if (isEditMode && initialProperty) {
        await updateProperty({
          id: initialProperty.id,
          body: parsed.data,
        }).unwrap();
        dispatch(toastPushed('success', 'Listing updated.'));
      } else {
        await createProperty(parsed.data).unwrap();
        dispatch(
          toastPushed(
            'success',
            'Listing created as a draft — ready when you want to submit it.',
          ),
        );
      }
      router.push('/dashboard/listings');
    } catch {
      /* failure toast handled globally; show inline as well. */
      setSubmitError(
        isEditMode
          ? 'Couldn’t save your changes. Try again in a moment.'
          : 'Couldn’t create the listing. Try again in a moment.',
      );
    }
  };

  return (
    <section className={styles.shell}>
      <header className={styles.head}>
        <span className={styles.eyebrow}>
          {isEditMode ? 'Edit listing' : 'New listing'}
        </span>
        <h1 className={styles.title}>
          {isEditMode ? 'Edit property' : 'Add a property'}
        </h1>
        <p className={styles.sub}>
          {isEditMode
            ? 'Your changes save right away. Re-submit if the listing needs another review.'
            : 'Saved as a draft — submit when you’re ready and we’ll review it.'}
        </p>
        <Link href="/dashboard/listings" className={styles.back}>
          ← Back to listings
        </Link>
      </header>

      <form
        className={styles.form}
        onSubmit={handleSubmit(onSubmit) as (e: FormEvent) => void}
        noValidate
      >
        <fieldset className={styles.group}>
          <legend className={styles.groupTitle}>Basics</legend>
          <div className={styles.grid}>
            <TextField
              label="Listing title"
              placeholder={titlePlaceholder}
              {...register('title', { required: true, minLength: 6 })}
              error={errors.title ? 'At least 6 characters.' : undefined}
            />
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Description</span>
              <textarea
                className={styles.textarea}
                rows={5}
                placeholder={descriptionPlaceholder}
                {...register('description', { required: true, minLength: 30 })}
              />
              {errors.description ? (
                <span className={styles.fieldError}>
                  At least 30 characters.
                </span>
              ) : (
                <span className={styles.fieldHint}>Hint: {descriptionHint}</span>
              )}
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Property type</span>
              <select
                className={styles.select}
                {...register('type', { required: true })}
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Listing kind</span>
              <select
                className={styles.select}
                {...register('listingKind', { required: true })}
              >
                {LISTING_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {KIND_LABEL[k]}
                  </option>
                ))}
              </select>
            </label>
            <TextField
              label={priceLabel}
              type="number"
              inputMode="numeric"
              min={0}
              placeholder={pricePlaceholder}
              {...register('price', { required: true })}
              error={errors.price ? 'Enter a price.' : undefined}
            />
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend className={styles.groupTitle}>{detailsHeading}</legend>
          <div className={styles.grid}>
            {isResidential ? (
              <>
                <TextField
                  label="Bedrooms"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="e.g. 3"
                  {...register('bedrooms')}
                />
                <TextField
                  label="Bathrooms"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="e.g. 2"
                  {...register('bathrooms')}
                />
              </>
            ) : null}
            <TextField
              label={areaLabel}
              type="number"
              min={0}
              inputMode="numeric"
              placeholder={isPlot ? 'e.g. 522720 (12 acres)' : 'e.g. 2400'}
              hint={areaHint}
              {...register('areaSqft')}
            />
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend className={styles.groupTitle}>Location</legend>
          <div className={styles.grid}>
            <TextField
              label="Locality / neighborhood"
              placeholder={localityPlaceholder}
              {...register('locality', { required: true, minLength: 2 })}
              error={errors.locality ? 'Required.' : undefined}
            />
            <label className={styles.field}>
              <span className={styles.fieldLabel}>City</span>
              <input
                list="city-list"
                className={styles.input}
                placeholder="Start typing — e.g. New York"
                {...register('city', { required: true, minLength: 2 })}
              />
              <datalist id="city-list">
                {US_CITIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}, {c.state}
                  </option>
                ))}
              </datalist>
              {errors.city ? (
                <span className={styles.fieldError}>Required.</span>
              ) : (
                <span className={styles.fieldHint}>
                  We&rsquo;ll pin the listing to this city on the map.
                </span>
              )}
            </label>
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend className={styles.groupTitle}>Photos &amp; video</legend>
          <MediaUploader
            accept="both"
            multiple
            label="Drop photos or a video, or browse"
            hint="JPG / PNG / WebP up to 12 MB, MP4 / WebM up to 150 MB. First image becomes the cover."
            disabled={media.length >= 20}
            onUploaded={(uploaded: UploadedMedia[]) =>
              setMedia((prev) => [
                ...prev,
                ...uploaded.map((u) => ({ url: u.url, kind: u.kind })),
              ])
            }
          />
          {media.length > 0 ? (
            <ul className={styles.mediaGrid}>
              {media.map((m, i) => (
                <li
                  key={`${m.url}-${i}`}
                  className={styles.mediaTile}
                >
                  {m.kind === 'video' ? (
                    <video
                      src={resolveMediaUrl(m.url)}
                      className={styles.mediaPreview}
                      muted
                      playsInline
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveMediaUrl(m.url)}
                      alt={`Listing media ${i + 1}`}
                      className={styles.mediaPreview}
                    />
                  )}
                  {i === 0 ? (
                    <span className={styles.mediaCover}>Cover</span>
                  ) : null}
                  <button
                    type="button"
                    className={styles.mediaRemove}
                    onClick={() =>
                      setMedia((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    aria-label="Remove media"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </fieldset>

        <fieldset className={styles.group}>
          <legend className={styles.groupTitle}>Amenities</legend>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Comma-separated</span>
            <input
              className={styles.input}
              placeholder={amenitiesPlaceholder}
              {...register('amenitiesRaw')}
            />
            <span className={styles.fieldHint}>
              Optional — separate items with commas. We&rsquo;ll render each as
              a chip.
            </span>
          </label>
        </fieldset>

        {submitError ? (
          <p className={styles.formError} role="alert">
            {submitError}
          </p>
        ) : null}

        <div className={styles.actions}>
          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading
              ? 'Saving…'
              : isEditMode
                ? 'Save changes'
                : 'Create listing'}
          </Button>
          <Link href="/dashboard/listings" className={cn(styles.ghost)}>
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}

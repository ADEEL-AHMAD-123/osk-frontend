'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema, type UpdateProfileDto } from '@contracts';
import { useGetMeQuery, useUpdateMeMutation } from '@/features/users';
import { toastPushed } from '@/features/ui';
import { useAppDispatch } from '@/store/hooks';
import { Button, MediaUploader, TextField } from '@/components/ui';
import type { UploadedMedia } from '@/components/ui';
import { resolveMediaUrl } from '@/lib/mediaUrl';
import styles from './ProfileEditor.module.scss';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function ProfileEditor() {
  const dispatch = useAppDispatch();
  const { data: me, isLoading, isError } = useGetMeQuery();
  const [updateMe, { isLoading: saving }] = useUpdateMeMutation();
  const [success, setSuccess] = useState(false);

  /* Avatar is tracked outside react-hook-form so the MediaUploader can drive
   * it without re-renders fighting the form's controlled inputs. */
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [avatarDirty, setAvatarDirty] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileDto>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: '', avatarUrl: '' },
  });

  /* Sync form + avatar state when the profile loads. */
  useEffect(() => {
    if (me) {
      reset({ name: me.name, avatarUrl: me.avatarUrl ?? '' });
      setAvatarUrl(me.avatarUrl ?? '');
      setAvatarDirty(false);
    }
  }, [me, reset]);

  const onSubmit = async (values: UpdateProfileDto) => {
    try {
      await updateMe({ ...values, avatarUrl: avatarUrl || undefined }).unwrap();
      setSuccess(true);
      setAvatarDirty(false);
      dispatch(toastPushed('success', 'Profile saved.'));
      window.setTimeout(() => setSuccess(false), 2500);
    } catch {
      /* surfaced by the global toast */
    }
  };

  const onAvatarUploaded = (uploaded: UploadedMedia[]) => {
    const first = uploaded[0];
    if (!first) return;
    setAvatarUrl(first.url);
    setAvatarDirty(true);
    dispatch(toastPushed('success', 'Avatar uploaded — save to apply.'));
  };

  const removeAvatar = () => {
    if (!avatarUrl) return;
    setAvatarUrl('');
    setAvatarDirty(true);
  };

  const canSave = !saving && (isDirty || avatarDirty);

  return (
    <section className={styles.shell}>
      <header className={styles.head}>
        <span className={styles.eyebrow}>Account</span>
        <h1 className={styles.title}>Profile</h1>
        <p className={styles.sub}>
          Update how your name and avatar appear across listings and inquiries.
        </p>
      </header>

      <div className={styles.card}>
        {isLoading ? (
          <p className={styles.muted}>Loading…</p>
        ) : isError || !me ? (
          <p className={styles.muted}>Couldn&rsquo;t load your profile.</p>
        ) : (
          <form
            className={styles.form}
            onSubmit={handleSubmit(onSubmit) as (e: FormEvent) => void}
            noValidate
          >
            <div className={styles.identity}>
              <span className={styles.avatar} aria-hidden="true">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resolveMediaUrl(avatarUrl)} alt="" />
                ) : (
                  initials(me.name)
                )}
              </span>
              <div className={styles.identityCopy}>
                <p className={styles.identityName}>{me.name}</p>
                <p className={styles.identityRole}>
                  {me.email} · {me.role}
                </p>
                {avatarUrl ? (
                  <button
                    type="button"
                    className={styles.removeAvatar}
                    onClick={removeAvatar}
                  >
                    Remove avatar
                  </button>
                ) : null}
              </div>
            </div>

            <div className={styles.uploadField}>
              <span className={styles.uploadLabel}>Avatar</span>
              <MediaUploader
                accept="image"
                multiple={false}
                label="Drop a photo or click to browse"
                hint="JPG, PNG, WEBP or AVIF — at least 200×200 px."
                onUploaded={onAvatarUploaded}
              />
            </div>

            <TextField
              label="Full name"
              autoComplete="name"
              {...register('name')}
              error={errors.name?.message}
            />

            {/* Keep avatarUrl in the form so server-side validation messages
             * surface if the URL is ever rejected. */}
            <input type="hidden" value={avatarUrl} {...register('avatarUrl')} />

            <div className={styles.actions}>
              <Button type="submit" size="lg" disabled={!canSave}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
              {success ? (
                <span className={styles.ok} role="status">
                  Saved
                </span>
              ) : null}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

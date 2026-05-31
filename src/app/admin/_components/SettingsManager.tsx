'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { THEMES, type SiteSettings, type ThemeName } from '@contracts';
import {
  useGetSiteSettingsQuery,
  useUpdateSiteSettingsMutation,
} from '@/features/settings';
import { Button, MediaUploader, TextField } from '@/components/ui';
import type { UploadedMedia } from '@/components/ui';
import { resolveMediaUrl } from '@/lib/mediaUrl';
import { useAppDispatch } from '@/store/hooks';
import { toastPushed } from '@/features/ui';
import { cn } from '@/lib/cn';
import styles from './SettingsManager.module.scss';

const THEME_LABELS: Record<ThemeName, { label: string; tagline: string }> = {
  'theme-luxe-light': { label: 'Luxe Light', tagline: 'Editorial · default' },
  'theme-luxe-dark': { label: 'Luxe Dark', tagline: 'Cinematic · low light' },
  'theme-emerald': { label: 'Emerald', tagline: 'Botanical · forest tones' },
  'theme-sandstone': { label: 'Sandstone', tagline: 'Warm · desert palette' },
};

/* Shape we render the form against — flat fields so editing is simple. */
interface FormState {
  activeTheme: ThemeName;
  companyName: string;
  logoUrl: string;
  email: string;
  phoneTel: string;
  phoneDisplay: string;
  addressLine1: string;
  addressCity: string;
  addressRegion: string;
  addressPostalCode: string;
  addressCountry: string;
}

function fromSettings(s: SiteSettings): FormState {
  return {
    activeTheme: s.activeTheme,
    companyName: s.companyName,
    logoUrl: s.logoUrl,
    email: s.contact.email,
    phoneTel: s.contact.phoneTel,
    phoneDisplay: s.contact.phoneDisplay,
    addressLine1: s.contact.addressLine1,
    addressCity: s.contact.addressCity,
    addressRegion: s.contact.addressRegion,
    addressPostalCode: s.contact.addressPostalCode,
    addressCountry: s.contact.addressCountry,
  };
}

export function SettingsManager() {
  const dispatch = useAppDispatch();
  const { data, isLoading, isError } = useGetSiteSettingsQuery();
  const [saveSettings, { isLoading: saving }] = useUpdateSiteSettingsMutation();
  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    if (data && !form) setForm(fromSettings(data));
  }, [data, form]);

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((prev) => (prev ? { ...prev, [k]: v } : prev));
  };

  const onLogoUploaded = (uploaded: UploadedMedia[]) => {
    const first = uploaded[0];
    if (!first) return;
    setField('logoUrl', first.url);
    dispatch(toastPushed('success', 'Logo uploaded — save to apply.'));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form) return;
    try {
      await saveSettings({
        activeTheme: form.activeTheme,
        companyName: form.companyName,
        logoUrl: form.logoUrl,
        contact: {
          email: form.email,
          phoneTel: form.phoneTel,
          phoneDisplay: form.phoneDisplay,
          addressLine1: form.addressLine1,
          addressCity: form.addressCity,
          addressRegion: form.addressRegion,
          addressPostalCode: form.addressPostalCode,
          addressCountry: form.addressCountry,
        },
      }).unwrap();
      dispatch(toastPushed('success', 'Settings saved — site updated.'));
    } catch {
      /* surfaced by the global toast handles the error envelope */
    }
  };

  if (isLoading || !form) {
    return (
      <section className={styles.shell}>
        <header className={styles.head}>
          <span className={styles.eyebrow}>Admin · Settings</span>
          <h1 className={styles.title}>Site settings</h1>
        </header>
        <p className={styles.muted}>Loading current settings…</p>
      </section>
    );
  }
  if (isError) {
    return (
      <section className={styles.shell}>
        <header className={styles.head}>
          <span className={styles.eyebrow}>Admin · Settings</span>
          <h1 className={styles.title}>Site settings</h1>
        </header>
        <p className={styles.muted}>Couldn&rsquo;t load the current settings.</p>
      </section>
    );
  }

  return (
    <section className={styles.shell}>
      <header className={styles.head}>
        <span className={styles.eyebrow}>Admin · Settings</span>
        <h1 className={styles.title}>Site settings</h1>
        <p className={styles.sub}>
          Change the active theme, company logo, and contact details for the whole site.
          Updates take effect immediately.
        </p>
      </header>

      <form className={styles.form} onSubmit={onSubmit}>
        {/* ── theme picker ────────────────────────────────────────────── */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Theme</h2>
          <p className={styles.sectionHint}>
            Applies to every visitor on every page. Use the previews to preview tokens —
            the live site already reflects your current choice as you scroll.
          </p>
          <div className={styles.themeGrid}>
            {THEMES.map((theme) => {
              const active = form.activeTheme === theme;
              const meta = THEME_LABELS[theme];
              return (
                <button
                  key={theme}
                  type="button"
                  className={cn(styles.themeCard, active && styles.themeCardOn)}
                  onClick={() => setField('activeTheme', theme)}
                  aria-pressed={active}
                >
                  {/* Each preview applies the target theme class to a scoped
                   * region so admins can compare without committing. */}
                  <div className={cn(styles.themePreview, theme)}>
                    <span className={styles.swatchBg} />
                    <span className={styles.swatchPrimary} />
                    <span className={styles.swatchAccent} />
                    <span className={styles.swatchCard} />
                  </div>
                  <span className={styles.themeName}>{meta.label}</span>
                  <span className={styles.themeTagline}>{meta.tagline}</span>
                  {active ? <span className={styles.activeBadge}>Active</span> : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── branding ─────────────────────────────────────────────────── */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Brand</h2>
          <TextField
            label="Company name"
            value={form.companyName}
            onChange={(e) => setField('companyName', e.target.value)}
            maxLength={80}
            required
          />

          <div className={styles.logoRow}>
            <div className={styles.logoPreview} aria-hidden="true">
              {form.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveMediaUrl(form.logoUrl)}
                  alt=""
                  className={styles.logoImg}
                />
              ) : (
                <span className={styles.logoPlaceholder}>
                  {form.companyName.slice(0, 2).toUpperCase() || 'OSK'}
                </span>
              )}
            </div>
            <div className={styles.logoControls}>
              <span className={styles.fieldLabel}>Logo</span>
              <MediaUploader
                accept="image"
                multiple={false}
                label="Drop a logo or click to browse"
                hint="PNG / SVG-as-PNG / WEBP — transparent backgrounds render best."
                onUploaded={onLogoUploaded}
              />
              {form.logoUrl ? (
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => setField('logoUrl', '')}
                >
                  Remove current logo
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* ── contact ──────────────────────────────────────────────────── */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Contact</h2>
          <p className={styles.sectionHint}>
            Surfaces in the footer, contact page, and the footer of every transactional
            email we send.
          </p>
          <div className={styles.grid2}>
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              required
            />
            <TextField
              label="Phone (display)"
              value={form.phoneDisplay}
              onChange={(e) => setField('phoneDisplay', e.target.value)}
              hint="What humans see — e.g. +1 (365) 955-7829"
              required
            />
          </div>
          <TextField
            label="Phone (tel: link)"
            value={form.phoneTel}
            onChange={(e) => setField('phoneTel', e.target.value)}
            hint="Digits and a leading + only — e.g. +13659557829"
            required
          />

          <TextField
            label="Address line 1"
            value={form.addressLine1}
            onChange={(e) => setField('addressLine1', e.target.value)}
            required
          />
          <div className={styles.grid3}>
            <TextField
              label="City"
              value={form.addressCity}
              onChange={(e) => setField('addressCity', e.target.value)}
              required
            />
            <TextField
              label="Region / state"
              value={form.addressRegion}
              onChange={(e) => setField('addressRegion', e.target.value)}
              required
            />
            <TextField
              label="Postal code"
              value={form.addressPostalCode}
              onChange={(e) => setField('addressPostalCode', e.target.value)}
              required
            />
          </div>
          <TextField
            label="Country"
            value={form.addressCountry}
            onChange={(e) => setField('addressCountry', e.target.value)}
            required
          />
        </div>

        <div className={styles.actions}>
          <Button type="submit" size="lg" disabled={saving}>
            {saving ? 'Saving…' : 'Save settings'}
          </Button>
        </div>
      </form>
    </section>
  );
}

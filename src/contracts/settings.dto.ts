import type { ThemeName } from './enums';

export interface SiteSettingsContact {
  email: string;
  phoneTel: string;
  phoneDisplay: string;
  addressLine1: string;
  addressCity: string;
  addressRegion: string;
  addressPostalCode: string;
  addressCountry: string;
}

/** Returned by GET /settings and PATCH /admin/settings. */
export interface SiteSettings {
  activeTheme: ThemeName;
  companyName: string;
  logoUrl: string;
  contact: SiteSettingsContact;
  updatedAt: string;
}

export type SiteSettingsPatch = Partial<{
  activeTheme: ThemeName;
  companyName: string;
  logoUrl: string;
  contact: Partial<SiteSettingsContact>;
}>;

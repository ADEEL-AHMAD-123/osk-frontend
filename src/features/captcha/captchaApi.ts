import { baseApi } from '@/store/api/baseApi';
import type {
  ApiSuccess,
  CaptchaPublicConfig,
  CaptchaSettingsDTO,
  UpdateCaptchaSettingsDto,
} from '@contracts';

/**
 * Captcha server state.
 *
 *  - getCaptchaConfig    → public; signup form uses this to decide
 *                          whether to mount the Turnstile widget
 *  - getCaptchaSettings  → admin-only; masked secret + readiness flag
 *  - updateCaptchaSettings → admin-only; partial PATCH
 */
export const captchaApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCaptchaConfig: build.query<CaptchaPublicConfig, void>({
      query: () => '/captcha/config',
      transformResponse: (r: ApiSuccess<CaptchaPublicConfig>) => r.data,
      providesTags: [{ type: 'CaptchaSettings', id: 'PUBLIC' }],
    }),

    getCaptchaSettings: build.query<CaptchaSettingsDTO, void>({
      query: () => '/admin/captcha',
      transformResponse: (r: ApiSuccess<CaptchaSettingsDTO>) => r.data,
      providesTags: [{ type: 'CaptchaSettings', id: 'ADMIN' }],
    }),

    updateCaptchaSettings: build.mutation<CaptchaSettingsDTO, UpdateCaptchaSettingsDto>({
      query: (body) => ({ url: '/admin/captcha', method: 'PATCH', body }),
      transformResponse: (r: ApiSuccess<CaptchaSettingsDTO>) => r.data,
      invalidatesTags: [
        { type: 'CaptchaSettings', id: 'ADMIN' },
        { type: 'CaptchaSettings', id: 'PUBLIC' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCaptchaConfigQuery,
  useGetCaptchaSettingsQuery,
  useUpdateCaptchaSettingsMutation,
} = captchaApi;

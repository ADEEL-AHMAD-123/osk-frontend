import { baseApi } from '@/store/api/baseApi';
import type { ApiSuccess, Payment } from '@contracts';

/**
 * Payments server state — list + admin confirmation only.
 *
 * Subscription checkout intents are created from inside the
 * subscriptions slice (POST /subscriptions/subscribe returns both the
 * pending subscription and the provider redirect URL in one
 * round-trip). Per-listing payment intents have been removed.
 */
export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listMyPayments: build.query<Payment[], void>({
      query: () => '/payments/mine',
      transformResponse: (r: ApiSuccess<Payment[]>) => r.data,
      providesTags: [{ type: 'Payment', id: 'MINE' }],
    }),

    /* Admin */
    listAdminPayments: build.query<Payment[], void>({
      query: () => '/payments',
      transformResponse: (r: ApiSuccess<Payment[]>) => r.data,
      providesTags: [{ type: 'Payment', id: 'ADMIN' }],
    }),

    confirmPayment: build.mutation<Payment, string>({
      query: (id) => ({ url: `/payments/${id}/confirm`, method: 'POST' }),
      transformResponse: (r: ApiSuccess<Payment>) => r.data,
      invalidatesTags: (result) =>
        result
          ? [
              { type: 'Payment' as const, id: result.id },
              { type: 'Payment' as const, id: 'ADMIN' },
              { type: 'Payment' as const, id: 'MINE' },
              /* Subscription payments resolve to a subscription activation,
               * so invalidate the user's current subscription too. */
              { type: 'Subscription' as const, id: 'CURRENT' },
            ]
          : [{ type: 'Payment' as const, id: 'ADMIN' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListMyPaymentsQuery,
  useListAdminPaymentsQuery,
  useConfirmPaymentMutation,
} = paymentsApi;

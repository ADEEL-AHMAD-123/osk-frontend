'use client';

import { useRef, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { makeStore, type AppStore } from './index';

/**
 * Client boundary that owns the Redux store. Created once per client via a
 * ref so the store survives re-renders but is never shared across requests.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  storeRef.current ??= makeStore();

  return <Provider store={storeRef.current}>{children}</Provider>;
}

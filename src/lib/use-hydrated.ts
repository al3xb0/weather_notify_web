import { useSyncExternalStore } from 'react';

const noop = () => () => {};

/** Returns false during SSR / first hydration render, true afterwards. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

'use client';

import { useEffect } from 'react';
import { refreshSession } from '@/lib/api';
import { useAuthStore, type AuthStatus } from '@/store/auth';

/**
 * Recover the session once per page load: the access token lives in memory, so
 * after a reload the only thing left is the httpOnly refresh cookie. Resolves
 * `status` away from `unknown` either way — authenticated on success, anonymous
 * when there is no usable cookie.
 */
export function useAuthBootstrap(): AuthStatus {
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status === 'unknown') {
      void refreshSession();
    }
  }, [status]);

  return status;
}

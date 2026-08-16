'use client';

import { create } from 'zustand';

/**
 * Session state, held in memory only and gone on reload — the tab recovers it
 * from the httpOnly refresh cookie instead (see `useAuthBootstrap`). Persisting
 * the access token to localStorage would hand a working session to any script
 * that manages to run on the page, which is precisely what the httpOnly cookie
 * exists to prevent.
 *
 * `status` is what the UI gates on: `unknown` means the recovery attempt has
 * not finished yet, and must not be mistaken for signed out.
 */
export type AuthStatus = 'unknown' | 'authenticated' | 'anonymous';

interface AuthState {
  accessToken: string | null;
  email: string | null;
  status: AuthStatus;
  setSession: (accessToken: string, email?: string | null) => void;
  setAccessToken: (token: string | null) => void;
  setEmail: (email: string | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  email: null,
  status: 'unknown',
  setSession: (accessToken, email) =>
    set((state) => ({
      accessToken,
      status: 'authenticated',
      email: email ?? state.email,
    })),
  setAccessToken: (accessToken) =>
    set({
      accessToken,
      status: accessToken ? 'authenticated' : 'anonymous',
    }),
  setEmail: (email) => set({ email }),
  clear: () => set({ accessToken: null, email: null, status: 'anonymous' }),
}));

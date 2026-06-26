'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tokens } from '@/lib/types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  email: string | null;
  setTokens: (tokens: Tokens) => void;
  setEmail: (email: string | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      email: null,
      setTokens: (tokens) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }),
      setEmail: (email) => set({ email }),
      clear: () => set({ accessToken: null, refreshToken: null, email: null }),
    }),
    { name: 'wn-auth' },
  ),
);

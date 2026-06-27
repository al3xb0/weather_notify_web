'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Only the short-lived access token is persisted. The refresh token lives in an
// httpOnly cookie set by the API, so it is never exposed to JS (XSS-resistant).
interface AuthState {
  accessToken: string | null;
  email: string | null;
  setAccessToken: (token: string | null) => void;
  setEmail: (email: string | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      email: null,
      setAccessToken: (accessToken) => set({ accessToken }),
      setEmail: (email) => set({ email }),
      clear: () => set({ accessToken: null, email: null }),
    }),
    { name: 'wn-auth' },
  ),
);

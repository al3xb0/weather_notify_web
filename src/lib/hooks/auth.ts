'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import type { AuthResponse } from '@/lib/types';
import { queryKeys } from './query-keys';

export async function register(email: string, password: string) {
  const { data } = await api.post<AuthResponse>('/auth/register', {
    email,
    password,
  });
  useAuthStore.getState().setSession(data.accessToken, email);
}

export async function login(email: string, password: string) {
  const { data } = await api.post<AuthResponse>('/auth/login', {
    email,
    password,
  });
  useAuthStore.getState().setSession(data.accessToken, email);
}

export async function logout() {
  // Refresh cookie is sent automatically; the server clears it.
  await api.post('/auth/logout').catch(() => undefined);
  useAuthStore.getState().clear();
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (token: string) => {
      await api.post('/auth/verify-email', { token });
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      // Always resolves for a valid address, known or not — the API answers
      // identically on purpose, so the UI must not infer anything from it.
      const { data } = await api.post<{ accepted: boolean }>(
        '/auth/forgot-password',
        { email },
      );
      return data;
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (input: { token: string; password: string }) => {
      await api.post('/auth/reset-password', input);
      // Every session was just revoked server-side, including this tab's if it
      // had one. Drop the in-memory token so the UI does not keep showing a
      // signed-in shell around a session the API will refuse.
      useAuthStore.getState().clear();
    },
  });
}

export function useResendVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ sent: boolean }>(
        '/auth/resend-verification',
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.profile }),
  });
}

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import type { Profile } from '@/lib/types';
import { freshness, queryKeys } from './query-keys';

/**
 * `enabled` lets the app shell hold the request until the session has been
 * restored, so a reload does not spend a guaranteed 401 to discover it.
 */
export function useProfile(enabled = true) {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: async () => {
      const { data } = await api.get<Profile>('/users/me');
      return data;
    },
    enabled,
    ...freshness.profile,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      quietHoursStart?: string | null;
      quietHoursEnd?: string | null;
      timezone?: string | null;
    }) => {
      const { data } = await api.patch<Profile>('/users/me', input);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.profile }),
  });
}

export function useTelegramLink() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ url: string; token: string }>(
        '/users/me/telegram-link',
      );
      return data;
    },
  });
}

export function useUnlinkTelegram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.delete('/users/me/telegram');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.profile }),
  });
}

export function useAddPushSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sub: {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    }) => {
      await api.post('/users/me/push', sub);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.profile }),
  });
}

export function useRemovePushSubscription() {
  return useMutation({
    mutationFn: async (endpoint: string) => {
      await api.delete('/users/me/push', { data: { endpoint } });
    },
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (password: string) => {
      await api.delete('/users/me', { data: { password } });
      useAuthStore.getState().clear();
      // Nothing in the cache belongs to anyone now, and leaving it would let a
      // subsequent sign-in briefly render the deleted account's data.
      qc.clear();
    },
  });
}

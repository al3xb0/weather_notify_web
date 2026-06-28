'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import type {
  AuthResponse,
  Channel,
  Metric,
  NotificationItem,
  Operator,
  Paginated,
  Profile,
  Trigger,
} from '@/lib/types';

export interface TriggerInput {
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  metric: Metric;
  operator: Operator;
  threshold: number;
  channels: Channel[];
  cooldownMin: number;
  isActive?: boolean;
}

// ── Auth ────────────────────────────────────────────────
export async function register(email: string, password: string) {
  const { data } = await api.post<AuthResponse>('/auth/register', {
    email,
    password,
  });
  useAuthStore.getState().setAccessToken(data.accessToken);
  useAuthStore.getState().setEmail(email);
}

export async function login(email: string, password: string) {
  const { data } = await api.post<AuthResponse>('/auth/login', {
    email,
    password,
  });
  useAuthStore.getState().setAccessToken(data.accessToken);
  useAuthStore.getState().setEmail(email);
}

export async function logout() {
  // Refresh cookie is sent automatically; the server clears it.
  await api.post('/auth/logout').catch(() => undefined);
  useAuthStore.getState().clear();
}

// ── Triggers ────────────────────────────────────────────
export function useTriggers() {
  return useQuery({
    queryKey: ['triggers'],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Trigger>>('/triggers', {
        params: { limit: 100 },
      });
      return data;
    },
  });
}

export function useCreateTrigger() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TriggerInput) => {
      const { data } = await api.post<Trigger>('/triggers', input);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['triggers'] }),
  });
}

export function useUpdateTrigger() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: Partial<TriggerInput>;
    }) => {
      const { data } = await api.patch<Trigger>(`/triggers/${id}`, input);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['triggers'] }),
  });
}

export function useDeleteTrigger() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/triggers/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['triggers'] }),
  });
}

export function useTestTrigger() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<{ sent: Channel[] }>(
        `/triggers/${id}/test`,
      );
      return data;
    },
  });
}

// ── Notifications ───────────────────────────────────────
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get<Paginated<NotificationItem>>(
        '/notifications',
        { params: { limit: 50 } },
      );
      return data;
    },
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notifications/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useClearNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.delete('/notifications');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

// ── Profile / settings ──────────────────────────────────
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get<Profile>('/users/me');
      return data;
    },
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  });
}

export function useRemovePushSubscription() {
  return useMutation({
    mutationFn: async (endpoint: string) => {
      await api.delete('/users/me/push', { data: { endpoint } });
    },
  });
}

'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { fetchWeather } from '@/lib/weather';
import type {
  AdminStats,
  AdminUserDetail,
  AdminUserListItem,
  AuthResponse,
  Channel,
  ConditionLogic,
  Metric,
  NotificationItem,
  Operator,
  Paginated,
  PinnedCity,
  Profile,
  Role,
  Trigger,
} from '@/lib/types';

export interface ConditionInput {
  metric: Metric;
  operator: Operator;
  threshold: number;
}

export interface TriggerInput {
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  conditions: ConditionInput[];
  conditionLogic?: ConditionLogic;
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

export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (token: string) => {
      await api.post('/auth/verify-email', { token });
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  });
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

export function useClearTriggers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.delete('/triggers');
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

// ── Weather / pinned cities ─────────────────────────────
export function useWeather(latitude?: number, longitude?: number) {
  return useQuery({
    queryKey: ['weather', latitude, longitude],
    queryFn: () => fetchWeather(latitude!, longitude!),
    enabled: latitude != null && longitude != null,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePinnedCities() {
  return useQuery({
    queryKey: ['pinned-cities'],
    queryFn: async () => {
      const { data } = await api.get<PinnedCity[]>('/pinned-cities');
      return data;
    },
  });
}

export interface PinnedCityInput {
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export function useAddPinnedCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: PinnedCityInput) => {
      const { data } = await api.post<PinnedCity>('/pinned-cities', input);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pinned-cities'] }),
  });
}

export function useRemovePinnedCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/pinned-cities/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pinned-cities'] }),
  });
}

// ── Notifications ───────────────────────────────────────
export const NOTIFICATIONS_PAGE_SIZE = 20;

export function useNotifications(page = 1) {
  return useQuery({
    queryKey: ['notifications', page],
    queryFn: async () => {
      const { data } = await api.get<Paginated<NotificationItem>>(
        '/notifications',
        { params: { page, limit: NOTIFICATIONS_PAGE_SIZE } },
      );
      return data;
    },
    placeholderData: keepPreviousData,
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

// ── Admin ───────────────────────────────────────────────
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const { data } = await api.get<AdminStats>('/admin/stats');
      return data;
    },
  });
}

export const ADMIN_USERS_PAGE_SIZE = 20;

export function useAdminUsers(page = 1) {
  return useQuery({
    queryKey: ['admin', 'users', page],
    queryFn: async () => {
      const { data } = await api.get<Paginated<AdminUserListItem>>(
        '/admin/users',
        { params: { page, limit: ADMIN_USERS_PAGE_SIZE } },
      );
      return data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useAdminUser(id: string | null) {
  return useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: async () => {
      const { data } = await api.get<AdminUserDetail>(`/admin/users/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useUpdateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: { role?: Role; emailVerified?: boolean };
    }) => {
      const { data } = await api.patch<AdminUserDetail>(
        `/admin/users/${id}`,
        input,
      );
      return data;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'user', id] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useDeleteAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/users/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  });
}

export function useDeleteAdminTrigger() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; userId: string }) => {
      await api.delete(`/admin/triggers/${id}`);
    },
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: ['admin', 'user', userId] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
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

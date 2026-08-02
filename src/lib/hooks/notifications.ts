'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { NotificationItem, Paginated } from '@/lib/types';
import { freshness, queryKeys } from './query-keys';

export const NOTIFICATIONS_PAGE_SIZE = 20;

export function useNotifications(page = 1) {
  return useQuery({
    queryKey: queryKeys.notifications(page),
    queryFn: async () => {
      const { data } = await api.get<Paginated<NotificationItem>>(
        '/notifications',
        { params: { page, limit: NOTIFICATIONS_PAGE_SIZE } },
      );
      return data;
    },
    placeholderData: keepPreviousData,
    ...freshness.notifications,
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notifications/${id}`);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.notificationsAll }),
  });
}

export function useClearNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.delete('/notifications');
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.notificationsAll }),
  });
}

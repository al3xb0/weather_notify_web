'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  AdminStats,
  AdminUserDetail,
  AdminUserListItem,
  Paginated,
  Role,
} from '@/lib/types';
import { freshness, queryKeys } from './query-keys';

export const ADMIN_USERS_PAGE_SIZE = 20;

export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.adminStats,
    queryFn: async () => {
      const { data } = await api.get<AdminStats>('/admin/stats');
      return data;
    },
    ...freshness.admin,
  });
}

export function useAdminUsers(page = 1) {
  return useQuery({
    queryKey: queryKeys.adminUsersPage(page),
    queryFn: async () => {
      const { data } = await api.get<Paginated<AdminUserListItem>>(
        '/admin/users',
        { params: { page, limit: ADMIN_USERS_PAGE_SIZE } },
      );
      return data;
    },
    placeholderData: keepPreviousData,
    ...freshness.admin,
  });
}

export function useAdminUser(id: string | null) {
  return useQuery({
    queryKey: queryKeys.adminUser(id),
    queryFn: async () => {
      const { data } = await api.get<AdminUserDetail>(`/admin/users/${id}`);
      return data;
    },
    enabled: !!id,
    ...freshness.admin,
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
      qc.invalidateQueries({ queryKey: queryKeys.adminUsers });
      qc.invalidateQueries({ queryKey: queryKeys.adminUser(id) });
      qc.invalidateQueries({ queryKey: queryKeys.adminStats });
    },
  });
}

export function useDeleteAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/users/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admin }),
  });
}

export function useDeleteAdminTrigger() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; userId: string }) => {
      await api.delete(`/admin/triggers/${id}`);
    },
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.adminUser(userId) });
      qc.invalidateQueries({ queryKey: queryKeys.adminStats });
    },
  });
}

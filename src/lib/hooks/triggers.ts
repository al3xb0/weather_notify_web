'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  Channel,
  ConditionLogic,
  Metric,
  Operator,
  Paginated,
  Trigger,
} from '@/lib/types';
import { freshness, queryKeys } from './query-keys';

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

type TriggerPage = Paginated<Trigger>;

export function useTriggers() {
  return useQuery({
    queryKey: queryKeys.triggers,
    queryFn: async () => {
      const { data } = await api.get<TriggerPage>('/triggers', {
        params: { limit: 100 },
      });
      return data;
    },
    ...freshness.triggers,
  });
}

export function useCreateTrigger() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TriggerInput) => {
      const { data } = await api.post<Trigger>('/triggers', input);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.triggers }),
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
    // The active switch is the one control that should feel instant. Only
    // `isActive` is patched locally: the rest of an edit reshapes conditions,
    // whose server-assigned ids the client cannot invent.
    onMutate: async ({ id, input }) => {
      if (input.isActive === undefined) return { previous: undefined };
      await qc.cancelQueries({ queryKey: queryKeys.triggers });
      const previous = qc.getQueryData<TriggerPage>(queryKeys.triggers);
      if (previous) {
        qc.setQueryData<TriggerPage>(queryKeys.triggers, {
          ...previous,
          items: previous.items.map((t) =>
            t.id === id ? { ...t, isActive: input.isActive! } : t,
          ),
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.triggers, context.previous);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.triggers }),
  });
}

export function useDeleteTrigger() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/triggers/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.triggers }),
  });
}

export function useClearTriggers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.delete('/triggers');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.triggers }),
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

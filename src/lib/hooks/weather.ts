'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { fetchWeather } from '@/lib/weather';
import type { PinnedCity } from '@/lib/types';
import { freshness, queryKeys } from './query-keys';

export function useWeather(latitude?: number, longitude?: number) {
  return useQuery({
    queryKey: queryKeys.weather(latitude, longitude),
    queryFn: () => fetchWeather(latitude!, longitude!),
    enabled: latitude != null && longitude != null,
    ...freshness.weather,
  });
}

export function usePinnedCities() {
  return useQuery({
    queryKey: queryKeys.pinnedCities,
    queryFn: async () => {
      const { data } = await api.get<PinnedCity[]>('/pinned-cities');
      return data;
    },
    ...freshness.pinnedCities,
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
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.pinnedCities }),
  });
}

export function useRemovePinnedCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/pinned-cities/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.pinnedCities }),
  });
}

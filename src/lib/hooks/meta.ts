'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiLimits, Meta } from '@/lib/types';
import { queryKeys } from './query-keys';

/**
 * Used until `GET /meta` answers, and if it never does. Keeping a local copy is
 * unavoidable — the UI has to render something — but it is one object with an
 * obvious name rather than numbers scattered through the components.
 */
const FALLBACK_LIMITS: ApiLimits = {
  maxTriggersPerUser: 10,
  maxConditionsPerTrigger: 5,
  maxPinnedCities: 12,
  testCooldownSec: 600,
  minCooldownMin: 10,
  maxCooldownMin: 1440,
  maxChannelsPerTrigger: 3,
};

/**
 * Server-enforced limits. Previously mirrored by hand, and one had already
 * drifted: the dashboard advertised twenty triggers against a server limit of
 * ten, so the button stayed enabled and the API answered 400.
 */
export function useApiLimits(): ApiLimits {
  const { data } = useQuery({
    queryKey: queryKeys.meta,
    queryFn: async () => {
      const { data } = await api.get<Meta>('/meta');
      return data;
    },
    // Limits change with a deployment, not with a session.
    staleTime: Infinity,
    gcTime: Infinity,
  });
  return data?.limits ?? FALLBACK_LIMITS;
}

/**
 * Every query key in one place so an invalidation and the query it targets
 * cannot drift apart — a mutation invalidating a key nothing uses fails
 * silently, and that is exactly the bug this prevents.
 */
export const queryKeys = {
  profile: ['profile'] as const,
  triggers: ['triggers'] as const,
  pinnedCities: ['pinned-cities'] as const,
  weather: (latitude?: number, longitude?: number) =>
    ['weather', latitude, longitude] as const,
  notifications: (page: number) => ['notifications', page] as const,
  notificationsAll: ['notifications'] as const,
  admin: ['admin'] as const,
  adminStats: ['admin', 'stats'] as const,
  adminUsers: ['admin', 'users'] as const,
  adminUsersPage: (page: number) => ['admin', 'users', page] as const,
  adminUser: (id: string | null) => ['admin', 'user', id] as const,
};

/**
 * Freshness policy, stated rather than inherited from the library defaults.
 * The numbers follow how the data actually moves: the watcher polls every five
 * minutes, so trigger state can change without the user doing anything and is
 * worth re-reading on focus; a profile only changes when its owner changes it.
 */
export const freshness = {
  /** Watcher-driven state; cheap to re-read and visibly stale otherwise. */
  triggers: { staleTime: 10_000, refetchOnWindowFocus: true },
  /** Append-only history — new rows appear without any local action. */
  notifications: { staleTime: 15_000, refetchOnWindowFocus: true },
  /** Server caches Open-Meteo for 10 minutes; polling faster buys nothing. */
  weather: { staleTime: 5 * 60_000, refetchOnWindowFocus: false },
  /** Only ever changes through this UI, so local invalidation is enough. */
  profile: { staleTime: 5 * 60_000, refetchOnWindowFocus: false },
  pinnedCities: { staleTime: 5 * 60_000, refetchOnWindowFocus: false },
  /** Aggregates over the whole system; a little staleness is harmless. */
  admin: { staleTime: 30_000, refetchOnWindowFocus: false },
} as const;

import { api } from '@/lib/api';

export interface GeoResult {
  name: string;
  country: string | null;
  admin1: string | null;
  latitude: number;
  longitude: number;
}

/**
 * City search, through our own API rather than straight to Open-Meteo.
 *
 * Calling the geocoder from the browser put a third party we do not control
 * inside the critical path of the city field: a change to their CORS policy or
 * their quota broke it, and we would hear about it from users. Behind
 * `GET /geocode` the same failure is server-side — logged, cached, and
 * rate-limited — and the browser talks to one origin.
 */
export async function searchCities(query: string): Promise<GeoResult[]> {
  if (query.trim().length < 2) {
    return [];
  }
  try {
    const { data } = await api.get<GeoResult[]>('/geocode', {
      params: { q: query },
    });
    return data;
  } catch {
    // The caller renders an empty list as "no matches", which is a better
    // answer for a search-as-you-type box than an error state that has to be
    // dismissed.
    return [];
  }
}

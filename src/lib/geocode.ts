export interface GeoResult {
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

interface OpenMeteoGeoResponse {
  results?: Array<{
    name: string;
    country: string;
    admin1?: string;
    latitude: number;
    longitude: number;
  }>;
}

export async function searchCities(query: string): Promise<GeoResult[]> {
  if (query.trim().length < 2) {
    return [];
  }
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query,
  )}&count=5&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) {
    return [];
  }
  const data = (await res.json()) as OpenMeteoGeoResponse;
  return (data.results ?? []).map((r) => ({
    name: r.name,
    country: r.country,
    admin1: r.admin1,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

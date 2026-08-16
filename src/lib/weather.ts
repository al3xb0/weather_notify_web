import { api } from '@/lib/api';

export interface CurrentWeather {
  time: string;
  temperature: number;
  apparentTemp: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  weatherCode: number;
}

export interface DailyForecast {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number | null;
}

export interface WeatherReport {
  current: CurrentWeather;
  daily: DailyForecast[];
}

/**
 * The forecast, through our own API rather than straight to Open-Meteo — same
 * reasoning as `searchCities`. The flattening that used to happen here now
 * happens server-side, where it is cached per rounded location, so two viewers
 * of the same city cost one upstream call rather than one each.
 */
export async function fetchWeather(
  latitude: number,
  longitude: number,
): Promise<WeatherReport> {
  const { data } = await api.get<WeatherReport>('/weather', {
    params: { latitude, longitude },
  });
  return data;
}

interface WeatherDescriptor {
  label: string;
  emoji: string;
}

// WMO weather interpretation codes → human label + glyph.
const WEATHER_CODES: Record<number, WeatherDescriptor> = {
  0: { label: 'Clear sky', emoji: '☀️' },
  1: { label: 'Mainly clear', emoji: '🌤️' },
  2: { label: 'Partly cloudy', emoji: '⛅' },
  3: { label: 'Overcast', emoji: '☁️' },
  45: { label: 'Fog', emoji: '🌫️' },
  48: { label: 'Rime fog', emoji: '🌫️' },
  51: { label: 'Light drizzle', emoji: '🌦️' },
  53: { label: 'Drizzle', emoji: '🌦️' },
  55: { label: 'Dense drizzle', emoji: '🌧️' },
  56: { label: 'Freezing drizzle', emoji: '🌧️' },
  57: { label: 'Freezing drizzle', emoji: '🌧️' },
  61: { label: 'Light rain', emoji: '🌦️' },
  63: { label: 'Rain', emoji: '🌧️' },
  65: { label: 'Heavy rain', emoji: '🌧️' },
  66: { label: 'Freezing rain', emoji: '🌧️' },
  67: { label: 'Freezing rain', emoji: '🌧️' },
  71: { label: 'Light snow', emoji: '🌨️' },
  73: { label: 'Snow', emoji: '🌨️' },
  75: { label: 'Heavy snow', emoji: '❄️' },
  77: { label: 'Snow grains', emoji: '🌨️' },
  80: { label: 'Rain showers', emoji: '🌦️' },
  81: { label: 'Rain showers', emoji: '🌧️' },
  82: { label: 'Violent showers', emoji: '⛈️' },
  85: { label: 'Snow showers', emoji: '🌨️' },
  86: { label: 'Snow showers', emoji: '❄️' },
  95: { label: 'Thunderstorm', emoji: '⛈️' },
  96: { label: 'Thunderstorm + hail', emoji: '⛈️' },
  99: { label: 'Thunderstorm + hail', emoji: '⛈️' },
};

export function describeWeather(code: number): WeatherDescriptor {
  return WEATHER_CODES[code] ?? { label: 'Unknown', emoji: '🌡️' };
}

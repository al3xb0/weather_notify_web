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

interface OpenMeteoForecast {
  current?: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    precipitation: number;
    weather_code: number;
  };
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: (number | null)[];
  };
}

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const CURRENT_FIELDS =
  'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,weather_code';
const DAILY_FIELDS =
  'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max';

export async function fetchWeather(
  latitude: number,
  longitude: number,
): Promise<WeatherReport> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: CURRENT_FIELDS,
    daily: DAILY_FIELDS,
    timezone: 'auto',
    forecast_days: '5',
  });
  const res = await fetch(`${FORECAST_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to load weather');
  }
  const data = (await res.json()) as OpenMeteoForecast;
  const c = data.current;
  const d = data.daily;
  if (!c || !d) {
    throw new Error('Weather data unavailable');
  }
  return {
    current: {
      time: c.time,
      temperature: c.temperature_2m,
      apparentTemp: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      windSpeed: c.wind_speed_10m,
      precipitation: c.precipitation,
      weatherCode: c.weather_code,
    },
    daily: d.time.map((date, i) => ({
      date,
      weatherCode: d.weather_code[i],
      tempMax: d.temperature_2m_max[i],
      tempMin: d.temperature_2m_min[i],
      precipitationProbability: d.precipitation_probability_max[i] ?? null,
    })),
  };
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

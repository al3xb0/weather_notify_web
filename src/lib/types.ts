export type Metric =
  | 'TEMPERATURE'
  | 'APPARENT_TEMP'
  | 'WIND_SPEED'
  | 'PRECIPITATION'
  | 'HUMIDITY'
  | 'SEVERE';

export type Operator = 'GT' | 'GTE' | 'LT' | 'LTE' | 'EQ';
export type Channel = 'TELEGRAM' | 'EMAIL' | 'WEB_PUSH';
export type TriggerState = 'ARMED' | 'FIRED';
export type NotifStatus = 'SENT' | 'FAILED';

export interface Trigger {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  metric: Metric;
  operator: Operator;
  threshold: number;
  channels: Channel[];
  cooldownMin: number;
  isActive: boolean;
  state: TriggerState;
  lastFiredAt: string | null;
  lastObservedValue: number | null;
  lastEvaluatedAt: string | null;
  lastMatched: boolean | null;
  createdAt: string;
}

export interface NotificationPayload {
  triggerName?: string;
  city?: string;
  metric?: Metric;
  operator?: Operator;
  threshold?: number;
  observedValue?: number;
}

export interface NotificationItem {
  id: string;
  triggerId: string;
  channel: Channel;
  status: NotifStatus;
  error: string | null;
  createdAt: string;
  payload: NotificationPayload;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AuthResponse {
  accessToken: string;
}

export interface Profile {
  id: string;
  email: string;
  telegramChatId: string | null;
  telegramLinked: boolean;
  emailVerified: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  timezone: string | null;
  createdAt: string;
}

export const METRIC_LABELS: Record<Metric, string> = {
  TEMPERATURE: 'Temperature (°C)',
  APPARENT_TEMP: 'Feels like (°C)',
  WIND_SPEED: 'Wind speed (km/h)',
  PRECIPITATION: 'Precipitation (mm)',
  HUMIDITY: 'Humidity (%)',
  SEVERE: 'Severe weather',
};

export const METRIC_UNITS: Record<Metric, string> = {
  TEMPERATURE: '°C',
  APPARENT_TEMP: '°C',
  WIND_SPEED: ' km/h',
  PRECIPITATION: ' mm',
  HUMIDITY: '%',
  SEVERE: '',
};

export const OPERATOR_LABELS: Record<Operator, string> = {
  GT: '>',
  GTE: '≥',
  LT: '<',
  LTE: '≤',
  EQ: '=',
};

export const CHANNEL_LABELS: Record<Channel, string> = {
  TELEGRAM: 'Telegram',
  EMAIL: 'Email',
  WEB_PUSH: 'Web Push',
};

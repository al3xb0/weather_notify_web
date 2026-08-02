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
/** PENDING is the claim a delivery takes before the channel call. */
export type NotifStatus = 'PENDING' | 'SENT' | 'FAILED';
export type ConditionLogic = 'AND' | 'OR';
export type Role = 'USER' | 'ADMIN';

export interface TriggerCondition {
  id: string;
  metric: Metric;
  operator: Operator;
  threshold: number;
  order: number;
  lastObservedValue: number | null;
  lastMatched: boolean | null;
}

export interface Trigger {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  conditions: TriggerCondition[];
  conditionLogic: ConditionLogic;
  channels: Channel[];
  cooldownMin: number;
  isActive: boolean;
  state: TriggerState;
  lastFiredAt: string | null;
  lastEvaluatedAt: string | null;
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
  /** Null once the originating trigger has been deleted. */
  triggerId: string | null;
  channel: Channel;
  status: NotifStatus;
  error: string | null;
  createdAt: string;
  payload: NotificationPayload;
}

export interface PinnedCity {
  id: string;
  name: string;
  country: string | null;
  admin1: string | null;
  latitude: number;
  longitude: number;
  order: number;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminStats {
  users: number;
  verifiedUsers: number;
  admins: number;
  triggers: number;
  activeTriggers: number;
  pinnedCities: number;
  notifications: number;
  notificationsSent: number;
  notificationsFailed: number;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  telegramLinked: boolean;
  triggerCount: number;
  notificationCount: number;
  createdAt: string;
}

export interface AdminUserDetail {
  id: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  telegramLinked: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  timezone: string | null;
  createdAt: string;
  triggers: Trigger[];
  notificationCount: number;
  pinnedCityCount: number;
}

export interface AuthResponse {
  accessToken: string;
}

export interface Profile {
  id: string;
  email: string;
  role: Role;
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

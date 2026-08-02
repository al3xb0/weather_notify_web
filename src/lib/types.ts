import type { components } from './api-types';

/**
 * Domain types come from the API's OpenAPI document — see `npm run gen:api`.
 * Only presentation concerns are written by hand below; a label belongs to the
 * UI and has no business being served by the backend.
 *
 * These were previously ~110 lines of hand-maintained interfaces, which is a
 * contract kept in sync by memory.
 */
type Schema = components['schemas'];

export type Metric = Schema['Metric'];
export type Operator = Schema['Operator'];
export type Channel = Schema['Channel'];
export type TriggerState = Schema['TriggerState'];
export type NotifStatus = Schema['NotifStatus'];
export type ConditionLogic = Schema['ConditionLogic'];
export type Role = Schema['Role'];

export type TriggerCondition = Schema['TriggerConditionResponseDto'];
export type Trigger = Schema['TriggerResponseDto'];
/** The stored payload is free-form JSON; narrowed to what the UI reads. */
export type NotificationItem = Omit<
  Schema['NotificationResponseDto'],
  'payload'
> & { payload: NotificationPayload };
export type PinnedCity = Schema['PinnedCityResponseDto'];
export type Profile = Schema['ProfileResponseDto'];
export type AuthResponse = Schema['AuthResponseDto'];
export type AdminStats = Schema['AdminStatsDto'];
export type AdminUserListItem = Schema['AdminUserDto'];
export type AdminUserDetail = Schema['AdminUserDetailDto'];
export type ApiLimits = Schema['ApiLimitsDto'];
export type Meta = Schema['MetaResponseDto'];

/**
 * Fields of the fired event the notification list renders. The generated type
 * for `payload` is an opaque object, so the narrowing lives here instead of
 * being asserted at every call site.
 */
export interface NotificationPayload {
  triggerName?: string;
  city?: string;
  metric?: Metric;
  operator?: Operator;
  threshold?: number;
  observedValue?: number;
}

/** Paginated envelope. Generated inline per endpoint, so named once here. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// ── Presentation ────────────────────────────────────────
// Hand-written on purpose: these are UI copy, not part of the API contract.

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

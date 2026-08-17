/**
 * Vocabulary the API also speaks: metrics, channels, condition logic and the
 * suppression reasons behind a trigger's status line. Keyed by the enum value
 * the API sends, so a new one is a missing key rather than a wrong label.
 */
export const domain = {
  'metric.TEMPERATURE': 'Temperature (°C)',
  'metric.APPARENT_TEMP': 'Feels like (°C)',
  'metric.WIND_SPEED': 'Wind speed (km/h)',
  'metric.PRECIPITATION': 'Precipitation (mm)',
  'metric.HUMIDITY': 'Humidity (%)',
  'metric.SEVERE': 'Severe weather',
  'metricShort.TEMPERATURE': 'Temperature',
  'metricShort.APPARENT_TEMP': 'Feels like',
  'metricShort.WIND_SPEED': 'Wind',
  'metricShort.PRECIPITATION': 'Precipitation',
  'metricShort.HUMIDITY': 'Humidity',
  'metricShort.SEVERE': 'Severe',
  'channel.TELEGRAM': 'Telegram',
  'channel.EMAIL': 'Email',
  'channel.WEB_PUSH': 'Web Push',
  'logic.and': 'and',
  'logic.or': 'or',
  'status.notMet': 'conditions not met',
  'status.met': 'conditions met',
  'status.cooldownUntil': 'conditions met · cooldown until {time}',
  'status.code': 'code {value}',
} as const;

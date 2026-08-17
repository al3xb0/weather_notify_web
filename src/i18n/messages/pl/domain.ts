import type { Section } from '../../types';
import type { domain as en } from '../en/domain';

export const domain: Section<typeof en> = {
  'metric.TEMPERATURE': 'Temperatura (°C)',
  'metric.APPARENT_TEMP': 'Odczuwalna (°C)',
  'metric.WIND_SPEED': 'Prędkość wiatru (km/h)',
  'metric.PRECIPITATION': 'Opady (mm)',
  'metric.HUMIDITY': 'Wilgotność (%)',
  'metric.SEVERE': 'Groźna pogoda',
  'metricShort.TEMPERATURE': 'Temperatura',
  'metricShort.APPARENT_TEMP': 'Odczuwalna',
  'metricShort.WIND_SPEED': 'Wiatr',
  'metricShort.PRECIPITATION': 'Opady',
  'metricShort.HUMIDITY': 'Wilgotność',
  'metricShort.SEVERE': 'Groźna pogoda',
  'channel.TELEGRAM': 'Telegram',
  'channel.EMAIL': 'E-mail',
  'channel.WEB_PUSH': 'Web Push',
  'logic.and': 'i',
  'logic.or': 'lub',
  'status.notMet': 'warunki niespełnione',
  'status.met': 'warunki spełnione',
  'status.cooldownUntil': 'warunki spełnione · przerwa do {time}',
  'status.code': 'kod {value}',
};

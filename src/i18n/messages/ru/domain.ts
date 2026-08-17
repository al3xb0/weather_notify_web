import type { Section } from '../../types';
import type { domain as en } from '../en/domain';

export const domain: Section<typeof en> = {
  'metric.TEMPERATURE': 'Температура (°C)',
  'metric.APPARENT_TEMP': 'Ощущается (°C)',
  'metric.WIND_SPEED': 'Скорость ветра (км/ч)',
  'metric.PRECIPITATION': 'Осадки (мм)',
  'metric.HUMIDITY': 'Влажность (%)',
  'metric.SEVERE': 'Опасная погода',
  'metricShort.TEMPERATURE': 'Температура',
  'metricShort.APPARENT_TEMP': 'Ощущается',
  'metricShort.WIND_SPEED': 'Ветер',
  'metricShort.PRECIPITATION': 'Осадки',
  'metricShort.HUMIDITY': 'Влажность',
  'metricShort.SEVERE': 'Опасная погода',
  'channel.TELEGRAM': 'Telegram',
  'channel.EMAIL': 'Email',
  'channel.WEB_PUSH': 'Web Push',
  'logic.and': 'и',
  'logic.or': 'или',
  'status.notMet': 'условия не выполнены',
  'status.met': 'условия выполнены',
  'status.cooldownUntil': 'условия выполнены · пауза до {time}',
  'status.code': 'код {value}',
};

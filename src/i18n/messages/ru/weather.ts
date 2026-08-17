import type { Section } from '../../types';
import type { weather as en } from '../en/weather';

export const weather: Section<typeof en> = {
  'weather.title': 'Погода',
  'weather.subtitle': 'Найдите город и закрепите те, за которыми следите',
  'weather.pinned': 'Закреплённые города',
  'weather.pinnedCount': '{count} из {max}',
  'weather.pin': '☆ Закрепить',
  'weather.pinning': 'Закрепляем…',
  'weather.pinned!': '★ Закреплён',
  'weather.pinLimit': 'Достигнут лимит (максимум {max})',
  'weather.noPins': 'Нет закреплённых городов',
  'weather.noPinsHint': 'Найдите город и закрепите его, чтобы он появился тут.',
  'weather.forecast': 'Прогноз на 5 дней',
  'weather.today': 'Сегодня',
  'weather.feelsLike': 'Ощущается как',
  'weather.humidity': 'Влажность',
  'weather.wind': 'Ветер',
  'weather.precipitation': 'Осадки',
  'weather.unavailable': 'Данные о погоде недоступны',
};

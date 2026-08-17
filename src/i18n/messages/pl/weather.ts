import type { Section } from '../../types';
import type { weather as en } from '../en/weather';

export const weather: Section<typeof en> = {
  'weather.title': 'Pogoda',
  'weather.subtitle': 'Wyszukaj miasto i przypnij te, które obserwujesz',
  'weather.pinned': 'Przypięte miasta',
  'weather.pinnedCount': '{count} z {max}',
  'weather.pin': '☆ Przypnij miasto',
  'weather.pinning': 'Przypinamy…',
  'weather.pinned!': '★ Przypięte',
  'weather.pinLimit': 'Osiągnięto limit (maksymalnie {max})',
  'weather.noPins': 'Brak przypiętych miast',
  'weather.noPinsHint':
    'Wyszukaj miasto i przypnij je, aby pojawiło się w tym miejscu.',
  'weather.forecast': 'Prognoza na 5 dni',
  'weather.today': 'Dziś',
  'weather.feelsLike': 'Odczuwalna',
  'weather.humidity': 'Wilgotność',
  'weather.wind': 'Wiatr',
  'weather.precipitation': 'Opady',
  'weather.unavailable': 'Dane pogodowe są niedostępne',
};

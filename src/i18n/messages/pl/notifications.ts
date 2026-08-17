import type { Section } from '../../types';
import type { notifications as en } from '../en/notifications';

export const notifications: Section<typeof en> = {
  'notifications.title': 'Powiadomienia',
  'notifications.subtitle': 'Historia alertów',
  // Polish declines the noun after a numeral three ways — 1 alert, 2 alerty,
  // 5 alertów — which is why the catalogue carries `one`/`few`/`many` and the
  // bare key is the `other` form.
  'notifications.count': 'zarejestrowano {count} alertów',
  'notifications.count_one': 'zarejestrowano {count} alert',
  'notifications.count_few': 'zarejestrowano {count} alerty',
  'notifications.count_many': 'zarejestrowano {count} alertów',
  'notifications.empty': 'Nic jeszcze nie dostarczono',
  'notifications.emptyHint':
    'Alerty pojawią się tutaj, gdy wyzwalacz zadziała, a kanał przyjmie wiadomość.',
  'notifications.clearAll': 'Wyczyść',
  'notifications.confirmClearTitle': 'Wyczyścić historię powiadomień?',
  'notifications.confirmClearBody':
    'Usuniemy wszystkie zapisy o dostarczeniu. Wyzwalacze pozostaną nienaruszone.',
  'notifications.deleteOne': 'Usuń ten wpis',
  'notifications.loadMore': 'Pokaż więcej',
};

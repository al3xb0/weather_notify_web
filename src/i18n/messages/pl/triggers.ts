import type { Section } from '../../types';
import type { triggers as en } from '../en/triggers';

export const triggers: Section<typeof en> = {
  'triggers.title': 'Wyzwalacze',
  'triggers.subtitle': 'Monitorowanie pogody',
  // "z {max} monitorów" reads the same for every count, so the plural forms
  // exist only so `Intl.PluralRules` finds one rather than falling through to
  // the English catalogue.
  'triggers.count': '{count} z {max} monitorów',
  'triggers.count_one': '{count} z {max} monitorów',
  'triggers.count_few': '{count} z {max} monitorów',
  'triggers.count_many': '{count} z {max} monitorów',
  'triggers.new': 'Nowy wyzwalacz',
  'triggers.edit': 'Edytuj wyzwalacz',
  'triggers.clearAll': 'Usuń wszystkie',
  'triggers.empty': 'Nie masz jeszcze wyzwalaczy',
  'triggers.emptyHint':
    'Utwórz wyzwalacz, aby obserwować w wybranym mieście warunki, na których Ci zależy.',
  'triggers.name': 'Nazwa',
  'triggers.namePlaceholder': 'np. Upał w Berlinie',
  'triggers.city': 'Miasto',
  'triggers.cityPlaceholder': 'Znajdź miasto…',
  'triggers.conditions': 'Warunki',
  'triggers.addCondition': '+ Dodaj warunek',
  'triggers.combineWith': 'Łącz warunki przez',
  'triggers.channels': 'Kanały',
  'triggers.cooldown': 'Przerwa (minuty)',
  'triggers.cooldownHint': 'Ile czekać między kolejnymi alertami',
  'triggers.create': 'Utwórz wyzwalacz',
  'triggers.save': 'Zapisz zmiany',
  'triggers.saving': 'Zapisujemy…',
  'triggers.close': 'Zamknij',
  'triggers.test': 'Test',
  'triggers.testing': 'Wysyłamy…',
  'triggers.editAction': 'Edytuj',
  'triggers.delete': 'Usuń',
  'triggers.paused': 'wstrzymany',
  'triggers.cooldownShort': 'przerwa {minutes} min',
  'triggers.lastFired': 'ostatnie zadziałanie {date}',
  'triggers.confirmClearTitle': 'Usunąć wszystkie wyzwalacze?',
  'triggers.confirmClearBody':
    'Usuniemy wszystkie Twoje wyzwalacze. Historia powiadomień zostanie zachowana.',
  'triggers.confirmDeleteTitle': 'Usunąć ten wyzwalacz?',
  'triggers.confirmDeleteBody':
    'Natychmiast przestanie być sprawdzany. Dotychczasowe powiadomienia zostaną zachowane.',
  'triggers.selectChannel': 'Wybierz co najmniej jeden kanał',
  'triggers.testSent': 'Powiadomienie testowe wysłane',
  'triggers.testWait': 'Odczekaj {seconds} s',
  'triggers.testCooldownHint': 'Przerwa po wysyłce testowej',
  'triggers.editAriaLabel': 'Edytuj „{name}”',
  'triggers.deleteAriaLabel': 'Usuń „{name}”',
};

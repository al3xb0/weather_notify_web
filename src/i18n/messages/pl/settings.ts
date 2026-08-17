import type { Section } from '../../types';
import type { settings as en } from '../en/settings';

export const settings: Section<typeof en> = {
  'settings.title': 'Ustawienia',
  'settings.subtitle': 'Konfiguracja kanałów powiadomień',
  'settings.telegram': 'Telegram',
  'settings.telegramSubtitle': 'Odbieraj alerty na czacie Telegram',
  'settings.linked': 'Połączono',
  'settings.chatId': 'Chat ID:',
  'settings.unlink': 'Odłącz',
  'settings.unlinking': 'Odłączamy…',
  'settings.unlinked': 'Telegram odłączony',
  'settings.connect': 'Połącz Telegram',
  'settings.push': 'Web Push',
  'settings.pushSubtitle': 'Powiadomienia przeglądarki na tym urządzeniu',
  'settings.pushEnable': 'Włącz powiadomienia push',
  'settings.quietHours': 'Godziny ciszy',
  'settings.quietHoursSubtitle': 'Wyciszaj alerty w wybranym oknie czasowym',
  'settings.from': 'Od',
  'settings.to': 'Do',
  'settings.save': 'Zapisz',
  'settings.disable': 'Wyłącz',
  'settings.dangerTitle': 'Usunięcie konta',
  'settings.dangerSubtitle':
    'Trwale usuń swoje konto wraz ze wszystkimi danymi',
  'settings.dangerBody':
    'Usuniemy Twoje wyzwalacze, przypięte miasta, historię powiadomień i połączone kanały. Tej operacji nie można cofnąć.',
  'settings.dangerConfirm': 'Potwierdź hasłem',
  'settings.dangerHint':
    'Wszystko powyższe zostanie usunięte natychmiast i nie da się tego odzyskać.',
  'settings.dangerSubmit': 'Usuń moje konto',
  'settings.dangerDeleting': 'Usuwamy…',
  'settings.dangerDeleted': 'Twoje konto zostało usunięte',
  'settings.cancel': 'Anuluj',
};

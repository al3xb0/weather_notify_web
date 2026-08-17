import type { Section } from '../../types';
import type { shell as en } from '../en/shell';

export const shell: Section<typeof en> = {
  'nav.triggers': 'Wyzwalacze',
  'nav.weather': 'Pogoda',
  'nav.notifications': 'Powiadomienia',
  'nav.settings': 'Ustawienia',
  'nav.admin': 'Administracja',
  'nav.logout': 'Wyloguj się',
  'nav.skipToContent': 'Przejdź do treści',
  'nav.menu': 'Menu',
  'shell.restoring': 'Przywracamy sesję',
  'shell.verifyPrompt':
    'Potwierdź adres e-mail, aby włączyć alerty — link czeka w Twojej skrzynce.',
  'shell.resend': 'Wyślij ponownie',
  'shell.resending': 'Wysyłamy…',
  'shell.resendSent': 'Wiadomość weryfikacyjna wysłana.',
  'shell.resendAlready': 'Adres jest już potwierdzony.',
  'theme.label': 'Motyw kolorystyczny',
  'theme.light': 'Jasny',
  'theme.dark': 'Ciemny',
  'theme.system': 'Systemowy',
  'language.label': 'Język',
};

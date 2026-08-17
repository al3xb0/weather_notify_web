import type { Section } from '../../types';
import type { passwordReset as en } from '../en/password-reset';

export const passwordReset: Section<typeof en> = {
  'reset.requestTitle': 'Zresetuj hasło',
  'reset.requestSubtitle': 'Wyślemy Ci link do ustawienia nowego hasła.',
  'reset.send': 'Wyślij link',
  'reset.sending': 'Wysyłamy…',
  'reset.backToSignIn': 'Wróć do logowania',
  'reset.checkEmail': 'Sprawdź skrzynkę',
  'reset.accepted':
    'Jeśli konto z tym adresem istnieje, link jest już w drodze. Wygasa po godzinie.',
  'reset.spamHint':
    'Nie dotarł? Sprawdź folder ze spamem lub ofertami — wiadomości automatyczne często tam trafiają.',
  'reset.chooseTitle': 'Wybierz nowe hasło',
  'reset.chooseSubtitle': 'To wyloguje Cię również ze wszystkich innych sesji.',
  'reset.newPassword': 'Nowe hasło',
  'reset.confirmPassword': 'Powtórz hasło',
  'reset.mismatch': 'Hasła nie są takie same',
  'reset.submit': 'Ustaw nowe hasło',
  'reset.saving': 'Zapisujemy…',
  'reset.doneTitle': 'Hasło zmienione',
  'reset.doneBody':
    'Hasło zostało zaktualizowane. Wszystkie sesje zostały zakończone — zaloguj się ponownie nowym hasłem.',
  'reset.goToSignIn': 'Przejdź do logowania',
  'reset.noTokenTitle': 'Niekompletny link',
  'reset.noTokenBody':
    'Ta strona potrzebuje tokenu z wiadomości e-mail. Otwórz link ze skrzynki albo poproś o nowy.',
  'reset.requestNew': 'Poproś o nowy link',
};

import type { Section } from '../../types';
import type { verify as en } from '../en/verify';

export const verify: Section<typeof en> = {
  'verify.title': 'Potwierdź adres e-mail',
  'verify.verified': 'Adres potwierdzony',
  'verify.checking': 'Potwierdzamy adres…',
  'verify.success':
    'Twój adres został potwierdzony. Wszystkie funkcje są dostępne.',
  'verify.idle':
    'Wysłaliśmy link weryfikacyjny na Twój adres e-mail. Otwórz go, aby potwierdzić adres.',
  'verify.resend': 'Wyślij wiadomość ponownie',
  'verify.goToDashboard': 'Przejdź do wyzwalaczy',
};

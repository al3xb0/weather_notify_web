import type { Section } from '../../types';
import type { auth as en } from '../en/auth';

export const auth: Section<typeof en> = {
  'auth.signIn': 'Zaloguj się',
  'auth.register': 'Załóż konto',
  'auth.welcomeBack': 'Witamy ponownie',
  'auth.signInSubtitle': 'Zaloguj się na swoje konto Weather Notify',
  'auth.registerSubtitle': 'Zacznij śledzić pogodę w kilka chwil',
  'auth.email': 'E-mail',
  'auth.password': 'Hasło',
  'auth.emailPlaceholder': 'ty@example.com',
  'auth.pleaseWait': 'Chwileczkę…',
  'auth.noAccount': 'Nie masz konta?',
  'auth.haveAccount': 'Masz już konto?',
  'auth.registerLink': 'Zarejestruj się',
  'auth.forgotPassword': 'Nie pamiętasz hasła?',
  'auth.invalidEmail': 'Podaj poprawny adres e-mail',
  'auth.passwordTooShort': 'Co najmniej 8 znaków',
};

import type { Section } from '../../types';
import type { auth as en } from '../en/auth';

export const auth: Section<typeof en> = {
  'auth.signIn': 'Войти',
  'auth.register': 'Создать аккаунт',
  'auth.welcomeBack': 'С возвращением',
  'auth.signInSubtitle': 'Войдите в свой аккаунт Weather Notify',
  'auth.registerSubtitle': 'Настройте наблюдение за погодой за минуту',
  'auth.email': 'Email',
  'auth.password': 'Пароль',
  'auth.emailPlaceholder': 'you@example.com',
  'auth.pleaseWait': 'Подождите…',
  'auth.noAccount': 'Нет аккаунта?',
  'auth.haveAccount': 'Уже зарегистрированы?',
  'auth.registerLink': 'Зарегистрироваться',
  'auth.forgotPassword': 'Забыли пароль?',
  'auth.invalidEmail': 'Введите корректный email',
  'auth.passwordTooShort': 'Минимум 8 символов',
};

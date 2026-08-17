import type { Section } from '../../types';
import type { verify as en } from '../en/verify';

export const verify: Section<typeof en> = {
  'verify.title': 'Подтвердите почту',
  'verify.verified': 'Почта подтверждена',
  'verify.checking': 'Подтверждаем адрес…',
  'verify.success': 'Адрес подтверждён. Все функции доступны.',
  'verify.idle':
    'Мы отправили ссылку для подтверждения на вашу почту. Откройте её, чтобы подтвердить адрес.',
  'verify.resend': 'Отправить письмо снова',
  'verify.goToDashboard': 'Перейти к триггерам',
};

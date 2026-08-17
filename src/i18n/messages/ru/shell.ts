import type { Section } from '../../types';
import type { shell as en } from '../en/shell';

export const shell: Section<typeof en> = {
  'nav.triggers': 'Триггеры',
  'nav.weather': 'Погода',
  'nav.notifications': 'Уведомления',
  'nav.settings': 'Настройки',
  'nav.admin': 'Админка',
  'nav.logout': 'Выйти',
  'nav.skipToContent': 'Перейти к содержимому',
  'nav.menu': 'Меню',
  'shell.restoring': 'Восстанавливаем сессию',
  'shell.verifyPrompt':
    'Подтвердите почту, чтобы включить оповещения — ссылка отправлена вам на email.',
  'shell.resend': 'Отправить снова',
  'shell.resending': 'Отправляем…',
  'shell.resendSent': 'Письмо отправлено.',
  'shell.resendAlready': 'Почта уже подтверждена.',
  'theme.label': 'Тема оформления',
  'theme.light': 'Светлая',
  'theme.dark': 'Тёмная',
  'theme.system': 'Системная',
  'language.label': 'Язык',
};

import type { Section } from '../../types';
import type { settings as en } from '../en/settings';

export const settings: Section<typeof en> = {
  'settings.title': 'Настройки',
  'settings.subtitle': 'Настройка каналов доставки',
  'settings.telegram': 'Telegram',
  'settings.telegramSubtitle': 'Получать оповещения в чат Telegram',
  'settings.linked': 'Подключён',
  'settings.chatId': 'Chat ID:',
  'settings.unlink': 'Отключить',
  'settings.unlinking': 'Отключаем…',
  'settings.unlinked': 'Telegram отключён',
  'settings.connect': 'Подключить Telegram',
  'settings.push': 'Web Push',
  'settings.pushSubtitle': 'Уведомления браузера на этом устройстве',
  'settings.pushEnable': 'Включить push-уведомления',
  'settings.quietHours': 'Тихие часы',
  'settings.quietHoursSubtitle': 'Отключать оповещения в заданном окне',
  'settings.from': 'С',
  'settings.to': 'До',
  'settings.save': 'Сохранить',
  'settings.disable': 'Отключить',
  'settings.dangerTitle': 'Удаление аккаунта',
  'settings.dangerSubtitle': 'Безвозвратно удалить аккаунт и все его данные',
  'settings.dangerBody':
    'Будут удалены триггеры, закреплённые города, история уведомлений и подключённые каналы. Отменить это нельзя.',
  'settings.dangerConfirm': 'Подтвердите паролем',
  'settings.dangerHint':
    'Всё перечисленное удаляется сразу и не подлежит восстановлению.',
  'settings.dangerSubmit': 'Удалить аккаунт',
  'settings.dangerDeleting': 'Удаляем…',
  'settings.dangerDeleted': 'Аккаунт удалён',
  'settings.cancel': 'Отмена',
};

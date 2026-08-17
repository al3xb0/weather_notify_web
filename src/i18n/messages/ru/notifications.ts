import type { Section } from '../../types';
import type { notifications as en } from '../en/notifications';

export const notifications: Section<typeof en> = {
  'notifications.title': 'Уведомления',
  'notifications.subtitle': 'История оповещений',
  'notifications.count': 'записей: {count}',
  'notifications.count_one': '{count} запись',
  'notifications.count_few': '{count} записи',
  'notifications.count_many': '{count} записей',
  'notifications.empty': 'Пока ничего не доставлено',
  'notifications.emptyHint':
    'Оповещения появятся здесь, когда триггер сработает и канал примет сообщение.',
  'notifications.clearAll': 'Очистить',
  'notifications.confirmClearTitle': 'Очистить историю уведомлений?',
  'notifications.confirmClearBody':
    'Будут удалены все записи о доставке. Триггеры не затрагиваются.',
  'notifications.deleteOne': 'Удалить запись',
  'notifications.loadMore': 'Показать ещё',
};

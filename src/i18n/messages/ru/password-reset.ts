import type { Section } from '../../types';
import type { passwordReset as en } from '../en/password-reset';

export const passwordReset: Section<typeof en> = {
  'reset.requestTitle': 'Сброс пароля',
  'reset.requestSubtitle': 'Мы пришлём ссылку для установки нового пароля.',
  'reset.send': 'Отправить ссылку',
  'reset.sending': 'Отправляем…',
  'reset.backToSignIn': 'Вернуться ко входу',
  'reset.checkEmail': 'Проверьте почту',
  'reset.accepted':
    'Если аккаунт с таким адресом существует, ссылка уже отправлена. Она действует один час.',
  'reset.spamHint':
    'Не пришло? Проверьте папку «Спам» или «Промоакции» — автоматические письма часто попадают туда.',
  'reset.chooseTitle': 'Новый пароль',
  'reset.chooseSubtitle': 'Это также завершит все остальные сессии.',
  'reset.newPassword': 'Новый пароль',
  'reset.confirmPassword': 'Повторите пароль',
  'reset.mismatch': 'Пароли не совпадают',
  'reset.submit': 'Установить пароль',
  'reset.saving': 'Сохраняем…',
  'reset.doneTitle': 'Пароль изменён',
  'reset.doneBody':
    'Пароль обновлён. Все сессии завершены — войдите заново с новым паролем.',
  'reset.goToSignIn': 'Перейти ко входу',
  'reset.noTokenTitle': 'Ссылка неполная',
  'reset.noTokenBody':
    'Странице нужен токен из письма. Откройте ссылку из почты или запросите новую.',
  'reset.requestNew': 'Запросить новую ссылку',
};

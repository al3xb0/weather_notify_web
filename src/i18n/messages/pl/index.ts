import type { Messages } from '../../types';
import { auth } from './auth';
import { common } from './common';
import { domain } from './domain';
import { notifications } from './notifications';
import { passwordReset } from './password-reset';
import { settings } from './settings';
import { shell } from './shell';
import { triggers } from './triggers';
import { verify } from './verify';
import { weather } from './weather';

export const pl: Messages = {
  ...shell,
  ...auth,
  ...passwordReset,
  ...verify,
  ...triggers,
  ...notifications,
  ...weather,
  ...settings,
  ...common,
  ...domain,
};

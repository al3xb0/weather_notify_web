import { admin } from './admin';
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

/**
 * English is the source of truth: `MessageKey` derives from this object, and
 * every other catalogue is typed against it section by section, so a
 * translation that forgets a key fails the build in the file that forgot it.
 *
 * Keys stay flat and fully qualified (`triggers.cooldownHint`) even though the
 * files are grouped, because that is how they are read at call sites. The
 * split is about where a string is edited, not about how it is addressed.
 */
export const en = {
  ...shell,
  ...auth,
  ...passwordReset,
  ...verify,
  ...triggers,
  ...notifications,
  ...weather,
  ...settings,
  ...admin,
  ...common,
  ...domain,
} as const;

export {
  admin,
  auth,
  common,
  domain,
  notifications,
  passwordReset,
  settings,
  shell,
  triggers,
  verify,
  weather,
};

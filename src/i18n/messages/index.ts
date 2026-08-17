import type { Locale } from '../locales';
import type { Messages } from '../types';
import { en } from './en';
import { pl } from './pl';
import { ru } from './ru';

export const messages: Record<Locale, Messages> = { en, ru, pl };

export { en };

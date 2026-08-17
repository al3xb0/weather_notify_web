import type { en } from './messages/en';

export type MessageKey = keyof typeof en;

/**
 * Plural categories beyond `other`. A language may need forms English does
 * not — Russian and Polish both distinguish `one`/`few`/`many` where English
 * has a single plural — so these are optional rather than part of
 * `MessageKey`. The bare key is always the `other` form, which is why it stays
 * required.
 */
type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many';

/** A whole catalogue: every English key, plus whatever plural forms it needs. */
export type Messages = Record<MessageKey, string> &
  Partial<Record<`${MessageKey}_${PluralCategory}`, string>>;

/**
 * One section of a catalogue, typed against the English section of the same
 * name.
 *
 * Checking section by section rather than only the assembled catalogue is the
 * point of the split: a key missing from `pl/triggers.ts` is an error in that
 * file, naming that key, instead of one unreadable mismatch on the object all
 * ten sections were spread into.
 */
export type Section<T> = Record<keyof T & string, string> &
  Partial<Record<`${keyof T & string}_${PluralCategory}`, string>>;

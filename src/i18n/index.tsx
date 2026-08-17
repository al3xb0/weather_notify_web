'use client';

import { LOCALE, type Locale } from './locales';
import { messages } from './messages';
import type { MessageKey } from './types';

export { LOCALE, type Locale, type MessageKey };

export type Translate = (
  key: MessageKey,
  values?: Record<string, string | number>,
) => string;

/**
 * Look up a string and fill its `{placeholders}`.
 *
 * A missing key returns the key itself rather than an empty string: an
 * untranslated label is a visible bug, and a blank one is an invisible one.
 * `Messages` is typed against the English catalogue, so this only happens if
 * the map is reached with an unchecked cast.
 */
export function translate(
  locale: Locale,
  key: MessageKey,
  values?: Record<string, string | number>,
): string {
  const resolved = pluralKey(locale, key, values?.count);
  const catalogue = messages[locale] as Record<string, string | undefined>;
  const template = catalogue[resolved] ?? catalogue[key] ?? key;
  if (!values) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );
}

/**
 * Pick the plural form for a count, when the catalogue offers one.
 *
 * `Intl.PluralRules` knows the categories per locale; the catalogue provides
 * `key_one`, `key_few`, `key_many` where they differ, and the bare key is the
 * `other` form every locale falls back to. English only needs `_one`, but the
 * rule stays general so a language with more forms drops in without touching
 * the lookup.
 */
function pluralKey(
  locale: Locale,
  key: MessageKey,
  count: string | number | undefined,
): string {
  if (typeof count !== 'number') {
    return key;
  }
  const category = new Intl.PluralRules(locale).select(count);
  return category === 'other' ? key : `${key}_${category}`;
}

export function useT(): Translate {
  return (key, values) => translate(LOCALE, key, values);
}

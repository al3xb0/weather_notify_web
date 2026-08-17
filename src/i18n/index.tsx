'use client';

import { useSyncExternalStore } from 'react';
import { LOCALES, LOCALE_LABELS, type Locale } from './locales';
import { messages } from './messages';
import type { MessageKey } from './types';

export { LOCALES, LOCALE_LABELS, type Locale, type MessageKey };

export const LOCALE_STORAGE_KEY = 'wn-locale';

/**
 * Applied to `<html lang>` so screen readers switch voice and the browser
 * offers the right spellcheck dictionary — a page that says `lang="en"` while
 * showing Russian is a real accessibility defect, not a cosmetic one.
 */
export function applyLocale(locale: Locale): void {
  document.documentElement.setAttribute('lang', locale);
}

/**
 * Same shape as the theme store, and for the same reason: the choice is
 * external state, `useSyncExternalStore` is the hook for it, and reading it
 * that way keeps several tabs in step through the `storage` event.
 */
const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener('storage', onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
}

function isLocale(value: unknown): value is Locale {
  return LOCALES.includes(value as Locale);
}

/**
 * The stored choice, else the browser's preference, else English. Only the
 * primary subtag matters: `ru-RU` and `ru` are the same catalogue here.
 */
export function readLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(stored)) {
      return stored;
    }
    const preferred = navigator.language?.split('-')[0];
    return isLocale(preferred) ? preferred : 'en';
  } catch {
    return 'en';
  }
}

export function storeLocale(locale: Locale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Losing persistence is survivable; this page still switches.
  }
  applyLocale(locale);
  for (const listener of listeners) listener();
}

export function useLocale(): Locale {
  // The server has no browser preference to read, so it renders English and
  // the client corrects it — `lang` is stamped by the pre-paint script.
  return useSyncExternalStore(subscribe, readLocale, () => 'en' as Locale);
}

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
  const fallback = messages.en as Record<string, string | undefined>;
  const template =
    catalogue[resolved] ?? catalogue[key] ?? fallback[key] ?? key;
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
 * English has two forms and Russian has three ("1 запись", "2 записи",
 * "5 записей"), so appending an "s" — which is what the code did before this
 * existed — is not a rule that survives a second language. `Intl.PluralRules`
 * knows the categories per locale; the catalogue provides `key_one`,
 * `key_few`, `key_many` where they differ, and the bare key is the `other`
 * form every locale falls back to.
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
  const locale = useLocale();
  return (key, values) => translate(locale, key, values);
}

/**
 * Runs before first paint alongside the theme script, so the document's `lang`
 * is right from the first render rather than after hydration.
 *
 * The list of locales is interpolated rather than written out, because a
 * hard-coded one silently stops honouring a language the moment another is
 * added: the catalogue would be complete, the picker would offer it, and the
 * document would still claim to be in English until React took over.
 */
export const LOCALE_INIT_SCRIPT = `(function(){try{var s=${JSON.stringify(
  LOCALES,
)};var l=localStorage.getItem('${LOCALE_STORAGE_KEY}');if(!l){l=(navigator.language||'en').split('-')[0]}if(s.indexOf(l)>-1){document.documentElement.setAttribute('lang',l)}}catch(e){}})()`;

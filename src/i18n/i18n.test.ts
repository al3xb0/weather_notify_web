import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LOCALES, type Locale } from './locales';
import { en, messages } from './messages';
import type { MessageKey } from './types';
import {
  LOCALE_INIT_SCRIPT,
  LOCALE_STORAGE_KEY,
  readLocale,
  translate,
} from './index';

const english = en as Record<MessageKey, string>;
const keys = Object.keys(en) as MessageKey[];

/**
 * Driven off `LOCALES` rather than naming the catalogues, so adding a language
 * puts it under the same checks without touching this file — which is the
 * whole reason the list lives apart from the strings.
 */
const translations = LOCALES.filter(
  (locale): locale is Exclude<Locale, 'en'> => locale !== 'en',
);

describe.each(translations)('the %s catalogue', (locale) => {
  const catalogue = messages[locale] as Record<string, string | undefined>;

  it('translates every key English has', () => {
    const missing = keys.filter((key) => !catalogue[key]);

    // `Messages` is typed against the English catalogue, so this should be
    // impossible — the assertion is here because a cast anywhere in the chain
    // would turn a build error into a silently English label.
    expect(missing).toEqual([]);
  });

  it('leaves no key with an empty string', () => {
    const blank = Object.entries(catalogue).filter(
      ([, value]) => (value ?? '').trim() === '',
    );
    expect(blank).toEqual([]);
  });

  it('keeps the same placeholders as English', () => {
    const names = (template: string) =>
      (template.match(/\{(\w+)\}/g) ?? []).sort();

    for (const key of keys) {
      // A translation that drops `{count}` renders a sentence with a hole in
      // it, and one that invents `{total}` renders the placeholder verbatim.
      expect({ key, placeholders: names(catalogue[key] ?? '') }).toEqual({
        key,
        placeholders: names(english[key]),
      });
    }
  });

  /**
   * A plural form the language never selects is dead weight; one it selects
   * and does not have falls through to English mid-sentence.
   */
  it('carries exactly the plural forms its language selects', () => {
    const rules = new Intl.PluralRules(locale);
    const selectable = new Set<string>(
      rules.resolvedOptions().pluralCategories,
    );

    const extras = Object.keys(catalogue).filter((key) => !(key in english));
    for (const key of extras) {
      const category = key.slice(key.lastIndexOf('_') + 1);
      expect({ key, selectable: selectable.has(category) }).toEqual({
        key,
        selectable: true,
      });
    }
  });
});

describe('translate', () => {
  it('fills placeholders', () => {
    expect(translate('en', 'weather.pinLimit', { max: 12 })).toBe(
      'Pin limit reached (max 12)',
    );
  });

  it('leaves an unknown placeholder visible rather than blanking it', () => {
    // Better a literal `{max}` in the UI than a sentence that silently lost a
    // number — the first is reported, the second is not.
    expect(translate('en', 'weather.pinLimit')).toContain('{max}');
  });

  describe('plurals', () => {
    it('picks the English singular and plural', () => {
      expect(translate('en', 'notifications.count', { count: 1 })).toBe(
        '1 alert logged',
      );
      expect(translate('en', 'notifications.count', { count: 5 })).toBe(
        '5 alerts logged',
      );
    });

    it('picks all three Russian forms', () => {
      // The reason `Intl.PluralRules` is involved at all: appending an "s"
      // cannot produce запись / записи / записей.
      expect(translate('ru', 'notifications.count', { count: 1 })).toBe(
        '1 запись',
      );
      expect(translate('ru', 'notifications.count', { count: 3 })).toBe(
        '3 записи',
      );
      expect(translate('ru', 'notifications.count', { count: 7 })).toBe(
        '7 записей',
      );
      // 21 is `one` in Russian, which is exactly the case a naive
      // `count === 1` check gets wrong.
      expect(translate('ru', 'notifications.count', { count: 21 })).toBe(
        '21 запись',
      );
    });

    it('picks all three Polish forms', () => {
      expect(translate('pl', 'notifications.count', { count: 1 })).toBe(
        'zarejestrowano 1 alert',
      );
      expect(translate('pl', 'notifications.count', { count: 3 })).toBe(
        'zarejestrowano 3 alerty',
      );
      expect(translate('pl', 'notifications.count', { count: 7 })).toBe(
        'zarejestrowano 7 alertów',
      );
      // Polish differs from Russian here: 22 is `few`, while 21 is `many` —
      // the two languages are not interchangeable despite looking similar.
      expect(translate('pl', 'notifications.count', { count: 22 })).toBe(
        'zarejestrowano 22 alerty',
      );
      expect(translate('pl', 'notifications.count', { count: 21 })).toBe(
        'zarejestrowano 21 alertów',
      );
    });

    it('falls back to the bare key when a language has no extra form', () => {
      expect(translate('en', 'triggers.count', { count: 3, max: 10 })).toBe(
        '3 of 10 monitors',
      );
    });
  });
});

describe('readLocale', () => {
  beforeEach(() => localStorage.clear());

  it('prefers the stored choice', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'ru');
    expect(readLocale()).toBe('ru');
  });

  it('falls back to the browser language, primary subtag only', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('pl-PL');
    expect(readLocale()).toBe('pl');
    vi.restoreAllMocks();
  });

  it('falls back to English for a language it does not have', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('fr-FR');
    expect(readLocale()).toBe('en');
    vi.restoreAllMocks();
  });

  it('ignores a stored value that is not a locale', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'klingon');
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-GB');
    expect(readLocale()).toBe('en');
    vi.restoreAllMocks();
  });
});

/**
 * The pre-paint script sets `<html lang>` before React runs. A hard-coded list
 * of locales inside it is how a newly added language ends up complete in the
 * catalogue, offered by the picker, and still announced as English to a screen
 * reader until hydration.
 */
describe('LOCALE_INIT_SCRIPT', () => {
  it('recognises every locale the app ships', () => {
    for (const locale of LOCALES) {
      expect(LOCALE_INIT_SCRIPT).toContain(`"${locale}"`);
    }
  });
});

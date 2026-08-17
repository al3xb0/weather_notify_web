import { describe, it, expect, beforeEach, vi } from 'vitest';
import { en, ru, type MessageKey } from './messages';
import { LOCALE_STORAGE_KEY, readLocale, translate } from './index';

describe('message catalogues', () => {
  it('translates every key English has', () => {
    const missing = (Object.keys(en) as MessageKey[]).filter((key) => !ru[key]);

    // `Messages` is typed against the English catalogue, so this should be
    // impossible — the assertion is here because a cast anywhere in the chain
    // would turn a build error into a silently English label.
    expect(missing).toEqual([]);
  });

  it('leaves no key with an empty string', () => {
    const blank = Object.entries({ ...en, ...ru }).filter(
      ([, value]) => value.trim() === '',
    );
    expect(blank).toEqual([]);
  });

  it('keeps the same placeholders in both languages', () => {
    const names = (template: string) =>
      (template.match(/\{(\w+)\}/g) ?? []).sort();

    for (const key of Object.keys(en) as MessageKey[]) {
      // A translation that drops `{count}` renders a sentence with a hole in
      // it, and one that invents `{total}` renders the placeholder verbatim.
      expect({ key, placeholders: names(ru[key]) }).toEqual({
        key,
        placeholders: names(en[key]),
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
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('ru-RU');
    expect(readLocale()).toBe('ru');
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

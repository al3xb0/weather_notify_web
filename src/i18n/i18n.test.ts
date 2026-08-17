import { describe, it, expect } from 'vitest';
import { en } from './messages';
import { translate } from './index';

const english = en as Record<string, string>;

/** Every category `Intl.PluralRules` can name, selected by English or not. */
const CATEGORIES = ['zero', 'one', 'two', 'few', 'many'];

describe('the English catalogue', () => {
  it('leaves no key with an empty string', () => {
    const blank = Object.entries(english).filter(
      ([, value]) => value.trim() === '',
    );
    expect(blank).toEqual([]);
  });

  /**
   * A plural form the language never selects is dead weight; one it selects
   * and does not have falls through to the bare key mid-sentence.
   */
  it('carries only plural forms English selects', () => {
    const selectable = new Set<string>(
      new Intl.PluralRules('en').resolvedOptions().pluralCategories,
    );

    const forms = Object.keys(english).filter((key) =>
      CATEGORIES.includes(key.slice(key.lastIndexOf('_') + 1)),
    );
    for (const key of forms) {
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
    it('picks the singular and the plural', () => {
      expect(translate('en', 'notifications.count', { count: 1 })).toBe(
        '1 alert logged',
      );
      expect(translate('en', 'notifications.count', { count: 5 })).toBe(
        '5 alerts logged',
      );
    });

    it('falls back to the bare key when a string has no extra form', () => {
      expect(translate('en', 'triggers.count', { count: 3, max: 10 })).toBe(
        '3 of 10 monitors',
      );
    });
  });
});

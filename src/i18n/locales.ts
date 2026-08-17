/**
 * The languages the UI ships with.
 *
 * Separate from the catalogues so the pre-paint script and the language picker
 * can read the list without pulling every string into their bundle — and so
 * adding a language is one entry here plus one directory under `messages/`.
 */
export const LOCALES = ['en', 'ru', 'pl'] as const;

export type Locale = (typeof LOCALES)[number];

/** Endonyms: a language is named in itself, never translated into the others. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
  pl: 'Polski',
};

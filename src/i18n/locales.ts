/**
 * The one language the UI ships in.
 *
 * The catalogue machinery stays keyed by locale — `translate` takes one and
 * `Intl.PluralRules` needs one — so adding a language later is a directory
 * under `messages/<code>/`, a wider `Locale`, and a picker in the shell. Until
 * then there is nothing to pick, so there is no picker and `<html lang>` is
 * static in the root layout.
 */
export const LOCALE = 'en';

export type Locale = typeof LOCALE;

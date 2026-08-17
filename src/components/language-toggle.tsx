'use client';

import { LOCALES, LOCALE_LABELS, storeLocale, useLocale, useT } from '@/i18n';

/**
 * A segmented control rather than a dropdown: at this handful of languages a
 * select costs a click to discover what the options even are. The visible
 * label is the locale code, which is legible in any of them; the accessible
 * name is the endonym, so a screen reader announces "Polski" and not "P L".
 *
 * Worth revisiting past six or so, where the row stops fitting a phone.
 */
export function LanguageToggle() {
  const locale = useLocale();
  const t = useT();

  return (
    <div
      role="radiogroup"
      aria-label={t('language.label')}
      className="inline-flex items-center gap-0.5 rounded-xl border border-rim p-0.5"
    >
      {LOCALES.map((option) => {
        const active = locale === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={LOCALE_LABELS[option]}
            title={LOCALE_LABELS[option]}
            onClick={() => storeLocale(option)}
            className={`focus-ring rounded-lg px-2 py-1 text-xs font-semibold uppercase transition-colors ${
              active
                ? 'bg-sky-500/15 text-sky-400'
                : 'text-ink-dim hover:text-ink'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

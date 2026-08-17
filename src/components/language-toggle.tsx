'use client';

import { LOCALES, LOCALE_LABELS, storeLocale, useLocale, useT } from '@/i18n';

/**
 * Two languages, so a segmented control rather than a dropdown: a select for
 * two options costs a click to discover what the other one is.
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

'use client';

import { useSyncExternalStore } from 'react';
import { useT } from '@/i18n';

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'wn-theme';

/**
 * Dark is what the product looks like; light is the opt-in. Following the OS
 * used to be a third state, and it mostly served to render the app in a theme
 * it was never designed in — so the choice is now the two it actually has.
 */
export const DEFAULT_THEME: Theme = 'dark';

/**
 * The stored choice is external state, so it is read through
 * `useSyncExternalStore` rather than copied into React state by an effect.
 * `storage` fires only in *other* tabs, so local changes notify these
 * listeners directly — which is what keeps several open tabs in step.
 */
const listeners = new Set<() => void>();

function subscribeToTheme(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener('storage', onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : DEFAULT_THEME;
  } catch {
    // Storage can throw in a locked-down browser; the default is still usable.
    return DEFAULT_THEME;
  }
}

/** Persist a choice, apply it, and wake every subscriber in this tab. */
function storeTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Losing persistence is survivable; the current page still switches.
  }
  applyTheme(theme);
  for (const listener of listeners) listener();
}

/** Apply a choice by stamping the root element, which is what the CSS reads. */
export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Runs before first paint, inlined in the document head. Without it a user who
 * chose light sees the page render dark and snap to light on every navigation.
 *
 * Deliberately tiny and dependency-free: it executes before React exists.
 */
export const THEME_INIT_SCRIPT = `(function(){var t='${DEFAULT_THEME}';try{if(localStorage.getItem('${THEME_STORAGE_KEY}')==='light'){t='light'}}catch(e){}document.documentElement.setAttribute('data-theme',t)})()`;

const OPTIONS = [
  {
    value: 'light',
    labelKey: 'theme.light',
    icon: (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M8 1.2v1.6M8 13.2v1.6M1.2 8h1.6M13.2 8h1.6M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M12.8 3.2l-1.1 1.1M4.3 11.7l-1.1 1.1"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    value: 'dark',
    labelKey: 'theme.dark',
    icon: (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path
          d="M13 9.5A5.5 5.5 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
] as const;

export function ThemeToggle() {
  const t = useT();
  // `useSyncExternalStore` rather than reading storage in an effect: the stored
  // choice is external state, and this is the hook for exactly that. It also
  // renders the default on the server without a hydration mismatch, and keeps
  // every open tab in step for free through the `storage` event.
  const theme = useSyncExternalStore(
    subscribeToTheme,
    readStoredTheme,
    () => DEFAULT_THEME,
  );

  return (
    <div
      role="radiogroup"
      aria-label={t('theme.label')}
      className="inline-flex items-center gap-0.5 rounded-xl border border-rim p-0.5"
    >
      {OPTIONS.map((option) => {
        const active = theme === option.value;
        const label = t(option.labelKey);
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => storeTheme(option.value)}
            className={`focus-ring rounded-lg p-1.5 transition-colors ${
              active
                ? 'bg-sky-500/15 text-sky-400'
                : 'text-ink-dim hover:text-ink'
            }`}
          >
            {option.icon}
          </button>
        );
      })}
    </div>
  );
}

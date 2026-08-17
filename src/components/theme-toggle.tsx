'use client';

import { useSyncExternalStore } from 'react';

export type Theme = 'system' | 'light' | 'dark';

export const THEME_STORAGE_KEY = 'wn-theme';

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
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch {
    // Storage can throw in a locked-down browser; the default is still usable.
    return 'system';
  }
}

/** Persist a choice, apply it, and wake every subscriber in this tab. */
function storeTheme(theme: Theme): void {
  try {
    if (theme === 'system') {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  } catch {
    // Losing persistence is survivable; the current page still switches.
  }
  applyTheme(theme);
  for (const listener of listeners) listener();
}

/**
 * Apply a choice by stamping the root element, which is what the CSS reads.
 * `system` removes the attribute rather than resolving it here, so the page
 * keeps following the OS if the user changes it while the tab is open.
 */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

/**
 * Runs before first paint, inlined in the document head. Without it the page
 * renders in the OS theme and then snaps to the stored one — a flash on every
 * navigation for anyone whose choice differs from their system setting.
 *
 * Deliberately tiny and dependency-free: it executes before React exists.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})()`;

const OPTIONS: { value: Theme; label: string; icon: React.ReactElement }[] = [
  {
    value: 'light',
    label: 'Light',
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
    value: 'system',
    label: 'System',
    icon: (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <rect
          x="1.8"
          y="2.6"
          width="12.4"
          height="8.4"
          rx="1.2"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M5.5 13.4h5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    value: 'dark',
    label: 'Dark',
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
];

/**
 * Three explicit states rather than a two-way switch. A toggle cannot express
 * "follow the OS", which is the setting most people actually want — and the
 * one they end up stuck outside of once a toggle has written a preference.
 */
export function ThemeToggle() {
  // `useSyncExternalStore` rather than reading storage in an effect: the stored
  // choice is external state, and this is the hook for exactly that. It also
  // renders `system` on the server without a hydration mismatch, and keeps
  // every open tab in step for free through the `storage` event.
  const theme = useSyncExternalStore(
    subscribeToTheme,
    readStoredTheme,
    () => 'system' as Theme,
  );

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className="inline-flex items-center gap-0.5 rounded-xl border border-rim p-0.5"
    >
      {OPTIONS.map((option) => {
        const active = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={option.label}
            title={option.label}
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

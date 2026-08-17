import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  applyTheme,
  THEME_INIT_SCRIPT,
  THEME_STORAGE_KEY,
  ThemeToggle,
} from './theme-toggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('starts on system when nothing was stored', async () => {
    render(<ThemeToggle />);

    expect(await screen.findByRole('radio', { name: 'System' })).toBeChecked();
    // No attribute means "follow the OS", so the page keeps tracking it if the
    // user changes their system setting while the tab is open.
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('stamps the root and stores the choice', async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('radio', { name: 'Light' }));

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('returning to system clears both, rather than storing "system"', async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    await userEvent.click(screen.getByRole('radio', { name: 'System' }));

    // A stored "system" would be indistinguishable from a stale value the
    // pre-paint script has to interpret; absence is the simpler signal.
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it('restores the stored choice on mount', async () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    render(<ThemeToggle />);

    expect(await screen.findByRole('radio', { name: 'Dark' })).toBeChecked();
  });

  it('follows a change made in another tab', async () => {
    render(<ThemeToggle />);
    expect(await screen.findByRole('radio', { name: 'System' })).toBeChecked();

    // What a second tab's write looks like here: storage already holds the new
    // value and the browser fires `storage`. Reading through an external store
    // rather than copying into state on mount is what makes this work.
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    window.dispatchEvent(new StorageEvent('storage'));

    expect(await screen.findByRole('radio', { name: 'Light' })).toBeChecked();
  });

  it('exposes the three options as one radio group', () => {
    render(<ThemeToggle />);

    const group = screen.getByRole('radiogroup', { name: 'Colour theme' });
    expect(group).toBeInTheDocument();
    // Three states rather than a switch, because a two-way toggle cannot say
    // "follow the OS" — and once it has written a preference, the user cannot
    // get back to it.
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  describe('applyTheme', () => {
    it('sets an explicit theme and clears it for system', () => {
      applyTheme('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      applyTheme('system');
      expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    });
  });

  describe('THEME_INIT_SCRIPT', () => {
    const run = () => new Function(THEME_INIT_SCRIPT)();

    it('applies a stored theme before React runs', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
      run();

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('leaves the root alone when nothing is stored', () => {
      run();

      expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    });

    it('ignores a value that is not a theme', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'neon');
      run();

      // The script runs before anything can catch an exception for it, so an
      // unexpected value must be ignored rather than stamped onto the root.
      expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    });
  });
});

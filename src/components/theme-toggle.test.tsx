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

  it('starts on dark when nothing was stored', async () => {
    render(<ThemeToggle />);

    expect(await screen.findByRole('radio', { name: 'Dark' })).toBeChecked();
  });

  it('stamps the root and stores the choice', async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('radio', { name: 'Light' }));

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('stores dark explicitly rather than clearing the key', async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('radio', { name: 'Light' }));
    await userEvent.click(screen.getByRole('radio', { name: 'Dark' }));

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('restores the stored choice on mount', async () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    render(<ThemeToggle />);

    expect(await screen.findByRole('radio', { name: 'Light' })).toBeChecked();
  });

  it('follows a change made in another tab', async () => {
    render(<ThemeToggle />);
    expect(await screen.findByRole('radio', { name: 'Dark' })).toBeChecked();

    // What a second tab's write looks like here: storage already holds the new
    // value and the browser fires `storage`. Reading through an external store
    // rather than copying into state on mount is what makes this work.
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    window.dispatchEvent(new StorageEvent('storage'));

    expect(await screen.findByRole('radio', { name: 'Light' })).toBeChecked();
  });

  it('exposes the two options as one radio group', () => {
    render(<ThemeToggle />);

    expect(
      screen.getByRole('radiogroup', { name: 'Colour theme' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  describe('applyTheme', () => {
    it('stamps the choice on the root', () => {
      applyTheme('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');

      applyTheme('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('THEME_INIT_SCRIPT', () => {
    const run = () => new Function(THEME_INIT_SCRIPT)();

    it('applies a stored theme before React runs', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
      run();

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('falls back to dark when nothing is stored', () => {
      run();

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('ignores a value that is not a theme', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'neon');
      run();

      // The script runs before anything can catch an exception for it, so an
      // unexpected value must land on the default rather than on the root.
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });
});

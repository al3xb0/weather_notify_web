import { ThemeToggle } from '@/components/theme-toggle';

/**
 * Rendered by the root layout, so it is the one place on every page — signed
 * in or not — that can carry the theme switch. It used to live in the app
 * header, which put it behind sign-in: the login screen is exactly where
 * someone first meets the wrong theme and cannot change it.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-rim py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-between sm:px-6">
        {/* Placeholder opposite the toggle, so the credit stays centred on a
            wide screen instead of sitting left of it. */}
        <div className="hidden sm:block sm:w-24" aria-hidden="true" />
        <p className="text-xs text-ink-dim">
          Created by{' '}
          <a
            href="https://www.al-gres.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-ink-dim underline-offset-4 transition-colors hover:text-sky-400 hover:underline"
          >
            Aliaksei Konyshau
          </a>
        </p>
        <div className="sm:w-24 sm:text-right">
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}

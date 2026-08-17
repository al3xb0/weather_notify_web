'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { logout, useProfile, useResendVerification } from '@/lib/hooks';
import { apiError } from '@/lib/api';
import { useAuthBootstrap } from '@/lib/use-auth-bootstrap';
import { Skeleton, SkeletonList } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/theme-toggle';

const NAV = [
  {
    href: '/dashboard',
    label: 'Triggers',
    icon: (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: '/weather',
    label: 'Weather',
    icon: (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M8 1.5v1.5M8 13v1.5M1.5 8h1.5M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M12.6 3.4l-1 1M4.4 11.6l-1 1"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: '/notifications',
    label: 'Notifications',
    icon: (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path
          d="M8 2a4 4 0 0 0-4 4v3l-1 1.5h10L12 9V6a4 4 0 0 0-4-4Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M6.5 13a1.5 1.5 0 0 0 3 0"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M8 1.5v1.2M8 13.3v1.2M1.5 8h1.2M13.3 8h1.2M3.3 3.3l.85.85M11.85 11.85l.85.85M3.3 12.7l.85-.85M11.85 4.15l.85-.85"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const ADMIN_NAV = {
  href: '/admin',
  label: 'Admin',
  icon: (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M8 1.5l5 2v4c0 3-2.2 5-5 6.5-2.8-1.5-5-3.5-5-6.5v-4l5-2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M6 8l1.5 1.5L10.5 6.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

function LogoMark() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="h-7 w-7" aria-hidden="true">
      <path
        d="M5 20a5 5 0 0 1 4-9.8A6.5 6.5 0 1 1 22 19a4 4 0 0 1 0 3H5a4 4 0 0 1 0-2Z"
        fill="rgba(56,189,248,0.15)"
        stroke="#38bdf8"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path
        d="M13 21 l-2.5 5.5 4-2.5 -2 5.5"
        stroke="#fbbf24"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmailVerificationBanner() {
  const { data: profile } = useProfile();
  const resend = useResendVerification();
  const [msg, setMsg] = useState<string | null>(null);

  if (!profile || profile.emailVerified) return null;

  const doResend = async () => {
    setMsg(null);
    try {
      const res = await resend.mutateAsync();
      setMsg(res.sent ? 'Verification email sent.' : 'Already verified.');
    } catch (e) {
      setMsg(apiError(e));
    }
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
      <span className="min-w-50 flex-1">
        Confirm your email to enable alerts — check your inbox for the link.
      </span>
      {msg && <span className="text-xs text-amber-200/80">{msg}</span>}
      <button
        onClick={doResend}
        disabled={resend.isPending}
        className="rounded-lg border border-amber-400/40 px-3 py-1.5 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-500/20 disabled:opacity-50"
      >
        {resend.isPending ? 'Sending…' : 'Resend'}
      </button>
    </div>
  );
}

/** The header and one content block, in the layout they are about to occupy. */
function AppShellSkeleton() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-50 border-b border-rim bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <span className="font-heading text-sm font-semibold tracking-wide text-ink">
              Weather Notify
            </span>
          </div>
          <Skeleton className="h-7 w-24" />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <SkeletonList count={3} label="Restoring your session" />
      </main>
    </div>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      {open ? (
        <path
          d="M4 4l12 12M16 4 L4 16"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M3 5h14M3 10h14M3 15h14"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useAuthBootstrap();
  const storedEmail = useAuthStore((s) => s.email);
  const { data: profile } = useProfile(status === 'authenticated');
  // The menu belongs to the route it was opened on, so navigating closes it
  // without an effect watching the path — and without the setTimeout that
  // effect needed to get its setState past the lint rule.
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  const menuOpen = menuOpenFor === pathname;

  const navItems = profile?.role === 'ADMIN' ? [...NAV, ADMIN_NAV] : NAV;
  // Known immediately after a sign-in, and only after the profile lands when
  // the session was restored from the cookie.
  const email = storedEmail ?? profile?.email ?? '';

  useEffect(() => {
    if (status === 'anonymous') router.replace('/login');
  }, [status, router]);

  // Restoring the session costs a round-trip on every load. Showing the frame
  // it will land in beats a blank screen; `anonymous` renders nothing because
  // the redirect above is already on its way.
  if (status === 'unknown') return <AppShellSkeleton />;
  if (status !== 'authenticated') return null;

  const onLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-surface">
      <a
        href="#main"
        className="skip-link focus-ring rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white"
      >
        Skip to content
      </a>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-rim bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <LogoMark />
            <span className="font-heading text-sm font-semibold tracking-wide text-ink group-hover:text-sky-300 transition-colors">
              Weather Notify
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-sky-500/10 text-sky-400'
                      : 'text-ink-dim hover:bg-elevated hover:text-ink'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-ink-dim sm:inline truncate max-w-40">
              {email}
            </span>
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <button
              onClick={onLogout}
              className="rounded-lg border border-rim px-3 py-1.5 text-xs font-medium text-ink-dim transition-colors hover:border-rim-bright hover:text-ink"
            >
              Log out
            </button>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpenFor(menuOpen ? null : pathname)}
              className="flex items-center justify-center rounded-lg border border-rim p-1.5 text-ink-dim transition-colors hover:bg-elevated hover:text-ink sm:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              <HamburgerIcon open={menuOpen} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-rim bg-canvas sm:hidden">
            <nav className="flex flex-col gap-1 px-4 py-3">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-sky-500/10 text-sky-400'
                        : 'text-ink-dim hover:bg-elevated hover:text-ink'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
              <div className="mt-2 border-t border-rim pt-2 pb-1">
                <p className="px-3 py-1 text-xs text-ink-dim truncate">
                  {email}
                </p>
                {/* The header copy is hidden below `sm`, so the menu carries
                    it — otherwise the setting is unreachable on a phone. */}
                <div className="px-3 py-2">
                  <ThemeToggle />
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main id="main" className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <EmailVerificationBanner />
        {children}
      </main>
    </div>
  );
}

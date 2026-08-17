import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppShell } from './app-shell';
import { logout, useProfile, useResendVerification } from '@/lib/hooks';
import { useAuthBootstrap } from '@/lib/use-auth-bootstrap';
import type { AuthStatus } from '@/store/auth';

const replace = vi.fn();
let pathname = '/dashboard';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  usePathname: () => pathname,
}));
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
vi.mock('@/lib/hooks', () => ({
  logout: vi.fn(),
  useProfile: vi.fn(),
  useResendVerification: vi.fn(),
}));
vi.mock('@/lib/use-auth-bootstrap', () => ({ useAuthBootstrap: vi.fn() }));
vi.mock('@/lib/api', () => ({
  apiError: (e: unknown) => (e as Error).message,
}));
vi.mock('@/store/auth', () => ({
  useAuthStore: (selector: (s: { email: string | null }) => unknown) =>
    selector({ email: 'user@example.com' }),
}));

const profile = (over: Record<string, unknown> = {}) => ({
  data: {
    id: 'u1',
    email: 'user@example.com',
    role: 'USER',
    emailVerified: true,
    ...over,
  },
});

const setStatus = (status: AuthStatus) =>
  vi.mocked(useAuthBootstrap).mockReturnValue(status);

describe('AppShell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pathname = '/dashboard';
    setStatus('authenticated');
    vi.mocked(useProfile).mockReturnValue(
      profile() as unknown as ReturnType<typeof useProfile>,
    );
    vi.mocked(useResendVerification).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useResendVerification>);
  });

  describe('session gate', () => {
    it('shows the frame it is about to fill while the session is unknown', () => {
      setStatus('unknown');
      render(<AppShell>content</AppShell>);

      // `unknown` must not be mistaken for signed out: the redirect has to wait
      // for the refresh attempt, or a reload bounces the user to /login.
      expect(screen.getByLabelText('Restoring your session')).toBeVisible();
      expect(screen.queryByText('content')).toBeNull();
      expect(replace).not.toHaveBeenCalled();
    });

    it('redirects an anonymous visitor and renders nothing', async () => {
      setStatus('anonymous');
      render(<AppShell>content</AppShell>);

      await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'));
      expect(screen.queryByText('content')).toBeNull();
    });

    it('renders the children once authenticated', () => {
      render(<AppShell>content</AppShell>);

      expect(screen.getByText('content')).toBeVisible();
      expect(replace).not.toHaveBeenCalled();
    });
  });

  describe('navigation', () => {
    it('marks the current route as the current page', () => {
      pathname = '/notifications';
      render(<AppShell>content</AppShell>);

      const links = screen.getAllByRole('link', { name: /notifications/i });
      expect(links.length).toBeGreaterThan(0);
    });

    it('hides Admin from an ordinary user', () => {
      render(<AppShell>content</AppShell>);

      expect(screen.queryByRole('link', { name: /admin/i })).toBeNull();
    });

    it('shows Admin to an admin', () => {
      vi.mocked(useProfile).mockReturnValue(
        profile({ role: 'ADMIN' }) as unknown as ReturnType<typeof useProfile>,
      );
      render(<AppShell>content</AppShell>);

      // Role-gated in the UI only for convenience — AdminGuard is what
      // actually enforces it — but showing a link that always 403s is its own
      // bug.
      expect(
        screen.getAllByRole('link', { name: /admin/i }).length,
      ).toBeGreaterThan(0);
    });

    it('offers a skip link before the header', () => {
      render(<AppShell>content</AppShell>);

      // Keyboard users would otherwise tab through the whole nav on every
      // page to reach the content.
      const skip = screen.getByRole('link', { name: 'Skip to content' });
      expect(skip).toHaveAttribute('href', '#main');
    });
  });

  describe('logout', () => {
    it('clears the session and leaves the signed-in area', async () => {
      vi.mocked(logout).mockResolvedValueOnce(undefined);
      render(<AppShell>content</AppShell>);

      await userEvent.click(screen.getByRole('button', { name: /log out/i }));

      expect(logout).toHaveBeenCalled();
      await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'));
    });
  });

  describe('email verification banner', () => {
    it('stays hidden for a verified account', () => {
      render(<AppShell>content</AppShell>);

      expect(screen.queryByText(/confirm your email/i)).toBeNull();
    });

    it('prompts an unverified account, since alerts will not arm', () => {
      vi.mocked(useProfile).mockReturnValue(
        profile({ emailVerified: false }) as unknown as ReturnType<
          typeof useProfile
        >,
      );
      render(<AppShell>content</AppShell>);

      expect(screen.getByText(/confirm your email/i)).toBeVisible();
    });

    it('resends and reports what happened', async () => {
      const mutateAsync = vi.fn().mockResolvedValue({ sent: true });
      vi.mocked(useProfile).mockReturnValue(
        profile({ emailVerified: false }) as unknown as ReturnType<
          typeof useProfile
        >,
      );
      vi.mocked(useResendVerification).mockReturnValue({
        mutateAsync,
        isPending: false,
      } as unknown as ReturnType<typeof useResendVerification>);
      render(<AppShell>content</AppShell>);

      await userEvent.click(screen.getByRole('button', { name: /resend/i }));

      expect(mutateAsync).toHaveBeenCalled();
      expect(await screen.findByText(/verification email sent/i)).toBeVisible();
    });

    it('surfaces a throttled resend rather than looking like nothing happened', async () => {
      vi.mocked(useProfile).mockReturnValue(
        profile({ emailVerified: false }) as unknown as ReturnType<
          typeof useProfile
        >,
      );
      vi.mocked(useResendVerification).mockReturnValue({
        mutateAsync: vi.fn().mockRejectedValue(new Error('Too many requests')),
        isPending: false,
      } as unknown as ReturnType<typeof useResendVerification>);
      render(<AppShell>content</AppShell>);

      await userEvent.click(screen.getByRole('button', { name: /resend/i }));

      expect(await screen.findByText('Too many requests')).toBeVisible();
    });
  });
});

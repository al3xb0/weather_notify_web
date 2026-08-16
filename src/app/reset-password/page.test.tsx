import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResetPasswordPage from './page';
import { useResetPassword } from '@/lib/hooks';

const mutateAsync = vi.fn();
const replace = vi.fn();
const push = vi.fn();
let token: string | null = 'reset-token';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace }),
  useSearchParams: () => ({ get: () => token }),
}));
vi.mock('@/lib/hooks', () => ({ useResetPassword: vi.fn() }));
vi.mock('@/lib/api', () => ({
  apiError: (e: unknown) => (e as Error).message,
}));

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    token = 'reset-token';
    vi.mocked(useResetPassword).mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof useResetPassword>);
  });

  const fill = async (password: string, confirm: string) => {
    await userEvent.type(screen.getByLabelText('New password'), password);
    await userEvent.type(screen.getByLabelText('Confirm password'), confirm);
    await userEvent.click(screen.getByRole('button', { name: /set new/i }));
  };

  it('explains itself when the link arrived without a token', () => {
    token = null;
    render(<ResetPasswordPage />);

    expect(screen.getByText(/link is incomplete/i)).toBeInTheDocument();
    expect(screen.queryByLabelText('New password')).toBeNull();
  });

  it('refuses a mismatched confirmation without calling the API', async () => {
    render(<ResetPasswordPage />);
    await fill('new-password-1', 'new-password-2');

    expect(
      await screen.findByText('Passwords do not match'),
    ).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('refuses a password under the API minimum', async () => {
    render(<ResetPasswordPage />);
    await fill('short', 'short');

    expect(
      await screen.findByText('At least 8 characters'),
    ).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('submits the token from the URL with the new password', async () => {
    mutateAsync.mockResolvedValueOnce(undefined);
    render(<ResetPasswordPage />);
    await fill('new-password-1', 'new-password-1');

    expect(mutateAsync).toHaveBeenCalledWith({
      token: 'reset-token',
      password: 'new-password-1',
    });
    // The success copy has to say the other sessions are gone, because the API
    // revoked them and a user who is not told will assume otherwise.
    expect(await screen.findByText(/signed out/i)).toBeInTheDocument();
  });

  it('surfaces an expired or spent token instead of pretending it worked', async () => {
    mutateAsync.mockRejectedValueOnce(
      new Error('Invalid or expired reset token'),
    );
    render(<ResetPasswordPage />);
    await fill('new-password-1', 'new-password-1');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid or expired reset token',
    );
    expect(screen.getByLabelText('New password')).toBeInTheDocument();
  });
});

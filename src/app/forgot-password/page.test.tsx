import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordPage from './page';
import { useForgotPassword } from '@/lib/hooks';

const mutateAsync = vi.fn();
vi.mock('@/lib/hooks', () => ({ useForgotPassword: vi.fn() }));
vi.mock('@/lib/api', () => ({
  apiError: (e: unknown) => (e as Error).message,
}));

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useForgotPassword).mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof useForgotPassword>);
  });

  // Left empty on purpose where the schema is under test: `type="email"` means
  // the browser refuses to submit a malformed value at all, so a string like
  // "not-an-email" never reaches the resolver in a real form either.
  const submit = async (email?: string) => {
    if (email) {
      await userEvent.type(
        screen.getByPlaceholderText('you@example.com'),
        email,
      );
    }
    await userEvent.click(screen.getByRole('button', { name: /send reset/i }));
  };

  it('rejects an empty address without calling the API', async () => {
    render(<ForgotPasswordPage />);
    await submit();

    expect(await screen.findByText('Enter a valid email')).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('confirms without saying whether the account exists', async () => {
    mutateAsync.mockResolvedValueOnce({ accepted: true });
    render(<ForgotPasswordPage />);
    await submit('a@b.com');

    expect(mutateAsync).toHaveBeenCalledWith('a@b.com');
    // The wording is the point: the API answers identically for a known and an
    // unknown address, and a confirmation that read "we sent you an email"
    // would hand back the enumeration the API refuses to.
    const confirmation = await screen.findByText(/if that address has/i);
    expect(confirmation).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('you@example.com')).toBeNull();
  });

  it('keeps the form up and shows the error when the request fails', async () => {
    mutateAsync.mockRejectedValueOnce(new Error('Too many requests'));
    render(<ForgotPasswordPage />);
    await submit('a@b.com');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Too many requests',
    );
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });

  it('wires the field to its error so it is announced, not just drawn', async () => {
    render(<ForgotPasswordPage />);
    await submit();

    const email = await screen.findByLabelText('Email');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription('Enter a valid email');
  });
});

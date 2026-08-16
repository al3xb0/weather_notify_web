import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthForm } from './auth-form';
import { login } from '@/lib/hooks';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/lib/hooks', () => ({ login: vi.fn(), register: vi.fn() }));
vi.mock('@/lib/api', () => ({
  apiError: (e: unknown) => (e as Error).message,
}));

describe('AuthForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows validation errors and does not submit on empty input', async () => {
    render(<AuthForm mode="login" />);
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Enter a valid email')).toBeInTheDocument();
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('logs in and redirects on valid input', async () => {
    vi.mocked(login).mockResolvedValueOnce(undefined);
    render(<AuthForm mode="login" />);

    await userEvent.type(
      screen.getByPlaceholderText('you@example.com'),
      'a@b.com',
    );
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'password1');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(login).toHaveBeenCalledWith('a@b.com', 'password1');
    await waitFor(() => expect(push).toHaveBeenCalledWith('/dashboard'));
  });

  it('wires each field to its own error so it is announced, not just drawn', async () => {
    render(<AuthForm mode="login" />);
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    const email = await screen.findByLabelText('Email');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    // The accessible description is the error text, which only holds if
    // aria-describedby points at it.
    expect(email).toHaveAccessibleDescription('Enter a valid email');

    const password = screen.getByLabelText('Password');
    expect(password).toHaveAttribute('aria-invalid', 'true');
    expect(password).toHaveAccessibleDescription('At least 8 characters');
  });

  it('surfaces an API error', async () => {
    vi.mocked(login).mockRejectedValueOnce(new Error('Invalid credentials'));
    render(<AuthForm mode="login" />);

    await userEvent.type(
      screen.getByPlaceholderText('you@example.com'),
      'a@b.com',
    );
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'password1');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});

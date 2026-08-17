import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DangerZoneSection } from './danger-zone-section';
import { useDeleteAccount } from '@/lib/hooks';

const mutateAsync = vi.fn();
const replace = vi.fn();
const show = vi.fn();

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));
vi.mock('@/lib/hooks', () => ({ useDeleteAccount: vi.fn() }));
vi.mock('@/lib/api', () => ({
  apiError: (e: unknown) => (e as Error).message,
}));
vi.mock('@/components/ui/toast', () => ({ useToast: () => ({ show }) }));

describe('DangerZoneSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDeleteAccount).mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof useDeleteAccount>);
  });

  const open = async () =>
    userEvent.click(screen.getByRole('button', { name: 'Delete account' }));

  it('keeps the form collapsed until asked', () => {
    render(<DangerZoneSection />);
    expect(screen.queryByPlaceholderText('••••••••')).toBeNull();
  });

  it('will not submit without a password', async () => {
    render(<DangerZoneSection />);
    await open();

    expect(
      screen.getByRole('button', { name: /delete my account/i }),
    ).toBeDisabled();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('deletes and leaves the signed-in area', async () => {
    mutateAsync.mockResolvedValueOnce(undefined);
    render(<DangerZoneSection />);
    await open();

    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'Passw0rd!');
    await userEvent.click(
      screen.getByRole('button', { name: /delete my account/i }),
    );

    expect(mutateAsync).toHaveBeenCalledWith('Passw0rd!');
    // The account is gone, so every route behind the shell would 401 — and
    // `replace` rather than `push` keeps Back from returning to it.
    expect(replace).toHaveBeenCalledWith('/');
  });

  it('stays put and shows why when the password is wrong', async () => {
    mutateAsync.mockRejectedValueOnce(new Error('Incorrect password'));
    render(<DangerZoneSection />);
    await open();

    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'wrong');
    await userEvent.click(
      screen.getByRole('button', { name: /delete my account/i }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Incorrect password',
    );
    expect(replace).not.toHaveBeenCalled();
  });

  it('cancelling clears the password rather than leaving it in the field', async () => {
    render(<DangerZoneSection />);
    await open();
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'Passw0rd!');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await open();

    expect(screen.getByPlaceholderText('••••••••')).toHaveValue('');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminPage from './page';
import type { Profile } from '@/lib/types';

const { profileQuery } = vi.hoisted(() => ({
  profileQuery: {
    data: undefined as unknown,
    isPending: false,
    isError: false,
    error: null as unknown,
    refetch: vi.fn(),
  },
}));

vi.mock('@/lib/hooks', () => ({ useProfile: () => profileQuery }));
vi.mock('@/components/admin/stats-grid', () => ({
  StatsGrid: () => <div data-testid="stats" />,
}));
vi.mock('@/components/admin/user-table', () => ({
  UserTable: ({ onSelect }: { onSelect: (id: string) => void }) => (
    <button onClick={() => onSelect('u2')}>pick user</button>
  ),
}));
vi.mock('@/components/admin/user-detail', () => ({
  UserDetail: ({
    userId,
    selfId,
    onDeleted,
  }: {
    userId: string;
    selfId: string;
    onDeleted: () => void;
  }) => (
    <div>
      <span>
        detail {userId} as {selfId}
      </span>
      <button onClick={onDeleted}>simulate delete</button>
    </div>
  ),
}));

const profile = (role: 'USER' | 'ADMIN') =>
  ({ id: 'u1', email: 'a@b.c', role }) as Profile;

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    profileQuery.data = profile('ADMIN');
    profileQuery.isPending = false;
    profileQuery.isError = false;
  });

  // The API enforces this; the UI still must not present admin tooling to a
  // regular account that navigated here directly.
  it('refuses a non-admin account', () => {
    profileQuery.data = profile('USER');

    render(<AdminPage />);
    expect(screen.getByText('Access denied')).toBeInTheDocument();
    expect(screen.queryByTestId('stats')).toBeNull();
  });

  it('shows nothing either way until the role is known', () => {
    profileQuery.data = undefined;
    profileQuery.isPending = true;

    render(<AdminPage />);
    expect(screen.queryByText('Access denied')).toBeNull();
    expect(screen.queryByTestId('stats')).toBeNull();
  });

  it('renders the tooling for an admin', () => {
    render(<AdminPage />);
    expect(screen.getByRole('heading', { name: 'Admin' })).toBeInTheDocument();
    expect(screen.getByTestId('stats')).toBeInTheDocument();
  });

  it('opens a user’s detail only once one is picked', async () => {
    render(<AdminPage />);
    expect(screen.queryByText(/^detail/)).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'pick user' }));
    expect(screen.getByText('detail u2 as u1')).toBeInTheDocument();
  });

  // The detail panel needs the admin's own id to stop them deleting themselves,
  // and must close once the account it describes is gone.
  it('closes the detail after the account is deleted', async () => {
    render(<AdminPage />);
    await userEvent.click(screen.getByRole('button', { name: 'pick user' }));
    await userEvent.click(
      screen.getByRole('button', { name: 'simulate delete' }),
    );

    expect(screen.queryByText(/^detail/)).toBeNull();
  });
});

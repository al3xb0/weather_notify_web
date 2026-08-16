import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from './page';
import type { Trigger } from '@/lib/types';

const { triggersQuery, clearMutation } = vi.hoisted(() => ({
  triggersQuery: {
    data: undefined as unknown,
    isPending: false,
    isError: false,
    error: null as unknown,
    refetch: vi.fn(),
  },
  clearMutation: { mutate: vi.fn(), isPending: false },
}));

vi.mock('@/lib/hooks', () => ({
  useTriggers: () => triggersQuery,
  useClearTriggers: () => clearMutation,
  useApiLimits: () => ({ maxTriggersPerUser: 10 }),
}));

// The form and the list have their own suites; here they only need to be
// visible or not.
vi.mock('@/components/trigger-form', () => ({
  TriggerForm: ({ initial }: { initial?: Trigger }) => (
    <div data-testid="trigger-form">{initial ? 'editing' : 'creating'}</div>
  ),
}));
vi.mock('@/components/triggers/trigger-list', () => ({
  TriggerList: ({
    triggers,
    onEdit,
  }: {
    triggers: Trigger[];
    onEdit: (t: Trigger) => void;
  }) => (
    <ul>
      {triggers.map((t) => (
        <li key={t.id}>
          <button onClick={() => onEdit(t)}>edit {t.name}</button>
        </li>
      ))}
    </ul>
  ),
}));

const trigger = (id: string, name: string) =>
  ({ id, name, city: 'Berlin' }) as Trigger;

const page = (items: Trigger[]) => ({
  items,
  total: items.length,
  page: 1,
  limit: 100,
});

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    triggersQuery.data = page([trigger('t1', 'Heat')]);
    triggersQuery.isPending = false;
    triggersQuery.isError = false;
    clearMutation.isPending = false;
  });

  it('shows the count against the server limit', () => {
    render(<DashboardPage />);
    expect(screen.getByText('1 of 10 monitor')).toBeInTheDocument();
  });

  it('renders a skeleton while the list is loading', () => {
    triggersQuery.data = undefined;
    triggersQuery.isPending = true;

    render(<DashboardPage />);
    expect(screen.getByText('Weather monitors')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('invites the first trigger when there are none', () => {
    triggersQuery.data = page([]);

    render(<DashboardPage />);
    expect(screen.getByText('No triggers yet')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /clear all/i })).toBeNull();
  });

  it('opens the create form and hides the toolbar while it is open', async () => {
    render(<DashboardPage />);
    await userEvent.click(screen.getByRole('button', { name: /new trigger/i }));

    expect(screen.getByTestId('trigger-form')).toHaveTextContent('creating');
    expect(screen.queryByRole('button', { name: /new trigger/i })).toBeNull();
  });

  it('opens the editor for the trigger that was picked', async () => {
    render(<DashboardPage />);
    await userEvent.click(screen.getByRole('button', { name: 'edit Heat' }));

    expect(screen.getByTestId('trigger-form')).toHaveTextContent('editing');
  });

  // The limit lives on the server; the button must reflect it rather than let
  // the user submit into a 400.
  it('disables creation at the trigger limit and says why', () => {
    triggersQuery.data = page(
      Array.from({ length: 10 }, (_, i) => trigger(`t${i}`, `T${i}`)),
    );

    render(<DashboardPage />);
    const button = screen.getByRole('button', { name: /new trigger/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('title', expect.stringContaining('max 10'));
  });

  it('asks before clearing everything, and only clears on confirm', async () => {
    render(<DashboardPage />);
    await userEvent.click(screen.getByRole('button', { name: /clear all/i }));

    expect(screen.getByText('Delete all triggers?')).toBeInTheDocument();
    expect(clearMutation.mutate).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: /delete all/i }));
    expect(clearMutation.mutate).toHaveBeenCalled();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationsPage from './page';
import type { NotificationItem } from '@/lib/types';

const { state } = vi.hoisted(() => ({
  state: {
    requestedPage: 1,
    query: {
      data: undefined as unknown,
      isPending: false,
      isError: false,
      error: null as unknown,
      isPlaceholderData: false,
      refetch: vi.fn(),
    },
    del: { mutate: vi.fn(), isPending: false, variables: undefined as unknown },
    clear: { mutate: vi.fn(), isPending: false },
  },
}));

vi.mock('@/lib/hooks', () => ({
  NOTIFICATIONS_PAGE_SIZE: 20,
  useNotifications: (page: number) => {
    state.requestedPage = page;
    return state.query;
  },
  useDeleteNotification: () => state.del,
  useClearNotifications: () => state.clear,
}));

vi.mock('@/components/notifications/notification-row', () => ({
  NotificationRow: ({
    notification,
    onDelete,
  }: {
    notification: NotificationItem;
    onDelete: () => void;
  }) => (
    <li>
      <button onClick={onDelete}>delete {notification.id}</button>
    </li>
  ),
}));

const item = (id: string) => ({ id, channel: 'EMAIL' }) as NotificationItem;

const pageOf = (count: number, total: number) => ({
  items: Array.from({ length: count }, (_, i) => item(`n${i}`)),
  total,
  page: 1,
  limit: 20,
});

describe('NotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.requestedPage = 1;
    state.query.data = pageOf(3, 3);
    state.query.isPending = false;
    state.query.isPlaceholderData = false;
    state.del.isPending = false;
  });

  it('reports the total the server counted, not the rows on screen', () => {
    state.query.data = pageOf(20, 42);

    render(<NotificationsPage />);
    expect(screen.getByText('42 alerts logged')).toBeInTheDocument();
  });

  it('shows the empty state and hides "clear all" with no history', () => {
    state.query.data = pageOf(0, 0);

    render(<NotificationsPage />);
    expect(screen.getByText('No notifications yet')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /clear all/i })).toBeNull();
  });

  it('hides the pager when everything fits on one page', () => {
    render(<NotificationsPage />);
    expect(
      screen.queryByRole('navigation', { name: /pagination/i }),
    ).toBeNull();
  });

  it('walks pages and asks the hook for the one it shows', async () => {
    state.query.data = pageOf(20, 45);

    render(<NotificationsPage />);
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /prev/i })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(state.requestedPage).toBe(2);
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
  });

  it('stops at the last page', async () => {
    state.query.data = pageOf(20, 21);

    render(<NotificationsPage />);
    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  // Paging while a placeholder page is showing would request a page number the
  // user never saw land.
  it('freezes the pager while the next page is still a placeholder', () => {
    state.query.data = pageOf(20, 45);
    state.query.isPlaceholderData = true;

    render(<NotificationsPage />);
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('deletes a single row through the hook', async () => {
    render(<NotificationsPage />);
    await userEvent.click(screen.getByRole('button', { name: 'delete n0' }));

    expect(state.del.mutate).toHaveBeenCalledWith('n0', expect.anything());
  });

  // Deleting the last row of page 2 would otherwise strand the user on an empty
  // page beyond the first.
  it('steps back a page when its last row is deleted', async () => {
    state.query.data = pageOf(20, 21);
    const { rerender } = render(<NotificationsPage />);
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(state.requestedPage).toBe(2);

    // Page 2 holds the last row of the history.
    state.query.data = pageOf(1, 21);
    rerender(<NotificationsPage />);
    await userEvent.click(screen.getByRole('button', { name: 'delete n0' }));
    const [, options] = state.del.mutate.mock.calls.at(-1) as [
      string,
      { onSuccess: () => void },
    ];
    // The mutation's callback is what moves the page, so it runs as the app
    // would run it rather than as a bare function call.
    await act(async () => {
      options.onSuccess();
    });

    await screen.findByText('Page 1 of 2');
    expect(state.requestedPage).toBe(1);
  });

  it('confirms before clearing the whole history', async () => {
    render(<NotificationsPage />);
    await userEvent.click(screen.getByRole('button', { name: /clear all/i }));

    expect(screen.getByText('Delete all notifications?')).toBeInTheDocument();
    expect(state.clear.mutate).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: /delete all/i }));
    expect(state.clear.mutate).toHaveBeenCalled();
  });
});

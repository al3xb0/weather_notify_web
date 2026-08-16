import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PushSection } from './push-section';

const { push, hooks, toast } = vi.hoisted(() => ({
  push: {
    getActivePushEndpoint: vi.fn(),
    subscribeToPush: vi.fn(),
    unsubscribeFromPush: vi.fn(),
  },
  hooks: {
    add: { mutateAsync: vi.fn(), isPending: false },
    remove: { mutateAsync: vi.fn(), isPending: false },
  },
  toast: { show: vi.fn() },
}));

vi.mock('@/lib/push', () => push);
vi.mock('@/lib/hooks', () => ({
  useAddPushSubscription: () => hooks.add,
  useRemovePushSubscription: () => hooks.remove,
}));
vi.mock('@/components/ui/toast', () => ({ useToast: () => toast }));
vi.mock('@/lib/api', () => ({ apiError: (e: unknown) => (e as Error).message }));

const SUBSCRIPTION = {
  endpoint: 'https://push/1',
  keys: { p256dh: 'p', auth: 'a' },
};

describe('PushSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hooks.add.isPending = false;
    hooks.remove.isPending = false;
    push.getActivePushEndpoint.mockResolvedValue(null);
    push.subscribeToPush.mockResolvedValue(SUBSCRIPTION);
    push.unsubscribeFromPush.mockResolvedValue(SUBSCRIPTION.endpoint);
  });

  // The browser is the source of truth for whether this device is subscribed,
  // and it answers asynchronously — offering either button before then would
  // show half the users the wrong one.
  it('offers no action until the browser has been probed', async () => {
    render(<PushSection />);
    expect(screen.queryByRole('button')).toBeNull();

    expect(
      await screen.findByRole('button', { name: /enable push/i }),
    ).toBeInTheDocument();
  });

  it('shows the disable action when this browser is already subscribed', async () => {
    push.getActivePushEndpoint.mockResolvedValue(SUBSCRIPTION.endpoint);

    render(<PushSection />);
    expect(
      await screen.findByRole('button', { name: /disable push/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });

  it('registers the subscription with the API, not just the browser', async () => {
    render(<PushSection />);
    await userEvent.click(
      await screen.findByRole('button', { name: /enable push/i }),
    );

    expect(hooks.add.mutateAsync).toHaveBeenCalledWith(SUBSCRIPTION);
    expect(
      await screen.findByRole('button', { name: /disable push/i }),
    ).toBeInTheDocument();
    expect(toast.show).toHaveBeenCalledWith(expect.any(String), 'success');
  });

  it('keeps offering enable when permission is denied', async () => {
    push.subscribeToPush.mockRejectedValue(
      new Error('Notification permission was denied'),
    );

    render(<PushSection />);
    await userEvent.click(
      await screen.findByRole('button', { name: /enable push/i }),
    );

    expect(hooks.add.mutateAsync).not.toHaveBeenCalled();
    expect(toast.show).toHaveBeenCalledWith(
      'Notification permission was denied',
      'error',
    );
    expect(
      screen.getByRole('button', { name: /enable push/i }),
    ).toBeInTheDocument();
  });

  it('removes the endpoint server-side when disabling', async () => {
    push.getActivePushEndpoint.mockResolvedValue(SUBSCRIPTION.endpoint);

    render(<PushSection />);
    await userEvent.click(
      await screen.findByRole('button', { name: /disable push/i }),
    );

    expect(hooks.remove.mutateAsync).toHaveBeenCalledWith(SUBSCRIPTION.endpoint);
    expect(
      await screen.findByRole('button', { name: /enable push/i }),
    ).toBeInTheDocument();
  });

  // Nothing to tell the server about: the browser had no subscription to drop.
  it('does not call the API when there was no active subscription', async () => {
    push.getActivePushEndpoint.mockResolvedValue(SUBSCRIPTION.endpoint);
    push.unsubscribeFromPush.mockResolvedValue(null);

    render(<PushSection />);
    await userEvent.click(
      await screen.findByRole('button', { name: /disable push/i }),
    );

    expect(hooks.remove.mutateAsync).not.toHaveBeenCalled();
    expect(
      await screen.findByRole('button', { name: /enable push/i }),
    ).toBeInTheDocument();
  });
});

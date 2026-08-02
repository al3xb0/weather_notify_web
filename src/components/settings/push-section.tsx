'use client';

import { useEffect, useState } from 'react';
import { useAddPushSubscription, useRemovePushSubscription } from '@/lib/hooks';
import {
  getActivePushEndpoint,
  subscribeToPush,
  unsubscribeFromPush,
} from '@/lib/push';
import { apiError } from '@/lib/api';
import { SectionCard, StatusBadge } from '@/components/ui/section-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { PushIcon } from './icons';

export function PushSection() {
  const addPush = useAddPushSubscription();
  const removePush = useRemovePushSubscription();
  const toast = useToast();
  // null while we probe this browser's current subscription state.
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    void getActivePushEndpoint().then((endpoint) => setEnabled(!!endpoint));
  }, []);

  const enable = async () => {
    try {
      const sub = await subscribeToPush();
      await addPush.mutateAsync(sub);
      setEnabled(true);
      toast.show('Push notifications enabled on this device', 'success');
    } catch (e) {
      toast.show(apiError(e), 'error');
    }
  };

  const disable = async () => {
    try {
      const endpoint = await unsubscribeFromPush();
      if (endpoint) {
        await removePush.mutateAsync(endpoint);
      }
      setEnabled(false);
      toast.show('Push notifications disabled on this device', 'success');
    } catch (e) {
      toast.show(apiError(e), 'error');
    }
  };

  return (
    <SectionCard
      icon={<PushIcon />}
      title="Web Push"
      subtitle="Browser notifications on this device"
      badge={enabled && <StatusBadge>Enabled</StatusBadge>}
    >
      <div className="space-y-4">
        <p className="text-sm text-ink-dim">
          {enabled
            ? 'Push notifications are enabled in this browser.'
            : "Enable push notifications in this browser. You'll be prompted to grant permission."}
        </p>
        {enabled === null ? (
          <Skeleton className="h-9 w-48 rounded-xl" />
        ) : enabled ? (
          <button
            onClick={disable}
            disabled={removePush.isPending}
            className="focus-ring rounded-xl border border-rim px-4 py-2 text-sm font-semibold text-ink-dim transition-colors hover:border-red-500/40 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {removePush.isPending ? 'Disabling…' : 'Disable push notifications'}
          </button>
        ) : (
          <button
            onClick={enable}
            disabled={addPush.isPending}
            className="focus-ring rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-500/20 transition-all hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {addPush.isPending ? 'Enabling…' : 'Enable push notifications'}
          </button>
        )}
      </div>
    </SectionCard>
  );
}

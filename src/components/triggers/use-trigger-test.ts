'use client';

import axios from 'axios';
import { useApiLimits, useTestTrigger } from '@/lib/hooks';
import { apiError } from '@/lib/api';
import { useTestCooldown } from '@/lib/use-test-cooldown';
import { useToast } from '@/components/ui/toast';
import { CHANNEL_LABELS, type Trigger } from '@/lib/types';

/**
 * Pull the server's retry-after (seconds) off a 429 so the client cooldown
 * stays in sync with what the backend is actually enforcing.
 */
function retryAfterFromError(e: unknown): number | null {
  if (axios.isAxiosError(e) && e.response?.status === 429) {
    const data = e.response.data as { retryAfter?: number } | undefined;
    if (typeof data?.retryAfter === 'number') return data.retryAfter;
  }
  return null;
}

/**
 * Sending a test notification, including the shared cooldown. The result is a
 * toast rather than page state: nothing on a trigger card belongs to it.
 */
export function useTriggerTest() {
  const test = useTestTrigger();
  const toast = useToast();
  const { testCooldownSec } = useApiLimits();
  const { remaining, cooling, start } = useTestCooldown();

  const run = async (t: Trigger) => {
    try {
      const res = await test.mutateAsync(t.id);
      const channels = res.sent.map((c) => CHANNEL_LABELS[c]).join(', ');
      toast.show(
        channels
          ? `Test sent via ${channels}`
          : 'No channels configured for this trigger',
        channels ? 'success' : 'info',
      );
      start(testCooldownSec);
    } catch (e) {
      // A 429 means the server's own cooldown is still running; adopt its
      // deadline instead of the local default.
      const retryAfter = retryAfterFromError(e);
      if (retryAfter) start(retryAfter);
      toast.show(apiError(e), 'error');
    }
  };

  return {
    run,
    remaining,
    cooling,
    isTesting: (id: string) => test.isPending && test.variables === id,
  };
}

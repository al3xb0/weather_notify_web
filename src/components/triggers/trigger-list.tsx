'use client';

import { useState } from 'react';
import { useDeleteTrigger, useUpdateTrigger } from '@/lib/hooks';
import type { Trigger } from '@/lib/types';
import { TriggerCard } from './trigger-card';
import { useTriggerTest } from './use-trigger-test';

/**
 * Owns the per-row interaction state (which row is confirming a delete, which
 * is mid-toggle) so the page above only has to care about which trigger is
 * being edited.
 */
export function TriggerList({
  triggers,
  onEdit,
}: {
  triggers: Trigger[];
  onEdit: (t: Trigger) => void;
}) {
  const del = useDeleteTrigger();
  const update = useUpdateTrigger();
  const test = useTriggerTest();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <ul className="space-y-3">
      {triggers.map((t) => (
        <TriggerCard
          key={t.id}
          trigger={t}
          confirming={confirmId === t.id}
          deleting={del.isPending && del.variables === t.id}
          toggling={update.isPending && update.variables?.id === t.id}
          testing={test.isTesting(t.id)}
          cooling={test.cooling}
          cooldownRemaining={test.remaining}
          onToggleActive={() =>
            update.mutate({ id: t.id, input: { isActive: !t.isActive } })
          }
          onTest={() => void test.run(t)}
          onEdit={() => onEdit(t)}
          onAskDelete={() => setConfirmId(t.id)}
          onCancelDelete={() => setConfirmId(null)}
          onConfirmDelete={() =>
            del.mutate(t.id, { onSettled: () => setConfirmId(null) })
          }
        />
      ))}
    </ul>
  );
}

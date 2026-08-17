'use client';

import type { Trigger } from '@/lib/types';
import { useT } from '@/i18n';

const GHOST =
  'focus-ring rounded-lg border border-rim px-3 py-1.5 text-xs font-medium text-ink-dim transition-colors hover:border-rim-bright hover:text-ink disabled:cursor-not-allowed disabled:opacity-50';

const DANGER =
  'focus-ring rounded-lg border border-danger-bg px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:border-red-500/30 hover:bg-danger-bg disabled:opacity-50';

export function TriggerActions({
  trigger,
  confirming,
  deleting,
  testing,
  cooling,
  cooldownRemaining,
  onTest,
  onEdit,
  onAskDelete,
  onConfirmDelete,
  onCancelDelete,
}: {
  trigger: Trigger;
  confirming: boolean;
  deleting: boolean;
  testing: boolean;
  cooling: boolean;
  cooldownRemaining: number;
  onTest: () => void;
  onEdit: () => void;
  onAskDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}) {
  const t = useT();

  if (confirming) {
    return (
      <div className="flex shrink-0 gap-2">
        <button
          onClick={onConfirmDelete}
          disabled={deleting}
          className="focus-ring rounded-lg border border-red-500/30 bg-danger-bg px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
        >
          {t('common.confirm')}
        </button>
        <button onClick={onCancelDelete} disabled={deleting} className={GHOST}>
          {t('common.cancel')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 gap-2">
      <button
        onClick={onTest}
        disabled={testing || cooling}
        title={cooling ? t('triggers.testCooldownHint') : undefined}
        className={GHOST}
      >
        {testing
          ? t('triggers.testing')
          : cooling
            ? t('triggers.testWait', { seconds: cooldownRemaining })
            : t('triggers.test')}
      </button>
      <button
        onClick={onEdit}
        aria-label={t('triggers.editAriaLabel', { name: trigger.name })}
        className={GHOST}
      >
        {t('triggers.editAction')}
      </button>
      <button
        onClick={onAskDelete}
        aria-label={t('triggers.deleteAriaLabel', { name: trigger.name })}
        className={DANGER}
      >
        {t('triggers.delete')}
      </button>
    </div>
  );
}

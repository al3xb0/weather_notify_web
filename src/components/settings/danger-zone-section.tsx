'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeleteAccount } from '@/lib/hooks';
import { apiError } from '@/lib/api';
import { SectionCard } from '@/components/ui/section-card';
import { Field, inputClass } from '@/components/ui/field';
import { useToast } from '@/components/ui/toast';
import { WarningIcon } from './icons';

/**
 * Account deletion. The form stays collapsed behind a button and asks for the
 * password, which is what the API requires anyway — the confirmation is the
 * password rather than a second "are you sure", so there is exactly one step
 * that cannot be clicked through by habit.
 */
export function DangerZoneSection() {
  const router = useRouter();
  const remove = useDeleteAccount();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await remove.mutateAsync(password);
      toast.show('Your account has been deleted', 'success');
      router.replace('/');
    } catch (err) {
      setError(apiError(err));
    }
  };

  return (
    <SectionCard
      icon={<WarningIcon />}
      title="Delete account"
      subtitle="Permanently remove your account and all its data"
      tone="danger"
    >
      {!open ? (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-ink-dim">
            Deletes your triggers, pinned cities, notification history and
            connected channels. This cannot be undone.
          </p>
          <button
            onClick={() => setOpen(true)}
            className="focus-ring shrink-0 rounded-xl border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
          >
            Delete account
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field
            label="Confirm with your password"
            error={error ?? undefined}
            hint="Everything listed above is removed immediately and cannot be recovered."
          >
            {({ id, invalid, describedBy }) => (
              <input
                id={id}
                type="password"
                autoComplete="current-password"
                aria-invalid={invalid}
                aria-describedby={describedBy}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
            )}
          </Field>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setPassword('');
                setError(null);
              }}
              disabled={remove.isPending}
              className="focus-ring rounded-xl border border-rim px-4 py-2 text-sm font-medium text-ink-dim transition-colors hover:border-rim-bright hover:text-ink disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={remove.isPending || password.length === 0}
              className="focus-ring rounded-xl border border-red-500/30 bg-danger-bg px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {remove.isPending ? 'Deleting…' : 'Delete my account'}
            </button>
          </div>
        </form>
      )}
    </SectionCard>
  );
}

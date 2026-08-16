'use client';

import { useState } from 'react';
import {
  useAdminUser,
  useDeleteAdminTrigger,
  useDeleteAdminUser,
  useUpdateAdminUser,
} from '@/lib/hooks';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { AsyncBoundary } from '@/components/ui/async-boundary';
import { SkeletonCard } from '@/components/ui/skeleton';
import { conditionText } from '@/components/triggers/condition-text';
import {
  CHANNEL_LABELS,
  type AdminUserDetail as AdminUser,
  type Trigger,
} from '@/lib/types';
import { RoleBadge } from './role-badge';

const ACTION =
  'focus-ring rounded-lg border border-rim px-3 py-1.5 text-xs font-medium text-ink-dim transition-colors hover:border-rim-bright hover:text-ink disabled:cursor-not-allowed disabled:opacity-50';

function Pill({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 ${on ? 'bg-armed-bg text-emerald-400' : 'bg-elevated text-ink-dim'}`}
    >
      {children}
    </span>
  );
}

export function UserDetail({
  userId,
  selfId,
  onDeleted,
}: {
  userId: string;
  selfId: string | undefined;
  onDeleted: () => void;
}) {
  const query = useAdminUser(userId);
  return (
    <AsyncBoundary query={query} skeleton={<SkeletonCard className="h-40" />}>
      {(user) => (
        <UserDetailBody user={user} selfId={selfId} onDeleted={onDeleted} />
      )}
    </AsyncBoundary>
  );
}

function UserDetailBody({
  user,
  selfId,
  onDeleted,
}: {
  user: AdminUser;
  selfId: string | undefined;
  onDeleted: () => void;
}) {
  const update = useUpdateAdminUser();
  const delUser = useDeleteAdminUser();
  const delTrigger = useDeleteAdminTrigger();
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(false);
  const [confirmTrigger, setConfirmTrigger] = useState<Trigger | null>(null);

  const isSelf = user.id === selfId;

  return (
    <section
      aria-label={`Details for ${user.email}`}
      className="space-y-4 rounded-2xl border border-rim bg-card p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-heading text-base font-semibold text-ink">
            <span className="truncate">{user.email}</span>
            <RoleBadge role={user.role} />
          </p>
          <p className="mt-0.5 text-xs text-ink-dim">
            Joined {new Date(user.createdAt).toLocaleDateString()} ·{' '}
            {user.notificationCount} notifications · {user.pinnedCityCount}{' '}
            pinned
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() =>
              update.mutate({
                id: user.id,
                input: { emailVerified: !user.emailVerified },
              })
            }
            disabled={update.isPending}
            className={ACTION}
          >
            {user.emailVerified ? 'Unverify email' : 'Mark verified'}
          </button>
          <button
            onClick={() =>
              update.mutate({
                id: user.id,
                input: { role: user.role === 'ADMIN' ? 'USER' : 'ADMIN' },
              })
            }
            disabled={update.isPending || isSelf}
            title={isSelf ? 'You cannot change your own role' : undefined}
            className={ACTION}
          >
            {user.role === 'ADMIN' ? 'Demote to user' : 'Promote to admin'}
          </button>
          {!isSelf && (
            <button
              onClick={() => setConfirmDeleteUser(true)}
              disabled={delUser.isPending}
              className="focus-ring rounded-lg border border-danger-bg px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:border-red-500/30 hover:bg-danger-bg disabled:opacity-50"
            >
              Delete user
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <Pill on={user.emailVerified}>
          {user.emailVerified ? 'Email verified' : 'Email unverified'}
        </Pill>
        <Pill on={user.telegramLinked}>
          {user.telegramLinked ? 'Telegram linked' : 'No Telegram'}
        </Pill>
        {(user.quietHoursStart || user.quietHoursEnd) && (
          <span className="rounded-full bg-elevated px-2 py-0.5 text-ink-dim">
            Quiet {user.quietHoursStart ?? '—'}–{user.quietHoursEnd ?? '—'}
          </span>
        )}
        {user.timezone && (
          <span className="rounded-full bg-elevated px-2 py-0.5 text-ink-dim">
            {user.timezone}
          </span>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-dim">
          Triggers ({user.triggers.length})
        </p>
        {user.triggers.length === 0 ? (
          <p className="text-sm text-ink-dim">No triggers.</p>
        ) : (
          <ul className="space-y-2">
            {user.triggers.map((t) => (
              <li
                key={t.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-rim bg-surface p-3"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-medium text-ink">
                    <span className="truncate">{t.name}</span>
                    <span
                      className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] ${t.state === 'FIRED' ? 'bg-fired-bg text-amber-400' : 'bg-armed-bg text-emerald-400'}`}
                    >
                      {t.state}
                    </span>
                    {!t.isActive && (
                      <span className="shrink-0 text-[10px] text-ink-dim">
                        paused
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-ink-dim">
                    <span className="text-sky-400">{t.city}</span> ·{' '}
                    {conditionText(t)}
                  </p>
                  <p className="text-xs text-ink-dim">
                    {t.channels.map((c) => CHANNEL_LABELS[c]).join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => setConfirmTrigger(t)}
                  aria-label={`Delete trigger ${t.name}`}
                  className="focus-ring shrink-0 text-ink-dim transition-colors hover:text-red-400"
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 4h10M6.5 4V2.5h3V4M5 4l.5 9h5L11 4"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={confirmDeleteUser}
        title="Delete this user?"
        message={`This permanently removes ${user.email} and all of their triggers, notifications and pinned cities. This cannot be undone.`}
        confirmLabel="Delete user"
        danger
        pending={delUser.isPending}
        onConfirm={() =>
          delUser.mutate(user.id, {
            onSuccess: onDeleted,
            onSettled: () => setConfirmDeleteUser(false),
          })
        }
        onCancel={() => setConfirmDeleteUser(false)}
      />

      <ConfirmDialog
        open={!!confirmTrigger}
        title="Delete this trigger?"
        message={`Permanently delete "${confirmTrigger?.name}" belonging to ${user.email}.`}
        confirmLabel="Delete trigger"
        danger
        pending={delTrigger.isPending}
        onConfirm={() => {
          if (!confirmTrigger) return;
          delTrigger.mutate(
            { id: confirmTrigger.id, userId: user.id },
            { onSettled: () => setConfirmTrigger(null) },
          );
        }}
        onCancel={() => setConfirmTrigger(null)}
      />
    </section>
  );
}

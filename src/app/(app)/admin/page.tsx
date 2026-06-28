'use client';

import { useState } from 'react';
import {
  ADMIN_USERS_PAGE_SIZE,
  useAdminStats,
  useAdminUser,
  useAdminUsers,
  useDeleteAdminTrigger,
  useDeleteAdminUser,
  useProfile,
  useUpdateAdminUser,
} from '@/lib/hooks';
import { ConfirmDialog } from '@/components/confirm-dialog';
import {
  CHANNEL_LABELS,
  METRIC_LABELS,
  OPERATOR_LABELS,
  type AdminUserDetail,
  type Role,
  type Trigger,
} from '@/lib/types';

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-rim bg-card p-4">
      <p className="font-heading text-2xl font-bold text-ink">{value}</p>
      <p className="mt-0.5 text-xs text-ink-dim">{label}</p>
    </div>
  );
}

function RoleBadge({ role }: { role: Role }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        role === 'ADMIN'
          ? 'bg-sky-500/10 text-sky-400'
          : 'bg-elevated text-ink-dim'
      }`}
    >
      {role}
    </span>
  );
}

function conditionText(t: Trigger): string {
  const joiner = t.conditionLogic === 'OR' ? ' or ' : ' and ';
  return t.conditions
    .map((c) =>
      c.metric === 'SEVERE'
        ? 'Severe weather'
        : `${METRIC_LABELS[c.metric]} ${OPERATOR_LABELS[c.operator]} ${c.threshold}`,
    )
    .join(joiner);
}

function StatsSection() {
  const { data } = useAdminStats();
  if (!data) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl border border-rim bg-card/50" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard label="Users" value={data.users} />
      <StatCard label="Verified" value={data.verifiedUsers} />
      <StatCard label="Admins" value={data.admins} />
      <StatCard label="Triggers" value={data.triggers} />
      <StatCard label="Active triggers" value={data.activeTriggers} />
      <StatCard label="Pinned cities" value={data.pinnedCities} />
      <StatCard label="Notifications sent" value={data.notificationsSent} />
      <StatCard label="Notifications failed" value={data.notificationsFailed} />
    </div>
  );
}

function UserDetail({
  userId,
  selfId,
  onDeleted,
}: {
  userId: string;
  selfId: string | undefined;
  onDeleted: () => void;
}) {
  const { data, isLoading } = useAdminUser(userId);
  const update = useUpdateAdminUser();
  const delUser = useDeleteAdminUser();
  const delTrigger = useDeleteAdminTrigger();
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(false);
  const [confirmTrigger, setConfirmTrigger] = useState<Trigger | null>(null);

  if (isLoading || !data) {
    return <div className="h-40 animate-pulse rounded-2xl border border-rim bg-card/50" />;
  }

  const user: AdminUserDetail = data;
  const isSelf = user.id === selfId;

  return (
    <div className="space-y-4 rounded-2xl border border-rim bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-heading text-base font-semibold text-ink">
            <span className="truncate">{user.email}</span>
            <RoleBadge role={user.role} />
          </p>
          <p className="mt-0.5 text-xs text-ink-dim">
            Joined {new Date(user.createdAt).toLocaleDateString()} ·{' '}
            {user.notificationCount} notifications · {user.pinnedCityCount} pinned
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
            className="rounded-lg border border-rim px-3 py-1.5 text-xs font-medium text-ink-dim transition-colors hover:border-rim-bright hover:text-ink disabled:opacity-50"
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
            className="rounded-lg border border-rim px-3 py-1.5 text-xs font-medium text-ink-dim transition-colors hover:border-rim-bright hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {user.role === 'ADMIN' ? 'Demote to user' : 'Promote to admin'}
          </button>
          {!isSelf && (
            <button
              onClick={() => setConfirmDeleteUser(true)}
              disabled={delUser.isPending}
              className="rounded-lg border border-danger-bg px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:border-red-500/30 hover:bg-danger-bg disabled:opacity-50"
            >
              Delete user
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className={`rounded-full px-2 py-0.5 ${user.emailVerified ? 'bg-armed-bg text-emerald-400' : 'bg-elevated text-ink-dim'}`}>
          {user.emailVerified ? 'Email verified' : 'Email unverified'}
        </span>
        <span className={`rounded-full px-2 py-0.5 ${user.telegramLinked ? 'bg-armed-bg text-emerald-400' : 'bg-elevated text-ink-dim'}`}>
          {user.telegramLinked ? 'Telegram linked' : 'No Telegram'}
        </span>
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
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-dim/60">
          Triggers ({user.triggers.length})
        </p>
        {user.triggers.length === 0 ? (
          <p className="text-sm text-ink-dim/60">No triggers.</p>
        ) : (
          <div className="space-y-2">
            {user.triggers.map((t) => (
              <div
                key={t.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-rim bg-base p-3"
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
                      <span className="shrink-0 text-[10px] text-ink-dim">paused</span>
                    )}
                  </p>
                  <p className="truncate text-xs text-ink-dim">
                    <span className="text-sky-400">{t.city}</span> · {conditionText(t)}
                  </p>
                  <p className="text-xs text-ink-dim/60">
                    {t.channels.map((c) => CHANNEL_LABELS[c]).join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => setConfirmTrigger(t)}
                  aria-label="Delete trigger"
                  className="shrink-0 text-ink-dim/50 transition-colors hover:text-red-400"
                >
                  <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                    <path d="M3 4h10M6.5 4V2.5h3V4M5 4l.5 9h5L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
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
    </div>
  );
}

export default function AdminPage() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, isPlaceholderData } = useAdminUsers(page);

  if (profileLoading) {
    return <div className="h-40 animate-pulse rounded-2xl border border-rim bg-card/50" />;
  }

  if (!profile || profile.role !== 'ADMIN') {
    return (
      <div className="rounded-2xl border border-rim bg-card p-8 text-center">
        <p className="font-heading text-lg font-semibold text-ink">Access denied</p>
        <p className="mt-1 text-sm text-ink-dim">
          You need an admin account to view this page.
        </p>
      </div>
    );
  }

  const totalPages = data
    ? Math.max(1, Math.ceil(data.total / ADMIN_USERS_PAGE_SIZE))
    : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink">Admin</h1>
        <p className="mt-0.5 text-sm text-ink-dim">
          Manage users, their triggers and view platform metrics
        </p>
      </div>

      <StatsSection />

      <div className="space-y-3">
        <h2 className="font-heading text-sm font-semibold text-ink-dim">Users</h2>
        <div className="overflow-hidden rounded-2xl border border-rim bg-card">
          <div className="hidden grid-cols-12 gap-2 border-b border-rim px-4 py-2.5 text-xs font-medium text-ink-dim/60 sm:grid">
            <span className="col-span-5">Email</span>
            <span className="col-span-2">Role</span>
            <span className="col-span-2">Triggers</span>
            <span className="col-span-3">Joined</span>
          </div>
          {data?.items.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelectedId(u.id === selectedId ? null : u.id)}
              className={`flex w-full items-center gap-2 border-b border-rim px-4 py-3 text-left text-sm transition-colors last:border-b-0 hover:bg-elevated ${
                selectedId === u.id ? 'bg-elevated' : ''
              }`}
            >
              <span className="grid w-full grid-cols-1 items-center gap-1 sm:grid-cols-12 sm:gap-2">
                <span className="col-span-5 flex items-center gap-2 truncate">
                  <span className="truncate font-medium text-ink">{u.email}</span>
                  {!u.emailVerified && (
                    <span className="shrink-0 text-[10px] text-amber-400">unverified</span>
                  )}
                </span>
                <span className="col-span-2 hidden sm:block">
                  <RoleBadge role={u.role} />
                </span>
                <span className="col-span-2 hidden text-ink-dim sm:block">
                  {u.triggerCount}
                </span>
                <span className="col-span-3 hidden text-ink-dim/70 sm:block">
                  {new Date(u.createdAt).toLocaleDateString()}
                </span>
              </span>
            </button>
          ))}
        </div>

        {data && totalPages > 1 && (
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isPlaceholderData}
              className="rounded-xl border border-rim px-3.5 py-2 text-xs font-medium text-ink-dim transition-colors hover:border-rim-bright hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Prev
            </button>
            <span className="text-xs text-ink-dim">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isPlaceholderData}
              className="rounded-xl border border-rim px-3.5 py-2 text-xs font-medium text-ink-dim transition-colors hover:border-rim-bright hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {selectedId && (
        <UserDetail
          userId={selectedId}
          selfId={profile.id}
          onDeleted={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

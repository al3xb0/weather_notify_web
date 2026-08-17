'use client';

import { useState } from 'react';
import {
  NOTIFICATIONS_PAGE_SIZE,
  useClearNotifications,
  useDeleteNotification,
  useNotifications,
} from '@/lib/hooks';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { AsyncBoundary } from '@/components/ui/async-boundary';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonList } from '@/components/ui/skeleton';
import { NotificationRow } from '@/components/notifications/notification-row';
import type { NotificationItem, Paginated } from '@/lib/types';
import { useT } from '@/i18n';

const PAGER_BUTTON =
  'focus-ring rounded-xl border border-rim px-3.5 py-2 text-xs font-medium text-ink-dim transition-colors hover:border-rim-bright hover:text-ink disabled:cursor-not-allowed disabled:opacity-40';

function BellIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className="h-12 w-12"
      aria-hidden="true"
    >
      <path
        d="M24 8a10 10 0 0 0-10 10v7.5l-2.5 3.75h25L34 25.5V18A10 10 0 0 0 24 8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M20 34a4 4 0 0 0 8 0" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function NotificationsPage() {
  const t = useT();
  const [page, setPage] = useState(1);
  const [confirmClear, setConfirmClear] = useState(false);
  const notifications = useNotifications(page);
  const del = useDeleteNotification();
  const clear = useClearNotifications();

  const data = notifications.data;

  // When the last row on a page is removed, step back so we don't strand an
  // empty page beyond the first.
  const handleDelete = (id: string) => {
    del.mutate(id, {
      onSuccess: () => {
        if (data && data.items.length === 1 && page > 1) {
          setPage((p) => p - 1);
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">
            {t('notifications.title')}
          </h1>
          <p className="mt-0.5 text-sm text-ink-dim">
            {data
              ? t('notifications.count', { count: data.total })
              : t('notifications.subtitle')}
          </p>
        </div>
        {!!data?.items.length && (
          <button
            onClick={() => setConfirmClear(true)}
            disabled={clear.isPending}
            className="focus-ring shrink-0 rounded-xl border border-danger-bg px-3.5 py-2 text-xs font-medium text-red-400 transition-colors hover:border-red-500/30 hover:bg-danger-bg disabled:opacity-50"
          >
            {t('notifications.clearAll')}
          </button>
        )}
      </div>

      <AsyncBoundary
        query={notifications}
        skeleton={
          <SkeletonList
            count={4}
            variant="row"
            label="Loading notification history"
          />
        }
        isEmpty={(p: Paginated<NotificationItem>) => p.items.length === 0}
        empty={
          <EmptyState
            icon={<BellIcon />}
            title="No notifications yet"
            hint="Alerts will appear here when triggers fire"
          />
        }
      >
        {(pageData) => {
          const totalPages = Math.max(
            1,
            Math.ceil(pageData.total / NOTIFICATIONS_PAGE_SIZE),
          );
          return (
            <div className="space-y-6">
              <ul className="overflow-hidden rounded-2xl border border-rim bg-card">
                {pageData.items.map((n, idx) => (
                  <NotificationRow
                    key={n.id}
                    notification={n}
                    last={idx === pageData.items.length - 1}
                    deleting={del.isPending && del.variables === n.id}
                    onDelete={() => handleDelete(n.id)}
                  />
                ))}
              </ul>

              {totalPages > 1 && (
                <nav
                  aria-label="Notifications pagination"
                  className="flex items-center justify-between gap-4"
                >
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || notifications.isPlaceholderData}
                    className={PAGER_BUTTON}
                  >
                    ← Prev
                  </button>
                  <span aria-live="polite" className="text-xs text-ink-dim">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={
                      page >= totalPages || notifications.isPlaceholderData
                    }
                    className={PAGER_BUTTON}
                  >
                    Next →
                  </button>
                </nav>
              )}
            </div>
          );
        }}
      </AsyncBoundary>

      <ConfirmDialog
        open={confirmClear}
        title="Delete all notifications?"
        message="This permanently removes your entire notification history. This action cannot be undone."
        confirmLabel="Delete all"
        danger
        pending={clear.isPending}
        onConfirm={() =>
          clear.mutate(undefined, {
            onSuccess: () => setPage(1),
            onSettled: () => setConfirmClear(false),
          })
        }
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}

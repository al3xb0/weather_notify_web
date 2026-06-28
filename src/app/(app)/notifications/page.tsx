'use client';

import React from 'react';
import {
  NOTIFICATIONS_PAGE_SIZE,
  useClearNotifications,
  useDeleteNotification,
  useNotifications,
} from '@/lib/hooks';
import { CHANNEL_LABELS } from '@/lib/types';

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-rim bg-card/50 py-16 text-center">
      <svg viewBox="0 0 48 48" fill="none" className="mb-4 h-12 w-12 text-ink-dim/40" aria-hidden="true">
        <path d="M24 8a10 10 0 0 0-10 10v7.5l-2.5 3.75h25L34 25.5V18A10 10 0 0 0 24 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M20 34a4 4 0 0 0 8 0" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <p className="font-heading text-sm font-medium text-ink-dim">No notifications yet</p>
      <p className="mt-1 text-xs text-ink-dim/60">Alerts will appear here when triggers fire</p>
    </div>
  );
}

const CHANNEL_ICONS: Record<string, React.ReactElement> = {
  TELEGRAM: (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M14 2 L6 9 M14 2 L10 14 L6 9 L2 7 L14 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  ),
  EMAIL: (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <rect x="2" y="4" width="12" height="9" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 4.5l6 5 6-5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  ),
  WEB_PUSH: (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 1v1M8 14v1M1 8h1M14 8h1M3.2 3.2l.7.7M12.1 12.1l.7.7M12.1 3.2l-.7.7M3.2 12.1l.7.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
};

export default function NotificationsPage() {
  const [page, setPage] = React.useState(1);
  const { data, isLoading, isPlaceholderData } = useNotifications(page);
  const del = useDeleteNotification();
  const clear = useClearNotifications();

  const totalPages = data ? Math.max(1, Math.ceil(data.total / NOTIFICATIONS_PAGE_SIZE)) : 1;

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

  const handleClear = () => {
    if (window.confirm('Delete all notifications? This cannot be undone.')) {
      clear.mutate(undefined, { onSuccess: () => setPage(1) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">Notifications</h1>
          <p className="mt-0.5 text-sm text-ink-dim">
            {data ? `${data.total} alert${data.total !== 1 ? 's' : ''} logged` : 'Alert history'}
          </p>
        </div>
        {data && data.items.length > 0 && (
          <button
            onClick={handleClear}
            disabled={clear.isPending}
            className="shrink-0 rounded-xl border border-danger-bg px-3.5 py-2 text-xs font-medium text-red-400 transition-colors hover:border-red-500/30 hover:bg-danger-bg disabled:opacity-50"
          >
            Clear all
          </button>
        )}
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl border border-rim bg-card/50" />
          ))}
        </div>
      )}

      {data && data.items.length === 0 && <EmptyState />}

      {data && data.items.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-rim bg-card">
          {data.items.map((n, idx) => (
            <div
              key={n.id}
              className={`flex items-center justify-between gap-4 px-4 py-3.5 ${
                idx < data.items.length - 1 ? 'border-b border-rim' : ''
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-elevated text-ink-dim">
                  {CHANNEL_ICONS[n.channel]}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {n.payload?.triggerName ?? 'Trigger'}
                    {n.payload?.city && (
                      <span className="font-normal text-ink-dim"> · {n.payload.city}</span>
                    )}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-dim">
                    <span>{CHANNEL_LABELS[n.channel]}</span>
                    <span className="text-ink-dim/40">•</span>
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                  </p>
                  {n.error && (
                    <p className="mt-0.5 truncate text-xs text-red-400">{n.error}</p>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    n.status === 'SENT'
                      ? 'bg-armed-bg text-emerald-400'
                      : 'bg-danger-bg text-red-400'
                  }`}
                >
                  <span
                    className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                      n.status === 'SENT' ? 'bg-emerald-400' : 'bg-red-400'
                    }`}
                  />
                  {n.status}
                </span>
                <button
                  onClick={() => handleDelete(n.id)}
                  disabled={del.isPending}
                  aria-label="Delete notification"
                  className="text-ink-dim/50 transition-colors hover:text-red-400 disabled:opacity-50"
                >
                  <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                    <path d="M3 4h10M6.5 4V2.5h3V4M5 4l.5 9h5L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
  );
}

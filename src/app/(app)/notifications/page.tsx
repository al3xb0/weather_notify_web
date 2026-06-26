'use client';

import { useNotifications } from '@/lib/hooks';
import { CHANNEL_LABELS } from '@/lib/types';

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notifications</h1>
      {isLoading && <p className="text-slate-500">Loading…</p>}
      {data && data.items.length === 0 && (
        <p className="text-slate-500">No notifications yet.</p>
      )}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {data?.items.map((n) => (
          <div
            key={n.id}
            className="flex items-center justify-between border-b border-slate-100 px-4 py-3 last:border-0"
          >
            <div>
              <p className="text-sm font-medium">
                {CHANNEL_LABELS[n.channel]}
                {n.error && (
                  <span className="ml-2 text-xs text-red-500">{n.error}</span>
                )}
              </p>
              <p className="text-xs text-slate-400">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                n.status === 'SENT'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {n.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

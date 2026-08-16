import type { ReactElement } from 'react';
import {
  CHANNEL_LABELS,
  type NotifStatus,
  type NotificationItem,
} from '@/lib/types';

const CHANNEL_ICONS: Record<string, ReactElement> = {
  TELEGRAM: (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path
        d="M14 2 L6 9 M14 2 L10 14 L6 9 L2 7 L14 2Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  ),
  EMAIL: (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="4"
        width="12"
        height="9"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M2 4.5l6 5 6-5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  ),
  WEB_PUSH: (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M8 1v1M8 14v1M1 8h1M14 8h1M3.2 3.2l.7.7M12.1 12.1l.7.7M12.1 3.2l-.7.7M3.2 12.1l.7.7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  ),
};

// PENDING is a claimed-but-not-yet-delivered row. Treating anything that is not
// SENT as a failure would paint an in-flight delivery red.
const STATUS_STYLE: Record<NotifStatus, { pill: string; dot: string }> = {
  SENT: { pill: 'bg-armed-bg text-emerald-400', dot: 'bg-emerald-400' },
  PENDING: { pill: 'bg-elevated text-ink-dim', dot: 'bg-ink-dim' },
  FAILED: { pill: 'bg-danger-bg text-red-400', dot: 'bg-red-400' },
};

export function NotificationRow({
  notification: n,
  last,
  deleting,
  onDelete,
}: {
  notification: NotificationItem;
  last: boolean;
  deleting: boolean;
  onDelete: () => void;
}) {
  const style = STATUS_STYLE[n.status] ?? STATUS_STYLE.FAILED;
  const title = n.payload?.triggerName ?? 'Trigger';

  return (
    <li
      className={`flex items-center justify-between gap-4 px-4 py-3.5 ${
        last ? '' : 'border-b border-rim'
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-elevated text-ink-dim">
          {CHANNEL_ICONS[n.channel]}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">
            {title}
            {n.payload?.city && (
              <span className="font-normal text-ink-dim">
                {' '}
                · {n.payload.city}
              </span>
            )}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-dim">
            <span>{CHANNEL_LABELS[n.channel]}</span>
            <span aria-hidden="true" className="text-ink-dim/60">
              •
            </span>
            <span>{new Date(n.createdAt).toLocaleString()}</span>
          </p>
          {n.error && (
            <p className="mt-0.5 truncate text-xs text-red-400">{n.error}</p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style.pill}`}
        >
          <span
            aria-hidden="true"
            className={`mr-1.5 h-1.5 w-1.5 rounded-full ${style.dot}`}
          />
          {n.status}
        </span>
        <button
          onClick={onDelete}
          disabled={deleting}
          aria-label={`Delete notification for ${title}`}
          className="focus-ring text-ink-dim transition-colors hover:text-red-400 disabled:opacity-50"
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
      </div>
    </li>
  );
}

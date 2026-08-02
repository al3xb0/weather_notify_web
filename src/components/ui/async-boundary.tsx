'use client';

import type { ReactNode } from 'react';
import { apiError } from '@/lib/api';
import { SkeletonList } from './skeleton';

interface QueryLike<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => unknown;
}

interface AsyncBoundaryProps<T> {
  query: QueryLike<T>;
  /** Shown while the first load is in flight. */
  skeleton?: ReactNode;
  /** Decides whether loaded data counts as empty. */
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
  children: (data: T) => ReactNode;
}

/**
 * One place where loading, error, empty and data are decided.
 *
 * `isError` was previously handled in exactly one component, so a failed
 * request on the dashboard, admin, settings or notifications pages rendered an
 * empty screen indistinguishable from having no data. The route-level
 * error.tsx boundaries do not help: a rejected query is caught by React Query,
 * never thrown during render.
 */
export function AsyncBoundary<T>({
  query,
  skeleton,
  isEmpty,
  empty,
  children,
}: AsyncBoundaryProps<T>) {
  if (query.isLoading) {
    return <>{skeleton ?? <SkeletonList />}</>;
  }
  if (query.isError || query.data === undefined) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }
  if (isEmpty?.(query.data) && empty) {
    return <>{empty}</>;
  }
  return <>{children(query.data)}</>;
}

function ErrorState({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-500/20 bg-danger-bg/40 px-6 py-10 text-center"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-8 w-8 text-red-400/70"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M12 7.5v5M12 16h.01"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
      <div>
        <p className="font-heading text-sm font-medium text-ink">
          Could not load this
        </p>
        <p className="mt-1 text-xs text-ink-dim">
          {error ? apiError(error) : 'The request came back empty.'}
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="focus-ring rounded-xl border border-rim px-4 py-2 text-xs font-medium text-ink-dim transition-colors hover:border-rim-bright hover:text-ink"
      >
        Try again
      </button>
    </div>
  );
}

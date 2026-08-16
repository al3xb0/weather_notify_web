'use client';

import { ADMIN_USERS_PAGE_SIZE, useAdminUsers } from '@/lib/hooks';
import { AsyncBoundary } from '@/components/ui/async-boundary';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonList } from '@/components/ui/skeleton';
import type { AdminUserListItem, Paginated } from '@/lib/types';
import { RoleBadge } from './role-badge';

const PAGER_BUTTON =
  'focus-ring rounded-xl border border-rim px-3.5 py-2 text-xs font-medium text-ink-dim transition-colors hover:border-rim-bright hover:text-ink disabled:cursor-not-allowed disabled:opacity-40';

export function UserTable({
  page,
  onPageChange,
  selectedId,
  onSelect,
}: {
  page: number;
  onPageChange: (page: number) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const users = useAdminUsers(page);

  return (
    <AsyncBoundary
      query={users}
      skeleton={<SkeletonList count={5} variant="row" label="Loading users" />}
      isEmpty={(p: Paginated<AdminUserListItem>) => p.items.length === 0}
      empty={<EmptyState title="No users" />}
    >
      {(data) => {
        const totalPages = Math.max(
          1,
          Math.ceil(data.total / ADMIN_USERS_PAGE_SIZE),
        );
        return (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-rim bg-card">
              <div className="hidden grid-cols-12 gap-2 border-b border-rim px-4 py-2.5 text-xs font-medium text-ink-dim/70 sm:grid">
                <span className="col-span-5">Email</span>
                <span className="col-span-2">Role</span>
                <span className="col-span-2">Triggers</span>
                <span className="col-span-3">Joined</span>
              </div>
              {data.items.map((u) => (
                <button
                  key={u.id}
                  onClick={() => onSelect(u.id === selectedId ? null : u.id)}
                  aria-expanded={selectedId === u.id}
                  className={`focus-ring flex w-full items-center gap-2 border-b border-rim px-4 py-3 text-left text-sm transition-colors last:border-b-0 hover:bg-elevated ${
                    selectedId === u.id ? 'bg-elevated' : ''
                  }`}
                >
                  <span className="grid w-full grid-cols-1 items-center gap-1 sm:grid-cols-12 sm:gap-2">
                    <span className="col-span-5 flex items-center gap-2 truncate">
                      <span className="truncate font-medium text-ink">
                        {u.email}
                      </span>
                      {!u.emailVerified && (
                        <span className="shrink-0 text-[10px] text-amber-400">
                          unverified
                        </span>
                      )}
                    </span>
                    <span className="col-span-2 hidden sm:block">
                      <RoleBadge role={u.role} />
                    </span>
                    <span className="col-span-2 hidden text-ink-dim sm:block">
                      {u.triggerCount}
                    </span>
                    <span className="col-span-3 hidden text-ink-dim sm:block">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                aria-label="Users pagination"
                className="flex items-center justify-between gap-4"
              >
                <button
                  onClick={() => onPageChange(Math.max(1, page - 1))}
                  disabled={page <= 1 || users.isPlaceholderData}
                  className={PAGER_BUTTON}
                >
                  ← Prev
                </button>
                <span aria-live="polite" className="text-xs text-ink-dim">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages || users.isPlaceholderData}
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
  );
}

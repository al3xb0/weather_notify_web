'use client';

import { useState } from 'react';
import { useTelegramLink, useUnlinkTelegram } from '@/lib/hooks';
import { apiError } from '@/lib/api';
import { SectionCard, StatusBadge } from '@/components/ui/section-card';
import { useToast } from '@/components/ui/toast';
import type { Profile } from '@/lib/types';
import { TelegramIcon } from './icons';

export function TelegramSection({ profile }: { profile: Profile }) {
  const link = useTelegramLink();
  const unlink = useUnlinkTelegram();
  const toast = useToast();
  const [linkUrl, setLinkUrl] = useState<string | null>(null);

  const generate = async () => {
    try {
      const res = await link.mutateAsync();
      setLinkUrl(res.url);
    } catch (e) {
      toast.show(apiError(e), 'error');
    }
  };

  const disconnect = async () => {
    try {
      await unlink.mutateAsync();
      setLinkUrl(null);
      toast.show('Telegram unlinked', 'success');
    } catch (e) {
      toast.show(apiError(e), 'error');
    }
  };

  return (
    <SectionCard
      icon={<TelegramIcon />}
      title="Telegram"
      subtitle="Receive alerts in your Telegram chat"
      badge={profile.telegramLinked && <StatusBadge>Linked</StatusBadge>}
    >
      {profile.telegramLinked ? (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-ink-dim">
            Chat ID:{' '}
            <code className="rounded-md bg-elevated px-1.5 py-0.5 font-mono text-xs text-sky-400">
              {profile.telegramChatId}
            </code>
          </p>
          <button
            onClick={disconnect}
            disabled={unlink.isPending}
            className="focus-ring shrink-0 rounded-xl border border-rim px-4 py-2 text-sm font-medium text-ink-dim transition-colors hover:border-red-500/40 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {unlink.isPending ? 'Unlinking…' : 'Unlink'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-ink-dim">
            Link your Telegram account to receive weather alerts directly in
            chat.
          </p>
          <button
            onClick={generate}
            disabled={link.isPending}
            className="focus-ring rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-500/20 transition-all hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {link.isPending ? 'Generating…' : 'Generate link'}
          </button>
          {linkUrl && (
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
              <p className="mb-2 text-xs font-medium text-sky-400">
                Open the link below and press Start in Telegram:
              </p>
              <a
                href={linkUrl}
                target="_blank"
                rel="noreferrer"
                className="focus-ring break-all text-xs text-sky-300 underline underline-offset-2 hover:text-sky-200"
              >
                {linkUrl}
              </a>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

'use client';

import { useState } from 'react';
import {
  useAddPushSubscription,
  useProfile,
  useTelegramLink,
} from '@/lib/hooks';
import { subscribeToPush } from '@/lib/push';
import { apiError } from '@/lib/api';

export default function SettingsPage() {
  const { data: profile } = useProfile();
  const telegramLink = useTelegramLink();
  const addPush = useAddPushSubscription();

  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [pushMsg, setPushMsg] = useState<string | null>(null);

  const generateLink = async () => {
    const res = await telegramLink.mutateAsync();
    setLinkUrl(res.url);
  };

  const enablePush = async () => {
    setPushMsg(null);
    try {
      const sub = await subscribeToPush();
      await addPush.mutateAsync(sub);
      setPushMsg('Push notifications enabled on this device ✅');
    } catch (e) {
      setPushMsg(apiError(e));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-2 font-semibold">Telegram</h2>
        {profile?.telegramLinked ? (
          <p className="text-sm text-emerald-700">
            Telegram is linked ✅ (chat {profile.telegramChatId})
          </p>
        ) : (
          <>
            <p className="mb-3 text-sm text-slate-600">
              Link your Telegram account to receive alerts in chat.
            </p>
            <button
              onClick={generateLink}
              disabled={telegramLink.isPending}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
            >
              Generate link
            </button>
            {linkUrl && (
              <p className="mt-3 text-sm">
                Open this link and press Start:{' '}
                <a
                  href={linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-sky-600 hover:underline"
                >
                  {linkUrl}
                </a>
              </p>
            )}
          </>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-2 font-semibold">Web Push</h2>
        <p className="mb-3 text-sm text-slate-600">
          Enable browser notifications on this device.
        </p>
        <button
          onClick={enablePush}
          disabled={addPush.isPending}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          Enable push
        </button>
        {pushMsg && <p className="mt-3 text-sm text-slate-700">{pushMsg}</p>}
      </section>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import {
  useAddPushSubscription,
  useProfile,
  useRemovePushSubscription,
  useTelegramLink,
  useUnlinkTelegram,
} from '@/lib/hooks';
import {
  getActivePushEndpoint,
  subscribeToPush,
  unsubscribeFromPush,
} from '@/lib/push';
import { apiError } from '@/lib/api';

function TelegramIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M17.5 2.5 L7.5 11.25 M17.5 2.5 L12.5 17.5 L7.5 11.25 L2.5 8.75 L17.5 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PushIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M10 3.5a5 5 0 0 0-5 5v4.7l-1.5 2h13L15 13.2V8.5a5 5 0 0 0-5-5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M8 16.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SettingsPage() {
  const { data: profile } = useProfile();
  const telegramLink = useTelegramLink();
  const unlinkTelegram = useUnlinkTelegram();
  const addPush = useAddPushSubscription();
  const removePush = useRemovePushSubscription();

  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [pushMsg, setPushMsg] = useState<string | null>(null);
  const [pushError, setPushError] = useState(false);
  // null while we probe this browser's current subscription state.
  const [pushEnabled, setPushEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    void getActivePushEndpoint().then((endpoint) => setPushEnabled(!!endpoint));
  }, []);

  const generateLink = async () => {
    const res = await telegramLink.mutateAsync();
    setLinkUrl(res.url);
  };

  const unlink = async () => {
    await unlinkTelegram.mutateAsync();
    setLinkUrl(null);
  };

  const enablePush = async () => {
    setPushMsg(null);
    setPushError(false);
    try {
      const sub = await subscribeToPush();
      await addPush.mutateAsync(sub);
      setPushEnabled(true);
      setPushMsg('Push notifications enabled on this device');
    } catch (e) {
      setPushMsg(apiError(e));
      setPushError(true);
    }
  };

  const disablePush = async () => {
    setPushMsg(null);
    setPushError(false);
    try {
      const endpoint = await unsubscribeFromPush();
      if (endpoint) {
        await removePush.mutateAsync(endpoint);
      }
      setPushEnabled(false);
      setPushMsg('Push notifications disabled on this device');
    } catch (e) {
      setPushMsg(apiError(e));
      setPushError(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink">Settings</h1>
        <p className="mt-0.5 text-sm text-ink-dim">Configure notification channels</p>
      </div>

      {/* Telegram section */}
      <section className="overflow-hidden rounded-2xl border border-rim bg-card">
        <div className="flex items-center gap-3 border-b border-rim px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
            <TelegramIcon />
          </div>
          <div>
            <h2 className="font-heading text-sm font-semibold text-ink">Telegram</h2>
            <p className="text-xs text-ink-dim">Receive alerts in your Telegram chat</p>
          </div>
          {profile?.telegramLinked && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-armed-bg px-2.5 py-1 text-xs font-medium text-emerald-400">
              <CheckIcon />
              Linked
            </span>
          )}
        </div>

        <div className="px-5 py-4">
          {profile?.telegramLinked ? (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-ink-dim">
                Chat ID:{' '}
                <code className="rounded-md bg-elevated px-1.5 py-0.5 font-mono text-xs text-sky-400">
                  {profile.telegramChatId}
                </code>
              </p>
              <button
                onClick={unlink}
                disabled={unlinkTelegram.isPending}
                className="shrink-0 rounded-xl border border-rim px-4 py-2 text-sm font-medium text-ink-dim transition-colors hover:border-red-500/40 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {unlinkTelegram.isPending ? 'Unlinking…' : 'Unlink'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-ink-dim">
                Link your Telegram account to receive weather alerts directly in chat.
              </p>
              <button
                onClick={generateLink}
                disabled={telegramLink.isPending}
                className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-500/20 transition-all hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {telegramLink.isPending ? 'Generating…' : 'Generate link'}
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
                    className="break-all text-xs text-sky-300 underline underline-offset-2 hover:text-sky-200"
                  >
                    {linkUrl}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Web Push section */}
      <section className="overflow-hidden rounded-2xl border border-rim bg-card">
        <div className="flex items-center gap-3 border-b border-rim px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
            <PushIcon />
          </div>
          <div>
            <h2 className="font-heading text-sm font-semibold text-ink">Web Push</h2>
            <p className="text-xs text-ink-dim">Browser notifications on this device</p>
          </div>
          {pushEnabled && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-armed-bg px-2.5 py-1 text-xs font-medium text-emerald-400">
              <CheckIcon />
              Enabled
            </span>
          )}
        </div>

        <div className="px-5 py-4 space-y-4">
          <p className="text-sm text-ink-dim">
            {pushEnabled
              ? 'Push notifications are enabled in this browser.'
              : "Enable push notifications in this browser. You'll be prompted to grant permission."}
          </p>
          {pushEnabled === null ? (
            <div className="h-9 w-48 animate-pulse rounded-xl bg-elevated" />
          ) : pushEnabled ? (
            <button
              onClick={disablePush}
              disabled={removePush.isPending}
              className="rounded-xl border border-rim px-4 py-2 text-sm font-semibold text-ink-dim transition-colors hover:border-red-500/40 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {removePush.isPending ? 'Disabling…' : 'Disable push notifications'}
            </button>
          ) : (
            <button
              onClick={enablePush}
              disabled={addPush.isPending}
              className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-500/20 transition-all hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addPush.isPending ? 'Enabling…' : 'Enable push notifications'}
            </button>
          )}
          {pushMsg && (
            <p
              className={`flex items-center gap-1.5 text-sm ${
                pushError ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {!pushError && <CheckIcon />}
              {pushMsg}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

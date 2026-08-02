'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useResendVerification, useVerifyEmail } from '@/lib/hooks';
import { apiError } from '@/lib/api';

type Status = 'idle' | 'verifying' | 'success' | 'error';

function VerifyEmailInner() {
  const token = useSearchParams().get('token');
  const verify = useVerifyEmail();
  const resend = useResendVerification();
  const [status, setStatus] = useState<Status>(token ? 'verifying' : 'idle');
  const [message, setMessage] = useState<string | null>(null);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    verify
      .mutateAsync(token)
      .then(() => setStatus('success'))
      .catch((e) => {
        setStatus('error');
        setMessage(apiError(e));
      });
  }, [token, verify]);

  const doResend = async () => {
    setResendMsg(null);
    try {
      const res = await resend.mutateAsync();
      setResendMsg(
        res.sent
          ? 'A new verification email is on its way.'
          : 'Your email is already verified.',
      );
    } catch (e) {
      setResendMsg(apiError(e));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-aurora px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-rim bg-card p-8 shadow-2xl shadow-black/40">
        <h1 className="font-heading mb-2 text-xl font-bold text-ink">
          {status === 'success' ? 'Email verified' : 'Verify your email'}
        </h1>

        {status === 'verifying' && (
          <p className="text-sm text-ink-dim">Confirming your email…</p>
        )}

        {status === 'success' && (
          <p className="text-sm text-emerald-400">
            Your email is confirmed. You can now use every feature.
          </p>
        )}

        {status === 'error' && (
          <p className="text-sm text-red-400">{message}</p>
        )}

        {status === 'idle' && (
          <p className="text-sm text-ink-dim">
            We sent a verification link to your email. Open it to confirm your
            address.
          </p>
        )}

        {status !== 'success' && (
          <div className="mt-5 space-y-2">
            <p className="text-xs text-ink-dim/70">
              Didn&apos;t get it? Check your <strong className="font-medium text-ink-dim">spam</strong> or{' '}
              <strong className="font-medium text-ink-dim">promotions</strong> folder — automated
              emails often end up there.
            </p>
            <button
              onClick={doResend}
              disabled={resend.isPending}
              className="w-full rounded-xl bg-sky-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resend.isPending ? 'Sending…' : 'Resend verification email'}
            </button>
            {resendMsg && (
              <p className="text-xs text-ink-dim">{resendMsg}</p>
            )}
          </div>
        )}

        <p className="mt-5 text-center text-sm text-ink-dim">
          <Link
            href="/dashboard"
            className="font-medium text-sky-400 transition-colors hover:text-sky-300"
          >
            Go to dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailInner />
    </Suspense>
  );
}

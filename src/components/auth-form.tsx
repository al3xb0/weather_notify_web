'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { login, register as registerUser } from '@/lib/hooks';
import { apiError } from '@/lib/api';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
});
type FormData = z.infer<typeof schema>;

function WeatherBadge() {
  return (
    <div className="mb-8 flex flex-col items-center gap-3">
      <div className="relative inline-flex items-center justify-center">
        <span className="absolute h-16 w-16 rounded-full border border-sky-400/20 animate-radar" />
        <span className="absolute h-16 w-16 rounded-full border border-sky-400/15 animate-radar-2" />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-rim-bright bg-elevated">
          <svg viewBox="0 0 28 28" fill="none" className="h-7 w-7" aria-hidden="true">
            <path
              d="M5 20a5 5 0 0 1 4-9.8A6.5 6.5 0 1 1 22 19a4 4 0 0 1 0 3H5a4 4 0 0 1 0-2Z"
              fill="rgba(56,189,248,0.12)"
              stroke="#38bdf8"
              strokeWidth="1.25"
              strokeLinejoin="round"
            />
            <path
              d="M13 21 l-2.5 5.5 4-2.5 -2 5.5"
              stroke="#fbbf24"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      <span className="font-heading text-sm font-semibold tracking-wide text-ink-dim">
        Weather Notify
      </span>
    </div>
  );
}

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (data) => {
    setError(null);
    try {
      if (mode === 'login') {
        await login(data.email, data.password);
        router.push('/dashboard');
      } else {
        await registerUser(data.email, data.password);
        router.push('/verify-email');
      }
    } catch (e) {
      setError(apiError(e));
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-aurora px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo mark */}
        <WeatherBadge />

        {/* Card */}
        <div className="rounded-2xl border border-rim bg-card p-8 shadow-2xl shadow-black/40">
          <h1 className="font-heading mb-1 text-xl font-bold text-ink">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="mb-6 text-sm text-ink-dim">
            {mode === 'login'
              ? 'Sign in to your Weather Notify account'
              : 'Start monitoring weather in seconds'}
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-dim">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                {...register('email')}
                className="w-full rounded-xl border border-rim bg-base px-3.5 py-2.5 text-sm text-ink placeholder-ink-dim/50 outline-none transition-colors focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/10"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-dim">
                Password
              </label>
              <input
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                {...register('password')}
                className="w-full rounded-xl border border-rim bg-base px-3.5 py-2.5 text-sm text-ink placeholder-ink-dim/50 outline-none transition-colors focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/10"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Global error */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-danger-bg px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-xl bg-sky-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:bg-sky-400 hover:shadow-sky-400/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? 'Please wait…'
                : mode === 'login'
                  ? 'Sign in'
                  : 'Create account'}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="mt-5 text-center text-sm text-ink-dim">
          {mode === 'login' ? (
            <>
              No account?{' '}
              <Link
                href="/register"
                className="font-medium text-sky-400 hover:text-sky-300 transition-colors"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              Already registered?{' '}
              <Link
                href="/login"
                className="font-medium text-sky-400 hover:text-sky-300 transition-colors"
              >
                Sign in
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

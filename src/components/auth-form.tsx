'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { login, register as registerUser } from '@/lib/hooks';
import { apiError } from '@/lib/api';
import { Field, inputClass } from '@/components/ui/field';

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
            <Field label="Email" error={errors.email?.message}>
              {({ id, invalid, describedBy }) => (
                <input
                  id={id}
                  type="email"
                  autoComplete="email"
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  {...register('email')}
                  className={inputClass}
                  placeholder="you@example.com"
                />
              )}
            </Field>

            <Field label="Password" error={errors.password?.message}>
              {({ id, invalid, describedBy }) => (
                <input
                  id={id}
                  type="password"
                  autoComplete={
                    mode === 'login' ? 'current-password' : 'new-password'
                  }
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  {...register('password')}
                  className={inputClass}
                  placeholder="••••••••"
                />
              )}
            </Field>

            {/* Global error */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/20 bg-danger-bg px-4 py-3 text-sm text-red-400"
              >
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

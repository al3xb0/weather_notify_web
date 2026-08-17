'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useResetPassword } from '@/lib/hooks';
import { apiError } from '@/lib/api';
import { AuthCard, AuthCardLink } from '@/components/auth-card';
import { Field, inputClass } from '@/components/ui/field';

const schema = z
  .object({
    password: z.string().min(8, 'At least 8 characters').max(72),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });
type FormData = z.infer<typeof schema>;

function ResetPasswordInner() {
  const token = useSearchParams().get('token');
  const router = useRouter();
  const reset = useResetPassword();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (data) => {
    if (!token) return;
    setError(null);
    try {
      await reset.mutateAsync({ token, password: data.password });
      setDone(true);
    } catch (e) {
      setError(apiError(e));
    }
  });

  if (!token) {
    return (
      <AuthCard
        title="Link is incomplete"
        footer={
          <AuthCardLink href="/forgot-password">
            Request a new link
          </AuthCardLink>
        }
      >
        <p className="text-sm text-red-400">
          This page needs the token from the reset email. Open the link from
          your inbox, or request a new one.
        </p>
      </AuthCard>
    );
  }

  if (done) {
    return (
      <AuthCard
        title="Password changed"
        footer={<AuthCardLink href="/login">Go to sign in</AuthCardLink>}
      >
        <p className="text-sm text-emerald-400">
          Your password is updated. Everywhere you were signed in has been
          signed out, so sign in again with the new password.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="mt-5 w-full rounded-xl bg-sky-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:bg-sky-400"
        >
          Sign in
        </button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Choose a new password"
      subtitle="This also signs you out everywhere else."
      footer={<AuthCardLink href="/login">Back to sign in</AuthCardLink>}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="New password" error={errors.password?.message}>
          {({ id, invalid, describedBy }) => (
            <input
              id={id}
              type="password"
              autoComplete="new-password"
              aria-invalid={invalid}
              aria-describedby={describedBy}
              {...register('password')}
              className={inputClass}
              placeholder="••••••••"
            />
          )}
        </Field>

        <Field label="Confirm password" error={errors.confirm?.message}>
          {({ id, invalid, describedBy }) => (
            <input
              id={id}
              type="password"
              autoComplete="new-password"
              aria-invalid={invalid}
              aria-describedby={describedBy}
              {...register('confirm')}
              className={inputClass}
              placeholder="••••••••"
            />
          )}
        </Field>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/20 bg-danger-bg px-4 py-3 text-sm text-red-400"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-xl bg-sky-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:bg-sky-400 hover:shadow-sky-400/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Saving…' : 'Set new password'}
        </button>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForgotPassword } from '@/lib/hooks';
import { apiError } from '@/lib/api';
import { AuthCard, AuthCardLink } from '@/components/auth-card';
import { Field, inputClass } from '@/components/ui/field';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const forgot = useForgotPassword();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (data) => {
    setError(null);
    try {
      await forgot.mutateAsync(data.email);
      setSent(true);
    } catch (e) {
      setError(apiError(e));
    }
  });

  if (sent) {
    return (
      <AuthCard
        title="Check your email"
        footer={<AuthCardLink href="/login">Back to sign in</AuthCardLink>}
      >
        {/* Deliberately does not say whether an account exists — the API
            answers the same either way, and saying more here would undo it. */}
        <p className="text-sm text-ink-dim">
          If that address has an account, a reset link is on its way. It expires
          in one hour.
        </p>
        <p className="mt-3 text-xs text-ink-dim/70">
          Didn&apos;t get it? Check your{' '}
          <strong className="font-medium text-ink-dim">spam</strong> or{' '}
          <strong className="font-medium text-ink-dim">promotions</strong>{' '}
          folder — automated emails often end up there.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="We'll email you a link to choose a new one."
      footer={<AuthCardLink href="/login">Back to sign in</AuthCardLink>}
    >
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
          {isSubmitting ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
    </AuthCard>
  );
}

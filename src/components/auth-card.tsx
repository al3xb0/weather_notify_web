import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * The centred card the signed-out pages share. It exists because the shell
 * around sign-in, verification and password reset is identical, and three
 * copies of it had already started to drift apart in padding and shadow.
 */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex flex-1 items-center justify-center bg-aurora px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-rim bg-card p-8 shadow-2xl shadow-black/40">
          <h1 className="font-heading mb-1 text-xl font-bold text-ink">
            {title}
          </h1>
          {subtitle && <p className="mb-6 text-sm text-ink-dim">{subtitle}</p>}
          {children}
        </div>
        {footer && (
          <p className="mt-5 text-center text-sm text-ink-dim">{footer}</p>
        )}
      </div>
    </div>
  );
}

export function AuthCardLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="font-medium text-sky-400 transition-colors hover:text-sky-300"
    >
      {children}
    </Link>
  );
}

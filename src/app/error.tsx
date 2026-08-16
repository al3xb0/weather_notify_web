'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-aurora px-6 text-center">
      {/* Radar rings echo the landing hero so a failure still feels on-brand. */}
      <div className="relative mb-10 inline-flex items-center justify-center animate-fade-up">
        <span className="absolute h-24 w-24 rounded-full border border-amber-400/25 animate-radar" />
        <span className="absolute h-24 w-24 rounded-full border border-amber-400/20 animate-radar-2" />
        <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl border border-rim-bright bg-elevated/80 shadow-lg">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            className="h-12 w-12"
            aria-hidden="true"
          >
            <path
              d="M9 32a8 8 0 0 1 5.7-13.6A10 10 0 1 1 36 30a6 6 0 0 1 0 6H9a6 6 0 0 1 0-4Z"
              fill="rgba(251,191,36,0.12)"
              stroke="#fbbf24"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M24 20v7M24 31v.5"
              stroke="#fbbf24"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      <h1 className="mt-2 font-heading text-2xl font-semibold text-ink animate-fade-up delay-150 sm:text-3xl">
        A storm rolled through
      </h1>

      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-dim sm:text-base animate-fade-up delay-225">
        Something went wrong while loading this page. You can try again or head
        back home.
      </p>

      <div className="mt-9 flex items-center gap-3 animate-fade-up delay-225">
        <button
          onClick={reset}
          className="rounded-xl bg-sky-500 px-7 py-3 text-base font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-400 hover:shadow-sky-400/30 active:scale-95"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-xl border border-rim px-7 py-3 text-base font-semibold text-ink-dim transition-colors hover:text-ink"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}

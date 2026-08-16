'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const REDIRECT_SECONDS = 8;

export default function NotFound() {
  const router = useRouter();
  const [secs, setSecs] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    const tick = setInterval(() => setSecs((s) => Math.max(s - 1, 0)), 1000);
    const redirect = setTimeout(
      () => router.replace('/'),
      REDIRECT_SECONDS * 1000,
    );
    return () => {
      clearInterval(tick);
      clearTimeout(redirect);
    };
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-aurora px-6 text-center">
      {/* Radar rings echo the landing hero so a dead end still feels on-brand. */}
      <div className="relative mb-10 inline-flex items-center justify-center animate-fade-up">
        <span className="absolute h-24 w-24 rounded-full border border-sky-400/25 animate-radar" />
        <span className="absolute h-24 w-24 rounded-full border border-sky-400/20 animate-radar-2" />
        <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl border border-rim-bright bg-elevated/80 shadow-lg">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            className="h-12 w-12"
            aria-hidden="true"
          >
            <path
              d="M9 32a8 8 0 0 1 5.7-13.6A10 10 0 1 1 36 30a6 6 0 0 1 0 6H9a6 6 0 0 1 0-4Z"
              fill="rgba(56,189,248,0.12)"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M19 28h10M19 33h6"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      <p className="font-heading text-7xl font-bold tracking-tight sm:text-8xl animate-fade-up delay-75">
        <span className="text-shimmer">404</span>
      </p>

      <h1 className="mt-5 font-heading text-2xl font-semibold text-ink animate-fade-up delay-150">
        Lost in the clouds
      </h1>

      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-dim sm:text-base animate-fade-up delay-225">
        We couldn&apos;t find that page. Drifting back to the home page in{' '}
        <span className="font-medium text-sky-400">{secs}s</span>.
      </p>

      <div className="mt-9 animate-fade-up delay-225">
        <Link
          href="/"
          className="rounded-xl bg-sky-500 px-7 py-3 text-base font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-400 hover:shadow-sky-400/30 active:scale-95"
        >
          Back to home now
        </Link>
      </div>
    </main>
  );
}

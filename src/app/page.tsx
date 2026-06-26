import Link from 'next/link';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="space-y-4">
        <span className="text-6xl">🌦️</span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Weather Notify
        </h1>
        <p className="mx-auto max-w-xl text-lg text-slate-600">
          Create smart triggers for any city — custom thresholds or severe-weather
          alerts — and get notified instantly via Telegram, Email or Web Push.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/register"
          className="rounded-lg bg-sky-600 px-6 py-3 font-medium text-white transition hover:bg-sky-700"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}

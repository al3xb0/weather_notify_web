import Link from 'next/link';

function WeatherIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className="h-14 w-14"
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
        d="M22 34 l-4 9 7-4 -3 9"
        stroke="#fbbf24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const FEATURES = [
  {
    icon: (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <circle cx="10" cy="10" r="3" fill="currentColor" />
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M10 2v2M10 16v2M2 10h2M16 10h2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: 'Smart Triggers',
    desc: 'Custom thresholds for temperature, wind, humidity or severe alerts across any city worldwide.',
  },
  {
    icon: (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M4 4h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M3 5l7 6 7-6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: 'Multi-Channel',
    desc: 'Instant alerts delivered via Telegram bot, Email, or browser Web Push — your choice.',
  },
  {
    icon: (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M10 3a7 7 0 1 0 0 14A7 7 0 0 0 10 3Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M10 6v4l2.5 2.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: 'Always Watching',
    desc: '24/7 monitoring with configurable cooldowns so you only get notified when it matters.',
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col bg-aurora">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        {/* Animated radar icon */}
        <div className="relative mb-10 inline-flex items-center justify-center animate-fade-up">
          <span className="absolute h-24 w-24 rounded-full border border-sky-400/25 animate-radar" />
          <span className="absolute h-24 w-24 rounded-full border border-sky-400/20 animate-radar-2" />
          <span className="absolute h-24 w-24 rounded-full border border-sky-400/15 animate-radar-3" />
          <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl border border-rim-bright bg-elevated/80 shadow-lg">
            <WeatherIcon />
          </div>
        </div>

        <h1 className="font-heading text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl animate-fade-up delay-75">
          <span className="text-shimmer">Weather Notify</span>
        </h1>

        <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-ink-dim sm:text-lg animate-fade-up delay-150">
          Create smart triggers for any city&nbsp;— custom thresholds or
          severe-weather alerts&nbsp;— and get notified instantly via Telegram,
          Email, or Web&nbsp;Push.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 animate-fade-up delay-225">
          <Link
            href="/register"
            className="rounded-xl bg-sky-500 px-7 py-3 text-base font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-400 hover:shadow-sky-400/30 active:scale-95"
          >
            Get started free
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-rim-bright bg-elevated/60 px-7 py-3 text-base font-medium text-ink-dim backdrop-blur-sm transition-all hover:border-sky-500/40 hover:text-ink active:scale-95"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-t border-rim px-6 py-16">
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`rounded-2xl border border-rim bg-card p-6 animate-fade-up`}
              style={{ animationDelay: `${300 + i * 75}ms` }}
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                {f.icon}
              </div>
              <h3 className="mb-1.5 font-heading text-base font-semibold text-ink">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-ink-dim">{f.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-ink-dim/60">
          Weather Notify &mdash; built for developers, designed for reliability
        </p>
      </section>
    </main>
  );
}

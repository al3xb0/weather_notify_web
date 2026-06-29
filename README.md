# Weather Notify — Web UI

Next.js frontend for the **Weather Notify** event-driven alerting system. Users sign in,
create weather triggers for any city, and manage delivery over Telegram, Email and Web Push.

> Backend (NestJS microservices) lives in a separate repository: `weather_notify`.

## Features

- **JWT auth** with silent access-token refresh (Zustand + a single-flight axios interceptor)
- **Triggers dashboard** — create/edit/delete with **Open-Meteo** city autocomplete
- **Condition builder** — metric / operator / threshold, AND/OR logic, or a severe-weather preset
- **Notifications history** with per-channel delivery status
- **Settings** — link Telegram (deep link) and enable **Web Push** (service worker)
- **Admin panel** (role-gated) — users, stats and trigger management
- Responsive, dark UI with email-verification banner and optimistic mutations

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Zustand ·
TanStack Query · react-hook-form + zod · axios · Vitest + Testing Library.

## Security

- The **refresh token** is never visible to JS — it lives in an `httpOnly` cookie set by the
  API. Only the short-lived **access token** is held client-side.
- **Security headers** (CSP, `X-Frame-Options`, `Referrer-Policy`, HSTS, `nosniff`,
  `Permissions-Policy`) are sent for every route via `next.config.ts`.
- All requests go through a hardened axios instance (`withCredentials`, timeout, refresh retry).

## Getting started

```bash
cp .env.example .env.local     # set NEXT_PUBLIC_API_URL (+ VAPID public key)
npm install
npm run dev                    # http://localhost:3001
```

The backend API must be running (default `http://localhost:3000`). See the backend repo
for `docker compose up`.

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Core API base URL (also added to the CSP `connect-src`) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | VAPID public key for Web Push (must match the backend) |

> `NEXT_PUBLIC_*` vars are inlined at **build time** — set them before `next build`
> (in Vercel project settings, or as Docker build args for self-hosting).

## Testing

```bash
npm test          # Vitest unit/component tests (auth form, trigger form, api client)
```

## Deployment

Deploy to **Vercel**: import the repo, set `NEXT_PUBLIC_API_URL` and
`NEXT_PUBLIC_VAPID_PUBLIC_KEY` in project settings, and ship. A `Dockerfile`
(Next.js standalone output) is included for self-hosting alongside the backend.

---

Created by [Aliaksei Konyshau](https://aliaksei-konyshau.vercel.app/).

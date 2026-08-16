# Weather Notify — Web UI

Next.js frontend for the **Weather Notify** event-driven alerting system. Users sign in,
create weather triggers for any city, and manage delivery over Telegram, Email and Web Push.

> Backend (NestJS microservices) lives in a separate repository: `weather_notify`.

## Features

- **JWT auth** with in-memory access token and silent refresh (Zustand + a single-flight axios interceptor)
- **Triggers dashboard** — create/edit/delete with **Open-Meteo** city autocomplete
- **Condition builder** — metric / operator / threshold, AND/OR logic, or a severe-weather preset
- **Notifications history** with per-channel delivery status
- **Settings** — link Telegram (deep link) and enable **Web Push** (service worker)
- **Admin panel** (role-gated) — users, stats and trigger management
- Responsive, dark UI with email-verification banner and optimistic mutations

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Zustand ·
TanStack Query · react-hook-form + zod · axios · Vitest + Testing Library.

## Rendering model

This is a **client-rendered SPA that happens to be built with Next**, and that is a
decision rather than an accident. Every screen behind the sign-in is per-user, live
and non-cacheable, and the API is a separate origin whose session cookie is scoped
to `/auth` — so a server component could not read it and a middleware guard could
not see it. Server rendering would buy nothing here that it does not first have to
be given.

What Next is still used for: the public pages (landing, sign-in, sign-up) render
on the server with their own metadata, the signed-in area is marked `noindex`, and
`next.config.ts` sends the security headers. Moving to a real RSC data flow means
first putting the API and the UI on one origin and widening the cookie's path —
until then, the honest shape is the one implemented here.

## Security

- The **refresh token** is never visible to JS — it lives in an `httpOnly` cookie set by the
  API. The **access token** is held in memory only: never in `localStorage`, so it cannot be
  read by injected script, and the session is restored from the cookie on load.
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

| Variable                       | Description                                             |
| ------------------------------ | ------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`          | Core API base URL (also added to the CSP `connect-src`) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | VAPID public key for Web Push (must match the backend)  |

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

Created by [Aliaksei Konyshau](https://www.al-gres.com/).

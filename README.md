# Weather Notify — Web UI

Next.js frontend for the **Weather Notify** event-driven alerting system. Users sign in,
create weather triggers for any city, and manage delivery over Telegram, Email and Web Push.

> Backend (NestJS microservices) lives in a separate repository: `weather_notify`.

## Features

- JWT auth with automatic access-token refresh (Zustand + axios interceptor)
- Triggers dashboard: create/edit/delete with **Open-Meteo** city autocomplete
- Condition builder (metric / operator / threshold, or severe-weather preset)
- Notifications history with delivery status
- Settings: link Telegram (deep link) and enable Web Push (service worker)

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Zustand ·
TanStack Query · react-hook-form + zod · axios.

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
| `NEXT_PUBLIC_API_URL` | Core API base URL |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | VAPID public key for Web Push (matches the backend) |

## Deployment

Deploy to **Vercel** (set the env vars in the project settings). A `Dockerfile`
(Next.js standalone output) is included for self-hosting alongside the backend.
